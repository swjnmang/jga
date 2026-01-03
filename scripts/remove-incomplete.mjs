import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const flagPath = path.join(__dirname, '../lib/flagCards.ts');
const outlinePath = path.join(__dirname, '../lib/outlineCards.ts');

function removeIncompleteCards(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const result = [];
  let i = 0;
  let removed = [];
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if this is the start of a card object
    if (line.trim() === '{' && i + 1 < lines.length && lines[i+1].includes('"id"')) {
      // Collect the entire card
      let cardLines = [line];
      let braceCount = 1;
      let cardStartIdx = i;
      i++;
      
      let titleLine = '';
      let answerLine = '';
      
      while (braceCount > 0 && i < lines.length) {
        cardLines.push(lines[i]);
        
        if (lines[i].includes('"title"')) {
          titleLine = lines[i];
        }
        if (lines[i].includes('"answer"')) {
          answerLine = lines[i];
        }
        
        braceCount += (lines[i].match(/{/g) || []).length;
        braceCount -= (lines[i].match(/}/g) || []).length;
        
        i++;
      }
      
      // Check if answer has a 4-digit year
      const hasYear = answerLine.match(/\b\d{4}\b/);
      
      if (hasYear) {
        // Keep the card
        result.push(...cardLines);
      } else {
        // Remove the card
        const titleMatch = titleLine.match(/"title":\s*"([^"]+)"/);
        if (titleMatch) {
          removed.push(titleMatch[1]);
        }
      }
    } else {
      result.push(line);
      i++;
    }
  }
  
  return {
    content: result.join('\n'),
    removed: removed
  };
}

console.log('🔍 Removing incomplete countries...\n');

const flagResult = removeIncompleteCards(flagPath);
const outlineResult = removeIncompleteCards(outlinePath);

if (flagResult.removed.length > 0) {
  console.log(`❌ FLAGGEN REMOVED (${flagResult.removed.length}):`);
  flagResult.removed.forEach((t, i) => {
    console.log(`   ${i+1}. ${t}`);
  });
  fs.writeFileSync(flagPath, flagResult.content, 'utf-8');
}

if (outlineResult.removed.length > 0) {
  console.log(`\n❌ UMRISSE REMOVED (${outlineResult.removed.length}):`);
  outlineResult.removed.forEach((t, i) => {
    console.log(`   ${i+1}. ${t}`);
  });
  fs.writeFileSync(outlinePath, outlineResult.content, 'utf-8');
}

const totalRemoved = flagResult.removed.length + outlineResult.removed.length;
console.log(`\n✅ Total removed: ${totalRemoved} entries`);
if (totalRemoved > 0) {
  console.log('✓ Files updated successfully!');
}
