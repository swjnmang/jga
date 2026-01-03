import { readFileSync } from 'fs';

const content = readFileSync('lib/flagCards.ts', 'utf8');
const idx = content.indexOf('Côte d');
const snippet = content.substring(idx-10, idx+30);

console.log('Snippet:', snippet);
console.log('\nChar codes:');
for (let i = 0; i < snippet.length; i++) {
  console.log(`${i}: '${snippet[i]}' = ${snippet.charCodeAt(i)}`);
}
