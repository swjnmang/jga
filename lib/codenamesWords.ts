// Deutsches Wortset für Codenames: familienfreundliche, allgemein bekannte Substantive.
export const CODENAMES_WORDS: string[] = [
  // Tiere
  'Löwe', 'Tiger', 'Elefant', 'Affe', 'Bär', 'Wolf', 'Fuchs', 'Hase', 'Igel', 'Maus',
  'Ratte', 'Pferd', 'Esel', 'Kuh', 'Schaf', 'Ziege', 'Schwein', 'Hund', 'Katze', 'Vogel',
  'Adler', 'Eule', 'Rabe', 'Schwan', 'Pinguin', 'Ente', 'Gans', 'Huhn', 'Hahn', 'Storch',
  'Flamingo', 'Papagei', 'Delfin', 'Wal', 'Hai', 'Fisch', 'Krebs', 'Krake', 'Qualle', 'Schildkröte',
  'Frosch', 'Schlange', 'Krokodil', 'Spinne', 'Biene', 'Ameise', 'Schmetterling', 'Käfer', 'Skorpion', 'Kamel',
  'Giraffe', 'Zebra', 'Nashorn', 'Nilpferd', 'Panda', 'Koala', 'Känguru', 'Eichhörnchen', 'Dachs', 'Otter',
  'Biber', 'Hirsch', 'Reh', 'Falke', 'Kolibri', 'Pfau', 'Truthahn', 'Lama', 'Büffel', 'Gorilla',
  'Faultier', 'Waschbär', 'Hummer', 'Muschel', 'Eisbär', 'Robbe', 'Walross',

  // Essen & Trinken
  'Apfel', 'Birne', 'Banane', 'Traube', 'Erdbeere', 'Zitrone', 'Orange', 'Ananas', 'Kirsche', 'Pfirsich',
  'Melone', 'Kartoffel', 'Tomate', 'Gurke', 'Zwiebel', 'Karotte', 'Salat', 'Brot', 'Butter', 'Käse',
  'Milch', 'Ei', 'Honig', 'Zucker', 'Salz', 'Pfeffer', 'Reis', 'Nudel', 'Suppe', 'Kuchen',
  'Schokolade', 'Kaffee', 'Tee', 'Wein', 'Bier', 'Saft', 'Pizza', 'Burger', 'Popcorn', 'Marmelade',

  // Haushalt & Objekte
  'Tisch', 'Stuhl', 'Bett', 'Schrank', 'Lampe', 'Spiegel', 'Fenster', 'Tür', 'Teppich', 'Kissen',
  'Decke', 'Uhr', 'Kerze', 'Vase', 'Topf', 'Pfanne', 'Messer', 'Gabel', 'Löffel', 'Teller',
  'Tasse', 'Glas', 'Flasche', 'Schlüssel', 'Schloss', 'Besen', 'Eimer', 'Seife', 'Handtuch', 'Bürste',
  'Nagel', 'Hammer', 'Schere', 'Nadel', 'Faden', 'Knopf', 'Koffer', 'Rucksack', 'Regenschirm', 'Brille',
  'Batterie', 'Kabel', 'Seil', 'Netz', 'Leiter',

  // Natur & Wetter
  'Berg', 'Tal', 'Fluss', 'See', 'Meer', 'Insel', 'Wald', 'Baum', 'Blume', 'Rose',
  'Gras', 'Blatt', 'Wurzel', 'Ast', 'Wüste', 'Strand', 'Sand', 'Stein', 'Fels', 'Höhle',
  'Vulkan', 'Gletscher', 'Sonne', 'Mond', 'Stern', 'Wolke', 'Regen', 'Schnee', 'Blitz', 'Donner',
  'Regenbogen', 'Nebel', 'Sturm', 'Dschungel',

  // Berufe
  'Arzt', 'Lehrer', 'Polizist', 'Koch', 'Bäcker', 'Friseur', 'Pilot', 'Kapitän', 'Bauer', 'Anwalt',
  'Richter', 'Künstler', 'Musiker', 'Schauspieler', 'Sänger', 'Tänzer', 'Fotograf', 'Ritter', 'König', 'Königin',
  'Prinz', 'Prinzessin', 'Detektiv', 'Astronaut',

  // Orte & Gebäude
  'Schule', 'Kirche', 'Burg', 'Turm', 'Brücke', 'Hafen', 'Flughafen', 'Bahnhof', 'Museum', 'Theater',
  'Kino', 'Zirkus', 'Markt', 'Fabrik', 'Farm', 'Garten', 'Park', 'Zoo', 'Restaurant', 'Hotel',
  'Gefängnis', 'Bibliothek', 'Labor', 'Werkstatt', 'Küche', 'Keller', 'Dach', 'Balkon', 'Pyramide', 'Tempel',
  'Palast', 'Ruine',

  // Fahrzeuge & Technik
  'Auto', 'Bus', 'Zug', 'Flugzeug', 'Schiff', 'Boot', 'Rakete', 'Ballon', 'Fahrrad', 'Motorrad',
  'Roller', 'Traktor', 'Kran', 'Panzer', 'Computer', 'Telefon', 'Fernseher', 'Radio', 'Kamera', 'Roboter',
  'Bildschirm', 'Drucker', 'U-Boot',

  // Körper
  'Kopf', 'Auge', 'Ohr', 'Nase', 'Mund', 'Zahn', 'Zunge', 'Hand', 'Finger', 'Arm',
  'Bein', 'Fuß', 'Herz', 'Gehirn', 'Haar',

  // Kleidung
  'Hut', 'Mütze', 'Mantel', 'Jacke', 'Hemd', 'Hose', 'Rock', 'Schuh', 'Stiefel', 'Handschuh',
  'Schal', 'Krawatte', 'Gürtel', 'Ring', 'Krone', 'Maske',

  // Sport & Spiel
  'Ball', 'Tor', 'Schläger', 'Schach', 'Karte', 'Würfel', 'Puppe', 'Drache', 'Rennen', 'Medaille',
  'Pokal', 'Ski', 'Schlitten', 'Bogen', 'Pfeil', 'Speer', 'Schild', 'Trikot',

  // Fantasy & Mythos
  'Einhorn', 'Hexe', 'Zauberer', 'Vampir', 'Geist', 'Zombie', 'Riese', 'Zwerg', 'Elfe', 'Fee',
  'Engel', 'Teufel', 'Monster', 'Gespenst', 'Kobold', 'Werwolf',

  // Abstrakt & Sonstiges
  'Zeit', 'Traum', 'Liebe', 'Krieg', 'Frieden', 'Freiheit', 'Geld', 'Gold', 'Silber', 'Diamant',
  'Schatz', 'Kompass', 'Fahne', 'Musik', 'Note', 'Buch', 'Brief', 'Zeitung', 'Film', 'Foto',
  'Schatten', 'Licht', 'Feuer', 'Eis', 'Rauch', 'Bombe', 'Waffe', 'Schwert', 'Pistole', 'Kanone',
  'Rüstung', 'Amulett',
];
