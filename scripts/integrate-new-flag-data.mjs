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
const lines = csvContent.split('\n').slice(1); // Skip header

// Parse CSV into map: countryName -> { year, background }
const dataMap = new Map();
lines.forEach(line => {
  if (!line.trim()) return;
  
  // Simple CSV parsing
  const parts = line.split(',');
  if (parts.length >= 4) {
    const country = parts[0].trim();
    const year = parts[2].trim();
    const background = parts.slice(3).join(',').trim();
    
    dataMap.set(country, { year, background });
  }
});

console.log(`✓ CSV gelesen: ${dataMap.size} Länder gefunden`);

// Read cards file
let cardsContent = fs.readFileSync(cardsPath, 'utf-8');

// Find and replace card answers
let updatedCount = 0;

dataMap.forEach((data, country) => {
  // Build new answer string
  const newAnswer = `${country} – ${data.year}, ${data.background}`;
  
  // Create regex to find any existing answer for this country
  // Pattern: "answer": "CountryName – [anything]"
  const countryEscaped = country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const answerPattern = new RegExp(
    `"answer": "[^"]*${countryEscaped}[^"]*"`,
    'g'
  );
  
  const matches = cardsContent.match(answerPattern);
  
  if (matches) {
    // Replace all matches for this country
    cardsContent = cardsContent.replace(
      answerPattern,
      `"answer": "${newAnswer.replace(/"/g, '\\"')}"` // Escape quotes
    );
    updatedCount++;
  }
});

// Write updated content
fs.writeFileSync(cardsPath, cardsContent, 'utf-8');

console.log(`✅ Updated ${updatedCount} Länder in flagCards.ts`);
if (updatedCount === dataMap.size) {
  console.log(`✓ Alle ${dataMap.size} Flaggen-Einträge erfolgreich integriert`);
} else {
  console.log(`⚠️  Nur ${updatedCount} von ${dataMap.size} Einträgen gefunden`);
}
