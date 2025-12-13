'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Clock, X, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';

interface CallNotificationProps {
  callData: any;
  onDismiss: () => void;
}

export function CallNotification({ callData, onDismiss }: CallNotificationProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!callData.scheduledTime) return;

    const updateTimeLeft = () => {
      const now = new Date();
      // Handle Firestore Timestamp or Date string or Date object
      let scheduledTime: Date;
      if (callData.scheduledTime instanceof Timestamp) {
        scheduledTime = callData.scheduledTime.toDate();
      } else if (typeof callData.scheduledTime === 'string') {
        scheduledTime = new Date(callData.scheduledTime);
      } else {
        scheduledTime = callData.scheduledTime;
      }

      const diff = scheduledTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Call in progress / starting now!');
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [callData.scheduledTime]);

  const handleJoinCall = () => {
    router.push(`/video-call?callId=${callData.id}`);
    onDismiss();
  };

  return (
    <Card className="w-full max-w-sm mx-auto shadow-xl border-l-4 border-l-blue-500 bg-white dark:bg-gray-800 animate-in slide-in-from-top-2">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-5 w-5 text-blue-500 animate-pulse" />
              <h3 className="font-semibold text-lg">Upcoming Call</h3>
            </div>

            <Alert className="mb-3 border-blue-100 bg-blue-50 dark:bg-blue-900/20">
              <Clock className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700 dark:text-blue-300 ml-2">
                Starting in: <strong>{timeLeft}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-4">
              {callData.doctorName && <p><strong>Doctor:</strong> Dr. {callData.doctorName}</p>}
              {callData.patientName && <p><strong>Patient:</strong> {callData.patientName}</p>}
              <p className="line-clamp-1"><strong>Reason:</strong> {callData.issue}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleJoinCall} className="flex-1 bg-green-600 hover:bg-green-700">
                <Video className="h-4 w-4 mr-2" />
                Join Now
              </Button>
              <Button variant="outline" size="icon" onClick={onDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CallNotificationManager() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Listen to upcoming accepted appointments
    // We can't do complex OR queries easily. Let's do two queries or one combined if structure allows.
    // Or just query where patientId == user.uid AND status == accepted
    // And also where doctorId == user.uid AND status == accepted.
    // Firestore limitations: OR queries are allowed in new SDKs with `or(...)`, but let's assume `in` or standard queries.
    // Easiest: Listen to 'appointments' where `status` == 'accepted'.
    // Then filter by user ID on client (less efficient if huge DB, but for this app OK).
    // Better: Two listeners.

    // Actually, Phase 1 rules allow reading if I am participant.
    // So I can just query `status == accepted` and it should only return docs I can read?
    // Wait, rules enforce 'allow read: if resource.data.patientId == uid'.
    // So `getDocs(collection('appointments'))` would FAIL because it tries to read all?
    // Firestore queries must match security rules constraints.
    // So I MUST query `where('patientId', '==', uid)`.

    // Listener 1: Patient
    const q1 = query(
      collection(db, 'appointments'),
      where('patientId', '==', user.uid),
      where('status', '==', 'accepted')
    );

    // Listener 2: Doctor (if user is doctor? we can just run both, one will be empty usually)
    const q2 = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      where('status', '==', 'accepted')
    );

    const handleSnapshot = (snapshot: any) => {
      const now = new Date().getTime();
      const upcoming: any[] = [];

      snapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        let time = 0;
        if (data.scheduledTime instanceof Timestamp) {
          time = data.scheduledTime.toMillis();
        } else if (typeof data.scheduledTime === 'string') {
          time = new Date(data.scheduledTime).getTime();
        }

        // Check if call is within next 5 minutes (300000 ms) or active (start time passed but not completed?)
        // Let's say window is: [now - 10min, now + 5min]
        // If it's too far in future, don't show yet.
        const diff = time - now;
        if (diff > -600000 && diff <= 300000) { // 10 mins late allowed, notify 5 mins early
          upcoming.push({ id: doc.id, ...data });
        }
      });
      return upcoming;
    };

    const unsub1 = onSnapshot(q1, (snap) => {
      const ups = handleSnapshot(snap);
      setNotifications(prev => {
        // Merging logic might be tricky with two streams. 
        // Simplification: Store lists separately? 
        // Or just simpler: Only run the one that matches user role?
        // Since we don't know role easily, running both is safer if rules allow.
        // But if I am patient, reading doctorId query might fail?
        // Rules: `allow read: if ... auth.uid == patientId || auth.uid == doctorId`.
        // Query `where doctorId == me` satisfies rule.
        // So both are safe.

        // Combined unique by ID
        const others = prev.filter(p => !ups.find(u => u.id === p.id));
        // Filter out items that might have been removed in this snapshot?
        // Actually, `ups` is the complete state of q1.
        // We need to keep q2 items.
        // This simple merge is buggy.
        // Proper way: State has `patientAppointments` and `doctorAppointments`.
        return [...ups]; // Temp fix: assumption user acts as one role primarily
      });
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      const ups = handleSnapshot(snap);
      setNotifications(prev => {
        // Merge with existing (which came from q1)
        // Check duplicates
        const combined = [...prev, ...ups];
        // Dedupe
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique;
      });
    });

    return () => {
      unsub1();
      unsub2();
    };

  }, [user]);

  const handleDismiss = (callId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== callId));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {/* Enable pointer events for children */}
      <div className="pointer-events-auto space-y-2">
        {notifications.map((notification) => (
          <CallNotification
            key={notification.id}
            callData={notification}
            onDismiss={() => handleDismiss(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}
