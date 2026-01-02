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
    answer: 'Nirvana � Release 1991 auf dem Album Nevermind.',
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
    cue: 'H�re das Zitat oder lese es laut vor.',
    answer: 'Angela Merkel, Pressekonferenz zur Fl�chtlingspolitik am 31.08.2015.',
    hint: 'Bundeskanzlerin zur Migrationslage.',
    difficulty: 'leicht',
    sources: {
      text: '�Wir schaffen das.�'
    }
  },
  {
    id: 'image-berliner-mauerfall',
    title: 'Fall der Berliner Mauer',
    category: 'image',
    year: 1989,
    cue: 'Bild ansehen und chronologisch einordnen. Frage: Wo und wann war das?',
    answer: 'Berlin, 09.11.1989 � Fall der Berliner Mauer.',
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
    answer: 'Gizeh, ca. 2560 v. Chr. � Cheops-Pyramide.',
    hint: 'Altes �gypten.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Adele � 2010, Album 21.',
    hint: 'Londoner S�ngerin, Durchbruch-Single.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Queen � 1975, Album A Night at the Opera.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Michael Jackson � 1982, Album Thriller.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Ed Sheeran � 2017, Album �.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'The Weeknd � 2019, Album After Hours.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'a-ha � 1985, Album Hunting High and Low.',
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
    answer: 'Mond, 20.07.1969 � Apollo 11 Flaggenaufstellung.',
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
    cue: 'Zitat lesen/anh�ren.',
    answer: 'Nelson Mandela, 2001.',
    hint: 'S�dafrika, Vers�hnung.',
    difficulty: 'mittel',
    sources: {
      text: '�It always seems impossible until it�s done.�',
      textDe: 'Es erscheint immer unm�glich, bis es getan ist.'
    }
  },
  {
    id: 'country-germany-flag',
    title: 'Flagge Deutschlands',
    category: 'country',
    year: 1949,
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Bundesrepublik Deutschland � 23.05.1949 (Grundgesetz in Kraft).',
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
    answer: 'David Bowie � 1977, aus dem Album "Heroes".',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'John Lennon � 1971, Friedenshymne.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Eagles � 1976, Klassiker der Westk�ste.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'OutKast � 2003, aus Speakerboxxx/The Love Below.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Eminem � 2002, Soundtrack zu 8 Mile.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'The White Stripes � 2003, markante Basslinie.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Billie Eilish � 2019, Deb�talbum When We All Fall Asleep.',
    hint: 'Fl�sterpop mit Bass.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Daft Punk feat. Pharrell Williams � 2013.',
    hint: 'Franz�sisches Duo mit Helmen.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Coldplay � 2008, Album Viva la Vida or Death and All His Friends.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Shakira feat. Wyclef Jean � 2006.',
    hint: 'Kolumbianische S�ngerin, weltweiter Tanzhit.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Fleetwood Mac � 1977, Album Rumours.',
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
    cue: 'Song anh�ren und einordnen.',
    answer: 'Backstreet Boys � 1999, Boyband-Evergreen.',
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
    cue: 'Wann und woher stammt das folgende Zitat?',
    answer: 'Ronald Reagan, Rede am Brandenburger Tor, 12.06.1987.',
    hint: 'US-Pr�sident fordert �ffnung der Mauer.',
    difficulty: 'mittel',
    sources: {
      text: '�Mr. Gorbachev, tear down this wall!�',
      textDe: 'Herr Gorbatschow, rei�en Sie diese Mauer ein!'
    }
  },
  {
    id: 'quote-yes-we-can',
    title: 'Yes we can',
    category: 'quote',
    year: 2008,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Barack Obama, Wahlkampfrede 2008.',
    hint: 'Slogan einer US-Pr�sidentschaftskampagne.',
    difficulty: 'leicht',
    sources: {
      text: '�Yes we can.�',
      textDe: 'Ja, wir k�nnen das.'
    }
  },
  {
    id: 'quote-ich-bin-ein-berliner',
    title: 'Ich bin ein Berliner',
    category: 'quote',
    year: 1963,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'John F. Kennedy, Rede in Berlin, 26.06.1963.',
    hint: 'Kaltes Kriegs-Statement.',
    difficulty: 'mittel',
    sources: {
      text: '�Ich bin ein Berliner.�'
    }
  },
  {
    id: 'quote-houston-problem',
    title: "Houston, we've had a problem",
    category: 'quote',
    year: 1970,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Jack Swigert/Jim Lovell, Apollo-13-Mission, 13.04.1970.',
    hint: 'Raumfahrt-Notfall.',
    difficulty: 'schwer',
    sources: {
      text: '�Houston, we have a problem!�',
      textDe: 'Houston, wir haben ein Problem!'
    }
  },
  {
    id: 'quote-one-small-step',
    title: 'One small step',
    category: 'quote',
    year: 1969,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Neil Armstrong, Mondlandung, 20.07.1969.',
    hint: 'Erster Fu�abdruck auf dem Mond.',
    difficulty: 'leicht',
    sources: {
      text: '�That�s one small step for man, one giant leap for mankind.�',
      textDe: 'Das ist ein kleiner Schritt f�r einen Menschen, aber ein gewaltiger Sprung f�r die Menschheit.'
    }
  },
  {
    id: 'quote-fear-itself',
    title: 'Fear itself',
    category: 'quote',
    year: 1933,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Franklin D. Roosevelt, Antrittsrede, 04.03.1933.',
    hint: 'Beginn des New Deal.',
    difficulty: 'mittel',
    sources: {
      text: '�The only thing we have to fear is fear itself.�',
      textDe: 'Wir haben nichts zu f�rchten au�er der Furcht selbst.'
    }
  },
  {
    id: 'quote-stay-hungry',
    title: 'Stay hungry, stay foolish',
    category: 'quote',
    year: 2005,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Steve Jobs, Stanford Commencement Speech, 12.06.2005.',
    hint: 'Abschlussrede an einer US-Eliteuni.',
    difficulty: 'leicht',
    sources: {
      text: '�Stay hungry, stay foolish.�',
      textDe: 'Bleibt hungrig, bleibt t�richt.'
    }
  },
  {
    id: 'quote-carpe-diem',
    title: 'Carpe Diem',
    category: 'quote',
    year: 1989,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Aus Dead Poets Society, 1989 � Ermutigung, den Tag zu nutzen.',
    hint: 'Literaturlehrer inspiriert seine Klasse.',
    difficulty: 'mittel',
    sources: {
      text: '�Carpe diem. Seize the day, boys.�',
      textDe: 'Carpe diem � Nutzt den Tag, Jungs.'
    }
  },
  {
    id: 'quote-hatte-hatte-fahrradkette',
    title: 'H�tte, h�tte, Fahrradkette',
    category: 'quote',
    year: 2013,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Lothar Matth�us, 2013 � �H�tte, h�tte, Fahrradkette.� in der Sky90-Runde als sp�ttischer Kommentar zur Spielanalyse.',
    hint: 'Fu�ballweltmeister, TV-Experte.',
    difficulty: 'leicht',
    sources: { text: 'H�tte, h�tte, Fahrradkette.' }
  },
  {
    id: 'quote-mailand-oder-madrid',
    title: 'Mailand oder Madrid',
    category: 'quote',
    year: 1998,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Andreas M�ller, 1998 � �Mailand oder Madrid � Hauptsache Italien.� in einem TV-Interview nach einer internationalen Auslosung.',
    hint: 'Dortmunder Offensivspieler.',
    difficulty: 'leicht',
    sources: { text: 'Mailand oder Madrid � Hauptsache Italien.' }
  },
  {
    id: 'quote-mr-gorbachev-tear-down-this-wall',
    title: 'Tear down this wall',
    category: 'quote',
    year: 1987,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Ronald Reagan, 1987 � �Mr. Gorbachev, tear down this wall!� in seiner Rede am Brandenburger Tor in Berlin.',
    hint: 'US-Pr�sident, Brandenburger Tor.',
    difficulty: 'mittel',
    sources: {
      text: 'Mr. Gorbachev, tear down this wall!',
      textDe: 'Herr Gorbatschow, rei�en Sie diese Mauer ein!'
    }
  },
  {
    id: 'quote-houston-we-have-a-problem',
    title: 'Houston, we have a problem',
    category: 'quote',
    year: 1970,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Apollo-13-Besatzung, 1970 � �Houston, we have a problem.� als Funkmeldung nach der Explosion des Sauerstofftanks.',
    hint: 'NASA, Raumfahrt.',
    difficulty: 'mittel',
    sources: {
      text: 'Houston, we have a problem!',
      textDe: 'Houston, wir haben ein Problem!'
    }
  },
  {
    id: 'quote-ein-kleiner-schritt',
    title: 'One small step',
    category: 'quote',
    year: 1969,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Neil Armstrong, 1969 � �That�s one small step for (a) man�� beim ersten Schritt auf die Mondoberfl�che.',
    hint: 'Mondlandung.',
    difficulty: 'leicht',
    sources: {
      text: "That's one small step for man, one giant leap for mankind.",
      textDe: 'Das ist ein kleiner Schritt f�r einen Menschen, aber ein gewaltiger Sprung f�r die Menschheit.'
    }
  },
  {
    id: 'quote-wir-schaffen-das',
    title: 'Wir schaffen das',
    category: 'quote',
    year: 2015,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Angela Merkel, 2015 � �Wir schaffen das.� in der Bundespressekonferenz zur Fl�chtlingssituation.',
    hint: 'Bundeskanzlerin zur Fl�chtlingskrise.',
    difficulty: 'leicht',
    sources: { text: 'Wir schaffen das.' }
  },
  {
    id: 'quote-ich-bin-dann-mal-weg',
    title: 'Ich bin dann mal weg',
    category: 'quote',
    year: 2006,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Hape Kerkeling, 2006 � �Ich bin dann mal weg.� als Titel seines Jakobsweg-Reiseberichts.',
    hint: 'Autor, Jakobsweg.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dann mal weg.' }
  },
  {
    id: 'quote-zwei-seelen-wohnen',
    title: 'Zwei Seelen wohnen',
    category: 'quote',
    year: 1808,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Goethe, Faust I (ca. 1808) � �Zwei Seelen wohnen, ach! in meiner Brust.� im Monolog des Faust �ber innere Zerrissenheit.',
    hint: 'Deutscher Dichter, Faust.',
    difficulty: 'mittel',
    sources: { text: 'Zwei Seelen wohnen, ach! in meiner Brust.' }
  },
  {
    id: 'quote-sein-oder-nichtsein',
    title: 'Sein oder Nichtsein',
    category: 'quote',
    year: 1600,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'William Shakespeare, Hamlet (ca. 1600) � �To be, or not to be�� als Auftakt von Hamlets ber�hmtem Selbstgespr�ch.',
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
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Ren� Descartes, 1637 � �Cogito, ergo sum.� im �Discours de la m�thode� als Grundsatz des Rationalismus.',
    hint: 'Franz�sischer Philosoph.',
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
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Benjamin Franklin, 1748 � �Time is money.� in �Advice to a Young Tradesman� als Ratschlag f�r Gesch�ftsleute.',
    hint: 'US-Staatsmann, Erfinder.',
    difficulty: 'leicht',
    sources: {
      text: 'Time is money.',
      textDe: 'Zeit ist Geld.'
    }
  },
  {
    id: 'quote-ich-wei�-dass-ich-nichts-wei�',
    title: 'Sokrates Nichtwissen',
    category: 'quote',
    year: -400,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Sokrates zugeschrieben � �Ich wei�, dass ich nichts wei�.� aus Platons �Apologie� als Bekenntnis philosophischer Demut.',
    hint: 'Antike Philosophie.',
    difficulty: 'mittel',
    sources: { text: 'Ich wei�, dass ich nichts wei�.' }
  },
  {
    id: 'quote-mach-dein-ding',
    title: 'Mach dein Ding',
    category: 'quote',
    year: 2010,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Herbert Gr�nemeyer, 2014 � �Mach dein Ding.� als Refrain seines Songs und Lebensmotto auf Konzerten.',
    hint: 'Deutscher Musiker.',
    difficulty: 'leicht',
    sources: { text: 'Mach dein Ding.' }
  },
  {
    id: 'quote-ich-bin-dumm-und-das-ist-gut-so',
    title: 'Ich bin dumm',
    category: 'quote',
    year: 2010,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Patrick Star (SpongeBob), 2010er � �Ich bin dumm, und das ist gut so.� in einer Cartoon-Szene als selbstironischer Moment.',
    hint: 'Zeichentrick-Seestern.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dumm, und das ist gut so.' }
  },
  {
    id: 'quote-ich-habe-einen-traum',
    title: 'I have a dream',
    category: 'quote',
    year: 1963,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Martin Luther King Jr., 1963 � �I have a dream.� in seiner Rede beim March on Washington f�r B�rgerrechte.',
    hint: 'US-B�rgerrechtler.',
    difficulty: 'leicht',
    sources: {
      text: 'I have a dream.',
      textDe: 'Ich habe einen Traum.'
    }
  },
  {
    id: 'quote-veni-vidi-vici',
    title: 'Veni vidi vici',
    category: 'quote',
    year: -47,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Julius Caesar, 47 v. Chr. � �Veni, vidi, vici.� im Bericht an den Senat nach dem Sieg bei Zela.',
    hint: 'R�mischer Feldherr.',
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
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'CDU-Wahlkampfslogan, 1957 � �Keine Experimente!� als zentraler Claim im Bundestagswahlkampf.',
    hint: 'Deutsche Nachkriegspolitik.',
    difficulty: 'mittel',
    sources: { text: 'Keine Experimente!' }
  },
  {
    id: 'quote-wir-sind-das-volk',
    title: 'Wir sind das Volk',
    category: 'quote',
    year: 1989,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Ruf der Montagsdemos, 1989 � �Wir sind das Volk.� auf den Stra�en von Leipzig und anderen DDR-St�dten.',
    hint: 'DDR, Wendezeit.',
    difficulty: 'mittel',
    sources: { text: 'Wir sind das Volk.' }
  },
  {
    id: 'quote-sag-mir-wo-die-blumen-sind',
    title: 'Wo sind die Blumen',
    category: 'quote',
    year: 1955,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Pete Seeger/Marlen Dietrich, 1950er � �Sag mir, wo die Blumen sind�� als Antikriegslied in Konzerten.',
    hint: 'Antikriegslied.',
    difficulty: 'mittel',
    sources: { text: 'Sag mir, wo die Blumen sind.' }
  },
  {
    id: 'quote-einmal-im-leben',
    title: 'Einmal im Leben',
    category: 'quote',
    year: 2006,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'J�rgen Klopp, 2006 � �Ich dachte, einmal im Leben muss ich das probieren.� im Interview �ber seinen Trainerjob.',
    hint: 'Trainer, Fu�ball.',
    difficulty: 'mittel',
    sources: { text: 'Einmal im Leben muss ich das probieren.' }
  },
  {
    id: 'quote-die-lage-ist-ernst-aber-nicht-hoffnungslos',
    title: 'Ernst aber nicht hoffnungslos',
    category: 'quote',
    year: 1980,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Karl Valentin zugeschrieben � �Die Lage ist hoffnungslos, aber nicht ernst.� als kabarettistischer Wortdreher.',
    hint: 'Kabarett, Wortspiel.',
    difficulty: 'mittel',
    sources: { text: 'Die Lage ist hoffnungslos, aber nicht ernst.' }
  },
  {
    id: 'quote-zwei-dinge-unendlich',
    title: 'Zwei Dinge sind unendlich',
    category: 'quote',
    year: 1920,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Albert Einstein zugeschrieben � �Zwei Dinge sind unendlich: das Universum und die menschliche Dummheit�� als oft erz�hlte Anekdote.',
    hint: 'Physiker, Relativit�t.',
    difficulty: 'mittel',
    sources: { text: 'Zwei Dinge sind unendlich: das Universum und die menschliche Dummheit; aber beim Universum bin ich mir nicht ganz sicher.' }
  },
  {
    id: 'quote-keep-calm',
    title: 'Keep calm',
    category: 'quote',
    year: 1939,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Britisches Motiv, 1939 � �Keep calm and carry on.� als Propagandaposter zu Beginn des Zweiten Weltkriegs.',
    hint: 'Britische Propaganda WWII.',
    difficulty: 'leicht',
    sources: {
      text: 'Keep calm and carry on.',
      textDe: 'Bleib ruhig und mach weiter.'
    }
  },
  {
    id: 'quote-furcht-ist-der-weg-zur-dunklen-seite',
    title: 'Furcht zur dunklen Seite',
    category: 'quote',
    year: 1999,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Yoda, 1999 � �Furcht ist der Pfad zur dunklen Seite.� in Star Wars: Episode I als Warnung an Anakin.',
    hint: 'Star Wars Jedi-Meister.',
    difficulty: 'leicht',
    sources: {
      text: 'Fear is the path to the dark side.',
      textDe: 'Furcht ist der Pfad zur dunklen Seite.'
    }
  },
  {
    id: 'quote-winter-is-coming',
    title: 'Winter is coming',
    category: 'quote',
    year: 2011,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Game of Thrones, 2011 � �Winter is coming.� als Motto des Hauses Stark in der Pilotfolge.',
    hint: 'Haus Stark.',
    difficulty: 'leicht',
    sources: {
      text: 'Winter is coming.',
      textDe: 'Der Winter naht.'
    }
  },
  {
    id: 'quote-valar-morghulis',
    title: 'Valar Morghulis',
    category: 'quote',
    year: 2012,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Game of Thrones, 2012 � �Valar Morghulis.� als Gru�formel der Faceless Men in Braavos.',
    hint: 'Alte Sprache, jeder muss sterben.',
    difficulty: 'mittel',
    sources: {
      text: 'Valar Morghulis.',
      textDe: 'Alle Menschen m�ssen sterben.'
    }
  },
  {
    id: 'quote-alles-nur-geliehen',
    title: 'Alles nur geliehen',
    category: 'quote',
    year: 1998,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Heinz Schenk/Klaus Lage � �Alles nur geliehen.� als Schlagerzeile und Fernseh-Scherz.',
    hint: 'Deutscher Schlager/Witz.',
    difficulty: 'leicht',
    sources: { text: 'Alles nur geliehen.' }
  },
  {
    id: 'quote-ich-habe-fertig',
    title: 'Ich habe fertig',
    category: 'quote',
    year: 1998,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Giovanni Trapattoni, 1998 � �Ich habe fertig.� in der legend�ren Bayern-Pressekonferenz.',
    hint: 'Trainer-Pressekonferenz Bayern.',
    difficulty: 'leicht',
    sources: { text: 'Ich habe fertig.' }
  },
  {
    id: 'quote-flasche-leer',
    title: 'Flasche leer',
    category: 'quote',
    year: 1998,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Giovanni Trapattoni, 1998 � �Flasche leer!� in derselben Bayern-Pressekonferenz als Kritik am Team.',
    hint: 'Trainer-Pressekonferenz.',
    difficulty: 'leicht',
    sources: { text: 'Flasche leer!' }
  },
  {
    id: 'quote-ich-bin-zu-alt-fuer-diesen-mist',
    title: 'Zu alt f�r diesen Mist',
    category: 'quote',
    year: 1987,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Roger Murtaugh (Lethal Weapon), 1987 � �I�m too old for this�� im Buddy-Cop-Film als resignierter Kommentar.',
    hint: 'Actionfilm Buddy-Cop.',
    difficulty: 'leicht',
    sources: {
      text: "I'm too old for this shit.",
      textDe: 'Ich bin zu alt f�r diesen Mist.'
    }
  },
  {
    id: 'quote-ich-bin-dein-vater',
    title: 'Ich bin dein Vater',
    category: 'quote',
    year: 1980,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Darth Vader, 1980 � �No, I am your father.� im Duell auf Cloud City (Star Wars Episode V).',
    hint: 'Star Wars Episode V.',
    difficulty: 'leicht',
    sources: {
      text: 'No, I am your father.',
      textDe: 'Nein, ich bin dein Vater.'
    }
  },
  {
    id: 'quote-immer-weiter',
    title: 'Immer weiter',
    category: 'quote',
    year: 2014,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'J�rgen Klopp, 2014 � �Wir m�ssen immer weiter machen.� auf einer Pressekonferenz nach einem Spiel.',
    hint: 'Trainer, Bundesliga.',
    difficulty: 'leicht',
    sources: { text: 'Wir m�ssen immer weiter machen.' }
  },
  {
    id: 'quote-keine-macht-den-drogen',
    title: 'Keine Macht den Drogen',
    category: 'quote',
    year: 1990,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Pr�ventionskampagne, 1990er � �Keine Macht den Drogen.� als Slogan der Jugendpr�vention.',
    hint: 'Jugendkampagne.',
    difficulty: 'mittel',
    sources: { text: 'Keine Macht den Drogen.' }
  },
  {
    id: 'quote-die-rente-ist-sicher',
    title: 'Die Rente ist sicher',
    category: 'quote',
    year: 1986,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Norbert Bl�m, 1986 � �Die Rente ist sicher.� in einer Pressekonferenz zur Rentenreform.',
    hint: 'Bundesarbeitsminister.',
    difficulty: 'mittel',
    sources: { text: 'Die Rente ist sicher.' }
  },
  {
    id: 'quote-ich-bin-dann-mal-weg-zitat',
    title: 'Ich bin dann mal weg (Zitat)',
    category: 'quote',
    year: 2006,
    cue: 'Zitat anh�ren/lesen, zeitlich einordnen.',
    answer: 'Hape Kerkeling, 2006 � Buchtitel und gefl�geltes Wort �ber seine Pilgerreise auf dem Jakobsweg.',
    hint: 'Comedian, Jakobsweg.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dann mal weg.' }
  },
  {
    id: 'flag-de',
    title: 'Flagge Deutschland',
    category: 'country',
    year: 1949,
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Deutschland � Schwarz-Rot-Gold, 1949 best�tigt.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Frankreich � Bleu-Blanc-Rouge, 1794 offiziell.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Italien � Gr�n-Wei�-Rot, 1946 republikanisch.',
    hint: 'Vertikale Tricolore, Gr�n am Mast.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Spanien � Rot-Gelb-Rot mit Wappen, 1981.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Vereinigte Staaten � Stars and Stripes mit 50 Sternen, seit 1960.',
    hint: 'Streifen und Sterne.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/us.png'
    }
  },
  {
    id: 'flag-gb',
    title: 'Flagge Vereinigtes K�nigreich',
    category: 'country',
    year: 1801,
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Vereinigtes K�nigreich � Union Jack, seit 1801.',
    hint: '�berlagerte Kreuze.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Japan � Roter Kreis auf Wei�, 1999 gesetzlich best�tigt.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Volksrepublik China � Rot mit f�nf Sternen, 1949.',
    hint: 'Ein gro�er, vier kleine Sterne.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Brasilien � Gr�n, Gelb-Raute und Sternenkugel, 1889.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Indien � Safran, Wei�, Gr�n mit Ashoka-Chakra, 1947.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Australien � Union Jack, Commonwealth Star und S�dliches Kreuz, 1903.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Kanada � Ahornblatt auf Rot-Wei�-Rot, 1965.',
    hint: 'Rotes Ahornblatt.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/ca.png'
    }
  },
  {
    id: 'flag-za',
    title: 'Flagge S�dafrika',
    category: 'country',
    year: 1994,
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'S�dafrika � Y-Form mit sechs Farben, 1994.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Schweden � Blau mit gelbem Kreuz, 1906.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Norwegen � Rot mit blauem Kreuz, 1821.',
    hint: 'Nordisches Kreuz mit Wei� und Blau.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Finnland � Wei� mit blauem Kreuz, 1918.',
    hint: 'Seen, Schnee, Blau-Wei�.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Argentinien � Hellblau-Wei� mit Sonne, 1818.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Mexiko � Gr�n, Wei�, Rot mit Adler und Schlange, 1968.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Schweiz � Rotes Quadrat mit wei�em Kreuz, 1889.',
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
    cue: 'Zu welchem Land geh�rt diese Flagge und wann wurde es gegr�ndet?',
    answer: 'Niederlande � Rot, Wei�, Blau, 1937.',
    hint: 'Waagerechte Tricolore.',
    difficulty: 'leicht',
    sources: {
      image: '/assets/flags/nl.png'
    }
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


