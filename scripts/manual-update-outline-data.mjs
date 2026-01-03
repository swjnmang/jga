import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../public/assets/umrisse-daten.csv');
const cardsPath = path.join(__dirname, '../lib/outlineCards.ts');

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
  'Antarktis': 'Antarktis',
  'Argentinien': 'Ärg entinien',
  'Amerikanisch-Samoa': 'Ämerikanisch-Samoa',
  'Australien': 'Äustralien',
  'Aruba': 'Äruba',
  'Aserbaidschan': 'Äserbaidschan',
  'Algerien': 'Älgerien',
  'Südgeorgien...': 'Südgeorgien und die Südlichen Sandwichinseln',
  'SVR Hongkong': 'Hongkong',
  'Heard/McDonaldins.': 'Heard und McDonaldinseln',
  'Ungarn': 'Ungarn',
  'Britisches Terr. Ind. Oz.': 'Britisches Territorium im Indischen Ozean',
  'SVR Macau': 'Macau',
  'Oman': 'Oman',
  'St. Pierre/Miquelon': 'St. Pierre und Miquelon',
  'Spitzbergen/Jan Mayen': 'Spitzbergen und Jan Mayen',
  'Turks/Caicosinseln': 'Turks- und Caicosinseln',
  'Frz. Süd-/Antarktisgeb.': 'Französische Süd- und Antarktistegebiete',
  'Ukraine': 'Ukraine',
  'Uganda': 'Uganda',
  'Uruguay': 'Uruguay',
  'Usbekistan': 'Usbekistan',
  'St. Vincent...': 'St. Vincent und die Grenadinen',
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
    console.log(`⏭️  ${csvName} (nicht in Karten gefunden)`);
  }
});

fs.writeFileSync(cardsPath, cardsContent, 'utf-8');

console.log(`\n✅ Manual outline update complete: ${updated} entries`);
