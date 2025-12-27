'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import {
  Menu,
  Globe,
  LogOut,
  User as UserIcon,
  ShieldPlus,
  Bell,
  Siren,
  Phone,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';
import { useChatLanguage, setChatLanguage } from '@/hooks/use-chat-language';
import { useToast } from '@/hooks/use-toast';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { useUser } from '@/hooks/use-user';
import { useAuth, useFirestore } from '@/hooks/use-firebase';

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface NotificationContent {
  id: string;
  title: string;
  message: string;
  type: 'request' | 'join' | 'process' | 'download';
  timestamp?: any;
}

const emergencySchema = z.object({
  location: z.string().min(10),
  reason: z.string().min(5),
  contact: z.string().regex(/^\d{10}$/),
});

type EmergencyFormValues = z.infer<typeof emergencySchema>;

/* ------------------------------------------------------------------ */
/* HEADER */
/* ------------------------------------------------------------------ */

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const { language, setLanguage } = useChatLanguage();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState<NotificationContent | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isEmergencyFormOpen, setIsEmergencyFormOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState<EmergencyFormValues | null>(null);

  useEffect(() => setMounted(true), []);

  const isLandingPage = pathname === '/';
  const t = translations[language];

  /* ------------------------------------------------------------------
     NOTIFICATION STATUS LISTENER (NO JOIN LOGIC HERE)
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (loading) return;
    if (!user || !db || !mounted) return;
    if (pathname.startsWith('/doctor')) return;

    let unsubPrescription: (() => void) | null = null;

    const apptQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubAppt = onSnapshot(apptQuery, snap => {
      if (snap.empty) {
        setNotification(null);
        if (unsubPrescription) unsubPrescription();
        return;
      }

      const appt = snap.docs[0].data();
      const apptId = snap.docs[0].id;

      if (unsubPrescription) unsubPrescription();

      const rxQuery = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      unsubPrescription = onSnapshot(rxQuery, rxSnap => {
        if (!rxSnap.empty) {
          const rx = rxSnap.docs[0].data();
          const created = rx.createdAt?.toDate?.() ?? new Date();
          if (Date.now() - created.getTime() < 24 * 60 * 60 * 1000) {
            setNotification({
              id: rxSnap.docs[0].id,
              title: t.notificationTitles.ready,
              message: t.notificationMessages.ready,
              type: 'download',
              timestamp: rx.createdAt,
            });
            return;
          }
        }

        if (appt.status === 'pending') {
          setNotification({
            id: apptId,
            title: t.notificationTitles.requestSent,
            message: t.notificationMessages.requestSent,
            type: 'request',
          });
        } else if (appt.status === 'accepted') {
          setNotification({
            id: apptId,
            title: 'Request Accepted',
            message: 'Waiting for doctor to start the call.',
            type: 'request',
          });
        } else if (appt.status === 'completed') {
          setNotification({
            id: apptId,
            title: t.notificationTitles.processing,
            message: t.notificationMessages.processing,
            type: 'process',
          });
        }
      });
    });

    return () => {
      unsubAppt();
      if (unsubPrescription) unsubPrescription();
    };
  }, [user, loading, db, mounted, pathname, t]);

  /* ------------------------------------------------------------------
     EMERGENCY
  ------------------------------------------------------------------ */

  const form = useForm<EmergencyFormValues>({
    resolver: zodResolver(emergencySchema),
    defaultValues: { location: '', reason: '', contact: '' },
  });

  const onEmergencySubmit = (values: EmergencyFormValues) => {
    setEmergencyDetails(values);
    setIsEmergencyFormOpen(false);
    setIsConfirmationOpen(true);
  };

  const confirmEmergencyCall = async () => {
    if (!db || !emergencyDetails) return;

    await addDoc(collection(db, 'emergency_alerts'), {
      ...emergencyDetails,
      patientId: user?.uid ?? 'anonymous',
      status: 'active',
      createdAt: serverTimestamp(),
    });

    setIsConfirmationOpen(false);
    form.reset();
    toast({ title: t.emergency.toastTitle, description: t.emergency.toastDescription });
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setChatLanguage(lang);
    setLanguage(lang);
  };

  if (!mounted) return null;

  /* ------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------ */

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-24 items-center justify-between px-4">

        {/* LEFT */}
        <div className="flex flex-1">
          {!isLandingPage && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <SheetHeader>
                  <SheetTitle><VisuallyHidden>Menu</VisuallyHidden></SheetTitle>
                </SheetHeader>
                <nav className="flex-1 flex flex-col mt-6">
                  <div className="space-y-4">
                    <Link href="/health-guide" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium hover:text-primary">Dashboard</Link>
                    <Link href="/chatbot" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium hover:text-primary">Chatbot</Link>
                    <Link href="/map" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium hover:text-primary">Map</Link>
                    <Link href="/services" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium hover:text-primary">Services</Link>
                    <Link href="/about" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium hover:text-primary">About</Link>
                  </div>

                  <div className="mt-auto space-y-4 pb-4">
                    <Link href="/insurance" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium hover:text-primary">Insurance</Link>
                    <Link href="/profile" onClick={() => setIsOpen(false)} className="block py-2 text-lg font-medium hover:text-primary">Profile</Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* CENTER */}
        <Link href="/" className="font-bold text-xl">{t.appName}</Link>

        {/* RIGHT */}
        <div className="flex flex-1 justify-end items-center gap-2">

          {!isLandingPage && (
            <>
              {/* Emergency */}
              <Dialog open={isEmergencyFormOpen} onOpenChange={setIsEmergencyFormOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="icon"><Siren /></Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.emergency.formTitle}</DialogTitle>
                    <DialogDescription>{t.emergency.formDescription}</DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onEmergencySubmit)} className="space-y-4">
                      <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem><FormLabel>Location</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="reason" render={({ field }) => (
                        <FormItem><FormLabel>Reason</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="contact" render={({ field }) => (
                        <FormItem><FormLabel>Contact</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <DialogFooter>
                        <Button type="submit" variant="destructive">Send Alert</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Bell />
                    {notification && <span className="absolute h-2 w-2 bg-red-500 rounded-full" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4">
                  {notification ? (
                    <>
                      <p className="font-semibold">{notification.title}</p>
                      <p className="text-xs">{notification.message}</p>
                    </>
                  ) : (
                    <p className="text-xs italic">{t.notificationMessages.noNew}</p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Language */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><Globe /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleLanguageChange('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('hi')}>Hindi</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('mr')}>Marathi</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {user && !isLandingPage ? (
            <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut /></Button>
          ) : (
            <Link href="/login"><Button size="sm">Login</Button></Link>
          )}
        </div>
      </div>
    </header>
  );
}
