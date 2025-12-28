'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUser } from '@/hooks/use-user';
import { useFirestore } from '@/hooks/use-firebase';
import { collection, query, where, doc, updateDoc, setDoc, onSnapshot, getDoc, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Video, Phone, Calendar, Clock, User, FileText, Plus, Trash, Loader2, Search, ListFilter, Users, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { decryptData } from '@/lib/encryption';
import { StatCard } from "@/components/dashboard/StatCard";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";

interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  patientDetails: { name: string; age: number; gender: string; disease: string; phone?: string; };
  status: 'pending' | 'accepted' | 'rejected' | 'in_call' | 'completed';
  mode: 'video' | 'voice' | 'visit';
  timing: 'scheduled' | 'call_now';
  scheduledTime: any;
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
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [roleChecked, setRoleChecked] = useState(false);

  const [requests, setRequests] = useState<Appointment[]>([]);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [completed, setCompleted] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  // Prescription Modal State
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [medications, setMedications] = useState<Medication[]>([{ name: '', strength: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [isPrescribing, setIsPrescribing] = useState(false);


  // Real-time Listener for Appointments
  useEffect(() => {
    if (!user || !db) return;
    // Role enforcement: ensure this auth user is a doctor record
    (async () => {
      try {
        const docRef = doc(db, 'doctors', user.uid);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          // If user has a patient record, redirect to patient dashboard
          const pRef = doc(db, 'patients', user.uid);
          const pSnap = await getDoc(pRef);
          if (pSnap.exists()) {
            router.replace('/patient/dashboard');
            return;
          }
          // Otherwise, show a message and stop
          toast({ title: 'Access Denied', description: 'You are not registered as a doctor.', variant: 'destructive' });
          router.replace('/');
          return;
        }
      } catch (e) {
        console.error('Role check failed', e);
      } finally {
        setRoleChecked(true);
      }
    })();
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment));

      const processed = apps.map(app => {
        let diseaseDecrypted = 'Encrypted';
        try {
          diseaseDecrypted = decryptData(app.patientDetails?.disease || '');
        } catch (e) {
          // console.error("Decryption failed", e); 
        }

        return {
          ...app,
          patientDetails: {
            ...app.patientDetails,
            disease: diseaseDecrypted
          }
        };
      });

      // Sort by date logic (helper)
      const getDate = (a: Appointment) => {
        if (a.timing === 'call_now') return new Date();
        return a.scheduledTime?.toDate ? a.scheduledTime.toDate() : new Date(a.scheduledTime);
      };

      setRequests(processed.filter(a => a.status === 'pending').sort((a, b) => getDate(a).getTime() - getDate(b).getTime()));
      setUpcoming(processed.filter(a => ['accepted', 'in_call'].includes(a.status)).sort((a, b) => getDate(a).getTime() - getDate(b).getTime()));

      // History sorted descending (newest first)
      const hist = processed.filter(a => ['completed', 'rejected'].includes(a.status));
      setCompleted(hist.sort((a, b) => getDate(b).getTime() - getDate(a).getTime()));

      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);


  // Computed History List
  const filteredHistory = useMemo(() => {
    return completed.filter(app => {
      const matchesSearch = app.patientDetails.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = historyFilter === 'all' || app.status === historyFilter;
      return matchesSearch && matchesStatus;
    });
  }, [completed, searchTerm, historyFilter]);


  // Actions
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
      toast({ title: `Appointment ${newStatus}` });
    } catch (e) { console.error(e); }
  };

  const handleStartCall = async (app: Appointment) => {
    if (!db || !user) return;

    try {
      // Enforce doctor-only start rules: appointment must be accepted and timing satisfied
      if (app.status !== 'accepted' && app.status !== 'in_call') {
        toast({ title: 'Cannot Start', description: 'Only accepted appointments can be started.' });
        return;
      }
      if (app.timing !== 'call_now' && app.scheduledTime) {
        const scheduled = app.scheduledTime.toDate ? app.scheduledTime.toDate() : new Date(app.scheduledTime);
        if (new Date() < scheduled) {
          toast({ title: 'Too Early', description: 'Cannot start call before scheduled time.' });
          return;
        }
      }
      await setDoc(doc(db, 'callSessions', app.id), {
        appointmentId: app.id,
        doctorId: user.uid,
        doctorName: (user.displayName || user.email || ''),
        patientId: app.patientId,
        mode: app.mode || 'video',
        createdAt: new Date().toISOString()
      });
      await updateDoc(doc(db, 'appointments', app.id), { status: 'in_call' });
      router.push(`/video-call?sessionId=${app.id}`);
    } catch (e: any) {
      console.error("Failed to start call", e);
      // Check for ad-blocker indicators
      if (e.message?.includes('BLOCKED') || e.message?.includes('Failed to load') || e.message?.includes('network')) {
        toast({
          title: "Connection Blocked",
          description: "A browser extension (like an ad-blocker) is blocking the call service. Please disable it for this site and try again.",
          variant: "destructive",
          duration: 6000
        });
      } else {
        toast({ title: "Error starting call", description: e.message, variant: "destructive" });
      }
    }
  };

  const handlePrescribeClick = (app: Appointment) => {
    setSelectedApp(app);
    setMedications([{ name: '', strength: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setGeneralNotes('');
    setIsPrescriptionModalOpen(true);
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

  const handleSubmitPrescription = async () => {
    if (!selectedApp || !db || !user) return;
    setIsPrescribing(true);
    try {
      await addDoc(collection(db, 'prescriptions'), {
        appointmentId: selectedApp.id,
        patientId: selectedApp.patientId,
        patientName: selectedApp.patientDetails.name,
        patientAge: selectedApp.patientDetails.age,
        patientGender: selectedApp.patientDetails.gender,
        doctorId: user.uid,
        doctorName: selectedApp.doctorName,
        createdAt: new Date().toISOString(),
        medications,
        generalNotes
      });
      toast({ title: "Prescription Sent", description: "Patient has been notified." });
      setIsPrescriptionModalOpen(false);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not save prescription", variant: "destructive" });
    } finally {
      setIsPrescribing(false);
    }
  };


  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 space-y-6">

      {/* HEADER STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Requests"
          value={requests.length}
          icon={Users}
          color="text-yellow-600"
          description="Requires action"
        />
        <StatCard
          title="Upcoming Appointments"
          value={upcoming.length}
          icon={Calendar}
          color="text-blue-600"
          description="Scheduled & In-Call"
        />
        <StatCard
          title="Total History"
          value={completed.length}
          icon={ClipboardList}
          color="text-green-600"
          description="Completed & Rejected"
        />
        <StatCard
          title="Today's Date"
          value={new Date().getDate()}
          icon={Clock}
          color="text-purple-600"
          description={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        />
      </div>

      {/* TABS INTERFACE */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {/* Simple Placeholder Chart or Summary could go here */}
                <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded m-4">
                  Activity Summary (Coming Soon)
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Next Up</CardTitle>
                <CardDescription>Your upcoming appointments.</CardDescription>
              </CardHeader>
              <CardContent>
                {upcoming.length === 0 ? <p className="text-sm text-gray-500">No upcoming appointments.</p> : (
                  <div className="space-y-4">
                    {upcoming.slice(0, 3).map(app => (
                      <AppointmentCard
                        key={app.id}
                        appointment={app}
                        onStartCall={handleStartCall}
                        onComplete={(id) => handleStatusUpdate(id, 'completed')}
                        showActions={true}
                      />
                    ))}
                    {upcoming.length > 3 && <Button variant="link" onClick={() => (document.querySelector('[value="schedule"]') as HTMLElement)?.click()}>View All</Button>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* REQUESTS TAB */}
        <TabsContent value="requests" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5" /> Pending Requests</h2>
          </div>
          {requests.length === 0 ? <div className="p-8 text-center bg-white rounded-lg border text-muted-foreground">No pending requests found.</div> : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {requests.map(req => (
                <AppointmentCard
                  key={req.id}
                  appointment={req}
                  onAccept={(id) => handleStatusUpdate(id, 'accepted')}
                  onReject={(id) => handleStatusUpdate(id, 'rejected')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* SCHEDULE TAB */}
        <TabsContent value="schedule" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Calendar className="h-5 w-5" /> Your Schedule</h2>
          </div>
          {upcoming.length === 0 ? <div className="p-8 text-center bg-white rounded-lg border text-muted-foreground">No upcoming appointments.</div> : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map(app => (
                <AppointmentCard
                  key={app.id}
                  appointment={app}
                  onStartCall={handleStartCall}
                  onComplete={(id) => handleStatusUpdate(id, 'completed')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="mt-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patient name..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={historyFilter} onValueChange={setHistoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredHistory.length === 0 ? <div className="p-8 text-center bg-white rounded-lg border text-muted-foreground">No history found matching filters.</div> : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredHistory.map(app => (
                <AppointmentCard
                  key={app.id}
                  appointment={app}
                  onPrescribe={handlePrescribeClick}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Prescription Modal - Unchanged Logic */}
      {isPrescriptionModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardHeader className="flex flex-row justify-between items-center border-b">
              <div>
                <CardTitle>Prescription for {selectedApp.patientDetails.name}</CardTitle>
                <CardDescription>Add medications below</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPrescriptionModalOpen(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center"><h4 className="font-bold text-lg">Medications</h4><Button size="sm" onClick={handleAddMedication}><Plus className="h-4 w-4 mr-1" /> Add Medicine</Button></div>
                {medications.map((med, i) => (
                  <div key={i} className="grid grid-cols-2 md:grid-cols-12 gap-3 p-3 border rounded-lg items-end bg-gray-50/50">
                    <div className="col-span-2 md:col-span-4">
                      <label className="text-xs font-semibold text-muted-foreground md:hidden mb-1 block">Name</label>
                      <Input placeholder="Medicine Name" value={med.name} onChange={(e) => handleMedicationChange(i, 'name', e.target.value)} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground md:hidden mb-1 block">Dosage</label>
                      <Input placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedicationChange(i, 'dosage', e.target.value)} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground md:hidden mb-1 block">Freq</label>
                      <Input placeholder="Freq" value={med.frequency} onChange={(e) => handleMedicationChange(i, 'frequency', e.target.value)} />
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <label className="text-xs font-semibold text-muted-foreground md:hidden mb-1 block">Instructions</label>
                      <Input placeholder="Instructions" value={med.instructions} onChange={(e) => handleMedicationChange(i, 'instructions', e.target.value)} />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end md:justify-center">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveMedication(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="font-bold">General Notes</label>
                <Textarea placeholder="Rest, diet recommendations, etc." value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} className="min-h-[100px]" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="ghost" onClick={() => setIsPrescriptionModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitPrescription} disabled={isPrescribing}>{isPrescribing ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />} Send Prescription</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
