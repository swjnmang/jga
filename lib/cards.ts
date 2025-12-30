import { Card } from './types';
import { playlistCards } from './playlistCards';

const baseCards: Card[] = [
  {
    id: 'song-smells-like-teen-spirit',
    title: 'Smells Like Teen Spirit',
    category: 'music',
    year: 1991,
    cue: 'Starte den Song und ordne ihn zeitlich ein.',
    answer: 'Nirvana — Release 1991 auf dem Album Nevermind.',
    hint: 'Grunge aus Seattle.',
    difficulty: 'mittel',
    sources: {
      spotify: 'https://open.spotify.com/track/5ghIJDpPoe3CfHMGu71E6T'
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
    difficulty: 'leicht',
    sources: {
      text: '„Wir schaffen das.“'
    }
  },
  {
    id: 'video-bern-1954',
    title: 'Tor im WM-Finale 1954',
    category: 'video',
    year: 1954,
    cue: 'Wann war das? Benenne außerdem eine berühmte Persönlichkeit oder einen Ort, der mit diesem Ereignis in Verbindung gesetzt wird.',
    answer: 'Helmut Rahn erzielt das 3:2 im WM-Finale am 04.07.1954.',
    hint: 'Das Wunder von Bern.',
    difficulty: 'mittel',
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
    difficulty: 'mittel',
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
    difficulty: 'leicht',
    sources: {
      image: '/assets/images/mauerfall.jpg'
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
    difficulty: 'schwer',
    sources: {
      image: '/assets/images/pyramide.png'
    }
  },
  {
    id: 'song-rolling-in-the-deep',
    title: 'Rolling in the Deep',
    category: 'music',
    year: 2010,
    cue: 'Song anhören und einordnen.',
    answer: 'Adele — 2010, Album 21.',
    hint: 'Londoner Sängerin, Durchbruch-Single.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/6j6ZtpxjR0L9gLd7krr6m3'
    }
  },
  {
    id: 'song-bohemian-rhapsody',
    title: 'Bohemian Rhapsody',
    category: 'music',
    year: 1975,
    cue: 'Song anhören und einordnen.',
    answer: 'Queen — 1975, Album A Night at the Opera.',
    hint: 'Opernartige Rock-Hymne.',
    difficulty: 'mittel',
    sources: {
      spotify: 'https://open.spotify.com/track/7tFiyTwD0nx5a1eklYtX2J'
    }
  },
  {
    id: 'song-billie-jean',
    title: 'Billie Jean',
    category: 'music',
    year: 1982,
    cue: 'Song anhören und einordnen.',
    answer: 'Michael Jackson — 1982, Album Thriller.',
    hint: 'King of Pop.',
    difficulty: 'mittel',
    sources: {
      spotify: 'https://open.spotify.com/track/5ChkMS8OtdzJeqyybCc9R5'
    }
  },
  {
    id: 'song-shape-of-you',
    title: 'Shape of You',
    category: 'music',
    year: 2017,
    cue: 'Song anhören und einordnen.',
    answer: 'Ed Sheeran — 2017, Album ÷.',
    hint: 'Pop-Hit aus UK.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3'
    }
  },
  {
    id: 'song-blinding-lights',
    title: 'Blinding Lights',
    category: 'music',
    year: 2019,
    cue: 'Song anhören und einordnen.',
    answer: 'The Weeknd — 2019, Album After Hours.',
    hint: 'Synthwave-Revival.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b'
    }
  },
  {
    id: 'song-take-on-me',
    title: 'Take On Me',
    category: 'music',
    year: 1985,
    cue: 'Song anhören und einordnen.',
    answer: 'a-ha — 1985, Album Hunting High and Low.',
    hint: 'Norwegische Synth-Pop-Band.',
    difficulty: 'mittel',
    sources: {
      spotify: 'https://open.spotify.com/track/2WfaOiMkCvy7F5fcp2zZ8L'
    }
  },
  {
    id: 'video-moon-landing-1969',
    title: 'Mondlandung 1969',
    category: 'video',
    year: 1969,
    cue: 'Wann war das? Benenne außerdem eine berühmte Persönlichkeit oder einen Ort, der mit diesem Ereignis in Verbindung gesetzt wird.',
    answer: 'Apollo 11, 20.07.1969 — Neil Armstrong betritt den Mond.',
    hint: 'NASA, Kalter Krieg.',
    difficulty: 'schwer',
    sources: {
      youtube: 'https://www.youtube.com/watch?v=HCt1BwWE2gA'
    }
  },
  {
    id: 'video-berlin-wall-1989',
    title: 'Mauerfall 1989',
    category: 'video',
    year: 1989,
    cue: 'Wann war das? Benenne außerdem eine berühmte Persönlichkeit oder einen Ort, der mit diesem Ereignis in Verbindung gesetzt wird.',
    answer: 'Öffnung der innerdeutschen Grenze am 09.11.1989.',
    hint: 'DDR, Grenzöffnung.',
    difficulty: 'leicht',
    sources: {
      youtube: 'https://www.youtube.com/watch?v=zmRPP2WXX0U'
    }
  },
  {
    id: 'image-apollo11-flag',
    title: 'Apollo 11 Flagge',
    category: 'image',
    year: 1969,
    cue: 'Bild ansehen: Wo und wann war das?',
    answer: 'Mond, 20.07.1969 — Apollo 11 Flaggenaufstellung.',
    hint: 'Erste bemannte Mondlandung.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/images/apollo11.jpg'
    }
  },
  {
    id: 'quote-kennedy-moon',
    title: 'We choose to go to the Moon',
    category: 'quote',
    year: 1962,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'John F. Kennedy, Rice University Speech, 12.09.1962.',
    hint: 'US-Präsident, Raumfahrt-Rede.',
    difficulty: 'schwer',
    sources: {
      youtube: 'https://www.youtube.com/watch?v=g25G1M4EXrQ',
      text: '“We choose to go to the Moon.”'
    }
  },
  {
    id: 'quote-mandela',
    title: 'It always seems impossible',
    category: 'quote',
    year: 2001,
    cue: 'Zitat lesen/anhören.',
    answer: 'Nelson Mandela, 2001.',
    hint: 'Südafrika, Versöhnung.',
    difficulty: 'mittel',
    sources: {
      text: '“It always seems impossible until it’s done.”'
    }
  },
  {
    id: 'country-germany-flag',
    title: 'Flagge Deutschlands',
    category: 'country',
    year: 1949,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Bundesrepublik Deutschland – 23.05.1949 (Grundgesetz in Kraft).',
    hint: 'Europa, schwarz-rot-gold.',
    difficulty: 'leicht',
    sources: {
      image: 'https://placehold.co/900x600/000000/ffce00?text=Deutschland'
    }
  },
  {
    id: 'song-heroes',
    title: 'Heroes',
    category: 'music',
    year: 1977,
    cue: 'Song anspielen und zeitlich einordnen.',
    answer: 'David Bowie — 1977, aus dem Album "Heroes".',
    hint: 'Aufgenommen in Berlin.',
    difficulty: 'mittel',
    sources: {
      spotify: 'https://open.spotify.com/track/0z7pVZyS0G0vXh18vvzJpZ'
    }
  },
  {
    id: 'song-imagine',
    title: 'Imagine',
    category: 'music',
    year: 1971,
    cue: 'Song anhören und einordnen.',
    answer: 'John Lennon — 1971, Friedenshymne.',
    hint: 'Ehemaliger Beatle.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/7pKfPomDEeI4TPT6EOYjn9'
    }
  },
  {
    id: 'song-hotel-california',
    title: 'Hotel California',
    category: 'music',
    year: 1976,
    cue: 'Song anhören und einordnen.',
    answer: 'Eagles — 1976, Klassiker der Westküste.',
    hint: 'Kalifornische Rockband.',
    difficulty: 'mittel',
    sources: {
      spotify: 'https://open.spotify.com/track/40riOy7x9W7GXjyGp4pjAv'
    }
  },
  {
    id: 'song-hey-ya',
    title: 'Hey Ya!',
    category: 'music',
    year: 2003,
    cue: 'Song anhören und einordnen.',
    answer: 'OutKast — 2003, aus Speakerboxxx/The Love Below.',
    hint: 'Shake it like a Polaroid picture.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/2PpruBYCo4H7WOBJ7Q2EwM'
    }
  },
  {
    id: 'song-lose-yourself',
    title: 'Lose Yourself',
    category: 'music',
    year: 2002,
    cue: 'Song anhören und einordnen.',
    answer: 'Eminem — 2002, Soundtrack zu 8 Mile.',
    hint: 'Der Moment, eine Chance.',
    difficulty: 'mittel',
    sources: {
      spotify: 'https://open.spotify.com/track/7lQqaqZu0jqQMYt5qLRO4i'
    }
  },
  {
    id: 'song-seven-nation-army',
    title: 'Seven Nation Army',
    category: 'music',
    year: 2003,
    cue: 'Song anhören und einordnen.',
    answer: 'The White Stripes — 2003, markante Basslinie.',
    hint: 'Zweier-Band aus Detroit.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/3d9DChrdc6BOeFsbrZ3Is0'
    }
  },
  {
    id: 'song-bad-guy',
    title: 'bad guy',
    category: 'music',
    year: 2019,
    cue: 'Song anhören und einordnen.',
    answer: 'Billie Eilish — 2019, Debütalbum When We All Fall Asleep.',
    hint: 'Flüsterpop mit Bass.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m'
    }
  },
  {
    id: 'song-get-lucky',
    title: 'Get Lucky',
    category: 'music',
    year: 2013,
    cue: 'Song anhören und einordnen.',
    answer: 'Daft Punk feat. Pharrell Williams — 2013.',
    hint: 'Französisches Duo mit Helmen.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/69kOkLUCkxIZYexIgSG8rq'
    }
  },
  {
    id: 'song-viva-la-vida',
    title: 'Viva La Vida',
    category: 'music',
    year: 2008,
    cue: 'Song anhören und einordnen.',
    answer: 'Coldplay — 2008, Album Viva la Vida or Death and All His Friends.',
    hint: 'Britische Band mit Streicher-Hook.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/1mea3bSkSGXuIRvnydlB5b'
    }
  },
  {
    id: 'song-hips-dont-lie',
    title: "Hips Don't Lie",
    category: 'music',
    year: 2006,
    cue: 'Song anhören und einordnen.',
    answer: 'Shakira feat. Wyclef Jean — 2006.',
    hint: 'Kolumbianische Sängerin, weltweiter Tanzhit.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/0EmeFodog0BfCgMzAIvKQp'
    }
  },
  {
    id: 'song-dreams-fleetwood',
    title: 'Dreams',
    category: 'music',
    year: 1977,
    cue: 'Song anhören und einordnen.',
    answer: 'Fleetwood Mac — 1977, Album Rumours.',
    hint: 'Soft-Rock-Klassiker.',
    difficulty: 'mittel',
    sources: {
      spotify: 'https://open.spotify.com/track/0ofHAoxe9vBkTCp2UQIavz'
    }
  },
  {
    id: 'song-i-want-it-that-way',
    title: 'I Want It That Way',
    category: 'music',
    year: 1999,
    cue: 'Song anhören und einordnen.',
    answer: 'Backstreet Boys — 1999, Boyband-Evergreen.',
    hint: 'Tell me why.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/6e40mgJiCid5HRAGrbpGA6'
    }
  },
  {
    id: 'quote-tear-down-this-wall',
    title: 'Tear down this wall',
    category: 'quote',
    year: 1987,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Ronald Reagan, Rede am Brandenburger Tor, 12.06.1987.',
    hint: 'US-Präsident fordert Öffnung der Mauer.',
    difficulty: 'mittel',
    sources: {
      text: '“Mr. Gorbachev, tear down this wall!”'
    }
  },
  {
    id: 'quote-yes-we-can',
    title: 'Yes we can',
    category: 'quote',
    year: 2008,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Barack Obama, Wahlkampfrede 2008.',
    hint: 'Slogan einer US-Präsidentschaftskampagne.',
    difficulty: 'leicht',
    sources: {
      text: '“Yes we can.”'
    }
  },
  {
    id: 'quote-ich-bin-ein-berliner',
    title: 'Ich bin ein Berliner',
    category: 'quote',
    year: 1963,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'John F. Kennedy, Rede in Berlin, 26.06.1963.',
    hint: 'Kaltes Kriegs-Statement.',
    difficulty: 'mittel',
    sources: {
      text: '“Ich bin ein Berliner.”'
    }
  },
  {
    id: 'quote-houston-problem',
    title: "Houston, we've had a problem",
    category: 'quote',
    year: 1970,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Jack Swigert/Jim Lovell, Apollo-13-Mission, 13.04.1970.',
    hint: 'Raumfahrt-Notfall.',
    difficulty: 'schwer',
    sources: {
      text: "“Houston, we've had a problem.”"
    }
  },
  {
    id: 'quote-one-small-step',
    title: 'One small step',
    category: 'quote',
    year: 1969,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Neil Armstrong, Mondlandung, 20.07.1969.',
    hint: 'Erster Fußabdruck auf dem Mond.',
    difficulty: 'leicht',
    sources: {
      text: '“That’s one small step for man, one giant leap for mankind.”'
    }
  },
  {
    id: 'quote-fear-itself',
    title: 'Fear itself',
    category: 'quote',
    year: 1933,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Franklin D. Roosevelt, Antrittsrede, 04.03.1933.',
    hint: 'Beginn des New Deal.',
    difficulty: 'mittel',
    sources: {
      text: '“The only thing we have to fear is fear itself.”'
    }
  },
  {
    id: 'quote-stay-hungry',
    title: 'Stay hungry, stay foolish',
    category: 'quote',
    year: 2005,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Steve Jobs, Stanford Commencement Speech, 12.06.2005.',
    hint: 'Abschlussrede an einer US-Eliteuni.',
    difficulty: 'leicht',
    sources: {
      text: '“Stay hungry, stay foolish.”'
    }
  },
  {
    id: 'quote-carpe-diem',
    title: 'Carpe Diem',
    category: 'quote',
    year: 1989,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Aus Dead Poets Society, 1989 – Ermutigung, den Tag zu nutzen.',
    hint: 'Literaturlehrer inspiriert seine Klasse.',
    difficulty: 'mittel',
    sources: {
      text: '“Carpe diem. Seize the day, boys.”'
    }
  },
  {
    id: 'flag-de',
    title: 'Flagge Deutschland',
    category: 'country',
    year: 1949,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Deutschland – Schwarz-Rot-Gold, 1949 bestätigt.',
    hint: 'Mitteleuropa, Trikolore.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/de.png'
    }
  },
  {
    id: 'flag-fr',
    title: 'Flagge Frankreich',
    category: 'country',
    year: 1794,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Frankreich – Bleu-Blanc-Rouge, 1794 offiziell.',
    hint: 'Tricolore mit Blau links.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/fr.png'
    }
  },
  {
    id: 'flag-it',
    title: 'Flagge Italien',
    category: 'country',
    year: 1946,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Italien – Grün-Weiß-Rot, 1946 republikanisch.',
    hint: 'Vertikale Tricolore, Grün am Mast.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/it.png'
    }
  },
  {
    id: 'flag-es',
    title: 'Flagge Spanien',
    category: 'country',
    year: 1981,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Spanien – Rot-Gelb-Rot mit Wappen, 1981.',
    hint: 'Mittelstreifen doppelt so breit.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/es.png'
    }
  },
  {
    id: 'flag-us',
    title: 'Flagge USA',
    category: 'country',
    year: 1960,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Vereinigte Staaten – Stars and Stripes mit 50 Sternen, seit 1960.',
    hint: 'Streifen und Sterne.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/us.png'
    }
  },
  {
    id: 'flag-gb',
    title: 'Flagge Vereinigtes Königreich',
    category: 'country',
    year: 1801,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Vereinigtes Königreich – Union Jack, seit 1801.',
    hint: 'Überlagerte Kreuze.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/gb.png'
    }
  },
  {
    id: 'flag-jp',
    title: 'Flagge Japan',
    category: 'country',
    year: 1999,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Japan – Roter Kreis auf Weiß, 1999 gesetzlich bestätigt.',
    hint: 'Hinomaru.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/jp.png'
    }
  },
  {
    id: 'flag-cn',
    title: 'Flagge China',
    category: 'country',
    year: 1949,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Volksrepublik China – Rot mit fünf Sternen, 1949.',
    hint: 'Ein großer, vier kleine Sterne.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/cn.png'
    }
  },
  {
    id: 'flag-br',
    title: 'Flagge Brasilien',
    category: 'country',
    year: 1889,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Brasilien – Grün, Gelb-Raute und Sternenkugel, 1889.',
    hint: 'Ordem e Progresso.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/br.png'
    }
  },
  {
    id: 'flag-in',
    title: 'Flagge Indien',
    category: 'country',
    year: 1947,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Indien – Safran, Weiß, Grün mit Ashoka-Chakra, 1947.',
    hint: '24-Speichen-Rad.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/in.png'
    }
  },
  {
    id: 'flag-au',
    title: 'Flagge Australien',
    category: 'country',
    year: 1903,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Australien – Union Jack, Commonwealth Star und Südliches Kreuz, 1903.',
    hint: 'Blau mit Sternbildern.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/au.png'
    }
  },
  {
    id: 'flag-ca',
    title: 'Flagge Kanada',
    category: 'country',
    year: 1965,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Kanada – Ahornblatt auf Rot-Weiß-Rot, 1965.',
    hint: 'Rotes Ahornblatt.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/ca.png'
    }
  },
  {
    id: 'flag-za',
    title: 'Flagge Südafrika',
    category: 'country',
    year: 1994,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Südafrika – Y-Form mit sechs Farben, 1994.',
    hint: 'Post-Apartheid Symbol.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/za.png'
    }
  },
  {
    id: 'flag-se',
    title: 'Flagge Schweden',
    category: 'country',
    year: 1906,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Schweden – Blau mit gelbem Kreuz, 1906.',
    hint: 'Nordisches Kreuz.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/se.png'
    }
  },
  {
    id: 'flag-no',
    title: 'Flagge Norwegen',
    category: 'country',
    year: 1821,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Norwegen – Rot mit blauem Kreuz, 1821.',
    hint: 'Nordisches Kreuz mit Weiß und Blau.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/no.png'
    }
  },
  {
    id: 'flag-fi',
    title: 'Flagge Finnland',
    category: 'country',
    year: 1918,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Finnland – Weiß mit blauem Kreuz, 1918.',
    hint: 'Seen, Schnee, Blau-Weiß.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/fi.png'
    }
  },
  {
    id: 'flag-ar',
    title: 'Flagge Argentinien',
    category: 'country',
    year: 1818,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Argentinien – Hellblau-Weiß mit Sonne, 1818.',
    hint: 'Sonne der Mai-Revolution.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/ar.png'
    }
  },
  {
    id: 'flag-mx',
    title: 'Flagge Mexiko',
    category: 'country',
    year: 1968,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Mexiko – Grün, Weiß, Rot mit Adler und Schlange, 1968.',
    hint: 'Tricolore mit Wappen.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/mx.png'
    }
  },
  {
    id: 'flag-ch',
    title: 'Flagge Schweiz',
    category: 'country',
    year: 1889,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Schweiz – Rotes Quadrat mit weißem Kreuz, 1889.',
    hint: 'Quadratische Flagge.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/ch.png'
    }
  },
  {
    id: 'flag-nl',
    title: 'Flagge Niederlande',
    category: 'country',
    year: 1937,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Niederlande – Rot, Weiß, Blau, 1937.',
    hint: 'Waagerechte Tricolore.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/nl.png'
    }
  }
];

const baseNonMusicCards = baseCards.filter((c) => c.category !== 'music');

const playlistTaggedCards = playlistCards.map((card) => {
  if (card.category !== 'music') return card;
  if (card.playlists && card.playlists.length > 0) return card;
  return { ...card, playlists: ['imported-playlist'] } as Card;
});

export function getCardById(id: string) {
  return cards.find((card) => card.id === id);
}

export function getCategories(list: Card[]) {
  const unique = new Set(list.map((c) => c.category));
  return Array.from(unique);
}

// Only use playlist songs for music; keep non-music from base set.
export const cards: Card[] = [...baseNonMusicCards, ...playlistTaggedCards];

