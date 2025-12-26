'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/hooks/use-firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Calendar, Clock, Loader2, Video, Phone, User } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { encryptData } from '@/lib/encryption';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper Interface
interface DoctorData { fullName: string; specialization: string; }
interface DaySchedule { day: string; startTime: string; endTime: string; enabled: boolean; }

// Validation Schema
const formSchema = z.object({
  appointmentDate: z.string().min(1, "Please select a date."),
  appointmentTime: z.string().min(1, "Please select a time slot."),
  mode: z.enum(['video', 'voice', 'visit'], { required_error: "Select consultation mode." }),
  issue: z.string().min(10, "Briefly describe your issue (min 10 chars)."),
  age: z.coerce.number().min(1, "Age must be valid.").max(120),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Select gender." }),
});

export default function BookAppointmentPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const doctorId = params.doctorId as string;

  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [availability, setAvailability] = useState<DaySchedule[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: 'video',
      gender: 'male',
      appointmentDate: '',
      appointmentTime: '',
      issue: '',
      age: '' as unknown as number
    }
  });

  // 1. Fetch Doctor
  useEffect(() => {
    if (!db || !doctorId) return;
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'doctors', doctorId);
        const schedRef = doc(db, 'doctors', doctorId, 'availability', 'default');
        const [docSnap, schedSnap] = await Promise.all([getDoc(docRef), getDoc(schedRef)]);

        if (docSnap.exists()) setDoctor(docSnap.data() as DoctorData);
        if (schedSnap.exists()) setAvailability(schedSnap.data().schedule || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [db, doctorId]);

  // 2. Generate Slots
  const handleDateChange = async (date: string) => {
    form.setValue("appointmentDate", date);
    form.setValue("appointmentTime", "");
    if (!date || !db) return;

    setSlotsLoading(true);
    try {
      // Find schedule for day
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      const dayRule = availability.find(d => d.day === dayName);

      if (!dayRule || !dayRule.enabled) {
        setTimeSlots([]);
      } else {
        // Generate raw slots
        const slots: string[] = [];
        let curr = new Date(`2000-01-01T${dayRule.startTime}`);
        const end = new Date(`2000-01-01T${dayRule.endTime}`);
        while (curr < end) {
          slots.push(curr.toTimeString().substring(0, 5));
          curr.setMinutes(curr.getMinutes() + 60);
        }

        // Filter booked slots (Optimistic check)
        const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);
        const q = query(collection(db, "appointments"),
          where("doctorId", "==", doctorId),
          where("scheduledTime", ">=", Timestamp.fromDate(startOfDay)),
          where("scheduledTime", "<=", Timestamp.fromDate(endOfDay)));

        const bookedSnaps = await getDocs(q);
        const bookedTimes = bookedSnaps.docs.map(d => {
          const t = d.data().scheduledTime.toDate();
          return `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
        });

        // Current time check if today
        const now = new Date();
        const isToday = new Date(date).toDateString() === now.toDateString();

        const available = slots.filter(time => {
          if (bookedTimes.includes(time)) return false;
          if (isToday) {
            const [h, m] = time.split(':').map(Number);
            const slotDate = new Date(); slotDate.setHours(h, m, 0);
            if (slotDate <= now) return false;
          }
          return true;
        });
        setTimeSlots(available);
      }
    } catch (e) { console.error(e); } finally { setSlotsLoading(false); }
  };

  // 3. Submit Scheduled Appointment
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const user = auth?.currentUser;
    if (!user || !db || !doctor) return;

    try {
      const patientRef = doc(db, 'patients', user.uid);
      const patientSnap = await getDoc(patientRef);
      const patientData = patientSnap.exists() ? patientSnap.data() : { fullName: user.email };

      const timestamp = Timestamp.fromDate(new Date(`${values.appointmentDate}T${values.appointmentTime}`));

      await addDoc(collection(db, 'appointments'), {
        doctorId,
        doctorName: doctor.fullName,
        patientId: user.uid,
        patientDetails: {
          name: patientData.fullName,
          age: values.age,
          gender: values.gender,
          disease: encryptData(values.issue), // Encrypted
          phone: patientData.phone ? encryptData(patientData.phone) : ''
        },
        status: 'pending', // Starts pending
        mode: values.mode,
        timing: 'scheduled',
        scheduledTime: timestamp,
        createdAt: serverTimestamp()
      });

      toast({ title: "Request Sent", description: "Waiting for doctor approval." });
      // Stay on page; do not navigate away. Patient should only receive notification in dashboard/messages.
      // router.push('/patient/dashboard');

    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Booking failed.", variant: "destructive" });
    }
  }

  // 4. Handle "Call Now" (Immediate Request)
  const handleCallNow = async () => {
    const user = auth?.currentUser;
    if (!user || !db || !doctor) return;

    // Quick validation
    const { issue, age, gender, mode } = form.getValues();
    if (!issue || issue.length < 5) {
      toast({ title: "Details Required", description: "Please enter your issue first.", variant: "destructive" });
      return;
    }

    try {
      const patientRef = doc(db, 'patients', user.uid);
      const patientSnap = await getDoc(patientRef);
      const patientData = patientSnap.exists() ? patientSnap.data() : { fullName: user.email };

      await addDoc(collection(db, 'appointments'), {
        doctorId,
        doctorName: doctor.fullName,
        patientId: user.uid,
        patientDetails: {
          name: patientData.fullName,
          age: Number(age) || (patientData.age ? Number(patientData.age) : 0),
          gender: gender || 'male',
          disease: encryptData(issue),
          phone: patientData.phone ? encryptData(patientData.phone) : ''
        },
        status: 'pending', // IMPORTANT: Starts pending, NOT accepted
        mode: mode || 'video',
        timing: 'call_now',
        scheduledTime: Timestamp.now(), // For sorting
        createdAt: serverTimestamp()
      });

      toast({ title: "Emergency Request Sent", description: "Please wait on your dashboard." });
      // Stay on page; patient will receive notification in dashboard/messages. Do not auto-navigate.
      // router.push('/patient/dashboard');
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not send request.", variant: "destructive" });
    }
  };


  if (loading) return <div className="p-8 text-center">Loading Doctor...</div>;
  if (!doctor) return <div className="p-8 text-center text-red-500">Doctor not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>Book Dr. {doctor.fullName}</CardTitle>
              <CardDescription>{doctor.specialization}</CardDescription>
            </div>
            <Button variant="destructive" onClick={handleCallNow} className="animate-pulse">
              <Video className="mr-2 h-4 w-4" /> Call Now (Urgent)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Mode Selection */}
              <FormField control={form.control} name="mode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Consultation Type</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                      <FormItem className="flex items-center space-x-2"><RadioGroupItem value="video" /><FormLabel>Video Call</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-2"><RadioGroupItem value="voice" /><FormLabel>Voice Only</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-2"><RadioGroupItem value="visit" /><FormLabel>Clinic Visit</FormLabel></FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="appointmentDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input type="date" min={new Date().toISOString().split('T')[0]} {...field} onChange={e => handleDateChange(e.target.value)} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {timeSlots.length > 0 && (
                  <FormField control={form.control} name="appointmentTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Slot" /></SelectTrigger></FormControl>
                        <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="issue" render={({ field }) => (
                <FormItem><FormLabel>Issue Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <Button type="submit" className="w-full" disabled={!form.formState.isValid}>Confirm Booking</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
