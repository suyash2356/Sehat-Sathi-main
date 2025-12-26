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
  private unsubscribe: (() => void) | null = null;
  private unsubscribeCandidates: (() => void) | null = null;

  private constructor() { }

  static getInstance(): SignalingService {
    if (!SignalingService.instance) {
      SignalingService.instance = new SignalingService();
    }
    return SignalingService.instance;
  }

  // Connects to the Call Session for Signaling
  async joinCall(callId: string, uid: string, onOffer: (offer: any) => void, onAnswer: (answer: any) => void, onCandidate: (candidate: any) => void, onEnd: () => void): Promise<void> {
    this.callId = callId;
    this.currentUserUid = uid;

    // In new architecture, 'callId' IS the 'sessionId'
    // Signaling data lives in `callSessions/{sessionId}`
    const sessionDocRef = doc(db, 'callSessions', callId);

    // Listen to Session Document for Offer/Answer/Status
    this.unsubscribe = onSnapshot(sessionDocRef, async (snapshot) => {
      if (!snapshot.exists()) {
        console.warn("Signaling: Session document does not exist (or deleted). Ending call.");
        onEnd();
        return;
      }

      const data = snapshot.data();

      // Check for End Call
      if (data.status === 'ended' || data.callStatus === 'ended') {
        onEnd();
        return;
      }

      // Offer: canonical shape is { senderId, description: RTCSessionDescriptionInit, timestamp }
      if (data.offer && data.offer.senderId !== this.currentUserUid) {
        onOffer(data.offer.description ?? data.offer.sdp ?? data.offer);
      }

      // Answer: canonical shape is { senderId, description }
      if (data.answer && data.answer.senderId !== this.currentUserUid) {
        onAnswer(data.answer.description ?? data.answer.sdp ?? data.answer);
      }
    }, (err) => {
      console.error('Signaling session snapshot error', err);
      // If permission-denied, notify the caller to end call
      if (err && err.code === 'permission-denied') {
        onEnd();
      }
    });

    // Listen for ICE candidates in subcollection `callSessions/{sessionId}/candidates`
    const candidatesRef = collection(db, 'callSessions', callId, 'candidates');
    this.unsubscribeCandidates = onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Filter out candidates sent by self
          if (data.senderId !== this.currentUserUid) {
            // Candidate documents contain the full candidate fields; emit as RTCIceCandidateInit shape
            const candidateInit: any = {
              candidate: (typeof data.candidate === 'string') ? data.candidate : (data.candidate?.candidate || ''),
              sdpMid: data.sdpMid,
              sdpMLineIndex: data.sdpMLineIndex
            };
            onCandidate(candidateInit);
          }
        }
      });
    }, (err) => {
      console.error('Signaling candidates snapshot error', err);
      if (err && err.code === 'permission-denied') {
        onEnd();
      }
    });
  }

  async sendOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');
    const docRef = doc(db, 'callSessions', this.callId);
    // Merge offer into the session document with canonical shape
    await setDoc(docRef, {
      offer: {
        senderId: this.currentUserUid,
        description: offer,
        timestamp: Date.now()
      }
    }, { merge: true });
  }

  async sendAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');
    const docRef = doc(db, 'callSessions', this.callId);
    // Merge answer into the session document with canonical shape
    await setDoc(docRef, {
      answer: {
        senderId: this.currentUserUid,
        description: answer,
        timestamp: Date.now()
      }
    }, { merge: true });
  }

  async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.callId || !this.currentUserUid) throw new Error('Not in a call');
    const candidatesRef = collection(db, 'callSessions', this.callId, 'candidates');
    await addDoc(candidatesRef, {
      // Store canonical candidate fields and sender
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
      senderId: this.currentUserUid,
      timestamp: Date.now()
    });
  }

  async notifyEndCall(): Promise<void> {
    // In the new architecture, ending the call acts as a DELETE or Status Update.
    // We update status here. The component might also delete the doc.
    if (!this.callId) return;
    const docRef = doc(db, 'callSessions', this.callId);
    try {
      await updateDoc(docRef, {
        status: 'ended'
      });
    } catch (e) {
      // If doc deleted, ignore
    }
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
