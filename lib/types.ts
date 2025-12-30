export type CardCategory = 'music' | 'quote' | 'video' | 'image' | 'country';

export type Difficulty = 'leicht' | 'mittel' | 'schwer';

export type GenreTag = 'poprock' | 'metal' | 'hiphop' | 'schlagerparty';
export type DecadeTag = '1960s' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

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
  genres?: GenreTag[];
  background?: string;
  color?: string;
};

export type MediaPreference = 'auto' | 'youtube' | 'spotify';
