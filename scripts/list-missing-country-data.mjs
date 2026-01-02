import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read CSV file to get all countries
const csvPath = path.join(__dirname, '../public/assets/liste laender.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const csvCountries = new Set();

csvContent.split('\n').slice(1).forEach(line => {
  if (!line.trim()) return;
  const [year, country] = line.split(',').map(s => s.trim());
  if (year && country) {
    csvCountries.add(country);
  }
});

console.log(`CSV enthält ${csvCountries.size} Länder\n`);

// Check card files
const cardFiles = [
  { path: '../lib/flagCards.ts', type: 'Flaggen' },
  { path: '../lib/outlineCards.ts', type: 'Umrisse' }
];

const missingData = {};

cardFiles.forEach(file => {
  const filePath = path.join(__dirname, file.path);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract all country cards
  const cardRegex = /"title":\s*"(?:Flagge|Umriss)\s+([^"]+)"/g;
  const answerRegex = /"answer":\s*"([^"]+)"/g;
  
  const titles = [...content.matchAll(cardRegex)];
  const answers = [...content.matchAll(answerRegex)];
  
  const missingList = [];
  
  titles.forEach((titleMatch, idx) => {
    if (idx >= answers.length) return;
    
    const country = titleMatch[1];
    const answer = answers[idx][1];
    
    // Check if answer contains year and event (should have at least one comma after country name)
    // Format should be like: "CountryName – YYYY, Event"
    if (!answer.includes(' – ')) {
      missingList.push({
        country,
        currentAnswer: answer,
        inCSV: csvCountries.has(country)
      });
    }
  });
  
  if (missingList.length > 0) {
    missingData[file.type] = missingList;
  }
});

// Output results
console.log('='.repeat(80));
console.log('LÄNDER OHNE JAHR UND EREIGNIS\n');

if (Object.keys(missingData).length === 0) {
  console.log('✅ Alle Länder haben Jahr und Ereignis! Keine fehlenden Daten.\n');
} else {
  Object.entries(missingData).forEach(([type, list]) => {
    console.log(`\n${type} (${list.length} ohne Daten):`);
    console.log('-'.repeat(80));
    
    list.forEach(item => {
      const csvStatus = item.inCSV ? '✓ In CSV' : '✗ Nicht in CSV';
      console.log(`  • ${item.country}`);
      console.log(`    Aktuelle Antwort: "${item.currentAnswer}"`);
      console.log(`    ${csvStatus}\n`);
    });
  });
}

console.log('='.repeat(80));
