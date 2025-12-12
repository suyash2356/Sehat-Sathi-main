'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useFirestore } from '@/hooks/use-firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, ClockIcon, UserPlus, Video, Users, Stethoscope, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

// Define types for our data
interface Consultation {
  id: string;
  patientName: string;
  patientId: string;
  time: string; // Keep as string for simplicity, you might want to use Date objects
  status: 'upcoming' | 'completed' | 'cancelled';
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
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading || !user || !db) {
      if (!isUserLoading) setIsLoading(false); // If user is not loading and no user, stop loading
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch doctor details
        const doctorRef = doc(db, 'doctors', user.uid);
        const doctorSnap = await getDoc(doctorRef);
        if (doctorSnap.exists()) {
          setDoctor(doctorSnap.data() as Doctor);
        } else {
          console.warn("Doctor profile not found.");
        }

        // Fetch upcoming consultations
        const consultQuery = query(
          collection(db, 'consultations'),
          where('doctorId', '==', user.uid),
          where('status', '==', 'upcoming')
        );
        const consultSnapshot = await getDocs(consultQuery);
        const consultsData = consultSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Consultation[];
        setConsultations(consultsData);

        // Fetch doctor's schedule
        const scheduleQuery = query(
          collection(db, 'doctors', user.uid, 'schedule')
        );
        const scheduleSnapshot = await getDocs(scheduleQuery);
        const scheduleData = scheduleSnapshot.docs.map(doc => ({
            ...doc.data(),
        })) as Schedule[];
        // Sort schedule by day of the week for consistency (Monday-first to match schedule page)
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
  
  // Get today's schedule
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = schedule.find(s => s.day === today && s.isAvailable);

  const patientsSeen = consultations.filter(c => c.status === 'completed').length;
  const parseTimeToHours = (timeStr: string) => {
    // Expects format "HH:MM" (24-hour). Returns fractional hours (e.g. "09:30" -> 9.5)
    const parts = String(timeStr).split(':');
    if (parts.length < 2) {
      const v = parseInt(parts[0] || '0', 10);
      return isNaN(v) ? 0 : v;
    }
    const hh = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);
    return (isNaN(hh) ? 0 : hh) + (isNaN(mm) ? 0 : mm / 60);
  };

  const scheduledHours = schedule.filter(s => s.isAvailable).reduce((total, day) => {
      const start = parseTimeToHours(day.startTime || '0:00');
      const end = parseTimeToHours(day.endTime || '0:00');
      const diff = Math.max(0, end - start);
      return total + diff;
  }, 0);

  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
         <div className="max-w-7xl mx-auto">
            <Skeleton className="h-10 w-1/3 mb-8" />
            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
            </div>
            {/* Main content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-64 rounded-lg" />
                    <Skeleton className="h-48 rounded-lg" />
                </div>
                <div className="space-y-8">
                    <Skeleton className="h-48 rounded-lg" />
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
         <Stethoscope className="h-16 w-16 text-gray-400 mb-4" />
         <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Doctor Profile Not Found</h1>
         <p className="text-gray-500 dark:text-gray-400 mt-2">We couldn't load your profile. Please complete your registration.</p>
         <Button asChild className="mt-6">
            <Link href="/doctor/profile">Complete Profile</Link>
         </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Welcome, Dr. {doctor.fullName}</h1>
            <p className="text-md text-gray-500 dark:text-gray-400">Here’s your dashboard for today, {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{consultations.length}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">You have {consultations.length} upcoming consultations.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Patients Seen</CardTitle>
                    <Users className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{patientsSeen}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Across all completed consultations.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weekly Scheduled Hours</CardTitle>
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{scheduledHours}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total available hours this week.</p>
                </CardContent>
            </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Main Column */}
            <div className="lg:col-span-2 space-y-8">
                {/* Upcoming Appointments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Appointments</CardTitle>
                        <CardDescription>Here are your scheduled video consultations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {consultations.length > 0 ? (
                            <ul className="space-y-4">
                                {consultations.map((consult) => (
                                    <li key={consult.id} className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm hover:border-primary">
                                        <div className="flex items-center space-x-4 w-full mb-3 md:mb-0">
                                            <Avatar className="h-12 w-12 border-2 border-primary/50">
                                                <AvatarFallback>{consult.patientName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{consult.patientName}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled for: {consult.time}</p>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-auto">
                                          <Button size="sm" variant="default" asChild className="w-full md:w-auto">
                                            <Link href={`/video-call?callId=${consult.id}`}><Video className="mr-2 h-4 w-4"/> Join Call</Link>
                                          </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                           <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                               <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                               <h3 className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-200">No Appointments Yet</h3>
                               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You have no upcoming appointments on your schedule.</p>
                           </div>
                        )}
                    </CardContent>
                </Card>

                {/* Today's Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                        <CardDescription>Your availability for {today}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {todaySchedule ? (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700/50 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <ClockIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    <div>
                                        <p className="font-bold text-lg text-green-800 dark:text-green-200">You are available today!</p>
                                        <p className="text-sm text-green-600 dark:text-green-400">From {todaySchedule.startTime} to {todaySchedule.endTime}</p>
                                    </div>
                                </div>
                                <Button variant="outline" asChild>
                                    <Link href="/doctor/schedule">Adjust Schedule</Link>
                                </Button>
                            </div>
                        ) : (
                           <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                               <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                               <h3 className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-200">Not Scheduled Today</h3>
                               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You are not marked as available for today.</p>
                                <Button className="mt-4" asChild>
                                    <Link href="/doctor/schedule">Set Availability</Link>
                                </Button>
                           </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
                <Card className="bg-gradient-to-br from-primary to-primary-focus text-primary-foreground">
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <UserPlus className="mr-2 h-6 w-6" /> Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col space-y-3">
                     <Button variant="secondary" asChild className="justify-start">
                        <Link href="/doctor/schedule"><CalendarIcon className="mr-2 h-4 w-4"/> Manage Schedule</Link>
                     </Button>
                     <Button variant="secondary" asChild className="justify-start">
                        <Link href="/doctor/profile"><Users className="mr-2 h-4 w-4"/> Update Profile</Link>
                     </Button>
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>All Schedules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {schedule.length > 0 ? (
                            <ul className="space-y-3">
                                {schedule.map((s, i) => (
                                    <li key={i} className={`p-3 rounded-lg flex justify-between items-center text-sm ${s.isAvailable ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800/40 opacity-60'}`}>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{s.day}</span>
                                        {s.isAvailable ? (
                                            <span className="font-mono text-blue-600 dark:text-blue-400">{s.startTime} - {s.endTime}</span>
                                        ) : (
                                            <span className="text-gray-500">Unavailable</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-center text-sm text-gray-500 py-4">Your schedule is not set.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
