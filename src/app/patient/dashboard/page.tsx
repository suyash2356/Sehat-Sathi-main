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
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Calendar, FileText, Briefcase, Clock, Video } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
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
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Time ticker for countdowns
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = (scheduledTime: any) => {
    if (!scheduledTime) return null;
    const time = scheduledTime.toDate ? scheduledTime.toDate() : new Date(scheduledTime);
    const diff = time.getTime() - now.getTime();
    if (diff < 0) return 'Overdue / Happening Now';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);

    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h ${mins}m`;
    return `Starts in ${mins}m`;
  };
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Reschedule State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedRescheduleApp, setSelectedRescheduleApp] = useState<Appointment | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleTime, setNewRescheduleTime] = useState('');

  /* ---------------- DATA EFFECT ---------------- */
  useEffect(() => {
    // Safety check inside effect
    if (!db || loading || !user) return;

    let unsubApp = () => { };
    let unsubRx = () => { };

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

    };

    init();

    return () => {
      unsubApp();
      unsubRx();
    };
  }, [db, user, loading, router]);

  /* ---------------- ACTIONS ---------------- */
  const handleLogout = async () => {
    await auth?.signOut();
    router.push('/patient/login');
  };

  const handleCancelAppointment = async (id: string) => {
    if (!db) return;
    try {
      if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
    } catch (e) {
      console.error(e);
      alert('Failed to cancel appointment');
    }
  };

  const handleRescheduleClick = (app: Appointment) => {
    setSelectedRescheduleApp(app);
    setNewRescheduleDate('');
    setNewRescheduleTime('');
    setIsRescheduleModalOpen(true);
  };

  const handleSaveReschedule = async () => {
    if (!db || !selectedRescheduleApp || !newRescheduleDate || !newRescheduleTime) return;
    try {
      const dateTimeString = `${newRescheduleDate}T${newRescheduleTime}`;
      const newTimestamp = new Date(dateTimeString);
      await updateDoc(doc(db, 'appointments', selectedRescheduleApp.id), {
        scheduledTime: newTimestamp,
        timing: 'scheduled'
      });
      alert('Appointment Rescheduled successfully!');
      setIsRescheduleModalOpen(false);
    } catch (e: any) {
      console.error(e);
      alert('Error: ' + e.message);
    }
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
              appointments.map(app => {
                const isUpcoming = app.status === 'pending' || app.status === 'accepted';
                return (
                <div key={app.id} className="border p-4 rounded mb-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm gap-4 transition-all hover:shadow-md">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                       <b className="text-lg">Dr. {app.doctorName}</b>
                       <span className={`text-xs px-2 py-1 rounded font-medium ${app.status === 'accepted' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                         {app.status === 'rejected' ? 'DECLINED' : app.status.toUpperCase()}
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mt-3 bg-gray-50/50 p-3 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>
                          {app.scheduledTime ? 
                            (app.scheduledTime.toDate ? app.scheduledTime.toDate() : new Date(app.scheduledTime)).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) 
                            : 'Immediate (Call Now)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                         {app.mode === 'visit' ? <FileText className="h-4 w-4 text-purple-500" /> : <Video className="h-4 w-4 text-red-500" />}
                         <span className="capitalize">{app.mode || 'video'} Consultation</span>
                      </div>
                      {isUpcoming && app.scheduledTime && (
                         <div className="flex items-center gap-2 md:col-span-2 text-primary font-medium">
                           <Clock className="h-4 w-4" />
                           <span>{getCountdown(app.scheduledTime)}</span>
                         </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[120px] w-full md:w-auto mt-2 md:mt-0">
                    {isUpcoming && (
                      <>
                        <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleRescheduleClick(app)}>
                          Reschedule
                        </Button>
                        <Button variant="destructive" size="sm" className="w-full" onClick={() => handleCancelAppointment(app.id)}>
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )})
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

      {/* Reschedule Modal */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Select a new date and time for this appointment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">New Date</label>
              <Input type="date" value={newRescheduleDate} onChange={e => setNewRescheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">New Time</label>
              <Input type="time" value={newRescheduleTime} onChange={e => setNewRescheduleTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReschedule} disabled={!newRescheduleDate || !newRescheduleTime}>Save Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
