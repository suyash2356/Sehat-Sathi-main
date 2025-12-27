'use client';

import { useState, useMemo, useEffect } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindow } from '@react-google-maps/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// UI Components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { encryptData } from '@/lib/encryption';
import {
  BadgeCheck,
  MapPin,
  Search,
  Phone,
  Calendar,
  Video,
  Mic,
  User as UserIcon,
  BotMessageSquare,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ['places'];

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  issue: z.string().min(10, "Please describe your issue in at least 10 characters."),
  age: z.coerce.number().min(1, "Age must be at least 1.").max(120, "Please enter a valid age."),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Please select a gender." }),
  doctorName: z.string().optional(),
  doctorId: z.string().optional(),
  callType: z.enum(['video', 'voice', 'in-person'], { required_error: "Please select a call type." }),
  callNow: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
}).refine(data => {
  if (!data.callNow) return !!data.appointmentDate && !!data.appointmentTime;
  return true;
}, { message: "Date and time are required for scheduled calls.", path: ["appointmentDate"] });

interface Doctor {
  id: string; // The Firestore Document ID (uid)
  name: string;
  email: string;
  hospitalLocation?: { lat: number; lng: number };
  isVerified: boolean;
  availability?: { dates: string[]; timeSlots: string[] };
  specialization?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  state?: string;
  district?: string;
  village?: string;
  contact?: string; // Add contact property
  verificationLevel?: number;
}

// Helper to convert Doctor to the shape used by the UI (combining doctor & hospital info)
interface MapItem extends Doctor {
  lat: number;
  lng: number;
  address: string;
}

import { locationData, governmentHospitals } from '@/lib/location-data';

// ... (imports remain same)

export default function MapPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const router = useRouter();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');

  // Doctors state
  const [doctors, setDoctors] = useState<MapItem[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState<MapItem | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const bookingForm = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: '', phone: '', issue: '', age: 0, gender: 'male', doctorName: '', doctorId: '', callType: 'video', callNow: false, isPrivate: false, appointmentDate: '', appointmentTime: '' },
  });

  const callNow = bookingForm.watch('callNow');
  const isPrivate = bookingForm.watch('isPrivate');

  // Listen for Auth Logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch doctors from Firestore
  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoadingDoctors(true);
        const doctorsRef = collection(db, 'doctors');
        // Filter by isVerified == true
        const q = query(doctorsRef, where('isVerified', '==', true));
        const snapshot = await getDocs(q);

        const fetchedDoctors: MapItem[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          // Allow doctor even if location is missing (fallback to default)
          const fallbackLat = 20.5937;
          const fallbackLng = 78.9629;

          fetchedDoctors.push({
            id: doc.id,
            name: data.fullName || data.name || 'Unknown Doctor', // Support both naming conventions
            email: data.email,
            hospitalLocation: data.hospitalLocation || { lat: fallbackLat, lng: fallbackLng },
            lat: data.hospitalLocation?.lat || fallbackLat,
            lng: data.hospitalLocation?.lng || fallbackLng,
            isVerified: data.isVerified,
            availability: data.availability || { dates: [], timeSlots: [] },
            specialization: data.specialization || 'General',
            hospitalName: data.hospitalName || 'Clinic',
            hospitalAddress: data.hospitalAddress || `${data.village || ''}, ${data.district || ''}, ${data.state || ''}`,
            address: data.hospitalAddress || `${data.village || ''}, ${data.district || ''}, ${data.state || ''}`,
            state: data.state || 'Maharashtra',
            district: data.district,
            village: data.village,
            contact: data.contact || "N/A",
          });
        });

        // Add government hospitals to the list
        const allMedicalFacilities = [...fetchedDoctors, ...governmentHospitals as unknown as MapItem[]];
        setDoctors(allMedicalFacilities); // Error: fetchedDoctors + gov hospitals
        // Type mismatch fix: MapItem vs mock data. Mock data needs to conform to MapItem.
        // Let's just cast for now as the shapes are compatible manually.
        const govHospitalsMapped = governmentHospitals.map(h => ({
          ...h,
          contact: "0000000000", // Default contact for hospitals
          email: "info@gov.in",
          address: h.hospitalAddress || "Government Hospital",
          availability: { dates: [], timeSlots: [] }
        })) as MapItem[];

        setDoctors([...fetchedDoctors, ...govHospitalsMapped]);

      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast({ title: "Error", description: "Failed to load doctors.", variant: "destructive" });
      } finally {
        setLoadingDoctors(false);
      }
    }
    fetchDoctors();
  }, [toast]);


  // Filter Logic
  const filteredDoctors = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');

    return doctors.filter(doc => {
      // Verification check (already done in query, but good to be safe)
      if (!doc.isVerified) return false;

      // Location filtering
      if (selectedState && selectedState !== 'all' && doc.state !== selectedState) return false;
      if (selectedDistrict && selectedDistrict !== 'all' && doc.district !== selectedDistrict) return false;
      if (selectedVillage && selectedVillage !== 'all' && doc.village !== selectedVillage) return false;

      return true;
    });
  }, [doctors, selectedState, selectedDistrict, selectedVillage]);

  // Extract unique locations for dropdowns based on STATIC DATA
  const availableStates = Object.keys(locationData);

  // Dependent dropdowns
  const availableDistricts = useMemo(() => {
    if (!selectedState || selectedState === 'all') return [];
    return (locationData as any)[selectedState] ? Object.keys((locationData as any)[selectedState]) : [];
  }, [selectedState]);

  const availableVillages = useMemo(() => {
    if (!selectedState || selectedState === 'all' || !selectedDistrict || selectedDistrict === 'all') return [];
    const stateData = (locationData as any)[selectedState];
    return stateData[selectedDistrict] || [];
  }, [selectedState, selectedDistrict]);

  const mapCenter = useMemo(() => {
    if (selectedDoctor) return { lat: selectedDoctor.lat, lng: selectedDoctor.lng };
    if (filteredDoctors.length > 0) return { lat: filteredDoctors[0].lat, lng: filteredDoctors[0].lng };
    return { lat: 20.5937, lng: 78.9629 }; // India center
  }, [selectedDoctor, filteredDoctors]);

  async function onBookingSubmit(values: z.infer<typeof bookingSchema>) {
    if (!selectedDoctor) {
      toast({ title: "No Doctor Selected", description: "Please select a doctor/hospital before booking.", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Login Required", description: "You must be logged in to book an appointment.", variant: "destructive" });
      return;
    }

    // Determine status and type
    const isCallNow = values.callNow;
    const appointmentType = isCallNow
      ? "video_call_immediate"
      : (values.callType === 'in-person' ? 'in_person' : 'video_scheduled'); // Defaulting voice to video_scheduled or handled same

    const status = "pending";

    // Calculate scheduled time
    let scheduledTimeTimestamp = Timestamp.now();
    if (!isCallNow && values.appointmentDate && values.appointmentTime) {
      const dateTimeString = `${values.appointmentDate}T${values.appointmentTime}`;
      scheduledTimeTimestamp = Timestamp.fromDate(new Date(dateTimeString));
    }

    const bookingDetails = {
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      patientId: user.uid,
      // Standardized Schema matching BookAppointmentPage
      patientDetails: {
        name: values.isPrivate ? "Private Patient" : values.name,
        age: Number(values.age),
        gender: values.gender,
        disease: encryptData(values.issue),
        phone: encryptData(values.phone)
      },
      status: status,
      mode: isCallNow ? 'video' : (values.callType === 'in-person' ? 'visit' : 'video'), // Align mode
      timing: isCallNow ? 'call_now' : 'scheduled',
      scheduledTime: scheduledTimeTimestamp,
      createdAt: Timestamp.now(),

      // Legacy/Extra fields (Optional but kept for reference if rules allow)
      doctorSpecialization: selectedDoctor.specialization,
      hospitalName: selectedDoctor.hospitalName,
      hospitalAddress: selectedDoctor.hospitalAddress,
      isPrivatePatient: values.isPrivate
    };



    try {
      const docRef = await addDoc(collection(db, 'appointments'), bookingDetails);

      if (isCallNow) {
        toast({ title: "Request Sent", description: "Your immediate call request has been sent. Please wait for the doctor to accept." });
        // Removed redirect to dashboard to keep user on map page
      } else {
        toast({ title: "Request Sent", description: "Appointment scheduled. Waiting for doctor's approval." });
        // Removed redirect to dashboard
        bookingForm.reset();
      }
    } catch (e) {
      console.error("Error creating appointment:", e);
      toast({ title: "Error", description: "Failed to create appointment.", variant: "destructive" });
    }
  }

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="flex flex-col h-screen">
      <div className="grid md:grid-cols-4 flex-grow min-h-0">
        {/* Desktop sidebar */}
        <div className="col-span-1 p-4 bg-gray-100 dark:bg-gray-800 overflow-y-auto hidden md:block relative z-30">
          <h2 className="text-xl font-bold mb-4">Find a Doctor</h2>
          <div className="space-y-4">
            {/* State Filter */}
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {availableStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* District Filter */}
            <Select value={selectedDistrict || ''} onValueChange={d => { setSelectedDistrict(d); setSelectedVillage(''); setSelectedDoctor(null); }}>
              <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {availableDistricts.length > 0 ? availableDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>) : <SelectItem value="none" disabled>Select State First</SelectItem>}
              </SelectContent>
            </Select>

            {/* Village Filter */}
            <Select value={selectedVillage || ''} onValueChange={v => { setSelectedVillage(v); setSelectedDoctor(null); }}>
              <SelectTrigger><SelectValue placeholder="Select Village" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Villages</SelectItem>
                {availableVillages.length > 0 ? availableVillages.map((v: string) => <SelectItem key={v} value={v}>{v}</SelectItem>) : <SelectItem value="none" disabled>Select District First</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-6">
            <h3 className="font-bold">Doctors Found ({filteredDoctors.length})</h3>
            {loadingDoctors ? <p>Loading...</p> : (
              <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {filteredDoctors.map(doc => (
                  <li key={doc.id} onClick={() => setSelectedDoctor(doc)} className={`p-2 rounded-md cursor-pointer ${selectedDoctor?.id === doc.id ? 'bg-blue-200 dark:bg-blue-800' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold">{doc.name}</p>
                      {doc.verificationLevel === 3 && (
                        <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-50" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{doc.specialization} - {doc.hospitalName}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Map area */}
        <div className="col-span-3 h-[50vh] md:h-full min-h-[200px] md:min-h-[400px] relative">
          {/* Mobile filter toggle */}
          <div className="absolute top-4 left-4 z-40 md:hidden">
            <Button variant="secondary" size="sm" onClick={() => setMobileFiltersOpen(true)}>Filters</Button>
          </div>

          <GoogleMap mapContainerClassName="w-full h-full" center={mapCenter} zoom={10}>
            {filteredDoctors.map(doc => (
              <MarkerF key={doc.id} position={{ lat: doc.lat, lng: doc.lng }} onClick={() => setSelectedDoctor(doc)} />
            ))}
            {selectedDoctor &&
              <InfoWindow position={{ lat: selectedDoctor.lat, lng: selectedDoctor.lng }} onCloseClick={() => setSelectedDoctor(null)}>
                <Card className="max-w-sm border-none shadow-none text-black">
                  <div className="p-2">
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-lg">{selectedDoctor.name}</h3>
                      {selectedDoctor.verificationLevel === 3 && (
                        <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-50" />
                      )}
                    </div>
                    <p className="text-sm font-semibold">{selectedDoctor.specialization}</p>
                    <p className="text-sm">{selectedDoctor.hospitalName}</p>
                    <p className="text-sm text-gray-600">{selectedDoctor.address}</p>
                    {selectedDoctor.availability?.timeSlots?.length ? (
                      <p className="text-xs text-green-600 mt-1">Has availability today</p>
                    ) : null}
                  </div>
                </Card>
              </InfoWindow>}
          </GoogleMap>
        </div>
      </div>

      {/* Mobile filters overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute top-12 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Filters</h2>
              <Button variant="ghost" size="sm" onClick={() => setMobileFiltersOpen(false)}>Close</Button>
            </div>
            <div className="space-y-4">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {availableStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {/* Add other mobile filters similarly */}
              <div className="mt-2">
                <h3 className="font-bold">Doctors Found ({filteredDoctors.length})</h3>
                <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {filteredDoctors.map(doc => (
                    <li key={doc.id} onClick={() => { setSelectedDoctor(doc); setMobileFiltersOpen(false); }} className={`p-2 rounded-md cursor-pointer ${selectedDoctor?.id === doc.id ? 'bg-blue-200 dark:bg-blue-800' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                      <p className="font-semibold">{doc.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{doc.specialization}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full p-4 sm:p-6 bg-white dark:bg-gray-900 border-t relative z-30">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Book Appointment</CardTitle>
            {selectedDoctor ?
              <CardDescription className="flex items-center gap-1">
                Booking with: <span className="font-bold text-primary">{selectedDoctor.name}</span>
                {selectedDoctor.verificationLevel === 3 && (
                  <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-50" />
                )}
                ({selectedDoctor.specialization})
              </CardDescription> :
              <CardDescription>Select a doctor on the map to start booking.</CardDescription>
            }
          </CardHeader>
          <CardContent>
            <Form {...bookingForm}>
              <form onSubmit={bookingForm.handleSubmit(onBookingSubmit)} className="space-y-4">
                <fieldset disabled={!selectedDoctor} className="space-y-4">
                  <div className="grid sm:grid-cols-5 gap-4">
                    <FormField control={bookingForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={bookingForm.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="25" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={bookingForm.control} name="gender" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={bookingForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={bookingForm.control} name="issue" render={({ field }) => (<FormItem><FormLabel>Health Issue</FormLabel><FormControl><Input placeholder="Describe symptoms" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    {/* Hidden doctor ID field */}
                    <FormField control={bookingForm.control} name="doctorId" render={({ field }) => (<FormItem className="hidden"><FormControl><Input {...field} value={selectedDoctor?.id || ''} /></FormControl></FormItem>)} />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 items-end">
                    <FormField control={bookingForm.control} name="callType" render={({ field }) => (<FormItem><FormLabel>Call Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select call type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="video">Video Call</SelectItem><SelectItem value="voice">Voice Call</SelectItem><SelectItem value="in-person">In-Person</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={bookingForm.control} name="callNow" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 h-fit"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Urgent: Call Now</FormLabel></div></FormItem>)} />
                    <FormField control={bookingForm.control} name="isPrivate" render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 h-fit border-blue-200 bg-blue-50/30 dark:bg-blue-900/10">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-blue-700 dark:text-blue-300">Privacy Mode</FormLabel>
                          <p className="text-[10px] text-blue-600/80">Doctor won't see your real name.</p>
                        </div>
                      </FormItem>
                    )} />
                    {!callNow && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={bookingForm.control} name="appointmentDate" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={bookingForm.control} name="appointmentTime" render={({ field }) => (<FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                    )}
                  </div>
                </fieldset>
                <div className="flex justify-end">
                  <Button type="submit" size="lg" disabled={!selectedDoctor || bookingForm.formState.isSubmitting}>
                    {callNow ? 'Start Emergency Call' : 'Schedule Appointment'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
