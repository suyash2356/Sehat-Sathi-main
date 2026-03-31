'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarX,
  Calendar,
  Clock,
  Video,
  FileText,
  Phone,
  LogIn,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { PrescriptionDialog } from './PrescriptionDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { translations } from '@/lib/translations';

export function MyRequestsTab() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useChatLanguage();
  const t = translations[language].map.requests;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [now, setNow] = useState(new Date());

  // Cancel dialog state
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Prescription dialog state
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(
    null
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userLoading) return;
    if (!user || !user.uid) {
      setLoadingTasks(false);
      return;
    }

    setLoadingTasks(true);

    // Listener 1: Appointments
    const unsubApp = onSnapshot(
      query(
        collection(db, 'appointments'),
        where('patientId', '==', user.uid),
        orderBy('createdAt', 'desc')
      ),
      (snap) => {
        setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingTasks(false);
      },
      (err) => {
        console.error('Failed to fetch appointments', err);
        setLoadingTasks(false); // In case of index missing, still stop loading
      }
    );

    // Listener 2: Active Call Sessions
    const unsubSessions = onSnapshot(
      query(collection(db, 'callSessions'), where('patientId', '==', user.uid)),
      (snap) => {
        const session = snap.docs.find(
          (d) =>
            d.data().status !== 'ended' && d.data().callStatus !== 'ended'
        );
        setActiveSession(session ? { id: session.id, ...session.data() } : null);
      }
    );

    // Listener 3: Prescriptions
    const unsubPrescriptions = onSnapshot(
      query(collection(db, 'prescriptions'), where('patientId', '==', user.uid)),
      (snap) => {
        setPrescriptions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubApp();
      unsubSessions();
      unsubPrescriptions();
    };
  }, [user, userLoading]);

  const handleCancelClick = (id: string) => {
    setCancelId(id);
    setCancelReason("");
  };

  const confirmCancel = async () => {
    if (!cancelId || cancelReason.length < 10) return;
    setIsCancelling(true);
    try {
      const appRef = doc(db, 'appointments', cancelId);
      const app = appointments.find((a) => a.id === cancelId);
      
      await updateDoc(appRef, {
        status: 'cancelled',
        cancellationReason: cancelReason.trim(),
        cancelledBy: 'patient',
        cancelledAt: serverTimestamp()
      });

      if (app) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: app.doctorId,
          recipientRole: 'doctor',
          type: 'appointment_cancelled',
          appointmentId: cancelId,
          patientName: app.patientDetails.name,
          cancellationReason: cancelReason.trim(),
          message: `Appointment cancelled by patient. Reason: ${cancelReason.trim()}`,
          isRead: false,
          createdAt: serverTimestamp()
        });
      }

        toast({ title: t.cancelDialog.cancelButton + " successfully." }); // Could be better but mostly used for title
        setCancelId(null);
      } catch (err) {
        console.error('Failed to cancel appointment', err);
        toast({ title: "Failed to cancel. Please try again.", variant: "destructive" });
      } finally {
      setIsCancelling(false);
    }
  };

  const getCountdown = (scheduledTime: any) => {
    if (!scheduledTime) return null;
    const time = scheduledTime.toDate
      ? scheduledTime.toDate()
      : new Date(scheduledTime);
    const diff = time.getTime() - now.getTime();
    if (diff < 0) return t.overdue;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);

    if (days > 0) return t.startsIn.replace('{time}', `${days}d ${hours}h`);
    if (hours > 0) return t.startsIn.replace('{time}', `${hours}h ${mins}m`);
    if (mins <= 5) return t.startingSoon;
    return t.startsIn.replace('{time}', `${mins}m`);
  };

  const filteredAppointments = appointments.filter((app) => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  if (userLoading || loadingTasks) {
    return (
      <div className="space-y-4 pt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-8 flex justify-center">
        <Card className="max-w-md w-full text-center border-dashed">
          <CardContent className="pt-6 pb-8 space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t.loginPrompt}</h3>
              <p className="text-sm text-slate-500">
                {t.loginDesc}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/patient/login">{t.loginButton}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* ─── UI Section 1: Active Call Banner ─── */}
      {activeSession && (
        <div className="relative overflow-hidden rounded-xl border-2 border-green-500 bg-green-50 shadow-[0_0_15px_rgba(34,197,94,0.2)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse" />
          <div className="flex items-center gap-4 text-green-900">
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center animate-pulse">
              {activeSession.mode === 'voice' ? (
                <Phone className="w-6 h-6 text-green-700" />
              ) : (
                <Video className="w-6 h-6 text-green-700" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {t.callLive.replace('{name}', activeSession.doctorName)}
              </h3>
              <p className="text-sm text-green-700/80">
                {t.doctorWaiting}
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider animate-pulse shadow-lg"
            onClick={() => router.push(`/video-call?sessionId=${activeSession.id}`)}
          >
            {t.joinCall}
          </Button>
        </div>
      )}

      {/* ─── UI Section 3: Empty State ─── */}
      {appointments.length === 0 && (
        <div className="pt-8 flex justify-center">
          <div className="max-w-md w-full text-center space-y-4 py-12 px-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
            <div className="mx-auto w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center">
              <CalendarX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-700">
                {t.noRequests}
              </h3>
              <p className="text-slate-500 mt-2">
                {t.noRequestsDesc}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const mapTab = document.querySelector(
                  '[data-state="inactive"][value="map"]'
                ) as HTMLButtonElement;
                if (mapTab) mapTab.click();
              }}
            >
              {t.findDoctorButton}
            </Button>
          </div>
        </div>
      )}

      {/* ─── UI Section 2.5: Filters ─── */}
      {appointments.length > 0 && (
        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-sm font-medium text-slate-500 pl-2">{t.filterLabel}</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t.allRequests} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.everyRequest}</SelectItem>
              <SelectItem value="pending">{t.pending}</SelectItem>
              <SelectItem value="accepted">{t.accepted}</SelectItem>
              <SelectItem value="completed">{t.completed}</SelectItem>
              <SelectItem value="cancelled">{t.cancelled}</SelectItem>
              <SelectItem value="rejected">{t.declined}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ─── UI Section 2: Appointment Cards ─── */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 && appointments.length > 0 ? (
           <div className="text-center py-8 text-slate-500 border border-dashed rounded-xl bg-slate-50">{t.noFilterMatch}</div>
        ) : filteredAppointments.map((app) => {
          const isUpcoming =
            app.status === 'pending' || app.status === 'accepted';
          
          let BadgeIcon = AlertCircle;
          let badgeColors = 'bg-yellow-100 text-yellow-800 border-yellow-200';
          let badgeText = t.status.awaiting;

          if (app.status === 'accepted') {
            BadgeIcon = CheckCircle2;
            badgeColors = 'bg-blue-100 text-blue-800 border-blue-200';
            badgeText = t.status.confirmed;
          } else if (app.status === 'in_call') {
            BadgeIcon = Video;
            badgeColors = 'bg-green-100 text-green-800 border-green-300 animate-pulse';
            badgeText = t.status.inCall;
          } else if (app.status === 'completed') {
            BadgeIcon = CheckCircle2;
            badgeColors = 'bg-slate-100 text-slate-600 border-slate-200';
            badgeText = t.status.completed;
          } else if (app.status === 'rejected') {
            BadgeIcon = XCircle;
            badgeColors = 'bg-red-100 text-red-800 border-red-200';
            badgeText = t.status.declined;
          } else if (app.status === 'cancelled') {
            BadgeIcon = XCircle;
            badgeColors = 'bg-slate-100 text-slate-500 border-slate-200';
            badgeText = t.status.cancelled;
          }

          const rx = prescriptions.find((p) => p.appointmentId === app.id);

          return (
            <Card key={app.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row border-l-4" style={{
                  borderLeftColor: app.status === 'in_call' ? '#22c55e' : 
                                  app.status === 'accepted' ? '#3b82f6' : 
                                  app.status === 'rejected' ? '#ef4444' : 
                                  app.status === 'completed' ? '#94a3b8' : '#eab308'
                }}>
                  <div className="flex-1 p-5 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{(language === 'en' ? 'Dr. ' : 'डॉ. ') + (app.doctorName || 'Doctor')}</h3>
                        <p className="text-sm text-slate-500">
                           {(app as any).doctorSpecialization || t.specialist} 
                           {(app as any).hospitalName ? ` · ${(app as any).hospitalName}` : ''}
                        </p>
                      </div>
                      <div className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium shrink-0 ${badgeColors}`}>
                        {badgeText}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        {app.mode === 'visit' ? (
                          <FileText className="w-4 h-4 text-purple-500" />
                        ) : app.mode === 'voice' ? (
                          <Phone className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Video className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className="capitalize">{language === 'en' ? (app.mode || 'video') + " Call" : (app.mode === 'visit' ? 'थेट भेट' : app.mode === 'voice' ? 'व्हॉइस कॉल' : 'व्हिडिओ कॉल')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>
                          {app.scheduledTime
                            ? (app.scheduledTime.toDate
                                ? app.scheduledTime.toDate()
                                : new Date(app.scheduledTime)
                              ).toLocaleString([], {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : t.immediate}
                        </span>
                      </div>

                      {isUpcoming && app.scheduledTime && (
                        <div className="flex items-center gap-2 text-blue-600 font-semibold sm:col-span-2">
                          <Clock className="w-4 h-4" />
                          <span>{getCountdown(app.scheduledTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 md:bg-transparent border-t md:border-t-0 md:border-l border-slate-100 p-5 flex md:flex-col md:w-48 justify-center gap-2 shrink-0">
                    {app.status === 'pending' || app.status === 'accepted' ? (
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleCancelClick(app.id)}
                      >
                        {app.status === 'pending' ? t.cancelRequest : t.cancel}
                      </Button>
                    ) : app.status === 'in_call' ? (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg animate-pulse h-12 text-sm font-bold tracking-wider"
                        onClick={() => router.push(`/video-call?sessionId=${activeSession?.id || app.id}`)}
                      >
                        JOIN CALL
                      </Button>
                    ) : app.status === 'completed' ? (
                      <Button
                        variant={rx ? 'default' : 'secondary'}
                        className={`w-full ${rx ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                        disabled={!rx}
                        onClick={() => {
                          if (rx) {
                            setSelectedPrescription(rx);
                            setPrescriptionOpen(true);
                          }
                        }}
                      >
                        {rx ? t.viewPrescription : t.prescriptionPending}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.cancelDialog.title}</DialogTitle>
            <DialogDescription>
              {t.cancelDialog.description.replace('{name}', appointments.find(a => a.id === cancelId)?.doctorName || 'Doctor')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">{t.cancelDialog.reasonLabel}</label>
            <Textarea 
              placeholder={t.cancelDialog.reasonPlaceholder} 
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="resize-none h-24"
            />
            <p className="text-xs text-muted-foreground mt-2">{t.cancelDialog.requiredNote}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)} disabled={isCancelling}>{t.cancelDialog.keepButton}</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={confirmCancel}
              disabled={cancelReason.length < 10 || isCancelling}
            >
              {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : t.cancelDialog.cancelButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PrescriptionDialog
        prescription={selectedPrescription}
        isOpen={prescriptionOpen}
        onOpenChange={setPrescriptionOpen}
      />
    </div>
  );
}
