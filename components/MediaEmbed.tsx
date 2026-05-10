'use client';

// =============================================================================
// SPOTIFY INTEGRATION – FUNKTIONIERENDER ANSATZ (Stand: Mai 2026, Commit 55fc74e)
// =============================================================================
// WICHTIG: Dieser Ansatz funktioniert stabil für mehrere Gruppen nacheinander.
// Bitte NICHT ohne Not ändern – jede Abweichung hat in der Vergangenheit 404-Fehler verursacht.
//
// Prinzip:
//  1. Beim ersten Laden der Seite wird EINMAL ein `new Spotify.Player(...)` erstellt.
//  2. Dieser Player und seine `device_id` bleiben für ALLE Musikfragen erhalten.
//     → Kein Player-Neustart zwischen den Karten (kein spotifyInitKey++ bei neuer Karte)!
//  3. Beim Wechsel zur nächsten Musikfrage wird nur pausiert + neue URL gesetzt.
//  4. `player.connect()` feuert `ready`, das mit `GET /v1/me/player/devices` gepollt wird
//     (bis zu 12x alle 500ms), bevor `spotifyReady=true` gesetzt wird.
//     → Erst wenn das Gerät in Spotify's REST-API sichtbar ist, wird Play freigegeben.
//  5. Der 🔄 Refresh-Button (`reconnectSpotify`) bleibt als manueller Fallback.
//
// WARUM player-neustart nicht funktioniert:
//  - Jeder `new Spotify.Player(...)` bekommt eine neue `device_id`.
//  - Spotify registriert neue device_ids in der REST-API oft gar nicht oder mit langer Verzögerung.
//  - `PUT /v1/me/player/play?device_id=NEU` liefert dann dauerhaft 404.
//  - Commit-Verlauf: 24af05a → 2b4e25f → 433d432 (alle scheiterten) → 55fc74e (Lösung)
// =============================================================================

import clsx from 'clsx';
import Image from 'next/image';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Card, MediaPreference } from '@/lib/types';

function toYouTubeEmbed(url: string) {
  const match = url.match(/(?:v=|\.be\/|embed\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : null;
}

function toSpotifyEmbed(url: string) {
  const idMatch = url.match(/spotify\.com\/(?:track|episode)\/([A-Za-z0-9]+)/);
  return idMatch ? `https://open.spotify.com/embed/track/${idMatch[1]}` : null;
}

type MediaChoice =
  | { type: 'youtube'; url: string }
  | { type: 'spotify'; url: string }
  | { type: 'selfHostedVideo'; url: string }
  | { type: 'selfHostedAudio'; url: string }
  | { type: 'image'; url: string }
  | { type: 'text'; text: string; textDe?: string };

function resolveSource(
  card: Card,
  preference: MediaPreference,
  youtubeUnavailable: boolean
): MediaChoice | null {
  const { sources } = card;
  const safeYouTube = sources.youtube && !youtubeUnavailable;

  if (preference === 'youtube') {
    if (safeYouTube) return { type: 'youtube', url: sources.youtube! };
    if (sources.spotify) return { type: 'spotify', url: sources.spotify };
  }

  if (preference === 'spotify') {
    if (sources.spotify) return { type: 'spotify', url: sources.spotify };
    if (safeYouTube) return { type: 'youtube', url: sources.youtube! };
  }

  if (safeYouTube) return { type: 'youtube', url: sources.youtube! };
  if (sources.spotify) return { type: 'spotify', url: sources.spotify };
  if (sources.selfHostedVideo) return { type: 'selfHostedVideo', url: sources.selfHostedVideo };
  if (sources.selfHostedAudio) return { type: 'selfHostedAudio', url: sources.selfHostedAudio };
  if (sources.image) return { type: 'image', url: sources.image };
  if (sources.text) return { type: 'text', text: sources.text, textDe: sources.textDe };

  // Last resort: expose unavailable YouTube even wenn es gesperrt ist, damit ein manueller Klick möglich bleibt.
  if (sources.youtube) return { type: 'youtube', url: sources.youtube };

  return null;
}

type Props = {
  card: Card;
  preference: MediaPreference;
  concealMetadata?: boolean;
  onPlay?: () => void;
  onPlaybackError?: (id: string, reason?: string) => void;
};

export type MediaEmbedHandle = {
  stop: () => void;
  play: () => void;
  pause: () => void;
};

export const MediaEmbed = forwardRef<MediaEmbedHandle, Props>(function MediaEmbed(
  { card, preference, concealMetadata = false, onPlay, onPlaybackError }: Props,
  ref
) {
  const [youtubeUnavailable, setYouTubeUnavailable] = useState(false);
  const [youtubeChecked, setYouTubeChecked] = useState(false);
  const choice = useMemo(
    () => resolveSource(card, preference, youtubeUnavailable),
    [card, preference, youtubeUnavailable]
  );
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), []);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [spotifyDevice, setSpotifyDevice] = useState<string | null>(null);
  const [spotifyReady, setSpotifyReady] = useState(false);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const [spotifyErrorDetail, setSpotifyErrorDetail] = useState<string | null>(null);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [spotifyIframeFallback, setSpotifyIframeFallback] = useState(false);
  const spotifyPlayerRef = useRef<Spotify.Player | null>(null);
  const autoPlayPendingRef = useRef(false);
  const latestSpotifyUrlRef = useRef<string | null>(null);
  const [spotifyInitKey, setSpotifyInitKey] = useState(0);
  const pollGenerationRef = useRef(0); // incremented each time a new player is created; cancels stale polling loops
  const reconnectSpotifyRef = useRef<() => void>(() => {});
  const autoReconnectDoneRef = useRef(false); // guard: auto-reconnect only once per play attempt
  const choiceSignature = useMemo(() => {
    if (!choice) return '';
    if (choice.type === 'text') return `text:${choice.text}:${choice.textDe ?? ''}`;
    switch (choice.type) {
      case 'youtube':
      case 'spotify':
      case 'selfHostedVideo':
      case 'selfHostedAudio':
      case 'image':
        return `${choice.type}:${choice.url}`;
      default:
        return '';
    }
  }, [choice]);

  const reportedErrorRef = useRef(false);

  function reconnectSpotify() {
    // Vollständiger Player-Neustart: alten Player zerstören, neuen über spotifyInitKey erzwingen.
    // disconnect()+connect() reicht nicht – Spotify invalidiert die device_id serverseitig.
    if (spotifyPlayerRef.current) {
      try { spotifyPlayerRef.current.disconnect(); } catch (_) {}
      spotifyPlayerRef.current = null;
    }
    autoPlayPendingRef.current = false;
    autoReconnectDoneRef.current = false;
    setSpotifyReady(false);
    setSpotifyDevice(null);
    setSpotifyError(null);
    setSpotifyErrorDetail(null);
    setShowSpotify(false);
    setIsPlaying(false);
    setSpotifyIframeFallback(false);
    // Increment key → SDK-useEffect läuft neu → neues Spotify.Player-Objekt mit frischer device_id
    setSpotifyInitKey((k) => k + 1);
  }
  // Keep ref in sync so useCallback closures can call the latest reconnectSpotify
  reconnectSpotifyRef.current = reconnectSpotify;

  function resetSpotify() {
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.disconnect();
      spotifyPlayerRef.current = null;
    }
    autoPlayPendingRef.current = false;
    latestSpotifyUrlRef.current = null;
    setSpotifyReady(false);
    setSpotifyDevice(null);
    setSpotifyToken(null);
    setSpotifyError(null);
    setSpotifyErrorDetail(null);
    setShowSpotify(false);
    setIsPlaying(false);
  }

  const sendYouTubeCommand = (command: 'playVideo' | 'pauseVideo') => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*'
    );
  };

  const togglePlay = () => {
    if (choice?.type !== 'youtube') return;
    if (isPlaying) {
      sendYouTubeCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      sendYouTubeCommand('playVideo');
      setShowYouTube(true);
      onPlay?.();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    // Stop playback when source changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const newChoiceIsSpotify = choice?.type === 'spotify';
    const sdkAlive = Boolean(spotifyPlayerRef.current);

    if (newChoiceIsSpotify && sdkAlive) {
      // Neue Spotify-Karte → bestehenden Player NICHT zerstören, einfach neue URL abspielen.
      // Jeder Player-Neustart erzeugt eine neue device_id die Spotify evtl. nie in der REST-API
      // registriert → 404-Fehler. Stattdessen: denselben Player/device_id für alle Karten benutzen.
      try { (spotifyPlayerRef.current as any)?.pause(); } catch (_) {}
      setIsPlaying(false);
      setShowSpotify(false);
      setEmbedError(null);
      reportedErrorRef.current = false;
      autoReconnectDoneRef.current = false;
      autoPlayPendingRef.current = false;  // Kein Auto-Play – User muss manuell starten
      latestSpotifyUrlRef.current = choice.url;
      setSpotifyIframeFallback(false);
      // Player und device_id bleiben unverändert – kein spotifyInitKey++
    } else if (!newChoiceIsSpotify && sdkAlive) {
      // Karte wechselt zu Nicht-Musik (z.B. Zwischenrunde im Timeline-Modus).
      // WICHTIG: Player NICHT zerstören! Neue device_id würde Spotify evtl. nie registrieren → 404.
      // Nur pausieren und UI zurücksetzen, player + device_id bleiben erhalten.
      try { (spotifyPlayerRef.current as any)?.pause(); } catch (_) {}
      setIsPlaying(false);
      setShowSpotify(false);
      setEmbedError(null);
      reportedErrorRef.current = false;
      autoReconnectDoneRef.current = false;
      autoPlayPendingRef.current = false;
      setSpotifyIframeFallback(false);
      latestSpotifyUrlRef.current = null;
      // spotifyToken, spotifyDevice, spotifyReady → unverändert (Player bleibt verbunden)
    } else {
      resetSpotify();
      setEmbedError(null);
      reportedErrorRef.current = false;
      autoReconnectDoneRef.current = false;
      autoPlayPendingRef.current = false;
      setSpotifyIframeFallback(false);
      latestSpotifyUrlRef.current = newChoiceIsSpotify ? (choice?.url ?? null) : null;
    }
    setShowYouTube(false);
  }, [choiceSignature]);

  useEffect(() => {
    let cancelled = false;
    if (!card.sources.youtube) {
      setYouTubeUnavailable(false);
      setYouTubeChecked(false);
      return undefined;
    }

    const checkAvailability = async () => {
      setYouTubeChecked(false);
      try {
        const oembedUrl = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(card.sources.youtube!)}`;
        const res = await fetch(oembedUrl, { method: 'GET', mode: 'cors' });
        if (cancelled) return;
        setYouTubeUnavailable(!res.ok);
      } catch (_err) {
        if (cancelled) return;
        setYouTubeUnavailable(true);
      } finally {
        if (!cancelled) setYouTubeChecked(true);
      }
    };

    checkAvailability();

    return () => {
      cancelled = true;
    };
  }, [card.sources.youtube, card.id]);

  // Fetch Spotify token from server (httpOnly cookie proxied)
  useEffect(() => {
    if (choice?.type !== 'spotify') return;
    
    const controller = new AbortController();
    
    const loadToken = async () => {
      try {
        console.log('🎵 Loading Spotify token...');
        const res = await fetch('/api/spotify/token', {
          signal: controller.signal
        });
        if (!res.ok) {
          console.error('❌ Spotify token response:', res.status);
          setSpotifyError('Spotify Login erforderlich');
          return;
        }
        const json = await res.json();
        console.log('✅ Spotify token received');
        setSpotifyToken(json.accessToken as string);
      } catch (err) {
        if (controller.signal.aborted) {
          console.log('🛑 Token load aborted');
          return;
        }
        console.error('❌ Spotify token error:', err);
        setSpotifyError('Spotify Token konnte nicht geladen werden');
      }
    };
    
    loadToken();
    return () => controller.abort();
  }, [choice?.type]);

  const refreshDeviceId = useCallback(async (): Promise<string | null> => {
    if (!spotifyToken) return null;
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: { Authorization: `Bearer ${spotifyToken}` }
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        console.error('Spotify devices failed', res.status, txt);
        return null;
      }
      const json = await res.json();
      const device = (json.devices as any[] | undefined)?.find((d) => d?.name === 'Flex Quiz Player');
      if (device?.id) {
        setSpotifyDevice(device.id as string);
        return device.id as string;
      }
    } catch (err) {
      console.error('Spotify devices exception', err);
    }
    return null;
  }, [spotifyToken]);

  const ensureDevice = useCallback(async (): Promise<string | null> => {
    if (!spotifyToken) return null;
    // Vorrang: gespeicherte ID, sonst frisch aus Spotify laden.
    if (spotifyDevice) {
      return spotifyDevice;
    }
    return refreshDeviceId();
  }, [refreshDeviceId, spotifyDevice, spotifyToken]);

  const transferPlaybackWithRetry = useCallback(
    async (maxAttempts = 3) => {
      if (!spotifyToken) return false;
      let lastDetail: string | null = null;

      // Wichtig: KEIN Disconnect/Reconnect bei 404 - das startet neue ready Events!
      // Einfach mit Wartezeit + exponential backoff retry
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const target = spotifyDevice ?? (await ensureDevice());
        if (!target) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }

        const res = await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ device_ids: [target], play: false })
        });

        if (res.ok) {
          console.log(`✅ Transfer erfolgreich nach ${attempt + 1} Versuchen`);
          setSpotifyError(null);
          setSpotifyErrorDetail(null);
          return true;
        }

        const detail = await res.text().catch(() => null);
        lastDetail = detail || `HTTP ${res.status}`;

        if (res.status === 404) {
          const waitMs = 1000 * (attempt + 1);
          console.log(`⏳ Transfer 404 (attempt ${attempt + 1}/${maxAttempts}), warte ${waitMs}ms...`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }

        break;
      }

      setSpotifyError('Spotify-Device konnte nicht übernommen werden');
      if (lastDetail) setSpotifyErrorDetail(lastDetail);
      console.error('Transfer failed after all retries:', lastDetail);
      return false;
    },
    [ensureDevice, spotifyDevice, spotifyToken]
  );

  // Load Spotify Web Playback SDK and connect
  useEffect(() => {
    if (choice?.type !== 'spotify') return;
    if (!spotifyToken) return;
    // Bereits verbundenen Player nicht neu starten – derselbe Player überlebt auch Nicht-Musik-Karten
    // (Zwischenrunden im Timeline-Modus). Nur neu initialisieren wenn kein Player existiert oder
    // explizit via spotifyInitKey angefordert (reconnectSpotify() setzt ref vorher auf null).
    if (spotifyPlayerRef.current) return;

    const initializePlayer = () => {
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.disconnect();
      }

      if (!window.Spotify) {
        setSpotifyError('Spotify SDK nicht verfügbar');
        return;
      }

      const player = new window.Spotify.Player({
        name: 'Flex Quiz Player',
        getOAuthToken: async (cb) => {
          // Always fetch a fresh token from the server so that after 1h
          // the SDK gets a new access token instead of the stale cached one.
          console.log('🎵 Token callback triggered – fetching fresh token...');
          try {
            const res = await fetch('/api/spotify/token');
            if (res.ok) {
              const json = await res.json();
              const freshToken = json.accessToken as string;
              setSpotifyToken(freshToken);
              cb(freshToken);
              return;
            }
          } catch (err) {
            console.warn('⚠️  Token refresh failed, using cached token:', err);
          }
          // Fallback: use whatever token we have
          cb(spotifyToken!);
        },
        volume: 0.8
      });

      spotifyPlayerRef.current = player;

      player.addListener('ready', ({ device_id }: any) => {
        console.log('✅ Player ready, device_id:', device_id);
        setSpotifyDevice(device_id);
        setSpotifyErrorDetail(null);
        setSpotifyError(null);

        // Poll /v1/me/player/devices until the device appears in Spotify's backend.
        // pollGenerationRef cancels stale loops from previous player instances.
        const myGeneration = ++pollGenerationRef.current;
        (async () => {
          const maxPolls = 20; // 20 × 500ms = 10s – dann ggf. Auto-Reconnect
          for (let i = 0; i < maxPolls; i++) {
            await new Promise((r) => setTimeout(r, 500));
            // Abort if a newer player was created while we were waiting
            if (pollGenerationRef.current !== myGeneration) {
              console.log(`🚫 Poll gen ${myGeneration} abgebrochen (aktuell: ${pollGenerationRef.current})`);
              return;
            }
            try {
              const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
                headers: { Authorization: `Bearer ${spotifyToken}` }
              });
              if (res.ok) {
                const json = await res.json();
                const found = (json.devices ?? []).some((d: any) => d.id === device_id);
                if (found) {
                  console.log(`✅ Device ${device_id} bestätigt nach ${(i + 1) * 500}ms`);
                  setSpotifyReady(true);
                  return;
                }
              }
            } catch (err) {
              console.warn('⚠️  device poll error:', err);
            }
            console.log(`⏳ Device noch nicht sichtbar (attempt ${i + 1}/${maxPolls})...`);
          }
          // Device never appeared in REST-API after 10s – switch directly to iframe embed.
          // The iframe always works and doesn't need the SDK device to be registered.
          if (pollGenerationRef.current === myGeneration) {
            console.warn('⚠️  Device polling timeout – aktiviere Spotify-Iframe-Fallback');
            setSpotifyIframeFallback(true);
            setSpotifyReady(true); // unblock UI
          }
        })();
      });

      player.addListener('player_state_changed', (state) => {
        setIsPlaying(Boolean(state && !state.paused));
      });

      player.addListener('initialization_error', ({ message }: any) => {
        console.error('❌ initialization_error:', message);
        setSpotifyError(message);
      });
      player.addListener('authentication_error', ({ message }: any) => {
        console.error('❌ authentication_error:', message, '– refreshing token + reconnecting...');
        // The token has expired. Fetch a new one, then force a full player restart so the
        // SDK init effect (which now guards against re-creating an already-alive player) runs fresh.
        fetch('/api/spotify/token')
          .then(r => r.ok ? r.json() : null)
          .then(json => {
            if (json?.accessToken) {
              // Destroy the stale player first so the guard in the SDK effect lets it re-initialize.
              if (spotifyPlayerRef.current) {
                try { spotifyPlayerRef.current.disconnect(); } catch (_) {}
                spotifyPlayerRef.current = null;
              }
              setSpotifyReady(false);
              setSpotifyDevice(null);
              setSpotifyToken(json.accessToken as string);
              // spotifyToken change → SDK useEffect re-runs → guard passes (ref is null) → new player
            }
          })
          .catch(() => { setSpotifyError('Spotify Login abgelaufen – bitte neu verbinden'); });
      });
      player.addListener('account_error', ({ message }: any) => {
        console.error('❌ account_error:', message);
        setSpotifyError(message);
      });
      (player as any).addListener('playback_error', ({ message, error_type }: any) => {
        console.error('❌ playback_error:', error_type, message);
        setSpotifyError('Spotify meldet einen Wiedergabefehler');
        setSpotifyErrorDetail(`${error_type}: ${message}`);
        onPlaybackError?.(card.id, 'playback-error');
      });
      (player as any).addListener('not_ready', ({ device_id }: any) => {
        console.warn('⚠️  not_ready:', device_id);
        setSpotifyReady(false);
        setSpotifyErrorDetail(`Device ${device_id} nicht bereit`);
      });

      console.log('🎵 Calling player.connect()...');
      player.connect();
    };

    const setup = () => {
      console.log('🎵 Starting Spotify setup...');

      if (window.Spotify) {
        // SDK already loaded (z.B. zweite Karte) → direkt initialisieren
        console.log('✅ Spotify SDK already loaded, initializing player...');
        initializePlayer();
        return;
      }

      // SDK noch nicht geladen → Callback setzen UND Script laden.
      // WICHTIG: initializePlayer() wird NUR über onSpotifyWebPlaybackSDKReady aufgerufen,
      //          NICHT zusätzlich nach dem script.onload! Sonst doppelte Initialisierung.
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('✅ onSpotifyWebPlaybackSDKReady fired');
        initializePlayer();
      };

      if (!document.getElementById('spotify-sdk')) {
        console.log('📥 Loading Spotify SDK script...');
        const script = document.createElement('script');
        script.id = 'spotify-sdk';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.onerror = () => {
          console.error('❌ SDK script load failed');
          setSpotifyError('Fehler beim Laden des Spotify-Spielers');
        };
        document.body.appendChild(script);
        // KEIN script.onload → initializePlayer(), das würde doppelt aufgerufen!
        // onSpotifyWebPlaybackSDKReady übernimmt das.
      } else {
        console.log('⏳ SDK script tag already exists, waiting for onSpotifyWebPlaybackSDKReady...');
      }
    };

    setup();

    // KEIN disconnect() hier beim Cleanup – der choice?.type-Wechsel (z.B. Musik→Zitat zwischen
    // Runden) würde sonst den Player zerstören und eine neue device_id erzwingen → 404-Problem.
    // Der Player wird nur in reconnectSpotify() oder beim Unmount (separater Effect) getrennt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choice?.type, onPlaybackError, spotifyToken, spotifyInitKey]);

  // Disconnect-Cleanup NUR beim echten Unmount der Komponente:
  useEffect(() => {
    return () => {
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.disconnect();
        spotifyPlayerRef.current = null;
      }
    };
  }, []);

  const activatePlayer = useCallback(async () => {
    if (spotifyPlayerRef.current && 'activateElement' in spotifyPlayerRef.current) {
      try {
        await (spotifyPlayerRef.current as any).activateElement();
      } catch (_err) {
        // ignore
      }
    }
  }, []);

  const playSpotifyTrack = useCallback(
    async (url: string) => {
      if (!spotifyToken) {
        setSpotifyError('Spotify Login erforderlich');
        return;
      }
      if (!spotifyPlayerRef.current) {
        setSpotifyError('Spotify Player nicht bereit');
        return;
      }
      if (!spotifyDevice) {
        setSpotifyError('Kein Spotify-Gerät aktiv');
        return;
      }

      const match = url.match(/spotify\.com\/(?:track|episode)\/([A-Za-z0-9]+)/);
      const trackId = match ? match[1] : null;
      if (!trackId) {
        setSpotifyError('Ungültige Spotify-URL');
        onPlaybackError?.(card.id, 'invalid-url');
        return;
      }

      // activateElement() ist PFLICHT für Chrome autoplay-Policies
      try {
        console.log('🎵 activateElement()...');
        await (spotifyPlayerRef.current as any).activateElement();
        console.log('✅ activateElement() erfolgreich');
      } catch (err) {
        console.warn('⚠️  activateElement() fehlgeschlagen:', err);
        // Kein Abbruch - weiter versuchen
      }

      setSpotifyLoading(true);

      // Sicherstellen dass das Gerät aktiv ist (Transfer, falls nötig)
      console.log('🎵 Übertrage Playback auf SDK-Device vor Play...');
      const preTransferRes = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${spotifyToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_ids: [spotifyDevice], play: false })
      }).catch(() => null);
      if (preTransferRes && (preTransferRes.ok || preTransferRes.status === 204)) {
        console.log('✅ Pre-Transfer erfolgreich');
        await new Promise((r) => setTimeout(r, 500));
      } else if (preTransferRes?.status === 404) {
        // Device not found in Spotify backend → no point retrying; switch to iframe immediately.
        console.warn('⚠️  Pre-Transfer 404 – Device nicht registriert, Iframe-Fallback aktiviert');
        setSpotifyIframeFallback(true);
        setSpotifyLoading(false);
        return;
      } else {
        console.warn('⚠️  Pre-Transfer fehlgeschlagen:', preTransferRes?.status);
        await new Promise((r) => setTimeout(r, 300));
      }

      // Spielen mit der SDK Device-ID
      const maxAttempts = 5;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          console.log(`🎵 Play-Versuch ${attempt + 1}/${maxAttempts}, device_id: ${spotifyDevice}`);
          const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDevice}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${spotifyToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uris: [`spotify:track:${trackId}`] })
          });

          if (res.ok) {
            console.log('✅ Spotify Track spielt!');
            setSpotifyError(null);
            setSpotifyErrorDetail(null);
            setShowSpotify(true);
            setIsPlaying(true);
            setSpotifyLoading(false);
            onPlay?.();
            return;
          }

          const detail = await res.text().catch(() => null);
          console.error(`❌ Play fehlgeschlagen ${res.status}:`, detail);

          if (res.status === 404) {
            if (attempt < maxAttempts - 1) {
              const waitMs = 2000 * (attempt + 1); // 2s, 4s, 6s, 8s …
              console.log(`⏳ Warte ${waitMs}ms, dann retry (device_id refresh)...`);
              await new Promise((r) => setTimeout(r, waitMs));
              // Refresh device_id in case the Spotify backend rotated it
              const freshDevice = await refreshDeviceId();
              if (freshDevice) console.log(`♻️  Frische device_id: ${freshDevice}`);
              continue;
            }
            // All retries exhausted with 404 – auto-reconnect ONCE (creates a new player
            // All 5 retries failed with 404 – switch to iframe embed fallback.
            console.error('❌ Alle Play-Versuche fehlgeschlagen (404) – Iframe-Fallback aktiviert');
            setSpotifyIframeFallback(true);
            setSpotifyLoading(false);
            setIsPlaying(false);
            return;
          }

          setSpotifyError('Wiedergabe konnte nicht gestartet werden');
          setSpotifyErrorDetail(detail || `HTTP ${res.status}`);
          setIsPlaying(false);
          onPlaybackError?.(card.id, 'play-failed');
          break;
        } catch (err) {
          console.error('❌ Play exception:', err);
          setSpotifyError('Netzwerkfehler beim Abspielen');
          setIsPlaying(false);
          break;
        }
      }

      setSpotifyLoading(false);
    },
    [spotifyToken, spotifyDevice, onPlay, onPlaybackError, card.id]
  );

  const pauseSpotify = async () => {
    if (!spotifyPlayerRef.current) return;
    try {
      await (spotifyPlayerRef.current as any).pause();
      setIsPlaying(false);
    } catch (err) {
      console.error('❌ Pause fehlgeschlagen:', err);
    }
  };

  const resumeSpotify = async () => {
    if (!spotifyPlayerRef.current) return;
    try {
      await (spotifyPlayerRef.current as any).resume();
      setIsPlaying(true);
    } catch (err) {
      console.error('❌ Resume fehlgeschlagen:', err);
    }
  };

  useEffect(() => {
    if (!spotifyReady) return;
    if (!autoPlayPendingRef.current) return;
    if (!latestSpotifyUrlRef.current) return;
    autoPlayPendingRef.current = false;
    playSpotifyTrack(latestSpotifyUrlRef.current);
  }, [playSpotifyTrack, spotifyReady]);

  useImperativeHandle(ref, () => ({
    stop: () => {
      if (choice?.type === 'youtube') {
        sendYouTubeCommand('pauseVideo');
      }
      if (choice?.type === 'spotify') {
        pauseSpotify();
      }
      setIsPlaying(false);
      setShowSpotify(false);
      setShowYouTube(false);
    },
    play: () => {
      if (choice?.type === 'youtube') {
        sendYouTubeCommand('playVideo');
        setShowYouTube(true);
        setIsPlaying(true);
      }
      if (choice?.type === 'spotify') {
        if (showSpotify) {
          resumeSpotify();
        } else {
          playSpotifyTrack(choice.url);
        }
      }
    },
    pause: () => {
      if (choice?.type === 'youtube') {
        sendYouTubeCommand('pauseVideo');
        setIsPlaying(false);
      }
      if (choice?.type === 'spotify') {
        pauseSpotify();
      }
    }
  }));

  const toggleSpotify = () => {
    if (!spotifyToken) {
      setSpotifyError('Spotify Login erforderlich');
      return;
    }
    if (isPlaying) {
      pauseSpotify();
    } else {
      // If Spotify player is already shown, resume playback instead of restarting
      if (showSpotify) {
        resumeSpotify();
        onPlay?.();
      } else {
        playSpotifyTrack(choice?.type === 'spotify' ? choice.url : '');
        onPlay?.();
      }
    }
  };

  useEffect(() => {
    // Report hard embed failures once to allow caller to block the card.
    if (embedError && !reportedErrorRef.current) {
      reportedErrorRef.current = true;
      onPlaybackError?.(card.id, 'embed-error');
    }
  }, [card.id, embedError, onPlaybackError]);

  useEffect(() => {
    // Report Spotify errors only if a token exists (user logged in) to avoid blocking due to missing login.
    if (spotifyError && spotifyToken && !reportedErrorRef.current) {
      reportedErrorRef.current = true;
      onPlaybackError?.(card.id, 'spotify-error');
    }
  }, [card.id, spotifyError, spotifyToken, onPlaybackError]);

  if (!choice) {
    if (card.category === 'schaetzfragen') return null;
    return <p className="text-sm text-ink/70">Keine Quelle hinterlegt.</p>;
  }

  if (embedError) {
    const href = choice.type === 'text' || choice.type === 'image' ? null : (choice as any).url;
    return (
      <div className="card-surface rounded-2xl p-4 text-sm text-ink/80 space-y-3">
        <p className="font-semibold text-ink">Medien konnte nicht geladen werden.</p>
        <p>{embedError}</p>
        {href ? (
          <a
            className="inline-flex w-fit rounded-full bg-ink text-inkDark px-4 py-2 text-xs font-semibold"
            href={href}
            target="_blank"
            rel="noreferrer"
          >
            Quelle in neuem Tab öffnen
          </a>
        ) : null}
        <button
          type="button"
          className="inline-flex w-fit rounded-full border border-ink/20 px-4 py-2 text-xs"
          onClick={() => setEmbedError(null)}
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  const fallbackNotice =
    youtubeUnavailable &&
    card.sources.youtube &&
    choice.type !== 'youtube' &&
    (youtubeChecked || youtubeUnavailable);

  switch (choice.type) {
    case 'youtube': {
      const baseUrl = toYouTubeEmbed(choice.url) ?? choice.url;
      const embedUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}enablejsapi=1&controls=0&rel=0&modestbranding=1&playsinline=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`;
      return (
        <div className="space-y-2 relative">
          {youtubeUnavailable && (
            <p className="text-xs text-amber-300">
              YouTube-Video scheint nicht verfügbar. Falls die Wiedergabe blockiert ist, nutze den Link unten oder eine alternative Quelle.
            </p>
          )}
          <div className="aspect-video overflow-hidden rounded-2xl card-surface relative bg-ink">
            <iframe
              src={embedUrl}
              className={`h-full w-full absolute inset-0 transition-opacity ${showYouTube ? 'opacity-100' : 'opacity-0'}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              ref={iframeRef}
              onError={() => setEmbedError('YouTube-Einbettung ist fehlgeschlagen oder blockiert.')}
              allowFullScreen
              title="Medieninhalt"
            />
            <div className="absolute inset-0 flex items-center justify-center text-sand">
              <button
                type="button"
                className="rounded-full bg-sand text-inkDark px-6 py-4 text-lg font-semibold shadow"
                onClick={togglePlay}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>
          <a className="text-sm underline" href={choice.url} target="_blank" rel="noreferrer">
            Auf YouTube öffnen
          </a>
        </div>
      );
    }
    case 'spotify': {
      // If the SDK device never registered in Spotify's backend, show the iframe embed instead.
      if (spotifyIframeFallback) {
        const iframeSrc = toSpotifyEmbed(choice.url);
        return (
          <div className="space-y-2">
            <p className="text-xs text-amber-300">Spotify-Player wird als Einbettung angezeigt (SDK nicht erreichbar).</p>
            {iframeSrc ? (
              <iframe
                src={iframeSrc}
                width="100%"
                height="152"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="eager"
                className="rounded-xl"
                title="Spotify Embed"
              />
            ) : (
              <a href={choice.url} target="_blank" rel="noreferrer" className="text-sm underline">
                In Spotify öffnen
              </a>
            )}
            <button
              type="button"
              className="text-xs underline text-sand/60"
              onClick={() => { setSpotifyIframeFallback(false); reconnectSpotify(); }}
            >
              SDK erneut versuchen
            </button>
          </div>
        );
      }
      const showSpotifyFallback = Boolean(embedError || spotifyError || !spotifyReady);
      const primaryLabel = spotifyLoading ? 'Lädt…' : isPlaying ? 'Pause' : 'Play';
      const primaryIcon = spotifyLoading ? '⏳' : isPlaying ? '⏸' : '▶';
      return (
        <div className="space-y-2 relative">
          {fallbackNotice && (
            <p className="text-xs text-amber-300">
              YouTube-Quelle nicht erreichbar, Spotify wird verwendet.
            </p>
          )}
          <div className="rounded-2xl card-surface relative bg-ink p-3 flex flex-col items-center gap-2 text-sand">
            <div className="text-center space-y-1">
              {spotifyError && <p className="text-xs text-red-200">{spotifyError}</p>}
              {spotifyErrorDetail && (
                <p className="text-[11px] text-sand/60">Details: {spotifyErrorDetail}</p>
              )}
              {!spotifyReady && !spotifyError && spotifyToken && (
                <p className="text-xs text-sand/80">Spotify Player wird verbunden …</p>
              )}
              {!spotifyToken && <p className="text-xs text-red-200">Spotify Login erforderlich</p>}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full bg-sand text-inkDark px-6 py-3 text-base font-semibold shadow disabled:opacity-50 flex items-center gap-2"
                onClick={toggleSpotify}
                disabled={!spotifyToken || spotifyLoading || !spotifyReady}
              >
                <span className="text-2xl leading-none">{primaryIcon}</span>
                <span className="text-sm leading-none">{primaryLabel}</span>
              </button>
              <button
                type="button"
                className="rounded-full border border-sand/40 px-3 py-2 text-xs"
                onClick={reconnectSpotify}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          {showSpotifyFallback && (
            <div className="rounded-xl bg-ink/10 p-3 text-xs text-ink/80 space-y-2">
              <p className="font-semibold text-ink">Spotify-Embed meldet eine Störung.</p>
              <p>Öffne den Song direkt in Spotify, wenn im Player z. B. „upstream request timeout" steht.</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={choice.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-ink text-inkDark px-3 py-1 font-semibold"
                >
                  In Spotify öffnen
                </a>
                <button
                  type="button"
                  className="rounded-full border border-ink/20 px-3 py-1"
                  onClick={reconnectSpotify}
                >
                  Neu versuchen
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    case 'selfHostedVideo':
      return (
        <video controls className="w-full rounded-2xl card-surface" src={choice.url}>
          Dein Browser unterstützt das Video-Tag nicht.
        </video>
      );
    case 'selfHostedAudio':
      return (
        <audio controls className="w-full" src={choice.url}>
          Dein Browser unterstützt das Audio-Tag nicht.
        </audio>
      );
    case 'image':
      return (
        <div className="w-full">
          <div className={`relative w-full max-h-[70vh] min-h-[240px] rounded-2xl card-surface overflow-hidden ${
            choice.url.includes('outline') ? '!bg-white' : 'bg-ink/40'
          }`}>
            <Image
              src={choice.url}
              alt="Bildinhalt"
              fill
              sizes="(max-width: 640px) 100vw, 80vw"
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      );
    case 'text':
      return (
        <div className="card-surface rounded-2xl p-4 space-y-3">
          <p className="text-lg font-semibold leading-relaxed">{choice.text}</p>
          {choice.textDe && (
            <p className="text-base text-ink/80 leading-relaxed">Übersetzung: {choice.textDe}</p>
          )}
        </div>
      );
    default:
      return <p className="text-sm text-ink/70">Keine unterstützte Quelle.</p>;
  }
});

MediaEmbed.displayName = 'MediaEmbed';

export function SourcePills({ card }: { card: Card }) {
  const pills: { label: string; active: boolean }[] = [
    { label: 'YouTube', active: Boolean(card.sources.youtube) },
    { label: 'Spotify', active: Boolean(card.sources.spotify) },
    { label: 'Eigenes Asset', active: Boolean(card.sources.selfHostedAudio || card.sources.selfHostedVideo) },
    { label: 'Bild', active: Boolean(card.sources.image) },
    { label: 'Text', active: Boolean(card.sources.text) }
  ];

  return (
    <div className="flex flex-wrap gap-2 text-xs text-ink/70">
      {pills
        .filter((pill) => pill.active)
        .map((pill) => (
          <span key={pill.label} className={clsx('rounded-full px-3 py-1 bg-ink/5')}>
            {pill.label}
          </span>
        ))}
    </div>
  );
}
