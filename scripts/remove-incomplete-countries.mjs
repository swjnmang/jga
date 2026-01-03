import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const flagPath = path.join(__dirname, '../lib/flagCards.ts');
const outlinePath = path.join(__dirname, '../lib/outlineCards.ts');

// Read files
let flagContent = fs.readFileSync(flagPath, 'utf-8');
let outlineContent = fs.readFileSync(outlinePath, 'utf-8');

// Find cards without years by looking for patterns like:
// "answer": "Country – Staatsumriss" or "answer": "Country – Staatsflagge"
// WITHOUT a 4-digit year

function removeCardsWithoutYears(content, type) {
  // Split by card objects
  const cardPattern = /\{\s*"id":\s*"[^"]+",[\s\S]*?\n\s*\}/g;
  const cards = content.match(cardPattern) || [];
  
  const removed = [];
  let newContent = content;
  
  cards.forEach(card => {
    // Check if card has year
    const hasYear = card.match(/\b\d{4}\b/);
    
    if (!hasYear) {
      // Get title for logging
      const titleMatch = card.match(/"title":\s*"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : 'Unknown';
      
      removed.push(title);
      
      // Remove this card from content
      newContent = newContent.replace(card, '');
    }
  });
  
  // Clean up multiple newlines
  newContent = newContent.replace(/\n\n\n+/g, '\n\n');
  
  return { content: newContent, removed };
}

console.log('🔍 Identifying incomplete countries...\n');

const flagResult = removeCardsWithoutYears(flagContent, 'flag');
const outlineResult = removeCardsWithoutYears(outlineContent, 'outline');

if (flagResult.removed.length > 0) {
  console.log(`❌ FLAGGEN REMOVED (${flagResult.removed.length}):`);
  flagResult.removed.forEach(t => console.log(`   - ${t}`));
}

if (outlineResult.removed.length > 0) {
  console.log(`\n❌ UMRISSE REMOVED (${outlineResult.removed.length}):`);
  outlineResult.removed.forEach(t => console.log(`   - ${t}`));
}

// Write updated files
if (flagResult.removed.length > 0) {
  fs.writeFileSync(flagPath, flagResult.content, 'utf-8');
}
if (outlineResult.removed.length > 0) {
  fs.writeFileSync(outlinePath, outlineResult.content, 'utf-8');
}

const totalRemoved = flagResult.removed.length + outlineResult.removed.length;
console.log(`\n✅ Total removed: ${totalRemoved} entries`);
console.log('✓ Files updated successfully!');
