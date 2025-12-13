'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useFirestore } from '@/hooks/use-firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, ClockIcon, UserPlus, Video, Users, Stethoscope, Check, X } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Define types for our data
interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  scheduledTime: any; // Timestamp
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  appointmentType: string;
  issue?: string;
}

interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Doctor {
  fullName: string;
  specialization?: string;
  // Add other doctor details if available
}

export default function DoctorDashboardPage() {
  const { user, loading: isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading || !user || !db) {
      if (!isUserLoading && !user) setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch doctor details
        const doctorRef = doc(db, 'doctors', user.uid);
        const doctorSnap = await getDoc(doctorRef);
        if (doctorSnap.exists()) {
          const data = doctorSnap.data();
          // Map 'name' to 'fullName' if needed, or update Doctor interface
          setDoctor({ fullName: data.name, ...data } as Doctor);
        } else {
          console.warn("Doctor profile not found.");
        }

        // Fetch appointments (pending and accepted)
        const q = query(
          collection(db, 'appointments'),
          where('doctorId', '==', user.uid),
          where('status', 'in', ['pending', 'accepted'])
        );

        const querySnapshot = await getDocs(q);
        const apps = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Appointment[];

        // Sort by time (rough sort, assuming timestamp objects or strings that sort chronologically)
        setAppointments(apps);

        // Fetch doctor's schedule
        const scheduleQuery = query(
          collection(db, 'doctors', user.uid, 'schedule')
        );
        const scheduleSnapshot = await getDocs(scheduleQuery);
        const scheduleData = scheduleSnapshot.docs.map(doc => ({
          ...doc.data(),
        })) as Schedule[];
        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        scheduleData.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));
        setSchedule(scheduleData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, db, isUserLoading]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: 'accepted' | 'rejected') => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus
      });

      setAppointments(prev => {
        if (newStatus === 'rejected') {
          return prev.filter(a => a.id !== appointmentId);
        }
        return prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a);
      });

      toast({ title: newStatus === 'accepted' ? "Appointment Accepted" : "Appointment Rejected" });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Error", description: "Failed to update appointment.", variant: "destructive" });
    }
  };

  // Get today's schedule
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = schedule.find(s => s.day === today && s.isAvailable);
  const completedCount = 0; // Logic to fetch completed count if needed

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const upcomingAppointments = appointments.filter(a => a.status === 'accepted');

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <Stethoscope className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold">Doctor Profile Not Found</h1>
        <Button asChild className="mt-6"><Link href="/doctor/profile">Complete Profile</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome, Dr. {doctor.fullName}</h1>
          <p className="text-md text-gray-500 dark:text-gray-400">Manage your appointments and schedule.</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Users className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppointments.length}</div>
              <p className="text-xs text-gray-500">Awaiting your approval.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <CalendarIcon className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-gray-500">Scheduled consultations.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Availability</CardTitle>
              <ClockIcon className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySchedule ? "Available" : "Off"}</div>
              <p className="text-xs text-gray-500">{todaySchedule ? `${todaySchedule.startTime} - ${todaySchedule.endTime}` : "No slots today"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Appointments */}
            {pendingAppointments.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                <CardHeader>
                  <CardTitle className="text-yellow-800 dark:text-yellow-200">Appointment Requests</CardTitle>
                  <CardDescription>Patients waiting for confirmation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {pendingAppointments.map((app) => (
                      <li key={app.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-lg">{app.patientName}</p>
                          <p className="text-sm text-gray-500">Issue: {app.issue}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Type: {app.appointmentType.replace('_', ' ')}
                            {/* Format date if timestamp exists */}
                          </p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button size="sm" onClick={() => handleUpdateStatus(app.id, 'accepted')} className="bg-green-600 hover:bg-green-700 w-1/2 md:w-auto">
                            <Check className="mr-2 h-4 w-4" /> Accept
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(app.id, 'rejected')} className="w-1/2 md:w-auto">
                            <X className="mr-2 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Confirmed consultations.</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <ul className="space-y-4">
                    {upcomingAppointments.map((app) => (
                      <li key={app.id} className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm hover:border-primary">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{app.patientName?.charAt(0) || 'P'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{app.patientName}</p>
                            <p className="text-sm text-gray-500">{app.issue}</p>
                          </div>
                        </div>
                        <Button size="sm" asChild className="mt-4 md:mt-0">
                          <Link href={`/video-call?callId=${app.id}`}><Video className="mr-2 h-4 w-4" /> Join Call</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500">No upcoming appointments.</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
              <CardContent>
                {todaySchedule ? (
                  <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
                    <p className="font-bold text-green-800 dark:text-green-200">Available Today</p>
                    <p className="text-green-700 dark:text-green-300">{todaySchedule.startTime} - {todaySchedule.endTime}</p>
                  </div>
                ) : <p className="text-center text-gray-500">Not available today.</p>}
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/doctor/schedule">Manage Schedule</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
