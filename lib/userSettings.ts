import { CardCategory, Difficulty } from './types';

export type UserSettings = {
  timerSeconds: number;
  categories: CardCategory[];
  difficulties: Difficulty[];
  categoryWeights: Record<CardCategory, number>;
};

const STORAGE_KEY = 'jga-user-settings';

export function getDefaultSettings(availableCategories: CardCategory[]): UserSettings {
  const even = Math.floor(100 / availableCategories.length);
  const remainder = 100 - even * availableCategories.length;
  const categoryWeights = availableCategories.reduce<Record<CardCategory, number>>((acc, cat, idx) => {
    acc[cat] = even + (idx < remainder ? 1 : 0);
    return acc;
  }, {} as Record<CardCategory, number>);

  return {
    timerSeconds: 180,
    categories: availableCategories,
    difficulties: ['leicht', 'mittel', 'schwer'],
    categoryWeights
  };
}

export function loadSettings(defaults: UserSettings): UserSettings {
  if (typeof window === 'undefined') return defaults;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return {
      ...defaults,
      ...parsed,
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : defaults.categories,
      difficulties:
        parsed.difficulties && parsed.difficulties.length > 0 ? parsed.difficulties : defaults.difficulties,
      timerSeconds: parsed.timerSeconds && parsed.timerSeconds > 0 ? parsed.timerSeconds : defaults.timerSeconds,
      categoryWeights: fillCategoryWeights(defaults.categoryWeights, parsed.categoryWeights, defaults.categories)
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

export function getSettingsStorageKey() {
  return STORAGE_KEY;
}
