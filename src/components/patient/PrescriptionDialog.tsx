'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

interface PrescriptionDialogProps {
  prescription: any | null; // using any for simplicity, as per project standards or inferred types
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrescriptionDialog({
  prescription,
  isOpen,
  onOpenChange,
}: PrescriptionDialogProps) {
  const { language } = useChatLanguage();
  const t = translations[language].map.prescription;
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [stampUrl, setStampUrl] = useState<string | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    if (!isOpen || !prescription?.doctorId) return;

    let isMounted = true;
    setLoadingDocs(true);

    const fetchDoctorDocs = async () => {
      try {
        const doctorDoc = await getDoc(doc(db, 'doctors', prescription.doctorId));
        if (doctorDoc.exists() && isMounted) {
          const data = doctorDoc.data();
          setSignatureUrl(data.signatureUrl ?? null);
          setStampUrl(data.stampUrl ?? null);
          setDoctorProfile(data);
        }
      } catch (err) {
        console.error("Error fetching doctor docs", err);
      } finally {
        if (isMounted) setLoadingDocs(false);
      }
    };

    fetchDoctorDocs();

    return () => {
      isMounted = false;
    };
  }, [isOpen, prescription]);

  const handleDownloadPdf = async () => {
    if (!prescriptionRef.current || !prescription) return;

    try {
      const images = prescriptionRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img =>
          img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })
        )
      );

      const canvas = await html2canvas(prescriptionRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`prescription-${prescription.appointmentId || 'download'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  if (!prescription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-xl">{t.title}</DialogTitle>
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> {t.download}
          </Button>
        </DialogHeader>

        <div ref={prescriptionRef} className="p-6 bg-white shrink-0">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {t.ePrescription}
            </h2>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{(language === 'en' ? 'Dr. ' : 'डॉ. ') + prescription.doctorName}</p>
                {doctorProfile && (
                  <div className="text-sm text-slate-600 space-y-0.5 mb-2">
                    <p className="font-semibold text-blue-700">{doctorProfile.specialization || t.consultingPhysician}</p>
                    <p>{doctorProfile.hospitalName || 'Sehat Sathi Clinic'}</p>
                    <p>{doctorProfile.hospitalAddress || `${doctorProfile.village || ''} ${doctorProfile.district || ''} ${doctorProfile.state || ''}`.trim() || t.digitalConsultation}</p>
                    <p>Contact: {doctorProfile.contact || t.notAvailable}</p>
                  </div>
                )}
                <p className="text-slate-600 text-sm">
                  {new Date(prescription.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{prescription.patientName}</p>
                <p className="text-slate-600 text-sm">
                  {prescription.patientAge}{t.yearsShort} · {prescription.patientGender}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3 border-b pb-2">Medications</h3>
            {prescription.medications && prescription.medications.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="py-2 pl-2">{t.medTableHeader.name}</th>
                    <th className="py-2">{t.medTableHeader.strength}</th>
                    <th className="py-2">{t.medTableHeader.dose}</th>
                    <th className="py-2">{t.medTableHeader.freq}</th>
                    <th className="py-2">{t.medTableHeader.duration}</th>
                    <th className="py-2">{t.medTableHeader.instructions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {prescription.medications.map((med: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2 pl-2 font-medium">{med.name}</td>
                      <td className="py-2">{med.strength || '-'}</td>
                      <td className="py-2">{med.dosage || '-'}</td>
                      <td className="py-2">{med.frequency || '-'}</td>
                      <td className="py-2">{med.duration || '-'}</td>
                      <td className="py-2 text-xs">{med.instructions || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-500 italic text-sm">{t.noMedications}</p>
            )}
          </div>

          {prescription.generalNotes && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-2 border-b pb-2">{t.notes}</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-700 p-3 bg-slate-50 rounded">
                {prescription.generalNotes}
              </p>
            </div>
          )}

          <div className="mt-12 border-t pt-8">
            <div className="flex justify-between items-end">
              <div className="w-40 flex flex-col items-center">
                {loadingDocs ? (
                  <Skeleton className="w-[120px] h-[120px] rounded-full" />
                ) : stampUrl ? (
                  <img
                    src={stampUrl}
                    alt="Doctor Stamp"
                    style={{ width: '120px', height: 'auto', objectFit: 'contain' }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="h-[120px] flex items-center justify-center text-slate-400 italic text-sm">
                    {t.stampNotAvailable}
                  </div>
                )}
              </div>
              
              <div className="w-48 flex flex-col items-center">
                {loadingDocs ? (
                  <Skeleton className="w-[160px] h-[60px]" />
                ) : signatureUrl ? (
                  <img
                    src={signatureUrl}
                    alt="Doctor Signature"
                    style={{ width: '160px', height: 'auto', objectFit: 'contain' }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="h-[60px] flex items-center justify-center text-slate-400 italic text-sm">
                    {t.signatureNotAvailable}
                  </div>
                )}
                <div className="w-full border-t border-slate-800 mt-2 pt-1 text-center">
                  <p className="font-bold text-sm text-slate-800">{(language === 'en' ? 'Dr. ' : 'डॉ. ') + prescription.doctorName}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-xs text-slate-500 pt-4">
            {t.footerNote}
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t px-6">
           <Button variant="outline" onClick={() => onOpenChange(false)}>{t.close}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
