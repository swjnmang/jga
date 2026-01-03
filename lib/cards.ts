import { Card } from './types';
import { playlistCards } from './playlistCards';
import { flagCards } from './flagCards';
import { outlineCards } from './outlineCards';
import { triviaExtraCards } from './triviaExtraCards';
import { naturTechnikCards } from './naturTechnikCards';
import { filmSerienCards } from './filmSerienCards';
import { schaetzfragenCards } from './schaetzfragenCards';

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
    id: 'quote-wir-schaffen-das',
    title: 'Wir schaffen das',
    category: 'quote',
    year: 2015,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Angela Merkel, Pressekonferenz zur Fluechtlingspolitik am 31.08..',
    hint: 'Bundeskanzlerin zur Migrationslage.',
    difficulty: 'leicht',
    sources: {
      text: '"Wir schaffen das."'
    },
    distractors: ['Praeventionskampagne, 1990er, Slogan der Jugendpraevention', 'Rihanna ft. Jay-Z', 'Justin Timberlake']
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
    }
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
    }
  },
  {
    id: 'song-rolling-in-the-deep',
    title: 'Rolling in the Deep',
    category: 'music',
    year: 2010,
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    }
  },
  {
    id: 'quote-mandela',
    title: 'It always seems impossible',
    category: 'quote',
    year: 2001,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Nelson Mandela.',
    hint: 'Soedafrika, Versuehnung.',
    difficulty: 'mittel',
    sources: {
      text: '"It always seems impossible until itue done."',
      textDe: 'Es erscheint immer unmueglich, bis es getan ist.'
    },
    distractors: ['Lothar Matthues, der Sky90-Runde als spoettischer Kommentar zur Spielanalyse', 'Michael Jackson', 'Michael Jackson']
  },
  {
    id: 'country-germany-flag',
    title: 'Flagge Deutschlands',
    category: 'country',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
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
    cue: 'Song anhören und einordnen.',
    answer: 'Backstreet Boys — Boyband-Evergreen.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Ronald Reagan, Rede am Brandenburger Tor, 12.06..',
    hint: 'US-Praesident fordert Oeffnung der Mauer.',
    difficulty: 'mittel',
    sources: {
      text: '"Mr. Gorbachev, tear down this wall!"',
      textDe: 'Herr Gorbatschow, reiueen Sie diese Mauer ein!'
    },
    distractors: ['Queen', 'Whitney Houston', 'Nirvana']
  },
  {
    id: 'quote-yes-we-can',
    title: 'Yes we can',
    category: 'quote',
    year: 2008,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Barack Obama, Wahlkampfrede.',
    hint: 'Slogan einer US-Praesidentschaftskampagne.',
    difficulty: 'leicht',
    sources: {
      text: '"Yes we can."',
      textDe: 'Ja, wir koennen das.'
    },
    distractors: ['Juergen Klopp, Interview "ber seinen Trainerjob', 'Bon Jovi', 'Ruf der Montagsdemos "Wir sind das Volk." auf den Straueen von Leipzig und anderen DDR-Stuedten']
  },
  {
    id: 'quote-ich-bin-ein-berliner',
    title: 'Ich bin ein Berliner',
    category: 'quote',
    year: 1963,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'John F. Kennedy, Rede in Berlin, 26.06..',
    hint: 'Kaltes Kriegs-Statement.',
    difficulty: 'mittel',
    sources: {
      text: '"Ich bin ein Berliner."'
    },
    distractors: ['Roger Murtaugh (Lethal Weapon), Buddy-Cop-Film als resignierter Kommentar', 'Neil Armstrong "Thatue one small step for man"" beim ersten Schritt auf die Mondoberflaeche', 'Queen']
  },
  {
    id: 'quote-houston-problem',
    title: "Houston, we've had a problem",
    category: 'quote',
    year: 1970,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Jack Swigert/Jim Lovell, Apollo-13-Mission, 13.04..',
    hint: 'Raumfahrt-Notfall.',
    difficulty: 'schwer',
    sources: {
      text: '"Houston, we have a problem!"',
      textDe: 'Houston, wir haben ein Problem!'
    },
    distractors: ['Bobby McFerrin', 'Michael Jackson', 'Peter Schilling']
  },
  {
    id: 'quote-one-small-step',
    title: 'One small step',
    category: 'quote',
    year: 1969,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Neil Armstrong, Mondlandung, 20.07..',
    hint: 'Erster Fuaebdruck auf dem Mond.',
    difficulty: 'leicht',
    sources: {
      text: '"Thatue one small step for man, one giant leap for mankind."',
      textDe: 'Das ist ein kleiner Schritt fuer einen Menschen, aber ein gewaltiger Sprung fuer die Menschheit.'
    },
    distractors: ['Roger Murtaugh (Lethal Weapon), Buddy-Cop-Film als resignierter Kommentar', 'Neil Armstrong "Thatue one small step for man"" beim ersten Schritt auf die Mondoberflaeche', 'Ronald Reagan, seiner Rede am Brandenburger Tor in Berlin']
  },
  {
    id: 'quote-fear-itself',
    title: 'Fear itself',
    category: 'quote',
    year: 1933,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Franklin D. Roosevelt, Antrittsrede, 04.03..',
    hint: 'Beginn des New Deal.',
    difficulty: 'mittel',
    sources: {
      text: '"The only thing we have to fear is fear itself."',
      textDe: 'Wir haben nichts zu fuerchten auueer der Furcht selbst.'
    },
    distractors: ['Albert Einstein zugeschrieben, oft erzuehlte Anekdote', 'CDU-Wahlkampfslogan, zentraler Claim im Bundestagswahlkampf', 'Britisches Motiv, Propagandaposter zu Beginn des Zweiten Weltkriegs']
  },
  {
    id: 'quote-stay-hungry',
    title: 'Stay hungry, stay foolish',
    category: 'quote',
    year: 2005,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Steve Jobs, Stanford Commencement Speech, 12.06..',
    hint: 'Abschlussrede an einer US-Eliteuni.',
    difficulty: 'leicht',
    sources: {
      text: '"Stay hungry, stay foolish."',
      textDe: 'Bleibt hungrig, bleibt tuericht.'
    },
    distractors: ['Bobby McFerrin', 'Eminem', 'Mark Ronson ft. Bruno Mars']
  },
  {
    id: 'quote-carpe-diem',
    title: 'Carpe Diem',
    category: 'quote',
    year: 1989,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Aus Dead Poets Society — Ermutigung, den Tag zu nutzen.',
    hint: 'Literaturlehrer inspiriert seine Klasse.',
    difficulty: 'mittel',
    sources: {
      text: '"Carpe diem. Seize the day, boys."',
      textDe: 'Carpe diem „ Nutzt den Tag, Jungs.'
    },
    distractors: ['Roger Murtaugh (Lethal Weapon), Buddy-Cop-Film als resignierter Kommentar', 'Jack Swigert/Jim Lovell, Apollo-13-Mission,', 'Queen']
  },
  {
    id: 'quote-hatte-hatte-fahrradkette',
    title: 'H"tte, h"tte, Fahrradkette',
    category: 'quote',
    year: 2013,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Lothar Matthues "Hoette, huette, Fahrradkette." in der Sky90-Runde als spoettischer Kommentar zur Spielanalyse.',
    hint: 'Fuueballweltmeister, TV-Experte.',
    difficulty: 'leicht',
    sources: { text: 'Hoette, huette, Fahrradkette.' },
    distractors: ['Rihanna ft. Jay-Z', 'Billie Eilish', 'Steve Jobs, Stanford Commencement Speech,']
  },
  {
    id: 'quote-mailand-oder-madrid',
    title: 'Mailand oder Madrid',
    category: 'quote',
    year: 1998,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Andreas Moeller "Mailand oder Madrid „ Hauptsache Italien." in einem TV-Interview nach einer internationalen Auslosung.',
    hint: 'Dortmunder Offensivspieler.',
    difficulty: 'leicht',
    sources: { text: 'Mailand oder Madrid „ Hauptsache Italien.' },
    distractors: ['Hape Kerkeling — Buchtitel und gefluegeltes Wort "ber seine Pilgerreise auf dem Jakobsweg', 'Patrick Star (SpongeBob), 2010er, einer Cartoon-Szene als selbstironischer Moment', 'Bobby McFerrin']
  },
  {
    id: 'quote-mr-gorbachev-tear-down-this-wall',
    title: 'Tear down this wall',
    category: 'quote',
    year: 1987,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Ronald Reagan "Mr. Gorbachev, tear down this wall!" in seiner Rede am Brandenburger Tor in Berlin.',
    hint: 'US-Prueident, Brandenburger Tor.',
    difficulty: 'mittel',
    sources: {
      text: 'Mr. Gorbachev, tear down this wall!',
      textDe: 'Herr Gorbatschow, reiueen Sie diese Mauer ein!'
    },
    distractors: ['Barack Obama, Wahlkampfrede', 'Led Zeppelin', 'Steve Jobs, Stanford Commencement Speech,']
  },
  {
    id: 'quote-houston-we-have-a-problem',
    title: 'Houston, we have a problem',
    category: 'quote',
    year: 1970,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Apollo-13-Besatzung "Houston, we have a problem." als Funkmeldung nach der Explosion des Sauerstofftanks.',
    hint: 'NASA, Raumfahrt.',
    difficulty: 'mittel',
    sources: {
      text: 'Houston, we have a problem!',
      textDe: 'Houston, wir haben ein Problem!'
    },
    distractors: ['Queen', 'Martin Luther King Jr., seiner Rede beim March on Washington fuer Buergerrechte', 'The Police']
  },
  {
    id: 'quote-ein-kleiner-schritt',
    title: 'One small step',
    category: 'quote',
    year: 1969,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Neil Armstrong "Thatue one small step for (a) man"" beim ersten Schritt auf die Mondoberflaeche.',
    hint: 'Mondlandung.',
    difficulty: 'leicht',
    sources: {
      text: "That's one small step for man, one giant leap for mankind.",
      textDe: 'Das ist ein kleiner Schritt fuer einen Menschen, aber ein gewaltiger Sprung fuer die Menschheit.'
    },
    distractors: ['Guns N\' Roses', 'Neil Armstrong, Mondlandung,', 'Ruf der Montagsdemos "Wir sind das Volk." auf den Straueen von Leipzig und anderen DDR-Stuedten']
  },
  {
    id: 'quote-wir-schaffen-das',
    title: 'Wir schaffen das',
    category: 'quote',
    year: 2015,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Angela Merkel "Wir schaffen das." in der Bundespressekonferenz zur Fluechtlingssituation.',
    hint: 'Bundeskanzlerin zur Fluechtlingskrise.',
    difficulty: 'leicht',
    sources: { text: 'Wir schaffen das.' }
  },
  {
    id: 'quote-ich-bin-dann-mal-weg',
    title: 'Ich bin dann mal weg',
    category: 'quote',
    year: 2006,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Hape Kerkeling "Ich bin dann mal weg." als Titel seines Jakobsweg-Reiseberichts.',
    hint: 'Autor, Jakobsweg.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dann mal weg.' }
  },
  {
    id: 'quote-zwei-seelen-wohnen',
    title: 'Zwei Seelen wohnen',
    category: 'quote',
    year: 1808,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Goethe, Faust I (ca. ) "Zwei Seelen wohnen, ach! in meiner Brust." im Monolog des Faust "ber innere Zerrissenheit.',
    hint: 'Deutscher Dichter, Faust.',
    difficulty: 'mittel',
    sources: { text: 'Zwei Seelen wohnen, ach! in meiner Brust.' }
  },
  {
    id: 'quote-sein-oder-nichtsein',
    title: 'Sein oder Nichtsein',
    category: 'quote',
    year: 1600,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'William Shakespeare, Hamlet (ca. ) "To be, or not to be"" als Auftakt von Hamlets beruehmtem Selbstgespruech.',
    hint: 'Englischer Dramatiker.',
    difficulty: 'mittel',
    sources: {
      text: 'To be, or not to be, that is the question.',
      textDe: 'Sein oder Nichtsein, das ist hier die Frage.'
    }
  },
  {
    id: 'quote-ich-denke-also-bin-ich',
    title: 'Cogito ergo sum',
    category: 'quote',
    year: 1637,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Ren„ Descartes "Cogito, ergo sum." im "Discours de la muethode" als Grundsatz des Rationalismus.',
    hint: 'Franzueischer Philosoph.',
    difficulty: 'mittel',
    sources: {
      text: 'Cogito, ergo sum.',
      textDe: 'Ich denke, also bin ich.'
    }
  },
  {
    id: 'quote-zeit-ist-geld',
    title: 'Zeit ist Geld',
    category: 'quote',
    year: 1748,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Benjamin Franklin "Time is money." in Aedvice to a Young Tradesman" als Ratschlag fuer Geschaeftsleute.',
    hint: 'US-Staatsmann, Erfinder.',
    difficulty: 'leicht',
    sources: {
      text: 'Time is money.',
      textDe: 'Zeit ist Geld.'
    }
  },
  {
    id: 'quote-ich-wei"-dass-ich-nichts-wei"',
    title: 'Sokrates Nichtwissen',
    category: 'quote',
    year: -400,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Sokrates zugeschrieben "Ich wei", dass ich nichts wei"." aus Platons Aepologie" als Bekenntnis philosophischer Demut.',
    hint: 'Antike Philosophie.',
    difficulty: 'mittel',
    sources: { text: 'Ich wei", dass ich nichts wei".' }
  },
  {
    id: 'quote-mach-dein-ding',
    title: 'Mach dein Ding',
    category: 'quote',
    year: 2010,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Herbert Gruenemeyer, 2014 "Mach dein Ding." als Refrain seines Songs und Lebensmotto auf Konzerten.',
    hint: 'Deutscher Musiker.',
    difficulty: 'leicht',
    sources: { text: 'Mach dein Ding.' },
    distractors: ['Luis Fonsi ft. Daddy Yankee', 'Nelson Mandela', 'Eminem']
  },
  {
    id: 'quote-ich-bin-dumm-und-das-ist-gut-so',
    title: 'Ich bin dumm',
    category: 'quote',
    year: 2010,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Patrick Star (SpongeBob), 2010er "Ich bin dumm, und das ist gut so." in einer Cartoon-Szene als selbstironischer Moment.',
    hint: 'Zeichentrick-Seestern.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dumm, und das ist gut so.' },
    distractors: ['Billie Eilish', 'Gotye', 'Angela Merkel, der Bundespressekonferenz zur Fluechtlingssituation']
  },
  {
    id: 'quote-ich-habe-einen-traum',
    title: 'I have a dream',
    category: 'quote',
    year: 1963,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Martin Luther King Jr. "I have a dream." in seiner Rede beim March on Washington fuer Buergerrechte.',
    hint: 'US-Boergerrechtler.',
    difficulty: 'leicht',
    sources: {
      text: 'I have a dream.',
      textDe: 'Ich habe einen Traum.'
    },
    distractors: ['Ronald Reagan, seiner Rede am Brandenburger Tor in Berlin', 'Eagles', 'Peter Schilling']
  },
  {
    id: 'quote-veni-vidi-vici',
    title: 'Veni vidi vici',
    category: 'quote',
    year: -47,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Julius Caesar, 47 v. Chr. "Veni, vidi, vici." im Bericht an den Senat nach dem Sieg bei Zela.',
    hint: 'Roemischer Feldherr.',
    difficulty: 'mittel',
    sources: {
      text: 'Veni, vidi, vici.',
      textDe: 'Ich kam, sah und siegte.'
    }
  },
  {
    id: 'quote-keine-experimente',
    title: 'Keine Experimente',
    category: 'quote',
    year: 1957,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'CDU-Wahlkampfslogan "Keine Experimente!" als zentraler Claim im Bundestagswahlkampf.',
    hint: 'Deutsche Nachkriegspolitik.',
    difficulty: 'mittel',
    sources: { text: 'Keine Experimente!' },
    distractors: ['Neil Armstrong, Mondlandung,', 'Franklin D. Roosevelt, Antrittsrede,', 'Neil Armstrong "Thatue one small step for man"" beim ersten Schritt auf die Mondoberflaeche']
  },
  {
    id: 'quote-wir-sind-das-volk',
    title: 'Wir sind das Volk',
    category: 'quote',
    year: 1989,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Ruf der Montagsdemos "Wir sind das Volk." auf den Straueen von Leipzig und anderen DDR-Stuedten.',
    hint: 'DDR, Wendezeit.',
    difficulty: 'mittel',
    sources: { text: 'Wir sind das Volk.' },
    distractors: ['John McClane', 'Heinz Schenk/Klaus Lage „ Aelles nur geliehen." als Schlagerzeile und Fernseh-Scherz', 'a-ha']
  },
  {
    id: 'quote-sag-mir-wo-die-blumen-sind',
    title: 'Wo sind die Blumen',
    category: 'quote',
    year: 1955,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Pete Seeger/Marlen Dietrich, 1950er "Sag mir, wo die Blumen sind"" als Antikriegslied in Konzerten.',
    hint: 'Antikriegslied.',
    difficulty: 'mittel',
    sources: { text: 'Sag mir, wo die Blumen sind.' },
    distractors: ['Apollo-13-Besatzung, Funkmeldung nach der Explosion des Sauerstofftanks', 'Neil Armstrong "Thatue one small step for man"" beim ersten Schritt auf die Mondoberflaeche', 'CDU-Wahlkampfslogan, zentraler Claim im Bundestagswahlkampf']
  },
  {
    id: 'quote-einmal-im-leben',
    title: 'Einmal im Leben',
    category: 'quote',
    year: 2006,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Juergen Klopp "Ich dachte, einmal im Leben muss ich das probieren." im Interview "ber seinen Trainerjob.',
    hint: 'Trainer, Fuueball.',
    difficulty: 'mittel',
    sources: { text: 'Einmal im Leben muss ich das probieren.' },
    distractors: ['Aus Dead Poets Society — Ermutigung, den Tag zu nutzen', 'Ed Sheeran', 'Michael Jackson']
  },
  {
    id: 'quote-die-lage-ist-ernst-aber-nicht-hoffnungslos',
    title: 'Ernst aber nicht hoffnungslos',
    category: 'quote',
    year: 1980,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Karl Valentin zugeschrieben "Die Lage ist hoffnungslos, aber nicht ernst." als kabarettistischer Wortdreher.',
    hint: 'Kabarett, Wortspiel.',
    difficulty: 'mittel',
    sources: { text: 'Die Lage ist hoffnungslos, aber nicht ernst.' },
    distractors: ['Hape Kerkeling — Buchtitel und gefluegeltes Wort "ber seine Pilgerreise auf dem Jakobsweg', 'Jack Swigert/Jim Lovell, Apollo-13-Mission,', 'Bon Jovi']
  },
  {
    id: 'quote-zwei-dinge-unendlich',
    title: 'Zwei Dinge sind unendlich',
    category: 'quote',
    year: 1920,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Albert Einstein zugeschrieben "Zwei Dinge sind unendlich: das Universum und die menschliche Dummheit"" als oft erzuehlte Anekdote.',
    hint: 'Physiker, Relativituet.',
    difficulty: 'mittel',
    sources: { text: 'Zwei Dinge sind unendlich: das Universum und die menschliche Dummheit; aber beim Universum bin ich mir nicht ganz sicher.' }
  },
  {
    id: 'quote-keep-calm',
    title: 'Keep calm',
    category: 'quote',
    year: 1939,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Britisches Motiv "Keep calm and carry on." als Propagandaposter zu Beginn des Zweiten Weltkriegs.',
    hint: 'Britische Propaganda WWII.',
    difficulty: 'leicht',
    sources: {
      text: 'Keep calm and carry on.',
      textDe: 'Bleib ruhig und mach weiter.'
    },
    distractors: ['Albert Einstein zugeschrieben, oft erzuehlte Anekdote', 'CDU-Wahlkampfslogan, zentraler Claim im Bundestagswahlkampf', 'Franklin D. Roosevelt, Antrittsrede,']
  },
  {
    id: 'quote-furcht-ist-der-weg-zur-dunklen-seite',
    title: 'Furcht zur dunklen Seite',
    category: 'quote',
    year: 1999,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Yoda "Furcht ist der Pfad zur dunklen Seite." in Star Wars: Episode I als Warnung an Anakin.',
    hint: 'Star Wars Jedi-Meister.',
    difficulty: 'leicht',
    sources: {
      text: 'Fear is the path to the dark side.',
      textDe: 'Furcht ist der Pfad zur dunklen Seite.'
    },
    distractors: ['Hape Kerkeling — Buchtitel und gefluegeltes Wort "ber seine Pilgerreise auf dem Jakobsweg', 'Nelson Mandela', 'Ronald Reagan, Rede am Brandenburger Tor,']
  },
  {
    id: 'quote-winter-is-coming',
    title: 'Winter is coming',
    category: 'quote',
    year: 2011,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Game of Thrones "Winter is coming." als Motto des Hauses Stark in der Pilotfolge.',
    hint: 'Haus Stark.',
    difficulty: 'leicht',
    sources: {
      text: 'Winter is coming.',
      textDe: 'Der Winter naht.'
    },
    distractors: ['Praeventionskampagne, 1990er, Slogan der Jugendpraevention', 'Angela Merkel, der Bundespressekonferenz zur Fluechtlingssituation', 'Herbert Gruenemeyer, 2014, Refrain seines Songs und Lebensmotto auf Konzerten']
  },
  {
    id: 'quote-valar-morghulis',
    title: 'Valar Morghulis',
    category: 'quote',
    year: 2012,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Game of Thrones "Valar Morghulis." als Gruueformel der Faceless Men in Braavos.',
    hint: 'Alte Sprache, jeder muss sterben.',
    difficulty: 'mittel',
    sources: {
      text: 'Valar Morghulis.',
      textDe: 'Alle Menschen muessen sterben.'
    },
    distractors: ['Helene Fischer', 'Angela Merkel, der Bundespressekonferenz zur Fluechtlingssituation', 'Pharrell Williams']
  },
  {
    id: 'quote-alles-nur-geliehen',
    title: 'Alles nur geliehen',
    category: 'quote',
    year: 1998,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Heinz Schenk/Klaus Lage „ Aelles nur geliehen." als Schlagerzeile und Fernseh-Scherz.',
    hint: 'Deutscher Schlager/Witz.',
    difficulty: 'leicht',
    sources: { text: 'Alles nur geliehen.' },
    distractors: ['Ruf der Montagsdemos "Wir sind das Volk." auf den Straueen von Leipzig und anderen DDR-Stuedten', 'Nirvana', 'Juergen Klopp "Wir muessen immer weiter machen." auf einer Pressekonferenz nach einem Spiel']
  },
  {
    id: 'quote-ich-habe-fertig',
    title: 'Ich habe fertig',
    category: 'quote',
    year: 1998,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Giovanni Trapattoni "Ich habe fertig." in der legendueren Bayern-Pressekonferenz.',
    hint: 'Trainer-Pressekonferenz Bayern.',
    difficulty: 'leicht',
    sources: { text: 'Ich habe fertig.' },
    distractors: ['Madonna', 'Ed Sheeran', 'Lothar Matthues, der Sky90-Runde als spoettischer Kommentar zur Spielanalyse']
  },
  {
    id: 'quote-flasche-leer',
    title: 'Flasche leer',
    category: 'quote',
    year: 1998,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Giovanni Trapattoni "Flasche leer!" in derselben Bayern-Pressekonferenz als Kritik am Team.',
    hint: 'Trainer-Pressekonferenz.',
    difficulty: 'leicht',
    sources: { text: 'Flasche leer!' },
    distractors: ['Mark Ronson ft. Bruno Mars', 'Barack Obama, Wahlkampfrede', 'Shawn Mendes & Camila Cabello']
  },
  {
    id: 'quote-ich-bin-zu-alt-fuer-diesen-mist',
    title: 'Zu alt für diesen Mist',
    category: 'quote',
    year: 1987,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Roger Murtaugh (Lethal Weapon) "Ioem too old for this"" im Buddy-Cop-Film als resignierter Kommentar.',
    hint: 'Actionfilm Buddy-Cop.',
    difficulty: 'leicht',
    sources: {
      text: "I'm too old for this shit.",
      textDe: 'Ich bin zu alt fuer diesen Mist.'
    },
    distractors: ['Whitney Houston', 'Madonna', 'Queen']
  },
  {
    id: 'quote-ich-bin-dein-vater',
    title: 'Ich bin dein Vater',
    category: 'quote',
    year: 1980,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Darth Vader "No, I am your father." im Duell auf Cloud City (Star Wars Episode V).',
    hint: 'Star Wars Episode V.',
    difficulty: 'leicht',
    sources: {
      text: 'No, I am your father.',
      textDe: 'Nein, ich bin dein Vater.'
    },
    distractors: ['Journey', 'Steve Jobs, Stanford Commencement Speech,', 'Giovanni Trapattoni, der legendueren Bayern-Pressekonferenz']
  },
  {
    id: 'quote-immer-weiter',
    title: 'Immer weiter',
    category: 'quote',
    year: 2014,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Juergen Klopp "Wir muessen immer weiter machen." auf einer Pressekonferenz nach einem Spiel.',
    hint: 'Trainer, Bundesliga.',
    difficulty: 'leicht',
    sources: { text: 'Wir muessen immer weiter machen.' },
    distractors: ['OneRepublic', 'Whitney Houston', 'Lothar Matthues, der Sky90-Runde als spoettischer Kommentar zur Spielanalyse']
  },
  {
    id: 'quote-keine-macht-den-drogen',
    title: 'Keine Macht den Drogen',
    category: 'quote',
    year: 1990,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Praeventionskampagne, 1990er "Keine Macht den Drogen." als Slogan der Jugendpraevention.',
    hint: 'Jugendkampagne.',
    difficulty: 'mittel',
    sources: { text: 'Keine Macht den Drogen.' },
    distractors: ['Journey', 'Shawn Mendes & Camila Cabello', 'Karl Valentin zugeschrieben, kabarettistischer Wortdreher']
  },
  {
    id: 'quote-die-rente-ist-sicher',
    title: 'Die Rente ist sicher',
    category: 'quote',
    year: 1986,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Norbert Bluem "Die Rente ist sicher." in einer Pressekonferenz zur Rentenreform.',
    hint: 'Bundesarbeitsminister.',
    difficulty: 'mittel',
    sources: { text: 'Die Rente ist sicher.' },
    distractors: ['Praeventionskampagne, 1990er, Slogan der Jugendpraevention', 'Britney Spears', 'Peter Schilling']
  },
  {
    id: 'quote-ich-bin-dann-mal-weg-zitat',
    title: 'Ich bin dann mal weg (Zitat)',
    category: 'quote',
    year: 2006,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Hape Kerkeling — Buchtitel und gefluegeltes Wort "ber seine Pilgerreise auf dem Jakobsweg.',
    hint: 'Comedian, Jakobsweg.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dann mal weg.' },
    distractors: ['Luis Fonsi ft. Daddy Yankee', 'Juergen Klopp "Wir muessen immer weiter machen." auf einer Pressekonferenz nach einem Spiel', 'Aus Dead Poets Society — Ermutigung, den Tag zu nutzen']
  },
  {
    id: 'flag-de',
    title: 'Flagge Deutschland',
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
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
    category: 'country',
    year: 1937,
    cue: 'Zu welchem Land gehört diese Flagge und wann wurde es gegründet?',
    answer: 'Niederlande „ Rot, Wei", Blau.',
    hint: 'Waagerechte Tricolore.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/nl.png'
    }
  },
  // 100 neue Zitate aus Filmen, Liedern und bekannten Persönlichkeiten
  {
    id: 'quote-may-the-force',
    title: 'May the Force be with you',
    category: 'quote',
    year: 1977,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Star Wars: Episode IV – Ikonischer Satz der Saga.',
    hint: 'Science-Fiction-Klassiker.',
    difficulty: 'leicht',
    sources: {
      text: '"May the Force be with you."',
      textDe: 'Moege die Macht mit dir sein.'
    }
  },
  {
    id: 'quote-im-gonna-make-him',
    title: 'I\'m gonna make him an offer',
    category: 'quote',
    year: 1972,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Der Pate (The Godfather) – Don Vito Corleone.',
    hint: 'Mafia-Klassiker von Francis Ford Coppola.',
    difficulty: 'mittel',
    sources: {
      text: '"I\'m gonna make him an offer he can\'t refuse."',
      textDe: 'Ich werde ihm ein Angebot machen, das er nicht ablehnen kann.'
    }
  },
  {
    id: 'quote-heres-looking-at-you',
    title: 'Here\'s looking at you, kid',
    category: 'quote',
    year: 1942,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Casablanca – Rick Blaine (Humphrey Bogart).',
    hint: 'Romantischer Kriegsfilm.',
    difficulty: 'schwer',
    sources: {
      text: '"Here\'s looking at you, kid."',
      textDe: 'Ich seh dir in die Augen, Kleines.'
    }
  },
  {
    id: 'quote-life-is-like-a-box',
    title: 'Life is like a box of chocolates',
    category: 'quote',
    year: 1994,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Forrest Gump – Forrest Gump (Tom Hanks).',
    hint: 'Oscar-praemiertes Drama.',
    difficulty: 'leicht',
    sources: {
      text: '"Life is like a box of chocolates. You never know what you\'re gonna get."',
      textDe: 'Das Leben ist wie eine Schachtel Pralinen, man weiue nie, was man kriegt.'
    }
  },
  {
    id: 'quote-ill-be-back',
    title: 'I\'ll be back',
    category: 'quote',
    year: 1984,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Terminator – T-800 (Arnold Schwarzenegger).',
    hint: 'Science-Fiction-Action mit Zeitreisen.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'ll be back."',
      textDe: 'Ich komme wieder.'
    }
  },
  {
    id: 'quote-you-talking-to-me',
    title: 'You talking to me?',
    category: 'quote',
    year: 1976,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Taxi Driver – Travis Bickle (Robert De Niro).',
    hint: 'Psychologisches Drama von Martin Scorsese.',
    difficulty: 'mittel',
    sources: {
      text: '"You talking to me?"',
      textDe: 'Redest du mit mir?'
    }
  },
  {
    id: 'quote-i-see-dead-people',
    title: 'I see dead people',
    category: 'quote',
    year: 1999,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'The Sixth Sense – Cole Sear (Haley Joel Osment).',
    hint: 'Uebernatuerlicher Thriller mit Twist.',
    difficulty: 'leicht',
    sources: {
      text: '"I see dead people."',
      textDe: 'Ich sehe tote Menschen.'
    }
  },
  {
    id: 'quote-frankly-my-dear',
    title: 'Frankly, my dear',
    category: 'quote',
    year: 1939,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Vom Winde verweht – Rhett Butler (Clark Gable).',
    hint: 'Historisches Epos um den amerikanischen Buergerkrieg.',
    difficulty: 'schwer',
    sources: {
      text: '"Frankly, my dear, I don\'t give a damn."',
      textDe: 'Ehrlich gesagt, meine Liebe, ist mir das verdammt egal.'
    }
  },
  {
    id: 'quote-houston-we-have-a-problem',
    title: 'Houston, we have a problem',
    category: 'quote',
    year: 1995,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Apollo 13 (Film) – Jim Lovell (Tom Hanks).',
    hint: 'Raumfahrtdrama basierend auf wahren Ereignissen.',
    difficulty: 'mittel',
    sources: {
      text: '"Houston, we have a problem."',
      textDe: 'Houston, wir haben ein Problem.'
    }
  },
  {
    id: 'quote-you-cant-handle-the-truth',
    title: 'You can\'t handle the truth!',
    category: 'quote',
    year: 1992,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'A Few Good Men – Colonel Jessup (Jack Nicholson).',
    hint: 'Gerichtsdrama im Militaerkontext.',
    difficulty: 'mittel',
    sources: {
      text: '"You can\'t handle the truth!"',
      textDe: 'Sie vertragen die Wahrheit doch gar nicht!'
    }
  },
  {
    id: 'quote-nobody-puts-baby',
    title: 'Nobody puts Baby in a corner',
    category: 'quote',
    year: 1987,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Dirty Dancing – Johnny Castle (Patrick Swayze).',
    hint: 'Tanz- und Liebesfilm der 80er.',
    difficulty: 'leicht',
    sources: {
      text: '"Nobody puts Baby in a corner."',
      textDe: 'Niemand steckt Baby in eine Ecke.'
    }
  },
  {
    id: 'quote-winter-is-coming',
    title: 'Winter is coming',
    category: 'quote',
    year: 2011,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Game of Thrones – Motto der Stark-Familie.',
    hint: 'Fantasy-Serie basierend auf Buechern von George R. R. Martin.',
    difficulty: 'leicht',
    sources: {
      text: '"Winter is coming."',
      textDe: 'Der Winter naht.'
    }
  },
  {
    id: 'quote-i-am-the-one-who-knocks',
    title: 'I am the one who knocks',
    category: 'quote',
    year: 2012,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Breaking Bad – Walter White (Bryan Cranston).',
    hint: 'Drogendrama ueber einen Chemielehrer.',
    difficulty: 'mittel',
    sources: {
      text: '"I am not in danger, Skyler. I am the danger. I am the one who knocks!"',
      textDe: 'Ich bin nicht in Gefahr, Skyler. Ich bin die Gefahr. Ich bin der, der anklopft!'
    }
  },
  {
    id: 'quote-thats-what-she-said',
    title: 'That\'s what she said',
    category: 'quote',
    year: 2005,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'The Office (US) – Michael Scott (Steve Carell).',
    hint: 'Mockumentary-Comedy im Buero.',
    difficulty: 'leicht',
    sources: {
      text: '"That\'s what she said!"',
      textDe: 'Das hat sie gesagt!'
    }
  },
  {
    id: 'quote-how-you-doin',
    title: 'How you doin\'?',
    category: 'quote',
    year: 1994,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Friends – Joey Tribbiani (Matt LeBlanc).',
    hint: 'Sitcom ueber sechs Freunde in New York.',
    difficulty: 'leicht',
    sources: {
      text: '"How you doin\'?"',
      textDe: 'Wie geht\'s dir?'
    }
  },
  {
    id: 'quote-im-the-king-of-the-world',
    title: 'I\'m the king of the world!',
    category: 'quote',
    year: 1997,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Titanic – Jack Dawson (Leonardo DiCaprio).',
    hint: 'Romantisches Drama auf der Titanic.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'m the king of the world!"',
      textDe: 'Ich bin der Koenig der Welt!'
    }
  },
  {
    id: 'quote-i-am-your-father',
    title: 'I am your father',
    category: 'quote',
    year: 1980,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Star Wars: Episode V – Darth Vader.',
    hint: 'Beruehmter Plot Twist in Star Wars.',
    difficulty: 'leicht',
    sources: {
      text: '"No, I am your father."',
      textDe: 'Nein, ich bin dein Vater.'
    }
  },
  {
    id: 'quote-why-so-serious',
    title: 'Why so serious?',
    category: 'quote',
    year: 2008,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'The Dark Knight – Joker (Heath Ledger).',
    hint: 'Batman-Film mit unvergesslicher Schurken-Performance.',
    difficulty: 'leicht',
    sources: {
      text: '"Why so serious?"',
      textDe: 'Warum so ernst?'
    }
  },
  {
    id: 'quote-keep-your-friends-close',
    title: 'Keep your friends close',
    category: 'quote',
    year: 1974,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Der Pate II – Michael Corleone.',
    hint: 'Fortsetzung des Mafia-Epos.',
    difficulty: 'mittel',
    sources: {
      text: '"Keep your friends close, but your enemies closer."',
      textDe: 'Halte deine Freunde nah, aber deine Feinde noch naeher.'
    }
  },
  {
    id: 'quote-say-hello-to-my-little-friend',
    title: 'Say hello to my little friend',
    category: 'quote',
    year: 1983,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Scarface – Tony Montana (Al Pacino).',
    hint: 'Gangsterfilm ueber den Aufstieg und Fall eines Drogenbosses.',
    difficulty: 'mittel',
    sources: {
      text: '"Say hello to my little friend!"',
      textDe: 'Sag hallo zu meinem kleinen Freund!'
    }
  },
  {
    id: 'quote-i-feel-the-need',
    title: 'I feel the need for speed',
    category: 'quote',
    year: 1986,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Top Gun – Maverick und Goose.',
    hint: 'Action-Film ueber Kampfpiloten.',
    difficulty: 'mittel',
    sources: {
      text: '"I feel the need... the need for speed!"',
      textDe: 'Ich brauche... ich brauche Geschwindigkeit!'
    }
  },
  {
    id: 'quote-you-had-me-at-hello',
    title: 'You had me at hello',
    category: 'quote',
    year: 1996,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Jerry Maguire – Dorothy Boyd (Renée Zellweger).',
    hint: 'Romantisches Drama ueber einen Sportagenten.',
    difficulty: 'mittel',
    sources: {
      text: '"You had me at hello."',
      textDe: 'Du hattest mich bei Hallo.'
    }
  },
  {
    id: 'quote-there-is-no-spoon',
    title: 'There is no spoon',
    category: 'quote',
    year: 1999,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'The Matrix – Spoon Boy.',
    hint: 'Science-Fiction ueber simulierte Realitaet.',
    difficulty: 'leicht',
    sources: {
      text: '"There is no spoon."',
      textDe: 'Es gibt keinen Loeffel.'
    }
  },
  {
    id: 'quote-im-walking-here',
    title: 'I\'m walking here!',
    category: 'quote',
    year: 1969,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Midnight Cowboy – Ratso Rizzo (Dustin Hoffman).',
    hint: 'Drama ueber zwei Auueenseiter in New York.',
    difficulty: 'schwer',
    sources: {
      text: '"I\'m walking here!"',
      textDe: 'Ich gehe hier!'
    }
  },
  {
    id: 'quote-show-me-the-money',
    title: 'Show me the money',
    category: 'quote',
    year: 1996,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Jerry Maguire – Rod Tidwell (Cuba Gooding Jr.).',
    hint: 'Sportagenten-Drama.',
    difficulty: 'mittel',
    sources: {
      text: '"Show me the money!"',
      textDe: 'Zeig mir das Geld!'
    }
  },
  {
    id: 'quote-yippee-ki-yay',
    title: 'Yippee-ki-yay',
    category: 'quote',
    year: 1988,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Stirb langsam – John McClane (Bruce Willis).',
    hint: 'Action-Thriller in einem Hochhaus.',
    difficulty: 'leicht',
    sources: {
      text: '"Yippee-ki-yay, motherfucker!"',
      textDe: 'Yippee-ki-yay, Schweinebacke!'
    },
    distractors: ['Neil Armstrong "Thatue one small step for man"" beim ersten Schritt auf die Mondoberflaeche', 'Hape Kerkeling — Buchtitel und gefluegeltes Wort "ber seine Pilgerreise auf dem Jakobsweg', 'Heinz Schenk/Klaus Lage „ Aelles nur geliehen." als Schlagerzeile und Fernseh-Scherz']
  },
  {
    id: 'quote-you-shall-not-pass',
    title: 'You shall not pass',
    category: 'quote',
    year: 2001,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Der Herr der Ringe: Die Gefahrten – Gandalf.',
    hint: 'Fantasy-Epos von Peter Jackson.',
    difficulty: 'leicht',
    sources: {
      text: '"You shall not pass!"',
      textDe: 'Du kommst hier nicht vorbei!'
    }
  },
  {
    id: 'quote-my-precious',
    title: 'My precious',
    category: 'quote',
    year: 2002,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Der Herr der Ringe: Die zwei Türme – Gollum.',
    hint: 'Fantasy-Fortsetzung mit besessener Kreatur.',
    difficulty: 'leicht',
    sources: {
      text: '"My precious!"',
      textDe: 'Mein Schatz!'
    }
  },
  {
    id: 'quote-i-volunteer-as-tribute',
    title: 'I volunteer as tribute',
    category: 'quote',
    year: 2012,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Die Tribute von Panem – Katniss Everdeen.',
    hint: 'Dystopischer Jugendfilm.',
    difficulty: 'leicht',
    sources: {
      text: '"I volunteer as tribute!"',
      textDe: 'Ich melde mich freiwillig als Tribut!'
    }
  },
  {
    id: 'quote-always',
    title: 'Always (Snape)',
    category: 'quote',
    year: 2011,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Harry Potter und die Heiligtümer des Todes – Teil 2 – Severus Snape.',
    hint: 'Abschluss der Harry Potter-Filmreihe.',
    difficulty: 'leicht',
    sources: {
      text: 'Aelways."',
      textDe: 'Immer.'
    }
  },
  {
    id: 'quote-just-keep-swimming',
    title: 'Just keep swimming',
    category: 'quote',
    year: 2003,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Findet Nemo – Dory.',
    hint: 'Pixar-Animationsfilm ueber einen Clownfisch.',
    difficulty: 'leicht',
    sources: {
      text: '"Just keep swimming, just keep swimming."',
      textDe: 'Einfach schwimmen, einfach schwimmen.'
    }
  },
  {
    id: 'quote-to-infinity-and-beyond',
    title: 'To infinity and beyond',
    category: 'quote',
    year: 1995,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Toy Story – Buzz Lightyear.',
    hint: 'Erster vollstaendig computeranimierter Spielfilm.',
    difficulty: 'leicht',
    sources: {
      text: '"To infinity and beyond!"',
      textDe: 'Bis zur Unendlichkeit und noch viel weiter!'
    }
  },
  {
    id: 'quote-run-forrest-run',
    title: 'Run, Forrest, run!',
    category: 'quote',
    year: 1994,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Forrest Gump – Jenny Curran.',
    hint: 'Drama mit Tom Hanks.',
    difficulty: 'leicht',
    sources: {
      text: '"Run, Forrest, run!"',
      textDe: 'Lauf, Forrest, lauf!'
    }
  },
  {
    id: 'quote-im-gonna-live-forever',
    title: 'I\'m gonna live forever',
    category: 'quote',
    year: 1980,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    'answer': 'Fame (Song) – Irene Cara.',
    hint: 'Titelsong des gleichnamigen Films.',
    difficulty: 'mittel',
    sources: {
      text: '"I\'m gonna live forever, I\'m gonna learn how to fly."',
      textDe: 'Ich werde ewig leben, ich werde lernen zu fliegen.'
    }
  },
  {
    id: 'quote-what-is-love',
    title: 'What is love?',
    category: 'quote',
    year: 1993,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'What Is Love – Haddaway.',
    hint: 'Eurodance-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"What is love? Baby don\'t hurt me, don\'t hurt me, no more."',
      textDe: 'Was ist Liebe? Baby, tu mir nicht weh, tu mir nicht weh, nicht mehr.'
    },
    distractors: ['Nelson Mandela', 'Roger Murtaugh (Lethal Weapon), Buddy-Cop-Film als resignierter Kommentar', 'Darth Vader, Duell auf Cloud City (Star Wars Episode V)']
  },
  {
    id: 'quote-sweet-child-o-mine',
    title: 'Sweet Child O\' Mine',
    category: 'quote',
    year: 1987,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Sweet Child O\' Mine – Guns N\' Roses.',
    hint: 'Hard-Rock-Klassiker.',
    difficulty: 'mittel',
    sources: {
      text: '"Where do we go now?"',
      textDe: 'Wo gehen wir jetzt hin?'
    },
    distractors: ['The Killers', 'Led Zeppelin', 'The Beatles']
  },
  {
    id: 'quote-i-want-to-break-free',
    title: 'I Want to Break Free',
    category: 'quote',
    year: 1984,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'I Want to Break Free – Queen.',
    hint: 'Rock-Hymne ueber Befreiung.',
    difficulty: 'mittel',
    sources: {
      text: '"I want to break free."',
      textDe: 'Ich will frei sein.'
    },
    distractors: ['Neil Armstrong, Mondlandung,', 'Britney Spears', 'Yoda, Star Wars: Episode I als Warnung an Anakin']
  },
  {
    id: 'quote-dont-stop-believin',
    title: 'Don\'t Stop Believin\'',
    category: 'quote',
    year: 1981,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Don\'t Stop Believin\' – Journey.',
    hint: 'Arena-Rock-Hymne.',
    difficulty: 'leicht',
    sources: {
      text: '"Don\'t stop believin\', hold on to that feelin\'."',
      textDe: 'Hoer nicht auf zu glauben, halt an diesem Gefuehl fest.'
    },
    distractors: ['Neil Armstrong, Mondlandung,', 'Spice Girls', 'Giovanni Trapattoni, der legendueren Bayern-Pressekonferenz']
  },
  {
    id: 'quote-imagine-all-the-people',
    title: 'Imagine',
    category: 'quote',
    year: 1971,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Imagine – John Lennon.',
    hint: 'Friedenshymne eines Beatles.',
    difficulty: 'leicht',
    sources: {
      text: '"Imagine all the people, living life in peace."',
      textDe: 'Stell dir vor, alle Menschen leben in Frieden.'
    },
    distractors: ['Queen', 'Led Zeppelin', 'Eagles']
  },
  {
    id: 'quote-we-are-the-champions',
    title: 'We Are the Champions',
    category: 'quote',
    year: 1977,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'We Are the Champions – Queen.',
    hint: 'Siegeshymne im Sport.',
    difficulty: 'leicht',
    sources: {
      text: '"We are the champions, my friends."',
      textDe: 'Wir sind die Meister, meine Freunde.'
    },
    distractors: ['The Police', 'Pete Seeger/Marlen Dietrich, 1950er, Antikriegslied in Konzerten', 'Whitney Houston']
  },
  {
    id: 'quote-every-breath-you-take',
    title: 'Every Breath You Take',
    category: 'quote',
    year: 1983,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Every Breath You Take – The Police.',
    hint: 'Song ueber Besessenheit.',
    difficulty: 'mittel',
    sources: {
      text: '"Every breath you take, every move you make, I\'ll be watching you."',
      textDe: 'Jeden Atemzug, den du nimmst, jede Bewegung, die du machst, ich werde dich beobachten.'
    },
    distractors: ['Martin Luther King Jr., seiner Rede beim March on Washington fuer Buergerrechte', 'The Killers', 'Nirvana']
  },
  {
    id: 'quote-smells-like-teen-spirit-lyric',
    title: 'Smells Like Teen Spirit (Lyric)',
    category: 'quote',
    year: 1991,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Smells Like Teen Spirit – Nirvana.',
    hint: 'Grunge-Hymne der 90er.',
    difficulty: 'mittel',
    sources: {
      text: '"Here we are now, entertain us."',
      textDe: 'Hier sind wir jetzt, unterhalte uns.'
    },
    distractors: ['Lil Nas X', 'Whitney Houston', 'The Weeknd']
  },
  {
    id: 'quote-livin-on-a-prayer',
    title: 'Livin\' on a Prayer',
    category: 'quote',
    year: 1986,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Livin\' on a Prayer – Bon Jovi.',
    hint: 'Rock-Anthem der 80er.',
    difficulty: 'leicht',
    sources: {
      text: '"Whoa, we\'re halfway there, whoa-oh, livin\' on a prayer."',
      textDe: 'Whoa, wir sind auf halbem Weg, whoa-oh, leben auf einem Gebet.'
    },
    distractors: ['Britney Spears', 'Britney Spears', 'Norbert Bluem, einer Pressekonferenz zur Rentenreform']
  },
  {
    id: 'quote-lose-yourself',
    title: 'Lose Yourself',
    category: 'quote',
    year: 2002,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Lose Yourself – Eminem.',
    hint: 'Rap-Song aus dem Film 8 Mile.',
    difficulty: 'leicht',
    sources: {
      text: '"You only get one shot, do not miss your chance to blow."',
      textDe: 'Du hast nur eine Chance, verpasse sie nicht.'
    },
    distractors: ['Game of Thrones, Motto des Hauses Stark in der Pilotfolge', 'Angela Merkel, der Bundespressekonferenz zur Fluechtlingssituation', 'Ed Sheeran']
  },
  {
    id: 'quote-hey-jude',
    title: 'Hey Jude',
    category: 'quote',
    year: 1968,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Hey Jude – The Beatles.',
    hint: 'Laengster Beatles-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"Hey Jude, don\'t make it bad, take a sad song and make it better."',
      textDe: 'Hey Jude, mach es nicht schlecht, nimm ein trauriges Lied und mach es besser.'
    },
    distractors: ['Queen', 'Madonna', 'Roger Murtaugh (Lethal Weapon), Buddy-Cop-Film als resignierter Kommentar']
  },
  {
    id: 'quote-hotel-california',
    title: 'Hotel California',
    category: 'quote',
    year: 1976,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Hotel California – Eagles.',
    hint: 'Klassischer Rock ueber den American Dream.',
    difficulty: 'mittel',
    sources: {
      text: '"You can check out any time you like, but you can never leave."',
      textDe: 'Du kannst auschecken, wann du willst, aber du kannst niemals gehen.'
    },
    distractors: ['Apollo-13-Besatzung, Funkmeldung nach der Explosion des Sauerstofftanks', 'Bobby McFerrin', 'Heinz Schenk/Klaus Lage „ Aelles nur geliehen." als Schlagerzeile und Fernseh-Scherz']
  },
  {
    id: 'quote-stairway-to-heaven',
    title: 'Stairway to Heaven',
    category: 'quote',
    year: 1971,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Stairway to Heaven – Led Zeppelin.',
    hint: 'Epischer Rock-Song.',
    difficulty: 'mittel',
    sources: {
      text: 'Aend she\'s buying a stairway to heaven."',
      textDe: 'Und sie kauft eine Treppe zum Himmel.'
    },
    distractors: ['Guns N\' Roses', 'Queen', 'Ruf der Montagsdemos "Wir sind das Volk." auf den Straueen von Leipzig und anderen DDR-Stuedten']
  },
  {
    id: 'quote-somebody-to-love',
    title: 'Somebody to Love',
    category: 'quote',
    year: 1976,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Somebody to Love – Queen.',
    hint: 'Gospel-beeinflusster Rock.',
    difficulty: 'mittel',
    sources: {
      text: '"Can anybody find me somebody to love?"',
      textDe: 'Kann mir jemand jemanden finden, den ich lieben kann?'
    },
    distractors: ['The Police', 'Guns N\' Roses', 'Whitney Houston']
  },
  {
    id: 'quote-billie-jean-lyric',
    title: 'Billie Jean (Lyric)',
    category: 'quote',
    year: 1982,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Billie Jean – Michael Jackson.',
    hint: 'King of Pop.',
    difficulty: 'leicht',
    sources: {
      text: '"Billie Jean is not my lover, she\'s just a girl who claims that I am the one."',
      textDe: 'Billie Jean ist nicht meine Geliebte, sie ist nur ein Maedchen, das behauptet, ich sei der Eine.'
    },
    distractors: ['Madonna', 'Nena', 'Martin Luther King Jr., seiner Rede beim March on Washington fuer Buergerrechte']
  },
  {
    id: 'quote-thriller',
    title: 'Thriller',
    category: 'quote',
    year: 1982,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Thriller – Michael Jackson.',
    hint: 'Meistverkauftes Album aller Zeiten.',
    difficulty: 'leicht',
    sources: {
      text: '"\'Cause this is thriller, thriller night."',
      textDe: 'Denn das ist Thriller, Thriller-Nacht.'
    },
    distractors: ['Karl Valentin zugeschrieben, kabarettistischer Wortdreher', 'Madonna', 'Jack Swigert/Jim Lovell, Apollo-13-Mission,']
  },
  {
    id: 'quote-like-a-virgin',
    title: 'Like a Virgin',
    category: 'quote',
    year: 1984,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Like a Virgin – Madonna.',
    hint: 'Pop-Ikone der 80er.',
    difficulty: 'leicht',
    sources: {
      text: '"Like a virgin, touched for the very first time."',
      textDe: 'Wie eine Jungfrau, zum allerersten Mal beruehrt.'
    },
    distractors: ['Angela Merkel, der Bundespressekonferenz zur Fluechtlingssituation', 'Smash Mouth', 'Ronald Reagan, Rede am Brandenburger Tor,']
  },
  {
    id: 'quote-i-will-always-love-you',
    title: 'I Will Always Love You',
    category: 'quote',
    year: 1992,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'I Will Always Love You – Whitney Houston.',
    hint: 'Power-Ballade aus The Bodyguard.',
    difficulty: 'leicht',
    sources: {
      text: 'Aend I will always love you."',
      textDe: 'Und ich werde dich immer lieben.'
    },
    distractors: ['Praeventionskampagne, 1990er, Slogan der Jugendpraevention', 'Journey', 'Coldplay']
  },
  {
    id: 'quote-rolling-in-the-deep-lyric',
    title: 'Rolling in the Deep (Lyric)',
    category: 'quote',
    year: 2010,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Rolling in the Deep – Adele.',
    hint: 'Soul-Pop-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"We could have had it all, rolling in the deep."',
      textDe: 'Wir haetten alles haben koennen, rolling in the deep.'
    },
    distractors: ['Imagine Dragons', 'Angela Merkel, Pressekonferenz zur Fluechtlingspolitik am', 'Billie Eilish']
  },
  {
    id: 'quote-somebody-that-i-used-to-know',
    title: 'Somebody That I Used to Know',
    category: 'quote',
    year: 2011,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Somebody That I Used to Know – Gotye.',
    hint: 'Indie-Pop-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"Now you\'re just somebody that I used to know."',
      textDe: 'Jetzt bist du nur noch jemand, den ich kannte.'
    },
    distractors: ['Game of Thrones, Motto des Hauses Stark in der Pilotfolge', 'Britney Spears', 'Shawn Mendes & Camila Cabello']
  },
  {
    id: 'quote-happy',
    title: 'Happy',
    category: 'quote',
    year: 2013,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Happy – Pharrell Williams.',
    hint: 'Feelgood-Song aus Despicable Me 2.',
    difficulty: 'leicht',
    sources: {
      text: '"Because I\'m happy, clap along if you feel like a room without a roof."',
      textDe: 'Weil ich gluecklich bin, klatsch mit, wenn du dich fuehlst wie ein Raum ohne Dach.'
    },
    distractors: ['Imagine Dragons', 'Giovanni Trapattoni, der legendueren Bayern-Pressekonferenz', 'Nirvana']
  },
  {
    id: 'quote-uptown-funk',
    title: 'Uptown Funk',
    category: 'quote',
    year: 2014,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Uptown Funk – Mark Ronson ft. Bruno Mars.',
    hint: 'Funk-Pop-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"Don\'t believe me, just watch."',
      textDe: 'Glaub mir nicht, schau einfach zu.'
    },
    distractors: ['Hape Kerkeling — Buchtitel und gefluegeltes Wort "ber seine Pilgerreise auf dem Jakobsweg', 'Shawn Mendes & Camila Cabello', 'Lothar Matthues, der Sky90-Runde als spoettischer Kommentar zur Spielanalyse']
  },
  {
    id: 'quote-shape-of-you',
    title: 'Shape of You',
    category: 'quote',
    year: 2017,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Shape of You – Ed Sheeran.',
    hint: 'Meistgestreamter Song auf Spotify.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'m in love with the shape of you."',
      textDe: 'Ich bin verliebt in deine Form.'
    },
    distractors: ['Luis Fonsi ft. Daddy Yankee', 'Angela Merkel, der Bundespressekonferenz zur Fluechtlingssituation', 'Adele']
  },
  {
    id: 'quote-thinking-out-loud',
    title: 'Thinking Out Loud',
    category: 'quote',
    year: 2014,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Thinking Out Loud – Ed Sheeran.',
    hint: 'Romantische Ballade.',
    difficulty: 'leicht',
    sources: {
      text: '"When your legs don\'t work like they used to before."',
      textDe: 'Wenn deine Beine nicht mehr so funktionieren wie frueher.'
    },
    distractors: ['Patrick Star (SpongeBob), 2010er, einer Cartoon-Szene als selbstironischer Moment', 'Game of Thrones, Gruueformel der Faceless Men in Braavos', 'Gotye']
  },
  {
    id: 'quote-despacito',
    title: 'Despacito',
    category: 'quote',
    year: 2017,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Despacito – Luis Fonsi ft. Daddy Yankee.',
    hint: 'Lateinamerikanischer Welthit.',
    difficulty: 'leicht',
    sources: {
      text: '"Despacito, quiero respirar tu cuello despacito."',
      textDe: 'Langsam, ich will langsam deinen Hals atmen.'
    },
    distractors: ['Smash Mouth', 'Britney Spears', 'Spice Girls']
  },
  {
    id: 'quote-old-town-road',
    title: 'Old Town Road',
    category: 'quote',
    year: 2019,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Old Town Road – Lil Nas X.',
    hint: 'Country-Rap-Crossover.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'m gonna take my horse to the old town road."',
      textDe: 'Ich nehme mein Pferd zur alten Stadtstrauee.'
    },
    distractors: ['Angela Merkel, Pressekonferenz zur Fluechtlingspolitik am', 'Game of Thrones, Motto des Hauses Stark in der Pilotfolge', 'Justin Timberlake']
  },
  {
    id: 'quote-blinding-lights',
    title: 'Blinding Lights',
    category: 'quote',
    year: 2019,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Blinding Lights – The Weeknd.',
    hint: 'Synthwave-Pop-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"I said, ooh, I\'m blinded by the lights."',
      textDe: 'Ich sagte, ooh, ich bin geblendet von den Lichtern.'
    },
    distractors: ['Idina Menzel', 'Ed Sheeran', 'Lothar Matthues, der Sky90-Runde als spoettischer Kommentar zur Spielanalyse']
  },
  {
    id: 'quote-bad-guy',
    title: 'bad guy',
    category: 'quote',
    year: 2019,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'bad guy – Billie Eilish.',
    hint: 'Alternative Pop von Billie Eilish.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'m the bad guy, duh."',
      textDe: 'Ich bin der Boesewicht, duh.'
    },
    distractors: ['Giovanni Trapattoni, derselben Bayern-Pressekonferenz als Kritik am Team', 'Heinz Schenk/Klaus Lage „ Aelles nur geliehen." als Schlagerzeile und Fernseh-Scherz', 'Steve Jobs, Stanford Commencement Speech,']
  },
  {
    id: 'quote-senorita',
    title: 'Señorita',
    category: 'quote',
    year: 2019,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Señorita – Shawn Mendes & Camila Cabello.',
    hint: 'Duett zweier Pop-Stars.',
    difficulty: 'leicht',
    sources: {
      text: '"I love it when you call me señorita."',
      textDe: 'Ich liebe es, wenn du mich Señorita nennst.'
    },
    distractors: ['Eminem', 'Giovanni Trapattoni, der legendueren Bayern-Pressekonferenz', 'Heinz Schenk/Klaus Lage „ Aelles nur geliehen." als Schlagerzeile und Fernseh-Scherz']
  },
  {
    id: 'quote-believer',
    title: 'Believer',
    category: 'quote',
    year: 2017,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Believer – Imagine Dragons.',
    hint: 'Alternative Rock-Hymne.',
    difficulty: 'leicht',
    sources: {
      text: '"Pain! You made me a, you made me a believer, believer."',
      textDe: 'Schmerz! Du hast mich zu einem, du hast mich zu einem Glaeubigen gemacht.'
    },
    distractors: ['Spice Girls', 'Herbert Gruenemeyer, 2014, Refrain seines Songs und Lebensmotto auf Konzerten', 'Barack Obama, Wahlkampfrede']
  },
  {
    id: 'quote-radioactive',
    title: 'Radioactive',
    category: 'quote',
    year: 2012,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Radioactive – Imagine Dragons.',
    hint: 'Alternative Rock ueber Neuanfang.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'m radioactive, radioactive."',
      textDe: 'Ich bin radioaktiv, radioaktiv.'
    },
    distractors: ['Giovanni Trapattoni, derselben Bayern-Pressekonferenz als Kritik am Team', 'Shawn Mendes & Camila Cabello', 'Game of Thrones, Gruueformel der Faceless Men in Braavos']
  },
  {
    id: 'quote-cant-stop-the-feeling',
    title: 'Can\'t Stop the Feeling!',
    category: 'quote',
    year: 2016,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Can\'t Stop the Feeling! – Justin Timberlake.',
    hint: 'Pop-Song aus Trolls.',
    difficulty: 'leicht',
    sources: {
      text: '"I got that sunshine in my pocket."',
      textDe: 'Ich habe den Sonnenschein in meiner Tasche.'
    },
    distractors: ['Imagine Dragons', 'Ed Sheeran', 'Juergen Klopp, Interview "ber seinen Trainerjob']
  },
  {
    id: 'quote-counting-stars',
    title: 'Counting Stars',
    category: 'quote',
    year: 2013,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Counting Stars – OneRepublic.',
    hint: 'Pop-Rock ueber Traeume.',
    difficulty: 'leicht',
    sources: {
      text: '"Lately I\'ve been, I\'ve been losing sleep, dreaming about the things that we could be."',
      textDe: 'In letzter Zeit habe ich Schlaf verloren, traeumend von den Dingen, die wir sein koennten.'
    },
    distractors: ['Giovanni Trapattoni, derselben Bayern-Pressekonferenz als Kritik am Team', 'Barack Obama, Wahlkampfrede', 'Imagine Dragons']
  },
  {
    id: 'quote-let-it-go',
    title: 'Let It Go',
    category: 'quote',
    year: 2013,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Let It Go – Idina Menzel (Die Eiskoenigin).',
    hint: 'Disney-Song aus Frozen.',
    difficulty: 'leicht',
    sources: {
      text: '"Let it go, let it go, can\'t hold it back anymore."',
      textDe: 'Lass es los, lass es los, kann es nicht mehr zurueckhalten.'
    },
    distractors: ['Nelson Mandela', 'Barack Obama, Wahlkampfrede', 'Juergen Klopp "Wir muessen immer weiter machen." auf einer Pressekonferenz nach einem Spiel']
  },
  {
    id: 'quote-wannabe',
    title: 'Wannabe',
    category: 'quote',
    year: 1996,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Wannabe – Spice Girls.',
    hint: 'Debut-Hit der Spice Girls.',
    difficulty: 'leicht',
    sources: {
      text: '"If you wanna be my lover, you gotta get with my friends."',
      textDe: 'Wenn du mein Liebhaber sein willst, musst du dich mit meinen Freunden verstehen.'
    },
    distractors: ['Queen', 'Aus Dead Poets Society — Ermutigung, den Tag zu nutzen', 'Juergen Klopp "Wir muessen immer weiter machen." auf einer Pressekonferenz nach einem Spiel']
  },
  {
    id: 'quote-baby-one-more-time',
    title: '...Baby One More Time',
    category: 'quote',
    year: 1998,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: '...Baby One More Time – Britney Spears.',
    hint: 'Britney Spears\' Durchbruch.',
    difficulty: 'leicht',
    sources: {
      text: '"Hit me baby one more time."',
      textDe: 'Triff mich, Baby, noch ein Mal.'
    },
    distractors: ['Roger Murtaugh (Lethal Weapon), Buddy-Cop-Film als resignierter Kommentar', 'Game of Thrones, Gruueformel der Faceless Men in Braavos', 'Michael Jackson']
  },
  {
    id: 'quote-toxic',
    title: 'Toxic',
    category: 'quote',
    year: 2003,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Toxic – Britney Spears.',
    hint: 'Pop-Hit mit Streichern.',
    difficulty: 'leicht',
    sources: {
      text: '"With a taste of your lips, I\'m on a ride."',
      textDe: 'Mit einem Geschmack deiner Lippen bin ich auf einer Fahrt.'
    },
    distractors: ['The Police', 'Juergen Klopp "Wir muessen immer weiter machen." auf einer Pressekonferenz nach einem Spiel', 'Bobby McFerrin']
  },
  {
    id: 'quote-umbrella',
    title: 'Umbrella',
    category: 'quote',
    year: 2007,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Umbrella – Rihanna ft. Jay-Z.',
    hint: 'Pop-R&B-Hit.',
    difficulty: 'leicht',
    sources: {
      text: 'Uender my umbrella, ella, ella, eh, eh, eh."',
      textDe: 'Unter meinem Regenschirm, ella, ella, eh, eh, eh.'
    },
    distractors: ['Heinz Schenk/Klaus Lage „ Aelles nur geliehen." als Schlagerzeile und Fernseh-Scherz', 'Ruf der Montagsdemos "Wir sind das Volk." auf den Straueen von Leipzig und anderen DDR-Stuedten', 'Aus Dead Poets Society — Ermutigung, den Tag zu nutzen']
  },
  {
    id: 'quote-viva-la-vida',
    title: 'Viva la Vida',
    category: 'quote',
    year: 2008,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Viva la Vida – Coldplay.',
    hint: 'Alternative Rock inspiriert von Revolution.',
    difficulty: 'leicht',
    sources: {
      text: '"I used to rule the world."',
      textDe: 'Ich herrschte einst ueber die Welt.'
    },
    distractors: ['The Weeknd', 'Idina Menzel', 'Imagine Dragons']
  },
  {
    id: 'quote-99-luftballons',
    title: '99 Luftballons',
    category: 'quote',
    year: 1983,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: '99 Luftballons – Nena.',
    hint: 'Deutscher New-Wave-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"99 Luftballons auf ihrem Weg zum Horizont."',
      textDe: '99 Luftballons auf ihrem Weg zum Horizont.'
    },
    distractors: ['Apollo-13-Besatzung, Funkmeldung nach der Explosion des Sauerstofftanks', 'John Lennon', 'Ronald Reagan, Rede am Brandenburger Tor,']
  },
  {
    id: 'quote-major-tom',
    title: 'Major Tom',
    category: 'quote',
    year: 1983,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Major Tom – Peter Schilling.',
    hint: 'Deutscher New-Wave-Song ueber Raumfahrer.',
    difficulty: 'mittel',
    sources: {
      text: '"Voellig losgeloest von der Erde."',
      textDe: 'Voellig losgeloest von der Erde.'
    },
    distractors: ['Madonna', 'Eagles', 'The Police']
  },
  {
    id: 'quote-atemlos',
    title: 'Atemlos durch die Nacht',
    category: 'quote',
    year: 2013,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Atemlos durch die Nacht – Helene Fischer.',
    hint: 'Deutscher Schlager-Hit.',
    difficulty: 'leicht',
    sources: {
      text: 'Aetemlos durch die Nacht."',
      textDe: 'Atemlos durch die Nacht.'
    },
    distractors: ['Eminem', 'OneRepublic', 'Herbert Gruenemeyer, 2014, Refrain seines Songs und Lebensmotto auf Konzerten']
  },
  {
    id: 'quote-dont-worry-be-happy',
    title: 'Don\'t Worry, Be Happy',
    category: 'quote',
    year: 1988,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Don\'t Worry, Be Happy – Bobby McFerrin.',
    hint: 'A-cappella-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"Don\'t worry, be happy."',
      textDe: 'Mach dir keine Sorgen, sei gluecklich.'
    },
    distractors: ['The Police', 'Ronald Reagan, seiner Rede am Brandenburger Tor in Berlin', 'Giovanni Trapattoni, derselben Bayern-Pressekonferenz als Kritik am Team']
  },
  {
    id: 'quote-all-star',
    title: 'All Star',
    category: 'quote',
    year: 1999,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'All Star – Smash Mouth.',
    hint: 'Rock-Song aus Shrek.',
    difficulty: 'leicht',
    sources: {
      text: '"Somebody once told me the world is gonna roll me."',
      textDe: 'Jemand hat mir mal gesagt, die Welt wird mich ueberrollen.'
    },
    distractors: ['a-ha', 'Giovanni Trapattoni, derselben Bayern-Pressekonferenz als Kritik am Team', 'Luis Fonsi ft. Daddy Yankee']
  },
  {
    id: 'quote-mr-brightside',
    title: 'Mr. Brightside',
    category: 'quote',
    year: 2003,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Mr. Brightside – The Killers.',
    hint: 'Alternative Rock ueber Eifersucht.',
    difficulty: 'leicht',
    sources: {
      text: '"It was only a kiss, how did it end up like this?"',
      textDe: 'Es war nur ein Kuss, wie endete es so?'
    },
    distractors: ['Whitney Houston', 'Hape Kerkeling — Buchtitel und gefluegeltes Wort "ber seine Pilgerreise auf dem Jakobsweg', 'Guns N\' Roses']
  },
  {
    id: 'quote-take-on-me',
    title: 'Take On Me',
    category: 'quote',
    year: 1985,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat (Filme, Lieder, Personen)?',
    answer: 'Take On Me – a-ha.',
    hint: 'Synthpop mit ikonischem Video.',
    difficulty: 'leicht',
    sources: {
      text: '"Take on me, take me on."',
      textDe: 'Nimm mich an, nimm mich mit.'
    },
    distractors: ['Queen', 'Ronald Reagan, Rede am Brandenburger Tor,', 'Bon Jovi']
  }
];

const baseNonMusicCards = [
  ...baseCards.filter((c) => c.category !== 'music' && !c.id.startsWith('flag-') && !c.id.startsWith('outline-')),
  ...naturTechnikCards,
  ...filmSerienCards,
  ...triviaExtraCards,
  ...schaetzfragenCards
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


