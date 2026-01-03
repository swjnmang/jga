#!/usr/bin/env python3
"""
1. Remove duplicate quote IDs
2. Remove all existing distractor fields from quote cards
3. Add new curated distractors without special characters
"""
import re

# Step 1: Remove duplicate quote IDs
duplicates_to_remove = [
    'quote-wir-schaffen-das',
    'quote-houston-we-have-a-problem', 
    'quote-winter-is-coming'
]

with open('lib/cards.ts', 'r', encoding='utf-8') as f:
    content = f.read()

for dup_id in duplicates_to_remove:
    pattern = rf"  {{\s*id: '{re.escape(dup_id)}'.*?}},?\s*(?=\s*{{|\s*\])"
    matches = list(re.finditer(pattern, content, flags=re.DOTALL))
    if len(matches) >= 2:
        second_match = matches[1]
        content = content[:second_match.start()] + content[second_match.end():]
        print(f"✓ Removed duplicate: {dup_id}")

# Step 2: Remove ALL existing distractor lines from quote cards
content = re.sub(
    r"(id: 'quote-[^']+.*?sources: \{[^}]*?\}),?\s*distractors: \[[^\]]*?\]",
    r"\1",
    content,
    flags=re.DOTALL
)
print("✓ Removed all existing distractor fields from quote cards")

# Step 3: Add curated distractors (no special characters!)
quote_distractors = {
    'quote-wir-schaffen-das': ['Helmut Kohl, Wiedervereinigung 1990', 'Gerhard Schroeder, Agenda 2010', 'Willy Brandt, Kniefall von Warschau'],
    'quote-mandela': ['Martin Luther King Jr., I Have a Dream', 'Mahatma Gandhi, Salzmarsch 1930', 'Desmond Tutu, Wahrheitskommission'],
    'quote-tear-down-this-wall': ['John F. Kennedy, Ich bin ein Berliner', 'Winston Churchill, Iron Curtain Speech', 'Helmut Kohl, Bluehende Landschaften'],
    'quote-yes-we-can': ['Bill Clinton, I feel your pain', 'John F. Kennedy, Ask not what your country', 'Franklin D. Roosevelt, The only thing we have to fear'],
    'quote-ich-bin-ein-berliner': ['Ronald Reagan, Tear down this wall', 'Willy Brandt, Mehr Demokratie wagen', 'Helmut Schmidt, Bundeskanzler 1974'],
    'quote-houston-problem': ['Neil Armstrong, One small step', 'Buzz Aldrin, Magnificent desolation', 'John Glenn, Godspeed'],
    'quote-one-small-step': ['Juri Gagarin, Die Erde ist blau', 'Buzz Aldrin, Houston the Eagle has landed', 'Alan Shepard, Freedom 7 Mission'],
    'quote-fear-itself': ['Winston Churchill, We shall never surrender', 'John F. Kennedy, Ask not', 'Abraham Lincoln, Of the people'],
    'quote-stay-hungry': ['Mark Zuckerberg, Move fast and break things', 'Bill Gates, Most people overestimate', 'Elon Musk, When something is important'],
    'quote-carpe-diem': ['Dead Poets Society, O Captain My Captain', 'Good Will Hunting, Its not your fault', 'The Shawshank Redemption, Get busy living'],
    'quote-hatte-hatte-fahrradkette': ['Franz Beckenbauer, Schaun mer mal', 'Andi Moeller, Mailand oder Madrid', 'Juergen Klopp, Normale Eins'],
    'quote-mailand-oder-madrid': ['Lothar Matthaeus, Huette Fahrradkette', 'Giovanni Trapattoni, Ich habe fertig', 'Franz Beckenbauer, Der Kaiser'],
    'quote-mr-gorbachev-tear-down-this-wall': ['John F. Kennedy, Ich bin ein Berliner', 'Winston Churchill, Iron Curtain', 'George H. W. Bush, Berlin Wall 1989'],
    'quote-houston-we-have-a-problem': ['Neil Armstrong, One small step', 'Gene Kranz, Failure is not an option', 'Apollo 11, Eagle has landed'],
    'quote-ein-kleiner-schritt': ['Juri Gagarin, Poekhali (Los gehts)', 'Buzz Aldrin, Magnificent desolation', 'John Glenn, Zero-G'],
    'quote-ich-bin-dann-mal-weg': ['Hape Kerkeling, Jakobsweg Buch 2006', 'Thomas Gottschalk, Wetten dass', 'Harald Schmidt, Late Night Show'],
    'quote-zwei-seelen-wohnen': ['Goethe, Verweile doch du bist so schoen', 'Schiller, Die Raeuber', 'Goethe, Goetz von Berlichingen'],
    'quote-sein-oder-nichtsein': ['Shakespeare, Romeo und Julia', 'Shakespeare, Macbeth Tomorrow speech', 'Goethe, Faust Gretchenfrage'],
    'quote-ich-denke-also-bin-ich': ['Sokrates, Ich weiss dass ich nichts weiss', 'Kant, Kategorischer Imperativ', 'Nietzsche, Gott ist tot'],
    'quote-zeit-ist-geld': ['Benjamin Franklin, Early to bed early to rise', 'Adam Smith, Unsichtbare Hand', 'Karl Marx, Opium des Volkes'],
    'quote-mach-dein-ding': ['Herbert Groenemeyer, Mensch 2002', 'Herbert Groenemeyer, Bochum 1984', 'Udo Lindenberg, Hinterm Horizont'],
    'quote-ich-bin-dumm-und-das-ist-gut-so': ['SpongeBob, Im ready', 'Homer Simpson, Doh', 'Peter Griffin, Family Guy'],
    'quote-ich-habe-einen-traum': ['Malcolm X, By any means necessary', 'Nelson Mandela, Education is the weapon', 'Rosa Parks, Montgomery Bus Boycott'],
    'quote-veni-vidi-vici': ['Julius Caesar, Alea iacta est', 'Marcus Aurelius, Memento mori', 'Cicero, O tempora o mores'],
    'quote-keine-experimente': ['Willy Brandt, Mehr Demokratie wagen', 'Helmut Kohl, Geistig-moralische Wende', 'Gerhard Schroeder, Neue Mitte'],
    'quote-wir-sind-das-volk': ['Helmut Kohl, Bluehende Landschaften', 'Willy Brandt, Zusammenwaechst', 'Richard von Weizsaecker, 8. Mai 1985'],
    'quote-sag-mir-wo-die-blumen-sind': ['Marlene Dietrich, Lili Marleen', 'Joan Baez, We Shall Overcome', 'Bob Dylan, Blowin in the Wind'],
    'quote-einmal-im-leben': ['Juergen Klopp, Vollgasfussball', 'Juergen Klopp, Normal one', 'Pep Guardiola, Tiki-Taka'],
    'quote-die-lage-ist-ernst-aber-nicht-hoffnungslos': ['Karl Valentin, Muenchen Kabarett', 'Loriot, Das Ei ist hart', 'Heinz Erhardt, Gedichte'],
    'quote-zwei-dinge-unendlich': ['Albert Einstein, E=mc2', 'Stephen Hawking, Schwarze Loecher', 'Richard Feynman, Quantenphysik'],
    'quote-keep-calm': ['Winston Churchill, Never surrender', 'FDR, Day of infamy', 'Charles de Gaulle, La France libre'],
    'quote-furcht-ist-der-weg-zur-dunklen-seite': ['Obi-Wan Kenobi, The Force will be with you', 'Yoda, Do or do not', 'Darth Vader, I am your father'],
    'quote-winter-is-coming': ['Game of Thrones, A Lannister always pays', 'Game of Thrones, The North remembers', 'Game of Thrones, Dracarys'],
    'quote-valar-morghulis': ['Game of Thrones, Valar Dohaeris', 'Game of Thrones, Hold the door', 'Game of Thrones, You know nothing'],
    'quote-alles-nur-geliehen': ['Heinz Schenk, Blaue Bock', 'Wim Thoelke, Der grosse Preis', 'Frank Elstner, Wetten dass'],
    'quote-ich-habe-fertig': ['Lothar Matthaeus, Huette Fahrradkette', 'Andi Moeller, Mailand oder Madrid', 'Franz Beckenbauer, Schaun mer mal'],
    'quote-flasche-leer': ['Trapattoni, Schwach wie Flasche', 'Trapattoni, Spielen wie Flasche', 'Trapattoni, Was erlauben Strunz'],
    'quote-ich-bin-zu-alt-fuer-diesen-mist': ['Die Hard, Yippee ki yay', 'Beverly Hills Cop, Axel Foley', 'Lethal Weapon 2, Diplomatic immunity'],
    'quote-ich-bin-dein-vater': ['Star Wars, May the Force be with you', 'Star Wars, I have a bad feeling', 'Star Wars, Do or do not'],
    'quote-immer-weiter': ['Juergen Klopp, Vollgas', 'Juergen Klopp, Mentalitaet', 'Juergen Klopp, Heavy Metal Football'],
    'quote-keine-macht-den-drogen': ['Aids-Kampagne, Gib Aids keine Chance', 'Rauchfrei-Kampagne', 'Dont drink and drive'],
    'quote-die-rente-ist-sicher': ['Helmut Kohl, Bluehende Landschaften', 'Gerhard Schroeder, Agenda 2010', 'Angela Merkel, Wir schaffen das'],
    'quote-ich-bin-dann-mal-weg-zitat': ['Hape Kerkeling, Jakobsweg', 'Harald Schmidt, Late Night', 'Stefan Raab, TV Total'],
    'quote-may-the-force': ['Star Wars, I am your father', 'Star Wars, Do or do not', 'Star Wars, The Force will be with you'],
    'quote-im-gonna-make-him': ['Der Pate, Leave the gun take cannoli', 'Der Pate, Keep your friends close', 'Scarface, Say hello to my friend'],
    'quote-heres-looking-at-you': ['Casablanca, Well always have Paris', 'Casablanca, Play it Sam', 'Casablanca, Round up usual suspects'],
    'quote-life-is-like-a-box': ['Forrest Gump, Run Forrest run', 'Forrest Gump, Stupid is as stupid does', 'Forrest Gump, My mama always said'],
    'quote-ill-be-back': ['Terminator, Hasta la vista baby', 'Die Hard, Yippee ki yay', 'Predator, Get to the chopper'],
    'quote-you-talking-to-me': ['Goodfellas, Funny how', 'Raging Bull, You never got me down', 'Casino, Robert De Niro'],
    'quote-i-see-dead-people': ['The Sixth Sense, Bruce Willis', 'The Others, Nicole Kidman', 'Ghost, Demi Moore Patrick Swayze'],
    'quote-frankly-my-dear': ['Vom Winde verweht, Tomorrow is another day', 'Casablanca, Heres looking at you', 'Gone with the Wind, Scarlett'],
    'quote-you-cant-handle-the-truth': ['A Few Good Men, You want me on that wall', 'The Shining, Heres Johnny', 'Full Metal Jacket, Sir yes sir'],
    'quote-nobody-puts-baby': ['Dirty Dancing, Time of my life', 'Footloose, Lets dance', 'Flashdance, What a feeling'],
    'quote-i-am-the-one-who-knocks': ['Breaking Bad, Say my name', 'Breaking Bad, Yeah science', 'Breaking Bad, I am the danger'],
    'quote-thats-what-she-said': ['The Office, Michael Scott', 'Friends, How you doin', 'Seinfeld, No soup for you'],
    'quote-how-you-doin': ['Friends, We were on a break', 'Friends, Pivot', 'Friends, Smelly cat'],
    'quote-im-the-king-of-the-world': ['Titanic, Ill never let go', 'Titanic, Draw me like one of your', 'Titanic, Near far wherever'],
    'quote-i-am-your-father': ['Star Wars, The Force is strong', 'Star Wars, Strike me down', 'Star Wars, Search your feelings'],
    'quote-why-so-serious': ['The Dark Knight, Agent of chaos', 'The Dark Knight, Hero we deserve', 'Batman Begins, Im Batman'],
    'quote-keep-your-friends-close': ['Der Pate II, Fredo youre nothing', 'Der Pate, Make him an offer', 'Goodfellas, Funny how'],
    'quote-say-hello-to-my-little-friend': ['Scarface, The world is yours', 'Scarface, First you get money', 'Carlitos Way, Al Pacino'],
    'quote-i-feel-the-need': ['Top Gun, Need for speed', 'Top Gun, You can be my wingman', 'Top Gun, Danger Zone'],
    'quote-you-had-me-at-hello': ['Jerry Maguire, Show me the money', 'Jerry Maguire, You complete me', 'Jerry Maguire, Help me help you'],
    'quote-there-is-no-spoon': ['The Matrix, What is the Matrix', 'The Matrix, Red pill or blue pill', 'The Matrix, I know kung fu'],
    'quote-im-walking-here': ['Midnight Cowboy, Dustin Hoffman', 'Taxi Driver, You talking to me', 'Mean Streets, Robert De Niro'],
    'quote-show-me-the-money': ['Jerry Maguire, You had me at hello', 'Jerry Maguire, You complete me', 'Wall Street, Greed is good'],
    'quote-yippee-ki-yay': ['Die Hard, Welcome to the party', 'Die Hard, Now I have machine gun', 'Lethal Weapon, Too old for this'],
    'quote-you-shall-not-pass': ['LOTR, My precious', 'LOTR, One ring to rule them all', 'LOTR, You have my sword'],
    'quote-my-precious': ['LOTR, Filthy hobbitses', 'LOTR, We wants it', 'LOTR, Tricksy hobbitses'],
    'quote-i-volunteer-as-tribute': ['Hunger Games, May the odds be ever', 'Hunger Games, Fire is catching', 'Hunger Games, Real or not real'],
    'quote-always': ['Harry Potter, After all this time', 'Harry Potter, Turn to page 394', 'Harry Potter, Expecto patronum'],
    'quote-just-keep-swimming': ['Findet Nemo, Fish are friends not food', 'Findet Nemo, P Sherman 42 Wallaby', 'Findet Nemo, Mine mine mine'],
    'quote-to-infinity-and-beyond': ['Toy Story, Youve got a friend in me', 'Toy Story, Theres a snake in my boot', 'Toy Story, Woody Buzz'],
    'quote-run-forrest-run': ['Forrest Gump, Mama always said', 'Forrest Gump, Stupid is as stupid does', 'Forrest Gump, Box of chocolates'],
    'quote-im-gonna-live-forever': ['Fame, Remember my name', 'Flashdance, What a feeling', 'Footloose, Kenny Loggins'],
    'quote-what-is-love': ['Haddaway, 1993', 'Snap, Rhythm is a dancer', 'Culture Beat, Mr Vain'],
    'quote-sweet-child-o-mine': ['Guns N Roses, November Rain', 'Guns N Roses, Paradise City', 'Guns N Roses, Welcome to Jungle'],
    'quote-i-want-to-break-free': ['Queen, We Will Rock You', 'Queen, Bohemian Rhapsody', 'Queen, We Are Champions'],
    'quote-dont-stop-believin': ['Journey, Separate Ways', 'Journey, Open Arms', 'Journey, Wheel in the Sky'],
    'quote-imagine-all-the-people': ['John Lennon, Imagine', 'The Beatles, Let it be', 'The Beatles, Hey Jude'],
    'quote-we-are-the-champions': ['Queen, We Will Rock You', 'Queen, Dont Stop Me Now', 'Queen, Somebody to Love'],
    'quote-every-breath-you-take': ['The Police, Roxanne', 'The Police, Message in Bottle', 'The Police, Dont Stand So Close'],
    'quote-smells-like-teen-spirit-lyric': ['Nirvana, Come As You Are', 'Nirvana, Heart-Shaped Box', 'Nirvana, Lithium'],
    'quote-livin-on-a-prayer': ['Bon Jovi, You Give Love Bad Name', 'Bon Jovi, Wanted Dead or Alive', 'Bon Jovi, Its My Life'],
    'quote-lose-yourself': ['Eminem, The Real Slim Shady', 'Eminem, Stan', 'Eminem, Without Me'],
    'quote-hey-jude': ['The Beatles, Let It Be', 'The Beatles, Yesterday', 'The Beatles, Help'],
    'quote-hotel-california': ['Eagles, Take It Easy', 'Eagles, Desperado', 'Fleetwood Mac, Dreams'],
    'quote-stairway-to-heaven': ['Led Zeppelin, Whole Lotta Love', 'Led Zeppelin, Kashmir', 'Deep Purple, Smoke on Water'],
    'quote-somebody-to-love': ['Queen, Bohemian Rhapsody', 'Queen, We Are Champions', 'Queen, Dont Stop Me Now'],
    'quote-billie-jean-lyric': ['Michael Jackson, Thriller', 'Michael Jackson, Beat It', 'Michael Jackson, Smooth Criminal'],
    'quote-thriller': ['Michael Jackson, Billie Jean', 'Michael Jackson, Bad', 'Michael Jackson, Black or White'],
    'quote-like-a-virgin': ['Madonna, Material Girl', 'Madonna, Like a Prayer', 'Madonna, Vogue'],
    'quote-i-will-always-love-you': ['Whitney Houston, I Wanna Dance', 'Mariah Carey, Hero', 'Celine Dion, My Heart Will Go On'],
    'quote-rolling-in-the-deep-lyric': ['Adele, Someone Like You', 'Adele, Set Fire to Rain', 'Adele, Hello'],
    'quote-somebody-that-i-used-to-know': ['Gotye, 2011', 'Fun, We Are Young', 'Passenger, Let Her Go'],
    'quote-happy': ['Pharrell Williams, 2013', 'Mark Ronson, Uptown Funk', 'Justin Timberlake, Cant Stop Feeling'],
    'quote-uptown-funk': ['Mark Ronson ft Bruno Mars', 'Bruno Mars, Just the Way You Are', 'Bruno Mars, Locked Out of Heaven'],
    'quote-shape-of-you': ['Ed Sheeran, Thinking Out Loud', 'Ed Sheeran, Perfect', 'Ed Sheeran, Photograph'],
    'quote-thinking-out-loud': ['Ed Sheeran, Shape of You', 'Ed Sheeran, Photograph', 'John Legend, All of Me'],
    'quote-despacito': ['Luis Fonsi, 2017', 'Daddy Yankee, Gasolina', 'Shakira, Waka Waka'],
    'quote-old-town-road': ['Lil Nas X, 2019', 'Post Malone, Rockstar', 'Travis Scott, SICKO MODE'],
    'quote-blinding-lights': ['The Weeknd, Starboy', 'The Weeknd, Cant Feel My Face', 'The Weeknd, Save Your Tears'],
    'quote-bad-guy': ['Billie Eilish, when party is over', 'Billie Eilish, everything i wanted', 'Billie Eilish, ocean eyes'],
    'quote-senorita': ['Shawn Mendes Camila Cabello', 'Shawn Mendes, Stitches', 'Camila Cabello, Havana'],
    'quote-believer': ['Imagine Dragons, Radioactive', 'Imagine Dragons, Thunder', 'Imagine Dragons, Demons'],
    'quote-radioactive': ['Imagine Dragons, Believer', 'Imagine Dragons, Its Time', 'Imagine Dragons, Demons'],
    'quote-cant-stop-the-feeling': ['Justin Timberlake, Mirrors', 'Justin Timberlake, SexyBack', 'Justin Timberlake, Suit and Tie'],
    'quote-counting-stars': ['OneRepublic, Apologize', 'OneRepublic, Good Life', 'OneRepublic, Secrets'],
    'quote-let-it-go': ['Frozen, Do You Want Build Snowman', 'Frozen, For First Time in Forever', 'Moana, How Far Ill Go'],
    'quote-wannabe': ['Spice Girls, Spice Up Your Life', 'Spice Girls, 2 Become 1', 'Backstreet Boys, I Want It That Way'],
    'quote-baby-one-more-time': ['Britney Spears, Oops I Did It Again', 'Britney Spears, Toxic', 'Christina Aguilera, Genie in Bottle'],
    'quote-toxic': ['Britney Spears, Baby One More Time', 'Britney Spears, Oops I Did It Again', 'Britney Spears, Womanizer'],
    'quote-umbrella': ['Rihanna, Diamonds', 'Rihanna, We Found Love', 'Rihanna, Only Girl'],
    'quote-viva-la-vida': ['Coldplay, Yellow', 'Coldplay, The Scientist', 'Coldplay, Fix You'],
    'quote-99-luftballons': ['Nena, Irgendwie irgendwo', 'Nena, Nur getraeumt', 'Nena, Leuchtturm'],
    'quote-major-tom': ['Peter Schilling, Terra Titanic', 'David Bowie, Space Oddity', 'Nena, 99 Luftballons'],
    'quote-atemlos': ['Helene Fischer, 2013', 'Andrea Berg, Du hast mich belogen', 'Matthias Reim, Verdammt ich lieb dich'],
    'quote-dont-worry-be-happy': ['Bobby McFerrin, 1988', 'Louis Armstrong, What Wonderful World', 'Bill Withers, Lean on Me'],
    'quote-all-star': ['Smash Mouth, Im a Believer', 'Smash Mouth, Walkin on the Sun', 'Sugar Ray, Fly'],
    'quote-mr-brightside': ['The Killers, Somebody Told Me', 'The Killers, Human', 'The Killers, When You Were Young'],
    'quote-take-on-me': ['a-ha, The Sun Always Shines', 'a-ha, Hunting High and Low', 'Tears for Fears, Shout'],
}

count = 0
for card_id, dists in quote_distractors.items():
    dists_json = "', '".join(dists)
    pattern = f"(id: '{re.escape(card_id)}'.*?sources: {{.*?}})"
    replacement = f"\\1,\\n    distractors: ['{dists_json}']"
    
    old_content = content
    content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
    if content != old_content:
        count += 1

with open('lib/cards.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Added curated distractors to {count}/{len(quote_distractors)} quote cards")
