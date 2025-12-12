'use client';

import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';

export interface SignalingMessage {
  id: string;
  callId: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-ended';
  data: any;
  timestamp: Date;
  from: string; // 'patient' | 'doctor'
}

export class SignalingService {
  private static instance: SignalingService;
  private callId: string | null = null;
  private isDoctor: boolean = false;
  private messageCallbacks: ((message: SignalingMessage) => void)[] = [];

  private constructor() {}

  static getInstance(): SignalingService {
    if (!SignalingService.instance) {
      SignalingService.instance = new SignalingService();
    }
    return SignalingService.instance;
  }

  async joinCall(callId: string, isDoctor: boolean = false): Promise<void> {
    this.callId = callId;
    this.isDoctor = isDoctor;

    // Listen for signaling messages
    const messagesQuery = query(
      collection(db, 'signaling'),
      where('callId', '==', callId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    onSnapshot(messagesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const message: SignalingMessage = {
            ...data,
            timestamp: new Date(data.timestamp)
          };
          
          // Only process messages not sent by current user
          if (message.from !== (isDoctor ? 'doctor' : 'patient')) {
            this.messageCallbacks.forEach(callback => callback(message));
          }
        }
      });
    });
  }

  async sendOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');
    
    await this.sendMessage({
      type: 'offer',
      data: offer
    });
  }

  async sendAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');
    
    await this.sendMessage({
      type: 'answer',
      data: answer
    });
  }

  async sendIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');
    
    await this.sendMessage({
      type: 'ice-candidate',
      data: candidate
    });
  }

  async endCall(): Promise<void> {
    if (!this.callId) return;
    
    await this.sendMessage({
      type: 'call-ended',
      data: {}
    });
    
    this.callId = null;
  }

  onMessage(callback: (message: SignalingMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  private async sendMessage(message: Omit<SignalingMessage, 'id' | 'callId' | 'timestamp' | 'from'>): Promise<void> {
    if (!this.callId) throw new Error('Not in a call');

    const signalingMessage: Omit<SignalingMessage, 'id'> = {
      ...message,
      callId: this.callId,
      timestamp: new Date(),
      from: this.isDoctor ? 'doctor' : 'patient'
    };

    await addDoc(collection(db, 'signaling'), {
      ...signalingMessage,
      timestamp: signalingMessage.timestamp.toISOString()
    });
  }
}
