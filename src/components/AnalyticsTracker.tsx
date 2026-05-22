'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function getOrCreateSession(): string {
  try {
    let id = sessionStorage.getItem('_pietri_sid');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('_pietri_sid', id);
    }
    return id;
  } catch {
    return 'unknown';
  }
}

function getDevice(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Page view tracking
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const session_id = getOrCreateSession();
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pathname, referrer: document.referrer || null, session_id }),
    }).catch(() => {});
  }, [pathname]);

  // Heartbeat tracking
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    const session_id = getOrCreateSession();
    const device = getDevice();

    function sendHeartbeat() {
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, page: pathnameRef.current, device }),
      }).catch(() => {});
    }

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 45000);

    function onVisibility() {
      if (document.visibilityState === 'visible') sendHeartbeat();
    }
    document.addEventListener('visibilitychange', onVisibility);

    function onUnload() {
      navigator.sendBeacon('/api/analytics/heartbeat', JSON.stringify({ session_id, page: pathnameRef.current, device }));
    }
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onUnload);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
