#!/usr/bin/env node
/**
 * Fix double quote syntax errors at the end of answer fields.
 * Pattern: "answer": "Text."", -> "answer": "Text.",
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILES_TO_FIX = [
  'lib/cards.ts',
  'lib/flagCards.ts',
  'lib/outlineCards.ts',
  'lib/playlistCards.ts'
];

function fixDoubleQuotes(content) {
  let changes = 0;
  
  // Fix any pattern: "text"", -> "text",
  // This catches all cases where a quote is immediately followed by another quote before the comma
  content = content.replace(/("answer"\s*:\s*"[^"]+)"",/g, (match, prefix) => {
    changes++;
    return prefix + '",';
  });
  
  // Fix single quotes: 'text'', -> 'text',
  content = content.replace(/('answer'\s*:\s*'[^']+)'',/g, (match, prefix) => {
    changes++;
    return prefix + "',";
  });
  
  return { content, changes };
}

console.log('🔧 Fixing double quote syntax errors...\n');

let totalChanges = 0;

for (const file of FILES_TO_FIX) {
  const filePath = join(process.cwd(), file);
  
  try {
    console.log(`Processing ${file}...`);
    const originalContent = readFileSync(filePath, 'utf8');
    const { content: fixed, changes } = fixDoubleQuotes(originalContent);
    
    if (changes > 0) {
      writeFileSync(filePath, fixed, 'utf8');
      console.log(`  ✅ Fixed ${changes} double quotes`);
      totalChanges += changes;
    } else {
      console.log(`  ℹ️  No changes needed`);
    }
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
  }
}

console.log(`\n✨ Done! Total changes: ${totalChanges}`);
