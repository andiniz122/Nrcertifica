'use client';

import { useEffect } from 'react';

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'oppref', 'gclid', 'gbraid', 'wbraid', 'fbclid'] as const;
const COOKIE = 'nrc_attr';
const MAX_AGE = 60 * 60 * 24 * 90; // 90 dias

type Touch = Partial<Record<(typeof KEYS)[number] | 'landing' | 'ts', string>>;

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function UtmCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const touch: Touch = {};
      for (const k of KEYS) {
        const v = params.get(k);
        if (v) touch[k] = v.slice(0, 200);
      }
      if (Object.keys(touch).length === 0) return;

      touch.landing = window.location.pathname.slice(0, 200);
      touch.ts = new Date().toISOString();

      let prev: { first?: Touch; last?: Touch } = {};
      const raw = readCookie(COOKIE);
      if (raw) {
        try { prev = JSON.parse(raw); } catch { prev = {}; }
      }

      const data = { first: prev.first || touch, last: touch };
      document.cookie =
        COOKIE + '=' + encodeURIComponent(JSON.stringify(data)) +
        '; path=/; max-age=' + MAX_AGE + '; SameSite=Lax; Secure';

      // 1 visita por sessão para cada combinação origem/campanha/clique
      const sk = 'nrc_trk_' + (touch.utm_source || '') + '|' + (touch.utm_campaign || '') + '|' + (touch.oppref || touch.gclid || touch.gbraid || touch.wbraid || touch.fbclid || '');
      if (!sessionStorage.getItem(sk)) {
        sessionStorage.setItem(sk, '1');
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(touch),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* nunca quebrar a página por causa de rastreamento */
    }
  }, []);

  return null;
}
