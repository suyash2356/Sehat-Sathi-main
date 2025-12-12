'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, FileText, Users, Edit, Trash2, PlusCircle, Heart, Upload, BadgeCheck, Clock, Download } from 'lucide-react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/hooks/use-user';
import { useCollection, useDoc } from '@/hooks/use-firestore';
import { collection, doc, setDoc, addDoc, deleteDoc, Timestamp, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import dynamic from 'next/dynamic';

const FileUpload = dynamic(() => import('@/components/ui/file-upload').then(mod => mod.FileUpload), { ssr: false });

const memberSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  relationship: z.string().min(2, { message: 'Relationship is required.' }),
  bio: z.string().max(200, { message: 'Bio cannot exceed 200 characters.' }).optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

const documentSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.'}),
  file: z.any().refine(files => files?.length === 1, 'File is required.'),
});

type MemberFormValues = z.infer<typeof memberSchema>;
type DocumentFormValues = z.infer<typeof documentSchema>;

export type UserProfileData = MemberFormValues & {
  email?: string;
  id?: string;
};

export type UserProfile = UserProfileData & {
  id: string;
  isPrimary: boolean;
};

type HealthDocument = {
  id: string;
  title: string;
  url: string;
  path: string;
  uploadedAt: Timestamp;
  status: 'Pending' | 'Verified';
};

export default function ProfilePage() {
  const { toast } = useToast();
  const { language } = useChatLanguage();
  const t = translations[language].profile;
  const { user, loading: userLoading } = useUser();

  const userDocRef = useMemo(() => (user ? doc(db, 'users', user.uid) : null), [user]);
  const { data: userProfileData, loading: profileLoading } = useDoc<UserProfileData>(userDocRef);

  const familyColRef = useMemo(() => (user ? collection(db, 'users', user.uid, 'familyMembers') : null), [user]);
  const { data: familyMembersData, loading: familyLoading } = useCollection<UserProfileData>(familyColRef);
  
  const docsColRef = useMemo(() => (user ? query(collection(db, 'users', user.uid, 'documents'), orderBy('uploadedAt', 'desc')) : null), [user]);
  const { data: documents, loading: docsLoading } = useCollection<HealthDocument>(docsColRef);

  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [isDocFormOpen, setIsDocFormOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const isLoading = userLoading || profileLoading || familyLoading || docsLoading;

  const primaryProfile = useMemo<UserProfile | null>(() => {
    if (!user || !userProfileData) return null;
    const { relationship, name, ...restData } = userProfileData;
    return {
      id: user.uid,
      isPrimary: true,
      name: userProfileData.name || user.displayName || 'New User',
      email: userProfileData.email || user.email || '',
      relationship: 'Self',
      ...restData,
    };
  }, [user, userProfileData]);
  
  const familyMembers = useMemo<UserProfile[]>(() => {
    if (!familyMembersData) return [];
    return familyMembersData.map(member => ({
      ...member,
      id: member.id || '',
      isPrimary: false,
    }));
  }, [familyMembersData]);


  const memberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { name: '', relationship: '', bio: '', bloodGroup: '', allergies: '', chronicDiseases: '' },
  });

  const docForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: { title: '' },
  });
  
  const handleOpenMemberForm = (profile: UserProfile | null = null) => {
    setEditingProfile(profile);
    if (profile) {
      memberForm.reset({
          name: profile.name || '',
          relationship: profile.relationship || '',
          bio: profile.bio || '',
          bloodGroup: profile.bloodGroup || '',
          allergies: profile.allergies || '',
          chronicDiseases: profile.chronicDiseases || '',
      });
    } else {
      memberForm.reset({ name: '', relationship: '', bio: '', bloodGroup: '', allergies: '', chronicDiseases: '' });
    }
    setIsMemberFormOpen(true);
  };

  async function onMemberSubmit(values: MemberFormValues) {
    if (!user) return;
    try {
      let docRef;
      if (editingProfile) {
        docRef = editingProfile.isPrimary 
          ? doc(db, 'users', editingProfile.id)
          : doc(db, 'users', user.uid, 'familyMembers', editingProfile.id);
        await setDoc(docRef, values, { merge: true });
        toast({ title: t.updateProfileSuccess, description: t.updateProfileSuccessDescription.replace('{name}', values.name) });
      } else {
        const colRef = collection(db, 'users', user.uid, 'familyMembers');
        await addDoc(colRef, values);
        toast({ title: t.addMemberSuccess, description: t.addMemberSuccessDescription.replace('{name}', values.name) });
      }
      setIsMemberFormOpen(false);
      setEditingProfile(null);
    } catch (error) {
      console.error("Error saving profile: ", error);
      toast({ title: t.saveProfileError, description: t.saveProfileErrorDescription, variant: 'destructive' });
    }
  }

  async function onDocSubmit(values: DocumentFormValues) {
    if (!user || !values.file) return;
    const file = values.file[0];
    const docId = `${Date.now()}_${file.name}`;
    const storagePath = `documents/${user.uid}/${docId}`;
    const storageRef = ref(storage, storagePath);

    try {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => (prev === null ? 0 : Math.min(prev + 10, 90)));
      }, 200);

      await uploadBytes(storageRef, file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const downloadURL = await getDownloadURL(storageRef);
      
      const docsColRef = collection(db, 'users', user.uid, 'documents');
      await addDoc(docsColRef, {
        title: values.title,
        url: downloadURL,
        path: storagePath,
        uploadedAt: Timestamp.now(),
        status: 'Pending',
      });

      toast({ title: t.uploadSuccess, description: t.uploadSuccessDescription.replace('{title}', values.title) });
      setIsDocFormOpen(false);
      docForm.reset();
    } catch (error) {
      console.error("Error uploading document: ", error);
      toast({ title: t.uploadError, description: t.uploadErrorDescription, variant: 'destructive' });
    } finally {
      setTimeout(() => setUploadProgress(null), 1000);
    }
  }

  async function handleDeleteMember(profile: UserProfile) {
    if (!user || profile.isPrimary) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'familyMembers', profile.id);
      await deleteDoc(docRef);
      toast({ title: t.deleteMemberSuccess, description: t.deleteMemberSuccessDescription.replace('{name}', profile.name) });
    } catch (error) {
       console.error("Error deleting member: ", error);
       toast({ title: t.deleteMemberError, description: t.deleteMemberErrorDescription, variant: 'destructive' });
    }
  }

  async function handleDeleteDoc(document: HealthDocument) {
    if (!user) return;
    const storageRef = ref(storage, document.path);
    const docRef = doc(db, 'users', user.uid, 'documents', document.id);
    try {
      await deleteObject(storageRef);
      await deleteDoc(docRef);
      toast({ title: t.deleteDocumentSuccess, description: t.deleteDocumentSuccessDescription.replace('{title}', document.title) });
    } catch (error) {
       console.error("Error deleting document: ", error);
       toast({ title: t.deleteDocumentError, description: t.deleteDocumentErrorDescription, variant: 'destructive' });
    }
  }

  const HealthDetailItem = ({ label, value }: { label: string, value?: string }) => (
    <div>
        <h4 className="text-sm font-semibold text-muted-foreground">{label}</h4>
        <p className="text-base">{value || t.notProvided}</p>
    </div>
  );

  const ProfileCard = ({ profile }: { profile: UserProfile }) => (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {profile.isPrimary ? <User className="h-6 w-6 text-primary" /> : <Heart className="h-6 w-6 text-accent" />}
          <CardTitle className="font-headline">{profile.name}</CardTitle>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenMemberForm(profile)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit {profile.name}</span>
            </Button>
            {!profile.isPrimary && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete {profile.name}</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t.deleteMemberConfirmationTitle}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t.deleteMemberConfirmationDescription.replace('{name}', profile.name)}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t.cancelButton}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMember(profile)}>{t.deleteButton}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <p className="text-sm font-bold text-muted-foreground">{profile.relationship}</p>
            {profile.isPrimary && <p className="text-muted-foreground">{profile.email}</p>}
            {profile.bio && <p className="mt-2 text-foreground/80">{profile.bio}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <HealthDetailItem label={t.bloodGroup} value={profile.bloodGroup} />
            <HealthDetailItem label={t.allergies} value={profile.allergies} />
            <div className="md:col-span-2">
              <HealthDetailItem label={t.chronicDiseases} value={profile.chronicDiseases} />
            </div>
        </div>
      </CardContent>
    </Card>
  );
  
  if (!user && !isLoading) {
    return (
      <div className="container py-12 md:py-16 text-center">
         <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.accessDeniedTitle}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t.accessDeniedDescription}
        </p>
         <Button onClick={() => window.location.href='/login'} className="mt-6">{t.loginButton}</Button>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
      <Dialog open={isMemberFormOpen} onOpenChange={setIsMemberFormOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingProfile ? (editingProfile.isPrimary ? t.editYourProfile : t.editMemberProfile.replace('{name}', editingProfile.name)) : t.addMemberTitle}</DialogTitle>
              </DialogHeader>
              <Form {...memberForm}>
                  <form onSubmit={memberForm.handleSubmit(onMemberSubmit)} className="space-y-4">
                      <FormField control={memberForm.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>{t.form.fullName}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={memberForm.control} name="relationship" render={({ field }) => (
                          <FormItem><FormLabel>{t.form.relationship}</FormLabel><FormControl><Input placeholder={t.form.relationshipPlaceholder} {...field} disabled={editingProfile?.isPrimary} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={memberForm.control} name="bio" render={({ field }) => (
                          <FormItem><FormLabel>{t.form.shortBio}</FormLabel><FormControl><Textarea placeholder={t.form.shortBioPlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={memberForm.control} name="bloodGroup" render={({ field }) => (
                          <FormItem><FormLabel>{t.form.bloodGroup}</FormLabel><FormControl><Input placeholder={t.form.bloodGroupPlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                        <FormField control={memberForm.control} name="allergies" render={({ field }) => (
                          <FormItem><FormLabel>{t.form.allergies}</FormLabel><FormControl><Textarea placeholder={t.form.allergiesPlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                        <FormField control={memberForm.control} name="chronicDiseases" render={({ field }) => (
                          <FormItem><FormLabel>{t.form.chronicDiseases}</FormLabel><FormControl><Textarea placeholder={t.form.chronicDiseasesPlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <DialogFooter>
                          <DialogClose asChild><Button variant="ghost">{t.cancelButton}</Button></DialogClose>
                          <Button type="submit">{t.saveButton}</Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      <Dialog open={isDocFormOpen} onOpenChange={setIsDocFormOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{t.uploadDocumentTitle}</DialogTitle>
              </DialogHeader>
              <Form {...docForm}>
                  <form onSubmit={docForm.handleSubmit(onDocSubmit)} className="space-y-4">
                      <FormField control={docForm.control} name="title" render={({ field }) => (
                          <FormItem><FormLabel>{t.form.docTitle}</FormLabel><FormControl><Input placeholder={t.form.docTitlePlaceholder} {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={docForm.control} name="file" render={({ field }) => (
                          <FormItem><FormLabel>{t.form.file}</FormLabel><FormControl><Input type="file" {...docForm.register('file')} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      {uploadProgress !== null && <Progress value={uploadProgress} className="w-full" />}
                      <DialogFooter>
                          <DialogClose asChild><Button variant="ghost" disabled={uploadProgress !== null}>{t.cancelButton}</Button></DialogClose>
                          <Button type="submit" disabled={uploadProgress !== null}>{uploadProgress !== null ? t.uploadingButton : t.uploadButton}</Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-3 lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
              <Users className="h-7 w-7 text-primary" />
              {t.familyHealthDetails}
            </h2>
             <Button onClick={() => handleOpenMemberForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t.addMemberButton}
            </Button>
          </div>
          
          {isLoading ? (
             <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
             </div>
          ) : (
            <>
              {primaryProfile && <ProfileCard profile={primaryProfile} />}
              {familyMembers.map(member => <ProfileCard key={member.id} profile={member} />)}
              {!primaryProfile && familyMembers.length === 0 && (
                 <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground mb-4">{t.noProfiles}</p>
                    </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        {t.documentsTitle}
                    </CardTitle>
                    <Button size="icon" variant="outline" onClick={() => setIsDocFormOpen(true)}>
                        <Upload className="h-4 w-4" />
                        <span className="sr-only">{t.uploadDocumentButton}</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 {typeof window !== 'undefined' && <FileUpload 
                    onFileSelect={(file) => {
                        console.log('File selected:', file.name);
                        // In production, this would upload to server
                    }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    maxSize={10}
                    multiple={true}
                />}
                
                {/* Demo documents */}
                <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-sm text-gray-600">Demo Documents (Not Real)</h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-md border">
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold truncate">Health Insurance Card</p>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <BadgeCheck className="h-3 w-3 text-green-500" />
                                    <Badge variant="default" className="bg-opacity-20 text-xs">Verified</Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <Button variant="ghost" size="icon">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 rounded-md border">
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold truncate">Medical Report</p>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    <Badge variant="secondary" className="bg-opacity-20 text-xs">Pending</Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <Button variant="ghost" size="icon">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
