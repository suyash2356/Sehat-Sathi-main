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
  isInitiator: boolean;
  remoteMuted: boolean;
  mode: 'video' | 'voice';
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
    isInitiator: false,
    remoteMuted: false,
    mode: 'video',
  });

  const webrtcService = useRef<WebRTCService | null>(null);
  const signalingService = useRef<SignalingService | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Initialize Call Logic
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (!sessionId || !user) return;

    // Prevent double init
    if (sessionIdRef.current === sessionId) return;
    sessionIdRef.current = sessionId;

    console.log('Initializing Call Session:', sessionId);

    const sessionRef = doc(db, 'callSessions', sessionId);

    const unsubscribe = onSnapshot(
      sessionRef,
      async (snapshot) => {
        if (!snapshot.exists()) {
          setState((prev) => ({
            ...prev,
            sessionStatus: 'ended',
            error: 'Call session ended.',
          }));
          handleEndCallCleanup();
          return;
        }

        const sessionData = snapshot.data();

        // Determine Role
        const isDoctor = user.uid === sessionData.doctorId;
        const isPatient = user.uid === sessionData.patientId;

        if (!isDoctor && !isPatient) {
          setState((prev) => ({
            ...prev,
            error: 'Unauthorized to join this call.',
          }));
          return;
        }

        const isInitiator = isDoctor; // Doctor is always initiator
        const mode = (sessionData.mode as 'video' | 'voice') || 'video';

        setState((prev) => ({
          ...prev,
          callData: { id: sessionId, ...sessionData } as CallData,
          sessionStatus: 'active',
          isInitiator,
          mode,
          remoteMuted: isInitiator
            ? !!sessionData.receiverMuted
            : !!sessionData.initiatorMuted,
        }));

        // Initialize WebRTC if not already done
        if (!webrtcService.current) {
          await startWebRTC(sessionId, isInitiator, mode);
        }
      },
      (err) => {
        console.error('Session snapshot error', err);
        setState((prev) => ({
          ...prev,
          error: err?.message || 'Session listener error',
        }));
        if (err && (err as any).code === 'permission-denied') {
          handleEndCallCleanup();
        }
      }
    );

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [searchParams, user]);

  const startWebRTC = async (
    sessionId: string,
    isInitiator: boolean,
    mode: 'video' | 'voice'
  ) => {
    try {
      setState((prev) => ({ ...prev, isConnecting: true }));

      signalingService.current = SignalingService.getInstance();
      webrtcService.current = new WebRTCService(defaultWebRTCConfig);

      // Setup WebRTC Listeners
      webrtcService.current.onRemoteStream = (stream) => {
        setState((prev) => ({ ...prev, remoteStream: stream }));
      };

      webrtcService.current.onConnectionStateChange = (connState) => {
        if (connState === 'connected') {
          setState((prev) => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
          }));
          toast({
            title: 'Connected',
            description: 'Secure connection established.',
          });
        } else if (connState === 'failed' || connState === 'disconnected') {
          setState((prev) => ({ ...prev, isConnected: false }));
        }
      };

      webrtcService.current.onIceCandidate = (candidate) => {
        signalingService.current?.sendIceCandidate(candidate);
      };

      // Start Media — pass isVoiceOnly based on mode
      const isVoiceOnly = mode === 'voice';
      await webrtcService.current.initializeCall(
        sessionId,
        isInitiator,
        isVoiceOnly
      );
      setState((prev) => ({
        ...prev,
        localStream: webrtcService.current!.getLocalStream(),
        isVideoOff: isVoiceOnly,
      }));

      // Join Signaling
      await signalingService.current.joinCall(
        sessionId,
        user!.uid,
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
          handleEndCallCleanup();
        }
      );

      // Initiator creates offer
      if (isInitiator) {
        // Clear stale signaling states
        try {
          await updateDoc(doc(db, 'callSessions', sessionId), {
            offer: null,
            answer: null,
            initiatorMuted: false,
            receiverMuted: false,
          });
        } catch (e) {
          // Ignore if doc was removed
        }
        const offer = await webrtcService.current.createOffer();
        await signalingService.current.sendOffer(offer);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'WebRTC initialization failed';
      console.error('WebRTC Start Error:', err);
      setState((prev) => ({
        ...prev,
        error: errMsg,
        isConnecting: false,
      }));
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
    setState((prev) => ({
      ...prev,
      isConnected: false,
      sessionStatus: 'ended',
    }));
  };

  const endCall = async () => {
    if (sessionIdRef.current && state.callData) {
      try {
        await deleteDoc(doc(db, 'callSessions', sessionIdRef.current));

        const apptId = state.callData.appointmentId || sessionIdRef.current;
        const apptRef = doc(db, 'appointments', apptId);
        const apptSnap = await getDoc(apptRef);
        const apptData = apptSnap.exists() ? apptSnap.data() : {};

        let patientDetails =
          apptData?.patientDetails ||
          state.callData?.patientDetails ||
          null;
        if (!patientDetails && state.callData?.patientId) {
          try {
            const patientSnap = await getDoc(
              doc(db, 'patients', state.callData.patientId)
            );
            if (patientSnap.exists()) patientDetails = patientSnap.data();
          } catch (e) {
            // ignore
          }
        }

        const updatePayload: Record<string, unknown> = {
          status: 'completed',
          callStatus: 'ended',
          completedAt: serverTimestamp(),
        };
        if (patientDetails) updatePayload.patientDetails = patientDetails;

        await updateDoc(apptRef, updatePayload);
      } catch (e) {
        console.error('Error ending call session:', e);
      }
    }
    handleEndCallCleanup();

    if (state.callData?.doctorId === user?.uid) {
      router.push('/doctor/dashboard');
    } else {
      router.push('/map');
    }
  };

  const toggleMute = async () => {
    if (webrtcService.current) {
      const isMuted = !webrtcService.current.toggleAudio();
      setState((prev) => ({ ...prev, isMuted }));

      if (sessionIdRef.current) {
        try {
          await updateDoc(doc(db, 'callSessions', sessionIdRef.current), {
            [state.isInitiator ? 'initiatorMuted' : 'receiverMuted']: isMuted,
          });
        } catch (e) {
          // ignore
        }
      }
    }
  };

  const toggleVideo = () => {
    if (webrtcService.current) {
      const isVideoOff = !webrtcService.current.toggleVideo();
      setState((prev) => ({ ...prev, isVideoOff }));
    }
  };

  return {
    ...state,
    sessionId: sessionIdRef.current,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
