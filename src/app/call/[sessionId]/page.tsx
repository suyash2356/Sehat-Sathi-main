'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// This route is now a simple redirector to the consolidated `/video-call` page
export default function CallPageRedirect() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  useEffect(() => {
    if (!sessionId) return;
    // Preserve history so doctor can go back
    router.replace(`/video-call?sessionId=${sessionId}`);
  }, [sessionId, router]);

  return <div className="p-8 text-center">Redirecting to call...</div>;
}
