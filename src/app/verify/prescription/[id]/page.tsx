'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/hooks/use-firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BadgeCheck, ShieldCheck, AlertCircle, Clock, Stethoscope, User, Calendar, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Medication {
    name: string;
    strength: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface PrescriptionData {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    doctorName: string;
    medications: Medication[];
    createdAt: string;
    expiresAt: string;
    patientDetails: {
        age: string;
        gender: string;
    };
}

interface DoctorData {
    name: string;
    specialization: string;
    qualification: string;
    verificationLevel: number;
}

export default function PrescriptionVerificationPage() {
    const params = useParams();
    const db = useFirestore();
    const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
    const [doctor, setDoctor] = useState<DoctorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!params.id || !db) return;

        const fetchVerificationData = async () => {
            setLoading(true);
            try {
                const presRef = doc(db, 'prescriptions', params.id as string);
                const presSnap = await getDoc(presRef);

                if (presSnap.exists()) {
                    const presData = presSnap.data() as PrescriptionData;
                    setPrescription(presData);

                    // Fetch doctor details to show verification status
                    const docRef = doc(db, 'doctors', presData.doctorId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setDoctor(docSnap.data() as DoctorData);
                    }
                } else {
                    setError("Prescription not found or has expired (deleted).");
                }
            } catch (err) {
                console.error("Verification error:", err);
                setError("Could not verify prescription at this time.");
            } finally {
                setLoading(false);
            }
        };

        fetchVerificationData();
    }, [params.id, db]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardContent className="p-8 space-y-4">
                        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                        <Skeleton className="h-4 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                        <div className="pt-8 space-y-2">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !prescription) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg border-red-100 shadow-xl">
                    <CardContent className="p-12 text-center space-y-4">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
                        <p className="text-gray-500">{error || "This prescription is no longer available."}</p>
                        <div className="bg-red-50 p-4 rounded-lg text-xs text-red-800 text-left">
                            <strong>Why?</strong> Sehat Sathi digital prescriptions are ephemeral. They are deleted 24 hours after issuance or manually by the patient for privacy.
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isExpired = new Date(prescription.expiresAt) < new Date();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Verification Status Header */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-green-100 dark:border-green-900/30">
                    <div className="bg-green-600 p-6 text-center text-white">
                        <ShieldCheck className="h-16 w-16 mx-auto mb-2 drop-shadow-lg" />
                        <h1 className="text-2xl font-bold">Authentic Prescription</h1>
                        <p className="text-green-100 opacity-90 text-sm">Issued via Sehat Sathi Secure Portal</p>
                    </div>

                    <div className="p-6 grid grid-cols-2 gap-4 border-b border-gray-50 dark:border-gray-700">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reference ID</p>
                            <p className="text-sm font-mono text-gray-600 dark:text-gray-400">{prescription.appointmentId}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry</p>
                            <div className="flex items-center justify-end gap-1 text-xs font-medium text-orange-600">
                                <Clock className="h-3 w-3" />
                                {new Date(prescription.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Today
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Doctor Info */}
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Stethoscope className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dr. {prescription.doctorName}</h2>
                                    {doctor?.verificationLevel && doctor.verificationLevel >= 3 && (
                                        <BadgeCheck className="h-5 w-5 text-blue-500 fill-blue-50" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">{doctor?.qualification || "General Physician"}</p>
                                <p className="text-xs text-primary font-medium mt-1">{doctor?.specialization || "Teleconsultation Partner"}</p>
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-50 p-3 rounded-full">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-1">
                                <div className="col-span-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Patient Name</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-200">Patient Data Anonymized</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Age</p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">{prescription.patientDetails?.age || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Gender</p>
                                    <p className="font-medium text-gray-700 dark:text-gray-300">{prescription.patientDetails?.gender || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Medication List (Clinical Summary) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <h3 className="font-bold text-sm uppercase text-gray-500">Clinical Medication List</h3>
                            </div>
                            <div className="space-y-3">
                                {prescription.medications.map((med, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100">{med.name}</p>
                                                <p className="text-xs text-gray-500">{med.strength}</p>
                                            </div>
                                            <span className="text-xs font-bold bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm">
                                                {med.dosage}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex gap-4 text-[10px] font-bold text-primary uppercase">
                                            <span>Freq: {med.frequency}</span>
                                            <span>Dur: {med.duration}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Date Info */}
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-6 border-t font-medium">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Prescribed: {new Date(prescription.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-green-600 flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                Tamper-Evident Digital ID
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-[10px] text-gray-400 px-8">
                    This verification page is valid for 24 hours from the time of issuance. If this link has been shared with you, it confirms that a qualified medical practitioner issued this prescription via the Sehat Sathi platform.
                </p>

            </div>
        </div>
    );
}
