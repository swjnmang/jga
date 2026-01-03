import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check card files
const cardFiles = [
  { path: '../lib/flagCards.ts', type: 'Flaggen' },
  { path: '../lib/outlineCards.ts', type: 'Umrisse' }
];

const missingYears = {};

cardFiles.forEach(file => {
  const filePath = path.join(__dirname, file.path);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Split by card objects
  const cardMatches = content.match(/\{[\s\S]*?"category":\s*"country"[\s\S]*?\},/g) || [];
  
  const missingList = [];
  
  cardMatches.forEach(cardBlock => {
    // Extract title
    const titleMatch = cardBlock.match(/"title":\s*"(?:Flagge|Umriss)\s+([^"]+)"/);
    // Extract answer
    const answerMatch = cardBlock.match(/"answer":\s*"([^"]+)"/);
    
    if (titleMatch && answerMatch) {
      const title = titleMatch[1];
      const answer = answerMatch[1];
      
      // Check if answer contains a 4-digit year (YYYY)
      const yearMatch = answer.match(/\b\d{4}\b/);
      
      if (!yearMatch) {
        missingList.push({
          title,
          answer
        });
      }
    }
  });
  
  if (missingList.length > 0) {
    missingYears[file.type] = missingList;
  }
});

// Output results
console.log('\n' + '='.repeat(100));
console.log('FLAGGEN/UMRISSE OHNE KONKRETE JAHRESZAHL\n');

let totalMissing = 0;

Object.entries(missingYears).forEach(([type, list]) => {
  console.log(`\n${type} (${list.length} ohne Jahreszahl):`);
  console.log('-'.repeat(100));
  
  list.forEach((item, idx) => {
    console.log(`${String(idx + 1).padStart(3)}. ${item.title}`);
    console.log(`     Antwort: "${item.answer}"`);
  });
  
  totalMissing += list.length;
});

console.log('\n' + '='.repeat(100));
console.log(`\n✓ GESAMT: ${totalMissing} Einträge ohne konkrete Jahreszahl\n`);

// Export to CSV for easier editing
if (totalMissing > 0) {
  const csvContent = ['Title,Type,Current Answer'];
  
  Object.entries(missingYears).forEach(([type, list]) => {
    list.forEach(item => {
      const escapedAnswer = `"${item.answer.replace(/"/g, '""')}"`;
      csvContent.push(`"${item.title}",${type},${escapedAnswer}`);
    });
  });
  
  const csvPath = path.join(__dirname, '../missing-years.csv');
  fs.writeFileSync(csvPath, csvContent.join('\n'), 'utf-8');
  console.log(`📄 CSV-Datei erstellt: missing-years.csv\n`);
}
