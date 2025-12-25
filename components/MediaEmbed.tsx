import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
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

function resolveSource(card: Card, preference: MediaPreference): MediaChoice | null {
  const { sources } = card;
  if (preference === 'youtube' && sources.youtube) return { type: 'youtube', url: sources.youtube };
  if (preference === 'spotify' && sources.spotify) return { type: 'spotify', url: sources.spotify };

  if (sources.youtube) return { type: 'youtube', url: sources.youtube };
  if (sources.spotify) return { type: 'spotify', url: sources.spotify };
  if (sources.selfHostedVideo) return { type: 'selfHostedVideo', url: sources.selfHostedVideo };
  if (sources.selfHostedAudio) return { type: 'selfHostedAudio', url: sources.selfHostedAudio };
  if (sources.image) return { type: 'image', url: sources.image };
  if (sources.text) return { type: 'text', text: sources.text };

  return null;
}

type Props = {
  card: Card;
  preference: MediaPreference;
  concealMetadata?: boolean;
};

export function MediaEmbed({ card, preference, concealMetadata = false }: Props) {
  const choice = resolveSource(card, preference);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);
  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), []);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [spotifyDevice, setSpotifyDevice] = useState<string | null>(null);
  const [spotifyReady, setSpotifyReady] = useState(false);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);
  const spotifyPlayerRef = useRef<Spotify.Player | null>(null);

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
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    // Stop playback when source changes.
    setIsPlaying(false);
    setShowSpotify(false);
  }, [choice?.type, choice && 'url' in choice ? (choice as any).url : '']);

  // Fetch Spotify token from server (httpOnly cookie proxied)
  useEffect(() => {
    if (choice?.type !== 'spotify') return;
    const loadToken = async () => {
      try {
        const res = await fetch('/api/spotify/token');
        if (!res.ok) {
          setSpotifyError('Spotify Login erforderlich');
          return;
        }
        const json = await res.json();
        setSpotifyToken(json.accessToken as string);
      } catch (err) {
        setSpotifyError('Spotify Token konnte nicht geladen werden');
      }
    };
    loadToken();
  }, [choice?.type]);

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
      return;
    }

    try {
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
      } else {
        setSpotifyError(null);
        setShowSpotify(false);
        setIsPlaying(true);
      }
    } catch (_err) {
      setSpotifyError('Wiedergabe konnte nicht gestartet werden');
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

  const toggleSpotify = () => {
    if (!spotifyToken) {
      setSpotifyError('Spotify Login erforderlich');
      return;
    }
    if (isPlaying) {
      pauseSpotify();
    } else {
      playSpotifyTrack(choice?.type === 'spotify' ? choice.url : '');
    }
  };

  if (!choice) {
    return <p className="text-sm text-ink/70">Keine Quelle hinterlegt.</p>;
  }

  switch (choice.type) {
    case 'youtube': {
      const baseUrl = toYouTubeEmbed(choice.url) ?? choice.url;
      const embedUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}enablejsapi=1&controls=0&rel=0&modestbranding=1&playsinline=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`;
      return (
        <div className="space-y-2 relative">
          <div className="aspect-video overflow-hidden rounded-2xl card-surface relative bg-ink">
            <iframe
              src={embedUrl}
              className="h-full w-full opacity-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              ref={iframeRef}
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
      const embedUrl = toSpotifyEmbed(choice.url) ?? choice.url;
      return (
        <div className="space-y-2 relative">
          <div className="overflow-hidden rounded-2xl card-surface relative bg-ink">
            <iframe
              src={embedUrl}
              width="100%"
              height="200"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className={`w-full transition-opacity ${showSpotify ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              title="Medieninhalt"
            />
            {!showSpotify && (
              <div className="absolute inset-0 flex items-center justify-center text-sand bg-ink">
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-sand text-ink px-4 py-2 text-sm font-semibold shadow"
                    onClick={toggleSpotify}
                    disabled={!spotifyToken}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  {spotifyError && <p className="text-xs text-red-200">{spotifyError}</p>}
                  {!spotifyReady && !spotifyError && spotifyToken && (
                    <p className="text-xs text-sand/80">Initialisiere Spotify Player …</p>
                  )}
                </div>
              </div>
            )}
          </div>
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
        <img
          src={choice.url}
          alt="Bildinhalt"
          className="w-full rounded-2xl card-surface object-cover"
        />
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
}

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
