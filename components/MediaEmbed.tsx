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
                <button
                  type="button"
                  className="rounded-full bg-sand text-ink px-4 py-2 text-sm font-semibold shadow"
                  onClick={() => setShowSpotify(true)}
                >
                  Spotify-Player öffnen
                </button>
              </div>
            )}
          </div>
          <a className="text-sm underline" href={choice.url} target="_blank" rel="noreferrer">
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
