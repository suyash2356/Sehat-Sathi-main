'use client';

import { useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { useFirestore, useAuth } from '@/hooks/use-firebase';
import { useUser } from '@/hooks/use-user';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Video, Calendar, FileText, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface PatientData {
  uid: string;
  email: string;
  fullName: string;
}

interface DoctorData {
  uid: string;
  fullName: string;
  specialization: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  status: string;
  mode: string;
  scheduledTime: any;
}

interface Prescription {
  id: string;
  doctorName: string;
  createdAt: string;
  medications: any[];
}

export default function PatientDashboardPage() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  /* ---------------- LOCAL STATE ---------------- */
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [activeCallSession, setActiveCallSession] = useState<string | null>(null);

  /* ---------------- DATA EFFECT ---------------- */
  useEffect(() => {
    // Safety check inside effect
    if (!db || loading || !user) return;

    let unsubApp = () => { };
    let unsubRx = () => { };
    let unsubSession = () => { };

    const init = async () => {
      // Role enforcement
      const patientRef = doc(db, 'patients', user.uid);
      const patientSnap = await getDoc(patientRef);

      if (!patientSnap.exists()) {
        router.push('/');
        return;
      }

      setPatientData(patientSnap.data() as PatientData);

      // Doctors list
      const doctorsQuery = query(
        collection(db, 'doctors'),
        where('isProfileComplete', '==', true)
      );

      const doctorSnap = await getDocs(doctorsQuery);
      setDoctors(
        doctorSnap.docs.map(d => ({
          uid: d.id,
          ...d.data()
        })) as DoctorData[]
      );

      // Appointments listener
      unsubApp = onSnapshot(
        query(collection(db, 'appointments'), where('patientId', '==', user.uid)),
        snap => {
          setAppointments(
            snap.docs.map(d => ({ id: d.id, ...d.data() })) as Appointment[]
          );
        }
      );

      // Prescriptions listener
      unsubRx = onSnapshot(
        query(collection(db, 'prescriptions'), where('patientId', '==', user.uid)),
        snap => {
          setPrescriptions(
            snap.docs.map(d => ({ id: d.id, ...d.data() })) as Prescription[]
          );
        }
      );

      // Call session listener
      unsubSession = onSnapshot(
        query(collection(db, 'callSessions'), where('patientId', '==', user.uid)),
        snap => {
          const session = snap.docs[0];
          setActiveCallSession(session ? session.id : null);
        }
      );
    };

    init();

    return () => {
      unsubApp();
      unsubRx();
      unsubSession();
    };
  }, [db, user, loading, router]);

  /* ---------------- ACTIONS ---------------- */
  const handleLogout = async () => {
    await auth?.signOut();
    router.push('/patient/login');
  };

  /* ---------------- AUTH GUARD (RENDER PHASE) ---------------- */
  if (loading) return null;
  if (!user) {
    redirect('/patient/login');
  }

  /* ---------------- UI ---------------- */
  if (!patientData) return <div className="p-10 text-center">Loading patient data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex justify-between items-center bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold">
            Welcome, {patientData.fullName}
          </h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {activeCallSession && (
          <div className="bg-red-500 text-white p-6 rounded flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Video />
              <span className="font-bold">Doctor started the call</span>
            </div>
            <Button
              className="bg-white text-red-600"
              onClick={() => router.push(`/video-call?sessionId=${activeCallSession}`)}
            >
              JOIN CALL
            </Button>
          </div>
        )}

        {/* Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar /> Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments.</p>
            ) : (
              appointments.map(app => (
                <div key={app.id} className="border p-3 rounded mb-2">
                  <b>Dr. {app.doctorName}</b> — {app.status}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Button asChild>
          <Link href="/patient/messages">Open Messages / Requests</Link>
        </Button>

        {/* Doctors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase /> Find Doctor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {doctors.map(doc => (
              <div key={doc.uid} className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{doc.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <b>{doc.fullName}</b>
                    <p className="text-xs">{doc.specialization}</p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/patient/book/${doc.uid}`}>Book</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText /> My Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <p className="text-gray-500">No prescriptions yet.</p>
            ) : (
              prescriptions.map(rx => (
                <div key={rx.id} className="border p-3 rounded mb-2">
                  <b>Dr. {rx.doctorName}</b>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
