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
  async joinCall(callId: string, onOffer: (offer: any) => void, onAnswer: (answer: any) => void, onCandidate: (candidate: any) => void): Promise<void> {
    this.callId = callId;
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

      // If we see an offer and we didn't create it (conceptually), but here simpler:
      // The checking of "did I send this" is usually done by checking who set it, or state.
      // We will just pass data up and let caller handle "ignore my own offer".
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
          onCandidate(data);
        }
      });
    });
  }

  async sendOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');
    const callDocRef = doc(db, 'calls', this.callId);
    await updateDoc(callDocRef, { offer });
  }

  async sendAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');
    const callDocRef = doc(db, 'calls', this.callId);
    await updateDoc(callDocRef, { answer });
  }

  async sendIceCandidate(candidate: RTCIceCandidate, type: 'offer' | 'answer' = 'offer'): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');
    const candidatesRef = collection(db, 'calls', this.callId, 'candidates');
    // We can allow adding candidate directly
    await addDoc(candidatesRef, {
      ...candidate.toJSON(),
      type // useful to distinguish who sent it if needed, or stick to simple
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
