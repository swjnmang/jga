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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Angela Merkel, Pressekonferenz zur Fl"chtlingspolitik am 31.08.2015.',
    hint: 'Bundeskanzlerin zur Migrationslage.',
    difficulty: 'leicht',
    sources: {
      text: '"Wir schaffen das."'
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
    }
  },
  {
    id: 'image-cheops-pyramide',
    title: 'Cheops-Pyramide',
    category: 'image',
    year: -2560,
    cue: 'Bild ansehen und einordnen. Frage: Wo und wann war das?',
    answer: 'Gizeh, ca. 2560 v. Chr. „ Cheops-Pyramide.',
    hint: 'Altes "Ägypten.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Nelson Mandela.',
    hint: 'S"dafrika, Vers"hnung.',
    difficulty: 'mittel',
    sources: {
      text: '"It always seems impossible until itü done."',
      textDe: 'Es erscheint immer unm"glich, bis es getan ist.'
    }
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
    hint: 'Franzüisches Duo mit Helmen.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Ronald Reagan, Rede am Brandenburger Tor, 12.06.1987.',
    hint: 'US-Präsident fordert Öffnung der Mauer.',
    difficulty: 'mittel',
    sources: {
      text: '"Mr. Gorbachev, tear down this wall!"',
      textDe: 'Herr Gorbatschow, reiüen Sie diese Mauer ein!'
    }
  },
  {
    id: 'quote-yes-we-can',
    title: 'Yes we can',
    category: 'quote',
    year: 2008,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Barack Obama, Wahlkampfrede 2008.',
    hint: 'Slogan einer US-Prüidentschaftskampagne.',
    difficulty: 'leicht',
    sources: {
      text: '"Yes we can."',
      textDe: 'Ja, wir können das.'
    }
  },
  {
    id: 'quote-ich-bin-ein-berliner',
    title: 'Ich bin ein Berliner',
    category: 'quote',
    year: 1963,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'John F. Kennedy, Rede in Berlin, 26.06.1963.',
    hint: 'Kaltes Kriegs-Statement.',
    difficulty: 'mittel',
    sources: {
      text: '"Ich bin ein Berliner."'
    }
  },
  {
    id: 'quote-houston-problem',
    title: "Houston, we've had a problem",
    category: 'quote',
    year: 1970,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Jack Swigert/Jim Lovell, Apollo-13-Mission, 13.04.1970.',
    hint: 'Raumfahrt-Notfall.',
    difficulty: 'schwer',
    sources: {
      text: '"Houston, we have a problem!"',
      textDe: 'Houston, wir haben ein Problem!'
    }
  },
  {
    id: 'quote-one-small-step',
    title: 'One small step',
    category: 'quote',
    year: 1969,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Neil Armstrong, Mondlandung, 20.07.1969.',
    hint: 'Erster Fuäbdruck auf dem Mond.',
    difficulty: 'leicht',
    sources: {
      text: '"Thatü one small step for man, one giant leap for mankind."',
      textDe: 'Das ist ein kleiner Schritt für einen Menschen, aber ein gewaltiger Sprung für die Menschheit.'
    }
  },
  {
    id: 'quote-fear-itself',
    title: 'Fear itself',
    category: 'quote',
    year: 1933,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Franklin D. Roosevelt, Antrittsrede, 04.03.1933.',
    hint: 'Beginn des New Deal.',
    difficulty: 'mittel',
    sources: {
      text: '"The only thing we have to fear is fear itself."',
      textDe: 'Wir haben nichts zu fürchten auüer der Furcht selbst.'
    }
  },
  {
    id: 'quote-stay-hungry',
    title: 'Stay hungry, stay foolish',
    category: 'quote',
    year: 2005,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Steve Jobs, Stanford Commencement Speech, 12.06.2005.',
    hint: 'Abschlussrede an einer US-Eliteuni.',
    difficulty: 'leicht',
    sources: {
      text: '"Stay hungry, stay foolish."',
      textDe: 'Bleibt hungrig, bleibt t"richt.'
    }
  },
  {
    id: 'quote-carpe-diem',
    title: 'Carpe Diem',
    category: 'quote',
    year: 1989,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Aus Dead Poets Society — Ermutigung, den Tag zu nutzen.',
    hint: 'Literaturlehrer inspiriert seine Klasse.',
    difficulty: 'mittel',
    sources: {
      text: '"Carpe diem. Seize the day, boys."',
      textDe: 'Carpe diem „ Nutzt den Tag, Jungs.'
    }
  },
  {
    id: 'quote-hatte-hatte-fahrradkette',
    title: 'H"tte, h"tte, Fahrradkette',
    category: 'quote',
    year: 2013,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Lothar Matthüs, 2013 "H"tte, h"tte, Fahrradkette." in der Sky90-Runde als spöttischer Kommentar zur Spielanalyse.',
    hint: 'Fu"ballweltmeister, TV-Experte.',
    difficulty: 'leicht',
    sources: { text: 'H"tte, h"tte, Fahrradkette.' }
  },
  {
    id: 'quote-mailand-oder-madrid',
    title: 'Mailand oder Madrid',
    category: 'quote',
    year: 1998,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Andreas M"ller, 1998 "Mailand oder Madrid „ Hauptsache Italien." in einem TV-Interview nach einer internationalen Auslosung.',
    hint: 'Dortmunder Offensivspieler.',
    difficulty: 'leicht',
    sources: { text: 'Mailand oder Madrid „ Hauptsache Italien.' }
  },
  {
    id: 'quote-mr-gorbachev-tear-down-this-wall',
    title: 'Tear down this wall',
    category: 'quote',
    year: 1987,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Ronald Reagan, 1987 "Mr. Gorbachev, tear down this wall!" in seiner Rede am Brandenburger Tor in Berlin.',
    hint: 'US-Prüident, Brandenburger Tor.',
    difficulty: 'mittel',
    sources: {
      text: 'Mr. Gorbachev, tear down this wall!',
      textDe: 'Herr Gorbatschow, rei"en Sie diese Mauer ein!'
    }
  },
  {
    id: 'quote-houston-we-have-a-problem',
    title: 'Houston, we have a problem',
    category: 'quote',
    year: 1970,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Apollo-13-Besatzung, 1970 "Houston, we have a problem." als Funkmeldung nach der Explosion des Sauerstofftanks.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Neil Armstrong, 1969 "Thatü one small step for (a) man"" beim ersten Schritt auf die Mondoberfläche.',
    hint: 'Mondlandung.',
    difficulty: 'leicht',
    sources: {
      text: "That's one small step for man, one giant leap for mankind.",
      textDe: 'Das ist ein kleiner Schritt für einen Menschen, aber ein gewaltiger Sprung für die Menschheit.'
    }
  },
  {
    id: 'quote-wir-schaffen-das',
    title: 'Wir schaffen das',
    category: 'quote',
    year: 2015,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Angela Merkel, 2015 "Wir schaffen das." in der Bundespressekonferenz zur Fl"chtlingssituation.',
    hint: 'Bundeskanzlerin zur Fl"chtlingskrise.',
    difficulty: 'leicht',
    sources: { text: 'Wir schaffen das.' }
  },
  {
    id: 'quote-ich-bin-dann-mal-weg',
    title: 'Ich bin dann mal weg',
    category: 'quote',
    year: 2006,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Hape Kerkeling, 2006 "Ich bin dann mal weg." als Titel seines Jakobsweg-Reiseberichts.',
    hint: 'Autor, Jakobsweg.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dann mal weg.' }
  },
  {
    id: 'quote-zwei-seelen-wohnen',
    title: 'Zwei Seelen wohnen',
    category: 'quote',
    year: 1808,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Goethe, Faust I (ca. 1808) "Zwei Seelen wohnen, ach! in meiner Brust." im Monolog des Faust "ber innere Zerrissenheit.',
    hint: 'Deutscher Dichter, Faust.',
    difficulty: 'mittel',
    sources: { text: 'Zwei Seelen wohnen, ach! in meiner Brust.' }
  },
  {
    id: 'quote-sein-oder-nichtsein',
    title: 'Sein oder Nichtsein',
    category: 'quote',
    year: 1600,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'William Shakespeare, Hamlet (ca. 1600) "To be, or not to be"" als Auftakt von Hamlets ber"hmtem Selbstgespr"ch.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Ren„ Descartes, 1637 "Cogito, ergo sum." im "Discours de la m"thode" als Grundsatz des Rationalismus.',
    hint: 'Franzüischer Philosoph.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Benjamin Franklin, 1748 "Time is money." in Ädvice to a Young Tradesman" als Ratschlag für Geschäftsleute.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Sokrates zugeschrieben "Ich wei", dass ich nichts wei"." aus Platons Äpologie" als Bekenntnis philosophischer Demut.',
    hint: 'Antike Philosophie.',
    difficulty: 'mittel',
    sources: { text: 'Ich wei", dass ich nichts wei".' }
  },
  {
    id: 'quote-mach-dein-ding',
    title: 'Mach dein Ding',
    category: 'quote',
    year: 2010,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Herbert Gr"nemeyer, 2014 "Mach dein Ding." als Refrain seines Songs und Lebensmotto auf Konzerten.',
    hint: 'Deutscher Musiker.',
    difficulty: 'leicht',
    sources: { text: 'Mach dein Ding.' }
  },
  {
    id: 'quote-ich-bin-dumm-und-das-ist-gut-so',
    title: 'Ich bin dumm',
    category: 'quote',
    year: 2010,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Patrick Star (SpongeBob), 2010er "Ich bin dumm, und das ist gut so." in einer Cartoon-Szene als selbstironischer Moment.',
    hint: 'Zeichentrick-Seestern.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dumm, und das ist gut so.' }
  },
  {
    id: 'quote-ich-habe-einen-traum',
    title: 'I have a dream',
    category: 'quote',
    year: 1963,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Martin Luther King Jr., 1963 "I have a dream." in seiner Rede beim March on Washington für Bürgerrechte.',
    hint: 'US-B"rgerrechtler.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Julius Caesar, 47 v. Chr. "Veni, vidi, vici." im Bericht an den Senat nach dem Sieg bei Zela.',
    hint: 'R"mischer Feldherr.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'CDU-Wahlkampfslogan, 1957 "Keine Experimente!" als zentraler Claim im Bundestagswahlkampf.',
    hint: 'Deutsche Nachkriegspolitik.',
    difficulty: 'mittel',
    sources: { text: 'Keine Experimente!' }
  },
  {
    id: 'quote-wir-sind-das-volk',
    title: 'Wir sind das Volk',
    category: 'quote',
    year: 1989,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Ruf der Montagsdemos, 1989 "Wir sind das Volk." auf den Stra"en von Leipzig und anderen DDR-St"dten.',
    hint: 'DDR, Wendezeit.',
    difficulty: 'mittel',
    sources: { text: 'Wir sind das Volk.' }
  },
  {
    id: 'quote-sag-mir-wo-die-blumen-sind',
    title: 'Wo sind die Blumen',
    category: 'quote',
    year: 1955,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Pete Seeger/Marlen Dietrich, 1950er "Sag mir, wo die Blumen sind"" als Antikriegslied in Konzerten.',
    hint: 'Antikriegslied.',
    difficulty: 'mittel',
    sources: { text: 'Sag mir, wo die Blumen sind.' }
  },
  {
    id: 'quote-einmal-im-leben',
    title: 'Einmal im Leben',
    category: 'quote',
    year: 2006,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Jürgen Klopp, 2006 "Ich dachte, einmal im Leben muss ich das probieren." im Interview "ber seinen Trainerjob.',
    hint: 'Trainer, Fu"ball.',
    difficulty: 'mittel',
    sources: { text: 'Einmal im Leben muss ich das probieren.' }
  },
  {
    id: 'quote-die-lage-ist-ernst-aber-nicht-hoffnungslos',
    title: 'Ernst aber nicht hoffnungslos',
    category: 'quote',
    year: 1980,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Karl Valentin zugeschrieben "Die Lage ist hoffnungslos, aber nicht ernst." als kabarettistischer Wortdreher.',
    hint: 'Kabarett, Wortspiel.',
    difficulty: 'mittel',
    sources: { text: 'Die Lage ist hoffnungslos, aber nicht ernst.' }
  },
  {
    id: 'quote-zwei-dinge-unendlich',
    title: 'Zwei Dinge sind unendlich',
    category: 'quote',
    year: 1920,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Albert Einstein zugeschrieben "Zwei Dinge sind unendlich: das Universum und die menschliche Dummheit"" als oft erz"hlte Anekdote.',
    hint: 'Physiker, Relativit"t.',
    difficulty: 'mittel',
    sources: { text: 'Zwei Dinge sind unendlich: das Universum und die menschliche Dummheit; aber beim Universum bin ich mir nicht ganz sicher.' }
  },
  {
    id: 'quote-keep-calm',
    title: 'Keep calm',
    category: 'quote',
    year: 1939,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Britisches Motiv, 1939 "Keep calm and carry on." als Propagandaposter zu Beginn des Zweiten Weltkriegs.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Yoda, 1999 "Furcht ist der Pfad zur dunklen Seite." in Star Wars: Episode I als Warnung an Anakin.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Game of Thrones, 2011 "Winter is coming." als Motto des Hauses Stark in der Pilotfolge.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Game of Thrones, 2012 "Valar Morghulis." als Gru"formel der Faceless Men in Braavos.',
    hint: 'Alte Sprache, jeder muss sterben.',
    difficulty: 'mittel',
    sources: {
      text: 'Valar Morghulis.',
      textDe: 'Alle Menschen müssen sterben.'
    }
  },
  {
    id: 'quote-alles-nur-geliehen',
    title: 'Alles nur geliehen',
    category: 'quote',
    year: 1998,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Heinz Schenk/Klaus Lage „ Älles nur geliehen." als Schlagerzeile und Fernseh-Scherz.',
    hint: 'Deutscher Schlager/Witz.',
    difficulty: 'leicht',
    sources: { text: 'Alles nur geliehen.' }
  },
  {
    id: 'quote-ich-habe-fertig',
    title: 'Ich habe fertig',
    category: 'quote',
    year: 1998,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Giovanni Trapattoni, 1998 "Ich habe fertig." in der legend"ren Bayern-Pressekonferenz.',
    hint: 'Trainer-Pressekonferenz Bayern.',
    difficulty: 'leicht',
    sources: { text: 'Ich habe fertig.' }
  },
  {
    id: 'quote-flasche-leer',
    title: 'Flasche leer',
    category: 'quote',
    year: 1998,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Giovanni Trapattoni, 1998 "Flasche leer!" in derselben Bayern-Pressekonferenz als Kritik am Team.',
    hint: 'Trainer-Pressekonferenz.',
    difficulty: 'leicht',
    sources: { text: 'Flasche leer!' }
  },
  {
    id: 'quote-ich-bin-zu-alt-fuer-diesen-mist',
    title: 'Zu alt für diesen Mist',
    category: 'quote',
    year: 1987,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Roger Murtaugh (Lethal Weapon), 1987 "I"m too old for this"" im Buddy-Cop-Film als resignierter Kommentar.',
    hint: 'Actionfilm Buddy-Cop.',
    difficulty: 'leicht',
    sources: {
      text: "I'm too old for this shit.",
      textDe: 'Ich bin zu alt für diesen Mist.'
    }
  },
  {
    id: 'quote-ich-bin-dein-vater',
    title: 'Ich bin dein Vater',
    category: 'quote',
    year: 1980,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Darth Vader, 1980 "No, I am your father." im Duell auf Cloud City (Star Wars Episode V).',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Jürgen Klopp, 2014 "Wir müssen immer weiter machen." auf einer Pressekonferenz nach einem Spiel.',
    hint: 'Trainer, Bundesliga.',
    difficulty: 'leicht',
    sources: { text: 'Wir müssen immer weiter machen.' }
  },
  {
    id: 'quote-keine-macht-den-drogen',
    title: 'Keine Macht den Drogen',
    category: 'quote',
    year: 1990,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Präventionskampagne, 1990er "Keine Macht den Drogen." als Slogan der Jugendprävention.',
    hint: 'Jugendkampagne.',
    difficulty: 'mittel',
    sources: { text: 'Keine Macht den Drogen.' }
  },
  {
    id: 'quote-die-rente-ist-sicher',
    title: 'Die Rente ist sicher',
    category: 'quote',
    year: 1986,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Norbert Bl"m "Die Rente ist sicher." in einer Pressekonferenz zur Rentenreform.',
    hint: 'Bundesarbeitsminister.',
    difficulty: 'mittel',
    sources: { text: 'Die Rente ist sicher.' }
  },
  {
    id: 'quote-ich-bin-dann-mal-weg-zitat',
    title: 'Ich bin dann mal weg (Zitat)',
    category: 'quote',
    year: 2006,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Hape Kerkeling — Buchtitel und gefl"geltes Wort "ber seine Pilgerreise auf dem Jakobsweg.',
    hint: 'Comedian, Jakobsweg.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dann mal weg.' }
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Star Wars: Episode IV – Ikonischer Satz der Saga.',
    hint: 'Science-Fiction-Klassiker.',
    difficulty: 'leicht',
    sources: {
      text: '"May the Force be with you."',
      textDe: 'Möge die Macht mit dir sein.'
    }
  },
  {
    id: 'quote-im-gonna-make-him',
    title: 'I\'m gonna make him an offer',
    category: 'quote',
    year: 1972,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Forrest Gump – Forrest Gump (Tom Hanks).',
    hint: 'Oscar-prämiertes Drama.',
    difficulty: 'leicht',
    sources: {
      text: '"Life is like a box of chocolates. You never know what you\'re gonna get."',
      textDe: 'Das Leben ist wie eine Schachtel Pralinen, man weiü nie, was man kriegt.'
    }
  },
  {
    id: 'quote-ill-be-back',
    title: 'I\'ll be back',
    category: 'quote',
    year: 1984,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'The Sixth Sense – Cole Sear (Haley Joel Osment).',
    hint: 'Übernatürlicher Thriller mit Twist.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Vom Winde verweht – Rhett Butler (Clark Gable).',
    hint: 'Historisches Epos um den amerikanischen Bürgerkrieg.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'A Few Good Men – Colonel Jessup (Jack Nicholson).',
    hint: 'Gerichtsdrama im Militärkontext.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Game of Thrones – Motto der Stark-Familie.',
    hint: 'Fantasy-Serie basierend auf Büchern von George R. R. Martin.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Breaking Bad – Walter White (Bryan Cranston).',
    hint: 'Drogendrama über einen Chemielehrer.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'The Office (US) – Michael Scott (Steve Carell).',
    hint: 'Mockumentary-Comedy im Büro.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Friends – Joey Tribbiani (Matt LeBlanc).',
    hint: 'Sitcom über sechs Freunde in New York.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Titanic – Jack Dawson (Leonardo DiCaprio).',
    hint: 'Romantisches Drama auf der Titanic.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'m the king of the world!"',
      textDe: 'Ich bin der König der Welt!'
    }
  },
  {
    id: 'quote-i-am-your-father',
    title: 'I am your father',
    category: 'quote',
    year: 1980,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Star Wars: Episode V – Darth Vader.',
    hint: 'Berühmter Plot Twist in Star Wars.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Der Pate II – Michael Corleone.',
    hint: 'Fortsetzung des Mafia-Epos.',
    difficulty: 'mittel',
    sources: {
      text: '"Keep your friends close, but your enemies closer."',
      textDe: 'Halte deine Freunde nah, aber deine Feinde noch näher.'
    }
  },
  {
    id: 'quote-say-hello-to-my-little-friend',
    title: 'Say hello to my little friend',
    category: 'quote',
    year: 1983,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Scarface – Tony Montana (Al Pacino).',
    hint: 'Gangsterfilm über den Aufstieg und Fall eines Drogenbosses.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Top Gun – Maverick und Goose.',
    hint: 'Action-Film über Kampfpiloten.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Jerry Maguire – Dorothy Boyd (Renée Zellweger).',
    hint: 'Romantisches Drama über einen Sportagenten.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'The Matrix – Spoon Boy.',
    hint: 'Science-Fiction über simulierte Realität.',
    difficulty: 'leicht',
    sources: {
      text: '"There is no spoon."',
      textDe: 'Es gibt keinen Löffel.'
    }
  },
  {
    id: 'quote-im-walking-here',
    title: 'I\'m walking here!',
    category: 'quote',
    year: 1969,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Midnight Cowboy – Ratso Rizzo (Dustin Hoffman).',
    hint: 'Drama über zwei Auüenseiter in New York.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Stirb langsam – John McClane (Bruce Willis).',
    hint: 'Action-Thriller in einem Hochhaus.',
    difficulty: 'leicht',
    sources: {
      text: '"Yippee-ki-yay, motherfucker!"',
      textDe: 'Yippee-ki-yay, Schweinebacke!'
    }
  },
  {
    id: 'quote-you-shall-not-pass',
    title: 'You shall not pass',
    category: 'quote',
    year: 2001,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Der Herr der Ringe: Die Gefährten – Gandalf.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Harry Potter und die Heiligtümer des Todes – Teil 2 – Severus Snape.',
    hint: 'Abschluss der Harry Potter-Filmreihe.',
    difficulty: 'leicht',
    sources: {
      text: 'Älways."',
      textDe: 'Immer.'
    }
  },
  {
    id: 'quote-just-keep-swimming',
    title: 'Just keep swimming',
    category: 'quote',
    year: 2003,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Findet Nemo – Dory.',
    hint: 'Pixar-Animationsfilm über einen Clownfisch.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    'answer': 'Toy Story – Buzz Lightyear.',
    hint: 'Erster vollständig computeranimierter Spielfilm.',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
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
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'What Is Love – Haddaway.',
    hint: 'Eurodance-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"What is love? Baby don\'t hurt me, don\'t hurt me, no more."',
      textDe: 'Was ist Liebe? Baby, tu mir nicht weh, tu mir nicht weh, nicht mehr.'
    }
  },
  {
    id: 'quote-sweet-child-o-mine',
    title: 'Sweet Child O\' Mine',
    category: 'quote',
    year: 1987,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Sweet Child O\' Mine – Guns N\' Roses.',
    hint: 'Hard-Rock-Klassiker.',
    difficulty: 'mittel',
    sources: {
      text: '"Where do we go now?"',
      textDe: 'Wo gehen wir jetzt hin?'
    }
  },
  {
    id: 'quote-i-want-to-break-free',
    title: 'I Want to Break Free',
    category: 'quote',
    year: 1984,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'I Want to Break Free – Queen.',
    hint: 'Rock-Hymne über Befreiung.',
    difficulty: 'mittel',
    sources: {
      text: '"I want to break free."',
      textDe: 'Ich will frei sein.'
    }
  },
  {
    id: 'quote-dont-stop-believin',
    title: 'Don\'t Stop Believin\'',
    category: 'quote',
    year: 1981,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Don\'t Stop Believin\' – Journey.',
    hint: 'Arena-Rock-Hymne.',
    difficulty: 'leicht',
    sources: {
      text: '"Don\'t stop believin\', hold on to that feelin\'."',
      textDe: 'Hör nicht auf zu glauben, halt an diesem Gefühl fest.'
    }
  },
  {
    id: 'quote-imagine-all-the-people',
    title: 'Imagine',
    category: 'quote',
    year: 1971,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Imagine – John Lennon.',
    hint: 'Friedenshymne eines Beatles.',
    difficulty: 'leicht',
    sources: {
      text: '"Imagine all the people, living life in peace."',
      textDe: 'Stell dir vor, alle Menschen leben in Frieden.'
    }
  },
  {
    id: 'quote-we-are-the-champions',
    title: 'We Are the Champions',
    category: 'quote',
    year: 1977,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'We Are the Champions – Queen.',
    hint: 'Siegeshymne im Sport.',
    difficulty: 'leicht',
    sources: {
      text: '"We are the champions, my friends."',
      textDe: 'Wir sind die Meister, meine Freunde.'
    }
  },
  {
    id: 'quote-every-breath-you-take',
    title: 'Every Breath You Take',
    category: 'quote',
    year: 1983,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Every Breath You Take – The Police.',
    hint: 'Song über Besessenheit.',
    difficulty: 'mittel',
    sources: {
      text: '"Every breath you take, every move you make, I\'ll be watching you."',
      textDe: 'Jeden Atemzug, den du nimmst, jede Bewegung, die du machst, ich werde dich beobachten.'
    }
  },
  {
    id: 'quote-smells-like-teen-spirit-lyric',
    title: 'Smells Like Teen Spirit (Lyric)',
    category: 'quote',
    year: 1991,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Smells Like Teen Spirit – Nirvana.',
    hint: 'Grunge-Hymne der 90er.',
    difficulty: 'mittel',
    sources: {
      text: '"Here we are now, entertain us."',
      textDe: 'Hier sind wir jetzt, unterhalte uns.'
    }
  },
  {
    id: 'quote-livin-on-a-prayer',
    title: 'Livin\' on a Prayer',
    category: 'quote',
    year: 1986,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Livin\' on a Prayer – Bon Jovi.',
    hint: 'Rock-Anthem der 80er.',
    difficulty: 'leicht',
    sources: {
      text: '"Whoa, we\'re halfway there, whoa-oh, livin\' on a prayer."',
      textDe: 'Whoa, wir sind auf halbem Weg, whoa-oh, leben auf einem Gebet.'
    }
  },
  {
    id: 'quote-lose-yourself',
    title: 'Lose Yourself',
    category: 'quote',
    year: 2002,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Lose Yourself – Eminem.',
    hint: 'Rap-Song aus dem Film 8 Mile.',
    difficulty: 'leicht',
    sources: {
      text: '"You only get one shot, do not miss your chance to blow."',
      textDe: 'Du hast nur eine Chance, verpasse sie nicht.'
    }
  },
  {
    id: 'quote-hey-jude',
    title: 'Hey Jude',
    category: 'quote',
    year: 1968,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Hey Jude – The Beatles.',
    hint: 'Längster Beatles-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"Hey Jude, don\'t make it bad, take a sad song and make it better."',
      textDe: 'Hey Jude, mach es nicht schlecht, nimm ein trauriges Lied und mach es besser.'
    }
  },
  {
    id: 'quote-hotel-california',
    title: 'Hotel California',
    category: 'quote',
    year: 1976,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Hotel California – Eagles.',
    hint: 'Klassischer Rock über den American Dream.',
    difficulty: 'mittel',
    sources: {
      text: '"You can check out any time you like, but you can never leave."',
      textDe: 'Du kannst auschecken, wann du willst, aber du kannst niemals gehen.'
    }
  },
  {
    id: 'quote-stairway-to-heaven',
    title: 'Stairway to Heaven',
    category: 'quote',
    year: 1971,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Stairway to Heaven – Led Zeppelin.',
    hint: 'Epischer Rock-Song.',
    difficulty: 'mittel',
    sources: {
      text: 'Änd she\'s buying a stairway to heaven."',
      textDe: 'Und sie kauft eine Treppe zum Himmel.'
    }
  },
  {
    id: 'quote-somebody-to-love',
    title: 'Somebody to Love',
    category: 'quote',
    year: 1976,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Somebody to Love – Queen.',
    hint: 'Gospel-beeinflusster Rock.',
    difficulty: 'mittel',
    sources: {
      text: '"Can anybody find me somebody to love?"',
      textDe: 'Kann mir jemand jemanden finden, den ich lieben kann?'
    }
  },
  {
    id: 'quote-billie-jean-lyric',
    title: 'Billie Jean (Lyric)',
    category: 'quote',
    year: 1982,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Billie Jean – Michael Jackson.',
    hint: 'King of Pop.',
    difficulty: 'leicht',
    sources: {
      text: '"Billie Jean is not my lover, she\'s just a girl who claims that I am the one."',
      textDe: 'Billie Jean ist nicht meine Geliebte, sie ist nur ein Mädchen, das behauptet, ich sei der Eine.'
    }
  },
  {
    id: 'quote-thriller',
    title: 'Thriller',
    category: 'quote',
    year: 1982,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Thriller – Michael Jackson.',
    hint: 'Meistverkauftes Album aller Zeiten.',
    difficulty: 'leicht',
    sources: {
      text: '"\'Cause this is thriller, thriller night."',
      textDe: 'Denn das ist Thriller, Thriller-Nacht.'
    }
  },
  {
    id: 'quote-like-a-virgin',
    title: 'Like a Virgin',
    category: 'quote',
    year: 1984,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Like a Virgin – Madonna.',
    hint: 'Pop-Ikone der 80er.',
    difficulty: 'leicht',
    sources: {
      text: '"Like a virgin, touched for the very first time."',
      textDe: 'Wie eine Jungfrau, zum allerersten Mal berührt.'
    }
  },
  {
    id: 'quote-i-will-always-love-you',
    title: 'I Will Always Love You',
    category: 'quote',
    year: 1992,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'I Will Always Love You – Whitney Houston.',
    hint: 'Power-Ballade aus The Bodyguard.',
    difficulty: 'leicht',
    sources: {
      text: 'Änd I will always love you."',
      textDe: 'Und ich werde dich immer lieben.'
    }
  },
  {
    id: 'quote-rolling-in-the-deep-lyric',
    title: 'Rolling in the Deep (Lyric)',
    category: 'quote',
    year: 2010,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Rolling in the Deep – Adele.',
    hint: 'Soul-Pop-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"We could have had it all, rolling in the deep."',
      textDe: 'Wir hätten alles haben können, rolling in the deep.'
    }
  },
  {
    id: 'quote-somebody-that-i-used-to-know',
    title: 'Somebody That I Used to Know',
    category: 'quote',
    year: 2011,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Somebody That I Used to Know – Gotye.',
    hint: 'Indie-Pop-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"Now you\'re just somebody that I used to know."',
      textDe: 'Jetzt bist du nur noch jemand, den ich kannte.'
    }
  },
  {
    id: 'quote-happy',
    title: 'Happy',
    category: 'quote',
    year: 2013,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Happy – Pharrell Williams.',
    hint: 'Feelgood-Song aus Despicable Me 2.',
    difficulty: 'leicht',
    sources: {
      text: '"Because I\'m happy, clap along if you feel like a room without a roof."',
      textDe: 'Weil ich glücklich bin, klatsch mit, wenn du dich fühlst wie ein Raum ohne Dach.'
    }
  },
  {
    id: 'quote-uptown-funk',
    title: 'Uptown Funk',
    category: 'quote',
    year: 2014,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Uptown Funk – Mark Ronson ft. Bruno Mars.',
    hint: 'Funk-Pop-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"Don\'t believe me, just watch."',
      textDe: 'Glaub mir nicht, schau einfach zu.'
    }
  },
  {
    id: 'quote-shape-of-you',
    title: 'Shape of You',
    category: 'quote',
    year: 2017,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Shape of You – Ed Sheeran.',
    hint: 'Meistgestreamter Song auf Spotify.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'m in love with the shape of you."',
      textDe: 'Ich bin verliebt in deine Form.'
    }
  },
  {
    id: 'quote-thinking-out-loud',
    title: 'Thinking Out Loud',
    category: 'quote',
    year: 2014,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Thinking Out Loud – Ed Sheeran.',
    hint: 'Romantische Ballade.',
    difficulty: 'leicht',
    sources: {
      text: '"When your legs don\'t work like they used to before."',
      textDe: 'Wenn deine Beine nicht mehr so funktionieren wie früher.'
    }
  },
  {
    id: 'quote-despacito',
    title: 'Despacito',
    category: 'quote',
    year: 2017,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Despacito – Luis Fonsi ft. Daddy Yankee.',
    hint: 'Lateinamerikanischer Welthit.',
    difficulty: 'leicht',
    sources: {
      text: '"Despacito, quiero respirar tu cuello despacito."',
      textDe: 'Langsam, ich will langsam deinen Hals atmen.'
    }
  },
  {
    id: 'quote-old-town-road',
    title: 'Old Town Road',
    category: 'quote',
    year: 2019,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Old Town Road – Lil Nas X.',
    hint: 'Country-Rap-Crossover.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'m gonna take my horse to the old town road."',
      textDe: 'Ich nehme mein Pferd zur alten Stadtstraüe.'
    }
  },
  {
    id: 'quote-blinding-lights',
    title: 'Blinding Lights',
    category: 'quote',
    year: 2019,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Blinding Lights – The Weeknd.',
    hint: 'Synthwave-Pop-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"I said, ooh, I\'m blinded by the lights."',
      textDe: 'Ich sagte, ooh, ich bin geblendet von den Lichtern.'
    }
  },
  {
    id: 'quote-bad-guy',
    title: 'bad guy',
    category: 'quote',
    year: 2019,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'bad guy – Billie Eilish.',
    hint: 'Alternative Pop von Billie Eilish.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'m the bad guy, duh."',
      textDe: 'Ich bin der Bösewicht, duh.'
    }
  },
  {
    id: 'quote-senorita',
    title: 'Señorita',
    category: 'quote',
    year: 2019,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Señorita – Shawn Mendes & Camila Cabello.',
    hint: 'Duett zweier Pop-Stars.',
    difficulty: 'leicht',
    sources: {
      text: '"I love it when you call me señorita."',
      textDe: 'Ich liebe es, wenn du mich Señorita nennst.'
    }
  },
  {
    id: 'quote-believer',
    title: 'Believer',
    category: 'quote',
    year: 2017,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Believer – Imagine Dragons.',
    hint: 'Alternative Rock-Hymne.',
    difficulty: 'leicht',
    sources: {
      text: '"Pain! You made me a, you made me a believer, believer."',
      textDe: 'Schmerz! Du hast mich zu einem, du hast mich zu einem Gläubigen gemacht.'
    }
  },
  {
    id: 'quote-radioactive',
    title: 'Radioactive',
    category: 'quote',
    year: 2012,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Radioactive – Imagine Dragons.',
    hint: 'Alternative Rock über Neuanfang.',
    difficulty: 'leicht',
    sources: {
      text: '"I\'m radioactive, radioactive."',
      textDe: 'Ich bin radioaktiv, radioaktiv.'
    }
  },
  {
    id: 'quote-cant-stop-the-feeling',
    title: 'Can\'t Stop the Feeling!',
    category: 'quote',
    year: 2016,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Can\'t Stop the Feeling! – Justin Timberlake.',
    hint: 'Pop-Song aus Trolls.',
    difficulty: 'leicht',
    sources: {
      text: '"I got that sunshine in my pocket."',
      textDe: 'Ich habe den Sonnenschein in meiner Tasche.'
    }
  },
  {
    id: 'quote-counting-stars',
    title: 'Counting Stars',
    category: 'quote',
    year: 2013,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Counting Stars – OneRepublic.',
    hint: 'Pop-Rock über Träume.',
    difficulty: 'leicht',
    sources: {
      text: '"Lately I\'ve been, I\'ve been losing sleep, dreaming about the things that we could be."',
      textDe: 'In letzter Zeit habe ich Schlaf verloren, träumend von den Dingen, die wir sein könnten.'
    }
  },
  {
    id: 'quote-let-it-go',
    title: 'Let It Go',
    category: 'quote',
    year: 2013,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Let It Go – Idina Menzel (Die Eiskönigin).',
    hint: 'Disney-Song aus Frozen.',
    difficulty: 'leicht',
    sources: {
      text: '"Let it go, let it go, can\'t hold it back anymore."',
      textDe: 'Lass es los, lass es los, kann es nicht mehr zurückhalten.'
    }
  },
  {
    id: 'quote-wannabe',
    title: 'Wannabe',
    category: 'quote',
    year: 1996,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Wannabe – Spice Girls.',
    hint: 'Debut-Hit der Spice Girls.',
    difficulty: 'leicht',
    sources: {
      text: '"If you wanna be my lover, you gotta get with my friends."',
      textDe: 'Wenn du mein Liebhaber sein willst, musst du dich mit meinen Freunden verstehen.'
    }
  },
  {
    id: 'quote-baby-one-more-time',
    title: '...Baby One More Time',
    category: 'quote',
    year: 1998,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: '...Baby One More Time – Britney Spears.',
    hint: 'Britney Spears\' Durchbruch.',
    difficulty: 'leicht',
    sources: {
      text: '"Hit me baby one more time."',
      textDe: 'Triff mich, Baby, noch ein Mal.'
    }
  },
  {
    id: 'quote-toxic',
    title: 'Toxic',
    category: 'quote',
    year: 2003,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Toxic – Britney Spears.',
    hint: 'Pop-Hit mit Streichern.',
    difficulty: 'leicht',
    sources: {
      text: '"With a taste of your lips, I\'m on a ride."',
      textDe: 'Mit einem Geschmack deiner Lippen bin ich auf einer Fahrt.'
    }
  },
  {
    id: 'quote-umbrella',
    title: 'Umbrella',
    category: 'quote',
    year: 2007,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Umbrella – Rihanna ft. Jay-Z.',
    hint: 'Pop-R&B-Hit.',
    difficulty: 'leicht',
    sources: {
      text: 'Ünder my umbrella, ella, ella, eh, eh, eh."',
      textDe: 'Unter meinem Regenschirm, ella, ella, eh, eh, eh.'
    }
  },
  {
    id: 'quote-viva-la-vida',
    title: 'Viva la Vida',
    category: 'quote',
    year: 2008,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Viva la Vida – Coldplay.',
    hint: 'Alternative Rock inspiriert von Revolution.',
    difficulty: 'leicht',
    sources: {
      text: '"I used to rule the world."',
      textDe: 'Ich herrschte einst über die Welt.'
    }
  },
  {
    id: 'quote-99-luftballons',
    title: '99 Luftballons',
    category: 'quote',
    year: 1983,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: '99 Luftballons – Nena.',
    hint: 'Deutscher New-Wave-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"99 Luftballons auf ihrem Weg zum Horizont."',
      textDe: '99 Luftballons auf ihrem Weg zum Horizont.'
    }
  },
  {
    id: 'quote-major-tom',
    title: 'Major Tom',
    category: 'quote',
    year: 1983,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Major Tom – Peter Schilling.',
    hint: 'Deutscher New-Wave-Song über Raumfahrer.',
    difficulty: 'mittel',
    sources: {
      text: '"Völlig losgelöst von der Erde."',
      textDe: 'Völlig losgelöst von der Erde.'
    }
  },
  {
    id: 'quote-atemlos',
    title: 'Atemlos durch die Nacht',
    category: 'quote',
    year: 2013,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Atemlos durch die Nacht – Helene Fischer.',
    hint: 'Deutscher Schlager-Hit.',
    difficulty: 'leicht',
    sources: {
      text: 'Ätemlos durch die Nacht."',
      textDe: 'Atemlos durch die Nacht.'
    }
  },
  {
    id: 'quote-dont-worry-be-happy',
    title: 'Don\'t Worry, Be Happy',
    category: 'quote',
    year: 1988,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Don\'t Worry, Be Happy – Bobby McFerrin.',
    hint: 'A-cappella-Hit.',
    difficulty: 'leicht',
    sources: {
      text: '"Don\'t worry, be happy."',
      textDe: 'Mach dir keine Sorgen, sei glücklich.'
    }
  },
  {
    id: 'quote-all-star',
    title: 'All Star',
    category: 'quote',
    year: 1999,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'All Star – Smash Mouth.',
    hint: 'Rock-Song aus Shrek.',
    difficulty: 'leicht',
    sources: {
      text: '"Somebody once told me the world is gonna roll me."',
      textDe: 'Jemand hat mir mal gesagt, die Welt wird mich überrollen.'
    }
  },
  {
    id: 'quote-mr-brightside',
    title: 'Mr. Brightside',
    category: 'quote',
    year: 2003,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Mr. Brightside – The Killers.',
    hint: 'Alternative Rock über Eifersucht.',
    difficulty: 'leicht',
    sources: {
      text: '"It was only a kiss, how did it end up like this?"',
      textDe: 'Es war nur ein Kuss, wie endete es so?'
    }
  },
  {
    id: 'quote-take-on-me',
    title: 'Take On Me',
    category: 'quote',
    year: 1985,
    cue: 'Woher und aus welchem Jahr stammt das nachfolgende Zitat?',
    answer: 'Take On Me – a-ha.',
    hint: 'Synthpop mit ikonischem Video.',
    difficulty: 'leicht',
    sources: {
      text: '"Take on me, take me on."',
      textDe: 'Nimm mich an, nimm mich mit.'
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


