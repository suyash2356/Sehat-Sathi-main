import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prescriptionId = searchParams.get('prescriptionId');

  if (!prescriptionId) {
    return NextResponse.json({ error: 'Missing prescriptionId' }, { status: 400 });
  }

  try {
    /* ------------------------------------
       1. AUTHENTICATION
    ------------------------------------ */
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.replace('Bearer ', '');
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    /* ------------------------------------
       2. FETCH PRESCRIPTION
    ------------------------------------ */
    const presRef = adminDb.collection('prescriptions').doc(prescriptionId);
    const presSnap = await presRef.get();

    if (!presSnap.exists) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    const presData = presSnap.data()!;

    /* ------------------------------------
       3. AUTHORIZATION
    ------------------------------------ */
    const isOwner =
      userId === presData.patientId ||
      userId === presData.doctorId ||
      decodedToken.isAdmin === true;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    /* ------------------------------------
       4. EXPIRY CHECK (Timestamp-safe)
    ------------------------------------ */
    const expiresAt =
      presData.expiresAt instanceof Timestamp
        ? presData.expiresAt.toDate()
        : new Date(presData.expiresAt);

    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Prescription expired' }, { status: 410 });
    }

    const createdAt =
      presData.createdAt instanceof Timestamp
        ? presData.createdAt.toDate()
        : new Date(presData.createdAt);

    /* ------------------------------------
       5. FETCH DOCTOR DETAILS
    ------------------------------------ */
    const doctorDoc = await adminDb.collection('doctors').doc(presData.doctorId).get();
    const doctorInfo = doctorDoc.exists ? doctorDoc.data()! : {};

    /* ------------------------------------
       6. PDF GENERATION
    ------------------------------------ */
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header
    pdf.setFillColor(79, 70, 229);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SEHAT SATHI', 20, 25);
    pdf.setFontSize(10);
    pdf.text('Digital Health Platform', 20, 32);

    // Watermark
    pdf.setGState(new (pdf as any).GState({ opacity: 0.05 }));
    pdf.setFontSize(60);
    pdf.text('SEHAT SATHI', pageWidth / 2, 150, { align: 'center', angle: 45 });
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

    // Doctor Info
    pdf.setTextColor(0);
    pdf.setFontSize(14);
    pdf.text(`Dr. ${presData.doctorName || doctorInfo.fullName}`, 20, 55);
    pdf.setFontSize(10);
    pdf.text(doctorInfo.qualification || 'Medical Practitioner', 20, 62);
    pdf.text(
      presData.doctorSpecialization || doctorInfo.specialization || 'General Physician',
      20,
      67
    );

    // Patient Info
    pdf.setFillColor(243, 244, 246);
    pdf.rect(pageWidth - 90, 45, 75, 30, 'F');
    pdf.setTextColor(0);
    pdf.setFontSize(9);
    pdf.text(`Name: ${presData.patientName || 'Patient'}`, pageWidth - 85, 58);
    pdf.text(
      `Age/Gender: ${presData.patientDetails?.age || 'N/A'} / ${
        presData.patientDetails?.gender || 'N/A'
      }`,
      pageWidth - 85,
      64
    );
    pdf.text(`Date: ${createdAt.toLocaleDateString()}`, pageWidth - 85, 70);

    // Rx
    pdf.setFontSize(28);
    pdf.setTextColor(79, 70, 229);
    pdf.text('Rx', 20, 105);

    // Medicines
    pdf.setFontSize(10);
    let y = 120;
    (presData.medications || []).forEach((med: any) => {
      pdf.setTextColor(0);
      pdf.text(`${med.name} (${med.strength})`, 25, y);
      pdf.text(med.dosage || '-', 120, y);
      y += 8;
    });

    // QR Code
    const verifyUrl = `https://sehatsathi.com/verify/prescription/${prescriptionId}`;
    const qr = await QRCode.toDataURL(verifyUrl);
    pdf.addImage(qr, 'PNG', pageWidth / 2 - 15, 250, 30, 30);

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    pdf.text(`Prescription ID: ${prescriptionId}`, pageWidth / 2, 290, {
      align: 'center',
    });

    const buffer = pdf.output('arraybuffer');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Prescription_${prescriptionId}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('PDF error:', err);
    return NextResponse.json(
      { error: err.message || 'PDF generation failed' },
      { status: 500 }
    );
  }
}
