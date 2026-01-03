import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV file path
const csvPath = path.join(__dirname, '../public/assets/flaggen-daten.csv');
const cardsPath = path.join(__dirname, '../lib/flagCards.ts');

// Read CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').slice(1);

const csvCountries = new Map();
lines.forEach(line => {
  if (!line.trim()) return;
  const parts = line.split(',');
  if (parts.length >= 4) {
    const country = parts[0].trim();
    csvCountries.set(country, true);
  }
});

// Read cards file
const cardsContent = fs.readFileSync(cardsPath, 'utf-8');

// Extract all country names from answers
const foundCountries = new Set();
const answerMatches = cardsContent.match(/"answer": "[^"]*"/g) || [];
answerMatches.forEach(match => {
  const answer = match.replace('"answer": "', '').replace('"', '');
  // Extract country name (before the –)
  const countryMatch = answer.match(/^(.+?)\s*–/);
  if (countryMatch) {
    foundCountries.add(countryMatch[1].trim());
  }
});

// Find missing countries
const missingCountries = [];
csvCountries.forEach((_, country) => {
  if (!foundCountries.has(country)) {
    missingCountries.push(country);
  }
});

console.log(`\nLänder aus CSV NICHT gefunden in flagCards.ts (${missingCountries.length}):`);
missingCountries.forEach(c => console.log(`  - ${c}`));

// Try to find close matches
console.log(`\n\nMögliche Schreibweisen-Abweichungen:`);
missingCountries.forEach(csvCountry => {
  // Look for partial matches
  const similar = Array.from(foundCountries).filter(cardCountry => 
    csvCountry.toLowerCase().includes(cardCountry.toLowerCase().substring(0, 4)) ||
    cardCountry.toLowerCase().includes(csvCountry.toLowerCase().substring(0, 4))
  );
  
  if (similar.length > 0) {
    console.log(`\n  CSV: "${csvCountry}"`);
    console.log(`  Ähnlich: ${similar.join(', ')}`);
  }
});
