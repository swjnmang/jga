export type CardCategory =
  | 'music'
  | 'quote'
  | 'video'
  | 'image'
  | 'flag'
  | 'outline'
  | 'sportfreizeit'
  | 'religionglaube'
  | 'geogeschichte'
  | 'natur'
  | 'filmserien'
  | 'schaetzfragen'
  | 'essentrinken'
  | 'gaming'
  | 'gzsz';

export type Difficulty = 'leicht' | 'mittel' | 'schwer';

export type GenreTag = 'pop' | 'rock' | 'metal' | 'hiphop' | 'rnb' | 'electronic' | 'schlagerparty';
export type DecadeTag = '1960s' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';

export type MediaSources = {
  youtube?: string;
  spotify?: string;
  selfHostedVideo?: string;
  selfHostedAudio?: string;
  image?: string;
  text?: string;
  textDe?: string;
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
  playlists?: string[];
  background?: string;
  color?: string;
  distractors?: string[];
  /** Nur für category 'quote': woher das Zitat stammt. */
  quoteSourceType?: 'film' | 'lied' | 'person';
};

export type MediaPreference = 'auto' | 'youtube' | 'spotify';

