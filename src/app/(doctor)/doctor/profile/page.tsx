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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, X, FileText, UserCircle, Save } from 'lucide-react';
import { uploadToSupabase } from '@/lib/supabase';

// Schema Definitions
const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required.'),
  url: z.string().url('Invalid URL'),
  fileName: z.string(),
});

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  specialization: z.string().min(2, "Specialization is required."),
  location: z.string().min(2, "Location is required."),
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
      location: '',
      experience: 0,
      bio: '',
      profilePicture: '',
      certifications: [],
      licenses: [],
      isProfileComplete: false,
    },
  });

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
          location: data.location || '',
          experience: data.experience || 0,
          bio: data.bio || '',
          profilePicture: data.profilePicture || '',
          certifications: data.certifications || [],
          licenses: data.licenses || [],
          isProfileComplete: data.isProfileComplete || false,
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

      // Mark profile as complete
      data.isProfileComplete = true;
      await setDoc(docRef, data, { merge: true });
      toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Error", description: "Could not save your profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
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
                  <TabsTrigger value="certifications">Certifications</TabsTrigger>
                  <TabsTrigger value="licenses">Licenses</TabsTrigger>
                </TabsList>

                {/* Personal Details Tab */}
                <TabsContent value="personal" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="specialization" render={({ field }) => <FormItem><FormLabel>Specialization</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                  </div>
                  <FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="City, Country" {...field} /></FormControl><FormMessage /></FormItem>} />
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
