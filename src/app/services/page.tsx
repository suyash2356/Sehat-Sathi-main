'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HeartPulse, ShieldCheck, Baby, ShieldPlus, Syringe, Activity, Search, Map, Phone, Briefcase, Calendar, Pin } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { states } from '@/lib/states-districts';
import GoogleMapEmbed, { Hospital } from '@/components/services/GoogleMapEmbed';
import { useToast } from '@/hooks/use-toast';

const initiativeIcons = [
  <HeartPulse key="ayushman" className="h-8 w-8 text-primary" />,
  <ShieldCheck key="mission" className="h-8 w-8 text-primary" />,
  <Baby key="matru" className="h-8 w-8 text-primary" />,
  <ShieldPlus key="jssk" className="h-8 w-8 text-primary" />,
  <Syringe key="rbsk" className="h-8 w-8 text-primary" />,
  <Activity key="ntcp" className="h-8 w-8 text-primary" />,
];

const filterSchema = z.object({
  age: z.coerce.number().min(0, { message: 'Age must be a positive number.' }).max(120),
  gender: z.enum(['male', 'female', 'other']),
  state: z.string().min(1, { message: 'Please select your state.' }),
  district: z.string().min(1, { message: 'Please select your district.' }),
});

const bookingSchema = z.object({
    name: z.string().min(1, { message: "Full name is required"}),
    phone: z.string().min(10, { message: "A valid 10-digit phone number is required"}).max(10),
    issue: z.string().min(1, { message: "Please describe your health issue"}),
});

type FilterValues = z.infer<typeof filterSchema>;
type BookingValues = z.infer<typeof bookingSchema>;
type Initiative = (typeof translations.en.services.initiatives)[0] & { icon: ReactNode };

export default function ServicesPage() {
  const { language } = useChatLanguage();
  const { toast } = useToast();
  const t = translations[language].services;

  const [filteredInitiatives, setFilteredInitiatives] = useState<Initiative[]>([]);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [districts, setDistricts] = useState<string[]>([]);

  const allInitiatives: Initiative[] = t.initiatives.map((initiative, index) => ({
    ...initiative,
    icon: initiativeIcons[index],
  }));

  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      age: 18,
      gender: 'female',
      state: 'Maharashtra',
      district: '',
    },
  });
  
  const bookingForm = useForm<BookingValues>({
      resolver: zodResolver(bookingSchema),
      defaultValues: {
          name: '',
          phone: '',
          issue: '',
      },
  });

  const selectedState = filterForm.watch('state');

  useEffect(() => {
    const stateData = states.find(s => s.state === selectedState);
    if (stateData) {
      setDistricts(stateData.districts);
      filterForm.setValue('district', '');
    } else {
      setDistricts([]);
    }
  }, [selectedState, filterForm]);
  
  useEffect(() => {
    const defaultStateData = states.find(s => s.state === filterForm.getValues('state'));
    if (defaultStateData) {
      setDistricts(defaultStateData.districts);
    }
  }, []);

  function onFilterSubmit(values: FilterValues) {
    const { age, gender } = values;
    const results = allInitiatives.filter(initiative => {
        if (!initiative.criteria) return false;
      const { minAge, maxAge, applicableGender } = initiative.criteria;
      const ageMatch = age >= minAge && age <= maxAge;
      const genderMatch = applicableGender === 'all' || applicableGender === gender;
      return ageMatch && genderMatch;
    });
    setFilteredInitiatives(results);
    setIsFilterActive(true);
    setIsFilterDialogOpen(false);
  }
  
  function onBookingSubmit(values: BookingValues) {
    console.log("Booking request:", { ...values, hospital: selectedHospital?.name });
    toast({
        title: t.bookingToastTitle,
        description: t.bookingToastDescription,
    });
    setIsBookingDialogOpen(false);
    bookingForm.reset();
  }

  const handleResetFilters = () => {
    setIsFilterActive(false);
    setFilteredInitiatives([]);
    filterForm.reset({
      age: 18,
      gender: 'female',
      state: 'Maharashtra',
      district: '',
    });
  }
  
  const handleBookAppointment = (hospital: Hospital) => {
      setSelectedHospital(hospital);
      setIsBookingDialogOpen(true);
  }

  const displayedInitiatives = isFilterActive ? filteredInitiatives : allInitiatives;

  const mapTranslations = {
      specialties: t.mapSpecialties,
      timings: t.mapTimings,
      contact: t.mapContact,
      bookAppointment: t.mapButton,
  };

  return (
    <div className="container py-12 md:py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.subtitle}
            </p>
        </div>

        {/* Hospital Locator Section */}
        <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-headline mb-4 flex items-center gap-3"><Map className="h-7 w-7 text-primary"/> {t.locatorTitle}</h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">{t.locatorDescription}</p>
            <Card className="shadow-lg overflow-hidden">
                <GoogleMapEmbed hospitals={t.hospitals} onBookAppointment={handleBookAppointment} translations={mapTranslations} />
            </Card>
        </div>

        {/* Initiatives Section */}
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.initiativesTitle}</h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.initiativesSubtitle}
            </p>
        </div>
        
        <Card className="mb-12 shadow-lg bg-card">
            <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <Search className="h-6 w-6 text-primary"/>
                {t.myServicesTitle}
            </CardTitle>
            <CardDescription>
                {t.myServicesDescription}
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                <DialogTrigger asChild>
                <Button>{t.myServicesButton}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t.myServicesFormTitle}</DialogTitle>
                </DialogHeader>
                <Form {...filterForm}>
                    <form onSubmit={filterForm.handleSubmit(onFilterSubmit)} className="space-y-6">
                        <FormField control={filterForm.control} name="age" render={({ field }) => (<FormItem><FormLabel>{t.myServicesFormAge}</FormLabel><FormControl><Input type="number" placeholder="Your age" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={filterForm.control} name="gender" render={({ field }) => (<FormItem><FormLabel>{t.myServicesFormGender}</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">{t.myServicesFormGenderFemale}</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">{t.myServicesFormGenderMale}</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">{t.myServicesFormGenderOther}</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={filterForm.control} name="state" render={({ field }) => (<FormItem><FormLabel>{t.myServicesFormState}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger></FormControl><SelectContent>{states.map(state => (<SelectItem key={state.state} value={state.state}>{state.state}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={filterForm.control} name="district" render={({ field }) => (<FormItem><FormLabel>{t.myServicesFormDistrict}</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}><FormControl><SelectTrigger><SelectValue placeholder={selectedState ? "Select your district" : "Select a state first"} /></SelectTrigger></FormControl><SelectContent>{districts.map(district => (<SelectItem key={district} value={district}>{district}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <Button type="submit">{t.myServicesFormSubmit}</Button>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>
            </CardContent>
        </Card>
        
        {isFilterActive && (
            <div className="mb-8 flex justify-between items-center">
                <h2 className="text-xl font-bold font-headline">{t.myServicesResultsTitle}</h2>
                <Button variant="outline" onClick={handleResetFilters}>{t.myServicesResetButton}</Button>
            </div>
        )}

        <div className="space-y-6">
            {displayedInitiatives.map((initiative, index) => (
                <a href={initiative.url} key={index} target="_blank" rel="noopener noreferrer" className="block">
                <Card className="flex flex-col md:flex-row items-start shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 h-full">
                    <CardHeader className="p-4 md:p-6 flex-shrink-0">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            {initiative.icon}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0 md:pt-6">
                        <h3 className="font-headline text-lg font-semibold">{initiative.title}</h3>
                        <p className="text-muted-foreground mt-1">{initiative.description}</p>
                    </CardContent>
                </Card>
                </a>
            ))}
            {isFilterActive && displayedInitiatives.length === 0 && (
                <p className="text-center text-muted-foreground py-8">{t.myServicesNoResults}</p>
            )}
        </div>

        {/* Booking Dialog */}
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">{t.bookingTitle}</DialogTitle>
                    <CardDescription>{t.bookingDescription}</CardDescription>
                </DialogHeader>
                {selectedHospital && (
                     <div className="mt-4 space-y-4">
                        <div className="p-4 border rounded-lg bg-secondary/50">
                            <h4 className="font-semibold text-lg mb-3">{selectedHospital.name}</h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p className="flex items-start gap-2"><Pin className="h-4 w-4 mt-0.5 flex-shrink-0"/><span>{selectedHospital.address}</span></p>
                                <p className="flex items-center gap-2"><Briefcase className="h-4 w-4 flex-shrink-0"/>{selectedHospital.specialties}</p>
                                <p className="flex items-center gap-2"><Calendar className="h-4 w-4 flex-shrink-0"/>{selectedHospital.timing}</p>
                                <p className="flex items-center gap-2"><Phone className="h-4 w-4 flex-shrink-0"/>{selectedHospital.contact}</p>
                           </div>
                        </div>

                        <Form {...bookingForm}>
                            <form onSubmit={bookingForm.handleSubmit(onBookingSubmit)} className="space-y-4">
                                 <FormField control={bookingForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t.formNameLabel}</FormLabel><FormControl><Input placeholder={t.formNamePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                 <FormField control={bookingForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t.formPhoneLabel}</FormLabel><FormControl><Input placeholder={t.formPhonePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                 <FormField control={bookingForm.control} name="issue" render={({ field }) => (<FormItem><FormLabel>{t.formIssueLabel}</FormLabel><FormControl><Input placeholder={t.formIssuePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="submit" className="w-full">{t.bookingButton}</Button>
                            </form>
                        </Form>
                     </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
