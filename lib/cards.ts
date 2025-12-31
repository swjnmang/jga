import { Card } from './types';
import { playlistCards } from './playlistCards';
import { flagCards } from './flagCards';
import { outlineCards } from './outlineCards';
import { triviaExtraCards } from './triviaExtraCards';

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
    id: 'quote-hatte-hatte-fahrradkette',
    title: 'Hätte, hätte, Fahrradkette',
    category: 'quote',
    year: 2013,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Lothar Matthäus, 2013 – „Hätte, hätte, Fahrradkette.“',
    hint: 'Fußballweltmeister, TV-Experte.',
    difficulty: 'leicht',
    sources: { text: 'Hätte, hätte, Fahrradkette.' }
  },
  {
    id: 'quote-mailand-oder-madrid',
    title: 'Mailand oder Madrid',
    category: 'quote',
    year: 1998,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Andreas Möller, 1998 – „Mailand oder Madrid – Hauptsache Italien.“',
    hint: 'Dortmunder Offensivspieler.',
    difficulty: 'leicht',
    sources: { text: 'Mailand oder Madrid – Hauptsache Italien.' }
  },
  {
    id: 'quote-mr-gorbachev-tear-down-this-wall',
    title: 'Tear down this wall',
    category: 'quote',
    year: 1987,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Ronald Reagan, 1987 – „Mr. Gorbachev, tear down this wall!“',
    hint: 'US-Präsident, Brandenburger Tor.',
    difficulty: 'mittel',
    sources: { text: 'Mr. Gorbachev, tear down this wall!' }
  },
  {
    id: 'quote-houston-we-have-a-problem',
    title: 'Houston, we have a problem',
    category: 'quote',
    year: 1970,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Apollo-13-Besatzung, 1970 – „Houston, we have a problem.“',
    hint: 'NASA, Raumfahrt.',
    difficulty: 'mittel',
    sources: { text: 'Houston, we have a problem.' }
  },
  {
    id: 'quote-ein-kleiner-schritt',
    title: 'One small step',
    category: 'quote',
    year: 1969,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Neil Armstrong, 1969 – „That’s one small step for (a) man…“',
    hint: 'Mondlandung.',
    difficulty: 'leicht',
    sources: { text: "That's one small step for man, one giant leap for mankind." }
  },
  {
    id: 'quote-wir-schaffen-das',
    title: 'Wir schaffen das',
    category: 'quote',
    year: 2015,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Angela Merkel, 2015 – „Wir schaffen das.“',
    hint: 'Bundeskanzlerin zur Flüchtlingskrise.',
    difficulty: 'leicht',
    sources: { text: 'Wir schaffen das.' }
  },
  {
    id: 'quote-ich-bin-dann-mal-weg',
    title: 'Ich bin dann mal weg',
    category: 'quote',
    year: 2006,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Hape Kerkeling, 2006 – „Ich bin dann mal weg.“',
    hint: 'Autor, Jakobsweg.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dann mal weg.' }
  },
  {
    id: 'quote-wenn-der-wind-des-wandels',
    title: 'Wind des Wandels',
    category: 'quote',
    year: 1989,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Chinesisches Sprichwort, populär 1989 – „Wenn der Wind des Wandels weht…“',
    hint: 'Sprichwort, Wind des Wandels.',
    difficulty: 'mittel',
    sources: { text: 'Wenn der Wind des Wandels weht, bauen manche Mauern, andere Windmühlen.' }
  },
  {
    id: 'quote-zwei-seelen-wohnen',
    title: 'Zwei Seelen wohnen',
    category: 'quote',
    year: 1808,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Goethe, Faust I (ca. 1808) – „Zwei Seelen wohnen, ach! in meiner Brust.“',
    hint: 'Deutscher Dichter, Faust.',
    difficulty: 'mittel',
    sources: { text: 'Zwei Seelen wohnen, ach! in meiner Brust.' }
  },
  {
    id: 'quote-sein-oder-nichtsein',
    title: 'Sein oder Nichtsein',
    category: 'quote',
    year: 1600,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'William Shakespeare, Hamlet (ca. 1600) – „To be, or not to be…“',
    hint: 'Englischer Dramatiker.',
    difficulty: 'mittel',
    sources: { text: 'To be, or not to be, that is the question.' }
  },
  {
    id: 'quote-ich-denke-also-bin-ich',
    title: 'Cogito ergo sum',
    category: 'quote',
    year: 1637,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'René Descartes, 1637 – „Cogito, ergo sum.“',
    hint: 'Französischer Philosoph.',
    difficulty: 'mittel',
    sources: { text: 'Cogito, ergo sum.' }
  },
  {
    id: 'quote-der-weg-ist-das-ziel',
    title: 'Der Weg ist das Ziel',
    category: 'quote',
    year: 1970,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Laozi zugeschrieben; populär 20. Jh. – „Der Weg ist das Ziel.“',
    hint: 'Chinesische Philosophie.',
    difficulty: 'leicht',
    sources: { text: 'Der Weg ist das Ziel.' }
  },
  {
    id: 'quote-wer-andere-besiegt-ist-stark',
    title: 'Besiegt ist stark',
    category: 'quote',
    year: 500,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Laozi zugeschrieben – „Wer andere besiegt, ist stark; wer sich selbst besiegt, ist mächtig.“',
    hint: 'Daoismus.',
    difficulty: 'mittel',
    sources: { text: 'Wer andere besiegt, ist stark; wer sich selbst besiegt, ist mächtig.' }
  },
  {
    id: 'quote-zeit-ist-geld',
    title: 'Zeit ist Geld',
    category: 'quote',
    year: 1748,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Benjamin Franklin, 1748 – „Time is money.“',
    hint: 'US-Staatsmann, Erfinder.',
    difficulty: 'leicht',
    sources: { text: 'Time is money.' }
  },
  {
    id: 'quote-ich-weiß-dass-ich-nichts-weiß',
    title: 'Sokrates Nichtwissen',
    category: 'quote',
    year: -400,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Sokrates zugeschrieben – „Ich weiß, dass ich nichts weiß.“',
    hint: 'Antike Philosophie.',
    difficulty: 'mittel',
    sources: { text: 'Ich weiß, dass ich nichts weiß.' }
  },
  {
    id: 'quote-alles-wird-gut',
    title: 'Alles wird gut',
    category: 'quote',
    year: 2000,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Beruhigungsfloskel, 2000er – „Alles wird gut.“',
    hint: 'Redensart, Trost.',
    difficulty: 'leicht',
    sources: { text: 'Alles wird gut.' }
  },
  {
    id: 'quote-mach-dein-ding',
    title: 'Mach dein Ding',
    category: 'quote',
    year: 2010,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Herbert Grönemeyer, 2014 – „Mach dein Ding.“',
    hint: 'Deutscher Musiker.',
    difficulty: 'leicht',
    sources: { text: 'Mach dein Ding.' }
  },
  {
    id: 'quote-ich-bin-dumm-und-das-ist-gut-so',
    title: 'Ich bin dumm',
    category: 'quote',
    year: 2010,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Patrick Star (SpongeBob), 2010er – „Ich bin dumm, und das ist gut so.“',
    hint: 'Zeichentrick-Seestern.',
    difficulty: 'leicht',
    sources: { text: 'Ich bin dumm, und das ist gut so.' }
  },
  {
    id: 'quote-ziel-ist-der-weg',
    title: 'Ziel ist der Weg',
    category: 'quote',
    year: 2015,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Abwandlung, 2010er – „Das Ziel ist der Weg.“',
    hint: 'Umkehr des bekannten Spruchs.',
    difficulty: 'leicht',
    sources: { text: 'Das Ziel ist der Weg.' }
  },
  {
    id: 'quote-ich-habe-einen-traum',
    title: 'I have a dream',
    category: 'quote',
    year: 1963,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Martin Luther King Jr., 1963 – „I have a dream.“',
    hint: 'US-Bürgerrechtler.',
    difficulty: 'leicht',
    sources: { text: 'I have a dream.' }
  },
  {
    id: 'quote-veni-vidi-vici',
    title: 'Veni vidi vici',
    category: 'quote',
    year: -47,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Julius Caesar, 47 v. Chr. – „Veni, vidi, vici.“',
    hint: 'Römischer Feldherr.',
    difficulty: 'mittel',
    sources: { text: 'Veni, vidi, vici.' }
  },
  {
    id: 'quote-keine-experimente',
    title: 'Keine Experimente',
    category: 'quote',
    year: 1957,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'CDU-Wahlkampfslogan, 1957 – „Keine Experimente!“',
    hint: 'Deutsche Nachkriegspolitik.',
    difficulty: 'mittel',
    sources: { text: 'Keine Experimente!' }
  },
  {
    id: 'quote-wir-sind-das-volk',
    title: 'Wir sind das Volk',
    category: 'quote',
    year: 1989,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Ruf der Montagsdemos, 1989 – „Wir sind das Volk.“',
    hint: 'DDR, Wendezeit.',
    difficulty: 'mittel',
    sources: { text: 'Wir sind das Volk.' }
  },
  {
    id: 'quote-sag-mir-wo-die-blumen-sind',
    title: 'Wo sind die Blumen',
    category: 'quote',
    year: 1955,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Pete Seeger/Marlen Dietrich, 1950er – „Sag mir, wo die Blumen sind…“',
    hint: 'Antikriegslied.',
    difficulty: 'mittel',
    sources: { text: 'Sag mir, wo die Blumen sind.' }
  },
  {
    id: 'quote-einmal-im-leben',
    title: 'Einmal im Leben',
    category: 'quote',
    year: 2006,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Jürgen Klopp, 2006 – „Ich dachte, einmal im Leben muss ich das probieren.“',
    hint: 'Trainer, Fußball.',
    difficulty: 'mittel',
    sources: { text: 'Einmal im Leben muss ich das probieren.' }
  },
  {
    id: 'quote-die-lage-ist-ernst-aber-nicht-hoffnungslos',
    title: 'Ernst aber nicht hoffnungslos',
    category: 'quote',
    year: 1980,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Karl Valentin zugeschrieben – „Die Lage ist hoffnungslos, aber nicht ernst.“ (oft vertauscht)',
    hint: 'Kabarett, Wortspiel.',
    difficulty: 'mittel',
    sources: { text: 'Die Lage ist hoffnungslos, aber nicht ernst.' }
  },
  {
    id: 'quote-zwei-dinge-unendlich',
    title: 'Zwei Dinge sind unendlich',
    category: 'quote',
    year: 1920,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Albert Einstein zugeschrieben – „Zwei Dinge sind unendlich: das Universum und die menschliche Dummheit…“',
    hint: 'Physiker, Relativität.',
    difficulty: 'mittel',
    sources: { text: 'Zwei Dinge sind unendlich: das Universum und die menschliche Dummheit; aber beim Universum bin ich mir nicht ganz sicher.' }
  },
  {
    id: 'quote-keep-calm',
    title: 'Keep calm',
    category: 'quote',
    year: 1939,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Britisches Motiv, 1939 – „Keep calm and carry on.“',
    hint: 'Britische Propaganda WWII.',
    difficulty: 'leicht',
    sources: { text: 'Keep calm and carry on.' }
  },
  {
    id: 'quote-furcht-ist-der-weg-zur-dunklen-seite',
    title: 'Furcht zur dunklen Seite',
    category: 'quote',
    year: 1999,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Yoda, 1999 – „Furcht ist der Pfad zur dunklen Seite.“',
    hint: 'Star Wars Jedi-Meister.',
    difficulty: 'leicht',
    sources: { text: 'Fear is the path to the dark side.' }
  },
  {
    id: 'quote-winter-is-coming',
    title: 'Winter is coming',
    category: 'quote',
    year: 2011,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Game of Thrones, 2011 – „Winter is coming.“',
    hint: 'Haus Stark.',
    difficulty: 'leicht',
    sources: { text: 'Winter is coming.' }
  },
  {
    id: 'quote-valar-morghulis',
    title: 'Valar Morghulis',
    category: 'quote',
    year: 2012,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Game of Thrones, 2012 – „Valar Morghulis.“',
    hint: 'Alte Sprache, jeder muss sterben.',
    difficulty: 'mittel',
    sources: { text: 'Valar Morghulis.' }
  },
  {
    id: 'quote-so-was-haben-wir-noch-nie-gesehen',
    title: 'So was haben wir noch nie gesehen',
    category: 'quote',
    year: 2001,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Kommentatorenphrase, 2001 – „So was haben wir noch nie gesehen.“',
    hint: 'Sport-Kommentar.',
    difficulty: 'leicht',
    sources: { text: 'So was haben wir noch nie gesehen.' }
  },
  {
    id: 'quote-zicke-zacke',
    title: 'Zicke zacke',
    category: 'quote',
    year: 1975,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Trinkspruch, 1970er – „Zicke zacke zicke zacke hoi hoi hoi.“',
    hint: 'Trinkspruch Stadion/Festzelt.',
    difficulty: 'leicht',
    sources: { text: 'Zicke zacke zicke zacke hoi hoi hoi.' }
  },
  {
    id: 'quote-prost',
    title: 'Prost',
    category: 'quote',
    year: 1950,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Trinkspruch – „Prost!“',
    hint: 'Anstoßen.',
    difficulty: 'leicht',
    sources: { text: 'Prost!' }
  },
  {
    id: 'quote-kein-plan-von-nix',
    title: 'Kein Plan von nix',
    category: 'quote',
    year: 2018,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Twitter-Redewendung, 2018 – „Kein Plan von nix.“',
    hint: 'Internet-Slang.',
    difficulty: 'leicht',
    sources: { text: 'Kein Plan von nix.' }
  },
  {
    id: 'quote-alles-nur-geliehen',
    title: 'Alles nur geliehen',
    category: 'quote',
    year: 1998,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Heinz Schenk/Klaus Lage – „Alles nur geliehen.“',
    hint: 'Deutscher Schlager/Witz.',
    difficulty: 'leicht',
    sources: { text: 'Alles nur geliehen.' }
  },
  {
    id: 'quote-ich-habe-fertig',
    title: 'Ich habe fertig',
    category: 'quote',
    year: 1998,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Giovanni Trapattoni, 1998 – „Ich habe fertig.“',
    hint: 'Trainer-Pressekonferenz Bayern.',
    difficulty: 'leicht',
    sources: { text: 'Ich habe fertig.' }
  },
  {
    id: 'quote-flasche-leer',
    title: 'Flasche leer',
    category: 'quote',
    year: 1998,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Giovanni Trapattoni, 1998 – „Flasche leer!“',
    hint: 'Trainer-Pressekonferenz.',
    difficulty: 'leicht',
    sources: { text: 'Flasche leer!' }
  },
  {
    id: 'quote-wer-hat-so-was-gewollt',
    title: 'Wer hat sowas gewollt',
    category: 'quote',
    year: 2020,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Social Media, 2020 – „Wer hat sowas gewollt?“',
    hint: 'Internet-Meme.',
    difficulty: 'leicht',
    sources: { text: 'Wer hat sowas gewollt?' }
  },
  {
    id: 'quote-wir-machen-das-jetzt-einfach',
    title: 'Wir machen das jetzt einfach',
    category: 'quote',
    year: 2021,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Startup-/Projekt-Slogan, 2021 – „Wir machen das jetzt einfach.“',
    hint: 'Tatkraft, Pragmatismus.',
    difficulty: 'mittel',
    sources: { text: 'Wir machen das jetzt einfach.' }
  },
  {
    id: 'quote-einmal-mit-profis',
    title: 'Einmal mit Profis',
    category: 'quote',
    year: 2014,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Internet-Spruch, 2010er – „Einmal mit Profis arbeiten…“',
    hint: 'Running Gag IT/Handwerk.',
    difficulty: 'leicht',
    sources: { text: 'Einmal mit Profis arbeiten…' }
  },
  {
    id: 'quote-ich-bin-zu-alt-fuer-diesen-mist',
    title: 'Zu alt für diesen Mist',
    category: 'quote',
    year: 1987,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Roger Murtaugh (Lethal Weapon), 1987 – „I’m too old for this…“',
    hint: 'Actionfilm Buddy-Cop.',
    difficulty: 'leicht',
    sources: { text: "I'm too old for this shit." }
  },
  {
    id: 'quote-ich-bin-dein-vater',
    title: 'Ich bin dein Vater',
    category: 'quote',
    year: 1980,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Darth Vader, 1980 – „No, I am your father.“',
    hint: 'Star Wars Episode V.',
    difficulty: 'leicht',
    sources: { text: 'No, I am your father.' }
  },
  {
    id: 'quote-unser-tagesziel',
    title: 'Unser Tagesziel',
    category: 'quote',
    year: 2019,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Agile Teams, 2019 – „Was ist heute unser Tagesziel?“',
    hint: 'Daily Standup.',
    difficulty: 'mittel',
    sources: { text: 'Was ist heute unser Tagesziel?' }
  },
  {
    id: 'quote-heute-schon-gelebt',
    title: 'Heute schon gelebt',
    category: 'quote',
    year: 2005,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Lebensmotto, 2000er – „Hast du heute schon gelebt?“',
    hint: 'Kalenderspruch.',
    difficulty: 'leicht',
    sources: { text: 'Hast du heute schon gelebt?' }
  },
  {
    id: 'quote-bitte-der-nächste',
    title: 'Bitte der Nächste',
    category: 'quote',
    year: 1990,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Warteschlangen-Spruch – „Bitte der Nächste.“',
    hint: 'Alltag, Behörde.',
    difficulty: 'leicht',
    sources: { text: 'Bitte der Nächste.' }
  },
  {
    id: 'quote-immer-weiter',
    title: 'Immer weiter',
    category: 'quote',
    year: 2014,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Jürgen Klopp, 2014 – „Wir müssen immer weiter machen.“',
    hint: 'Trainer, Bundesliga.',
    difficulty: 'leicht',
    sources: { text: 'Wir müssen immer weiter machen.' }
  },
  {
    id: 'quote-keine-macht-den-drogen',
    title: 'Keine Macht den Drogen',
    category: 'quote',
    year: 1990,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Präventionskampagne, 1990er – „Keine Macht den Drogen.“',
    hint: 'Jugendkampagne.',
    difficulty: 'mittel',
    sources: { text: 'Keine Macht den Drogen.' }
  },
  {
    id: 'quote-machen-ist-wie-wollen-nur-krasser',
    title: 'Machen ist wie wollen',
    category: 'quote',
    year: 2018,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Spruch 2010er – „Machen ist wie wollen, nur krasser.“',
    hint: 'Motivation, Social Media.',
    difficulty: 'leicht',
    sources: { text: 'Machen ist wie wollen, nur krasser.' }
  },
  {
    id: 'quote-die-rente-ist-sicher',
    title: 'Die Rente ist sicher',
    category: 'quote',
    year: 1986,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Norbert Blüm, 1986 – „Die Rente ist sicher.“',
    hint: 'Bundesarbeitsminister.',
    difficulty: 'mittel',
    sources: { text: 'Die Rente ist sicher.' }
  },
  {
    id: 'quote-no-risk-no-fun',
    title: 'No risk no fun',
    category: 'quote',
    year: 1995,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Spruch 1990er – „No risk, no fun.“',
    hint: 'Jugend-Redensart.',
    difficulty: 'leicht',
    sources: { text: 'No risk, no fun.' }
  },
  {
    id: 'quote-alles-ist-möglich',
    title: 'Alles ist möglich',
    category: 'quote',
    year: 2002,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Werbeslogan 2000er – „Alles ist möglich.“',
    hint: 'Optimismus, Werbung.',
    difficulty: 'leicht',
    sources: { text: 'Alles ist möglich.' }
  },
  {
    id: 'quote-das-leben-ist-kein-ponyhof',
    title: 'Kein Ponyhof',
    category: 'quote',
    year: 1985,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Redensart 1980er – „Das Leben ist kein Ponyhof.“',
    hint: 'Sprichwort Alltag.',
    difficulty: 'leicht',
    sources: { text: 'Das Leben ist kein Ponyhof.' }
  },
  {
    id: 'quote-ich-habe-nichts-zu-verkaufen',
    title: 'Nichts zu verkaufen',
    category: 'quote',
    year: 2015,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Interviewphrase, 2010er – „Ich habe nichts zu verkaufen.“',
    hint: 'Politik/Startups.',
    difficulty: 'mittel',
    sources: { text: 'Ich habe nichts zu verkaufen.' }
  },
  {
    id: 'quote-ich-bin-dann-mal-weg-zitat',
    title: 'Ich bin dann mal weg (Zitat)',
    category: 'quote',
    year: 2006,
    cue: 'Zitat anhören/lesen, zeitlich einordnen.',
    answer: 'Hape Kerkeling, 2006 – Buchtitel und geflügeltes Wort.',
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

const baseNonMusicCards = [
  ...baseCards.filter((c) => c.category !== 'music' && !c.id.startsWith('flag-') && !c.id.startsWith('outline-')),
  ...triviaExtraCards
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

