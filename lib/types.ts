export type CardCategory = 'music' | 'quote' | 'video' | 'image' | 'country';

export type Difficulty = 'leicht' | 'mittel' | 'schwer';

export type Language = 'de' | 'en' | 'fr';

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
  difficulty: Difficulty;
  sources: MediaSources;
  background?: string;
  color?: string;
};

export type MediaPreference = 'auto' | 'youtube' | 'spotify';
