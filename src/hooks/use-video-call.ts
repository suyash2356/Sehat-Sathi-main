'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WebRTCService, defaultWebRTCConfig, CallData } from '@/lib/webrtc';
import { SignalingService } from '@/lib/signaling';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { doc, getDoc, onSnapshot, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface VideoCallState {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callData: CallData | null;
  error: string | null;
  sessionStatus: 'loading' | 'active' | 'ended' | 'not_found';
  isInitiator: boolean; // Added
}

export function useVideoCall() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useUser();

  const [state, setState] = useState<VideoCallState>({
    isConnected: false,
    isConnecting: false,
    isMuted: false,
    isVideoOff: false,
    localStream: null,
    remoteStream: null,
    callData: null,
    error: null,
    sessionStatus: 'loading',
    isInitiator: false // Initial
  });

  const webrtcService = useRef<WebRTCService | null>(null);
  const signalingService = useRef<SignalingService | null>(null);
  const iceCandidateBuffer = useRef<RTCIceCandidateInit[]>([]);
  const sessionIdRef = useRef<string | null>(null);

  // Initialize Call Logic
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (!sessionId || !user) return;

    // Prevent double init
    if (sessionIdRef.current === sessionId) return;
    sessionIdRef.current = sessionId;

    console.log("Initializing Call Session:", sessionId);

    // 1. Fetch Session Data
    const sessionRef = doc(db, 'callSessions', sessionId);

    const unsubscribe = onSnapshot(sessionRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setState(prev => ({ ...prev, sessionStatus: 'ended', error: 'Call session ended.' }));
        // If session is gone, we should probably leave
        handleEndCallCleanup();
        return;
      }

      const sessionData = snapshot.data();

      // 2. Determine Role
      const isDoctor = user.uid === sessionData.doctorId;
      const isPatient = user.uid === sessionData.patientId;

      if (!isDoctor && !isPatient) {
        setState(prev => ({ ...prev, error: 'Unauthorized to join this call.' }));
        return;
      }

      const isInitiator = isDoctor; // STRICT ROLE: Doctor is Initiator

      setState(prev => ({
        ...prev,
        callData: { id: sessionId, ...sessionData } as any,
        sessionStatus: 'active',
        isInitiator // Store it
      }));

      // 3. Initialize WebRTC if not already done
      if (!webrtcService.current) {
        await startWebRTC(sessionId, isInitiator, sessionData.mode);
      }
    }, (err) => {
      console.error('Session snapshot error', err);
      setState(prev => ({ ...prev, error: err?.message || 'Session listener error' }));
      // If permission denied, attempt to cleanup
      if (err && err.code === 'permission-denied') {
        handleEndCallCleanup();
      }
    });

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [searchParams, user]);

  const startWebRTC = async (sessionId: string, isInitiator: boolean, mode: string) => {
    try {
      setState(prev => ({ ...prev, isConnecting: true }));

      signalingService.current = SignalingService.getInstance();
      webrtcService.current = new WebRTCService(defaultWebRTCConfig);

      // Setup WebRTC Listeners
      webrtcService.current.onRemoteStream = (stream) => {
        setState(prev => ({ ...prev, remoteStream: stream }));
      };

      webrtcService.current.onConnectionStateChange = (state) => {
        if (state === 'connected') {
          setState(prev => ({ ...prev, isConnected: true, isConnecting: false }));
          toast({ title: "Connected", description: "Secure connection established." });

          // Handle Voice Mode
          if (mode === 'voice') {
            webrtcService.current?.toggleVideo(false);
            setState(prev => ({ ...prev, isVideoOff: true }));
          }
        } else if (state === 'failed' || state === 'disconnected') {
          setState(prev => ({ ...prev, isConnected: false }));
        }
      };

      webrtcService.current.onIceCandidate = (candidate) => {
        signalingService.current?.sendIceCandidate(candidate);
      };

      // Start Media
      await webrtcService.current.initializeCall(sessionId, isInitiator);
      setState(prev => ({ ...prev, localStream: webrtcService.current!.getLocalStream() }));

      // Join Signaling
      await signalingService.current.joinCall(
        sessionId,
        user!.uid, // Safe due to useEffect check
        async (offer) => {
          if (!isInitiator && webrtcService.current) {
            const answer = await webrtcService.current.createAnswer(offer);
            await signalingService.current?.sendAnswer(answer);
          }
        },
        async (answer) => {
          if (isInitiator && webrtcService.current) {
            await webrtcService.current.setRemoteDescription(answer);
          }
        },
        async (candidate) => {
          if (webrtcService.current) {
            await webrtcService.current.addIceCandidate(candidate);
          }
        },
        () => {
          // On Remote End
          handleEndCallCleanup();
        }
      );

      // Verify Role Action
      if (isInitiator) {
        const offer = await webrtcService.current.createOffer();
        await signalingService.current.sendOffer(offer);
      }

    } catch (err: any) {
      console.error("WebRTC Start Error:", err);
      setState(prev => ({ ...prev, error: err.message, isConnecting: false }));
    }
  };

  const cleanup = () => {
    webrtcService.current?.endCall();
    signalingService.current?.endCall();
    webrtcService.current = null;
    signalingService.current = null;
  };

  const handleEndCallCleanup = () => {
    cleanup();
    setState(prev => ({ ...prev, isConnected: false, sessionStatus: 'ended' }));

    // Redirect based on role (using fresh state ref if possible, or user object)
    // We can rely on user object since it's in scope or from hook
    // But better to use the last known callData content
  };

  const endCall = async (_flag?: boolean) => {
    // 1. Delete Session Doc (Signals end to everyone)
    if (sessionIdRef.current && state.callData) {
      try {
        // Delete session
        await deleteDoc(doc(db, 'callSessions', sessionIdRef.current));

        // Update appointment status
        const apptRef = doc(db, 'appointments', state.callData.appointmentId);
        const apptSnap = await getDoc(apptRef);
        const apptData = apptSnap.exists() ? apptSnap.data() : {};

        // Ensure appointment retains patient details for history; if missing, try to populate from patients collection
        let patientDetails = apptData?.patientDetails || state.callData?.patientDetails || null;
        if (!patientDetails && state.callData?.patientId) {
          try {
            const patientSnap = await getDoc(doc(db, 'patients', state.callData.patientId));
            if (patientSnap.exists()) patientDetails = patientSnap.data();
          } catch (e) {
            // ignore
          }
        }

        const updatePayload: any = {
          status: 'completed',
          callStatus: 'ended',
          completedAt: serverTimestamp()
        };
        if (patientDetails) updatePayload.patientDetails = patientDetails;

        await updateDoc(apptRef, updatePayload);
      } catch (e) {
        console.error("Error ending call session:", e);
      }
    }
    handleEndCallCleanup();

    // 2. Redirect
    if (state.callData?.doctorId === user?.uid) {
      router.push('/doctor/dashboard');
    } else {
      router.push('/patient/dashboard');
    }
  };

  const toggleMute = () => {
    if (webrtcService.current) {
      const isMuted = !webrtcService.current.toggleAudio();
      setState(prev => ({ ...prev, isMuted }));
    }
  };

  const toggleVideo = () => {
    if (webrtcService.current) {
      const isVideoOff = !webrtcService.current.toggleVideo();
      setState(prev => ({ ...prev, isVideoOff }));
    }
  };

  return {
    ...state,
    sessionId: sessionIdRef.current,
    endCall, // Expose directly
    toggleMute,
    toggleVideo
  };
}
