import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const flagPath = path.join(__dirname, '../lib/flagCards.ts');
const outlinePath = path.join(__dirname, '../lib/outlineCards.ts');

const flagContent = fs.readFileSync(flagPath, 'utf-8');
const outlineContent = fs.readFileSync(outlinePath, 'utf-8');

// Count entries without years
function countMissingYears(content) {
  const answers = content.match(/"answer": "[^"]+"/g) || [];
  return answers.filter(answer => {
    const text = answer.replace(/"answer": "/, '').replace(/"$/, '');
    return !text.match(/\b\d{4}\b/);
  }).length;
}

const flagMissing = countMissingYears(flagContent);
const outlineMissing = countMissingYears(outlineContent);
const totalMissing = flagMissing + outlineMissing;

console.log(`
📊 INTEGRATION STATUS
====================
Flaggen ohne Jahr:    ${flagMissing}
Umrisse ohne Jahr:    ${outlineMissing}
──────────────────
Gesamt fehlend:       ${totalMissing}

✅ Integration Progress:
   - Flaggen: ${125 - flagMissing} von 125 aktualisiert
   - Umrisse: ${118 - outlineMissing} von 118 aktualisiert
   - TOTAL:   ${243 - totalMissing} von 243 aktualisiert
`);
