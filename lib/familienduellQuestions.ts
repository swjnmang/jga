export type FamilienduellCategory = 'alltag' | 'essen' | 'familie';

export type FamilienduellAnswer = {
  text: string;
  points: number;
};

export type FamilienduellQuestion = {
  id: string;
  category: FamilienduellCategory;
  question: string;
  /** Immer 5 Antworten, absteigend nach Punkten sortiert, Summe = 100. */
  answers: FamilienduellAnswer[];
};

export const familienduellCategoryLabels: Record<FamilienduellCategory, string> = {
  alltag: 'Alltag & Allgemeinwissen',
  essen: 'Essen & Trinken',
  familie: 'Familie & Freizeit',
};

export const familienduellQuestions: FamilienduellQuestion[] = [
  // ─── Alltag & Allgemeinwissen ───
  {
    id: 'alltag-1',
    category: 'alltag',
    question: 'Was nimmt man mit an den Strand?',
    answers: [
      { text: 'Sonnencreme', points: 35 },
      { text: 'Handtuch', points: 25 },
      { text: 'Sonnenschirm', points: 15 },
      { text: 'Buch', points: 15 },
      { text: 'Getränke', points: 10 },
    ],
  },
  {
    id: 'alltag-2',
    category: 'alltag',
    question: 'Was macht man als Erstes am Morgen?',
    answers: [
      { text: 'Handy checken', points: 30 },
      { text: 'Duschen', points: 25 },
      { text: 'Kaffee/Frühstück machen', points: 20 },
      { text: 'Wecker ausschalten', points: 15 },
      { text: 'Zähne putzen', points: 10 },
    ],
  },
  {
    id: 'alltag-3',
    category: 'alltag',
    question: 'Welchen Beruf wollten viele Kinder früher werden?',
    answers: [
      { text: 'Feuerwehrmann/-frau', points: 30 },
      { text: 'Arzt/Ärztin', points: 25 },
      { text: 'Astronaut/in', points: 20 },
      { text: 'Fußballprofi', points: 15 },
      { text: 'Polizist/in', points: 10 },
    ],
  },
  {
    id: 'alltag-4',
    category: 'alltag',
    question: 'Was vergisst man am häufigsten, wenn man das Haus verlässt?',
    answers: [
      { text: 'Schlüssel', points: 30 },
      { text: 'Handy', points: 25 },
      { text: 'Portemonnaie', points: 20 },
      { text: 'Sonnenbrille', points: 15 },
      { text: 'Regenschirm', points: 10 },
    ],
  },
  {
    id: 'alltag-5',
    category: 'alltag',
    question: 'Womit verbringen Menschen zu viel Zeit?',
    answers: [
      { text: 'Handy/Social Media', points: 35 },
      { text: 'Fernsehen', points: 25 },
      { text: 'Arbeit', points: 20 },
      { text: 'Serien streamen', points: 12 },
      { text: 'Zocken', points: 8 },
    ],
  },
  {
    id: 'alltag-6',
    category: 'alltag',
    question: 'Was macht man, wenn man nicht einschlafen kann?',
    answers: [
      { text: 'Handy nutzen', points: 30 },
      { text: 'Aufstehen/etwas trinken', points: 20 },
      { text: 'Schäfchen zählen', points: 20 },
      { text: 'Buch lesen', points: 18 },
      { text: 'Musik/Podcast hören', points: 12 },
    ],
  },
  {
    id: 'alltag-7',
    category: 'alltag',
    question: 'Welchen Ort besucht man oft im Urlaub?',
    answers: [
      { text: 'Strand', points: 30 },
      { text: 'Berge', points: 22 },
      { text: 'Stadt/Sightseeing', points: 20 },
      { text: 'See', points: 15 },
      { text: 'Freizeitpark', points: 13 },
    ],
  },
  {
    id: 'alltag-8',
    category: 'alltag',
    question: 'Was tut man an einem verregneten Tag?',
    answers: [
      { text: 'Zuhause bleiben/Netflix', points: 30 },
      { text: 'Lesen', points: 20 },
      { text: 'Spiele spielen', points: 18 },
      { text: 'Schlafen', points: 17 },
      { text: 'Kochen/Backen', points: 15 },
    ],
  },
  {
    id: 'alltag-9',
    category: 'alltag',
    question: 'Wobei verliert man am ehesten die Geduld?',
    answers: [
      { text: 'Im Stau', points: 30 },
      { text: 'Beim Warten in der Schlange/Amt', points: 25 },
      { text: 'Bei langsamem Internet/PC', points: 20 },
      { text: 'Bei Technikproblemen', points: 15 },
      { text: 'Beim Möbelaufbauen', points: 10 },
    ],
  },
  {
    id: 'alltag-10',
    category: 'alltag',
    question: 'Was tut man, um sich zu entspannen?',
    answers: [
      { text: 'Fernsehen/Serien schauen', points: 28 },
      { text: 'Musik hören', points: 22 },
      { text: 'Spazieren gehen', points: 20 },
      { text: 'Baden/Duschen', points: 15 },
      { text: 'Sport machen', points: 15 },
    ],
  },

  // ─── Essen & Trinken ───
  {
    id: 'essen-1',
    category: 'essen',
    question: 'Was gehört auf eine klassische Pizza Margherita?',
    answers: [
      { text: 'Tomatensoße', points: 30 },
      { text: 'Käse/Mozzarella', points: 28 },
      { text: 'Basilikum', points: 22 },
      { text: 'Olivenöl', points: 12 },
      { text: 'Oregano', points: 8 },
    ],
  },
  {
    id: 'essen-2',
    category: 'essen',
    question: 'Was trinkt man morgens am liebsten?',
    answers: [
      { text: 'Kaffee', points: 40 },
      { text: 'Tee', points: 25 },
      { text: 'Orangensaft', points: 15 },
      { text: 'Wasser', points: 12 },
      { text: 'Kakao', points: 8 },
    ],
  },
  {
    id: 'essen-3',
    category: 'essen',
    question: 'Welches Gericht bestellt man oft beim Italiener?',
    answers: [
      { text: 'Pizza', points: 35 },
      { text: 'Pasta/Spaghetti', points: 30 },
      { text: 'Lasagne', points: 15 },
      { text: 'Tiramisu', points: 10 },
      { text: 'Bruschetta', points: 10 },
    ],
  },
  {
    id: 'essen-4',
    category: 'essen',
    question: 'Was isst man klassisch zu Weihnachten?',
    answers: [
      { text: 'Gans/Ente', points: 28 },
      { text: 'Kartoffelsalat mit Würstchen', points: 25 },
      { text: 'Raclette/Fondue', points: 20 },
      { text: 'Plätzchen', points: 15 },
      { text: 'Braten', points: 12 },
    ],
  },
  {
    id: 'essen-5',
    category: 'essen',
    question: 'Welcher Snack darf im Kino nicht fehlen?',
    answers: [
      { text: 'Popcorn', points: 40 },
      { text: 'Nachos', points: 20 },
      { text: 'Cola/Getränk', points: 18 },
      { text: 'Gummibärchen', points: 12 },
      { text: 'Eis', points: 10 },
    ],
  },
  {
    id: 'essen-6',
    category: 'essen',
    question: 'Was legt man klassisch auf ein Butterbrot?',
    answers: [
      { text: 'Marmelade', points: 25 },
      { text: 'Käse', points: 22 },
      { text: 'Wurst/Schinken', points: 22 },
      { text: 'Nutella', points: 20 },
      { text: 'Honig', points: 11 },
    ],
  },
  {
    id: 'essen-7',
    category: 'essen',
    question: 'Welches Gemüse mögen Kinder am wenigsten?',
    answers: [
      { text: 'Rosenkohl', points: 28 },
      { text: 'Spinat', points: 24 },
      { text: 'Brokkoli', points: 20 },
      { text: 'Aubergine', points: 16 },
      { text: 'Rote Bete', points: 12 },
    ],
  },
  {
    id: 'essen-8',
    category: 'essen',
    question: 'Was trinkt man an einem heißen Sommertag?',
    answers: [
      { text: 'Wasser', points: 30 },
      { text: 'Eistee', points: 22 },
      { text: 'Limonade', points: 20 },
      { text: 'Bier', points: 16 },
      { text: 'Cocktail', points: 12 },
    ],
  },
  {
    id: 'essen-9',
    category: 'essen',
    question: 'Womit isst man Pommes am liebsten?',
    answers: [
      { text: 'Ketchup', points: 35 },
      { text: 'Mayonnaise', points: 30 },
      { text: 'Currysauce', points: 18 },
      { text: 'Mayo-Ketchup gemischt', points: 10 },
      { text: 'Ranch/Kräuterdip', points: 7 },
    ],
  },
  {
    id: 'essen-10',
    category: 'essen',
    question: 'Was gehört zu einem klassischen Frühstück?',
    answers: [
      { text: 'Brötchen', points: 28 },
      { text: 'Ei', points: 24 },
      { text: 'Müsli', points: 20 },
      { text: 'Marmelade/Aufstrich', points: 16 },
      { text: 'Kaffee', points: 12 },
    ],
  },

  // ─── Familie & Freizeit ───
  {
    id: 'familie-1',
    category: 'familie',
    question: 'Was macht eine Familie am liebsten am Wochenende?',
    answers: [
      { text: 'Ausflug/Spaziergang', points: 28 },
      { text: 'Ausschlafen', points: 24 },
      { text: 'Zusammen kochen/essen', points: 20 },
      { text: 'Filme schauen', points: 16 },
      { text: 'Sport machen', points: 12 },
    ],
  },
  {
    id: 'familie-2',
    category: 'familie',
    question: 'Welches Spiel spielt man oft auf Familienfeiern?',
    answers: [
      { text: 'Kartenspiele (z.B. Uno)', points: 30 },
      { text: 'Mensch ärgere dich nicht', points: 26 },
      { text: 'Werwolf/Gesellschaftsspiele', points: 18 },
      { text: 'Tabu', points: 14 },
      { text: 'Activity', points: 12 },
    ],
  },
  {
    id: 'familie-3',
    category: 'familie',
    question: 'Wohin geht man gerne mit der Familie im Sommer?',
    answers: [
      { text: 'Schwimmbad', points: 30 },
      { text: 'Freizeitpark', points: 24 },
      { text: 'See/Strand', points: 22 },
      { text: 'Grillen im Garten', points: 14 },
      { text: 'Zoo', points: 10 },
    ],
  },
  {
    id: 'familie-4',
    category: 'familie',
    question: 'Was schenkt man gern zum Geburtstag?',
    answers: [
      { text: 'Geld', points: 28 },
      { text: 'Gutschein', points: 24 },
      { text: 'Buch', points: 16 },
      { text: 'Süßigkeiten/Pralinen', points: 16 },
      { text: 'Blumen', points: 16 },
    ],
  },
  {
    id: 'familie-5',
    category: 'familie',
    question: 'Wobei streiten sich Geschwister am häufigsten?',
    answers: [
      { text: 'Fernbedienung/TV-Programm', points: 28 },
      { text: 'Handy/Tablet', points: 24 },
      { text: 'Wer zuerst duschen darf', points: 20 },
      { text: 'Aufräumen', points: 16 },
      { text: 'Süßigkeiten teilen', points: 12 },
    ],
  },
  {
    id: 'familie-6',
    category: 'familie',
    question: 'Was braucht man für einen gelungenen Familienausflug?',
    answers: [
      { text: 'Gute Laune', points: 24 },
      { text: 'Essen & Getränke', points: 24 },
      { text: 'Auto/Verkehrsmittel', points: 20 },
      { text: 'Sonnencreme', points: 16 },
      { text: 'Spiele/Beschäftigung', points: 16 },
    ],
  },
  {
    id: 'familie-7',
    category: 'familie',
    question: 'Welches Haustier wünschen sich Kinder am meisten?',
    answers: [
      { text: 'Hund', points: 35 },
      { text: 'Katze', points: 28 },
      { text: 'Kaninchen/Hase', points: 15 },
      { text: 'Hamster', points: 12 },
      { text: 'Pferd', points: 10 },
    ],
  },
  {
    id: 'familie-8',
    category: 'familie',
    question: 'Was macht man an einem gemütlichen Abend zuhause?',
    answers: [
      { text: 'Fernsehen/Serie schauen', points: 30 },
      { text: 'Gesellschaftsspiel spielen', points: 22 },
      { text: 'Lesen', points: 18 },
      { text: 'Kochen/Backen', points: 16 },
      { text: 'Kuscheln/Reden', points: 14 },
    ],
  },
  {
    id: 'familie-9',
    category: 'familie',
    question: 'Welche Ausrede nutzen Kinder, um länger aufzubleiben?',
    answers: [
      { text: '"Ich bin noch nicht müde"', points: 28 },
      { text: 'Noch ein Glas Wasser', points: 22 },
      { text: 'Auf die Toilette müssen', points: 20 },
      { text: 'Noch eine Geschichte', points: 18 },
      { text: 'Angst im Dunkeln', points: 12 },
    ],
  },
  {
    id: 'familie-10',
    category: 'familie',
    question: 'Was vergisst man oft beim Packen für den Familienurlaub?',
    answers: [
      { text: 'Ladekabel', points: 26 },
      { text: 'Zahnbürste', points: 22 },
      { text: 'Sonnencreme', points: 20 },
      { text: 'Medikamente', points: 18 },
      { text: 'Lieblingskuscheltier', points: 14 },
    ],
  },
];
