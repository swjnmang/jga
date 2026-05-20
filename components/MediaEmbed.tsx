'use client';

// =============================================================================
// SPOTIFY INTEGRATION – EMBED API (Stand: Mai 2026)
// =============================================================================
// Spotify wird über die offizielle Embed-API eingebunden.
// conceal_metadata=true versteckt Titel/Artist nativ im Iframe – kein Overlay nötig.
// Der EmbedController ermöglicht play() / pause() direkt aus dem Code.
// Doku: https://developer.spotify.com/documentation/embeds/tutorials/using-the-iframe-api
// =============================================================================

import clsx from 'clsx';
import Image from 'next/image';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Card, MediaPreference } from '@/lib/types';

// Spotify Embed Controller type (minimal, not shipped in @types)
interface SpotifyEmbedController {
  play: () => void;
  pause: () => void;
  seek: (positionMs: number) => void;
  loadUri: (uri: string) => void;
  destroy: () => void;
  addListener: (event: string, callback: (data?: unknown) => void) => void;
}

interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: {
      uri: string;
      width?: string | number;
      height?: string | number;
      conceal_metadata?: boolean;
    },
    callback: (controller: SpotifyEmbedController) => void
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
    SpotifyIframeApiReadyCallbacks?: Array<(api: SpotifyIFrameAPI) => void>;
    _spotifyIframeApiInstance?: SpotifyIFrameAPI;
  }
}

function toYouTubeEmbed(url: string) {
  const match = url.match(/(?:v=|\.be\/|embed\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : null;
}

function toSpotifyTrackUri(url: string): string | null {
  const idMatch = url.match(/spotify\.com\/track\/([A-Za-z0-9]+)/);
  return idMatch ? `spotify:track:${idMatch[1]}` : null;
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
  onPause?: () => void;
  onPlaybackError?: (id: string, reason?: string) => void;
};

export type MediaEmbedHandle = {
  stop: () => void;
  play: () => void;
  pause: () => void;
};

export const MediaEmbed = forwardRef<MediaEmbedHandle, Props>(function MediaEmbed(
  { card, preference, concealMetadata = false, onPlay, onPause, onPlaybackError }: Props,
  ref
) {
  const [youtubeUnavailable, setYouTubeUnavailable] = useState(false);
  const [youtubeChecked, setYouTubeChecked] = useState(false);
  const choice = useMemo(
    () => resolveSource(card, preference, youtubeUnavailable),
    [card, preference, youtubeUnavailable]
  );
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);
  // Spotify Embed API
  const spotifyContainerRef = useRef<HTMLDivElement | null>(null);
  const spotifyControllerRef = useRef<SpotifyEmbedController | null>(null);
  const spotifyPositionRef = useRef<number>(0); // Aktuelle Position in ms für Resume
  const [isPlaying, setIsPlaying] = useState(false);
  const [spotifyFallback, setSpotifyFallback] = useState(false); // Fallback wenn API nicht lädt
  const [showYouTube, setShowYouTube] = useState(false);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), []);
  const reportedErrorRef = useRef(false);
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

  // Reset UI state on card/source change
  useEffect(() => {
    setIsPlaying(false);
    setShowYouTube(false);
    setEmbedError(null);
    setSpotifyFallback(false);
    reportedErrorRef.current = false;
  }, [choiceSignature]);

  const sendYouTubeCommand = (command: 'playVideo' | 'pauseVideo') => {
    if (!youtubeIframeRef.current?.contentWindow) return;
    youtubeIframeRef.current.contentWindow.postMessage(
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
      } catch {
        if (!cancelled) setYouTubeUnavailable(true);
      } finally {
        if (!cancelled) setYouTubeChecked(true);
      }
    };
    checkAvailability();
    return () => { cancelled = true; };
  }, [card.sources.youtube, card.id]);

  useImperativeHandle(ref, () => ({
    stop: () => {
      if (choice?.type === 'youtube') {
        sendYouTubeCommand('pauseVideo');
        setShowYouTube(false);
      }
      if (choice?.type === 'spotify') {
        spotifyControllerRef.current?.pause();
        spotifyControllerRef.current?.seek(0);
      }
      setIsPlaying(false);
    },
    play: () => {
      if (choice?.type === 'youtube') {
        sendYouTubeCommand('playVideo');
        setShowYouTube(true);
        setIsPlaying(true);
      }
      if (choice?.type === 'spotify') {
        if (spotifyControllerRef.current) {
          const pos = spotifyPositionRef.current;
          spotifyControllerRef.current.play();
          if (pos > 0) spotifyControllerRef.current.seek(pos);
          setIsPlaying(true);
        } else {
          // API not loaded — switch to iframe fallback
          setSpotifyFallback(true);
          setIsPlaying(true);
        }
      }
    },
    pause: () => {
      if (choice?.type === 'youtube') {
        sendYouTubeCommand('pauseVideo');
        setIsPlaying(false);
        onPause?.();
      }
      if (choice?.type === 'spotify') {
        spotifyControllerRef.current?.pause();
        setIsPlaying(false);
        onPause?.();
      }
    },
  }));

  useEffect(() => {
    // Report hard embed failures once to allow caller to block the card.
    if (embedError && !reportedErrorRef.current) {
      reportedErrorRef.current = true;
      onPlaybackError?.(card.id, 'embed-error');
    }
  }, [card.id, embedError, onPlaybackError]);

  // Spotify Embed API: Script laden und Controller erstellen / ersetzen wenn sich der Track ändert
  useEffect(() => {
    if (choice?.type !== 'spotify') return;
    const uri = toSpotifyTrackUri(choice.url);
    if (!uri) return;

    let destroyed = false;

    // Container mit transform:scale(0) im Body – visuell unsichtbar (0×0px),
    // Audio läuft weiter. transform macht position:fixed-Kinder relativ zum Container,
    // damit injiziert Spotify's eigener Mini-Player nicht in den Viewport.
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:320px;height:152px;transform:scale(0);transform-origin:top left;pointer-events:none;';
    document.body.appendChild(container);
    spotifyContainerRef.current = container;

    const initController = (api: SpotifyIFrameAPI) => {
      if (destroyed) return;
      spotifyControllerRef.current?.destroy();
      spotifyControllerRef.current = null;

      api.createController(
        container,
        { uri, height: 152, conceal_metadata: false },
        (controller) => {
          if (destroyed) { controller.destroy(); return; }
          spotifyControllerRef.current = controller;
          spotifyPositionRef.current = 0;
          setSpotifyFallback(false); // API loaded successfully
          // Position kontinuierlich tracken für Resume-Funktion
          controller.addListener('playback_update', (data: unknown) => {
            const d = data as { data?: { position?: number; isPaused?: boolean } };
            // Only update position while actually playing – Spotify can reset position to 0
            // internally after pausing, which would cause resume to restart from beginning.
            if (d?.data?.position !== undefined && !d?.data?.isPaused) {
              spotifyPositionRef.current = d.data.position;
            }
          });
        }
      );
    };

    if (typeof window !== 'undefined') {
      if (window._spotifyIframeApiInstance) {
        initController(window._spotifyIframeApiInstance);
      } else {
        if (!window.SpotifyIframeApiReadyCallbacks) {
          window.SpotifyIframeApiReadyCallbacks = [];
          window.onSpotifyIframeApiReady = (api: SpotifyIFrameAPI) => {
            window._spotifyIframeApiInstance = api;
            window.SpotifyIframeApiReadyCallbacks!.forEach(cb => cb(api));
          };
        }
        if (!document.getElementById('spotify-embed-api')) {
          const loadScript = () => {
            if (destroyed || document.getElementById('spotify-embed-api') || window._spotifyIframeApiInstance) return;
            const script = document.createElement('script');
            script.id = 'spotify-embed-api';
            script.src = 'https://open.spotify.com/embed/iframe-api/v1';
            script.async = true;
            script.onerror = () => {
              script.remove();
              // Retry after 3 seconds
              setTimeout(loadScript, 3000);
            };
            document.head.appendChild(script);
          };
          loadScript();
        }
        window.SpotifyIframeApiReadyCallbacks.push(initController);
      }
    }

    // Fallback: if controller not ready after 5s, offer iframe fallback
    const fallbackTimer = setTimeout(() => {
      if (!destroyed && !spotifyControllerRef.current) {
        setSpotifyFallback(true);
      }
    }, 5000);

    return () => {
      clearTimeout(fallbackTimer);
      destroyed = true;
      if (window.SpotifyIframeApiReadyCallbacks) {
        const idx = window.SpotifyIframeApiReadyCallbacks.indexOf(initController);
        if (idx !== -1) window.SpotifyIframeApiReadyCallbacks.splice(idx, 1);
      }
      spotifyControllerRef.current?.destroy();
      spotifyControllerRef.current = null;
      if (container.parentNode) container.parentNode.removeChild(container);
      spotifyContainerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choiceSignature]);

  // Overlay das sich dynamisch über den Spotify Mini-Player legt.
  // Ein MutationObserver erkennt das vom Embed injizierte iframe und positioniert
  // das Overlay exakt darüber – ohne andere Elemente zu überdecken.
  useEffect(() => {
    if (!concealMetadata || choice?.type !== 'spotify') return;

    const overlay = document.createElement('div');
    overlay.id = 'spotify-minibar-blocker';
    overlay.style.cssText = 'position:fixed;background:#000;z-index:2147483647;pointer-events:none;display:none;';
    document.body.appendChild(overlay);

    const positionOverlay = (el: Element) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      overlay.style.top = `${rect.top}px`;
      overlay.style.left = `${rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.display = 'block';
    };

    // Spotify Mini-Player iframe erkennen: hat keine src die unser Container-iframe ist,
    // sitzt direkt im body und hat einen spotify.com src
    const findAndCover = () => {
      const iframes = document.querySelectorAll('body > iframe, body > div > iframe');
      iframes.forEach(iframe => {
        const src = (iframe as HTMLIFrameElement).src || '';
        if (src.includes('spotify.com/embed') || src.includes('open.spotify.com')) {
          positionOverlay(iframe);
        }
      });
      // Auch direkte fixed-position divs im body prüfen (Spotify Mini-Player ist ein div)
      const bodyDivs = document.querySelectorAll('body > div[style*="fixed"]');
      bodyDivs.forEach(div => {
        if (div.id === 'spotify-minibar-blocker') return;
        const inner = div.querySelector('iframe[src*="spotify"]');
        if (inner) positionOverlay(div);
      });
    };

    const observer = new MutationObserver(findAndCover);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

    // Auch bei Resize/Scroll neu positionieren
    const reposition = () => findAndCover();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);

    findAndCover();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };
  }, [concealMetadata, choice?.type]);

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
              ref={youtubeIframeRef}
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
      const uri = toSpotifyTrackUri(choice.url);
      if (!uri) {
        return (
          <a href={choice.url} target="_blank" rel="noreferrer" className="text-sm underline">
            In Spotify öffnen
          </a>
        );
      }
      // Der Spotify Embed API Container wird in document.body gemountet (useEffect),
      // nicht hier im JSX – dadurch ist der iframe komplett aus dem sichtbaren DOM heraus.
      return (
        <div className="space-y-2">
          {fallbackNotice && (
            <p className="text-xs text-amber-300">
              YouTube-Quelle nicht erreichbar, Spotify wird verwendet.
            </p>
          )}
          {concealMetadata ? (
            // Während des Spiels: nur grüner Play/Pause-Button, keine Metadaten sichtbar
            spotifyFallback ? (
              // Fallback: Embed API nicht verfügbar — normales iframe mit autoplay
              <div className="space-y-2">
                <p className="text-xs text-amber-500 text-center">⚠ Spotify API nicht erreichbar – Fallback-Player</p>
                <iframe
                  src={`https://open.spotify.com/embed/track/${uri.replace('spotify:track:', '')}?utm_source=generator&theme=0&autoplay=1`}
                  width="100%"
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="eager"
                  className="block rounded-2xl"
                  title="Spotify Player"
                />
              </div>
            ) : (
            <div className="rounded-2xl card-surface flex items-center justify-center px-5 py-4" style={{ minHeight: 80 }}>
              <button
                type="button"
                onClick={() => {
                  if (isPlaying) {
                    spotifyControllerRef.current?.pause();
                    setIsPlaying(false);
                    onPause?.();
                  } else {
                    if (spotifyControllerRef.current) {
                      const pos = spotifyPositionRef.current;
                      spotifyControllerRef.current.play();
                      if (pos > 0) spotifyControllerRef.current.seek(pos);
                    } else {
                      // API not ready yet — fallback to iframe
                      setSpotifyFallback(true);
                    }
                    setIsPlaying(true);
                    onPlay?.();
                  }
                }}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 hover:bg-green-400 text-black flex items-center justify-center text-xl font-bold shadow transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
            </div>
            )
          ) : (
            // Ohne concealMetadata (z.B. Karten-Ansicht): vollständigen Player anzeigen
            <iframe
              src={`https://open.spotify.com/embed/track/${uri.replace('spotify:track:', '')}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="eager"
              className="block rounded-2xl"
              title="Spotify Player"
            />
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
