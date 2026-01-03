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
  // Region patterns based on mapsicon folder structure
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
    if (codes.includes(countryCode)) {
      return region;
    }
  }
  
  return null;
}

// Get decade range for a given year (±5 years)
function getDecadeRange(year: number): [number, number] {
  return [year - 5, year + 5];
}

/**
 * Generate 3 distractor (wrong) answers for a given card
 * Returns an array of 3 unique wrong answers based on category/region/decade
 */
export function generateDistractors(currentCard: Card): string[] {
  const distractors: string[] = [];
  const currentAnswer = currentCard.answer;
  
  // Filter candidates based on category
  let candidates = allCards.filter(c => 
    c.id !== currentCard.id && 
    c.answer !== currentAnswer &&
    c.category === currentCard.category
  );

  // Special logic for country cards (flags/outlines) - filter by region
  if (currentCard.category === 'country') {
    const region = getRegion(currentCard.id);
    if (region) {
      const regionalCandidates = candidates.filter(c => getRegion(c.id) === region);
      if (regionalCandidates.length >= 3) {
        candidates = regionalCandidates;
      }
    }
  }

  // Special logic for music cards - filter by decade (±5 years)
  if (currentCard.category === 'music' && typeof currentCard.year === 'number') {
    const [minYear, maxYear] = getDecadeRange(currentCard.year);
    const decadeCandidates = candidates.filter(c => 
      typeof c.year === 'number' && c.year >= minYear && c.year <= maxYear
    );
    if (decadeCandidates.length >= 3) {
      candidates = decadeCandidates;
    }
  }

  // Shuffle and pick 3 unique distractors
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  
  for (const candidate of shuffled) {
    if (distractors.length >= 3) break;
    if (!distractors.includes(candidate.answer)) {
      distractors.push(candidate.answer);
    }
  }

  // Fallback: if we don't have enough distractors, add generic ones
  while (distractors.length < 3) {
    distractors.push(`Option ${distractors.length + 1}`);
  }

  return distractors;
}

/**
 * Get all 4 options (1 correct + 3 distractors) in random order
 * Returns: { options: string[], correctIndex: number }
 */
export function getMultipleChoiceOptions(card: Card): { options: string[]; correctIndex: number } {
  const distractors = generateDistractors(card);
  const allOptions = [card.answer, ...distractors];
  
  // Shuffle all 4 options
  const shuffled = allOptions
    .map((option, index) => ({ option, index, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.option);
  
  // Find the index of the correct answer after shuffling
  const correctIndex = shuffled.indexOf(card.answer);
  
  return { options: shuffled, correctIndex };
}
