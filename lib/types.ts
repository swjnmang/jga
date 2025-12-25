export type CardCategory = 'music' | 'quote' | 'video' | 'image';

export type MediaSources = {
  youtube?: string;
  spotify?: string;
  selfHostedVideo?: string;
  selfHostedAudio?: string;
  image?: string;
  text?: string;
};

export type Card = {
  id: string;
  title: string;
  category: CardCategory;
  year: number;
  cue: string;
  answer: string;
  hint?: string;
  sources: MediaSources;
  background?: string;
  color?: string;
};

export type MediaPreference = 'auto' | 'youtube' | 'spotify';
