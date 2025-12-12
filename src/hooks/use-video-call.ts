'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WebRTCService, defaultWebRTCConfig, CallData } from '@/lib/webrtc';
import { CallScheduler } from '@/lib/call-scheduler';
import { SignalingService, SignalingMessage } from '@/lib/signaling';
import { useToast } from '@/hooks/use-toast';

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
  const callScheduler = useRef<CallScheduler | null>(null);
  const signalingService = useRef<SignalingService | null>(null);

  useEffect(() => {
    callScheduler.current = CallScheduler.getInstance();
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
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Create demo call data immediately
      const callData = {
        id: callId,
        patientId: 'demo_patient',
        doctorId: 'demo_doctor',
        isImmediate: true,
        status: 'pending' as const,
        createdAt: new Date(),
        callLink: `${window.location.origin}/video-call?callId=${callId}`,
        patientName: 'Demo Patient',
        patientPhone: '9876543210',
        issue: 'Demo consultation'
      };

      // Initialize WebRTC service
      webrtcService.current = new WebRTCService(defaultWebRTCConfig);
      
      // Set up event handlers
      webrtcService.current.onRemoteStream = (stream) => {
        setState(prev => ({ ...prev, remoteStream: stream }));
      };

      webrtcService.current.onConnectionStateChange = (connectionState) => {
        if (connectionState === 'connected') {
          setState(prev => ({ 
            ...prev, 
            isConnected: true, 
            isConnecting: false 
          }));
          toast({
            title: 'Call Connected',
            description: 'You are now connected to the doctor.'
          });
        } else if (connectionState === 'disconnected' || connectionState === 'failed') {
          setState(prev => ({ 
            ...prev, 
            isConnected: false, 
            isConnecting: false 
          }));
          toast({
            title: 'Call Disconnected',
            description: 'The call has ended.'
          });
        }
      };

      // Initialize the call
      await webrtcService.current.initializeCall(callId, true);
      
      const localStream = webrtcService.current.getLocalStream();
      
      setState(prev => ({ 
        ...prev, 
        localStream,
        callData,
        isConnecting: false 
      }));

      // Simulate connection after 1 second
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          isConnected: true
        }));
        toast({
          title: 'Video Call Ready',
          description: 'Your video call interface is ready. In production, you would be connected to a real doctor.'
        });
      }, 1000);

    } catch (error) {
      console.error('Error initializing call:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to initialize call',
        isConnecting: false 
      }));
      toast({
        variant: 'destructive',
        title: 'Call Error',
        description: 'Failed to initialize the video call.'
      });
    }
  }, [toast]);

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
    if (webrtcService.current) {
      webrtcService.current.endCall();
    }

    if (signalingService.current) {
      await signalingService.current.endCall();
    }

    if (state.callData) {
      await callScheduler.current?.updateCallStatus(state.callData.id, 'completed');
    }

    setState(prev => ({ 
      ...prev, 
      isConnected: false,
      isConnecting: false,
      localStream: null,
      remoteStream: null,
      callData: null
    }));

    toast({
      title: 'Call Ended',
      description: 'Your consultation has ended.'
    });

    router.push('/map');
  }, [state.callData, toast, router]);

  const createImmediateCall = useCallback(async (patientData: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    issue: string;
  }) => {
    try {
      // Create call ID immediately without any database calls
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      toast({
        title: 'Call Created Successfully',
        description: 'Your video call has been created. You will be redirected to the call interface.'
      });
      
      // Redirect immediately
      router.push(`/video-call?callId=${callId}`);
      
    } catch (error) {
      console.error('Error creating immediate call:', error);
      toast({
        variant: 'destructive',
        title: 'Call Error',
        description: 'Failed to create the video call. Please try again.'
      });
    }
  }, [router, toast]);

  const createScheduledCall = useCallback(async (patientData: {
    patientId: string;
    patientName: string;
    patientPhone: string;
    issue: string;
    scheduledTime: Date;
  }) => {
    try {
      // Always create call using scheduler (now uses localStorage)
      const callId = await callScheduler.current?.createCall({
        ...patientData,
        doctorId: 'doctor_1', // Default doctor ID
        isImmediate: false
      });

      if (callId) {
        toast({
          title: 'Call Scheduled Successfully',
          description: `Your video call has been scheduled for ${patientData.scheduledTime.toLocaleString()}. You'll receive a notification 5 minutes before the call.`
        });
        router.push('/map');
      }
    } catch (error) {
      console.error('Error creating scheduled call:', error);
      toast({
        variant: 'destructive',
        title: 'Scheduling Error',
        description: 'Failed to schedule the video call. Please try again.'
      });
    }
  }, [router, toast]);

  // Auto-initialize call if callId is in URL
  useEffect(() => {
    const callId = searchParams.get('callId');
    if (callId && !state.callData) {
      initializeCall(callId);
    }
  }, [searchParams, initializeCall, state.callData]);

  return {
    ...state,
    initializeCall,
    toggleMute,
    toggleVideo,
    endCall,
    createImmediateCall,
    createScheduledCall
  };
}
