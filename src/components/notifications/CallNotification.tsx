'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { useUser } from '@/hooks/use-user';
import { useFirestore } from '@/hooks/use-firebase';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, CheckCircle2, Loader2 } from 'lucide-react';

/* ----------------------------------------------------
   TYPES
---------------------------------------------------- */

interface CallNotificationProps {
  callData: any;
  onDismiss: () => void;
}

interface CallSessionNotification {
  id: string;
  appointmentId?: string;
  doctorName?: string;
  mode?: string;
  patientId?: string;
  started: boolean;
}

/* ----------------------------------------------------
   SINGLE NOTIFICATION UI
---------------------------------------------------- */

export function CallNotification({ callData, onDismiss }: CallNotificationProps) {
  const router = useRouter();

  const isStarted =
    callData.started === true || callData.status === 'in_call';

  const isAccepted =
    callData.status === 'accepted' && !isStarted;

  const handleJoinCall = () => {
    router.push(`/video-call?sessionId=${callData.id}`);
    onDismiss();
  };

  return (
    <Card
      className={`w-full max-w-sm mx-auto shadow border-l-4 mb-2
        ${
          isStarted
            ? 'border-l-green-500 bg-green-50'
            : isAccepted
            ? 'border-l-blue-500 bg-white'
            : 'border-l-yellow-500 bg-white'
        }`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          {isStarted ? (
            <Video className="h-5 w-5 text-green-600 animate-pulse" />
          ) : isAccepted ? (
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
          ) : (
            <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
          )}

          <h3 className="font-semibold text-sm uppercase opacity-80">
            {isStarted
              ? 'Call Started'
              : isAccepted
              ? 'Request Accepted'
              : 'Request Pending'}
          </h3>
        </div>

        {/* Details */}
        <div className="text-sm mb-3">
          <p>
            <strong>Doctor:</strong> Dr. {callData.doctorName || '—'}
          </p>
          <p>
            <strong>Mode:</strong>{' '}
            {(callData.mode || 'video').toUpperCase()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isStarted && (
            <Button
              onClick={handleJoinCall}
              size="sm"
              className="flex-1 bg-green-600 text-white"
            >
              Join Call
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="ml-auto text-xs"
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ----------------------------------------------------
   NOTIFICATION MANAGER
---------------------------------------------------- */

export function CallNotificationManager() {
  const { user, loading } = useUser();
  const db = useFirestore();

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || !db) return;

    let unsubAppointments = () => {};
    let unsubSessions = () => {};

    /* -------------------------------
       1. APPOINTMENT NOTIFICATIONS
    -------------------------------- */

    const apptQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', user.uid),
      where('status', 'in', ['pending', 'accepted', 'in_call'])
    );

    unsubAppointments = onSnapshot(
      apptQuery,
      snap => {
        const apptNotifs = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(apptNotifs);
      },
      err => {
        console.error('Appointment notification error', err);
      }
    );

    /* -------------------------------
       2. CALL SESSION NOTIFICATIONS
    -------------------------------- */

    const sessionQuery = query(
      collection(db, 'callSessions'),
      where('patientId', '==', user.uid)
    );

    unsubSessions = onSnapshot(
      sessionQuery,
      snap => {
        const sessions: CallSessionNotification[] = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            appointmentId: data.appointmentId,
            doctorName: data.doctorName,
            mode: data.mode,
            patientId: data.patientId,
            started: true,
          };
        });

        // Sessions override appointment notifications
        setNotifications(prev => {
          const filtered = prev.filter(
            n =>
              !sessions.find(
                s =>
                  s.appointmentId &&
                  s.appointmentId === n.id
              )
          );
          return [...sessions, ...filtered];
        });
      },
      err => {
        console.error('Call session notification error', err);
      }
    );

    return () => {
      unsubAppointments();
      unsubSessions();
    };
  }, [user, loading, db]);

  const handleDismiss = (id: string) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-full max-w-sm space-y-2">
      {notifications.map(notification => (
        <CallNotification
          key={notification.id}
          callData={notification}
          onDismiss={() => handleDismiss(notification.id)}
        />
      ))}
    </div>
  );
}
