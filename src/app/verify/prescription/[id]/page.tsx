'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore } from '@/hooks/use-firebase';
import { useUser } from '@/hooks/use-user';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import {
  BadgeCheck,
  ShieldCheck,
  AlertCircle,
  Clock,
  Stethoscope,
  User,
  Calendar,
  FileText,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Medication {
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionData {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  medications: Medication[];
  createdAt: Timestamp;
  expiresAt: Timestamp;
  patientDetails?: {
    age?: string;
    gender?: string;
  };
}

interface DoctorData {
  qualification?: string;
  specialization?: string;
  verificationLevel?: number;
}

export default function PrescriptionVerificationPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user, loading } = useUser();

  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(true);

  useEffect(() => {
    if (loading) return;

    // 🔒 Auth guard
    if (!user) {
      router.replace('/patient/login');
      return;
    }

    if (!db || !id) return;

    const loadPrescription = async () => {
      try {
        const presRef = doc(db, 'prescriptions', id as string);
        const presSnap = await getDoc(presRef);

        if (!presSnap.exists()) {
          setError('Prescription not found or expired.');
          return;
        }

        const data = presSnap.data() as PrescriptionData;

        // 🔐 Ownership check (extra safety)
        if (data.patientId !== user.uid) {
          setError('You are not authorized to view this prescription.');
          return;
        }

        // ⏰ Expiry check
        const isExpired = data.expiresAt.toDate() < new Date();
        if (isExpired) {
          setError('This prescription has expired.');
          return;
        }

        setPrescription(data);

        // Fetch doctor verification
        const docRef = doc(db, 'doctors', data.doctorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDoctor(docSnap.data() as DoctorData);
        }
      } catch (err) {
        console.error('Prescription verification error:', err);
        setError('Unable to verify prescription.');
      } finally {
        setLoadingLocal(false);
      }
    };

    loadPrescription();
  }, [user, loading, db, id, router]);

  if (loading || loadingLocal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-48 w-full max-w-md" />
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
          <p className="text-sm text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow border">

        {/* Header */}
        <div className="bg-green-600 text-white p-6 text-center rounded-t-xl">
          <ShieldCheck className="h-10 w-10 mx-auto mb-2" />
          <h1 className="text-xl font-bold">Authentic Digital Prescription</h1>
        </div>

        <div className="p-6 space-y-6">

          {/* Doctor */}
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-bold">Dr. {prescription.doctorName}</h2>
              <p className="text-sm text-gray-500">
                {doctor?.qualification || 'Registered Medical Practitioner'}
              </p>
              {doctor?.verificationLevel && doctor.verificationLevel >= 3 && (
                <BadgeCheck className="h-4 w-4 text-blue-500 mt-1" />
              )}
            </div>
          </div>

          {/* Patient */}
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-blue-500" />
            <div className="text-sm">
              <p>Age: {prescription.patientDetails?.age || 'N/A'}</p>
              <p>Gender: {prescription.patientDetails?.gender || 'N/A'}</p>
            </div>
          </div>

          {/* Medications */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" /> Medicines
            </h3>
            <div className="space-y-2">
              {prescription.medications.map((m, i) => (
                <div key={i} className="border rounded p-3">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-gray-600">
                    {m.strength} | {m.dosage} | {m.frequency} | {m.duration}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between text-xs text-gray-500 border-t pt-4">
            <span>
              <Calendar className="inline h-3 w-3 mr-1" />
              {prescription.createdAt.toDate().toLocaleDateString()}
            </span>
            <span>
              <Clock className="inline h-3 w-3 mr-1" />
              Expires in 24 hrs
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
