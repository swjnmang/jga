#!/usr/bin/env node
/**
 * Fix cards with placeholder year 1900 by extracting the correct year from the answer field.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILES_TO_FIX = [
  'lib/flagCards.ts',
  'lib/outlineCards.ts'
];

function fixPlaceholderYears(content) {
  const lines = content.split('\n');
  const result = [];
  let changes = 0;
  let currentYear = null;
  let yearLineIndex = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect year field with 1900
    const yearMatch = line.match(/^(\s*[",']?year[",']?\s*:\s*)1900(,?\s*)$/);
    if (yearMatch) {
      currentYear = 1900;
      yearLineIndex = result.length;
      result.push(line);
      continue;
    }

    // Detect answer field when we have a 1900 year
    const answerMatch = line.match(/^(\s*)([",']?)answer\2(\s*:\s*)([",'])(.+?)\4(,?\s*)$/);
    if (answerMatch && currentYear === 1900) {
      const indent = answerMatch[1];
      const quote = answerMatch[4];
      let answer = answerMatch[5];
      const comma = answerMatch[6];
      
      // Try to extract year from answer: "Country – YEAR, details" or "Country — YEAR, details"
      const yearInAnswer = answer.match(/[—–-]\s*(\d{4})\s*,/);
      
      if (yearInAnswer) {
        const extractedYear = parseInt(yearInAnswer[1]);
        
        // Update the year line that we saved earlier
        const oldYearLine = result[yearLineIndex];
        const yearLineMatch = oldYearLine.match(/^(\s*[",']?year[",']?\s*:\s*)1900(,?\s*)$/);
        if (yearLineMatch) {
          result[yearLineIndex] = `${yearLineMatch[1]}${extractedYear}${yearLineMatch[2]}`;
          changes++;
        }
        
        // Remove year from answer: "Country – YEAR, details" -> "Country – details"
        answer = answer.replace(/([—–-])\s*\d{4}\s*,\s*/, '$1 ');
      }
      
      result.push(`${indent}${answerMatch[2]}answer${answerMatch[2]}${answerMatch[3]}${quote}${answer}${quote}${comma}`);
      currentYear = null;
      yearLineIndex = null;
      continue;
    }

    // Reset if we hit a new card
    if (line.match(/^\s*[",']?id[",']?\s*:/)) {
      currentYear = null;
      yearLineIndex = null;
    }

    result.push(line);
  }

  return { content: result.join('\n'), changes };
}

console.log('🔧 Fixing placeholder years (1900)...\n');

let totalChanges = 0;

for (const file of FILES_TO_FIX) {
  const filePath = join(process.cwd(), file);
  
  try {
    console.log(`Processing ${file}...`);
    const content = readFileSync(filePath, 'utf8');
    const { content: fixed, changes } = fixPlaceholderYears(content);
    
    if (changes > 0) {
      writeFileSync(filePath, fixed, 'utf8');
      console.log(`  ✅ Fixed ${changes} placeholder years`);
      totalChanges += changes;
    } else {
      console.log(`  ℹ️  No changes needed`);
    }
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
  }
}

console.log(`\n✨ Done! Total changes: ${totalChanges}`);
