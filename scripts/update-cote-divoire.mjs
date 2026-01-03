#!/usr/bin/env node
/**
 * Update Côte d'Ivoire independence date
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILES = [
  'lib/flagCards.ts',
  'lib/outlineCards.ts'
];

function updateCoteDIvoire(content) {
  let changes = 0;
  const original = content;
  
  // Use String.fromCharCode for the curly quote (8217)
  const curlyQuote = String.fromCharCode(8217);
  const coteName = `Côte d${curlyQuote}Ivoire`;
  
  // Replace year 2016 with 1960 for flag card
  content = content.replace(
    `"year": 2016,\r\n    "cue": "Zu welchem Land gehört diese Flagge und wann wurde es gegründet?",\r\n    "answer": "${coteName} – Verfassung der Dritten Republik."`,
    `"year": 1960,\r\n    "cue": "Zu welchem Land gehört diese Flagge und wann wurde es gegründet?",\r\n    "answer": "${coteName} – 7. August 1960, Unabhaengigkeitserklaerung."`
  );
  
  // Replace year 2016 with 1960 for outline card
  content = content.replace(
    `"year": 2016,\r\n    "cue": "Zu welchem Land gehört dieser Umriss und wann wurde es gegründet?",\r\n    "answer": "${coteName} – III. Republik."`,
    `"year": 1960,\r\n    "cue": "Zu welchem Land gehört dieser Umriss und wann wurde es gegründet?",\r\n    "answer": "${coteName} – 7. August 1960, Unabhaengigkeitserklaerung."`
  );
  
  if (content !== original) {
    changes = 1;
  }
  
  return { content, changes };
}

console.log('🔧 Updating Côte d\'Ivoire independence date...\n');

let totalChanges = 0;

for (const file of FILES) {
  const filePath = join(process.cwd(), file);
  
  try {
    console.log(`Processing ${file}...`);
    const content = readFileSync(filePath, 'utf8');
    const { content: updated, changes } = updateCoteDIvoire(content);
    
    if (changes > 0) {
      writeFileSync(filePath, updated, 'utf8');
      console.log(`  ✅ Updated Côte d'Ivoire date (${changes} changes)`);
      totalChanges += changes;
    } else {
      console.log(`  ℹ️  No changes needed`);
    }
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
  }
}

console.log(`\n✨ Done! Files updated: ${totalChanges}`);
