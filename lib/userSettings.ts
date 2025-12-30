import { CardCategory, DecadeTag, Difficulty, GenreTag } from './types';

export type UserSettings = {
  timerSeconds: number;
  categories: CardCategory[];
  difficulties: Difficulty[];
  categoryWeights: Record<CardCategory, number>;
  genres: GenreTag[];
  decades: DecadeTag[];
};

const STORAGE_KEY = 'jga-user-settings';

export const ALL_GENRES: GenreTag[] = ['poprock', 'metal', 'hiphop', 'schlagerparty'];
export const ALL_DECADES: DecadeTag[] = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

export function toDecadeTag(year: number): DecadeTag | undefined {
  if (year >= 1960 && year < 1970) return '1960s';
  if (year >= 1970 && year < 1980) return '1970s';
  if (year >= 1980 && year < 1990) return '1980s';
  if (year >= 1990 && year < 2000) return '1990s';
  if (year >= 2000 && year < 2010) return '2000s';
  if (year >= 2010 && year < 2020) return '2010s';
  if (year >= 2020 && year < 2030) return '2020s';
  return undefined;
}

export function getDefaultSettings(availableCategories: CardCategory[], availableDecades?: DecadeTag[]): UserSettings {
  const even = Math.floor(100 / availableCategories.length);
  const remainder = 100 - even * availableCategories.length;
  const categoryWeights = availableCategories.reduce<Record<CardCategory, number>>((acc, cat, idx) => {
    acc[cat] = even + (idx < remainder ? 1 : 0);
    return acc;
  }, {} as Record<CardCategory, number>);

  return {
    timerSeconds: 120,
    categories: availableCategories,
    difficulties: ['leicht', 'mittel', 'schwer'],
    categoryWeights,
    genres: ALL_GENRES,
    decades: availableDecades && availableDecades.length > 0 ? availableDecades : ALL_DECADES
  };
}

export function loadSettings(defaults: UserSettings): UserSettings {
  if (typeof window === 'undefined') return defaults;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    const weights = fillCategoryWeights(defaults.categoryWeights, parsed.categoryWeights, defaults.categories);
    const activeFromWeights = Object.entries(weights)
      .filter(([, value]) => value > 0)
      .map(([cat]) => cat as CardCategory);

    return {
      ...defaults,
      ...parsed,
      genres: normalizeList(parsed.genres as GenreTag[] | undefined, defaults.genres, ALL_GENRES),
      decades: normalizeList(parsed.decades as DecadeTag[] | undefined, defaults.decades, defaults.decades),
      categories:
        activeFromWeights.length > 0
          ? activeFromWeights
          : parsed.categories && parsed.categories.length > 0
            ? parsed.categories
            : defaults.categories,
      difficulties:
        parsed.difficulties && parsed.difficulties.length > 0 ? parsed.difficulties : defaults.difficulties,
      timerSeconds: parsed.timerSeconds && parsed.timerSeconds > 0 ? parsed.timerSeconds : defaults.timerSeconds,
      categoryWeights: weights
    };
  } catch (_err) {
    return defaults;
  }
}

function fillCategoryWeights(
  defaults: Record<CardCategory, number>,
  parsed: Record<string, number> | undefined,
  categories: CardCategory[]
) {
  if (!parsed) return defaults;
  const result: Record<CardCategory, number> = { ...defaults };
  for (const cat of categories) {
    const value = parsed[cat];
    result[cat] = typeof value === 'number' && value >= 0 ? value : defaults[cat];
  }
  return result;
}

export function saveSettings(settings: UserSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function normalizeList<T extends string>(parsed: T[] | undefined, defaults: T[], allowed: T[]): T[] {
  if (!parsed || parsed.length === 0) return defaults;
  const allowedSet = new Set(allowed);
  const filtered = parsed.filter((v) => allowedSet.has(v as T));
  return filtered.length > 0 ? filtered : defaults;
}

export function getSettingsStorageKey() {
  return STORAGE_KEY;
}
