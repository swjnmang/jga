import { readFileSync, writeFileSync } from 'fs';

const files = [
  'lib/playlistCards.ts',
  'lib/cards.ts',
  'lib/filmSerienCards.ts',
  'lib/naturTechnikCards.ts',
  'lib/triviaExtraCards.ts',
  'lib/schaetzfragenCards.ts'
];

// Patterns for false umlauts that should be corrected
// These are typically at word boundaries or in English words
const falseUmlautPatterns = [
  // Word-initial false umlauts - most common at start of English words
  { pattern: /(\s|^|"|')Ö([a-z])/g, replacement: '$1O$2' },
  { pattern: /(\s|^|"|')Ä([a-z])/g, replacement: '$1A$2' },
  { pattern: /(\s|^|"|')Ü([a-z])/g, replacement: '$1U$2' },
  
  // After special characters like em-dash, parentheses, slashes
  { pattern: /(—|–|\(|\[|\/)Ö([a-z])/g, replacement: '$1O$2' },
  { pattern: /(—|–|\(|\[|\/)Ä([a-z])/g, replacement: '$1A$2' },
  { pattern: /(—|–|\(|\[|\/)Ü([a-z])/g, replacement: '$1U$2' },
  
  // Common English words with false umlauts (keep as fallback)
  { pattern: /\bÖne\b/g, replacement: 'One' },
  { pattern: /\bÄdele\b/g, replacement: 'Adele' },
  
  // False umlauts in middle of English words (Passenger, etc.)
  { pattern: /Ässenger/g, replacement: 'assenger' },
  { pattern: /ässenger/g, replacement: 'assenger' },
  
  // Common letter combinations that shouldn't have umlauts
  { pattern: /([a-z])ö([a-z])/gi, replacement: (match, p1, p2) => {
    // Skip if this looks like a German word (followed by common German endings)
    if (p2.match(/[nmrtl]/)) return match;
    return p1 + 'o' + p2;
  }},
  { pattern: /([a-z])ä([a-z])/gi, replacement: (match, p1, p2) => {
    // Skip German patterns
    if (p2.match(/[nmrtl]/)) return match;
    return p1 + 'a' + p2;
  }},
  { pattern: /([a-z])ü([a-z])/gi, replacement: (match, p1, p2) => {
    // Skip German patterns
    if (p2.match(/[nmrtl]/)) return match;
    return p1 + 'u' + p2;
  }}
];

let totalChanges = 0;

for (const file of files) {
  console.log(`\n📄 Processing ${file}...`);
  
  try {
    let content = readFileSync(file, 'utf8');
    const original = content;
    let fileChanges = 0;
    
    for (const { pattern, replacement } of falseUmlautPatterns) {
      const before = content;
      content = content.replace(pattern, replacement);
      const matches = (before.match(pattern) || []).length;
      if (matches > 0) {
        console.log(`  ✓ Fixed ${matches}x: ${pattern}`);
        fileChanges += matches;
      }
    }
    
    if (content !== original) {
      writeFileSync(file, content, 'utf8');
      console.log(`  ✅ Saved ${fileChanges} changes to ${file}`);
      totalChanges += fileChanges;
    } else {
      console.log(`  ℹ️  No changes needed`);
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n✨ Done! Fixed ${totalChanges} false umlauts total.\n`);
