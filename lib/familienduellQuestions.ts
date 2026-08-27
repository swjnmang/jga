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

  // ─── Alltag & Allgemeinwissen (Teil 2) ───
  {
    id: 'alltag-11',
    category: 'alltag',
    question: 'Womit vertreibt man sich die Zeit im Wartezimmer?',
    answers: [
      { text: 'Handy', points: 35 },
      { text: 'Zeitschrift lesen', points: 25 },
      { text: 'Mit anderen reden', points: 15 },
      { text: 'Dösen/Nichts tun', points: 15 },
      { text: 'Nervös sein', points: 10 },
    ],
  },
  {
    id: 'alltag-12',
    category: 'alltag',
    question: 'Welches Geräusch nervt am meisten?',
    answers: [
      { text: 'Baustellenlärm', points: 28 },
      { text: 'Weckerklingeln', points: 22 },
      { text: 'Quietschende Tür', points: 20 },
      { text: 'Schnarchen', points: 18 },
      { text: 'Handy-Vibrieren', points: 12 },
    ],
  },
  {
    id: 'alltag-13',
    category: 'alltag',
    question: 'Welche App nutzt man täglich am meisten?',
    answers: [
      { text: 'WhatsApp', points: 32 },
      { text: 'Instagram', points: 24 },
      { text: 'YouTube', points: 20 },
      { text: 'E-Mail', points: 14 },
      { text: 'TikTok', points: 10 },
    ],
  },
  {
    id: 'alltag-14',
    category: 'alltag',
    question: 'Was tut man, wenn das Internet ausfällt?',
    answers: [
      { text: 'Handy-Daten nutzen', points: 28 },
      { text: 'WLAN vom Nachbarn suchen', points: 22 },
      { text: 'Buch lesen', points: 20 },
      { text: 'Spazieren gehen', points: 18 },
      { text: 'Genervt warten', points: 12 },
    ],
  },
  {
    id: 'alltag-15',
    category: 'alltag',
    question: 'Welches Fortbewegungsmittel nutzt man in der Stadt?',
    answers: [
      { text: 'Auto', points: 30 },
      { text: 'Fahrrad', points: 26 },
      { text: 'Bus/Bahn', points: 24 },
      { text: 'Zu Fuß', points: 12 },
      { text: 'E-Scooter', points: 8 },
    ],
  },
  {
    id: 'alltag-16',
    category: 'alltag',
    question: 'Was möchte man im Urlaub am liebsten gar nicht tun?',
    answers: [
      { text: 'Arbeiten/E-Mails checken', points: 30 },
      { text: 'Früh aufstehen', points: 26 },
      { text: 'Kochen', points: 18 },
      { text: 'Aufräumen', points: 16 },
      { text: 'Sport machen', points: 10 },
    ],
  },
  {
    id: 'alltag-17',
    category: 'alltag',
    question: 'Wobei schaut man am häufigsten aufs Handy?',
    answers: [
      { text: 'Beim Warten', points: 28 },
      { text: 'Vorm Einschlafen', points: 24 },
      { text: 'Beim Essen', points: 20 },
      { text: 'Auf der Toilette', points: 16 },
      { text: 'Beim Fernsehen', points: 12 },
    ],
  },
  {
    id: 'alltag-18',
    category: 'alltag',
    question: 'Was braucht man unbedingt im Büro?',
    answers: [
      { text: 'Kaffee', points: 30 },
      { text: 'Laptop/PC', points: 26 },
      { text: 'Ruhe/Kopfhörer', points: 18 },
      { text: 'Ordnung am Schreibtisch', points: 14 },
      { text: 'Pflanzen', points: 12 },
    ],
  },
  {
    id: 'alltag-19',
    category: 'alltag',
    question: 'Welchen Ort besucht man an einem freien Tag?',
    answers: [
      { text: 'Café', points: 26 },
      { text: 'Museum', points: 22 },
      { text: 'Park', points: 22 },
      { text: 'Einkaufszentrum', points: 16 },
      { text: 'Kino', points: 14 },
    ],
  },
  {
    id: 'alltag-20',
    category: 'alltag',
    question: 'Was macht man zuerst nach dem Aufwachen im Urlaub?',
    answers: [
      { text: 'Ausschlafen genießen', points: 30 },
      { text: 'Frühstücken', points: 24 },
      { text: 'Ans Meer/an den Pool gehen', points: 22 },
      { text: 'Handy checken', points: 14 },
      { text: 'Duschen', points: 10 },
    ],
  },

  // ─── Essen & Trinken (Teil 2) ───
  {
    id: 'essen-11',
    category: 'essen',
    question: 'Welches Gewürz darf in der Küche nicht fehlen?',
    answers: [
      { text: 'Salz', points: 32 },
      { text: 'Pfeffer', points: 26 },
      { text: 'Paprika', points: 18 },
      { text: 'Knoblauch', points: 14 },
      { text: 'Curry', points: 10 },
    ],
  },
  {
    id: 'essen-12',
    category: 'essen',
    question: 'Was isst man typischerweise beim Grillen?',
    answers: [
      { text: 'Bratwurst', points: 30 },
      { text: 'Steak', points: 24 },
      { text: 'Grillkäse', points: 18 },
      { text: 'Maiskolben', points: 16 },
      { text: 'Stockbrot', points: 12 },
    ],
  },
  {
    id: 'essen-13',
    category: 'essen',
    question: 'Welches Getränk trinkt man auf einer Party?',
    answers: [
      { text: 'Bier', points: 30 },
      { text: 'Sekt/Prosecco', points: 24 },
      { text: 'Cocktails', points: 20 },
      { text: 'Wasser', points: 14 },
      { text: 'Limo/Softdrinks', points: 12 },
    ],
  },
  {
    id: 'essen-14',
    category: 'essen',
    question: 'Was bringt man mit zu einer Grillparty?',
    answers: [
      { text: 'Fleisch/Würstchen', points: 28 },
      { text: 'Salat', points: 24 },
      { text: 'Getränke', points: 22 },
      { text: 'Chips/Snacks', points: 14 },
      { text: 'Dessert', points: 12 },
    ],
  },
  {
    id: 'essen-15',
    category: 'essen',
    question: 'Welche Süßigkeit kauft man sich im Kino?',
    answers: [
      { text: 'Gummibärchen', points: 28 },
      { text: 'Schokolade', points: 24 },
      { text: 'Popcorn', points: 22 },
      { text: 'Lakritz', points: 14 },
      { text: 'Kaubonbons', points: 12 },
    ],
  },
  {
    id: 'essen-16',
    category: 'essen',
    question: 'Was isst man am Sonntagmorgen?',
    answers: [
      { text: 'Frühstücksei', points: 24 },
      { text: 'Brötchen', points: 24 },
      { text: 'Pancakes/Waffeln', points: 22 },
      { text: 'Müsli', points: 16 },
      { text: 'Croissant', points: 14 },
    ],
  },
  {
    id: 'essen-17',
    category: 'essen',
    question: 'Welches Fastfood bestellt man am liebsten?',
    answers: [
      { text: 'Burger', points: 32 },
      { text: 'Döner', points: 26 },
      { text: 'Pizza', points: 20 },
      { text: 'Pommes', points: 14 },
      { text: 'Chicken Nuggets', points: 8 },
    ],
  },
  {
    id: 'essen-18',
    category: 'essen',
    question: 'Was trinkt man am liebsten zum Essen?',
    answers: [
      { text: 'Wasser', points: 30 },
      { text: 'Wein', points: 24 },
      { text: 'Cola/Softdrink', points: 22 },
      { text: 'Bier', points: 14 },
      { text: 'Saft', points: 10 },
    ],
  },
  {
    id: 'essen-19',
    category: 'essen',
    question: 'Welches Land hat aus deutscher Sicht die beliebteste Küche?',
    answers: [
      { text: 'Italien', points: 30 },
      { text: 'Deutschland', points: 22 },
      { text: 'Griechenland', points: 18 },
      { text: 'Türkei', points: 16 },
      { text: 'Asien allgemein', points: 14 },
    ],
  },
  {
    id: 'essen-20',
    category: 'essen',
    question: 'Was kocht man, wenn Freunde zu Besuch kommen?',
    answers: [
      { text: 'Pasta', points: 26 },
      { text: 'Gegrilltes', points: 24 },
      { text: 'Salat/Vorspeisen', points: 20 },
      { text: 'Auflauf', points: 16 },
      { text: 'Fingerfood', points: 14 },
    ],
  },

  // ─── Familie & Freizeit (Teil 2) ───
  {
    id: 'familie-11',
    category: 'familie',
    question: 'Was macht man mit den Großeltern am liebsten?',
    answers: [
      { text: 'Kaffee trinken/backen', points: 28 },
      { text: 'Geschichten erzählen', points: 24 },
      { text: 'Spazieren gehen', points: 22 },
      { text: 'Spielen', points: 16 },
      { text: 'Fernsehen', points: 10 },
    ],
  },
  {
    id: 'familie-12',
    category: 'familie',
    question: 'Welches Hobby betreibt die Familie gemeinsam?',
    answers: [
      { text: 'Wandern', points: 26 },
      { text: 'Radfahren', points: 24 },
      { text: 'Kochen/Backen', points: 22 },
      { text: 'Gesellschaftsspiele', points: 16 },
      { text: 'Sport', points: 12 },
    ],
  },
  {
    id: 'familie-13',
    category: 'familie',
    question: 'Was packt man für einen Familienausflug in den Park ein?',
    answers: [
      { text: 'Picknickdecke', points: 26 },
      { text: 'Essen/Getränke', points: 24 },
      { text: 'Ball/Spielzeug', points: 22 },
      { text: 'Sonnencreme', points: 16 },
      { text: 'Regenschirm', points: 12 },
    ],
  },
  {
    id: 'familie-14',
    category: 'familie',
    question: 'Welche Tradition pflegt die Familie an Weihnachten?',
    answers: [
      { text: 'Geschenke auspacken', points: 30 },
      { text: 'Gemeinsam kochen', points: 24 },
      { text: 'Weihnachtsbaum schmücken', points: 20 },
      { text: 'Kirche besuchen', points: 14 },
      { text: 'Plätzchen backen', points: 12 },
    ],
  },
  {
    id: 'familie-15',
    category: 'familie',
    question: 'Worüber streiten sich Eltern und Kinder am häufigsten?',
    answers: [
      { text: 'Handyzeit', points: 30 },
      { text: 'Hausaufgaben', points: 24 },
      { text: 'Zimmer aufräumen', points: 20 },
      { text: 'Schlafenszeit', points: 16 },
      { text: 'Süßigkeiten', points: 10 },
    ],
  },
  {
    id: 'familie-16',
    category: 'familie',
    question: 'Wohin fährt die Familie am liebsten in den Urlaub?',
    answers: [
      { text: 'Ans Meer', points: 32 },
      { text: 'In die Berge', points: 24 },
      { text: 'Ins Ausland/Städtereise', points: 20 },
      { text: 'Campingplatz', points: 14 },
      { text: 'Zu Verwandten', points: 10 },
    ],
  },
  {
    id: 'familie-17',
    category: 'familie',
    question: 'Was braucht ein Kind unbedingt im Kinderzimmer?',
    answers: [
      { text: 'Bett', points: 24 },
      { text: 'Spielzeug', points: 24 },
      { text: 'Schreibtisch', points: 20 },
      { text: 'Kuscheltier', points: 18 },
      { text: 'Bücherregal', points: 14 },
    ],
  },
  {
    id: 'familie-18',
    category: 'familie',
    question: 'Was macht man am Geburtstag eines Familienmitglieds?',
    answers: [
      { text: 'Kuchen backen', points: 28 },
      { text: 'Geschenke überreichen', points: 26 },
      { text: 'Feiern/Party machen', points: 20 },
      { text: 'Lieblingsessen kochen', points: 16 },
      { text: 'Anrufen/Gratulieren', points: 10 },
    ],
  },
  {
    id: 'familie-19',
    category: 'familie',
    question: 'Welchen Film schaut die ganze Familie zusammen?',
    answers: [
      { text: 'Disney/Animationsfilm', points: 30 },
      { text: 'Komödie', points: 24 },
      { text: 'Actionfilm', points: 18 },
      { text: 'Weihnachtsfilm', points: 16 },
      { text: 'Dokumentation', points: 12 },
    ],
  },
  {
    id: 'familie-20',
    category: 'familie',
    question: 'Was tut man an einem Familien-Spieleabend?',
    answers: [
      { text: 'Brettspiele spielen', points: 30 },
      { text: 'Kartenspiele spielen', points: 24 },
      { text: 'Snacks essen', points: 20 },
      { text: 'Musik hören', points: 14 },
      { text: 'Lachen/Quatschen', points: 12 },
    ],
  },
];
