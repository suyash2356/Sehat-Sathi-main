'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/hooks/use-user';
import { useFirestore } from '@/hooks/use-firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, X, FileText, UserCircle, Save } from 'lucide-react';
import { uploadToSupabase } from '@/lib/supabase';
import { locationData } from '@/lib/location-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema Definitions
const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required.'),
  url: z.string().url('Invalid URL'),
  fileName: z.string(),
});

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  specialization: z.string().min(2, "Specialization is required."),
  state: z.string().min(1, "State is required."),
  district: z.string().min(1, "District is required."),
  village: z.string().min(1, "Village/Area is required."),
  experience: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return val;
  }, z.number().min(0, 'Experience cannot be negative.')),
  bio: z.string().max(500, "Bio cannot exceed 500 characters.").optional(),
  profilePicture: z.union([z.string().url(), z.literal('')]).optional(),
  certifications: z.array(documentSchema).optional(),
  licenses: z.array(documentSchema).optional(),
  isProfileComplete: z.boolean().optional(),
  // Prescription Template Fields
  qualification: z.string().min(2, "Qualification is required (e.g., MBBS, MD).").optional(),
  registrationNumber: z.string().min(2, "Registration Number is required.").optional(),
  consultationFee: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return val;
  }, z.number().min(0).optional()),
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  signatureUrl: z.string().optional(),
  stampUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function DoctorProfilePage() {
  const { user, loading: isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      specialization: '',
      state: '',
      district: '',
      village: '',
      experience: 0,
      bio: '',
      profilePicture: '',
      certifications: [],
      licenses: [],
      isProfileComplete: false,
      qualification: '',
      registrationNumber: '',
      consultationFee: 0,
      clinicName: '',
      clinicAddress: '',
      signatureUrl: '',
      stampUrl: '',
    },
  });

  // Watch for dependent dropdowns
  const selectedState = form.watch('state');
  const selectedDistrict = form.watch('district');

  const { fields: certifications, append: appendCertification, remove: removeCertification } = useFieldArray({ control: form.control, name: "certifications" });
  const { fields: licenses, append: appendLicense, remove: removeLicense } = useFieldArray({ control: form.control, name: "licenses" });

  const fetchProfile = useCallback(async () => {
    if (!user || !db) return;
    setIsLoading(true);
    try {
      const docRef = doc(db, 'doctors', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        form.reset({
          fullName: data.fullName || '',
          specialization: data.specialization || '',
          state: data.state || '',
          district: data.district || '',
          village: data.village || '',
          experience: data.experience || 0,
          bio: data.bio || '',
          profilePicture: data.profilePicture || '',
          certifications: data.certifications || [],
          licenses: data.licenses || [],
          isProfileComplete: data.isProfileComplete || false,
          qualification: data.qualification || '',
          registrationNumber: data.registrationNumber || data.licenseNumber || '',
          consultationFee: data.consultationFee || 0,
          clinicName: data.clinicName || data.hospitalName || '',
          clinicAddress: data.clinicAddress || data.hospitalAddress || '',
          signatureUrl: data.signatureUrl || '',
          stampUrl: data.stampUrl || '',
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ title: "Error", description: "Could not fetch your profile.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, db, form, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleDocumentUpload = async (file: File, type: 'certifications' | 'licenses') => {
    if (!user) return;
    setIsUploading(true);
    try {
      // Path construction: doctors/{uid}/{type}/{filename}
      // sanitize filename
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `doctors/${user.uid}/${type}/${safeName}`;

      const url = await uploadToSupabase(file, path);

      const docData = { name: file.name, url, fileName: file.name };
      if (type === 'certifications') appendCertification(docData);
      else appendLicense(docData);

      toast({ title: 'Upload successful', description: `${file.name} uploaded.` });
    } catch (error: any) {
      console.error('Upload failed', error);
      toast({ title: 'Upload Failed', description: error.message || "Check Supabase Config in .env.local", variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  }

  // Use the API key from env
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const getCoordinates = async (address: string) => {
    try {
      if (!GOOGLE_MAPS_API_KEY) {
        console.warn("No Google Maps API Key found");
        return null;
      }
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
      console.warn("Geocoding failed:", data.status);
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !db) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'doctors', user.uid);

      // Handle profile picture upload
      if (profilePictureFile) {
        const safeName = profilePictureFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `doctors/${user.uid}/profilePicture_${safeName}`;
        const photoURL = await uploadToSupabase(profilePictureFile, path);
        data.profilePicture = photoURL;
      }

      // Geocode the location
      const fullAddress = `${data.village}, ${data.district}, ${data.state}, India`;
      const coords = await getCoordinates(fullAddress);

      const saveData: any = {
        ...data,
        isProfileComplete: true,
      };

      if (coords) {
        saveData.hospitalLocation = coords;
        saveData.hospitalAddress = fullAddress; // Ensure this exists for MapPage
      } else {
        // Fallback if geocoding fails? Use some default or don't set it.
        // MapPage requires it, so maybe warn user?
        // For now, let's try to save even if null, maybe MapPage will update to handle it?
        // Or we can save a default?
        console.warn("Could not geocode address.");
      }

      await setDoc(docRef, saveData, { merge: true });
      toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Error", description: "Could not save your profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);

  const handleTemplateFileUpload = async (file: File, type: 'signature' | 'stamp') => {
    if (!user) return;
    setIsUploadingTemplate(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `doctors/${user.uid}/template/${type}_${safeName}`;
      const url = await uploadToSupabase(file, path);

      if (type === 'signature') form.setValue('signatureUrl', url);
      else form.setValue('stampUrl', url);

      toast({ title: 'Success', description: `${type === 'signature' ? 'Signature' : 'Stamp'} uploaded.` });
    } catch (error: any) {
      console.error('Upload failed', error);
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploadingTemplate(false);
    }
  };

  if (isLoading || isUserLoading) {
    return <div className="p-8"><Skeleton className="h-[500px] w-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.error("Validation Errors:", JSON.stringify(errors, null, 2)))} className="space-y-8 max-w-5xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label htmlFor="profile-picture-upload" className="cursor-pointer">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                    <AvatarImage src={form.watch('profilePicture')} alt="Profile picture" />
                    <AvatarFallback><UserCircle className="h-12 w-12" /></AvatarFallback>
                  </Avatar>
                  <Input id="profile-picture-upload" type="file" className="hidden" accept="image/*" onChange={e => { if (e.target.files) setProfilePictureFile(e.target.files[0]) }} />
                </label>
                <div>
                  <CardTitle className="text-3xl font-bold">Dr. {form.watch('fullName') || 'Your Name'}</CardTitle>
                  <CardDescription className="text-lg">{form.watch('specialization') || 'Your Specialization'}</CardDescription>
                </div>
              </div>
              <Button type="submit" disabled={isSaving || isUploading} size="lg" className="w-full sm:w-auto">
                <Save className="mr-2 h-5 w-5" /> {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardHeader>

            <CardContent className="pt-6">
              <Tabs defaultValue="personal">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <TabsTrigger value="personal">Personal Details</TabsTrigger>
                  <TabsTrigger value="template">Prescription Template</TabsTrigger>
                  <TabsTrigger value="certifications">Certifications</TabsTrigger>
                  <TabsTrigger value="licenses">Licenses</TabsTrigger>
                </TabsList>

                {/* Prescription Template Tab */}
                <TabsContent value="template" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="qualification" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Qualification</FormLabel>
                        <FormControl><Input placeholder="MBBS, MD (Cardiology)" {...field} /></FormControl>
                        <FormDescription>This will appear next to your name on prescriptions.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="registrationNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Registration No.</FormLabel>
                        <FormControl><Input placeholder="REG-123456" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="clinicName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic/Hospital Name (for Template)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="consultationFee" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fee (₹)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="clinicAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic/Hospital Address (for Template)</FormLabel>
                      <FormControl><Textarea {...field} rows={2} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Signature Upload */}
                    <div className="space-y-4">
                      <FormLabel>Digital Signature (Transparent PNG recommended)</FormLabel>
                      <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/20">
                        {form.watch('signatureUrl') ? (
                          <div className="relative w-full h-32 mb-4 bg-white rounded border flex items-center justify-center">
                            <img src={form.watch('signatureUrl')} alt="Signature" className="max-h-full max-w-full object-contain" />
                            <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => form.setValue('signatureUrl', '')}><X className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">No signature uploaded</p>
                          </div>
                        )}
                        <Input type="file" className="hidden" id="signature-upload" accept="image/*" onChange={(e) => { if (e.target.files) handleTemplateFileUpload(e.target.files[0], 'signature') }} disabled={isUploadingTemplate} />
                        <Button type="button" variant="outline" className="w-full" asChild disabled={isUploadingTemplate}>
                          <label htmlFor="signature-upload" className="cursor-pointer">
                            {isUploadingTemplate ? 'Uploading...' : 'Upload Signature'}
                          </label>
                        </Button>
                      </div>
                    </div>

                    {/* Stamp Upload */}
                    <div className="space-y-4">
                      <FormLabel>Clinic/Hospital Stamp (Optional)</FormLabel>
                      <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/20">
                        {form.watch('stampUrl') ? (
                          <div className="relative w-full h-32 mb-4 bg-white rounded border flex items-center justify-center">
                            <img src={form.watch('stampUrl')} alt="Stamp" className="max-h-full max-w-full object-contain" />
                            <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => form.setValue('stampUrl', '')}><X className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">No stamp uploaded</p>
                          </div>
                        )}
                        <Input type="file" className="hidden" id="stamp-upload" accept="image/*" onChange={(e) => { if (e.target.files) handleTemplateFileUpload(e.target.files[0], 'stamp') }} disabled={isUploadingTemplate} />
                        <Button type="button" variant="outline" className="w-full" asChild disabled={isUploadingTemplate}>
                          <label htmlFor="stamp-upload" className="cursor-pointer">
                            {isUploadingTemplate ? 'Uploading...' : 'Upload Stamp'}
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Personal Details Tab */}
                <TabsContent value="personal" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="specialization" render={({ field }) => <FormItem><FormLabel>Specialization</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={(val) => { field.onChange(val); form.setValue('district', ''); form.setValue('village', ''); }} defaultValue={field.value} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {Object.keys(locationData).map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="district" render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <Select onValueChange={(val) => { field.onChange(val); form.setValue('village', ''); }} defaultValue={field.value} value={field.value} disabled={!selectedState}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {selectedState && (locationData as any)[selectedState] && Object.keys((locationData as any)[selectedState]).map(dist => <SelectItem key={dist} value={dist}>{dist}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="village" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village/Area</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedDistrict}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select Area" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {selectedState && selectedDistrict && (locationData as any)[selectedState]?.[selectedDistrict]?.map((vil: string) => <SelectItem key={vil} value={vil}>{vil}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <FormField control={form.control} name="experience" render={({ field }) => <FormItem><FormLabel>Years of Experience</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="bio" render={({ field }) => <FormItem><FormLabel>Biography</FormLabel><FormControl><Textarea {...field} rows={5} placeholder="Tell patients a little about yourself..." /></FormControl><FormMessage /></FormItem>} />
                  </div>
                </TabsContent>

                {/* Certifications Tab */}
                <TabsContent value="certifications" className="mt-6">
                  <DocumentSection title="Certifications" documents={certifications} onUpload={(file) => handleDocumentUpload(file, 'certifications')} onRemove={removeCertification} isUploading={isUploading} />
                </TabsContent>

                {/* Licenses Tab */}
                <TabsContent value="licenses" className="mt-6">
                  <DocumentSection title="Licenses" documents={licenses} onUpload={(file) => handleDocumentUpload(file, 'licenses')} onRemove={removeLicense} isUploading={isUploading} />
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

// Helper component for document sections
function DocumentSection({ title, documents, onUpload, onRemove, isUploading }: {
  title: string;
  documents: any[];
  onUpload: (file: File) => void;
  onRemove: (index: number) => void;
  isUploading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Manage your {title.toLowerCase()}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-primary hover:underline">
              <FileText className="h-5 w-5" /> {doc.name}
            </a>
            <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(index)}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        {documents.length === 0 && <p className='text-sm text-gray-500 text-center py-4'>No {title.toLowerCase()} uploaded yet.</p>}
        <div className="pt-4">
          <label htmlFor={`upload-${title}`} className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm font-medium">{isUploading ? 'Uploading...' : 'Click to upload or drag & drop'}</p>
              <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
            </div>
            <Input id={`upload-${title}`} type="file" className="hidden" onChange={e => { if (e.target.files && !isUploading) onUpload(e.target.files[0]) }} disabled={isUploading} />
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
