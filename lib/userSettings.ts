import { CardCategory, Difficulty } from './types';

export type UserSettings = {
  timerSeconds: number;
  categories: CardCategory[];
  difficulties: Difficulty[];
};

const STORAGE_KEY = 'jga-user-settings';

export function getDefaultSettings(availableCategories: CardCategory[]): UserSettings {
  return {
    timerSeconds: 180,
    categories: availableCategories,
    difficulties: ['leicht', 'mittel', 'schwer']
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
      timerSeconds: parsed.timerSeconds && parsed.timerSeconds > 0 ? parsed.timerSeconds : defaults.timerSeconds
    };
  } catch (_err) {
    return defaults;
  }
}

export function saveSettings(settings: UserSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getSettingsStorageKey() {
  return STORAGE_KEY;
}
