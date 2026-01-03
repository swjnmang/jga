import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../public/assets/flaggen-daten.csv');
const cardsPath = path.join(__dirname, '../lib/flagCards.ts');

// Read CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const csvLines = csvContent.split('\n').slice(1);

const csvData = new Map();
csvLines.forEach(line => {
  if (!line.trim()) return;
  const parts = line.split(',');
  if (parts.length >= 4) {
    const csvCountry = parts[0].trim();
    const year = parts[2].trim();
    const background = parts.slice(3).join(',').trim();
    csvData.set(csvCountry, { year, background });
  }
});

// Read cards
const cardsContent = fs.readFileSync(cardsPath, 'utf-8');

// Extract card country names from answer fields
const cardCountries = new Map();
const answerMatches = cardsContent.match(/"answer": "[^"]+"/g) || [];
answerMatches.forEach(match => {
  const answer = match.replace(/"answer": "/, '').replace(/"$/, '');
  const countryMatch = answer.match(/^(.+?)\s*–/);
  if (countryMatch) {
    const cardCountry = countryMatch[1].trim();
    cardCountries.set(cardCountry, true);
  }
});

console.log(`Card countries: ${cardCountries.size}`);
console.log(`CSV countries: ${csvData.size}`);

// Try fuzzy matching for countries not found
function normalize(str) {
  return str.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/à|á|â|ã/g, 'a').replace(/è|é|ê|ë/g, 'e').replace(/ì|í|î|ï/g, 'i')
    .replace(/ò|ó|ô|õ/g, 'o').replace(/ù|ú|û/g, 'u')
    .replace(/[^a-z0-9]/g, '');
}

const mapping = new Map();
csvData.forEach((data, csvName) => {
  const normalizedCsv = normalize(csvName);
  
  // Look for exact match first
  if (cardCountries.has(csvName)) {
    mapping.set(csvName, csvName);
    return;
  }
  
  // Look for normalized match
  let found = false;
  for (const cardName of cardCountries.keys()) {
    if (normalize(cardName) === normalizedCsv) {
      mapping.set(csvName, cardName);
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.log(`❌ NO MATCH for: ${csvName}`);
  }
});

console.log(`\nMatches found: ${mapping.size}/${csvData.size}`);

// Now update cards with mapping
let updatedCount = 0;
let cardsContentUpdated = cardsContent;

mapping.forEach((cardName, csvName) => {
  const data = csvData.get(csvName);
  const newAnswer = `${cardName} – ${data.year}, ${data.background}`;
  
  // Find and replace answer for this card
  const countryEscaped = cardName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const answerPattern = new RegExp(
    `"answer": "[^"]*${countryEscaped}[^"]*"`,
    'g'
  );
  
  const oldAnswer = cardsContentUpdated.match(answerPattern);
  if (oldAnswer) {
    cardsContentUpdated = cardsContentUpdated.replace(
      answerPattern,
      `"answer": "${newAnswer.replace(/"/g, '\\"')}"` // Escape quotes
    );
    updatedCount++;
  }
});

// Write updated file
fs.writeFileSync(cardsPath, cardsContentUpdated, 'utf-8');

console.log(`✅ Updated ${updatedCount} entries`);
console.log(`✓ Complete!`);
