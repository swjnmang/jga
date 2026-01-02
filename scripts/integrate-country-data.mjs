import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read CSV file
const csvPath = path.join(__dirname, '../public/assets/liste laender.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n').slice(1); // Skip header
const countryData = {};

lines.forEach(line => {
  if (!line.trim()) return;
  
  const [year, country, event] = line.split(',').map(s => s.trim());
  if (year && country) {
    countryData[country] = {
      year: parseInt(year),
      event: event.replace(/^"|"$/g, '') // Remove surrounding quotes
    };
  }
});

// Update card files
const cardFiles = [
  '../lib/flagCards.ts',
  '../lib/outlineCards.ts'
];

cardFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  let updateCount = 0;
  
  // Find all country cards and update answers
  Object.entries(countryData).forEach(([country, data]) => {
    // Match pattern: "answer": "CountryName – ..."
    const pattern = new RegExp(
      `"answer":\\s*"${country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*–\\s*([^"]+)"`,
      'g'
    );
    
    const newAnswer = `"answer": "${country} – ${data.year}, ${data.event}"`;
    
    if (pattern.test(content)) {
      content = content.replace(pattern, newAnswer);
      updateCount++;
    }
  });
  
  if (updateCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated ${updateCount} entries in ${file}`);
  } else {
    console.log(`⏭️  No updates needed in ${file}`);
  }
});

console.log('\n✅ Country data integration complete');
