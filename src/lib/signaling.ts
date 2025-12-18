'use client';

import { db } from '@/lib/firebase';
import { collection, doc, updateDoc, onSnapshot, addDoc, getDoc, setDoc } from 'firebase/firestore';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate';
  data: any;
}

export class SignalingService {
  private static instance: SignalingService;
  private callId: string | null = null;
  private currentUserUid: string | null = null;
  private joinTime: number = Date.now();
  private unsubscribe: (() => void) | null = null;
  private unsubscribeCandidates: (() => void) | null = null;

  private constructor() { }

  static getInstance(): SignalingService {
    if (!SignalingService.instance) {
      SignalingService.instance = new SignalingService();
    }
    return SignalingService.instance;
  }

  // Setups up listeners for remote offer/answer/candidates
  async joinCall(callId: string, uid: string, onOffer: (offer: any) => void, onAnswer: (answer: any) => void, onCandidate: (candidate: any) => void): Promise<void> {
    this.callId = callId;
    this.currentUserUid = uid;
    this.joinTime = Date.now();
    const callDocRef = doc(db, 'calls', callId);

    // Ensure doc exists (if not, create it placeholder) - usually appointment creation does this or first joiner
    const callDoc = await getDoc(callDocRef);
    if (!callDoc.exists()) {
      await setDoc(callDocRef, { createdAt: new Date() });
    }

    // Listen to call document for Offer/Answer
    this.unsubscribe = onSnapshot(callDocRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      // Ignore messages sent by self
      if (data.senderId === this.currentUserUid) return;

      // Ignore stale messages from previous sessions
      if (data.timestamp && data.timestamp < this.joinTime - 5000) return; // 5s grace

      if (data.offer) {
        onOffer(data.offer);
      }
      if (data.answer) {
        onAnswer(data.answer);
      }
    });

    // Listen for ICE candidates
    const candidatesRef = collection(db, 'calls', callId, 'candidates');
    this.unsubscribeCandidates = onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Filter out candidates sent by self OR from previous sessions
          if (data.senderId !== this.currentUserUid && (!data.timestamp || data.timestamp > this.joinTime - 5000)) {
            onCandidate(data);
          }
        }
      });
    });
  }

  async sendOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');
    const callDocRef = doc(db, 'calls', this.callId);
    await updateDoc(callDocRef, {
      offer,
      senderId: this.currentUserUid,
      timestamp: Date.now()
    });
  }

  async sendAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');
    const callDocRef = doc(db, 'calls', this.callId);
    await updateDoc(callDocRef, {
      answer,
      senderId: this.currentUserUid,
      timestamp: Date.now()
    });
  }

  async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.callId || !this.currentUserUid) throw new Error('Not in a call');
    const candidatesRef = collection(db, 'calls', this.callId, 'candidates');
    await addDoc(candidatesRef, {
      ...candidate.toJSON(),
      senderId: this.currentUserUid,
      timestamp: Date.now()
    });
  }

  endCall(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.unsubscribeCandidates) {
      this.unsubscribeCandidates();
      this.unsubscribeCandidates = null;
    }
    this.callId = null;
  }
}
