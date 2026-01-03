import { Card } from './types';
import { cards } from './cards';
import { flagCards } from './flagCards';
import { outlineCards } from './outlineCards';
import { playlistCards } from './playlistCards';
import { filmSerienCards } from './filmSerienCards';
import { naturTechnikCards } from './naturTechnikCards';
import { triviaExtraCards } from './triviaExtraCards';
import { schaetzfragenCards } from './schaetzfragenCards';

const allCards = [
  ...cards,
  ...flagCards,
  ...outlineCards,
  ...playlistCards,
  ...filmSerienCards,
  ...naturTechnikCards,
  ...triviaExtraCards,
  ...schaetzfragenCards
];

// Extract the region/continent from country card IDs (e.g., "flag-de" -> "europe")
function getRegion(cardId: string): string | null {
  const regionPrefixes = {
    africa: ['dz', 'ao', 'bj', 'bw', 'bf', 'bi', 'cm', 'cv', 'cf', 'td', 'km', 'cd', 'cg', 'ci', 'dj', 'eg', 'gq', 'er', 'et', 'ga', 'gm', 'gh', 'gn', 'gw', 'ke', 'ls', 'lr', 'ly', 'mg', 'mw', 'ml', 'mr', 'mu', 'ma', 'mz', 'na', 'ne', 'ng', 'rw', 'st', 'sn', 'sc', 'sl', 'so', 'za', 'ss', 'sd', 'sz', 'tz', 'tg', 'tn', 'ug', 'zm', 'zw', 'eh'],
    asia: ['af', 'am', 'az', 'bh', 'bd', 'bt', 'bn', 'kh', 'cn', 'ge', 'in', 'id', 'ir', 'iq', 'il', 'jp', 'jo', 'kz', 'kw', 'kg', 'la', 'lb', 'my', 'mv', 'mn', 'mm', 'np', 'kp', 'om', 'pk', 'ps', 'ph', 'qa', 'sa', 'sg', 'kr', 'lk', 'sy', 'tw', 'tj', 'th', 'tl', 'tr', 'tm', 'ae', 'uz', 'vn', 'ye'],
    europe: ['al', 'ad', 'at', 'by', 'be', 'ba', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 'hu', 'is', 'ie', 'it', 'xk', 'lv', 'li', 'lt', 'lu', 'mk', 'mt', 'md', 'mc', 'me', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sm', 'rs', 'sk', 'si', 'es', 'se', 'ch', 'ua', 'gb', 'va'],
    namerica: ['ag', 'bs', 'bb', 'bz', 'ca', 'cr', 'cu', 'dm', 'do', 'sv', 'gd', 'gt', 'ht', 'hn', 'jm', 'mx', 'ni', 'pa', 'kn', 'lc', 'vc', 'tt', 'us'],
    samerica: ['ar', 'bo', 'br', 'cl', 'co', 'ec', 'gy', 'py', 'pe', 'sr', 'uy', 've'],
    oceania: ['au', 'fj', 'ki', 'mh', 'fm', 'nr', 'nz', 'pw', 'pg', 'ws', 'sb', 'to', 'tv', 'vu']
  };

  const countryCode = cardId.replace(/^(flag|outline)-/, '');
  for (const [region, codes] of Object.entries(regionPrefixes)) {
    if (codes.includes(countryCode)) return region;
  }
  return null;
}

// Get decade range for a given year (±5 years)
function getDecadeRange(year: number): [number, number] {
  return [year - 5, year + 5];
}

/**
 * Extract numeric value from estimation answer
 */
function extractNumericValue(answer: string): number | null {
  let cleaned = answer
    .replace(/^(ca\.|etwa|über|bis zu|approximately|around)\s*/i, '')
    .replace(/\s+(Kilometer|km|Meter|m|Liter|l|Tonnen|t|Kilo|kg|Kilogramm|Tasten|Jahre|Stunden|Minuten|Eier|Millionen|Milliarden|Billiarden|.*)$/, '');
  
  const numberMatch = cleaned.match(/[\d.,]+/);
  if (numberMatch) {
    const numStr = numberMatch[0].replace(/\./g, '').replace(/,/g, '.');
    const num = parseFloat(numStr);
    if (!isNaN(num) && num > 0) return num;
  }
  return null;
}

/**
 * Generate numeric distractor alternatives for estimation questions
 * KEEP THIS UNCHANGED - IT WORKS WELL!
 */
function generateNumericDistractors(correctValue: number, answer: string): string[] {
  const distractors: string[] = [];
  const offsets = [0.25, 0.5, 0.75];
  const variants: number[] = [];
  
  for (const offset of offsets) {
    variants.push(correctValue * (1 + offset));
    variants.push(correctValue * (1 - offset));
  }
  
  const shuffled = variants.sort(() => Math.random() - 0.5);
  const unitMatch = answer.match(/[\d.,]+\s*(.+)$/);
  const unit = unitMatch ? unitMatch[1] : '';
  
  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    const val = shuffled[i];
    let formatted: string;
    if (val >= 1000000) {
      formatted = (val / 1000000).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Millionen';
    } else if (val >= 1000) {
      formatted = (val / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Tausend';
    } else {
      formatted = val.toLocaleString('de-DE', { maximumFractionDigits: 1 });
    }
    
    if (unit) {
      distractors.push(`ca. ${formatted} ${unit.trim()}`);
    } else {
      distractors.push(`ca. ${formatted}`);
    }
  }
  
  return distractors.slice(0, 3);
}

/**
 * Generate 3 distractor answers using SIMPLIFIED approach:
 * - Estimation questions: Use numeric generation (WORKING WELL ✓)
 * - All other questions: Use category-based DB matching
 *   with smart filtering (region for countries, decade for music, difficulty for others)
 * 
 * This ensures distractors are always REAL ANSWERS from the database,
 * preventing formatting mismatch issues.
 */
export function generateDistractors(currentCard: Card): string[] {
  const distractors: string[] = [];
  const currentAnswer = currentCard.answer;
  
  // ===== ESTIMATION QUESTIONS: Use numeric generation (KEEP AS-IS) =====
  if (currentCard.category === 'schaetzfragen') {
    const numericValue = extractNumericValue(currentCard.answer);
    if (numericValue !== null && numericValue > 0) {
      const numericDistractors = generateNumericDistractors(numericValue, currentCard.answer);
      if (numericDistractors.length >= 3) {
        return numericDistractors;
      }
    }
  }
  
  // ===== ALL OTHER CATEGORIES: Use category-based DB matching =====
  let candidates = allCards.filter(c => 
    c.id !== currentCard.id && 
    c.answer !== currentAnswer &&
    c.category === currentCard.category
  );

  // COUNTRY CARDS: Filter by region (same continent)
  if (currentCard.category === 'country') {
    const region = getRegion(currentCard.id);
    if (region) {
      const regionalCandidates = candidates.filter(c => getRegion(c.id) === region);
      if (regionalCandidates.length >= 3) {
        candidates = regionalCandidates;
      }
    }
  }
  
  // MUSIC CARDS: Filter by decade (±5 years)
  if (currentCard.category === 'music' && typeof currentCard.year === 'number') {
    const [minYear, maxYear] = getDecadeRange(currentCard.year);
    const decadeCandidates = candidates.filter(c => 
      typeof c.year === 'number' && c.year >= minYear && c.year <= maxYear
    );
    if (decadeCandidates.length >= 3) {
      candidates = decadeCandidates;
    }
  }
  
  // OTHER CATEGORIES: Filter by difficulty
  if (['naturtechnik', 'religionglaube', 'geogeschichte', 'sportfreizeit', 'image', 'video', 'quote', 'filmeserien'].includes(currentCard.category)) {
    const difficultyOrder = { leicht: 0, mittel: 1, schwer: 2 };
    const currentLevel = difficultyOrder[currentCard.difficulty] ?? 1;
    const difficultyLevels = Object.keys(difficultyOrder) as Array<keyof typeof difficultyOrder>;
    const adjacentDifficulties = difficultyLevels.filter(
      d => Math.abs(difficultyOrder[d] - currentLevel) <= 1
    );
    const broadCandidates = candidates.filter(c => adjacentDifficulties.includes(c.difficulty));
    if (broadCandidates.length >= 3) {
      candidates = broadCandidates;
    }
  }

  // Shuffle and pick 3 unique real answers from database
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  
  for (const candidate of shuffled) {
    if (distractors.length >= 3) break;
    if (!distractors.includes(candidate.answer)) {
      distractors.push(candidate.answer);
    }
  }

  // Fallback: if we somehow don't have enough, use any category answers
  if (distractors.length < 3) {
    const anyCategory = allCards.filter(c => 
      c.id !== currentCard.id && 
      c.answer !== currentAnswer &&
      c.category === currentCard.category &&
      !candidates.map(cc => cc.id).includes(c.id)
    );
    const moreCandidates = anyCategory.sort(() => Math.random() - 0.5);
    for (const candidate of moreCandidates) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(candidate.answer)) {
        distractors.push(candidate.answer);
      }
    }
  }

  // Last resort: generic placeholder
  while (distractors.length < 3) {
    distractors.push(`Alternative ${distractors.length + 1}`);
  }

  return distractors;
}

/**
 * Get all 4 options (1 correct + 3 distractors) in random order
 */
export function getMultipleChoiceOptions(card: Card): { options: string[]; correctIndex: number } {
  const distractors = generateDistractors(card);
  const allOptions = [card.answer, ...distractors];
  
  const shuffled = allOptions
    .map((option, index) => ({ option, index, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.option);
  
  const correctIndex = shuffled.indexOf(card.answer);
  
  return { options: shuffled, correctIndex };
}
