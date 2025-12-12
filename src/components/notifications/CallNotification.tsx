'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Clock, X } from 'lucide-react';
import { CallData } from '@/lib/webrtc';
import { CallScheduler } from '@/lib/call-scheduler';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface CallNotificationProps {
  callData: CallData;
  onDismiss: () => void;
}

export function CallNotification({ callData, onDismiss }: CallNotificationProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!callData.scheduledTime) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const scheduledTime = new Date(callData.scheduledTime!);
      const diff = scheduledTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Call starting now!');
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [callData.scheduledTime]);

  const handleJoinCall = () => {
    router.push(`/video-call?callId=${callData.id}`);
    onDismiss();
  };

  const handleDismiss = () => {
    onDismiss();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">Video Call Reminder</h3>
            </div>
            
            <Alert className="mb-3">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your call with Dr. Sharma is starting in <strong>{timeLeft}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Patient:</strong> {callData.patientName}</p>
              <p><strong>Issue:</strong> {callData.issue}</p>
              <p><strong>Phone:</strong> {callData.patientPhone}</p>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleJoinCall} className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Join Call
              </Button>
              <Button variant="outline" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CallNotificationManager() {
  const [notifications, setNotifications] = useState<CallData[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const callScheduler = CallScheduler.getInstance();
    
    const handleCallNotification = (callData: CallData) => {
      setNotifications(prev => [...prev, callData]);
      setIsVisible(true);
    };

    callScheduler.addNotificationCallback(handleCallNotification);

    return () => {
      callScheduler.removeNotificationCallback(handleCallNotification);
    };
  }, []);

  const handleDismiss = (callId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== callId));
    if (notifications.length === 1) {
      setIsVisible(false);
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <CallNotification
          key={notification.id}
          callData={notification}
          onDismiss={() => handleDismiss(notification.id)}
        />
      ))}
    </div>
  );
}
