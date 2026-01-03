#!/usr/bin/env node
/**
 * Third pass: Fix final remaining standalone year duplications.
 * This handles cases where year appears alone, usually at the end or with corrupted dash.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILES_TO_FIX = ['lib/cards.ts'];

function fixFinalYears(content) {
  const lines = content.split('\n');
  const result = [];
  let changes = 0;
  let currentYear = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const yearMatch = line.match(/^\s*[",']?year[",']?\s*:\s*(\d+),?\s*$/);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1]);
      result.push(line);
      continue;
    }

    const answerMatch = line.match(/^\s*([",']?)answer\1\s*:\s*([",'])(.+?)\2,?\s*$/);
    if (answerMatch && currentYear && currentYear > 0) {
      const quote = answerMatch[2];
      let answer = answerMatch[3];
      const originalAnswer = answer;
      
      // Skip dates with full date info like "31.08.2015" or "20.07.1969"
      const hasFullDate = answer.match(/\d{2}\.\d{2}\.\d{4}/);
      
      if (!hasFullDate) {
        // Pattern: "Text [corrupted dash/quote] YEAR." -> "Text."
        const pattern1 = new RegExp(`\\s*[",„"\\-—–]\\s*${currentYear}\\.?\\s*$`);
        answer = answer.replace(pattern1, '.');
        
        // Pattern: "Text, YEAR [dash]" -> "Text —"
        const pattern2 = new RegExp(`,\\s*${currentYear}\\s*[„—–\\-]`, 'g');
        answer = answer.replace(pattern2, ' —');
      }
      
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

    if (line.match(/^\s*[",']?id[",']?\s*:/)) {
      currentYear = null;
    }

    result.push(line);
  }

  return { content: result.join('\n'), changes };
}

console.log('🔧 Third pass: Fixing final standalone years...\n');

let totalChanges = 0;

for (const file of FILES_TO_FIX) {
  const filePath = join(process.cwd(), file);
  
  try {
    console.log(`Processing ${file}...`);
    const content = readFileSync(filePath, 'utf8');
    const { content: fixed, changes } = fixFinalYears(content);
    
    if (changes > 0) {
      writeFileSync(filePath, fixed, 'utf8');
      console.log(`  ✅ Fixed ${changes} final years`);
      totalChanges += changes;
    } else {
      console.log(`  ℹ️  No changes needed`);
    }
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
  }
}

console.log(`\n✨ Done! Total changes: ${totalChanges}`);
