'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useFirestore } from '@/hooks/use-firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon, ClockIcon, UserPlus, Video, Users, Stethoscope, Check, X, Building, History as HistoryIcon } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { decryptData } from '@/lib/encryption';
import { FilePlus, Trash, Plus, FileDown, Loader2 } from 'lucide-react';
import { addDoc } from 'firebase/firestore';
import { uploadToSupabase } from '@/lib/supabase';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Textarea } from '@/components/ui/textarea';
import { Input as CustomInput } from '@/components/ui/input';

// Define types for our data
interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  scheduledTime: any; // Timestamp
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'noshow';
  appointmentType: string;
  issue?: string;
  patientPhone?: string;
  reason?: string;
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
  qualification?: string;
  registrationNumber?: string;
  signatureUrl?: string;
  stampUrl?: string;
  clinicName?: string;
  clinicAddress?: string;
}

interface Medication {
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function DoctorDashboardPage() {
  const { user, loading: isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Active appointments (pending/accepted)
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Prescription Modal State
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [medications, setMedications] = useState<Medication[]>([{ name: '', strength: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [generalNotes, setGeneralNotes] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
          setDoctor({ fullName: data.name, ...data } as Doctor);
        } else {
          console.warn("Doctor profile not found.");
        }

        // Fetch ACTIVE appointments (pending and accepted)
        const q = query(
          collection(db, 'appointments'),
          where('doctorId', '==', user.uid),
          where('status', 'in', ['pending', 'accepted'])
        );
        const querySnapshot = await getDocs(q);
        const apps = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            issue: decryptData(data.issue),
            patientPhone: decryptData(data.patientPhone)
          };
        }) as Appointment[];
        setAppointments(apps);

        // Fetch HISTORY appointments (completed/cancelled/rejected/noshow)
        const historyQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', user.uid),
          where('status', 'in', ['completed', 'rejected', 'cancelled', 'noshow'])
        );
        const historySnapshot = await getDocs(historyQuery);
        const historyApps = historySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            issue: decryptData(data.issue),
            patientPhone: decryptData(data.patientPhone)
          };
        }) as Appointment[];
        // Sort history by time (descending - newest first)
        historyApps.sort((a, b) => b.scheduledTime?.seconds - a.scheduledTime?.seconds);
        setHistoryAppointments(historyApps);

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

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus
      });

      // Update state locally
      if (['completed', 'noshow', 'rejected'].includes(newStatus)) {
        // Cleanup call metadata if completed
        if (newStatus === 'completed') {
          try {
            await deleteDoc(doc(db, 'calls', appointmentId));
            console.log("Call metadata cleaned up for:", appointmentId);
          } catch (cleanupError) {
            console.error("Call cleanup failed:", cleanupError);
          }
        }

        // Remove from upcoming/pending and add to history
        const app = appointments.find(a => a.id === appointmentId);
        if (app) {
          setAppointments(prev => prev.filter(a => a.id !== appointmentId));
          setHistoryAppointments(prev => [{ ...app, status: newStatus as any }, ...prev]);
        }
      } else {
        // Just update status in place (e.g. pending -> accepted)
        setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: newStatus as any } : a));
      }

      toast({ title: "Status Updated", description: `Appointment marked as ${newStatus}` });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Error", description: "Failed to update appointment.", variant: "destructive" });
    }
  };

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', strength: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const generatePrescriptionPDF = async (app: Appointment, doctorInfo: Doctor, meds: Medication[], age: string, gender: string, notes: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 115, 70); // Theme green
    doc.text(doctorInfo.clinicName || "Sehat Sathi Medical", 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(doctorInfo.clinicAddress || "Clinic Address Not Set", 20, 32);

    doc.setDrawColor(200);
    doc.line(20, 38, pageWidth - 20, 38);

    // Doctor Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(`Dr. ${doctorInfo.fullName}`, 20, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(doctorInfo.qualification || "", 20, 53);
    doc.text(doctorInfo.specialization || "General Physician", 20, 58);
    doc.text(`Reg No: ${doctorInfo.registrationNumber || "N/A"}`, 20, 63);

    // Patient Info
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT DETAILS", pageWidth - 80, 48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${app.patientName}`, pageWidth - 80, 53);
    doc.text(`Age/Gender: ${age} / ${gender}`, pageWidth - 80, 58);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 80, 63);

    doc.line(20, 70, pageWidth - 20, 70);

    // RX Symbol
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Rx", 20, 85);

    // Medications Table
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Medicine Name", 20, 95);
    doc.text("Strength", 80, 95);
    doc.text("Dosage / Frequency", 110, 95);
    doc.text("Duration", 160, 95);

    doc.setFont("helvetica", "normal");
    let y = 105;
    meds.forEach((med) => {
      doc.text(med.name || "---", 20, y);
      doc.text(med.strength || "---", 80, y);
      doc.text(`${med.dosage || ''} (Freq: ${med.frequency || ''})`, 110, y);
      doc.text(med.duration || "---", 160, y);
      if (med.instructions) {
        y += 5;
        doc.setFontSize(8);
        doc.setTextColor(80);
        doc.text(`Note: ${med.instructions}`, 20, y);
        doc.setFontSize(10);
        doc.setTextColor(0);
      }
      y += 10;
    });

    // Notes
    if (notes) {
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("INSTRUCTIONS / PRECAUTIONS:", 20, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(notes, 20, y, { maxWidth: pageWidth - 40 });
    }

    // Footer - Signature & Stamp
    const footerY = doc.internal.pageSize.getHeight() - 60;

    if (doctorInfo.signatureUrl) {
      try {
        doc.addImage(doctorInfo.signatureUrl, 'PNG', pageWidth - 70, footerY, 40, 20);
      } catch (e) { console.error("Could not add signature to PDF", e); }
    }

    if (doctorInfo.stampUrl) {
      try {
        doc.addImage(doctorInfo.stampUrl, 'PNG', 20, footerY, 30, 30);
      } catch (e) { console.error("Could not add stamp to PDF", e); }
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Digital Signature", pageWidth - 70, footerY + 25);

    // QR Code for Verification
    const verificationUrl = `${window.location.origin}/verify/prescription/${app.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth / 2 - 15, footerY + 10, 30, 30);
    doc.setFontSize(8);
    doc.text("Scan to Verify", pageWidth / 2 - 8, footerY + 45);

    return doc;
  };

  const handleSubmitPrescription = async () => {
    if (!selectedApp || !doctor || !db) return;

    setIsGeneratingPdf(true);
    try {
      const pdf = await generatePrescriptionPDF(selectedApp, doctor, medications, patientAge, patientGender, generalNotes);
      const pdfBlob = pdf.output('blob');

      // Upload to Supabase 'prescriptions' bucket
      const fileName = `prescription_${selectedApp.id}.pdf`;
      const pdfUrl = await uploadToSupabase(pdfBlob as any, fileName, 'prescriptions');

      // Save metadata to Firestore
      await addDoc(collection(db, 'prescriptions'), {
        appointmentId: selectedApp.id,
        patientId: selectedApp.patientId,
        doctorId: user?.uid,
        doctorName: doctor.fullName,
        pdfUrl: pdfUrl,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        medications: medications,
        patientDetails: { age: patientAge, gender: patientGender }
      });

      toast({ title: "Success", description: "Prescription sent to patient successfully." });
      setIsPrescriptionModalOpen(false);
      // Reset form
      setMedications([{ name: '', strength: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      setPatientAge('');
      setGeneralNotes('');

    } catch (error) {
      console.error("Prescription error:", error);
      toast({ title: "Error", description: "Failed to send prescription.", variant: "destructive" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Check if join button should be enabled
  const isJoinEnabled = (scheduledTime: any) => {
    if (!scheduledTime) return false;
    const now = new Date();
    const scheduleDate = scheduledTime.toDate();
    const diffInMinutes = (scheduleDate.getTime() - now.getTime()) / 60000;
    // Enabled if within 2 minutes before schedule (or passed schedule but not completed)
    return diffInMinutes <= 2;
  };

  // Get today's schedule
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = schedule.find(s => s.day === today && s.isAvailable);

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
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming & Requests</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-8 mt-4">
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
                              <p className="text-sm text-gray-500">Issue: {app.reason || app.issue}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Type: {app.appointmentType?.replace('_', ' ') || 'Consultation'}
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
                                <p className="text-sm text-gray-500">{app.reason || app.issue}</p>
                                <p className="text-xs text-blue-600 flex items-center mt-1">
                                  {app.appointmentType === 'clinic_visit' ? <Building className="h-3 w-3 mr-1" /> : <Video className="h-3 w-3 mr-1" />}
                                  {app.appointmentType === 'clinic_visit' ? 'Clinic Visit' : 'Video Call'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {/* Video Call Logic */}
                              {app.appointmentType !== 'clinic_visit' && (
                                <>
                                  <Button
                                    size="sm"
                                    disabled={!isJoinEnabled(app.scheduledTime)}
                                    asChild={isJoinEnabled(app.scheduledTime)}
                                    className="mt-4 md:mt-0"
                                  >
                                    {isJoinEnabled(app.scheduledTime) ? (
                                      <Link href={`/video-call?callId=${app.id}`}><Video className="mr-2 h-4 w-4" /> Join Call</Link>
                                    ) : (
                                      <span>Join in {Math.max(0, Math.ceil((app.scheduledTime.toDate().getTime() - new Date().getTime()) / 60000) - 2)}m</span>
                                    )}
                                  </Button>
                                  {!isJoinEnabled(app.scheduledTime) && <p className="text-[10px] text-gray-400">Available 2 mins before.</p>}
                                </>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-primary text-primary hover:bg-primary/5"
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setIsPrescriptionModalOpen(true);
                                  }}
                                >
                                  <FilePlus className="h-4 w-4 mr-2" /> Prescribe
                                </Button>

                                {/* Clinic Visit Logic */}
                                {app.appointmentType === 'clinic_visit' && (
                                  <>
                                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdateStatus(app.id, 'completed')}>
                                      <Check className="mr-2 h-4 w-4" /> Mark Done
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleUpdateStatus(app.id, 'noshow')}>
                                      No Show
                                    </Button>
                                  </>
                                )}

                                {app.status === 'accepted' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-400 hover:text-blue-600"
                                    onClick={() => handleUpdateStatus(app.id, 'completed')}
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No upcoming appointments.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment History</CardTitle>
                    <CardDescription>Past consultations and outcomes.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historyAppointments.length > 0 ? (
                      <ul className="space-y-4">
                        {historyAppointments.map(app => (
                          <li key={app.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 dark:bg-gray-800/20">
                            <div>
                              <p className="font-bold">{app.patientName}</p>
                              <p className="text-sm text-gray-500">{app.scheduledTime?.toDate().toLocaleDateString()} - {app.appointmentType === 'clinic_visit' ? 'Clinic' : 'Video'}</p>
                            </div>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full font-bold self-center ${app.status === 'completed' ? 'bg-green-100 text-green-800' :
                                app.status === 'noshow' ? 'bg-orange-100 text-orange-800' :
                                  app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-200'
                                }`}>
                                {app.status.toUpperCase()}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary/5"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setIsPrescriptionModalOpen(true);
                                }}
                              >
                                <FilePlus className="h-4 w-4 mr-2" /> New Prescription
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-center py-8 text-gray-500">No history available.</p>}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

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
      {/* Prescription Modal */}
      {isPrescriptionModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-4xl animate-in fade-in zoom-in duration-200 my-8">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Write Prescription
                  </CardTitle>
                  <CardDescription>
                    Issuing to: <span className="font-bold text-gray-900">{selectedApp.patientName}</span>
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsPrescriptionModalOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Patient Quick Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Patient Age</label>
                  <CustomInput
                    placeholder="e.g. 25 Years"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500">Patient Gender</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Medications List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm uppercase text-primary">Medications</h4>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddMedication} className="h-8">
                    <Plus className="h-4 w-4 mr-1" /> Add Medicine
                  </Button>
                </div>

                <div className="space-y-3">
                  {medications.map((med, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 border rounded-xl relative group bg-white dark:bg-gray-800/50">
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">MEDICINE NAME</label>
                        <CustomInput
                          placeholder="Paracetamol"
                          value={med.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">STRENGTH</label>
                        <CustomInput
                          placeholder="500mg"
                          value={med.strength}
                          onChange={(e) => handleMedicationChange(index, 'strength', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">DOSAGE (E.G. 1-0-1)</label>
                        <CustomInput
                          placeholder="1-1-1"
                          value={med.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">DURATION</label>
                        <CustomInput
                          placeholder="5 Days"
                          value={med.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={medications.length === 1}
                          onClick={() => handleRemoveMedication(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="md:col-span-12 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">INSTRUCTIONS</label>
                        <CustomInput
                          placeholder="After food, twice daily"
                          value={med.instructions}
                          onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500">General Instructions / Precautions</label>
                <Textarea
                  placeholder="Drink plenty of water. Avoid cold drinks..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="ghost" onClick={() => setIsPrescriptionModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-primary text-white"
                  onClick={handleSubmitPrescription}
                  disabled={isGeneratingPdf || !patientAge}
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating PDF & Sending...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4 mr-2" /> Send Official Prescription
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
