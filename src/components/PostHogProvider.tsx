'use client';

/**
 * PostHogProvider — Analytics DSGVO/KJM-konform
 *
 * KJM §5 JMStV + DSGVO Art. 6/8:
 * PostHog wird NUR initialisiert wenn der Nutzer explizit analytics: true
 * in seinem Cookie-Consent gesetzt hat (mindry_consent_v1).
 * Ohne Consent: kein Init, keine Cookies, kein Tracking.
 *
 * Consent-Änderungen (Banner): PostHog opt_in/opt_out wird dynamisch angepasst
 * über einen storage-event listener.
 */

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, useState } from 'react';

const CONSENT_KEY = 'mindry_consent_v1';

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.analytics === true;
  } catch {
    return false;
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';
    if (!key) return;

    // ── Erst initialisieren wenn Consent vorhanden ──────────────────────────
    if (!hasAnalyticsConsent()) {
      // Warte auf Consent-Änderung (Banner speichert in localStorage)
      const onStorage = (e: StorageEvent) => {
        if (e.key === CONSENT_KEY && hasAnalyticsConsent()) {
          initPostHog(key, host);
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }

    initPostHog(key, host);

    function initPostHog(key: string, host: string) {
      if (posthog.__loaded) {
        posthog.opt_in_capturing();
        return;
      }
      posthog.init(key, {
        api_host: host,
        capture_pageview: false,
        capture_pageleave: true,
        loaded: (ph) => {
          if (process.env.NODE_ENV === 'development') ph.opt_out_capturing();
        },
        // Nur Memory-Persistenz bis expliziter Consent — verhindert Cookie-Setzung vor Bestätigung
        persistence: 'memory',
        autocapture: false,
        mask_all_text: true,
        disable_session_recording: true,
      });
      // Jetzt auf persistente Cookies upgraden (Consent vorhanden)
      posthog.set_config({ persistence: 'localStorage+cookie' });
      setInitialized(true);
    }

    // Consent-Widerruf: opt_out wenn analytics später deaktiviert
    const onRevoke = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY && !hasAnalyticsConsent()) {
        posthog.opt_out_capturing();
        posthog.clear_opt_in_out_capturing();
      }
    };
    window.addEventListener('storage', onRevoke);
    return () => window.removeEventListener('storage', onRevoke);
  }, []);

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  // Render Provider nur wenn initialisiert (verhindert React-Hydration-Fehler)
  if (!initialized) return <>{children}</>;

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
