import clsx from 'clsx';
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

  if (!choice) {
    return <p className="text-sm text-ink/70">Keine Quelle hinterlegt.</p>;
  }

  switch (choice.type) {
    case 'youtube': {
      const embedUrl = toYouTubeEmbed(choice.url) ?? choice.url;
      return (
        <div className="space-y-2 relative">
          <div className="aspect-video overflow-hidden rounded-2xl card-surface">
            <iframe
              src={embedUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Medieninhalt"
            />
            {concealMetadata && (
              <div className="absolute inset-0 bg-gradient-to-b from-ink/80 to-ink/60 text-sand flex items-center justify-center text-sm font-semibold">
                Verdeckter Inhalt – nur anhören
              </div>
            )}
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
          <div className="overflow-hidden rounded-2xl card-surface">
            <iframe
              src={embedUrl}
              width="100%"
              height="200"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              title="Medieninhalt"
            />
            {concealMetadata && (
              <div className="absolute inset-0 bg-gradient-to-b from-ink/80 to-ink/60 text-sand flex items-center justify-center text-sm font-semibold">
                Verdeckter Inhalt – nur anhören
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
