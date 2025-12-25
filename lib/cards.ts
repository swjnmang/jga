import { Card } from './types';

export const cards: Card[] = [
  {
    id: 'song-smells-like-teen-spirit',
    title: 'Smells Like Teen Spirit',
    category: 'music',
    year: 1991,
    cue: 'Starte den Song und ordne ihn zeitlich ein.',
    answer: 'Nirvana — Release 1991 auf dem Album Nevermind.',
    hint: 'Grunge aus Seattle.',
    sources: {
      youtube: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
      spotify: 'https://open.spotify.com/track/5ghIJDpPoe3CfHMGu71E6T'
    }
  },
  {
    id: 'reference-1900',
    title: 'Referenzkarte 1900',
    category: 'image',
    year: 1900,
    cue: 'Lege diese Karte als Startpunkt. Alle Teams beginnen mit 1900.',
    answer: 'Referenzkarte: Jahr 1900 als Startlinie.',
    sources: {
      image: 'https://placehold.co/800x600/0f172a/f6f1e9?text=1900+Referenz'
    }
  },
  {
    id: 'quote-wir-schaffen-das',
    title: 'Wir schaffen das',
    category: 'quote',
    year: 2015,
    cue: 'Höre das Zitat oder lese es laut vor.',
    answer: 'Angela Merkel, Pressekonferenz zur Flüchtlingspolitik am 31.08.2015.',
    hint: 'Bundeskanzlerin zur Migrationslage.',
    sources: {
      text: '„Wir schaffen das.“'
    }
  },
  {
    id: 'video-bern-1954',
    title: 'Tor im WM-Finale 1954',
    category: 'video',
    year: 1954,
    cue: 'Kurzer Clip aus dem Endspiel in Bern.',
    answer: 'Helmut Rahn erzielt das 3:2 im WM-Finale am 04.07.1954.',
    hint: 'Das Wunder von Bern.',
    sources: {
      youtube: 'https://www.youtube.com/watch?v=1d3cZsWzV3s'
    }
  },
  {
    id: 'quote-mlk-dream',
    title: 'I have a dream',
    category: 'quote',
    year: 1963,
    cue: 'Ein Ausschnitt aus einer berühmten Rede.',
    answer: 'Martin Luther King Jr., 28.08.1963, Washington D.C.',
    hint: 'Bürgerrechtsbewegung in den USA.',
    sources: {
      youtube: 'https://www.youtube.com/watch?v=vP4iY1TtS3s',
      text: '“I have a dream.”'
    }
  },
  {
    id: 'image-berliner-mauerfall',
    title: 'Fall der Berliner Mauer',
    category: 'image',
    year: 1989,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Wo und wann war das?',
    answer: 'Berlin, 09.11.1989 – Fall der Berliner Mauer.',
    hint: 'Europa, Kalter Krieg.',
    sources: {
      image: 'https://placehold.co/900x600/ff7a8a/0f172a?text=Berliner+Mauerfall'
    }
  },
  {
    id: 'image-cheops-pyramide',
    title: 'Cheops-Pyramide',
    category: 'image',
    year: -2560,
    cue: 'Bild ansehen und einordnen. Frage: Wo und wann war das?',
    answer: 'Gizeh, ca. 2560 v. Chr. – Cheops-Pyramide.',
    hint: 'Altes Ägypten.',
    sources: {
      image: 'https://placehold.co/900x600/d1f3e0/0f172a?text=Cheops-Pyramide'
    }
  }
];

export function getCardById(id: string) {
  return cards.find((card) => card.id === id);
}

export function getCategories(list: Card[]) {
  const unique = new Set(list.map((c) => c.category));
  return Array.from(unique);
}
