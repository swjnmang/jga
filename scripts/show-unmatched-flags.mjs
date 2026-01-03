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

// Extract card country names from answer fields - get the CURRENT ones to see what wasn't updated
const updatedCountries = new Set();
const answerMatches = cardsContent.match(/"answer": "[^"]+"/g) || [];
answerMatches.forEach(match => {
  const answer = match.replace(/"answer": "/, '').replace(/"$/, '');
  const countryMatch = answer.match(/^(.+?)\s*–\s*\d{4}/);
  if (countryMatch) {
    const cardCountry = countryMatch[1].trim();
    updatedCountries.add(cardCountry);
  }
});

console.log(`\n📊 INTEGRATION REPORT`);
console.log(`======================`);
console.log(`CSV Länder: ${csvData.size}`);
console.log(`Aktualisierte Kartenlande: ${updatedCountries.size}`);
console.log(`Noch nicht aktualisiert: ${csvData.size - updatedCountries.size}`);

console.log(`\n❌ NICHT AKTUALISIERT:`);
const remaining = [];
csvData.forEach((data, csvCountry) => {
  // Check if this country was updated
  let found = false;
  updatedCountries.forEach(cardCountry => {
    if (cardCountry.toLowerCase().includes(csvCountry.toLowerCase().substring(0, 5))) {
      found = true;
    }
  });
  
  if (!found) {
    remaining.push(csvCountry);
    console.log(`\n  ${csvCountry}`);
    console.log(`  Jahr: ${data.year}`);
    console.log(`  Grund: ${data.background}`);
  }
});
