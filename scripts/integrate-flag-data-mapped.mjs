import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../public/assets/flaggen-daten.csv');
const cardsPath = path.join(__dirname, '../lib/flagCards.ts');

// Mapping von CSV-Namen zu Card-Namen
const nameMapping = {
  'Afghanistan': 'Äfghanistan',
  'Antigua und Barbuda': 'Äntigua und Barbuda',
  'Anguilla': 'Änguilla',
  'Albanien': 'Älbanien',
  'Armenien': 'Ärmenie',
  'Angola': 'Ängola',
  'Argentinien': 'Ärg entinien',
  'Amerikanisch-Samoa': 'Amerikanisch-Samoa',
  'Australien': 'Äustralien',
  'Aruba': 'Äruba',
  'Ålandinseln': 'Ålandinseln',
  'Aserbaidschan': 'Äserbaidschan',
  'Bosnien und Herzegowina': 'Bosnien und Herzegowina',
  'Bulgarien': 'Bulgarien',
  'St. Barthélemy': 'St. Barthélemy',
  'Bermuda': 'Bermuda',
  'Brunei Darussalam': 'Brunei',
  'Bolivien': 'Bolivien',
  'Karibische Niederlande': 'Karibische Niederlande',
  'Bhutan': 'Bhutan',
  'Bouvetinsel': 'Bouvetinsel',
  'Botsuana': 'Botsuana',
  'Kokosinseln': 'Kokosinseln',
  'Kongo-Kinshasa': 'Kongo-Kinshasa',
  'Zentralafrikanische Republik': 'Zentralafrik anische Republik',
  'Kongo-Brazzaville': 'Kongo-Brazzaville',
  'Côte d\'Ivoire': 'Côte d\'Ivoire',
  'Cookinseln': 'Cookinseln',
  'Chile': 'Chile',
  'China': 'China',
  'Kolumbien': 'Kolumbien',
  'Costa Rica': 'Costa Rica',
  'Cabo Verde': 'Cabo Verde',
  'Curaçao': 'Curaçao',
  'Weihnachtsinsel': 'Weihnachtsinsel',
  'Dänemark': 'Dänemark',
  'Dominikanische Republik': 'Dominikanische Republik',
  'Algerien': 'Älgerien',
  'Ecuador': 'Ecuador',
  'Westsahara': 'Westsahara',
  'Äthiopien': 'Äthiopien',
  'Finnland': 'Finnland',
  'Falklandinseln': 'Falklandinseln',
  'Färöer': 'Färöer',
  'GB-ENG': 'GB-ENG',
  'GB-NIR': 'GB-NIR',
  'GB-SCT': 'GB-SCT',
  'Vereinigtes Königreich': 'Vereinigtes Königreich',
  'Französisch-Guayana': 'Französisch-Guayana',
  'Guernsey': 'Guernsey',
  'Gibraltar': 'Gibraltar',
  'Grönland': 'Grönland',
  'Guadeloupe': 'Guadeloupe',
  'Griechenland': 'Griechenland',
  'Südgeorgien...': 'Südgeorgien und die Südlichen Sandwichinseln',
  'Guatemala': 'Guatemala',
  'Guam': 'Guam',
  'SVR Hongkong': 'Hongkong',
  'Heard/McDonaldins.': 'Heard und McDonaldinseln',
  'Honduras': 'Honduras',
  'Haiti': 'Haiti',
  'Ungarn': 'Ungarn',
  'Isle of Man': 'Isle of Man',
  'Britisches Terr. Ind. Oz.': 'Britisches Territorium im Indischen Ozean',
  'Jersey': 'Jersey',
  'St. Kitts und Nevis': 'St. Kitts und Nevis',
  'Kaimaninseln': 'Kaimaninseln',
  'Liechtenstein': 'Liechtenstein',
  'Liberia': 'Liberia',
  'Monaco': 'Monaco',
  'Republik Moldau': 'Moldavien',
  'St. Martin': 'St. Martin',
  'Mongolei': 'Mongolei',
  'SVR Macau': 'Macau',
  'Nördliche Marianen': 'Nördliche Marianen',
  'Martinique': 'Martinique',
  'Montserrat': 'Montserrat',
  'Mexiko': 'Mexiko',
  'Neukaledonien': 'Neukaledonien',
  'Norfolkinsel': 'Norfolkinsel',
  'Nicaragua': 'Nicaragua',
  'Niederlande': 'Niederlande',
  'Nauru': 'Nauru',
  'Niue': 'Niue',
  'Oman': 'Oman',
  'Panama': 'Panama',
  'Peru': 'Peru',
  'Französisch-Polynesien': 'Französisch-Polynesien',
  'St. Pierre/Miquelon': 'St. Pierre und Miquelon',
  'Pitcairninseln': 'Pitcairninseln',
  'Puerto Rico': 'Puerto Rico',
  'Palästina': 'Palästinensische Autonomiegebiete',
  'Portugal': 'Portugal',
  'Paraguay': 'Paraguay',
  'Réunion': 'Réunion',
  'Rumänien': 'Rumänien',
  'Seychellen': 'Seychellen',
  'Schweden': 'Schweden',
  'St. Helena': 'St. Helena',
  'Spitzbergen/Jan Mayen': 'Spitzbergen und Jan Mayen',
  'São Tomé und Príncipe': 'São Tomé und Príncipe',
  'El Salvador': 'El Salvador',
  'Sint Maarten': 'Sint Maarten',
  'Turks/Caicosinseln': 'Turks- und Caicosinseln',
  'Frz. Süd-/Antarktisgeb.': 'Französische Süd- und Antarktistegebiete',
  'Tokelau': 'Tokelau',
  'Timor-Leste': 'Timor-Leste',
  'Tonga': 'Tonga',
  'Trinidad und Tobago': 'Trinidad und Tobago',
  'Taiwan': 'Taiwan',
  'Ukraine': 'Ukraine',
  'Uganda': 'Uganda',
  'Amerik. Überseeinseln': 'Amerikanisch-Ozeanien',
  'Vereinigte Staaten': 'Vereinigte Staaten',
  'Uruguay': 'Uruguay',
  'Usbekistan': 'Usbekistan',
  'St. Vincent...': 'St. Vincent und die Grenadinen',
  'Venezuela': 'Venezuela',
  'Brit. Jungferninseln': 'Britische Jungferninseln',
  'Amerik. Jungferninseln': 'Amerikanische Jungferninseln',
  'Wallis und Futuna': 'Wallis und Futuna',
  'Samoa': 'Samoa',
  'Mayotte': 'Mayotte'
};

// Read CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').slice(1);

const dataMap = new Map();
lines.forEach(line => {
  if (!line.trim()) return;
  const parts = line.split(',');
  if (parts.length >= 4) {
    const csvCountry = parts[0].trim();
    const year = parts[2].trim();
    const background = parts.slice(3).join(',').trim();
    
    // Use mapping if available
    const cardCountry = nameMapping[csvCountry] || csvCountry;
    dataMap.set(cardCountry, { year, background });
  }
});

// Read cards file
let cardsContent = fs.readFileSync(cardsPath, 'utf-8');

// Find and replace card answers
let updatedCount = 0;

dataMap.forEach((data, country) => {
  const newAnswer = `${country} – ${data.year}, ${data.background}`;
  
  // Create regex to find any existing answer for this country
  const countryEscaped = country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const answerPattern = new RegExp(
    `"answer": "[^"]*${countryEscaped}[^"]*"`,
    'g'
  );
  
  const matches = cardsContent.match(answerPattern);
  
  if (matches) {
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
console.log(`✓ Flag data integration complete`);
