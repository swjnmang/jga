import { readFileSync } from 'fs';

const content = readFileSync('lib/flagCards.ts', 'utf8');
const match = content.match(/"id": "flag-ci"[\s\S]{1,400}/);

if (match) {
  console.log('Found match:');
  console.log(JSON.stringify(match[0].substring(0, 300)));
} else {
  console.log('No match found');
}

// Also try to find the exact string
const idx = content.indexOf('"id": "flag-ci"');
if (idx !== -1) {
  console.log('\nDirect substring:');
  console.log(JSON.stringify(content.substring(idx, idx + 300)));
}
