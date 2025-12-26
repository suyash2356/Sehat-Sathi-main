
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff, Loader2, User as UserIcon, ShieldPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { useSearchParams } from 'next/navigation';
import { translations } from '@/lib/translations';
import { useVideoCall } from '@/hooks/use-video-call';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const doctorImage = PlaceHolderImages.find(p => p.id === 'tele-consultation');

export default function VideoCall() {
  const { language } = useChatLanguage();
  const t = translations[language].videoCall;
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const {
    isConnected,
    isConnecting,
    isMuted,
    isVideoOff,
    localStream,
    remoteStream,
    callData,
    isInitiator,
    error,
    toggleMute,
    toggleVideo,
    endCall
  } = useVideoCall(); // initializeCall removed as it is auto-handled

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Map logical sides (left=patient, right=doctor) to local/remote depending on role
  // Doctor (initiator): left = remote (patient), right = local (doctor)
  // Patient (non-initiator): left = local (patient), right = remote (doctor)
  const leftStream = isInitiator ? remoteStream : localStream;
  const rightStream = isInitiator ? localStream : remoteStream;

  const leftRef = isInitiator ? remoteVideoRef : localVideoRef;
  const rightRef = isInitiator ? localVideoRef : remoteVideoRef;

  const leftIsMuted = isInitiator ? false : isMuted;
  const rightIsMuted = isInitiator ? isMuted : false;

  const leftIsVideoOff = isInitiator ? false : isVideoOff;
  const rightIsVideoOff = isInitiator ? isVideoOff : false;

  const leftName = (callData as any)?.patientDetails?.name || 'Patient';
  const rightName = (callData as any)?.doctorName || 'Doctor';
  const rightSpecialization = (callData as any)?.doctorSpecialization || 'Doctor';

  // ... (keep useEffect for streams)

  // Attach MediaStreams to video elements when they change
  useEffect(() => {
    try {
      if (leftRef.current) {
        // @ts-ignore
        leftRef.current.srcObject = leftStream ?? null;
      }
      if (rightRef.current) {
        // @ts-ignore
        rightRef.current.srcObject = rightStream ?? null;
      }
    } catch (e) {
      // ignore assignment errors in SSR or unsupported environments
    }
  }, [leftStream, rightStream]);

  // (Optional) monitor connection state or remote status if needed

  // Show error state
  if (error) {
    return (
      <div className="container py-8 h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTitle>Call Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/patient/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine who is in which panel
  // ... (keep variables)

  // Lobby / Pre-join state
  // Since useVideoCall auto-connects, we show a "Connecting" lobby instead of a "Join" button
  if (!isConnected && !localStream && !remoteStream) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl bg-slate-100 flex items-center justify-center">
          {doctorImage?.imageUrl ? (
            <Image src={doctorImage.imageUrl} alt="Doctor Lobby" fill className="object-cover" />
          ) : (
            <UserIcon className="h-20 w-20 text-slate-400" />
          )}
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isConnecting ? 'Connecting to Secure Session...' : 'Initializing...'}
          </h2>
          <p className="text-slate-500">
            Please wait while we establish a secure connection.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <Button variant="outline" className="w-full" asChild>
            <Link href={isInitiator ? "/doctor/dashboard" : "/patient/dashboard"}>
              Cancel & Return
            </Link>
          </Button>
        </div>
        <p className="text-xs text-slate-400 text-center uppercase tracking-widest font-bold">Secure Encypted Session</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl h-full flex flex-col gap-6 md:p-4">
      {/* Fallback Home Button if things go wrong */}
      <div className="flex justify-between items-center mb-2 px-4">
        <Button variant="outline" size="sm" asChild className="gap-2">
          <Link href={isInitiator ? "/patient/dashboard" : "/doctor/dashboard"}>
            <PhoneOff className="h-4 w-4" /> Exit to Dashboard
          </Link>
        </Button>
        <div className="text-xs text-slate-500 font-mono hidden md:block">
          Call ID: {callData?.id?.slice(0, 8)}...
        </div>
      </div>

      {/* Main Content Area */}
      {(callData as any)?.callType === 'voice' ? (
        /* Voice Call Interface */
        <div className="flex-1 flex flex-col items-center justify-center gap-8 min-h-0 relative">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 z-10">
            {/* Patient Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${leftStream ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-slate-700'} flex items-center justify-center bg-slate-800`}>
                <UserIcon className="h-16 w-16 text-slate-400" />
                {leftIsMuted && (
                  <div className="absolute bottom-0 right-0 bg-red-500 p-2 rounded-full border-4 border-slate-900">
                    <MicOff className="h-4 w-4 text-white" />
                  </div>
                )}
                {leftStream && <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-20" />}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-200">{leftName}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Patient</p>
              </div>
            </div>

            {/* Connecting/Status Animation */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1 h-8 items-end">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-1.5 bg-blue-500 rounded-full ${isConnected ? 'animate-pulse' : 'h-1'}`} style={{ height: isConnected ? `${Math.random() * 24 + 8}px` : '4px', animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <p className="text-xs font-mono text-slate-400">{isConnected ? (
                <span className="text-emerald-500">00:00</span> // Timer can be added later
              ) : 'CONNECTING...'}</p>
            </div>

            {/* Doctor Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${rightStream ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'border-slate-700'} flex items-center justify-center bg-slate-800`}>
                <ShieldPlus className="h-16 w-16 text-slate-400" />
                {rightIsMuted && (
                  <div className="absolute bottom-0 right-0 bg-red-500 p-2 rounded-full border-4 border-slate-900">
                    <MicOff className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-200">{rightName}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Doctor</p>
              </div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl" />
          </div>

          {/* Hidden Video Elements to keep streams active but invisible */}
          <div className="hidden">
            <video ref={leftRef} autoPlay muted={isInitiator} playsInline />
            <video ref={rightRef} autoPlay muted={!isInitiator} playsInline />
          </div>
        </div>
      ) : (
        /* Video Call Interface */
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          {/* Left Panel: Patient */}
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl group transition-all hover:border-blue-500/50 flex items-center justify-center">
            {leftStream ? (
              <video
                ref={leftRef}
                className="w-full h-full object-cover"
                autoPlay
                muted={isInitiator}
                playsInline
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <UserIcon className="h-16 w-16 mb-2 opacity-20" />
                <p className="text-sm font-medium animate-pulse uppercase tracking-widest">Waiting for patient...</p>
              </div>
            )}

            {leftIsVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10 backdrop-blur-sm">
                <VideoOff className="h-16 w-16 text-slate-600" />
              </div>
            )}

            {/* Patient Badge */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
              <div className="flex gap-1 items-center">
                <div className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-blue-400/30 w-fit">
                  Patient
                </div>
                {callData?.age && (
                  <div className="bg-slate-800/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-white/10 w-fit">
                    {callData.age} {callData.gender?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="bg-black/40 backdrop-blur-md text-white text-base md:text-lg font-semibold px-3 py-1.5 rounded-xl border border-white/10 shadow-xl flex items-center gap-2">
                {leftName}
                {leftIsMuted && <MicOff className="h-4 w-4 text-red-500" />}
              </div>
            </div>
          </div>

          {/* Right Panel: Doctor */}
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl group transition-all hover:border-emerald-500/50 flex items-center justify-center">
            {rightStream ? (
              <video
                ref={rightRef}
                className="w-full h-full object-cover"
                autoPlay
                muted={!isInitiator}
                playsInline
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <ShieldPlus className="h-16 w-16 mb-2 opacity-20" />
                <p className="text-sm font-medium animate-pulse uppercase tracking-widest">Connecting to doctor...</p>
              </div>
            )}

            {rightIsVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10 backdrop-blur-sm">
                <VideoOff className="h-16 w-16 text-slate-600" />
              </div>
            )}

            {/* Doctor Badge */}
            <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1 text-right">
              <div className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-400/30 w-fit text-right">
                {rightSpecialization}
              </div>
              <div className="bg-black/40 backdrop-blur-md text-white text-base md:text-lg font-semibold px-3 py-1.5 rounded-xl border border-white/10 shadow-xl flex items-center gap-2">
                {rightIsMuted && <MicOff className="h-4 w-4 text-red-500" />}
                {rightName}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex items-center justify-center gap-4 bg-slate-900/60 backdrop-blur-2xl p-4 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3">
          <Button
            variant={isMuted ? 'destructive' : 'secondary'}
            size="icon"
            className="h-12 w-12 rounded-xl"
            onClick={toggleMute}
            disabled={!localStream}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {(callData as any)?.callType !== 'voice' && (
            <Button
              variant={isVideoOff ? 'destructive' : 'secondary'}
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={toggleVideo}
              disabled={!localStream}
              title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
          )}
        </div>

        <div className="h-8 w-px bg-white/10 mx-2" />

        <Button
          variant="destructive"
          size="lg"
          className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest gap-2 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
          onClick={() => endCall(true)}
        >
          <PhoneOff className="h-4 w-4 fill-current" /> End Call
        </Button>
      </div>

      {/* Status Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none z-30">
        {isConnecting && (
          <div className="bg-blue-600/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl border border-blue-400/30">
            <Loader2 className="h-3 w-3 animate-spin" /> ENCRYPTING CONNECTION...
          </div>
        )}
        {isConnected && (
          <div className="bg-emerald-600/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl border border-emerald-400/30">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE SECURE SESSION
          </div>
        )}
      </div>
    </div>
  );
}
