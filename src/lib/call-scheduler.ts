'use client';

import { CallData } from './webrtc';
import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  getDoc,
  setDoc
} from 'firebase/firestore';

export class CallScheduler {
  private static instance: CallScheduler;
  private scheduledCalls: Map<string, NodeJS.Timeout> = new Map();
  private notificationCallbacks: ((callData: CallData) => void)[] = [];
  private demoMode: boolean;
  private pollingIntervals: Map<string, number> = new Map();

  private constructor() {
    // Determine demo mode from NEXT_PUBLIC_DEMO_MODE (string) - default false
    this.demoMode = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') || false;
    this.initializeScheduledCalls();
  }

  static getInstance(): CallScheduler {
    if (!CallScheduler.instance) {
      CallScheduler.instance = new CallScheduler();
    }
    return CallScheduler.instance;
  }

  private storageKey = 'demo_calls';

  private readLocalCalls(): any[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  private writeLocalCalls(calls: any[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(calls));
  }

  async createCall(callData: Omit<CallData, 'id' | 'createdAt' | 'callLink' | 'status'>): Promise<string> {
    const callId = this.generateCallId();
    const callLink = `${window.location.origin}/video-call?callId=${callId}`;

    const newCall: CallData = {
      ...callData,
      id: callId,
      createdAt: new Date(),
      callLink,
      status: 'pending'
    };

    // Demo/localStorage mode
    if (this.demoMode) {
      try {
        const calls = this.readLocalCalls();
        const cleanCallData: any = {
          id: newCall.id,
          patientId: newCall.patientId,
          doctorId: newCall.doctorId,
          isImmediate: newCall.isImmediate,
          status: newCall.status,
          createdAt: newCall.createdAt.toISOString(),
          callLink: newCall.callLink,
          patientName: newCall.patientName,
          patientPhone: newCall.patientPhone,
          issue: newCall.issue
        };
        if (newCall.scheduledTime) cleanCallData.scheduledTime = newCall.scheduledTime.toISOString();
        calls.push(cleanCallData);
        this.writeLocalCalls(calls);

        if (!newCall.isImmediate && newCall.scheduledTime) this.scheduleNotification(newCall);

        return callId;
      } catch (error) {
        console.error('Error creating call (demo):', error);
        throw error;
      }
    }

    // Firestore mode
    try {
      const cleanCallData: any = {
        patientId: newCall.patientId,
        doctorId: newCall.doctorId,
        isImmediate: newCall.isImmediate,
        status: newCall.status,
        createdAt: newCall.createdAt.toISOString(),
        callLink: newCall.callLink,
        patientName: newCall.patientName,
        patientPhone: newCall.patientPhone,
        issue: newCall.issue
      };
      if (newCall.scheduledTime) cleanCallData.scheduledTime = newCall.scheduledTime.toISOString();

      const docRef = await addDoc(collection(db, 'calls'), cleanCallData);
      const assignedId = docRef.id;

      // Schedule notifications if necessary
      if (!newCall.isImmediate && newCall.scheduledTime) {
        this.scheduleNotification({ ...newCall, id: assignedId });
      }

      return assignedId;
    } catch (error) {
      console.error('Error creating call (firestore):', error);
      throw error;
    }
  }

  async updateCallStatus(callId: string, status: CallData['status']): Promise<void> {
    if (this.demoMode) {
      try {
        const calls = this.readLocalCalls();
        const idx = calls.findIndex((c: any) => c.id === callId);
        if (idx > -1) {
          calls[idx].status = status;
          this.writeLocalCalls(calls);
        }
      } catch (error) {
        console.error('Error updating call status (demo):', error);
        throw error;
      }
      return;
    }

    try {
      const docRef = doc(db, 'calls', callId);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Error updating call status (firestore):', error);
      throw error;
    }
  }

  async getCall(callId: string): Promise<CallData | null> {
    if (this.demoMode) {
      try {
        const calls = this.readLocalCalls();
        const call = calls.find((c: any) => c.id === callId);
        if (call) {
          return {
            ...call,
            createdAt: new Date(call.createdAt),
            scheduledTime: call.scheduledTime ? new Date(call.scheduledTime) : undefined
          } as CallData;
        }
        return null;
      } catch (error) {
        console.error('Error getting call (demo):', error);
        return null;
      }
    }

    try {
      const docRef = doc(db, 'calls', callId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      const data: any = snap.data();
      return {
        ...data,
        id: callId,
        createdAt: new Date(data.createdAt),
        scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined
      } as CallData;
    } catch (error) {
      console.error('Error getting call (firestore):', error);
      return null;
    }
  }

  async getUpcomingCalls(patientId: string): Promise<CallData[]> {
    if (this.demoMode) {
      try {
        const calls = this.readLocalCalls();
        const filtered = calls.filter((c: any) => c.patientId === patientId && c.status === 'pending');
        return filtered.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          scheduledTime: c.scheduledTime ? new Date(c.scheduledTime) : undefined
        } as CallData));
      } catch (error) {
        console.error('Error getting upcoming calls (demo):', error);
        return [];
      }
    }

    try {
      const callQuery = query(
        collection(db, 'calls'),
        where('patientId', '==', patientId),
        where('status', '==', 'pending'),
        orderBy('scheduledTime', 'asc')
      );

      const querySnapshot = await getDocs(callQuery);
      return querySnapshot.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          createdAt: new Date(data.createdAt),
          scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined
        } as CallData;
      });
    } catch (error) {
      console.error('Error getting upcoming calls (firestore):', error);
      return [];
    }
  }

  subscribeToCalls(patientId: string, callback: (calls: CallData[]) => void): () => void {
    if (this.demoMode) {
      // Poll localStorage every 2 seconds and invoke callback if changed
      let last = '';
      const poll = () => {
        const calls = this.readLocalCalls();
        const filtered = calls.filter((c: any) => c.patientId === patientId && c.status === 'pending');
        const payload = JSON.stringify(filtered);
        if (payload !== last) {
          last = payload;
          callback(filtered.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            scheduledTime: c.scheduledTime ? new Date(c.scheduledTime) : undefined
          } as CallData)));
        }
      };
      poll();
      const id = window.setInterval(poll, 2000);
      this.pollingIntervals.set(patientId, id);
      return () => {
        const iv = this.pollingIntervals.get(patientId);
        if (iv) {
          clearInterval(iv);
          this.pollingIntervals.delete(patientId);
        }
      };
    }

    const callQuery = query(
      collection(db, 'calls'),
      where('patientId', '==', patientId),
      where('status', '==', 'pending'),
      orderBy('scheduledTime', 'asc')
    );

    return onSnapshot(callQuery, (querySnapshot) => {
      const calls = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: new Date(data.createdAt),
          scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined
        } as CallData;
      });
      callback(calls);
    });
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scheduleNotification(callData: CallData): void {
    if (!callData.scheduledTime) return;

    const notificationTime = new Date(callData.scheduledTime.getTime() - 5 * 60 * 1000); // 5 minutes before
    const now = new Date();

    if (notificationTime > now) {
      const timeout = setTimeout(() => {
        this.notifyCallStarting(callData);
        this.scheduledCalls.delete(callData.id);
      }, notificationTime.getTime() - now.getTime());

      this.scheduledCalls.set(callData.id, timeout);
    }
  }

  private notifyCallStarting(callData: CallData): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Video Call Starting Soon', {
        body: `Your call with Dr. ${callData.patientName || 'Doctor'} is starting in 5 minutes. Click to join.`,
        icon: '/favicon.ico',
        tag: callData.id
      });
    }

    this.notificationCallbacks.forEach(callback => callback(callData));
  }

  private async initializeScheduledCalls(): Promise<void> {
    try {
      if (this.demoMode) {
        const calls = this.readLocalCalls();
        calls.forEach((c: any) => {
          if (c.scheduledTime) {
            const callData: CallData = {
              ...c,
              createdAt: new Date(c.createdAt),
              scheduledTime: c.scheduledTime ? new Date(c.scheduledTime) : undefined
            } as CallData;
            if (callData.scheduledTime) this.scheduleNotification(callData);
          }
        });
        return;
      }

      // Firestore mode: get all pending scheduled calls and reschedule notifications
      const callQuery = query(
        collection(db, 'calls'),
        where('status', '==', 'pending'),
        where('isImmediate', '==', false)
      );

      const querySnapshot = await getDocs(callQuery);
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const callData: CallData = {
          ...data,
          id: doc.id,
          createdAt: new Date(data.createdAt),
          scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined
        } as CallData;

        if (callData.scheduledTime) {
          this.scheduleNotification(callData);
        }
      });
    } catch (error) {
      console.error('Error initializing scheduled calls:', error);
    }
  }

  addNotificationCallback(callback: (callData: CallData) => void): void {
    this.notificationCallbacks.push(callback);
  }

  removeNotificationCallback(callback: (callData: CallData) => void): void {
    const index = this.notificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1);
    }
  }

  cancelCall(callId: string): void {
    const timeout = this.scheduledCalls.get(callId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledCalls.delete(callId);
    }

    if (this.demoMode) {
      try {
        const calls = this.readLocalCalls();
        const idx = calls.findIndex((c: any) => c.id === callId);
        if (idx > -1) {
          calls.splice(idx, 1);
          this.writeLocalCalls(calls);
        }
      } catch (e) {
        console.error('Error cancelling call (demo):', e);
      }
    } else {
      // In Firestore mode we could mark as cancelled
      try {
        const docRef = doc(db, 'calls', callId);
        void updateDoc(docRef, { status: 'cancelled' });
      } catch (e) {
        console.error('Error cancelling call (firestore):', e);
      }
    }
  }
}
