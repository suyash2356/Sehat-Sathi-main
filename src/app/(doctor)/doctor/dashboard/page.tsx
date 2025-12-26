// Doctor Dashboard - Request Management, Call Initiation & Prescriptions
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useFirestore } from '@/hooks/use-firebase';
import { collection, query, where, doc, updateDoc, setDoc, onSnapshot, getDoc, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Video, Phone, Calendar, Clock, User, FileText, Plus, Trash, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { decryptData } from '@/lib/encryption';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

      setRequests(processed.filter(a => a.status === 'pending'));
      setUpcoming(processed.filter(a => ['accepted', 'in_call'].includes(a.status)));
      setCompleted(processed.filter(a => a.status === 'completed'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);



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
      toast({ title: "Error starting call", description: e.message, variant: "destructive" });
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


  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
        </header>

        {/* REQUESTS */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="text-yellow-600 h-5 w-5" />
            <h2 className="text-xl font-bold">Requests {requests.length > 0 && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{requests.length}</span>}</h2>
          </div>
          {requests.length === 0 ? <div className="p-4 bg-white border rounded text-center text-gray-500">No pending requests</div> : (
            <div className="grid gap-4 md:grid-cols-3">
              {requests.map(req => (
                <Card key={req.id} className="border-l-4 border-l-yellow-400">
                  <CardHeader>
                    <CardTitle>{req.patientDetails.name}</CardTitle>
                    <CardDescription>{(req.mode || 'video').toUpperCase()}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    <p><strong>Age:</strong> {req.patientDetails?.age ?? '—'} &nbsp; <strong>Gender:</strong> {req.patientDetails?.gender ?? '—'}</p>
                    <p><strong>Timing:</strong> {req.timing === 'call_now' ? 'Immediate' : (req.scheduledTime?.toDate ? req.scheduledTime.toDate().toLocaleString() : String(req.scheduledTime))}</p>
                  </CardContent>
                  <CardContent>
                    <p className="text-sm mb-4"><strong>Issue:</strong> {req.patientDetails.disease}</p>
                    <div className="flex gap-2"><Button size="sm" className="w-full bg-green-600" onClick={() => handleStatusUpdate(req.id, 'accepted')}>Accept</Button><Button size="sm" variant="destructive" className="w-full" onClick={() => handleStatusUpdate(req.id, 'rejected')}>Reject</Button></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ACTIVE */}
        <section>
          <div className="flex items-center gap-2 mb-4"><Calendar className="text-blue-600 h-5 w-5" /> <h2 className="text-xl font-bold">Upcoming</h2></div>
          {upcoming.length === 0 ? <div className="p-4 bg-white border rounded text-center text-gray-500">No active appointments</div> : (
            <div className="grid gap-4 md:grid-cols-3">
              {upcoming.map(app => (
                <Card key={app.id} className={`border-l-4 ${app.status === 'in_call' ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                  <CardHeader><CardTitle>{app.patientDetails.name}</CardTitle><CardDescription>{(app.mode || 'video') === 'visit' ? 'Clinic Visit' : 'Teleconsultation'}</CardDescription></CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4"><Clock className="inline h-3 w-3 mr-1" />{app.timing === 'call_now' ? 'Immediate' : app.scheduledTime?.toDate().toLocaleString()}</p>
                    {app.mode !== 'visit' ? (
                      <Button onClick={() => handleStartCall(app)} className={`w-full ${app.status === 'in_call' ? 'bg-red-600' : 'bg-blue-600'}`}>
                        {app.status === 'in_call' ? 'RESUME CALL' : 'START CALL'}
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" onClick={() => handleStatusUpdate(app.id, 'completed')}>Mark Complete</Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* COMPLETED / HISTORY */}
        <section>
          <div className="flex items-center gap-2 mb-4"><Check className="text-green-600 h-5 w-5" /> <h2 className="text-xl font-bold">Completed</h2></div>
          {completed.length === 0 ? <div className="p-4 bg-white border rounded text-center text-gray-500">No completed appointments</div> : (
            <div className="grid gap-4 md:grid-cols-3">
              {completed.map(app => (
                <Card key={app.id} className="border-l-4 border-l-green-500">
                  <CardHeader><CardTitle>{app.patientDetails.name}</CardTitle><CardDescription>Completed</CardDescription></CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" onClick={() => handlePrescribeClick(app)}>
                      <FileText className="mr-2 h-4 w-4" /> Write Prescription
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Prescription Modal */}
      {isPrescriptionModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Prescription for {selectedApp.patientDetails.name}</CardTitle>
                <CardDescription>Add medications below</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPrescriptionModalOpen(false)}><X /></Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center"><h4 className="font-bold">Medications</h4><Button size="sm" onClick={handleAddMedication}><Plus className="h-4 w-4 mr-1" /> Add</Button></div>
                {medications.map((med, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 p-2 border rounded">
                    <div className="col-span-4"><Input placeholder="Name" value={med.name} onChange={(e) => handleMedicationChange(i, 'name', e.target.value)} /></div>
                    <div className="col-span-2"><Input placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedicationChange(i, 'dosage', e.target.value)} /></div>
                    <div className="col-span-2"><Input placeholder="Freq" value={med.frequency} onChange={(e) => handleMedicationChange(i, 'frequency', e.target.value)} /></div>
                    <div className="col-span-3"><Input placeholder="Instructions" value={med.instructions} onChange={(e) => handleMedicationChange(i, 'instructions', e.target.value)} /></div>
                    <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => handleRemoveMedication(i)}><Trash className="h-4 w-4 text-red-500" /></Button></div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="font-bold">General Notes</label>
                <Textarea placeholder="Rest, diet, etc." value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsPrescriptionModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitPrescription} disabled={isPrescribing}>{isPrescribing ? <Loader2 className="animate-spin" /> : 'Send Prescription'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
