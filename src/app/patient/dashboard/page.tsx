'use client';

import { useEffect, useState } from 'react';
import { useAuth, useFirestore } from '@/hooks/use-firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link'; // Import Link
import { decryptData } from '@/lib/encryption';
import { LogOut, AlertTriangle, User, Briefcase, MapPin, BadgeCheck, Star, MessageSquare, FileText, Download, Clock } from 'lucide-react';
import { addDoc, deleteDoc } from 'firebase/firestore';

// Data structures for Patient, Doctor, Appointment
interface PatientData {
  uid: string;
  email: string;
  fullName: string;
}

interface DoctorData {
  uid: string;
  fullName: string;
  specialization: string;
  location?: string;
  verificationLevel?: number;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  scheduledTime: any; // Timestamp
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  appointmentType?: string;
  issue?: string;
}

interface Prescription {
  id: string;
  doctorName: string;
  pdfUrl: string;
  createdAt: string;
  expiresAt: string;
}

export default function PatientDashboardPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [reviewingApp, setReviewingApp] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Check if join button should be enabled
  const isJoinEnabled = (scheduledTime: any) => {
    if (!scheduledTime) return false;
    const now = new Date();
    const scheduleDate = scheduledTime.toDate();
    const diffInMinutes = (scheduleDate.getTime() - now.getTime()) / 60000;
    // Enabled if within 2 minutes before schedule (or passed schedule but not completed)
    return diffInMinutes <= 2;
  };

  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setLoading(true);
        try {
          // 1. Fetch Patient Profile
          const patientRef = doc(db, 'patients', user.uid);
          const patientSnap = await getDoc(patientRef);

          if (patientSnap.exists()) {
            setPatientData(patientSnap.data() as PatientData);
          } else {
            toast({ title: "Error", description: "Could not find your patient profile.", variant: "destructive" });
            await auth.signOut();
            router.push('/patient/login');
            return;
          }

          // 2. Fetch Doctors
          const doctorsQuery = query(collection(db, "doctors"), where("isProfileComplete", "==", true));
          const doctorsSnapshot = await getDocs(doctorsQuery);
          const fetchedDoctors = doctorsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              uid: doc.id,
              fullName: data.name || 'Unknown Doctor',
              specialization: data.specialization || 'General',
              location: data.hospitalName || 'Local Clinic',
              verificationLevel: data.verificationLevel
            } as DoctorData;
          });
          setDoctors(fetchedDoctors);

          // 3. Fetch Appointments
          const appQuery = query(collection(db, "appointments"), where("patientId", "==", user.uid));
          const appSnapshot = await getDocs(appQuery);
          const fetchedAppointments = appSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              issue: decryptData(data.issue)
            };
          }) as Appointment[];
          // Sort by date (descending)
          fetchedAppointments.sort((a, b) => b.scheduledTime?.seconds - a.scheduledTime?.seconds);
          setAppointments(fetchedAppointments);

          // 3. Fetch Prescriptions & Lazy Cleanup
          const presQuery = query(collection(db, "prescriptions"), where("patientId", "==", user.uid));
          const presSnapshot = await getDocs(presQuery);
          const now = new Date();
          const validPres: Prescription[] = [];

          for (const d of presSnapshot.docs) {
            const data = d.data();
            const expiresAt = new Date(data.expiresAt);

            if (expiresAt < now) {
              await deleteDoc(d.ref);
            } else {
              validPres.push({ id: d.id, ...data } as Prescription);
            }
          }
          setPrescriptions(validPres);
        } catch (err: any) {
          console.error("Dashboard loading error:", err);
          setError("Could not load dashboard. Please try again later.");
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/patient/login');
      }
    });

    return () => unsubscribe();
  }, [auth, db, router, toast]);

  const handleSubmitReview = async () => {
    if (!reviewingApp || !db || isSubmittingReview) return;

    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        doctorId: reviewingApp.doctorId,
        doctorName: reviewingApp.doctorName,
        patientId: auth?.currentUser?.uid,
        patientName: patientData?.fullName || "Anonymous",
        appointmentId: reviewingApp.id,
        rating,
        comment,
        createdAt: new Date().toISOString()
      });

      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      setReviewingApp(null);
      setComment('');
      setRating(5);
    } catch (err) {
      console.error("Review error:", err);
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/patient/login');
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    !locationFilter || (doctor.location && doctor.location.toLowerCase().includes(locationFilter.toLowerCase()))
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Your Dashboard...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h1 className="text-2xl font-bold">An Error Occurred</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!patientData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8 shadow overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Sehat Sathi" className="h-16 w-16 object-contain" />
              <div>
                <CardTitle className="text-3xl font-bold">Welcome, {patientData.fullName}!</CardTitle>
                <CardDescription>Your central place to manage health appointments.</CardDescription>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardHeader>
        </Card>

        {/* Prescriptions Notification Section */}
        {prescriptions.length > 0 && (
          <Card className="mb-8 border-blue-100 bg-blue-50/30 dark:bg-blue-900/10 overflow-hidden shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Active Prescriptions
                </CardTitle>
                <CardDescription className="text-blue-600/70">
                  Medical advice from your doctors. Download within 24 hours.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {prescriptions.map((pres) => (
                <div key={pres.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">Prescription from Dr. {pres.doctorName}</p>
                      <p className="text-xs text-blue-500 font-medium flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> Expires: {new Date(pres.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Today
                      </p>
                    </div>
                  </div>
                  <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <a href={pres.pdfUrl} download={`Prescription_${pres.id}.pdf`} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book a Consultation</CardTitle>
                <CardDescription>Choose from our list of available specialists.</CardDescription>
                <div className="mt-4">
                  <Input
                    placeholder="Filter by location (e.g. New York)"
                    value={locationFilter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocationFilter(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredDoctors.length > 0 ? (
                  <ul className="space-y-4">
                    {filteredDoctors.map((doctor) => (
                      <li key={doctor.uid} className="p-4 border rounded-lg flex items-center justify-between transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{doctor.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="font-bold text-lg">Dr. {doctor.fullName}</p>
                              {doctor.verificationLevel === 3 && (
                                <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-50" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Briefcase className="h-4 w-4 mr-2" />
                              {doctor.specialization}
                            </p>
                            {doctor.location && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-2" />
                                {doctor.location}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Updated Button to be a Link */}
                        <Link href={`/patient/book/${doctor.uid}`} passHref>
                          <Button asChild>
                            <a>Book Appointment</a>
                          </Button>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500">No doctors are available at the moment. Please check back later.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>My Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <ul className="space-y-4">
                    {appointments.map(app => (
                      <li key={app.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                app.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {app.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {app.scheduledTime?.toDate().toLocaleDateString()} {app.scheduledTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="font-bold text-md mb-1">{app.doctorName}</h4>
                        {app.issue && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{app.issue}</p>}

                        {app.status === 'accepted' && (
                          <div className="mt-2">
                            <Button
                              className="w-full"
                              size="sm"
                              disabled={!isJoinEnabled(app.scheduledTime)}
                              asChild={isJoinEnabled(app.scheduledTime)}
                            >
                              {isJoinEnabled(app.scheduledTime) ? (
                                <Link href={`/video-call?callId=${app.id}`}>Join Video Call</Link>
                              ) : (
                                <span>Join in {Math.max(0, Math.ceil((app.scheduledTime.toDate().getTime() - new Date().getTime()) / 60000) - 2)}m</span>
                              )}
                            </Button>
                            {!isJoinEnabled(app.scheduledTime) && <p className="text-[10px] text-gray-400 text-center mt-1">Available 2 mins before.</p>}
                          </div>
                        )}
                        {app.status === 'completed' && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => setReviewingApp(app)}
                            >
                              <Star className="h-4 w-4 mr-2" /> Rate Experience
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-8">You have no upcoming appointments.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Review Modal */}
        {reviewingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
              <CardHeader>
                <CardTitle>Rate Dr. {reviewingApp.doctorName}</CardTitle>
                <CardDescription>Tell us about your consultation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className={`p-1 transition-transform active:scale-95 ${rating >= s ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star className={`h-8 w-8 ${rating >= s ? 'fill-yellow-500' : ''}`} />
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Feedback</label>
                  <textarea
                    className="w-full p-3 border rounded-md min-h-[100px] text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Describe your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1" onClick={() => setReviewingApp(null)} disabled={isSubmittingReview}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleSubmitReview} disabled={!comment || isSubmittingReview}>
                    {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
