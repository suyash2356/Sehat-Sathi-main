'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WebRTCService, defaultWebRTCConfig, CallData } from '@/lib/webrtc';
import { SignalingService } from '@/lib/signaling';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

export interface VideoCallState {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callData: CallData | null;
  error: string | null;
}

export function useVideoCall() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useUser(); // Get current user to determine role

  const [state, setState] = useState<VideoCallState>({
    isConnected: false,
    isConnecting: false,
    isMuted: false,
    isVideoOff: false,
    localStream: null,
    remoteStream: null,
    callData: null,
    error: null
  });

  const webrtcService = useRef<WebRTCService | null>(null);
  const signalingService = useRef<SignalingService | null>(null);

  useEffect(() => {
    signalingService.current = SignalingService.getInstance();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (webrtcService.current) {
        webrtcService.current.endCall();
      }
      if (signalingService.current) {
        signalingService.current.endCall();
      }
    };
  }, []);

  const initializeCall = useCallback(async (callId: string) => {
    if (!user) {
      console.warn("User not authenticated, cannot initialize call properly yet.");
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // 1. Fetch Appointment to determine role
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      const appDoc = await getDoc(doc(db, 'appointments', callId));
      if (!appDoc.exists()) {
        throw new Error("Appointment not found");
      }

      const appData = appDoc.data();
      setState(prev => ({ ...prev, callData: appData as any }));

      const isInitiator = user.uid === appData.patientId;
      console.log(`Role determined: ${isInitiator ? 'Initiator (Patient)' : 'Receiver (Doctor)'}`);

      // 2. Initialize WebRTC
      webrtcService.current = new WebRTCService(defaultWebRTCConfig);

      webrtcService.current.onRemoteStream = (stream) => {
        console.log("Remote stream received");
        setState(prev => ({ ...prev, remoteStream: stream }));
      };

      webrtcService.current.onConnectionStateChange = (connectionState) => {
        console.log("Connection state:", connectionState);
        if (connectionState === 'connected') {
          setState(prev => ({ ...prev, isConnected: true, isConnecting: false }));
          toast({ title: 'Connected', description: 'Video connection established.' });
        } else if (connectionState === 'disconnected' || connectionState === 'failed') {
          setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
          toast({ title: 'Disconnected', description: 'Call disconnected.' });
        }
      };

      webrtcService.current.onIceCandidate = (candidate) => {
        if (signalingService.current) {
          signalingService.current.sendIceCandidate(candidate);
        }
      };

      // 3. Start Call (Get Local Media)
      await webrtcService.current.initializeCall(callId, isInitiator);
      const localStream = webrtcService.current.getLocalStream();
      setState(prev => ({ ...prev, localStream }));

      // 4. Setup Signaling
      if (signalingService.current) {
        await signalingService.current.joinCall(
          callId,
          async (offer) => {
            // On Offer received
            // If I am Initiator, I sent the offer (or older one), so ignore.
            // If I am Receiver, I accept offer.
            if (!isInitiator) {
              console.log("Received Offer (as Receiver)");
              if (webrtcService.current) {
                // Check if we are already connected or have processed an offer to avoid loops?
                // WebRTCService typically handles state, but let's be safe.
                const answer = await webrtcService.current.createAnswer(offer);
                await signalingService.current?.sendAnswer(answer);
              }
            } else {
              console.log("Ignored Offer (as Initiator)");
            }
          },
          async (answer) => {
            // On Answer received
            // If I am Initiator, I accept answer.
            // If I am Receiver, I sent the answer, so ignore.
            if (isInitiator) {
              console.log("Received Answer (as Initiator)");
              if (webrtcService.current) {
                await webrtcService.current.setRemoteDescription(answer);
              }
            } else {
              console.log("Ignored Answer (as Receiver)");
            }
          },
          async (candidate) => {
            if (webrtcService.current) {
              await webrtcService.current.addIceCandidate(candidate);
            }
          }
        );
      }

      // 5. If Initiator, Create Offer
      if (isInitiator) {
        console.log("Creating Offer (as Initiator)");
        if (webrtcService.current) {
          const offer = await webrtcService.current.createOffer();
          await signalingService.current?.sendOffer(offer);
        }
      }

    } catch (error) {
      console.error('Error initializing call:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize call',
        isConnecting: false
      }));
    }
  }, [toast, user]);

  const toggleMute = useCallback(() => {
    if (webrtcService.current) {
      const isMuted = !webrtcService.current.toggleAudio();
      setState(prev => ({ ...prev, isMuted }));
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (webrtcService.current) {
      const isVideoOff = !webrtcService.current.toggleVideo();
      setState(prev => ({ ...prev, isVideoOff }));
    }
  }, []);

  const endCall = useCallback(async () => {
    if (webrtcService.current) webrtcService.current.endCall();
    if (signalingService.current) signalingService.current.endCall();

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      localStream: null,
      remoteStream: null,
      callData: null
    }));

    toast({ title: 'Call Ended', description: 'Your consultation has ended.' });
    router.push('/map');
  }, [toast, router]);

  // Auto-initialize call if callId is in URL and user is loaded
  useEffect(() => {
    const callId = searchParams.get('callId');
    if (callId && !state.callData && !state.isConnecting && user) {
      initializeCall(callId);
    }
  }, [searchParams, initializeCall, state.callData, state.isConnecting, user]);

  return {
    ...state,
    initializeCall,
    toggleMute,
    toggleVideo,
    endCall
  };
}
