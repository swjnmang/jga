import { Card } from './types';
import { playlistCards } from './playlistCards';
import { flagCards } from './flagCards';
import { outlineCards } from './outlineCards';
import { triviaExtraCards } from './triviaExtraCards';
import { naturTechnikCards } from './naturTechnikCards';
import { filmSerienCards } from './filmSerienCards';
import { schaetzfragenCards } from './schaetzfragenCards';
import { quoteCards } from './quoteCards';
import { essentrinkenCards } from './essentrinkenCards';
import { gamingEsportsCards } from './gamingEsportsCards';
import { gzszCards } from './gzszCards';

const baseCards: Card[] = [
  {
    id: 'song-smells-like-teen-spirit',
    title: 'Smells Like Teen Spirit',
    category: 'music',
    year: 1991,
    cue: 'Starte den Song und ordne ihn zeitlich ein.',
    answer: 'Nirvana — Nevermind.',
    hint: 'Grunge aus Seattle.',
    difficulty: 'mittel',
    sources: {
      spotify: 'https://open.spotify.com/track/5ghIJDpPoe3CfHMGu71E6T'
    }
  },
  {
    id: 'image-berliner-mauerfall',
    title: 'Fall der Berliner Mauer',
    category: 'image',
    year: 1989,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Wo und wann war das?',
    answer: 'Berlin, 09.11.1989 „ Fall der Berliner Mauer.',
    hint: 'Europa, Kalter Krieg.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/images/mauerfall.jpg'
    },
    distractors: ['Prag, 17.11.1989 – Samtene Revolution.', 'Budapest, 23.10.1989 – Ausrufung der Republik.', 'Warschau, 04.06.1989 – Solidarność siegt.']
  },
  {
    id: 'image-cheops-pyramide',
    title: 'Cheops-Pyramide',
    category: 'image',
    year: -2560,
    cue: 'Bild ansehen und einordnen. Frage: Wo und wann war das?',
    answer: 'Gizeh, ca. 2560 v. Chr. „ Cheops-Pyramide.',
    hint: 'Altes "Agypten.',
    difficulty: 'schwer',
    sources: {
      image: '/assets/images/pyramide.png'
    },
    distractors: ['Babylon, ca. 600 v. Chr. – Hängende Gärten.', 'Athen, ca. 447 v. Chr. – Parthenon.', 'Teotihuacán, ca. 200 n. Chr. – Sonnenpyramide.']
  },
  {
    id: 'song-rolling-in-the-deep',
    title: 'Rolling in the Deep',
    category: 'music',
    year: 2010,
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Adele — Album 21.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Queen — Album A Night at the Opera.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Michael Jackson — Album Thriller.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Ed Sheeran — Album ".',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'The Weeknd — Album After Hours.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'a-ha — Album Hunting High and Low.',
    hint: 'Norwegische Synth-Pop-Band.',
    difficulty: 'mittel',
    sources: {
      spotify: 'https://open.spotify.com/track/2WfaOiMkCvy7F5fcp2zZ8L'
    }
  },
  {
    id: 'image-apollo11-flag',
    title: 'Apollo 11 Flagge',
    category: 'image',
    year: 1969,
    cue: 'Bild ansehen: Wo und wann war das?',
    answer: 'Mond, 20.07.1969 „ Apollo 11 Flaggenaufstellung.',
    hint: 'Erste bemannte Mondlandung.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/images/apollo11.jpg'
    },
    distractors: ['Mars, 20.07.1976 – Viking 1 Landung.', 'Weltraum, 12.04.1961 – Gagarin erster Mensch im All.', 'ISS, 20.11.1998 – Erste ISS-Module verbunden.']
  },
  {
    id: 'image-prohibition-end',
    title: 'Ende der Prohibition',
    category: 'image',
    year: 1933,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Wo und wann war das?',
    answer: 'USA, 05.12.1933 – Ende der Prohibition.',
    hint: 'USA, Alkoholverbot aufgehoben.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/images/prohibition-end-1933.jpg'
    },
    distractors: ['USA, 16.01.1920 – Beginn der Prohibition.', 'USA, 24.10.1929 – Schwarzer Donnerstag (Börsencrash).', 'USA, 1929-1939 – Great Depression.']
  },
  {
    id: 'image-wm-finale-1974',
    title: 'WM-Finale 1974',
    category: 'image',
    year: 1974,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Welches Ereignis und wann?',
    answer: 'München, 07.07.1974 – WM-Finale BRD-Niederlande 2:1.',
    hint: 'Deutschland wird Fußball-Weltmeister.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/images/wm-finale-1974.jpg'
    },
    distractors: ['Bern, 04.07.1954 – WM-Finale BRD-Ungarn 3:2 (Wunder von Bern).', 'Rom, 11.07.1982 – WM-Finale Italien-BRD 3:1.', 'Mexiko, 29.06.1986 – WM-Viertelfinale England-Argentinien 1:2.']
  },
  {
    id: 'image-versailles-treaty',
    title: 'Versailler Vertrag',
    category: 'image',
    year: 1919,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Welches historische Dokument und wann?',
    answer: 'Versailles, 28.06.1919 – Unterzeichnung des Versailler Vertrags.',
    hint: 'Friedensvertrag nach dem Ersten Weltkrieg.',
    difficulty: 'schwer',
    sources: {
      image: '/assets/images/versailles-treaty-1919.png'
    },
    distractors: ['Paris, 10.02.1947 – Pariser Friedensverträge nach WW2.', 'Wien, 09.06.1815 – Wiener Kongress.', 'Potsdam, 17.07.1945 – Potsdamer Konferenz.']
  },
  {
    id: 'image-eiffelturm-bau',
    title: 'Bau des Eiffelturms',
    category: 'image',
    year: 1889,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Welches Bauwerk und wann fertiggestellt?',
    answer: 'Paris, 31.03.1889 – Fertigstellung des Eiffelturms.',
    hint: 'Wahrzeichen von Paris, Weltausstellung.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/images/eiffelturm-bau-1889.jpg'
    },
    distractors: ['New York, 01.05.1931 – Empire State Building fertiggestellt.', 'London, 1894 – Tower Bridge fertiggestellt.', 'Sydney, 20.10.1973 – Sydney Opera House eröffnet.']
  },
  {
    id: 'image-bastille-sturm',
    title: 'Sturm auf die Bastille',
    category: 'image',
    year: 1789,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Welches historische Ereignis und wann?',
    answer: 'Paris, 14.07.1789 – Sturm auf die Bastille.',
    hint: 'Beginn der Französischen Revolution.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/images/bastille-1789.jpg'
    },
    distractors: ['Paris, 21.01.1793 – Hinrichtung von Ludwig XVI.', 'Paris, 27.07.1794 – Sturz von Robespierre.', 'Wien, 13.03.1848 – Märzrevolution.']
  },
  {
    id: 'image-everest-erstbesteigung',
    title: 'Mount Everest Erstbesteigung',
    category: 'image',
    year: 1953,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Welche Leistung und wann?',
    answer: 'Mount Everest, 29.05.1953 – Hillary und Tenzing erreichen den Gipfel.',
    hint: 'Höchster Berg der Welt erstmals bestiegen.',
    difficulty: 'schwer',
    sources: {
      image: '/assets/images/everest-1953.jpg'
    },
    distractors: ['K2, 31.07.1954 – Erstbesteigung durch italienische Expedition.', 'Matterhorn, 14.07.1865 – Erstbesteigung durch Edward Whymper.', 'Mont Blanc, 08.08.1786 – Erstbesteigung.']
  },
  {
    id: 'image-tiananmen-tank-man',
    title: 'Tank Man',
    category: 'image',
    year: 1989,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Wo und wann war das?',
    answer: 'Peking, 05.06.1989 – Tank Man auf dem Tiananmen-Platz.',
    hint: 'Ikonisches Protestbild, China.',
    difficulty: 'schwer',
    sources: {
      image: '/assets/images/tian-anmen-platz-100.webp'
    },
    distractors: ['Hongkong, 04.06.2019 – Proteste gegen Auslieferungsgesetz.', 'Seoul, 18.05.1980 – Gwangju-Aufstand.', 'Prag, 16.01.1969 – Jan Palach verbrennt sich.']
  },
  {
    id: 'image-brandenburger-tor-1989',
    title: 'Brandenburger Tor 1989',
    category: 'image',
    year: 1989,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Wo und wann war das?',
    answer: 'Berlin, November 1989 – Menschen am Brandenburger Tor nach Mauerfall.',
    hint: 'Deutsche Wiedervereinigung, Fall der Mauer.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/images/brandenburger-tor-1989.jpg'
    },
    distractors: ['Berlin, 17.06.1953 – Volksaufstand in der DDR.', 'Berlin, 13.08.1961 – Bau der Berliner Mauer.', 'Berlin, 03.10.1990 – Tag der Deutschen Einheit.']
  },
  {
    id: 'country-germany-flag',
    title: 'Flagge Deutschlands',
    category: 'flag',
    year: 1949,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Bundesrepublik Deutschland " 23.05.1949 (Grundgesetz in Kraft).',
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
    answer: 'David Bowie — aus dem Album "Heroes".',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'John Lennon — Friedenshymne.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Eagles — Klassiker der Westküte.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'OutKast — aus Speakerboxxx/The Love Below.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Eminem — Soundtrack zu 8 Mile.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'The White Stripes — markante Basslinie.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Billie Eilish — Deb"talbum When We All Fall Asleep.',
    hint: 'Flüterpop mit Bass.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Daft Punk feat. Pharrell Williams.',
    hint: 'Franzuisches Duo mit Helmen.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Coldplay — Album Viva la Vida or Death and All His Friends.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Shakira feat. Wyclef Jean.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Fleetwood Mac — Album Rumours.',
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
    cue: 'Aus welchem Jahr stammt dieser Titel? Wie heißt er und von wem ist er?',
    answer: 'Backstreet Boys — Boyband-Evergreen.',
    hint: 'Tell me why.',
    difficulty: 'leicht',
    sources: {
      spotify: 'https://open.spotify.com/track/6e40mgJiCid5HRAGrbpGA6'
    }
  },
  {
    id: 'flag-de',
    title: 'Flagge Deutschland',
    category: 'flag',
    year: 1949,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Deutschland „ Schwarz-Rot-Gold, 1949 best"tigt.',
    hint: 'Mitteleuropa, Trikolore.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/de.png'
    }
  },
  {
    id: 'flag-fr',
    title: 'Flagge Frankreich',
    category: 'flag',
    year: 1794,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Frankreich „ Bleu-Blanc-Rouge, 1794 offiziell.',
    hint: 'Tricolore mit Blau links.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/fr.png'
    }
  },
  {
    id: 'flag-it',
    title: 'Flagge Italien',
    category: 'flag',
    year: 1946,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Italien „ Gr"n-Wei"-Rot, 1946 republikanisch.',
    hint: 'Vertikale Tricolore, Gr"n am Mast.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/it.png'
    }
  },
  {
    id: 'flag-es',
    title: 'Flagge Spanien',
    category: 'flag',
    year: 1981,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Spanien „ Rot-Gelb-Rot mit Wappen.',
    hint: 'Mittelstreifen doppelt so breit.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/es.png'
    }
  },
  {
    id: 'flag-us',
    title: 'Flagge USA',
    category: 'flag',
    year: 1960,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Vereinigte Staaten „ Stars and Stripes mit 50 Sternen, seit 1960.',
    hint: 'Streifen und Sterne.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/us.png'
    }
  },
  {
    id: 'flag-gb',
    title: 'Flagge Vereinigtes K"nigreich',
    category: 'flag',
    year: 1801,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Vereinigtes K"nigreich „ Union Jack, seit 1801.',
    hint: '"berlagerte Kreuze.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/gb.png'
    }
  },
  {
    id: 'flag-jp',
    title: 'Flagge Japan',
    category: 'flag',
    year: 1999,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Japan „ Roter Kreis auf Wei", 1999 gesetzlich best"tigt.',
    hint: 'Hinomaru.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/jp.png'
    }
  },
  {
    id: 'flag-cn',
    title: 'Flagge China',
    category: 'flag',
    year: 1949,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Volksrepublik China „ Rot mit f"nf Sternen.',
    hint: 'Ein gro"er, vier kleine Sterne.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/cn.png'
    }
  },
  {
    id: 'flag-br',
    title: 'Flagge Brasilien',
    category: 'flag',
    year: 1889,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Brasilien „ Gr"n, Gelb-Raute und Sternenkugel.',
    hint: 'Ordem e Progresso.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/br.png'
    }
  },
  {
    id: 'flag-in',
    title: 'Flagge Indien',
    category: 'flag',
    year: 1947,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Indien „ Safran, Wei", Gr"n mit Ashoka-Chakra.',
    hint: '24-Speichen-Rad.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/in.png'
    }
  },
  {
    id: 'flag-au',
    title: 'Flagge Australien',
    category: 'flag',
    year: 1903,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Australien „ Union Jack, Commonwealth Star und S"dliches Kreuz.',
    hint: 'Blau mit Sternbildern.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/au.png'
    }
  },
  {
    id: 'flag-ca',
    title: 'Flagge Kanada',
    category: 'flag',
    year: 1965,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Kanada „ Ahornblatt auf Rot-Wei"-Rot.',
    hint: 'Rotes Ahornblatt.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/ca.png'
    }
  },
  {
    id: 'flag-za',
    title: 'Flagge S"dafrika',
    category: 'flag',
    year: 1994,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'S"dafrika „ Y-Form mit sechs Farben.',
    hint: 'Post-Apartheid Symbol.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/za.png'
    }
  },
  {
    id: 'flag-se',
    title: 'Flagge Schweden',
    category: 'flag',
    year: 1906,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Schweden „ Blau mit gelbem Kreuz.',
    hint: 'Nordisches Kreuz.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/se.png'
    }
  },
  {
    id: 'flag-no',
    title: 'Flagge Norwegen',
    category: 'flag',
    year: 1821,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Norwegen „ Rot mit blauem Kreuz.',
    hint: 'Nordisches Kreuz mit Wei" und Blau.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/no.png'
    }
  },
  {
    id: 'flag-fi',
    title: 'Flagge Finnland',
    category: 'flag',
    year: 1918,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Finnland „ Wei" mit blauem Kreuz.',
    hint: 'Seen, Schnee, Blau-Wei".',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/fi.png'
    }
  },
  {
    id: 'flag-ar',
    title: 'Flagge Argentinien',
    category: 'flag',
    year: 1818,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Argentinien „ Hellblau-Wei" mit Sonne.',
    hint: 'Sonne der Mai-Revolution.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/ar.png'
    }
  },
  {
    id: 'flag-mx',
    title: 'Flagge Mexiko',
    category: 'flag',
    year: 1968,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Mexiko „ Gr"n, Wei", Rot mit Adler und Schlange.',
    hint: 'Tricolore mit Wappen.',
    difficulty: 'mittel',
    sources: {
      image: '/assets/flags/mx.png'
    }
  },
  {
    id: 'flag-ch',
    title: 'Flagge Schweiz',
    category: 'flag',
    year: 1889,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Schweiz „ Rotes Quadrat mit wei"em Kreuz.',
    hint: 'Quadratische Flagge.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/ch.png'
    }
  },
  {
    id: 'flag-nl',
    title: 'Flagge Niederlande',
    category: 'flag',
    year: 1937,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Niederlande „ Rot, Wei", Blau.',
    hint: 'Waagerechte Tricolore.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/nl.png'
    }
  },
];

const baseNonMusicCards = [
  ...baseCards.filter((c) => c.category !== 'music' && c.category !== 'image' && !c.id.startsWith('flag-') && !c.id.startsWith('outline-')),
  ...naturTechnikCards,
  ...filmSerienCards,
  ...triviaExtraCards,
  ...schaetzfragenCards,
  ...quoteCards,
  ...essentrinkenCards,
  ...gamingEsportsCards,
  ...gzszCards,
];

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
export const cards: Card[] = [...baseNonMusicCards, ...flagCards, ...outlineCards, ...playlistTaggedCards];


