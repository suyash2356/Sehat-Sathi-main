
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const VideoCall = dynamic(() => import('@/components/video/VideoCall'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
});

export default function VideoCallPage() {
  return (
    <div className="container py-8 h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
        <VideoCall />
      </Suspense>
    </div>
  );
}
