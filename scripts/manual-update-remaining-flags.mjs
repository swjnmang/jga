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

// Manual mapping for countries with tricky names
const manualMapping = {
  'Afghanistan': 'Äfghanistan',
  'Antigua und Barbuda': 'Äntigua und Barbuda',
  'Anguilla': 'Änguilla',
  'Albanien': 'Älbanien',
  'Armenien': 'Ärmenie',
  'Angola': 'Ängola',
  'Argentinien': 'Ärg entinien',
  'Amerikanisch-Samoa': 'Ämerikanisch-Samoa',
  'Australien': 'Äustralien',
  'Aruba': 'Äruba',
  'Ålandinseln': 'Ålandinseln',
  'Aserbaidschan': 'Äserbaidschan',
  'St. Barthélemy': 'St. Barthélemy',
  'Karibische Niederlande': 'Karibische Niederlande',
  'Algerien': 'Älgerien',
  'Südgeorgien...': 'Südgeorgien und die Südlichen Sandwichinseln',
  'SVR Hongkong': 'Hongkong',
  'Ungarn': 'Ungarn',
  'St. Martin': 'St. Martin',
  'SVR Macau': 'Macau',
  'Oman': 'Oman',
  'Frz. Süd-/Antarktisgeb.': 'Französische Süd- und Antarktistegebiete',
  'Ukraine': 'Ukraine',
  'Uganda': 'Uganda',
  'Amerik. Überseeinseln': 'Amerikanisch-Ozeanien',
  'Uruguay': 'Uruguay',
  'Usbekistan': 'Usbekistan',
  'Brit. Jungferninseln': 'Britische Jungferninseln',
  'Amerik. Jungferninseln': 'Amerikanische Jungferninseln'
};

// Read cards
let cardsContent = fs.readFileSync(cardsPath, 'utf-8');

// Update with manual mapping
let updated = 0;
let skipped = 0;

Object.entries(manualMapping).forEach(([csvName, cardName]) => {
  const data = csvData.get(csvName);
  if (!data) {
    console.log(`⚠️  CSV-Daten nicht gefunden für: ${csvName}`);
    return;
  }
  
  const newAnswer = `${cardName} – ${data.year}, ${data.background}`;
  
  // Find and replace
  const cardNameEscaped = cardName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `"answer": "[^"]*${cardNameEscaped}[^"]*"`,
    'g'
  );
  
  const match = cardsContent.match(pattern);
  if (match) {
    cardsContent = cardsContent.replace(
      pattern,
      `"answer": "${newAnswer.replace(/"/g, '\\"')}"` // Escape quotes
    );
    updated++;
    console.log(`✅ ${csvName}`);
  } else {
    skipped++;
    console.log(`⏭️  ${csvName} (nicht in Karten gefunden oder bereits aktualisiert)`);
  }
});

fs.writeFileSync(cardsPath, cardsContent, 'utf-8');

console.log(`\n✅ Manual update complete: ${updated} entries`);
