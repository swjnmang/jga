#!/usr/bin/env node
/**
 * Fix quote cards:
 * 1. Remove duplicate years from answers
 * 2. Replace special characters with ae, oe, ue, ss
 * 3. Update cue text for all quote cards
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILE = 'lib/cards.ts';

function fixQuoteCards(content) {
  const lines = content.split('\n');
  const result = [];
  let changes = 0;
  let inQuoteCard = false;
  let currentYear = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Detect if we're in a quote card
    if (line.match(/category:\s*'quote'/)) {
      inQuoteCard = true;
    }
    
    // Reset when we hit a new card
    if (line.match(/^\s*id:\s*'/) && !line.includes('quote')) {
      inQuoteCard = false;
      currentYear = null;
    }
    
    // Capture year in quote cards
    const yearMatch = line.match(/^\s*year:\s*(\d+),?\s*$/);
    if (yearMatch && inQuoteCard) {
      currentYear = parseInt(yearMatch[1]);
    }
    
    // Fix cue for quote cards
    if (inQuoteCard && line.match(/cue:\s*'Woher und aus welchem Jahr stammt das nachfolgende Zitat\?'/)) {
      line = line.replace(
        /cue:\s*'Woher und aus welchem Jahr stammt das nachfolgende Zitat\?'/,
        "cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?'"
      );
      changes++;
    }
    
    // Fix answer in quote cards
    const answerMatch = line.match(/^(\s*answer:\s*')(.+?)(',?\s*)$/);
    if (answerMatch && inQuoteCard && currentYear) {
      let answer = answerMatch[2];
      const originalAnswer = answer;
      
      // Remove duplicate year patterns
      // Pattern 1: "Name, YEAR \"quote\"" -> "Name \"quote\""
      const yearPattern1 = new RegExp(`,\\s*${currentYear}\\s+"`);
      answer = answer.replace(yearPattern1, ' "');
      
      // Pattern 2: "text YEAR." at end or "text, YEAR." -> "text."
      const yearPattern2 = new RegExp(`[,\\s]+${currentYear}\\.`);
      answer = answer.replace(yearPattern2, '.');
      
      // Pattern 3: "Rede YEAR" or similar -> "Rede"
      const yearPattern3 = new RegExp(`\\b${currentYear}\\b`);
      answer = answer.replace(yearPattern3, '');
      
      // Clean up any double spaces or commas
      answer = answer.replace(/\s{2,}/g, ' ').replace(/,\s*,/g, ',').replace(/\s+\./g, '.');
      
      // Replace special characters
      answer = answer
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/Ä/g, 'Ae')
        .replace(/Ö/g, 'Oe')
        .replace(/Ü/g, 'Ue')
        .replace(/ß/g, 'ss')
        // Fix already broken characters
        .replace(/\b([A-Z])"([a-z])/g, '$1oe$2')  // M"ller -> Moeller
        .replace(/([a-z])"([a-z])/g, '$1ue$2')    // m"ssen -> muessen
        .replace(/Fl"chtling/g, 'Fluechtling')
        .replace(/Vers"hnung/g, 'Versoehnung')
        .replace(/S"dafrika/g, 'Suedafrika')
        .replace(/Bürgerrechte/g, 'Buergerrechte')
        .replace(/möge/gi, 'moege')
        .replace(/Möge/g, 'Moege')
        .replace(/für/g, 'fuer')
        .replace(/über/g, 'ueber')
        .replace(/Unm"glich/g, 'Unmoeglich')
        .replace(/während/g, 'waehrend')
        .replace(/Grüße/g, 'Gruesse')
        .replace(/größte/g, 'groesste')
        .replace(/spöttischer/g, 'spoettischer')
        .replace(/legendären/g, 'legendaeren')
        .replace(/Ermüdung/g, 'Ermuedung')
        .replace(/Prueidentschaft/g, 'Praesidentschaft');
      
      if (answer !== originalAnswer) {
        line = `${answerMatch[1]}${answer}${answerMatch[3]}`;
        changes++;
      }
    }
    
    // Also fix hint and sources text fields
    if (inQuoteCard) {
      if (line.includes('hint:') || line.includes('text:') || line.includes('textDe:')) {
        const original = line;
        line = line
          .replace(/ä/g, 'ae')
          .replace(/ö/g, 'oe')
          .replace(/ü/g, 'ue')
          .replace(/Ä/g, 'Ae')
          .replace(/Ö/g, 'Oe')
          .replace(/Ü/g, 'Ue')
          .replace(/ß/g, 'ss')
          .replace(/\b([A-Z])"([a-z])/g, '$1oe$2')
          .replace(/([a-z])"([a-z])/g, '$1ue$2')
          .replace(/Fl"chtling/g, 'Fluechtling')
          .replace(/S"dafrika/g, 'Suedafrika')
          .replace(/Vers"hnung/g, 'Versoehnung')
          .replace(/Bürgerrechte/g, 'Buergerrechte')
          .replace(/für/g, 'fuer')
          .replace(/über/g, 'ueber')
          .replace(/Möge/g, 'Moege')
          .replace(/möge/gi, 'moege')
          .replace(/unm"glich/gi, 'unmoeglich')
          .replace(/während/g, 'waehrend')
          .replace(/Grüße/g, 'Gruesse')
          .replace(/größte/g, 'groesste')
          .replace(/legendären/g, 'legendaeren')
          .replace(/spöttisch/g, 'spoettisch')
          .replace(/Prueidentschaft/g, 'Praesidentschaft');
        
        if (line !== original) {
          changes++;
        }
      }
    }
    
    result.push(line);
  }

  return { content: result.join('\n'), changes };
}

console.log('🔧 Fixing quote cards...\n');

const filePath = join(process.cwd(), FILE);

try {
  console.log(`Processing ${FILE}...`);
  const content = readFileSync(filePath, 'utf8');
  const { content: fixed, changes } = fixQuoteCards(content);
  
  if (changes > 0) {
    writeFileSync(filePath, fixed, 'utf8');
    console.log(`  ✅ Fixed ${changes} issues in quote cards`);
  } else {
    console.log(`  ℹ️  No changes needed`);
  }
} catch (error) {
  console.error(`  ❌ Error:`, error.message);
}

console.log('\n✨ Done!');
