'use client';

import { useState, useMemo } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindow } from '@react-google-maps/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

// UI Components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ['places'];

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  issue: z.string().min(10, "Please describe your issue in at least 10 characters."),
  doctorName: z.string().optional(), // New field for the doctor's name
  callType: z.enum(['video', 'voice', 'in-person'], { required_error: "Please select a call type." }),
  callNow: z.boolean().default(false),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
}).refine(data => {
    if (!data.callNow) return !!data.appointmentDate && !!data.appointmentTime;
    return true;
}, { message: "Date and time are required for scheduled calls.", path: ["appointmentDate"] });

export default function MapPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const router = useRouter();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const bookingForm = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { name: '', phone: '', issue: '', doctorName: '', callType: 'video', callNow: false, appointmentDate: '', appointmentTime: '' },
  });

  const callNow = bookingForm.watch('callNow');

  const hospitals = [
    { id: 1, name: 'Sadar Hospital, Hazaribagh', address: 'Hazaribagh, Jharkhand', lat: 23.99, lng: 85.36, specialties: 'General, Maternity', timing: '24/7', contact: '104', state: 'Jharkhand', district: 'Hazaribagh', village: 'Hazaribagh', doctors: [{name: 'Dr. Ramesh Kumar', specialization: 'General Physician'}, {name: 'Dr. Priya Singh', specialization: 'Gynecologist'}]}, 
    { id: 2, name: 'Community Health Center, Ichak', address: 'Ichak, Hazaribagh, Jharkhand', lat: 24.08, lng: 85.38, specialties: 'Primary Care', timing: '9 AM - 5 PM', contact: '104', state: 'Jharkhand', district: 'Hazaribagh', village: 'Ichak', doctors: [{name: 'Dr. Alok Verma', specialization: 'Primary Care'}]},
    { id: 9, name: 'Rural Hospital, Khed', address: 'Khed, Pune, Maharashtra', lat: 18.75, lng: 73.86, specialties: 'General Medicine, Maternity', timing: '24/7', contact: '104', state: 'Maharashtra', district: 'Pune', village: 'Khed', doctors: [{name: 'Dr. Suresh Patil', specialization: 'General Medicine'}, {name: 'Dr. Meena Desai', specialization: 'Obstetrician'}] },
    { id: 10, name: 'Sub-District Hospital, Baramati', address: 'Baramati, Pune, Maharashtra', lat: 18.15, lng: 74.58, specialties: 'Surgery, Pediatrics', timing: '24/7 Emergency', contact: '104', state: 'Maharashtra', district: 'Pune', village: 'Baramati', doctors: [{name: 'Dr. Vikram Rathod', specialization: 'General Surgeon'}, {name: 'Dr. Anjali Joshi', specialization: 'Pediatrician'}] },
  ];

  const filteredDistricts = useMemo(() => Array.from(new Set(hospitals.filter(h => h.state === selectedState).map(h => h.district))), [selectedState, hospitals]);
  const filteredVillages = useMemo(() => Array.from(new Set(hospitals.filter(h => h.district === selectedDistrict).map(h => h.village))), [selectedDistrict, hospitals]);
  const filteredHospitals = useMemo(() => {
    let result = hospitals.filter(h => h.state === selectedState);
    if (selectedDistrict) result = result.filter(h => h.district === selectedDistrict);
    if (selectedVillage) result = result.filter(h => h.village === selectedVillage);
    return result;
  }, [selectedState, selectedDistrict, selectedVillage, hospitals]);

  const mapCenter = useMemo(() => {
    if (selectedHospital) return { lat: selectedHospital.lat, lng: selectedHospital.lng };
    if (filteredHospitals.length > 0) return { lat: filteredHospitals[0].lat, lng: filteredHospitals[0].lng };
    return { lat: 19.7515, lng: 75.7139 };
  }, [selectedHospital, filteredHospitals]);

  async function onBookingSubmit(values: z.infer<typeof bookingSchema>) {
    if (!selectedHospital) {
      toast({ title: "No Hospital Selected", description: "Please select a hospital before booking.", variant: "destructive" });
      return;
    }
    const bookingDetails = { ...values, hospitalName: selectedHospital.name, hospitalAddress: selectedHospital.address };
    console.log("Booking Request Details:", bookingDetails);
    if (values.callNow) {
      toast({ title: "Starting Emergency Call...", description: `Connecting you to ${selectedHospital.name}.` });
      router.push('/video-call');
    } else {
      localStorage.setItem('scheduledCall', JSON.stringify(bookingDetails));
      toast({ title: "Appointment Scheduled", description: `Your appointment at ${selectedHospital.name} is booked.` });
      bookingForm.reset();
    }
  }

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="flex flex-col h-screen">
      <div className="grid md:grid-cols-4 flex-grow min-h-0">
        {/* Desktop sidebar */}
        <div className="col-span-1 p-4 bg-gray-100 dark:bg-gray-800 overflow-y-auto hidden md:block relative z-30">
          <h2 className="text-xl font-bold mb-4">Find a Hospital</h2>
          <div className="space-y-4">
            <Select value={selectedState} onValueChange={setSelectedState}><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger><SelectContent><SelectItem value="Maharashtra">Maharashtra</SelectItem><SelectItem value="Jharkhand">Jharkhand</SelectItem></SelectContent></Select>
            <Select value={selectedDistrict || ''} onValueChange={d => { setSelectedDistrict(d); setSelectedVillage(null); setSelectedHospital(null); }}><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger><SelectContent>{filteredDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            <Select value={selectedVillage || ''} onValueChange={v => {setSelectedVillage(v); setSelectedHospital(null);}}><SelectTrigger><SelectValue placeholder="Select Village" /></SelectTrigger><SelectContent>{filteredVillages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="mt-6">
            <h3 className="font-bold">Hospitals Found ({filteredHospitals.length})</h3>
            <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">{filteredHospitals.map(h => <li key={h.id} onClick={() => setSelectedHospital(h)} className={`p-2 rounded-md cursor-pointer ${selectedHospital?.id === h.id ? 'bg-blue-200 dark:bg-blue-800' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><p className="font-semibold">{h.name}</p><p className="text-sm text-gray-600 dark:text-gray-400">{h.address}</p></li>)}</ul>
          </div>
        </div>

        {/* Map area */}
        <div className="col-span-3 h-[50vh] md:h-full min-h-[200px] md:min-h-[400px] relative">
          {/* Mobile filter toggle */}
          <div className="absolute top-4 left-4 z-40 md:hidden">
            <Button variant="secondary" size="sm" onClick={() => setMobileFiltersOpen(true)}>Filters</Button>
          </div>

          <GoogleMap mapContainerClassName="w-full h-full" center={mapCenter} zoom={12}>
            {filteredHospitals.map(h => <MarkerF key={h.id} position={{ lat: h.lat, lng: h.lng }} onClick={() => setSelectedHospital(h)} />)}
            {selectedHospital && 
              <InfoWindow position={{ lat: selectedHospital.lat, lng: selectedHospital.lng }} onCloseClick={() => setSelectedHospital(null)}>
                <Card className="max-w-sm">
                  <CardHeader><CardTitle>{selectedHospital.name}</CardTitle><CardDescription>{selectedHospital.address}</CardDescription></CardHeader>
                  <CardContent className="text-sm">
                    <p><strong>Specialties:</strong> {selectedHospital.specialties}</p>
                    <p><strong>Timing:</strong> {selectedHospital.timing}</p>
                    <p><strong>Contact:</strong> {selectedHospital.contact}</p>
                    <div className="mt-2 pt-2 border-t">
                        <h4 className="font-bold">Doctors Available:</h4>
                        {selectedHospital.doctors && selectedHospital.doctors.length > 0 ? (
                            <ul className="list-disc list-inside">{selectedHospital.doctors.map((doc: any, i: number) => <li key={i}>{doc.name} ({doc.specialization})</li>)}</ul>
                        ) : <p>No doctors listed.</p>}
                    </div>
                  </CardContent>
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
              <Select value={selectedState} onValueChange={setSelectedState}><SelectTrigger className="w-full"><SelectValue placeholder="Select State" /></SelectTrigger><SelectContent><SelectItem value="Maharashtra">Maharashtra</SelectItem><SelectItem value="Jharkhand">Jharkhand</SelectItem></SelectContent></Select>
              <Select value={selectedDistrict || ''} onValueChange={d => { setSelectedDistrict(d); setSelectedVillage(null); setSelectedHospital(null); }}><SelectTrigger className="w-full"><SelectValue placeholder="Select District" /></SelectTrigger><SelectContent>{filteredDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
              <Select value={selectedVillage || ''} onValueChange={v => {setSelectedVillage(v); setSelectedHospital(null);}}><SelectTrigger className="w-full"><SelectValue placeholder="Select Village" /></SelectTrigger><SelectContent>{filteredVillages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
              <div className="mt-2">
                <h3 className="font-bold">Hospitals Found ({filteredHospitals.length})</h3>
                <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">{filteredHospitals.map(h => <li key={h.id} onClick={() => { setSelectedHospital(h); setMobileFiltersOpen(false); }} className={`p-2 rounded-md cursor-pointer ${selectedHospital?.id === h.id ? 'bg-blue-200 dark:bg-blue-800' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><p className="font-semibold">{h.name}</p><p className="text-sm text-gray-600 dark:text-gray-400">{h.address}</p></li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full p-4 sm:p-6 bg-white dark:bg-gray-900 border-t relative z-30">
        <Card className="max-w-6xl mx-auto">
            <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                {selectedHospital ? 
                    <CardDescription>You are booking for: <span className="font-bold text-primary">{selectedHospital.name}</span>.</CardDescription> :
                    <CardDescription>Please select a hospital from the list to activate the booking form.</CardDescription>
                }
            </CardHeader>
            <CardContent>
                <Form {...bookingForm}>
                    <form onSubmit={bookingForm.handleSubmit(onBookingSubmit)} className="space-y-4">
                        <fieldset disabled={!selectedHospital} className="space-y-4">
                            <div className="grid sm:grid-cols-4 gap-4">
                                <FormField control={bookingForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={bookingForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={bookingForm.control} name="issue" render={({ field }) => (<FormItem><FormLabel>Health Issue</FormLabel><FormControl><Input placeholder="Briefly describe your issue" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={bookingForm.control} name="doctorName" render={({ field }) => (<FormItem><FormLabel>Doctor&apos;s Name (Optional)</FormLabel><FormControl><Input placeholder="Enter doctor name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4 items-end">
                               <FormField control={bookingForm.control} name="callType" render={({ field }) => (<FormItem><FormLabel>Call Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select call type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="video">Video Call</SelectItem><SelectItem value="voice">Voice Call</SelectItem><SelectItem value="in-person">In-Person</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={bookingForm.control} name="callNow" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 h-fit"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Urgent: Call Now</FormLabel></div></FormItem>)} />
                                {!callNow && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={bookingForm.control} name="appointmentDate" render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={bookingForm.control} name="appointmentTime" render={({ field }) => (<FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                )}
                            </div>
                        </fieldset>
                        <div className="flex justify-end">
                           <Button type="submit" size="lg" disabled={!selectedHospital || bookingForm.formState.isSubmitting}>
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
