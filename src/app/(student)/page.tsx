'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Check if system setup is needed first
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/system/status');
        const data = await res.json();
        if (data.needsSetup) {
          router.push('/admin/setup');
        }
      } catch (err) {
        console.error('Failed to check system status:', err);
      }
    };
    checkStatus();
  }, [router]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user && !session.user.onboardingCompleted) {
      router.push('/onboarding/welcome');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return <ChatInterface />;
}
