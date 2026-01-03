#!/usr/bin/env node
/**
 * Fix duplicate year references in card answer fields.
 * 
 * The issue: Year is stored in the year field AND duplicated in the answer text.
 * Example:
 *   year: 1988
 *   answer: "Nirvana — 1988, Nevermind."
 * 
 * This script removes the duplicate year from the answer field.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILES_TO_FIX = [
  'lib/cards.ts',
  'lib/flagCards.ts',
  'lib/outlineCards.ts',
  'lib/playlistCards.ts'
];

/**
 * Remove duplicate year from answer field based on the year field value.
 * 
 * Patterns to fix:
 * 1. "Artist — YEAR, details" -> "Artist — details"
 * 2. "Country – YEAR, event" -> "Country – event"
 * 3. "Name, YEAR – details" -> "Name – details"
 */
function fixYearDuplication(content) {
  const lines = content.split('\n');
  const result = [];
  let changes = 0;
  let inCard = false;
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

    // Detect answer field - more robust matching
    const answerMatch = line.match(/^\s*[",']?answer[",']?\s*:\s*[",'](.+?)[",']+\s*$/);
    if (answerMatch && currentYear && currentYear > 0 && currentYear !== 1900) {
      let answer = answerMatch[1];
      const originalAnswer = answer;
      
      // Pattern 1: "Text — YEAR, more text" -> "Text — more text"
      // Handles various dash types: —, –, -
      const pattern1 = new RegExp(`(.*?)\\s*[—–-]\\s*${currentYear}\\s*,\\s*(.*)`, 'g');
      answer = answer.replace(pattern1, (match, before, after) => `${before} — ${after}`);
      
      // Pattern 2: "Text, YEAR – more text" -> "Text – more text"
      const pattern2 = new RegExp(`(.*?),\\s*${currentYear}\\s*[—–-]\\s*(.*)`, 'g');
      answer = answer.replace(pattern2, (match, before, after) => `${before} – ${after}`);
      
      // Pattern 3: "Text, YEAR " at the end -> "Text"
      const pattern3 = new RegExp(`(.*?),\\s*${currentYear}\\s*$`);
      answer = answer.replace(pattern3, '$1');
      
      if (answer !== originalAnswer) {
        changes++;
        // Reconstruct the line with fixed answer - preserve original quote style
        const indent = line.match(/^\s*/)[0];
        const originalLine = line.trim();
        const quote = originalLine.includes('answer"') ? '"' : "'";
        const answerKey = originalLine.includes('"answer"') || originalLine.includes("'answer'") ? `${quote}answer${quote}` : 'answer';
        const comma = line.trim().endsWith(',') ? ',' : '';
        result.push(`${indent}${answerKey}: ${quote}${answer}${quote}${comma}`);
      } else {
        result.push(line);
      }
      
      currentYear = null; // Reset after processing answer
      continue;
    }

    // Reset year if we hit a new card (id field)
    if (line.match(/^\s*[",']?id[",']?\s*:/)) {
      currentYear = null;
    }

    result.push(line);
  }

  return { content: result.join('\n'), changes };
}

// Main execution
console.log('🔧 Fixing duplicate years in card files...\n');

let totalChanges = 0;

for (const file of FILES_TO_FIX) {
  const filePath = join(process.cwd(), file);
  
  try {
    console.log(`Processing ${file}...`);
    const content = readFileSync(filePath, 'utf8');
    const { content: fixed, changes } = fixYearDuplication(content);
    
    if (changes > 0) {
      writeFileSync(filePath, fixed, 'utf8');
      console.log(`  ✅ Fixed ${changes} duplicate years`);
      totalChanges += changes;
    } else {
      console.log(`  ℹ️  No changes needed`);
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${file}:`, error.message);
  }
}

console.log(`\n✨ Done! Total changes: ${totalChanges}`);
