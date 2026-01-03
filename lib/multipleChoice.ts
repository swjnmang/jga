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

/**
 * Extract artist/creator from answer string
 * Handles formats like:
 * - "Artist — Title" or "Artist - Title"
 * - "Title – Artist" or "Title - Artist"
 */
function extractCreator(answer: string): string | null {
  // Match pattern: something — something or something - something
  const patterns = [
    /^(.+?)\s*(?:—|–|-)\s*(.+)$/,  // "Creator — Title" or "Creator - Title"
  ];
  
  for (const pattern of patterns) {
    const match = answer.match(pattern);
    if (match) {
      const firstPart = match[1].trim();
      const secondPart = match[2].trim();
      // Return the part that looks like a creator (shorter, no punctuation)
      if (firstPart.length < secondPart.length) {
        return firstPart;
      }
      return secondPart;
    }
  }
  return null;
}

/**
 * Extract numeric value from estimation answer
 * Handles formats like:
 * - "ca. 100.000 Kilometer"
 * - "88 Tasten"
 * - "ca. 18 Stunden und 45 Minuten"
 * - "über 2.000 Jahre"
 */
function extractNumericValue(answer: string): number | null {
  // Remove "ca.", "etwa", "über", "bis zu" and common words
  let cleaned = answer
    .replace(/^(ca\.|etwa|über|bis zu|approximately|around)\s*/i, '')
    .replace(/\s+(Kilometer|km|Meter|m|Liter|l|Tonnen|t|Tasten|Jahre|Jahre|Stunden|Minuten|Eier|Millionen|Milliarden|Billiarden|.*)$/, '');
  
  // Try to extract the first number (including decimals and thousands separators)
  const numberMatch = cleaned.match(/[\d.,]+/);
  if (numberMatch) {
    // Replace common thousand separators
    const numStr = numberMatch[0]
      .replace(/\./g, '') // Remove German thousand separator
      .replace(/,/g, '.'); // Convert German decimal comma to period
    
    const num = parseFloat(numStr);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }
  
  return null;
}

/**
 * Generate numeric distractor alternatives for estimation questions
 * Creates realistic wrong answers using percentage offsets
 */
function generateNumericDistractors(correctValue: number, answer: string): string[] {
  const distractors: string[] = [];
  
  // Generate alternatives at ±25%, ±50%, ±75% offsets
  const offsets = [0.25, 0.5, 0.75];
  const variants: number[] = [];
  
  for (const offset of offsets) {
    variants.push(correctValue * (1 + offset)); // +25%, +50%, +75%
    variants.push(correctValue * (1 - offset)); // -25%, -50%, -75%
  }
  
  // Randomly shuffle and pick 3
  const shuffled = variants.sort(() => Math.random() - 0.5);
  
  // Extract unit from original answer (everything after the number)
  const unitMatch = answer.match(/[\d.,]+\s*(.+)$/);
  const unit = unitMatch ? unitMatch[1] : '';
  
  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    const val = shuffled[i];
    // Format with proper separators based on magnitude
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
 * Semantic similarity lookup for Religion/Belief cards
 * Maps concepts to related alternatives
 */
const religionConceptMap: Record<string, string[]> = {
  'christentum': ['islam', 'judentum', 'buddhismus', 'hinduismus'],
  'islam': ['christentum', 'judentum', 'buddhismus', 'hinduismus'],
  'buddhismus': ['hinduismus', 'taoismus', 'christentum', 'judentum'],
  'judentum': ['christentum', 'islam', 'buddhismus', 'hinduismus'],
  'hinduismus': ['buddhismus', 'taoismus', 'sikhismus', 'jainismus'],
  'orthodoxe': ['katholisch', 'protestantisch', 'anglikanisch', 'evangelisch'],
  'katholisch': ['protestantisch', 'orthodoxe', 'anglikanisch', 'evangelisch'],
  'protestantisch': ['katholisch', 'orthodoxe', 'anglikanisch', 'methodist'],
  'nonne': ['mönch', 'priester', 'pastor', 'rabbi'],
  'kirche': ['moschee', 'synagoge', 'tempel', 'schrein'],
  'allah': ['gott', 'brahman', 'jahwe', 'vishnu'],
  'gott': ['allah', 'brahman', 'jesus', 'buddha'],
  'jesus': ['mohammed', 'buddha', 'moses', 'abraham'],
  'mohammed': ['jesus', 'moses', 'buddha', 'abraham'],
  'guru': ['scheich', 'rabbi', 'lama', 'priester'],
  'heilig': ['profan', 'weltlich', 'sakral', 'spirituell'],
};

/**
 * Semantic similarity lookup for Sport/Leisure cards
 */
const sportConceptMap: Record<string, string[]> = {
  'fußball': ['basketball', 'volleyball', 'handball', 'eishockey'],
  'tennis': ['badminton', 'squash', 'tischtennis', 'federball'],
  'golf': ['polo', 'croquet', 'billiard', 'boccia'],
  'schwimmen': ['wasserpolo', 'tauchen', 'surfen', 'segeln'],
  'ski': ['snowboard', 'schlittschuh', 'eislaufen', 'bob'],
  'marathon': ['laufen', 'gehen', 'joggen', 'crossfit'],
  'olympische': ['weltmeisterschaft', 'europameisterschaft', 'asienmeisterschaft', 'championship'],
  'formel': ['motorsport', 'rallye', 'kartfahren', 'motocross'],
  'baseball': ['cricket', 'softball', 'rounders', 'lacrosse'],
  'boxen': ['kickboxen', 'muay thai', 'wrestling', 'ringen'],
};

/**
 * Semantic similarity lookup for Geo/History cards
 */
const geoHistoryConceptMap: Record<string, string[]> = {
  'deutschland': ['österreich', 'schweiz', 'polen', 'frankreich'],
  'frankreich': ['deutschland', 'belgien', 'schweiz', 'italien'],
  'england': ['schottland', 'wales', 'irland', 'dänemark'],
  'russland': ['ukraine', 'kasachstan', 'georgien', 'belarus'],
  'china': ['japan', 'korea', 'vietnam', 'thailand'],
  'usa': ['kanada', 'mexiko', 'brasilien', 'australien'],
  'napoleon': ['friedrich', 'kaiser', 'general', 'diktator'],
  'weltkrieg': ['krieg', 'konflikt', 'revolution', 'invasion'],
  'revolution': ['aufstand', 'putsch', 'coup', 'umsturz'],
  'kaiser': ['könig', 'zar', 'sultan', 'emir'],
  'reich': ['königreich', 'imperium', 'vielvölkerstaat', 'federation'],
  'mittelalter': ['antike', 'renaissance', 'barock', 'romantik'],
  'antike': ['mittelalter', 'renaissance', 'römisch', 'griechisch'],
};

/**
 * Semantic similarity lookup for Nature/Tech cards
 */
const natureTechConceptMap: Record<string, string[]> = {
  'mathematik': ['physik', 'chemie', 'geometrie', 'algebra'],
  'physik': ['chemie', 'biologie', 'mathematik', 'astronomie'],
  'chemie': ['physik', 'biologie', 'pharmazie', 'alchemie'],
  'biologie': ['botanik', 'zoologie', 'genetik', 'mikrobiologie'],
  'botanik': ['zoologie', 'ökologie', 'landwirtschaft', 'gartenbau'],
  'zoologie': ['ornithologie', 'entomologie', 'ichthyologie', 'herpetologie'],
  'astronomie': ['astrophysik', 'kosmologie', 'raumfahrt', 'planeten'],
  'energy': ['strom', 'kraft', 'wärmekraft', 'windkraft'],
  'atom': ['kern', 'elektron', 'proton', 'neutrino'],
  'darwin': ['evolution', 'naturselektion', 'anpassung', 'mutation'],
  'newton': ['gravitationskraft', 'bewegung', 'kraft', 'masse'],
};

/**
 * Find similar concept alternatives from a lookup map
 */
function findSimilarConcepts(answer: string, conceptMap: Record<string, string[]>): string[] {
  const answerLower = answer.toLowerCase();
  const alternatives: string[] = [];
  
  for (const [key, values] of Object.entries(conceptMap)) {
    if (answerLower.includes(key)) {
      return values.slice(0, 3);
    }
  }
  
  return alternatives;
}

/**
 * Generate 3 distractor (wrong) answers for a given card
 * PHASE 1: Quote/Film - uses creator-based matching
 * PHASE 2: Estimation - uses numeric variance
 * PHASE 3: Religion/Sport/Geo - uses concept similarity lookup
 * FALLBACK: Category + difficulty matching for others
 */
export function generateDistractors(currentCard: Card): string[] {
  const distractors: string[] = [];
  const currentAnswer = currentCard.answer;
  
  // PHASE 1: QUOTE CARDS - Find other quotes by same creator
  if (currentCard.category === 'quote') {
    const creator = extractCreator(currentCard.answer);
    if (creator) {
      const creatorCandidates = allCards.filter(c =>
        c.id !== currentCard.id &&
        c.category === 'quote' &&
        c.answer !== currentAnswer &&
        c.answer.toLowerCase().includes(creator.toLowerCase())
      );
      
      if (creatorCandidates.length >= 3) {
        const shuffled = [...creatorCandidates].sort(() => Math.random() - 0.5);
        for (const candidate of shuffled) {
          if (distractors.length >= 3) break;
          if (!distractors.includes(candidate.answer)) {
            distractors.push(candidate.answer);
          }
        }
        return distractors;
      }
    }
  }
  
  // PHASE 1: FILM/SERIES CARDS - Find other films by same creator
  if (currentCard.category === 'filmeserien') {
    const creator = extractCreator(currentCard.answer);
    if (creator) {
      const creatorCandidates = allCards.filter(c =>
        c.id !== currentCard.id &&
        c.category === 'filmeserien' &&
        c.answer !== currentAnswer &&
        c.answer.toLowerCase().includes(creator.toLowerCase())
      );
      
      if (creatorCandidates.length >= 3) {
        const shuffled = [...creatorCandidates].sort(() => Math.random() - 0.5);
        for (const candidate of shuffled) {
          if (distractors.length >= 3) break;
          if (!distractors.includes(candidate.answer)) {
            distractors.push(candidate.answer);
          }
        }
        return distractors;
      }
    }
  }
  
  // PHASE 2: ESTIMATION CARDS - Generate numeric variants
  if (currentCard.category === 'schaetzfragen') {
    const numericValue = extractNumericValue(currentCard.answer);
    if (numericValue !== null && numericValue > 0) {
      const numericDistractors = generateNumericDistractors(numericValue, currentCard.answer);
      if (numericDistractors.length >= 3) {
        return numericDistractors;
      }
    }
  }
  
  // PHASE 3: Religion/Sport/Geo - Use concept similarity lookup
  if (currentCard.category === 'religionglaube') {
    const similarConcepts = findSimilarConcepts(currentAnswer, religionConceptMap);
    if (similarConcepts.length > 0) {
      // Find answers matching those concepts
      const conceptCandidates = allCards.filter(c =>
        c.id !== currentCard.id &&
        c.category === 'religionglaube' &&
        c.answer !== currentAnswer &&
        similarConcepts.some(concept => c.answer.toLowerCase().includes(concept.toLowerCase()))
      );
      
      if (conceptCandidates.length >= 3) {
        const shuffled = [...conceptCandidates].sort(() => Math.random() - 0.5);
        for (const candidate of shuffled) {
          if (distractors.length >= 3) break;
          if (!distractors.includes(candidate.answer)) {
            distractors.push(candidate.answer);
          }
        }
        if (distractors.length >= 3) return distractors;
      }
    }
  }
  
  if (currentCard.category === 'sportfreizeit') {
    const similarConcepts = findSimilarConcepts(currentAnswer, sportConceptMap);
    if (similarConcepts.length > 0) {
      const conceptCandidates = allCards.filter(c =>
        c.id !== currentCard.id &&
        c.category === 'sportfreizeit' &&
        c.answer !== currentAnswer &&
        similarConcepts.some(concept => c.answer.toLowerCase().includes(concept.toLowerCase()))
      );
      
      if (conceptCandidates.length >= 3) {
        const shuffled = [...conceptCandidates].sort(() => Math.random() - 0.5);
        for (const candidate of shuffled) {
          if (distractors.length >= 3) break;
          if (!distractors.includes(candidate.answer)) {
            distractors.push(candidate.answer);
          }
        }
        if (distractors.length >= 3) return distractors;
      }
    }
  }
  
  if (currentCard.category === 'geogeschichte') {
    const similarConcepts = findSimilarConcepts(currentAnswer, geoHistoryConceptMap);
    if (similarConcepts.length > 0) {
      const conceptCandidates = allCards.filter(c =>
        c.id !== currentCard.id &&
        c.category === 'geogeschichte' &&
        c.answer !== currentAnswer &&
        similarConcepts.some(concept => c.answer.toLowerCase().includes(concept.toLowerCase()))
      );
      
      if (conceptCandidates.length >= 3) {
        const shuffled = [...conceptCandidates].sort(() => Math.random() - 0.5);
        for (const candidate of shuffled) {
          if (distractors.length >= 3) break;
          if (!distractors.includes(candidate.answer)) {
            distractors.push(candidate.answer);
          }
        }
        if (distractors.length >= 3) return distractors;
      }
    }
  }
  
  if (currentCard.category === 'naturtechnik') {
    const similarConcepts = findSimilarConcepts(currentAnswer, natureTechConceptMap);
    if (similarConcepts.length > 0) {
      const conceptCandidates = allCards.filter(c =>
        c.id !== currentCard.id &&
        c.category === 'naturtechnik' &&
        c.answer !== currentAnswer &&
        similarConcepts.some(concept => c.answer.toLowerCase().includes(concept.toLowerCase()))
      );
      
      if (conceptCandidates.length >= 3) {
        const shuffled = [...conceptCandidates].sort(() => Math.random() - 0.5);
        for (const candidate of shuffled) {
          if (distractors.length >= 3) break;
          if (!distractors.includes(candidate.answer)) {
            distractors.push(candidate.answer);
          }
        }
        if (distractors.length >= 3) return distractors;
      }
    }
  }
  
  // FALLBACK: Category matching
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
  else if (currentCard.category === 'music' && typeof currentCard.year === 'number') {
    const [minYear, maxYear] = getDecadeRange(currentCard.year);
    const decadeCandidates = candidates.filter(c => 
      typeof c.year === 'number' && c.year >= minYear && c.year <= maxYear
    );
    if (decadeCandidates.length >= 3) {
      candidates = decadeCandidates;
    }
  }
  
  // OTHER CATEGORIES: Filter by difficulty
  else if (['image', 'video'].includes(currentCard.category)) {
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

  // Shuffle and pick 3 unique distractors
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  
  for (const candidate of shuffled) {
    if (distractors.length >= 3) break;
    if (!distractors.includes(candidate.answer)) {
      distractors.push(candidate.answer);
    }
  }

  // Fallback: if we don't have enough distractors, add generic placeholder
  while (distractors.length < 3) {
    distractors.push(`Alternative ${distractors.length + 1}`);
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
