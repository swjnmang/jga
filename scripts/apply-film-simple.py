#!/usr/bin/env python3
"""
Apply carefully curated distractors to all film/series cards.
Uses simple string replacement instead of complex regex.
"""
import os
from pathlib import Path

# Comprehensive distractor dictionary with thoughtful, non-obvious alternatives
film_distractors = {
    'filmeserien-001-der-pate': ['Marlon Brando als Don Vito Corleone.', 'Robert Duvall als Tom Hagen, der Consigliere.', 'John Cazale als Fredo Corleone.'],
    'filmeserien-002-der-pate-2': ['Coppola schrieb auch das Drehbuch mit Mario Puzo.', 'Das Cinematography war von Gordon Willis.', 'Der Film gewann 6 Academy Awards.'],
    'filmeserien-003-goodfellas': ['Joe Pesci spielt Tommy DeVito.', 'Ray Liotta spielt Henry Hill.', 'Paul Sorvino spielt Paul Cicero.'],
    'filmeserien-004-schindlers-liste': ['Ein blauer Mantel sticht hervor.', 'Ein gelber Mantel sticht hervor.', 'Ein rosa Mantel sticht hervor.'],
    'filmeserien-005-shawshank': ['Ein kalter Stein.', 'Ein rostiges Messer.', 'Eine alte Bibel.'],
    'filmeserien-006-fight-club': ['Die zweite Regel ist: Du fragst nie nach.', 'Die dritte Regel ist: Keiner redet und keiner hört auf.', 'Die vierte Regel ist: Jeder redet, schreit und kämpft.'],
    'filmeserien-007-matrix': ['Die blaue Pille zeigt die Realität nicht.', 'Die grüne Pille führt tiefer in die Matrix.', 'Die schwarze Pille erlaubt das Ausloggen.'],
    'filmeserien-008-lotr': ['Viggo Mortensen (Aragorn).', 'Sean Astin (Samweis).', 'Orlando Bloom (Legolas).'],
    'filmeserien-009-lotr-gollum': ['Peter Jackson (auch Regisseur).', 'Martin Freeman (Bilbo in Hobbits).', 'Benedict Cumberbatch (im selben Universum).'],
    'filmeserien-010-hp-stein': ['Hans Zimmer (andere Blockbuster).', 'Henry Jackman (Ant-Man komponist).', 'James Newton Howard (Batman-Komponist).'],
    'filemeserien-011-hp-dumbledore': ['Ian McKellen und Michael Gambon.', 'Richard Harris und Daniel Radcliffe.', 'Richard Harris und Ian McKellen.'],
    'filemeserien-012-star-wars-iv': ['Alderaan.', 'Mustafar (Vulkan-Planet).', 'Coruscant (Hauptstadt des Imperiums).'],
    'filemeserien-013-star-wars-v': ['Palpatine (der Imperator).', 'Yoda (das grüne Wesen).', 'Obi-Wan Kenobi (Lukes Mentor).'],
    'filemeserien-014-star-wars-vi': ['Jawas (kurze Wüstenbewohner).', 'Sandpeople (Tusken Raider).', 'Gungans (nicht Ewoks).'],
    'filemeserien-015-star-wars-vii': ['Finn.', 'Poe Dameron.', 'Kylo Ren.'],
    'filemeserien-016-rogue-one': ['Ein Lichtschwert.', 'Die Falken des Widerstands.', 'Eine Raumstation.'],
    'filemeserien-017-marvel-ironman': ['Chris Evans (Captain America).', 'Mark Ruffalo (Hulk).', 'Chris Hemsworth (Thor).'],
    'filemeserien-018-marvel-avengers': ['Ava DuVernay.', 'Kenneth Branagh.', 'Matthew Vaughn.'],
    'filemeserien-019-marvel-endgame': ['"I am Thanos."', '"This is the way."', '"Avengers, assemble!"'],
    'filemeserien-020-marvel-thanos': ['Acht.', 'Sieben.', 'Fünf.'],
    'filemeserien-021-marvel-loki': ['Time Ministry.', 'Temporal Agency.', 'Chronological Bureau.'],
    'filemeserien-022-dc-dark-knight': ['Jack Nicholson in Batman 1989.', 'Jared Leto in Suicide Squad 2016.', 'Joaquin Phoenix in Joker 2019.'],
    'filemeserien-023-dc-dark-knight-rises': ['The Riddler.', 'Scarecrow.', 'Two-Face.'],
    'filemeserien-024-dc-joker': ['Martin Scorsese.', 'Todd Phillips.', 'Christopher Nolan.'],
    'filemeserien-025-dune-2021': ['Steven Spielberg.', 'Ridley Scott.', 'Christopher Nolan.'],
    'filemeserien-026-dune-spice': ['Arrakis ist der Planet.', 'Caladan ist ein anderer Planet.', 'Giedi Prime ist der Planet der Harkonnen.'],
    'filemeserien-027-blade-runner': ['Ridley Scott (Regisseur).', 'Denis Villeneuve.', 'David Fincher.'],
    'filemeserien-028-blade-runner-2049': ['Rick Deckard.', 'K.', 'Sapper.'],
    'filemeserien-029-inception': ['Hans Zimmer.', 'Ludvig Göransson.', 'John Williams.'],
    'filemeserien-030-interstellar': ['Endurance.', 'Ranger.', 'Lander.'],
    'filemeserien-031-tenet': ['Turnstile.', 'Protagonist.', 'Neil.'],
    'filemeserien-032-memento': ['In seinem Notizbuch.', 'In Fotos.', 'Sich selbst an einen Tisch binden.'],
    'filemeserien-033-oppenheimer': ['Enrico Fermi.', 'Albert Einstein.', 'General Groves.'],
    'filemeserien-034-barbie': ['Margot Robbie.', 'Ryan Gosling.', 'Will Ferrell.'],
    'filemeserien-035-titanic': ['James Cameron.', 'Enya.', 'Henry Jackman.'],
    'filemeserien-036-avatar': ['James Cameron.', 'Denis Villeneuve.', 'Zoe Saldana.'],
    'filemeserien-037-avatar-2': ['Avatar: Fire and Ash.', 'Avatar: The Last Airbender.', 'Avatar: Legends of Pandora.'],
    'filemeserien-038-jaws': ['Jaws 2.', 'Jaws 3.', 'Jaws: The Revenge.'],
    'filemeserien-039-e-t': ['Henry Thomas.', 'Elliott.', 'Drew Barrymore.'],
    'filemeserien-040-jurassic-park': ['Velociraptor.', 'Stegosaurus.', 'Triceratops.'],
    'filemeserien-041-indiana-jones': ['Harrison Ford.', 'Tom Selleck.', 'Pierce Brosnan.'],
    'filemeserien-042-indiana-jones-3': ['River Phoenix.', 'Alison Doody.', 'Denholm Elliott.'],
    'filemeserien-043-alien': ['James Cameron.', 'David Fincher.', 'Jean-Pierre Jeunet.'],
    'filemeserien-044-aliens': ['Sigourney Weaver.', 'Bill Paxton.', 'Lance Henriksen.'],
    'filemeserien-045-terminator': ['"I am here to protect you."', '"I must go back."', '"I am the machine."'],
    'filemeserien-046-terminator-2': ['Sarah Connor.', 'John Connor.', 'The T-800.'],
    'filemeserien-047-mad-max-fury': ['Tom Hardy.', 'Nicholas Hoult.', 'Hugh Keays-Byrne.'],
}

def apply_distractors(filepath, distractors_dict):
    """Apply distractors using simple string replacement."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        count = 0
        
        for card_id, distractors in distractors_dict.items():
            # Create the new distractors array string
            dist_items = [f"'{d.replace(chr(39), chr(92) + chr(39))}'" for d in distractors]
            new_distractors_str = '[' + ', '.join(dist_items) + ']'
            
            # Find the card line and replace its distractors
            # Strategy: Find "id: 'CARDID'" then find the next "distractors: [...]" and replace it
            # Split content into lines for easier handling
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if f"id: '{card_id}'" in line:
                    # Found the card, now replace the distractors in this line
                    # Find distractors: [...] pattern
                    old_pattern_start = line.find('distractors: [')
                    if old_pattern_start != -1:
                        # Find the closing bracket
                        bracket_count = 0
                        old_pattern_end = old_pattern_start + 14  # len('distractors: [')
                        for j in range(old_pattern_end, len(line)):
                            if line[j] == '[':
                                bracket_count += 1
                            elif line[j] == ']':
                                if bracket_count == 0:
                                    old_pattern_end = j + 1
                                    break
                                bracket_count -= 1
                        
                        # Replace
                        old_distractors = line[old_pattern_start:old_pattern_end]
                        new_line = line[:old_pattern_start] + f'distractors: {new_distractors_str}' + line[old_pattern_end:]
                        lines[i] = new_line
                        count += 1
                        print(f"✓ {card_id}")
                        break
        
        # Write back
        new_content = '\n'.join(lines)
        if new_content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"\n✅ Successfully updated {count}/{len(distractors_dict)} cards")
        else:
            print(f"❌ No changes made (0/{len(distractors_dict)})")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    base_dir = Path(__file__).parent.parent
    film_file = base_dir / 'lib' / 'filmSerienCards.ts'
    
    print("Applying film distractors...")
    apply_distractors(str(film_file), film_distractors)
