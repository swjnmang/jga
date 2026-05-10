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
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);
  // Spotify Embed API
  const spotifyContainerRef = useRef<HTMLDivElement | null>(null);
  const spotifyControllerRef = useRef<SpotifyEmbedController | null>(null);
  const spotifyApiReadyRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
        spotifyControllerRef.current?.play();
        setIsPlaying(true);
      }
    },
    pause: () => {
      if (choice?.type === 'youtube') {
        sendYouTubeCommand('pauseVideo');
        setIsPlaying(false);
      }
      if (choice?.type === 'spotify') {
        spotifyControllerRef.current?.pause();
        setIsPlaying(false);
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

    const initController = (api: SpotifyIFrameAPI) => {
      if (destroyed || !spotifyContainerRef.current) return;
      // Zerstöre alten Controller, falls vorhanden
      spotifyControllerRef.current?.destroy();
      spotifyControllerRef.current = null;

      // Container leeren (alter iframe entfernen)
      spotifyContainerRef.current.innerHTML = '';

      api.createController(
        spotifyContainerRef.current,
        { uri, height: 152, conceal_metadata: concealMetadata },
        (controller) => {
          if (destroyed) { controller.destroy(); return; }
          spotifyControllerRef.current = controller;
        }
      );
    };

    // Script nur einmal laden; mehrere Callbacks via Array koordinieren
    if (typeof window !== 'undefined') {
      // API schon initialisiert → sofort Controller erstellen
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
        // Script nur einmal ins DOM einfügen
        if (!document.getElementById('spotify-embed-api')) {
          const script = document.createElement('script');
          script.id = 'spotify-embed-api';
          script.src = 'https://open.spotify.com/embed/iframe-api/v1';
          script.async = true;
          document.head.appendChild(script);
        }
        window.SpotifyIframeApiReadyCallbacks.push(initController);
      }
    }

    return () => {
      destroyed = true;
      if (window.SpotifyIframeApiReadyCallbacks) {
        const idx = window.SpotifyIframeApiReadyCallbacks.indexOf(initController);
        if (idx !== -1) window.SpotifyIframeApiReadyCallbacks.splice(idx, 1);
      }
      spotifyControllerRef.current?.destroy();
      spotifyControllerRef.current = null;
    };
  // concealMetadata hier explizit im dep-array, damit ein Wechsel (z.B. Antwort zeigen) den Controller neu erstellt
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choiceSignature, concealMetadata]);

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
      return (
        <div className="space-y-2">
          {fallbackNotice && (
            <p className="text-xs text-amber-300">
              YouTube-Quelle nicht erreichbar, Spotify wird verwendet.
            </p>
          )}
          {/* Die Spotify Embed API rendert den Player in dieses div.
              conceal_metadata=true wird direkt an die API übergeben – kein Overlay nötig. */}
          <div ref={spotifyContainerRef} className="rounded-2xl overflow-hidden" style={{ minHeight: 152 }} />
          <a
            href={choice.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-sand/50 underline"
          >
            In Spotify öffnen
          </a>
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
