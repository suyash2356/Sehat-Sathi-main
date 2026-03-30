'use client';

/* ------------------------------------------------------------------ */
/*  WebRTC Service                                                     */
/*  Manages RTCPeerConnection, local/remote streams, ICE handling      */
/* ------------------------------------------------------------------ */

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
}

export interface CallData {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  doctorName?: string;
  doctorSpecialization?: string;
  patientDetails?: {
    name: string;
    age?: number;
    gender?: string;
    disease?: string;
    phone?: string;
  };
  mode: 'video' | 'voice';
  status: string;
  callStatus?: string;
  age?: number;
  gender?: string;
  initiatorMuted?: boolean;
  receiverMuted?: boolean;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callId: string | null = null;
  private config: WebRTCConfig;

  // Event handlers
  onRemoteStream?: (stream: MediaStream) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onConnectionStateChange?: (state: string | undefined) => void;

  constructor(config: WebRTCConfig) {
    this.config = config;
  }

  /**
   * Initialize the call:
   * 1. Create RTCPeerConnection
   * 2. Get local media (respecting voice-only mode)
   * 3. Explicitly enable audio tracks
   * 4. Add ALL tracks to peer connection BEFORE any offer/answer
   */
  async initializeCall(
    callId: string,
    isInitiator: boolean,
    isVoiceOnly: boolean = false
  ): Promise<void> {
    try {
      this.callId = callId;

      // Step 1: Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
        iceCandidatePoolSize: this.config.iceCandidatePoolSize ?? 10,
      });

      // Step 2: Get local media — mode-aware constraints
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: isVoiceOnly ? false : true,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Step 3: Explicitly enable audio tracks (some browsers start muted)
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });

      // Step 4: Add ALL tracks to peer connection BEFORE any offer is created
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Setup remote stream receiver
      this.remoteStream = new MediaStream();
      this.peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream!.addTrack(track);
        });
        this.onRemoteStream?.(this.remoteStream!);
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.onIceCandidate?.(event.candidate);
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        this.onConnectionStateChange?.(this.peerConnection?.connectionState);
      };
    } catch (error) {
      console.error('Error initializing call:', error);
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(
    description: RTCSessionDescriptionInit
  ): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(description);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  getSignalingState(): RTCSignalingState | null {
    return this.peerConnection?.signalingState ?? null;
  }

  hasRemoteDescription(): boolean {
    return !!this.peerConnection?.remoteDescription;
  }

  toggleAudio(enabled?: boolean): boolean {
    if (!this.localStream) return false;

    const audioTracks = this.localStream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = enabled !== undefined ? enabled : !track.enabled;
    });

    return audioTracks[0]?.enabled ?? false;
  }

  toggleVideo(enabled?: boolean): boolean {
    if (!this.localStream) return false;

    const videoTracks = this.localStream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = enabled !== undefined ? enabled : !track.enabled;
    });

    return videoTracks[0]?.enabled ?? false;
  }

  endCall(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.callId = null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}

// Default ICE servers configuration
export const defaultWebRTCConfig: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    {
      urls: process.env.NEXT_PUBLIC_TURN_URL || 'turn:openrelay.metered.ca:80',
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || 'openrelayproject',
      credential:
        process.env.NEXT_PUBLIC_TURN_PASSWORD || 'openrelayproject',
    },
    {
      urls:
        process.env.NEXT_PUBLIC_TURN_URL_TLS ||
        'turn:openrelay.metered.ca:443?transport=tcp',
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || 'openrelayproject',
      credential:
        process.env.NEXT_PUBLIC_TURN_PASSWORD || 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
};
