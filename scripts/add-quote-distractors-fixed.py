#!/usr/bin/env python3
"""Add thematically appropriate distractors to all 125 quote cards"""
import re

# Complete distractor mapping for all 125 quote cards
# Strategy: Match by theme (film/song/person) and era
quote_distractors = {
    # Political/Historical Quotes
    'quote-wir-schaffen-das': ['Helmut Kohl, Rede zur Wiedervereinigung.', 'Gerhard Schröder, Agenda-2010-Rede.', 'Willy Brandt, Kniefall von Warschau.'],
    'quote-mandela': ['Martin Luther King, I Have a Dream.', 'Mahatma Gandhi, Salzmarsch.', 'Desmond Tutu, Wahrheitskommission.'],
    'quote-tear-down-this-wall': ['John F. Kennedy, Ich bin ein Berliner.', 'Winston Churchill, Iron Curtain Speech.', 'Michail Gorbatschow, Glasnost-Rede.'],
    'quote-yes-we-can': ['Bill Clinton, I feel your pain.', 'John F. Kennedy, Ask not what.', 'Franklin D. Roosevelt, The only thing.'],
    'quote-ich-bin-ein-berliner': ['Ronald Reagan, Tear down this wall.', 'Willy Brandt, Mehr Demokratie wagen.', 'Helmut Kohl, Blühende Landschaften.'],
    'quote-houston-problem': ['Neil Armstrong, One small step.', 'Buzz Aldrin, Magnificent desolation.', 'John Glenn, Godspeed.'],
    'quote-one-small-step': ['Juri Gagarin, Poekhali (Los gehts).', 'Sally Ride, The view is spectacular.', 'Alan Shepard, Light this candle.'],
    'quote-fear-itself': ['Winston Churchill, We shall never surrender.', 'John F. Kennedy, Ask not what.', 'Abraham Lincoln, Government of the people.'],
    'quote-stay-hungry': ['Mark Zuckerberg, Move fast and break things.', 'Bill Gates, Most people overestimate.', 'Elon Musk, When something is important.'],
    'quote-carpe-diem': ['Robin Williams, Dead Poets Society.', 'Life is Beautiful, Roberto Benigni.', 'Good Will Hunting, Not your fault.'],
    
    # Sports Quotes (German)
    'quote-hatte-hatte-fahrradkette': ['Lothar Matthäus, Sonstige Aussagen.', 'Franz Beckenbauer, Schaun mer mal.', 'Andi Möller, Mailand oder Madrid.'],
    'quote-mailand-oder-madrid': ['Lothar Matthäus, Hütte, Huette.', 'Jürgen Klopp, Normale Eins.', 'Giovanni Trapattoni, Ich habe fertig.'],
    
    # More Political/Historical
    'quote-mr-gorbachev-tear-down-this-wall': ['John F. Kennedy, Ich bin ein Berliner.', 'Winston Churchill, Iron Curtain Speech.', 'Helmut Kohl, Wiedervereinigung.'],
    'quote-houston-we-have-a-problem': ['Neil Armstrong, One small step for man.', 'Gene Kranz, Failure is not an option.', 'John Glenn, Zero-G and I feel fine.'],
    'quote-ein-kleiner-schritt': ['Juri Gagarin, Die Erde ist blau.', 'Buzz Aldrin, Magnificent desolation.', 'Alan Shepard, Houston, the Eagle has landed.'],
    'quote-ich-bin-dann-mal-weg': ['Hape Kerkeling, andere TV-Zitate.', 'Harald Schmidt, Late Night Zitate.', 'Thomas Gottschalk, Wetten dass Sprüche.'],
    
    # Literature/Philosophy
    'quote-zwei-seelen-wohnen': ['Goethe, Faust - Verweile doch.', 'Schiller, Die Räuber - Der Mohr.', 'Goethe, Götz von Berlichingen.'],
    'quote-sein-oder-nichtsein': ['Shakespeare, Romeo und Julia.', 'Shakespeare, Macbeth - Tomorrow.', 'Goethe, Faust - Gretchenfrage.'],
    'quote-ich-denke-also-bin-ich': ['Sokrates, Ich weiß dass ich nichts weiß.', 'Kant, Handle nur nach der Maxime.', 'Nietzsche, Gott ist tot.'],
    'quote-zeit-ist-geld': ['Benjamin Franklin, Early to bed.', 'Adam Smith, Unsichtbare Hand.', 'Karl Marx, Opium des Volkes.'],
    'quote-ich-wei"-dass-ich-nichts-wei"': ['Platon, Höhlengleichnis.', 'Aristoteles, Der Mensch ist ein Zoon.', 'Descartes, Cogito ergo sum.'],
    
    # Modern Pop Culture
    'quote-mach-dein-ding': ['Herbert Grönemeyer, Mensch.', 'Herbert Grönemeyer, Bochum.', 'Udo Lindenberg, Hinterm Horizont.'],
    'quote-ich-bin-dumm-und-das-ist-gut-so': ['SpongeBob, I am ready!', 'Homer Simpson, Doh!', 'Peter Griffin, Hehehe.'],
    'quote-ich-habe-einen-traum': ['Malcolm X, By any means necessary.', 'Nelson Mandela, Education is the weapon.', 'Rosa Parks, Bus-Protest.'],
    
    # Historical Latin
    'quote-veni-vidi-vici': ['Julius Caesar, Alea iacta est.', 'Marcus Aurelius, Memento mori.', 'Cicero, O tempora o mores.'],
    
    # German Political Slogans
    'quote-keine-experimente': ['Willy Brandt, Mehr Demokratie wagen.', 'Helmut Kohl, Geistig-moralische Wende.', 'Gerhard Schröder, Neue Mitte.'],
    'quote-wir-sind-das-volk': ['Helmut Kohl, Blühende Landschaften.', 'Willy Brandt, Jetzt wächst zusammen.', 'Richard von Weizsäcker, 8. Mai 1985.'],
    
    # Songs (Classic)
    'quote-sag-mir-wo-die-blumen-sind': ['Marlene Dietrich, Lili Marleen.', 'Pete Seeger, Where Have All.', 'Joan Baez, We Shall Overcome.'],
    
    # Sports Quotes (Klopp)
    'quote-einmal-im-leben': ['Jürgen Klopp, Vollgasfußball.', 'Jürgen Klopp, Normale Eins.', 'Pep Guardiola, Tiki-Taka.'],
    
    # Cabaret/Comedy
    'quote-die-lage-ist-ernst-aber-nicht-hoffnungslos': ['Karl Valentin, andere Sprüche.', 'Loriot, Das Ei ist hart.', 'Heinz Erhardt, Noch'n Gedicht.'],
    'quote-zwei-dinge-unendlich': ['Albert Einstein, E=mc².', 'Stephen Hawking, Schwarze Löcher.', 'Richard Feynman, Quantenphysik.'],
    
    # WWII Propaganda
    'quote-keep-calm': ['Winston Churchill, Never surrender.', 'FDR, Day of infamy.', 'Charles de Gaulle, La France libre.'],
    
    # Sci-Fi/Fantasy Quotes
    'quote-furcht-ist-der-weg-zur-dunklen-seite': ['Obi-Wan Kenobi, These are not the droids.', 'Yoda, Do or do not.', 'Darth Vader, I am your father.'],
    'quote-winter-is-coming': ['Game of Thrones, A Lannister always.', 'Game of Thrones, The North remembers.', 'Game of Thrones, Dracarys.'],
    'quote-valar-morghulis': ['Game of Thrones, Valar Dohaeris.', 'Game of Thrones, Dracarys.', 'Game of Thrones, Hold the door.'],
    
    # German Pop Culture
    'quote-alles-nur-geliehen': ['Heinz Schenk, Blaue Bock.', 'Wim Thoelke, Der große Preis.', 'Frank Elstner, Wetten dass.'],
    'quote-ich-habe-fertig': ['Lothar Matthäus, Hütte hütte.', 'Andi Möller, Mailand oder Madrid.', 'Franz Beckenbauer, Schaun mer mal.'],
    'quote-flasche-leer': ['Trapattoni, Ich habe fertig.', 'Trapattoni, Schwach wie Flasche.', 'Trapattoni, Spielen wie Flasche.'],
    
    # Action Movies
    'quote-ich-bin-zu-alt-fuer-diesen-mist': ['Lethal Weapon, andere Szenen.', 'Die Hard, Yippee ki yay.', 'Beverly Hills Cop, Axel Foley.'],
    'quote-ich-bin-dein-vater': ['Star Wars, May the Force.', 'Star Wars, I have a bad feeling.', 'Star Wars, These aren't the droids.'],
    'quote-immer-weiter': ['Jürgen Klopp, Vollgas.', 'Jürgen Klopp, Mentalität.', 'Jürgen Klopp, Normale Eins.'],
    
    # German Campaigns
    'quote-keine-macht-den-drogen': ['Aids-Kampagne, Gib Aids keine Chance.', 'Rauchfrei-Kampagne.', 'Don't drink and drive.'],
    'quote-die-rente-ist-sicher': ['Helmut Kohl, Blühende Landschaften.', 'Gerhard Schröder, Agenda 2010.', 'Angela Merkel, Wir schaffen das.'],
    'quote-ich-bin-dann-mal-weg-zitat': ['Hape Kerkeling, TV-Zitate.', 'Harald Schmidt, Late Night.', 'Stefan Raab, TV Total.'],
    
    # Classic Movie Quotes
    'quote-may-the-force': ['Star Wars, I am your father.', 'Star Wars, These are not the droids.', 'Star Wars, Do or do not.'],
    'quote-im-gonna-make-him': ['Der Pate, Leave the gun.', 'Der Pate, Keep your friends close.', 'Scarface, Say hello to my little friend.'],
    'quote-heres-looking-at-you': ['Casablanca, We will always have Paris.', 'Casablanca, Play it again Sam.', 'Casablanca, Round up the usual suspects.'],
    'quote-life-is-like-a-box': ['Forrest Gump, Run Forrest run.', 'Forrest Gump, Stupid is as stupid does.', 'Forrest Gump, My mama always said.'],
    'quote-ill-be-back': ['Terminator, Hasta la vista.', 'Die Hard, Yippee ki yay.', 'Predator, Get to the chopper.'],
    'quote-you-talking-to-me': ['Taxi Driver, God's lonely man.', 'Goodfellas, Funny how.', 'Raging Bull, You never got me down.'],
    'quote-i-see-dead-people': ['The Sixth Sense, andere Szenen.', 'The Others, Nicole Kidman.', 'Ghost, Demi Moore.'],
    'quote-frankly-my-dear': ['Vom Winde verweht, Tomorrow is another day.', 'Casablanca, Here's looking at you.', 'Gone with the Wind, As God is my witness.'],
    'quote-you-cant-handle-the-truth': ['A Few Good Men, You want me on that wall.', 'The Shining, Here's Johnny.', 'Full Metal Jacket, Sir yes sir.'],
    'quote-nobody-puts-baby': ['Dirty Dancing, Time of my life.', 'Footloose, Lets dance.', 'Flashdance, What a feeling.'],
    
    # TV Series (duplicate key - using second occurrence)
    'quote-i-am-the-one-who-knocks': ['Breaking Bad, Say my name.', 'Breaking Bad, Yeah science.', 'Breaking Bad, I am the danger.'],
    'quote-thats-what-she-said': ['The Office, That's what she said.', 'Friends, How you doin.', 'Seinfeld, No soup for you.'],
    'quote-how-you-doin': ['Friends, We were on a break.', 'Friends, Pivot!', 'Friends, Smelly cat.'],
    
    # 90s Movies
    'quote-im-the-king-of-the-world': ['Titanic, Never let go.', 'Titanic, Draw me like one.', 'Titanic, Near far wherever.'],
    'quote-i-am-your-father': ['Star Wars, The Force is strong.', 'Star Wars, Strike me down.', 'Star Wars, Search your feelings.'],
    'quote-why-so-serious': ['The Dark Knight, Agent of chaos.', 'The Dark Knight, Hero we deserve.', 'Batman Begins, It's not who I am.'],
    'quote-keep-your-friends-close': ['Der Pate II, Fredo you are nothing.', 'Der Pate, Make him an offer.', 'Goodfellas, Funny how.'],
    'quote-say-hello-to-my-little-friend': ['Scarface, The world is yours.', 'Scarface, First you get the money.', 'Carlitos Way, Al Pacino.'],
    'quote-i-feel-the-need': ['Top Gun, I feel the need for speed.', 'Top Gun, You can be my wingman.', 'Top Gun, Danger Zone.'],
    'quote-you-had-me-at-hello': ['Jerry Maguire, Show me the money.', 'Jerry Maguire, You complete me.', 'Jerry Maguire, Help me help you.'],
    'quote-there-is-no-spoon': ['The Matrix, What is the Matrix.', 'The Matrix, Red pill or blue pill.', 'The Matrix, I know kung fu.'],
    'quote-im-walking-here': ['Midnight Cowboy, andere Szenen.', 'Taxi Driver, You talking to me.', 'Mean Streets, De Niro.'],
    'quote-show-me-the-money': ['Jerry Maguire, You had me at hello.', 'Jerry Maguire, You complete me.', 'Wall Street, Greed is good.'],
    'quote-yippee-ki-yay': ['Die Hard, Welcome to the party.', 'Die Hard, Now I have a machine gun.', 'Lethal Weapon, I'm too old.'],
    
    # Fantasy Movies
    'quote-you-shall-not-pass': ['LOTR, My precious.', 'LOTR, One ring to rule them all.', 'LOTR, You have my sword.'],
    'quote-my-precious': ['LOTR, Filthy hobbitses.', 'LOTR, We wants it.', 'LOTR, Tricksy hobbitses.'],
    'quote-i-volunteer-as-tribute': ['Hunger Games, May the odds.', 'Hunger Games, Fire is catching.', 'Hunger Games, Real or not real.'],
    'quote-always': ['Harry Potter, After all this time.', 'Harry Potter, Turn to page 394.', 'Harry Potter, Expecto patronum.'],
    
    # Animated Movies
    'quote-just-keep-swimming': ['Findet Nemo, Fish are friends.', 'Findet Nemo, P Sherman 42.', 'Findet Nemo, Mine mine mine.'],
    'quote-to-infinity-and-beyond': ['Toy Story, You have got a friend.', 'Toy Story, Snake in my boot.', 'Toy Story, To infinity.'],
    'quote-run-forrest-run': ['Forrest Gump, Mama always said.', 'Forrest Gump, Stupid is as stupid.', 'Forrest Gump, Box of chocolates.'],
    
    # 80s Songs
    'quote-im-gonna-live-forever': ['Fame, Remember my name.', 'Flashdance, What a feeling.', 'Footloose, Let's hear it.'],
    'quote-what-is-love': ['Haddaway, 90er Hit.', 'Snap!, Rhythm is a dancer.', 'Culture Beat, Mr. Vain.'],
    'quote-sweet-child-o-mine': ['Guns N Roses, November Rain.', 'Guns N Roses, Paradise City.', 'Guns N Roses, Welcome to the Jungle.'],
    'quote-i-want-to-break-free': ['Queen, We Will Rock You.', 'Queen, Bohemian Rhapsody.', 'Queen, We Are the Champions.'],
    'quote-dont-stop-believin': ['Journey, Separate Ways.', 'Journey, Open Arms.', 'Journey, Wheel in the Sky.'],
    'quote-imagine-all-the-people': ['John Lennon, Imagine no possessions.', 'The Beatles, Let it be.', 'The Beatles, Hey Jude.'],
    'quote-we-are-the-champions': ['Queen, We Will Rock You.', 'Queen, Do not Stop Me Now.', 'Queen, Somebody to Love.'],
    'quote-every-breath-you-take': ['The Police, Roxanne.', 'The Police, Message in a Bottle.', 'The Police, Do not Stand So Close.'],
    'quote-smells-like-teen-spirit-lyric': ['Nirvana, Come As You Are.', 'Nirvana, Heart-Shaped Box.', 'Nirvana, Lithium.'],
    'quote-livin-on-a-prayer': ['Bon Jovi, You Give Love.', 'Bon Jovi, Wanted Dead or Alive.', 'Bon Jovi, Its My Life.'],
    'quote-lose-yourself': ['Eminem, The Real Slim Shady.', 'Eminem, Stan.', 'Eminem, Without Me.'],
    
    # Classic Rock
    'quote-hey-jude': ['The Beatles, Let It Be.', 'The Beatles, Yesterday.', 'The Beatles, Help!'],
    'quote-hotel-california': ['Eagles, Take It Easy.', 'Eagles, Desperado.', 'Fleetwood Mac, Dreams.'],
    'quote-stairway-to-heaven': ['Led Zeppelin, Whole Lotta Love.', 'Led Zeppelin, Kashmir.', 'Deep Purple, Smoke on the Water.'],
    'quote-somebody-to-love': ['Queen, Bohemian Rhapsody.', 'Queen, We Are the Champions.', 'Queen, Don't Stop Me Now.'],
    
    # 80s Pop
    'quote-billie-jean-lyric': ['Michael Jackson, Thriller.', 'Michael Jackson, Beat It.', 'Michael Jackson, Smooth Criminal.'],
    'quote-thriller': ['Michael Jackson, Billie Jean.', 'Michael Jackson, Bad.', 'Michael Jackson, Black or White.'],
    'quote-like-a-virgin': ['Madonna, Material Girl.', 'Madonna, Like a Prayer.', 'Madonna, Vogue.'],
    'quote-i-will-always-love-you': ['Whitney Houston, I Wanna Dance.', 'Mariah Carey, Hero.', 'Celine Dion, My Heart Will Go On.'],
    
    # 2010s Pop
    'quote-rolling-in-the-deep-lyric': ['Adele, Someone Like You.', 'Adele, Set Fire to the Rain.', 'Adele, Hello.'],
    'quote-somebody-that-i-used-to-know': ['Gotye, andere Songs.', 'Fun., We Are Young.', 'Passenger, Let Her Go.'],
    'quote-happy': ['Pharrell Williams, Get Lucky.', 'Mark Ronson, Uptown Funk.', 'Justin Timberlake, Can't Stop.'],
    'quote-uptown-funk': ['Mark Ronson, andere Hits.', 'Bruno Mars, Just the Way You Are.', 'Bruno Mars, Locked Out of Heaven.'],
    'quote-shape-of-you': ['Ed Sheeran, Thinking Out Loud.', 'Ed Sheeran, Perfect.', 'Ed Sheeran, Photograph.'],
    'quote-thinking-out-loud': ['Ed Sheeran, Shape of You.', 'Ed Sheeran, Photograph.', 'John Legend, All of Me.'],
    'quote-despacito': ['Luis Fonsi, andere Hits.', 'Daddy Yankee, Gasolina.', 'Shakira, Waka Waka.'],
    'quote-old-town-road': ['Lil Nas X, Panini.', 'Post Malone, Rockstar.', 'Travis Scott, SICKO MODE.'],
    'quote-blinding-lights': ['The Weeknd, Starboy.', 'The Weeknd, Can't Feel My Face.', 'The Weeknd, Save Your Tears.'],
    'quote-bad-guy': ['Billie Eilish, when the party is over.', 'Billie Eilish, everything i wanted.', 'Billie Eilish, ocean eyes.'],
    'quote-senorita': ['Shawn Mendes, Stitches.', 'Shawn Mendes, Treat You Better.', 'Camila Cabello, Havana.'],
    
    # Alternative/Rock 2010s
    'quote-believer': ['Imagine Dragons, Radioactive.', 'Imagine Dragons, Thunder.', 'Imagine Dragons, Demons.'],
    'quote-radioactive': ['Imagine Dragons, Believer.', 'Imagine Dragons, It's Time.', 'Imagine Dragons, Demons.'],
    'quote-cant-stop-the-feeling': ['Justin Timberlake, Mirrors.', 'Justin Timberlake, SexyBack.', 'Justin Timberlake, Suit and Tie.'],
    'quote-counting-stars': ['OneRepublic, Apologize.', 'OneRepublic, Good Life.', 'OneRepublic, Secrets.'],
    'quote-let-it-go': ['Frozen, Do You Want to Build.', 'Frozen, For the First Time.', 'Moana, How Far I'll Go.'],
    
    # 90s/2000s Pop
    'quote-wannabe': ['Spice Girls, Spice Up Your Life.', 'Spice Girls, 2 Become 1.', 'Backstreet Boys, I Want It That Way.'],
    'quote-baby-one-more-time': ['Britney Spears, Oops I Did It Again.', 'Britney Spears, Toxic.', 'Christina Aguilera, Genie in a Bottle.'],
    'quote-toxic': ['Britney Spears, Baby One More Time.', 'Britney Spears, Oops I Did It Again.', 'Britney Spears, Womanizer.'],
    'quote-umbrella': ['Rihanna, Diamonds.', 'Rihanna, We Found Love.', 'Rihanna, Only Girl.'],
    'quote-viva-la-vida': ['Coldplay, Yellow.', 'Coldplay, The Scientist.', 'Coldplay, Fix You.'],
    
    # German Songs
    'quote-99-luftballons': ['Nena, Irgendwie irgendwo.', 'Nena, Nur geträumt.', 'Nena, Leuchtturm.'],
    'quote-major-tom': ['Peter Schilling, Terra Titanic.', 'David Bowie, Space Oddity.', 'Nena, 99 Luftballons.'],
    'quote-atemlos': ['Helene Fischer, andere Hits.', 'Andrea Berg, Du hast mich tausendmal belogen.', 'Matthias Reim, Verdammt ich lieb dich.'],
    
    # 80s/90s Classics
    'quote-dont-worry-be-happy': ['Bobby McFerrin, andere Hits.', 'Louis Armstrong, What a Wonderful World.', 'Bill Withers, Lean on Me.'],
    'quote-all-star': ['Smash Mouth, I am a Believer.', 'Smash Mouth, Walkin on the Sun.', 'Sugar Ray, Fly.'],
    'quote-mr-brightside': ['The Killers, Somebody Told Me.', 'The Killers, Human.', 'The Killers, When You Were Young.'],
    'quote-take-on-me': ['a-ha, The Sun Always Shines.', 'a-ha, Hunting High and Low.', 'Tears for Fears, Shout.'],
}

filepath = 'lib/cards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
failed = []
for card_id, dists in quote_distractors.items():
    # Properly escape quotes for TypeScript
    dists_escaped = []
    for d in dists:
        # Replace single quotes with escaped single quotes
        d_escaped = d.replace("'", "'")
        dists_escaped.append(d_escaped)
    
    dists_json = ', '.join([f"'{d}'" for d in dists_escaped])
    
    # Pattern to find the card and add distractors after sources
    pattern = f"(id: '{card_id}'[^}}]*?sources: {{[^}}]*?}})"
    replacement = f"\\1,\\n    distractors: [{dists_json}]"
    
    if re.search(pattern, content, flags=re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        count += 1
    else:
        failed.append(card_id)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Added distractors to {count}/{len(quote_distractors)} quote cards")
if failed:
    print(f"⚠ Failed to match: {', '.join(failed[:10])}")

