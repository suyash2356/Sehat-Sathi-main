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

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
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
    audioTracks.forEach(track => {
      track.enabled = enabled !== undefined ? enabled : !track.enabled;
    });

    return audioTracks[0]?.enabled ?? false;
  }

  toggleVideo(enabled?: boolean): boolean {
    if (!this.localStream) return false;

    const videoTracks = this.localStream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = enabled !== undefined ? enabled : !track.enabled;
    });

    return videoTracks[0]?.enabled ?? false;
  }

  endCall(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
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

  // Event handlers
  onRemoteStream?: (stream: MediaStream) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onConnectionStateChange?: (state: string | undefined) => void;
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
      credential: process.env.NEXT_PUBLIC_TURN_PASSWORD || 'openrelayproject'
    },
    {
      urls: process.env.NEXT_PUBLIC_TURN_URL_TLS || 'turn:openrelay.metered.ca:443?transport=tcp',
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || 'openrelayproject',
      credential: process.env.NEXT_PUBLIC_TURN_PASSWORD || 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10 // Pre-gathers ICE candidates to drastically speed up connection times
};
