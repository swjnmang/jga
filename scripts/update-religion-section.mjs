#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const triviaFile = path.join(root, 'lib', 'triviaExtraCards.ts');
const religionFile = path.join(root, 'temp-religion.json');

// Read files
const triviaContent = fs.readFileSync(triviaFile, 'utf-8');
const religionQuestions = JSON.parse(fs.readFileSync(religionFile, 'utf-8'));

// Find the Religion section boundaries
const lines = triviaContent.split('\n');
const religionStartIndex = lines.findIndex(line => line.includes('// Religion & Glaube'));
const religionEndIndex = lines.findIndex((line, idx) => idx > religionStartIndex && line.includes('// Geographie'));

if (religionStartIndex === -1 || religionEndIndex === -1) {
  console.error('Could not find Religion section boundaries');
  process.exit(1);
}

// Generate the new religion section
const religionLines = [
  `  // Religion & Glaube (250)`,
  ...religionQuestions.map(q => 
    `  ${JSON.stringify(q, null, 0).replace(/"([^"]+)":/g, '$1:')},`
  )
];

// Reconstruct the file
const newLines = [
  ...lines.slice(0, religionStartIndex),
  ...religionLines,
  '',
  ...lines.slice(religionEndIndex)
];

fs.writeFileSync(triviaFile, newLines.join('\n'));
console.log(`Updated Religion & Glaube section with ${religionQuestions.length} questions`);
