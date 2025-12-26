'use client';

import { useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { useFirestore } from '@/hooks/use-firebase';
import { useUser } from '@/hooks/use-user';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AppointmentBrief {
  id: string;
  doctorName?: string;
  status?: string;
  mode?: string;
  scheduledTime?: any;
  patientDetails?: any;
}

export default function PatientMessagesPage() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  /* ---------------- AUTH GUARD (RENDER PHASE) ---------------- */
  if (loading) return null;
  if (!user) redirect('/patient/login');

  const currentUser = user;

  /* ---------------- LOCAL STATE ---------------- */
  const [appointments, setAppointments] = useState<AppointmentBrief[]>([]);
  const [loadingLocal, setLoadingLocal] = useState(true);

  /* ---------------- DATA EFFECT ---------------- */
  useEffect(() => {
    if (!db) return;

    const apptQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(
      apptQuery,
      snap => {
        setAppointments(
          snap.docs.map(d => ({ id: d.id, ...d.data() })) as AppointmentBrief[]
        );
        setLoadingLocal(false);
      },
      err => {
        console.error('Appointments listener error', err);
        setLoadingLocal(false);
      }
    );

    return () => unsub();
  }, [db, currentUser.uid]);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Messages / Appointment Requests</h1>

        {loadingLocal ? (
          <div>Loading...</div>
        ) : appointments.length === 0 ? (
          <div>No messages or requests.</div>
        ) : (
          <div className="space-y-4">
            {appointments.map(appt => (
              <Card key={appt.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Dr. {appt.doctorName || '—'}</span>
                    <span className="text-xs">
                      {(appt.mode || 'video').toUpperCase()}
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        Status: {appt.status}
                      </p>
                      {appt.scheduledTime && (
                        <p className="text-sm text-muted-foreground">
                          {appt.scheduledTime?.toDate
                            ? appt.scheduledTime.toDate().toLocaleString()
                            : String(appt.scheduledTime)}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/patient/appointments/${appt.id}`)
                        }
                      >
                        Open
                      </Button>

                      {appt.status === 'in_call' && (
                        <Button
                          size="sm"
                          className="bg-green-600"
                          onClick={() =>
                            router.push(`/video-call?appointmentId=${appt.id}`)
                          }
                        >
                          Join Call
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
