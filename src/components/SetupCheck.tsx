'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * SetupCheck is a global client-side component that monitors the system status.
 * If the system has zero users, it redirects the visitor to the /admin/setup page.
 */
export function SetupCheck() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Skip check if we are already on setup or authentication paths
    const isSetupPath = pathname === '/admin/setup';
    const isApiRequest = pathname.startsWith('/api/');
    const isAuthPath = pathname.startsWith('/auth/');
    
    if (isSetupPath || isApiRequest || isAuthPath) return;

    async function verifySystemStatus() {
      try {
        const res = await fetch('/api/system/status');
        const data = await res.json();
        
        if (data.needsSetup) {
          console.log('🚨 [System] Zero users detected. Redirecting to Admin Setup.');
          router.push('/admin/setup');
        }
      } catch (err) {
        // Silently fail to avoid blocking the UI if the API is temporarily down
        console.error('System status verify failed:', err);
      }
    }

    verifySystemStatus();
  }, [pathname, router]);

  return null;
}
