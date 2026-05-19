/**
 * Zentrale Kategorie-Metadaten: Label + Icon.
 * Wird von Spielerstellung, Ban-Phase, Spielfeld und Einstellungen genutzt.
 */
export const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  music:          { label: 'Musik',                     icon: '🎵' },
  quote:          { label: 'Berühmte Zitate',           icon: '💬' },
  image:          { label: 'Bilder erkennen',           icon: '🖼️' },
  flag:           { label: 'Flaggen erkennen',          icon: '🏳️' },
  outline:        { label: 'Länder am Umriss',          icon: '🗺️' },
  video:          { label: 'Video',                     icon: '🎬' },
  filmserien:     { label: 'Filme & Serien',            icon: '🎞️' },
  film:           { label: 'Film & Serie',              icon: '🎞️' },
  natur:          { label: 'Natur & Technik',           icon: '🔬' },
  naturtechnik:   { label: 'Natur & Technik',           icon: '🔬' },
  schaetzfragen:  { label: 'Schätzfragen',              icon: '🎯' },
  geogeschichte:  { label: 'Geographie & Geschichte',   icon: '🌍' },
  religionglaube: { label: 'Religion & Glaube',         icon: '✝️' },
  sportfreizeit:  { label: 'Sport & Freizeit',          icon: '🏆' },
  essentrinken:   { label: 'Essen & Trinken',           icon: '🍽️' },
  gaming:         { label: 'Gaming & eSports',          icon: '🎮' },
  gzsz:           { label: 'GZSZ',                      icon: '📺' },
  triviaextra:    { label: 'Trivia Extra',              icon: '🧠' },
  popkultur:      { label: 'Popkultur',                 icon: '🎭' },
};

/** Icon für eine Kategorie, Fallback '❓' */
export function catIcon(cat: string): string {
  return CATEGORY_META[cat]?.icon ?? '❓';
}

/** Vollständiges Label, Fallback auf den rohen Schlüssel */
export function catLabel(cat: string): string {
  return CATEGORY_META[cat]?.label ?? cat;
}

/** Icon + Label kombiniert, z.B. "🎵 Musik" */
export function catLabelWithIcon(cat: string): string {
  const m = CATEGORY_META[cat];
  if (!m) return cat;
  return `${m.icon} ${m.label}`;
}

/** Kürzeres Label für kompakte Anzeige (Scoreboard) */
export const CAT_SHORT: Record<string, string> = {
  music: 'Musik', quote: 'Zitat', filmserien: 'Film', film: 'Film',
  flag: 'Flagge', outline: 'Umriss', natur: 'Natur', naturtechnik: 'Natur',
  triviaextra: 'Trivia', schaetzfragen: 'Schätzfr.', geogeschichte: 'Geo',
  religionglaube: 'Religion', sportfreizeit: 'Sport', popkultur: 'Popkultur',
  essentrinken: 'Essen', gaming: 'Gaming', gzsz: 'GZSZ',
};

export function catShortLabel(cat: string): string {
  return CAT_SHORT[cat] ?? CATEGORY_META[cat]?.label ?? cat;
}
