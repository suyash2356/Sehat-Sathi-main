"use client";

import { useEffect, useState } from 'react';
import { CallScheduler } from '@/lib/call-scheduler';
import { CallData } from '@/lib/webrtc';

export default function CallTesterPage() {
  const sched = CallScheduler.getInstance();
  const [patientName, setPatientName] = useState('Demo Patient');
  const [patientPhone, setPatientPhone] = useState('9876543210');
  const [doctorId, setDoctorId] = useState('demo_doctor');
  const [issue, setIssue] = useState('Test consultation');
  const [scheduledTime, setScheduledTime] = useState('');
  const [calls, setCalls] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(false);

  const demoMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  useEffect(() => {
    // Initial list
    refreshCalls();
    // Subscribe when in firestore mode to get realtime updates
    let unsub: (() => void) | undefined;
    if (!demoMode) {
      unsub = sched.subscribeToCalls('demo_patient', (c) => setCalls(c));
    }
    return () => unsub && unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshCalls() {
    setLoading(true);
    try {
      const list = await sched.getUpcomingCalls('demo_patient');
      setCalls(list);
    } catch (e) {
      console.error(e);
      setCalls([]);
    } finally {
      setLoading(false);
    }
  }

  async function createImmediate() {
    try {
      const callId = await sched.createCall({
        patientId: 'demo_patient',
        patientName,
        patientPhone,
        doctorId,
        isImmediate: true,
        issue
      } as any);
      alert('Created call: ' + callId);
      await refreshCalls();
    } catch (e) {
      console.error(e);
      alert('Create failed: ' + (e as Error).message);
    }
  }

  async function createScheduled() {
    if (!scheduledTime) {
      alert('Select a scheduled time first');
      return;
    }
    try {
      const dt = new Date(scheduledTime);
      const callId = await sched.createCall({
        patientId: 'demo_patient',
        patientName,
        patientPhone,
        doctorId,
        isImmediate: false,
        scheduledTime: dt,
        issue
      } as any);
      alert('Scheduled call: ' + callId);
      await refreshCalls();
    } catch (e) {
      console.error(e);
      alert('Create failed: ' + (e as Error).message);
    }
  }

  function clearDemoStorage() {
    localStorage.removeItem('demo_calls');
    refreshCalls();
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Call Scheduler Tester</h2>
        <p className="mb-4">Mode: <strong>{demoMode ? 'Demo (localStorage)' : 'Firestore'}</strong></p>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <input className="input" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Patient Name" />
          <input className="input" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} placeholder="Patient Phone" />
          <input className="input" value={doctorId} onChange={e => setDoctorId(e.target.value)} placeholder="Doctor ID" />
          <input className="input" value={issue} onChange={e => setIssue(e.target.value)} placeholder="Issue" />
          <label>Scheduled Time (local):</label>
          <input type="datetime-local" className="input" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
        </div>

        <div className="flex gap-3 mb-6">
          <button className="btn" onClick={createImmediate}>Create Immediate Call</button>
          <button className="btn" onClick={createScheduled}>Create Scheduled Call</button>
          <button className="btn-ghost" onClick={clearDemoStorage}>Clear Demo Storage</button>
          <button className="btn-outline" onClick={refreshCalls}>Refresh List</button>
        </div>

        <section>
          <h3 className="text-lg font-semibold mb-2">Upcoming Calls (patientId: demo_patient)</h3>
          {loading ? <p>Loading...</p> : (
            <ul className="space-y-2">
              {calls.length === 0 && <li className="text-sm text-gray-500">No calls</li>}
              {calls.map(c => (
                <li key={c.id} className="p-3 bg-white dark:bg-gray-800 rounded-md border">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{c.patientName} ({c.patientPhone})</div>
                      <div className="text-sm text-gray-500">Issue: {c.issue}</div>
                      <div className="text-sm text-gray-500">Doctor: {c.doctorId || (c as any).doctorId}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div>{c.status}</div>
                      <div>{c.scheduledTime ? new Date(c.scheduledTime).toLocaleString() : 'Immediate'}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
