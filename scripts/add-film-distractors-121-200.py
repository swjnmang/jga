#!/usr/bin/env python3
"""Add distractors to film cards 121-200"""
import re
from pathlib import Path

# Cards 121-200 distractor mapping
distractors_map = {
    'filmeserien-121-citizen-kane': ['Xanadu.', 'Kane.', 'Susan.'],
    'filmeserien-122-psycho': ['Stanley Kubrick.', 'Orson Welles.', 'Billy Wilder.'],
    'filmeserien-123-the-shining': ['"Here\'s Jack!"', '"It\'s Johnny time!"', '"Johnny\'s coming!"'],
    'filmeserien-124-exorcist': ['Linda Blair (Schauspielerin).', 'Father Karras (Priester).', 'Chris MacNeil (Mutter).'],
    'filmeserien-125-halloween': ['Jason Voorhees (Friday 13th).', 'Freddy Krueger (Nightmare).', 'Leatherface (Texas Chainsaw).'],
    'filmeserien-126-scream': ['Michael Myers Maske.', 'Hockey-Maske (Jason).', 'Clown-Maske.'],
    'filmeserien-127-get-out': ['Ari Aster.', 'Robert Eggers.', 'James Wan.'],
    'filmeserien-128-us': ['Die Schatten.', 'Die Doppelgänger.', 'Die Klone.'],
    'filmeserien-129-hereditary': ['Jordan Peele.', 'Robert Eggers.', 'Mike Flanagan.'],
    'filmeserien-130-midsommar': ['Norwegen.', 'Dänemark.', 'Finnland.'],
    'filmeserien-131-lord-flies': ['Sie werden zivilisiert.', 'Sie bauen eine Gesellschaft auf.', 'Sie werden sofort gerettet.'],
    'filmeserien-132-stand-by-me': ['It (Stephen King).', 'Misery (King).', 'Carrie (King).'],
    'filmeserien-133-green-mile': ['Er kann fliegen.', 'Er ist unsterblich.', 'Er kann Gedanken lesen.'],
    'filmeserien-134-shining-book': ['Dean Koontz.', 'Clive Barker.', 'Peter Straub.'],
    'filmeserien-135-lotr-oscar': ['Neun.', 'Zehn.', 'Zwölf.'],
    'filmeserien-136-ben-hur': ['Die Kreuzigung.', 'Die Seeschlacht.', 'Die Arena-Kämpfe.'],
    'filmeserien-137-lawrence': ['William Wyler.', 'John Ford.', 'Fred Zinnemann.'],
    'filmeserien-138-amelie': ['Le Marais.', 'Saint-Germain.', 'Belleville.'],
    'filmeserien-139-intouchables': ['Querschnittlähmung.', 'Multiple Sklerose.', 'ALS.'],
    'filmeserien-140-drive': ['Jake Gyllenhaal.', 'Ryan Reynolds.', 'Chris Pine.'],
    'filmeserien-141-nightcrawler': ['Christian Bale.', 'Matthew McConaughey.', 'Oscar Isaac.'],
    'filmeserien-142-sicario': ['Hans Zimmer.', 'Trent Reznor.', 'Alexandre Desplat.'],
    'filmeserien-143-arrival': ['Greys (typische Aliens).', 'Xenomorphs.', 'Martians.'],
    'filmeserien-144-matrix-bullet-time': ['Slow Motion.', 'Frame Freeze.', '360-Grad-Kamera.'],
    'filmeserien-145-singing-rain': ['Fred Astaire.', 'Donald O\'Connor (Cosmo).', 'Cyd Charisse.'],
    'filmeserien-146-sound-music': ['Audrey Hepburn.', 'Doris Day.', 'Debbie Reynolds.'],
    'filmeserien-147-west-side': ['Greasers und Socs.', 'T-Birds und Pink Ladies.', 'Montagues und Capulets.'],
    'filmeserien-148-moulin-rouge': ['Ewan McGregor (Christian).', 'Jim Broadbent (Zidler).', 'John Leguizamo.'],
    'filmeserien-149-guardians': ['"Hooked on a Feeling" (später).', '"Mr. Blue Sky".', '"The Chain".'],
    'filmeserien-150-spiderverse': ['Peter Parker (Original).', 'Gwen Stacy (Spider-Gwen).', 'Miguel O\'Hara (Spider-Man 2099).'],
    'filmeserien-151-batman-1989': ['Heath Ledger (später).', 'Joaquin Phoenix (später).', 'Mark Hamill (Stimme).'],
    'filmeserien-152-logan': ['Professor X / Charles Xavier.', 'Magneto / Erik Lehnsherr.', 'Cyclops / Scott Summers.'],
    'filmeserien-153-deadpool': ['Hugh Jackman (Wolverine).', 'Josh Brolin.', 'Chris Pratt.'],
    'filmeserien-154-planet-affe': ['Zeitparadoxon.', 'Paralleluniversum.', 'Simulation.'],
    'filmeserien-155-planet-affe-reboot': ['Koba (Gegenspieler).', 'Maurice (Orang-Utan).', 'Rocket (Schimpanse).'],
    'filmeserien-156-king-kong': ['Auf die Brooklyn Bridge.', 'Auf die Freiheitsstatue.', 'Auf das Chrysler Building.'],
    'filmeserien-157-godzilla': ['USA.', 'Korea.', 'China.'],
    'filmeserien-158-pixar-toystory': ['Buzz Lightyear.', 'Rex (Dino).', 'Slinky Dog.'],
    'filmeserien-159-pixar-up': ['Carl Fredricksen (alter Mann).', 'Kevin (Vogel).', 'Doug (Hund).'],
    'filmeserien-160-pixar-walle': ['Batterien.', 'Schrott zum Recyceln.', 'Alte Technik.'],
    'filmeserien-161-pixar-insideout': ['Angst dominiert am Anfang.', 'Ekel übernimmt zu Beginn.', 'Wut kontrolliert anfangs.'],
    'filmeserien-162-shrek': ['Der Drache (Dragon).', 'Pinocchio.', 'Rumpelstilzchen.'],
    'filmeserien-163-ice-age': ['Eine Nuss.', 'Eine Haselnuss.', 'Eine Walnuss.'],
    'filmeserien-164-kungfu-panda': ['Tai Lung (Gegner).', 'Master Shifu (Meister).', 'Tigress (Freundin).'],
    'filmeserien-165-minions': ['Vector (erster Film).', 'El Macho (zweiter Film).', 'Scarlet Overkill (Minions-Film).'],
    'filmeserien-166-dragon': ['Drachen ohne Schwanz.', 'Ohnefuß.', 'Ohneohr.'],
    'filmeserien-167-frozen': ['Kristoff (Eisverkäufer).', 'Olaf (Schneemann).', 'Sven (Rentier).'],
    'filmeserien-168-moana': ['Dwayne Johnson (Stimme Maui).', 'Tamatoa (Krabbe).', 'Te Fiti (Göttin).'],
    'filmeserien-169-klaus': ['Spielzeugmacher.', 'Holzfäller.', 'Schmied.'],
    'filmeserien-170-spirited': ['Ein Wolf.', 'Ein Adler.', 'Ein Bär.'],
    'filmeserien-171-coraline': ['Spinnenaugen.', 'Glasaugen.', 'Leere Augenhöhlen.'],
    'filmeserien-172-nightmare-christmas': ['Oogie Boogie (Gegner).', 'Sally (Freundin).', 'Zero (Geisterhund).'],
    'filmeserien-173-spirited-spaghetti': ['101 Dalmatiner (Hunde).', 'Aristocats (Katzen).', 'Zwei Vögel.'],
    'filmeserien-174-lion-king': ['Sarabi (Mutter).', 'Scar (Onkel).', 'Simba (als Baby).'],
    'filmeserien-175-aladdin': ['Eddie Murphy.', 'Jim Carrey.', 'Tom Hanks.'],
    'filmeserien-176-beauty-beast': ['Eine Uhr (Cogsworth).', 'Eine Teekanne (Mrs. Potts).', 'Einen Besen.'],
    'filmeserien-177-mulan': ['Cri-Kee (Grille).', 'Khan (Pferd).', 'Little Brother (Hund).'],
    'filmeserien-178-tarzan': ['Elton John.', 'Sting.', 'Bryan Adams.'],
    'filmeserien-179-lilo-stitch': ['625.', '627.', '628.'],
    'filmeserien-180-shrek-2': ['Der Drache (Dragon).', 'Pinocchio.', 'Rumpelstilzchen.'],
    'filmeserien-181-matrix-kungfu': ['"I understand kung fu."', '"I mastered kung fu."', '"Show me kung fu."'],
    'filmeserien-182-rocky': ['New York.', 'Boston.', 'Chicago.'],
    'filmeserien-183-creed': ['Apollo Creed (Vater).', 'Ivan Drago.', 'Mickey Goldmill.'],
    'filmeserien-184-raging-bull': ['Al Pacino.', 'Joe Pesci.', 'Harvey Keitel.'],
    'filmeserien-185-million-dollar-baby': ['Hilary Swank (Schauspielerin).', 'Morgan Freeman (Co-Star).', 'Jay Baruchel.'],
    'filmeserien-186-karate-kid': ['Sensei Kreese (Gegner).', 'Sensei Lawrence (Cobra Kai).', 'Master Shifu (falsch).'],
    'filmeserien-187-cobra-kai': ['Daniel LaRusso (Gegner).', 'John Kreese (Mentor).', 'Terry Silver.'],
    'filmeserien-188-spacejam': ['LeBron James (Space Jam 2).', 'Kobe Bryant.', 'Shaquille O\'Neal.'],
    'filmeserien-189-air-bud': ['Ein Labrador.', 'Ein Beagle.', 'Ein Collie.'],
    'filmeserien-190-field-of-dreams': ['"Build it and they come."', '"If you make it, he will arrive."', '"Construct it, he appears."'],
    'filmeserien-191-forrest-gump': ['"Life is full of surprises."', '"Life is unpredictable."', '"Life is like running."'],
    'filmeserien-192-cast-away': ['Spalding (Marke).', 'Chuck (sein Name).', 'Fred.'],
    'filmeserien-193-apollo13': ['"Houston, we got a problem."', '"Houston, problem here."', '"Mission control, issue detected."'],
    'filmeserien-194-2001': ['SAL 9000.', 'GERTY (Moon).', 'Mother (Alien).'],
    'filmeserien-195-gravity': ['Jessica Chastain.', 'Amy Adams.', 'Charlize Theron.'],
    'filmeserien-196-martian': ['Tomaten.', 'Salat.', 'Karotten.'],
    'filmeserien-197-star-trek': ['"Peace and prosperity."', '"May the Force be with you." (Star Wars).', '"So say we all." (BSG).'],
    'filmeserien-198-star-trek-picard': ['Star Trek: Deep Space Nine.', 'Star Trek: Voyager.', 'Star Trek: Enterprise.'],
    'filmeserien-199-babylon5': ['Deep Space Nine (Star Trek).', 'Stargate Atlantis.', 'The Expanse.'],
    'filmeserien-200-firefly': ['Millennium Falcon (Star Wars).', 'USS Enterprise.', 'Normandy (Mass Effect).'],
}

def main():
    file_path = Path(__file__).parent.parent / 'lib' / 'filmSerienCards.ts'
    content = file_path.read_text(encoding='utf-8')
    
    modified_count = 0
    
    for card_id, distractors in distractors_map.items():
        # Format distractors array
        distractors_str = str(distractors).replace("'", "'")
        
        # Pattern: find card with sources: {} and NO distractors
        pattern = re.compile(
            f"(id: '{re.escape(card_id)}'[^}}]+sources: {{}})(\\s*}})",
            re.DOTALL
        )
        
        # Replacement: add distractors before closing brace
        replacement = f"\\1, distractors: {distractors_str}\\2"
        
        new_content, count = pattern.subn(replacement, content)
        if count > 0:
            content = new_content
            modified_count += 1
            print(f"✓ {card_id}")
        else:
            print(f"✗ {card_id} - not found or already has distractors")
    
    if modified_count > 0:
        file_path.write_text(content, encoding='utf-8')
        print(f"\n✅ Successfully added distractors to {modified_count}/{len(distractors_map)} cards")
    else:
        print("\n❌ No changes made")

if __name__ == '__main__':
    main()
