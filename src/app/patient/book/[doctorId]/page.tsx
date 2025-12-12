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
import { AlertTriangle, Calendar, Clock, Loader2 } from 'lucide-react';

// --- Interfaces and Schemas ---
interface DoctorData { fullName: string; specialization: string; }
const daySchema = z.object({ day: z.string(), startTime: z.string(), endTime: z.string(), enabled: z.boolean() });
type DaySchedule = z.infer<typeof daySchema>;

const formSchema = z.object({
  appointmentDate: z.string().min(1, "Please select a date."),
  appointmentTime: z.string().min(1, "Please select a time slot."),
  reason: z.string().min(10, "Please provide a brief reason for your visit (min. 10 characters)."),
});

// --- Helper Functions ---
const generateTimeSlots = (date: string, schedule: DaySchedule[], existingAppointments: Timestamp[]): string[] => {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const dayRule = schedule.find(d => d.day === dayOfWeek);
    if (!dayRule || !dayRule.enabled) return [];

    const slots: string[] = [];
    const { startTime, endTime } = dayRule;
    let currentTime = new Date(`${date}T${startTime}`);
    const lastTime = new Date(`${date}T${endTime}`);
    const now = new Date();

    while (currentTime < lastTime) {
        if (currentTime > now) {
            const timeString = currentTime.toTimeString().substring(0, 5);
            const isBooked = existingAppointments.some(appt => {
                const apptDate = appt.toDate();
                return apptDate.getHours() === currentTime.getHours() && apptDate.getMinutes() === currentTime.getMinutes();
            });
            if (!isBooked) slots.push(timeString);
        }
        currentTime.setMinutes(currentTime.getMinutes() + 60);
    }
    return slots;
};

// --- Main Component ---
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
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { appointmentDate: '', appointmentTime: '', reason: '' } });

  useEffect(() => {
    if (!db || !doctorId) return;
    const fetchInitialData = async () => {
      try {
        const doctorRef = doc(db, 'doctors', doctorId);
        const availabilityRef = doc(db, 'doctors', doctorId, 'availability', 'default');
        const [doctorSnap, availabilitySnap] = await Promise.all([getDoc(doctorRef), getDoc(availabilityRef)]);
        if (doctorSnap.exists()) setDoctor(doctorSnap.data() as DoctorData); else setError("Doctor not found.");
        if (availabilitySnap.exists()) setAvailability(availabilitySnap.data().schedule); else setAvailability([]);
      } catch (err) { setError("Failed to fetch doctor details."); } finally { setLoading(false); }
    };
    fetchInitialData();
  }, [db, doctorId]);

  const handleDateChange = async (date: string) => {
    form.setValue("appointmentDate", date); form.setValue("appointmentTime", "");
    if (!date || !db) return;
    setSlotsLoading(true);
    try {
        const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);
        const q = query(collection(db, "consultations"), where("doctorId", "==", doctorId), where("appointmentTime", ">=", Timestamp.fromDate(startOfDay)), where("appointmentTime", "<=", Timestamp.fromDate(endOfDay)));
        const querySnapshot = await getDocs(q);
        const existing = querySnapshot.docs.map(doc => doc.data().appointmentTime as Timestamp);
        const newSlots = generateTimeSlots(date, availability, existing);
        setTimeSlots(newSlots);
    } catch (err) { toast({ title: "Error", description: "Could not fetch time slots.", variant: "destructive"}); } finally { setSlotsLoading(false); }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const user = auth?.currentUser;
    if (!user || !db || !doctor) {
        toast({ title: "Error", description: "Authentication error. Please log in again.", variant: "destructive" });
        return;
    }

    try {
        const { appointmentDate, appointmentTime, reason } = values;
        const appointmentTimestamp = Timestamp.fromDate(new Date(`${appointmentDate}T${appointmentTime}`));
        const patientDoc = await getDoc(doc(db, 'patients', user.uid));
        const patientName = patientDoc.exists() ? patientDoc.data().fullName : user.email;

        await addDoc(collection(db, 'consultations'), {
            doctorId: doctorId,
            doctorName: doctor.fullName,
            patientId: user.uid,
            patientName: patientName,
            appointmentTime: appointmentTimestamp,
            reason: reason,
            status: 'upcoming',
            createdAt: serverTimestamp(),
        });

        toast({ title: "Booking Successful!", description: `Your appointment with Dr. ${doctor.fullName} is confirmed.` });
        router.push('/patient/dashboard');

    } catch (err: any) {
        console.error("Booking failed:", err);
        toast({ title: "Booking Failed", description: `An unexpected error occurred: ${err.message}`, variant: "destructive" });
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500"><AlertTriangle className="mr-2"/> {error}</div>;
  if (!doctor) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Book Appointment with Dr. {doctor.fullName}</CardTitle>
          <CardDescription>{doctor.specialization}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="appointmentDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. Select an Available Date</FormLabel>
                    <FormControl><Input type="date" min={new Date().toISOString().split('T')[0]} {...field} onChange={(e) => handleDateChange(e.target.value)} /></FormControl>
                    <FormMessage />
                  </FormItem>)}
              />

              {form.watch("appointmentDate") && (
                  <FormField control={form.control} name="appointmentTime" render={({ field }) => (
                        <FormItem>
                            <FormLabel>2. Select an Available Time</FormLabel>
                            {slotsLoading ? (
                                <div className="flex items-center space-x-2"><Loader2 className="h-5 w-5 animate-spin"/> <p>Loading slots...</p></div>
                            ) : timeSlots.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2 pt-2">
                                    {timeSlots.map(slot => (<Button key={slot} type="button" variant={field.value === slot ? "default" : "outline"} onClick={() => field.onChange(slot)}>{slot}</Button>))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 pt-2">No available slots on this day. Please select another date.</p>
                            )}
                             <FormMessage />
                        </FormItem>)}
                  />
              )}

              <FormField control={form.control} name="reason" render={({ field }) => (
                  <FormItem>
                    <FormLabel>3. Reason for Consultation</FormLabel>
                    <FormControl><Textarea placeholder="Describe your symptoms or reason for visit..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>)}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isValid}>
                {form.formState.isSubmitting ? 'Confirming Booking...' : 'Confirm Booking'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
