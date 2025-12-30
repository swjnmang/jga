'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
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
  | { type: 'text'; text: string };

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
  if (sources.text) return { type: 'text', text: sources.text };

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
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const spotifyPlayerRef = useRef<Spotify.Player | null>(null);
  const choiceSignature = useMemo(() => {
    if (!choice) return '';
    if (choice.type === 'text') return `text:${choice.text}`;
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
    setIsPlaying(false);
    setShowSpotify(false);
    setShowYouTube(false);
    setEmbedError(null);
    setSpotifyError(null);
    reportedErrorRef.current = false;
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
    if (spotifyToken) return;
    const loadToken = async () => {
      try {
        const res = await fetch('/api/spotify/token');
        if (!res.ok) {
          setSpotifyError('Spotify Login erforderlich');
          return;
        }
        const json = await res.json();
        setSpotifyToken(json.accessToken as string);
      } catch (_err) {
        setSpotifyError('Spotify Token konnte nicht geladen werden');
      }
    };
    loadToken();
  }, [choice?.type, spotifyToken]);

  // Load Spotify Web Playback SDK and connect
  useEffect(() => {
    if (choice?.type !== 'spotify') return;
    if (!spotifyToken) return;

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if (window.Spotify) return resolve();
        const script = document.createElement('script');
        script.id = 'spotify-sdk';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    const setup = async () => {
      await ensureScript();

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
          getOAuthToken: (cb) => cb(spotifyToken),
          volume: 0.8
        });

        spotifyPlayerRef.current = player;

        player.addListener('ready', ({ device_id }) => {
          setSpotifyDevice(device_id);
          setSpotifyReady(true);
        });

        player.addListener('player_state_changed', (state) => {
          setIsPlaying(Boolean(state && !state.paused));
        });

        player.addListener('initialization_error', ({ message }) => setSpotifyError(message));
        player.addListener('authentication_error', ({ message }) => setSpotifyError(message));
        player.addListener('account_error', ({ message }) => setSpotifyError(message));

        player.connect();
      };

      window.onSpotifyWebPlaybackSDKReady = initializePlayer;

      if (window.Spotify) {
        initializePlayer();
      }
    };

    setup();

    return () => {
      if (spotifyPlayerRef.current) {
        spotifyPlayerRef.current.disconnect();
        spotifyPlayerRef.current = null;
      }
    };
  }, [choice?.type, spotifyToken]);

  const transferPlayback = async () => {
    if (!spotifyToken || !spotifyDevice) return;
    await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ device_ids: [spotifyDevice], play: false })
    });
  };

  const activatePlayer = async () => {
    if (spotifyPlayerRef.current && 'activateElement' in spotifyPlayerRef.current) {
      try {
        await (spotifyPlayerRef.current as any).activateElement();
      } catch (_err) {
        // ignore
      }
    }
  };

  const playSpotifyTrack = async (url: string) => {
    if (!spotifyToken) {
      setSpotifyError('Spotify Login erforderlich');
      return;
    }
    if (!spotifyDevice) {
      setSpotifyError('Spotify Player noch nicht bereit');
      return;
    }

    const match = url.match(/spotify\.com\/track\/([A-Za-z0-9]+)/);
    const trackId = match ? match[1] : null;
    if (!trackId) {
      setSpotifyError('Ungültige Spotify-URL');
      onPlaybackError?.(card.id, 'invalid-url');
      return;
    }

    setSpotifyLoading(true);
    try {
      await activatePlayer();
      await transferPlayback();
      const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDevice}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [`spotify:track:${trackId}`] })
      });
      if (!res.ok) {
        setSpotifyError('Wiedergabe konnte nicht gestartet werden');
        setIsPlaying(false);
        onPlaybackError?.(card.id, 'play-failed');
      } else {
        setSpotifyError(null);
        setShowSpotify(true);
        setIsPlaying(true);
      }
    } catch (_err) {
      setSpotifyError('Wiedergabe konnte nicht gestartet werden');
      setIsPlaying(false);
      onPlaybackError?.(card.id, 'exception');
    } finally {
      setSpotifyLoading(false);
    }
  };

  const pauseSpotify = async () => {
    if (!spotifyToken || !spotifyDevice) return;
    try {
      await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${spotifyDevice}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${spotifyToken}` }
      });
      setIsPlaying(false);
    } catch (_err) {
      // ignore
    }
  };

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
      playSpotifyTrack(choice?.type === 'spotify' ? choice.url : '');
      onPlay?.();
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

  const resetSpotify = () => {
    if (spotifyPlayerRef.current) {
      spotifyPlayerRef.current.disconnect();
      spotifyPlayerRef.current = null;
    }
    setSpotifyReady(false);
    setSpotifyDevice(null);
    setSpotifyToken(null);
    setSpotifyError(null);
    setShowSpotify(false);
    setIsPlaying(false);
  };

  if (!choice) {
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
            className="inline-flex w-fit rounded-full bg-ink text-sand px-4 py-2 text-xs font-semibold"
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
                className="rounded-full bg-sand text-ink px-4 py-2 text-sm font-semibold shadow"
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
      const showSpotifyFallback = Boolean(embedError || spotifyError || !spotifyReady);
      return (
        <div className="space-y-2 relative">
          {fallbackNotice && (
            <p className="text-xs text-amber-300">
              YouTube-Quelle nicht erreichbar, Spotify wird verwendet.
            </p>
          )}
          <div className="rounded-2xl card-surface relative bg-ink p-4 flex flex-col items-center gap-3 text-sand">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold">Spotify Player</p>
              {spotifyError && <p className="text-xs text-red-200">{spotifyError}</p>}
              {!spotifyReady && !spotifyError && spotifyToken && (
                <p className="text-xs text-sand/80">Spotify Player wird verbunden …</p>
              )}
              {!spotifyToken && <p className="text-xs text-red-200">Spotify Login erforderlich</p>}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full bg-sand text-ink px-4 py-2 text-sm font-semibold shadow disabled:opacity-50"
                onClick={toggleSpotify}
                disabled={!spotifyToken || spotifyLoading || !spotifyReady}
              >
                {spotifyLoading ? 'Lädt…' : isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                className="rounded-full border border-sand/40 px-3 py-2 text-xs"
                onClick={resetSpotify}
              >
                Neu verbinden
              </button>
              <a
                href={choice.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-sand/40 px-3 py-2 text-xs"
              >
                In Spotify öffnen
              </a>
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
                  className="rounded-full bg-ink text-sand px-3 py-1 font-semibold"
                >
                  In Spotify öffnen
                </a>
                <button
                  type="button"
                  className="rounded-full border border-ink/20 px-3 py-1"
                  onClick={resetSpotify}
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
          <div className="relative w-full max-h-[70vh] min-h-[240px] rounded-2xl card-surface bg-ink/40 overflow-hidden">
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
        <div className="card-surface rounded-2xl p-4 text-lg font-semibold leading-relaxed">
          {choice.text}
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
