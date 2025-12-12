'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useFirestore } from '@/hooks/use-firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, Save } from 'lucide-react';

// Data structure for a day's schedule
interface DaySchedule {
  day: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

// Generate time slots for dropdowns
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSchedulePage() {
  const { user, loading: isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize schedule structure
  useEffect(() => {
    const initialSchedule = daysOfWeek.map(day => ({
      day,
      isAvailable: false,
      startTime: '09:00',
      endTime: '17:00',
    }));
    setSchedule(initialSchedule);
  }, []);

  // Fetch existing schedule
  useEffect(() => {
    if (!user || !db) return;

    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const scheduleQuery = collection(db, 'doctors', user.uid, 'schedule');
        const querySnapshot = await getDocs(scheduleQuery);
        const fetchedData: { [key: string]: Partial<DaySchedule> } = {};
        querySnapshot.forEach(doc => {
          fetchedData[doc.id] = doc.data();
        });

        // Merge fetched data with initial schedule to ensure all days are present
        setSchedule(prevSchedule => prevSchedule.map(day => ({
          ...day,
          ...(fetchedData[day.day] || {}),
        })));
      } catch (error) {
        console.error("Error fetching schedule: ", error);
        toast({ title: "Error", description: "Could not fetch your schedule.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [user, db, toast]);

  const handleUpdate = (day: string, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => prev.map(s => (s.day === day ? { ...s, [field]: value } : s)));
  };

  const handleSaveSchedule = async () => {
    if (!user || !db) {
        toast({ title: "Error", description: "You must be logged in to save.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    try {
        const batch = writeBatch(db);
        schedule.forEach(daySchedule => {
            const docRef = doc(db, 'doctors', user.uid, 'schedule', daySchedule.day);
            batch.set(docRef, daySchedule);
        });
        await batch.commit();
        toast({ title: "Schedule Saved", description: "Your weekly availability has been updated successfully." });
    } catch (error: any) {
        console.error("Error saving schedule: ", error);
        toast({ title: "Save Failed", description: `An error occurred: ${error.message}`, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading || isUserLoading) {
      return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
              <Card className="max-w-4xl mx-auto">
                  <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                  <CardContent className="space-y-4">
                      {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </CardContent>
                   <CardFooter><Skeleton className="h-10 w-32 ml-auto" /></CardFooter>
              </Card>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center"><Clock className="mr-3 h-6 w-6 text-primary"/> Manage Your Weekly Schedule</CardTitle>
          <CardDescription>Set your standard availability for each day of the week. Patients will be able to book appointments during these times.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Alert>
              <AlertTitle>How it works</AlertTitle>
              <AlertDescription>Toggle the switch to mark a day as 'Available'. Then, select the start and end times for your consultations. This schedule will repeat weekly.</AlertDescription>
          </Alert>
          
          <div className="space-y-4 rounded-lg border p-4">
              {schedule.map(daySchedule => (
                <div key={daySchedule.day} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-center gap-4 p-3 rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center space-x-4">
                        <Switch 
                            id={`available-${daySchedule.day}`}
                            checked={daySchedule.isAvailable}
                            onCheckedChange={checked => handleUpdate(daySchedule.day, 'isAvailable', checked)}
                            aria-label={`Availability for ${daySchedule.day}`}
                        />
                        <Label htmlFor={`available-${daySchedule.day}`} className="text-lg font-medium min-w-[100px]">{daySchedule.day}</Label>
                    </div>

                    {daySchedule.isAvailable ? (
                        <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                            {/* Start Time */}
                            <div>
                                <Label htmlFor={`start-${daySchedule.day}`} className="text-xs text-gray-500">Start Time</Label>
                                <Select value={daySchedule.startTime} onValueChange={value => handleUpdate(daySchedule.day, 'startTime', value)}>
                                  <SelectTrigger id={`start-${daySchedule.day}`} className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>

                            {/* End Time */}
                            <div>
                                <Label htmlFor={`end-${daySchedule.day}`} className="text-xs text-gray-500">End Time</Label>
                                <Select value={daySchedule.endTime} onValueChange={value => handleUpdate(daySchedule.day, 'endTime', value)}>
                                  <SelectTrigger id={`end-${daySchedule.day}`} className="w-full"><SelectValue /></SelectTrigger>
                                  <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    ) : (
                        <div className="col-span-1 md:col-span-2 text-center md:text-left">
                            <p className="text-sm text-gray-500 italic">Unavailable</p>
                        </div>
                    )}
                </div>
              ))}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-900/50 border-t px-6 py-4">
          <Button onClick={handleSaveSchedule} disabled={isSaving} size="lg" className="ml-auto">
            {isSaving ? 'Saving...' : <><Save className="mr-2 h-4 w-4"/> Save Schedule</>}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
