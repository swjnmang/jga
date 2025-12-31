export type ThemeId = 'aurora' | 'midnight' | 'sunrise';

const THEME_KEY = 'app-theme';
const MOTION_KEY = 'app-reduce-motion';

export const themes: { id: ThemeId; name: string; description: string }[] = [
  { id: 'aurora', name: 'Aurora', description: 'Blaue Neonflächen mit Glas-Effekt (Standard).' },
  { id: 'midnight', name: 'Midnight', description: 'Dunkles Violett-Türkis für fokussiertes Spielen.' },
  { id: 'sunrise', name: 'Sunrise', description: 'Warme Sunrise-Töne mit leichtem Glow.' }
];

export function applyTheme(theme: ThemeId) {
  if (typeof document === 'undefined') return;
  document.body.dataset.theme = theme;
}

export function loadTheme(fallback: ThemeId = 'aurora'): ThemeId {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(THEME_KEY) as ThemeId | null;
  return stored && themes.some((t) => t.id === stored) ? stored : fallback;
}

export function saveTheme(theme: ThemeId) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_KEY, theme);
}

export function loadReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(MOTION_KEY) === 'true';
}

export function saveReduceMotion(value: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MOTION_KEY, value ? 'true' : 'false');
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.reduceMotion = value ? 'true' : 'false';
  }
}

export function applyReduceMotion(value: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.reduceMotion = value ? 'true' : 'false';
}
