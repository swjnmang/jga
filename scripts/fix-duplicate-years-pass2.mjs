#!/usr/bin/env node
/**
 * Second pass: Fix remaining duplicate year issues after first script run.
 * This handles cases where the year appears with different patterns.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILES_TO_FIX = [
  'lib/cards.ts',
  'lib/flagCards.ts',
  'lib/outlineCards.ts',
  'lib/playlistCards.ts'
];

function fixRemainingYears(content) {
  const lines = content.split('\n');
  const result = [];
  let changes = 0;
  let currentYear = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect year field
    const yearMatch = line.match(/^\s*[",']?year[",']?\s*:\s*(\d+),?\s*$/);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1]);
      result.push(line);
      continue;
    }

    // Detect answer field
    const answerMatch = line.match(/^\s*([",']?)answer\1\s*:\s*([",'])(.+?)\2,?\s*$/);
    if (answerMatch && currentYear && currentYear > 0 && currentYear !== 1900) {
      const quote = answerMatch[2];
      let answer = answerMatch[3];
      const originalAnswer = answer;
      
      // Pattern: "Text [dash] YEAR, more text" -> "Text — more text"
      // Handles corrupted dashes too (", „, etc)
      const yearPattern = new RegExp(`\\s*[—–\\-"„"]\\s*${currentYear}\\s*,\\s*`, 'g');
      answer = answer.replace(yearPattern, ' — ');
      
      // Pattern: "Text, YEAR" at end -> "Text"
      const endPattern = new RegExp(`,\\s*${currentYear}\\.?\\s*$`);
      answer = answer.replace(endPattern, '.');
      
      // Pattern: dates like "31.08.YEAR" -> keep as is (these are specific dates, not just years)
      // Already handled by looking for isolated years
      
      if (answer !== originalAnswer) {
        changes++;
        const indent = line.match(/^\s*/)[0];
        const answerKey = answerMatch[1] ? `${answerMatch[1]}answer${answerMatch[1]}` : 'answer';
        const comma = line.trim().endsWith(',') ? ',' : '';
        result.push(`${indent}${answerKey}: ${quote}${answer}${quote}${comma}`);
      } else {
        result.push(line);
      }
      
      currentYear = null;
      continue;
    }

    // Reset year if we hit a new card
    if (line.match(/^\s*[",']?id[",']?\s*:/)) {
      currentYear = null;
    }

    result.push(line);
  }

  return { content: result.join('\n'), changes };
}

console.log('🔧 Second pass: Fixing remaining duplicate years...\n');

let totalChanges = 0;

for (const file of FILES_TO_FIX) {
  const filePath = join(process.cwd(), file);
  
  try {
    console.log(`Processing ${file}...`);
    const content = readFileSync(filePath, 'utf8');
    const { content: fixed, changes } = fixRemainingYears(content);
    
    if (changes > 0) {
      writeFileSync(filePath, fixed, 'utf8');
      console.log(`  ✅ Fixed ${changes} remaining years`);
      totalChanges += changes;
    } else {
      console.log(`  ℹ️  No changes needed`);
    }
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
  }
}

console.log(`\n✨ Done! Total changes: ${totalChanges}`);
