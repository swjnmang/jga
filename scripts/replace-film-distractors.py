#!/usr/bin/env python3
"""
Directly replace old distractors with new ones in filmSerienCards.ts
Uses real find/replace of the actual array strings.
"""
import re
from pathlib import Path

# For each card: [old_distractors_array_str, new_distractors_list]
replacements = {
    'filmeserien-001-der-pate': {
        'old': "['Marlon Brando als Don Vito.', 'Robert Duvall als Tom Hagen.', 'John Cazale als Fredo.']",
        'new': ['Marlon Brando als Don Vito Corleone.', 'Robert Duvall als Tom Hagen, der Consigliere.', 'John Cazale als Fredo Corleone.']
    },
    'filemeserien-002-der-pate-2': {
        'old': "['Gordon Willis (Cinematography).', 'Thelma Schoonmaker (Editor).', 'Nino Rota (Composer).']",
        'new': ['Coppola schrieb auch das Drehbuch mit Mario Puzo.', 'Das Cinematography war von Gordon Willis.', 'Der Film gewann 6 Academy Awards.']
    },
    'filemeserien-003-goodfellas': {
        'old': "['Quentin Tarantino in Pulp Fiction 1994.', 'David Fincher in Seven 1995.', 'Michael Mann in Heat 1995.']",
        'new': ['Joe Pesci spielt Tommy DeVito.', 'Ray Liotta spielt Henry Hill.', 'Paul Sorvino spielt Paul Cicero.']
    },
    'filemeserien-004-schindlers-liste': {
        'old': "['Ein grüner Mantel.', 'Ein gelber Mantel.', 'Ein rosa Mantel.']",
        'new': ['Ein blauer Mantel.', 'Ein gelber Mantel.', 'Ein rosa Mantel.']
    },
    'filemeserien-005-shawshank': {
        'old': "['Das Gitterfenster.', 'Die Biographie.', 'Der Stein.']",
        'new': ['Ein kalter Stein.', 'Ein rostiges Messer.', 'Eine alte Bibel.']
    },
    'filemeserien-006-fight-club': {
        'old': "['Du wirst laut.', 'Du kämpfst zusammen.', 'Du wirst reich.']",
        'new': ['Die zweite Regel ist: Du fragst nie nach.', 'Die dritte Regel ist: Keiner redet und keiner hört auf.', 'Die vierte Regel ist: Jeder redet, schreit und kämpft.']
    },
    'filemeserien-007-matrix': {
        'old': "['Die blaue Pille.', 'Die grüne Pille.', 'Die schwarze Pille.']",
        'new': ['Die blaue Pille zeigt die Realität nicht.', 'Die grüne Pille führt tiefer in die Matrix.', 'Die schwarze Pille erlaubt das Ausloggen.']
    },
    'filemeserien-008-lotr': {
        'old': "['Ian McKellen.', 'Viggo Mortensen.', 'Sean Astin.']",
        'new': ['Viggo Mortensen (Aragorn).', 'Sean Astin (Samweis).', 'Orlando Bloom (Legolas).']
    },
    'filemeserien-009-lotr-gollum': {
        'old': "['Peter Jackson.', 'Martin Freeman.', 'Benedict Cumberbatch.']",
        'new': ['Peter Jackson (auch Regisseur).', 'Martin Freeman (Bilbo in Hobbits).', 'Benedict Cumberbatch (im selben Universum).']
    },
    'filemeserien-010-hp-stein': {
        'old': "['Hans Zimmer.', 'Henry Jackman.', 'James Newton Howard.']",
        'new': ['Hans Zimmer (andere Blockbuster).', 'Henry Jackman (Ant-Man komponist).', 'James Newton Howard (Batman-Komponist).']
    },
    'filemeserien-011-hp-dumbledore': {
        'old': "['Ian McKellen und Michael Gambon.', 'Richard Harris und Daniel Radcliffe.', 'Richard Harris und Ian McKellen.']",
        'new': ['Ian McKellen und Michael Gambon.', 'Richard Harris und Daniel Radcliffe.', 'Richard Harris und Ian McKellen.']
    },
    'filemeserien-012-star-wars-iv': {
        'old': "['Alderaan.', 'Mustafar.', 'Coruscant.']",
        'new': ['Alderaan.', 'Mustafar (Vulkan-Planet).', 'Coruscant (Hauptstadt des Imperiums).']
    },
    'filemeserien-013-star-wars-v': {
        'old': "['Palpatine.', 'Yoda.', 'Obi-Wan Kenobi.']",
        'new': ['Palpatine (der Imperator).', 'Yoda (das grüne Wesen).', 'Obi-Wan Kenobi (Lukes Mentor).']
    },
    'filemeserien-014-star-wars-vi': {
        'old': "['Jawas.', 'Sandpeople.', 'Tusken Raider.']",
        'new': ['Jawas (kurze Wüstenbewohner).', 'Sandpeople (Tusken Raider).', 'Gungans (nicht Ewoks).']
    },
    'filemeserien-015-star-wars-vii': {
        'old': "['Finn.', 'Poe Dameron.', 'Kylo Ren.']",
        'new': ['Finn.', 'Poe Dameron.', 'Kylo Ren.']
    },
    'filemeserien-016-rogue-one': {
        'old': "['Ein Lichtschwert.', 'Die Falken.', 'Eine Raumstation.']",
        'new': ['Ein Lichtschwert.', 'Die Falken des Widerstands.', 'Eine Raumstation.']
    },
    'filemeserien-017-marvel-ironman': {
        'old': "['Chris Evans.', 'Mark Ruffalo.', 'Chris Hemsworth.']",
        'new': ['Chris Evans (Captain America).', 'Mark Ruffalo (Hulk).', 'Chris Hemsworth (Thor).']
    },
    'filemeserien-018-marvel-avengers': {
        'old': "['Ava DuVernay.', 'Kenneth Branagh.', 'Matthew Vaughn.']",
        'new': ['Ava DuVernay.', 'Kenneth Branagh.', 'Matthew Vaughn.']
    },
    'filemeserien-019-marvel-endgame': {
        'old': '["\\"I am Iron Man.\\"", "\\"This is the way.\\"", "\\"Avengers, assemble!\\""]',
        'new': ['"I am Thanos."', '"This is the way."', '"Avengers, assemble!"']
    },
    'filemeserien-020-marvel-thanos': {
        'old': "['Acht.', 'Sieben.', 'Fünf.']",
        'new': ['Acht.', 'Sieben.', 'Fünf.']
    },
    'filemeserien-021-marvel-loki': {
        'old': "['Time Ministry.', 'Temporal Agency.', 'Chronological Bureau.']",
        'new': ['Time Ministry.', 'Temporal Agency.', 'Chronological Bureau.']
    },
    'filemeserien-022-dc-dark-knight': {
        'old': "['Jack Nicholson in Batman 1989.', 'Jared Leto in Suicide Squad 2016.', 'Joaquin Phoenix in Joker 2019.']",
        'new': ['Jack Nicholson in Batman 1989.', 'Jared Leto in Suicide Squad 2016.', 'Joaquin Phoenix in Joker 2019.']
    },
    'filemeserien-023-dc-dark-knight-rises': {
        'old': "['The Riddler.', 'Scarecrow.', 'Two-Face.']",
        'new': ['The Riddler.', 'Scarecrow.', 'Two-Face.']
    },
    'filemeserien-024-dc-joker': {
        'old': "['Martin Scorsese.', 'Todd Phillips.', 'Christopher Nolan.']",
        'new': ['Martin Scorsese.', 'Todd Phillips.', 'Christopher Nolan.']
    },
    'filemeserien-025-dune-2021': {
        'old': "['Dune Part Two.', 'Dune Part Three.', 'Dune Finale.']",
        'new': ['Steven Spielberg.', 'Ridley Scott.', 'Christopher Nolan.']
    },
    'filemeserien-026-dune-spice': {
        'old': "['Arrakis.', 'Caladan.', 'Giedi Prime.']",
        'new': ['Arrakis ist der Planet.', 'Caladan ist ein anderer Planet.', 'Giedi Prime ist der Planet der Harkonnen.']
    },
    'filemeserien-027-blade-runner': {
        'old': "['Ridley Scott.', 'Denis Villeneuve.', 'David Fincher.']",
        'new': ['Ridley Scott (Regisseur).', 'Denis Villeneuve.', 'David Fincher.']
    },
    'filemeserien-028-blade-runner-2049': {
        'old': "['Ford.', 'Deckard.', 'Sapper.']",
        'new': ['Rick Deckard.', 'K.', 'Sapper.']
    },
    'filemeserien-029-inception': {
        'old': "['Hans Zimmer.', 'Ludvig Göransson.', 'John Williams.']",
        'new': ['Hans Zimmer.', 'Ludvig Göransson.', 'John Williams.']
    },
    'filemeserien-030-interstellar': {
        'old': "['Endurance.', 'Ranger.', 'Lander.']",
        'new': ['Endurance.', 'Ranger.', 'Lander.']
    },
    'filemeserien-031-tenet': {
        'old': "['Turnstile.', 'Protagonist.', 'Neil.']",
        'new': ['Turnstile.', 'Protagonist.', 'Neil.']
    },
    'filemeserien-032-memento': {
        'old': "['Following.', 'Insomnia.', 'The Prestige.']",
        'new': ['In seinem Notizbuch.', 'In Fotos.', 'Sich selbst an einen Tisch binden.']
    },
    'filemeserien-033-oppenheimer': {
        'old': "['Enrico Fermi.', 'Albert Einstein.', 'General Groves.']",
        'new': ['Enrico Fermi.', 'Albert Einstein.', 'General Groves.']
    },
    'filemeserien-034-barbie': {
        'old': "['Margot Robbie.', 'Ryan Gosling.', 'Will Ferrell.']",
        'new': ['Margot Robbie.', 'Ryan Gosling.', 'Will Ferrell.']
    },
    'filemeserien-035-titanic': {
        'old': "['James Cameron.', 'Cameron.', 'James Francis.']",
        'new': ['James Cameron.', 'Enya.', 'Henry Jackman.']
    },
    'filemeserien-036-avatar': {
        'old': "['James Cameron.', 'Denis Villeneuve.', 'Zoe Saldana.']",
        'new': ['James Cameron.', 'Denis Villeneuve.', 'Zoe Saldana.']
    },
    'filemeserien-037-avatar-2': {
        'old': "['Avatar 3.', 'Avatar: Fire and Ash.', 'Pandora Rising.']",
        'new': ['Avatar: Fire and Ash.', 'Avatar: The Last Airbender.', 'Avatar: Legends of Pandora.']
    },
    'filemeserien-038-jaws': {
        'old': "['Jaws 2.', 'Jaws 3.', 'Jaws: The Revenge.']",
        'new': ['Jaws 2.', 'Jaws 3.', 'Jaws: The Revenge.']
    },
    'filemeserien-039-e-t': {
        'old': "['Henry Thomas.', 'Elliott.', 'Drew Barrymore.']",
        'new': ['Henry Thomas.', 'Elliott.', 'Drew Barrymore.']
    },
    'filemeserien-040-jurassic-park': {
        'old': "['Velociraptor.', 'Stegosaurus.', 'Triceratops.']",
        'new': ['Velociraptor.', 'Stegosaurus.', 'Triceratops.']
    },
    'filemeserien-041-indiana-jones': {
        'old': "['Harrison Ford.', 'Tom Selleck.', 'Pierce Brosnan.']",
        'new': ['Harrison Ford.', 'Tom Selleck.', 'Pierce Brosnan.']
    },
    'filemeserien-042-indiana-jones-3': {
        'old': "['River Phoenix.', 'Alison Doody.', 'Denholm Elliott.']",
        'new': ['River Phoenix.', 'Alison Doody.', 'Denholm Elliott.']
    },
    'filemeserien-043-alien': {
        'old': "['James Cameron.', 'David Fincher.', 'Jean-Pierre Jeunet.']",
        'new': ['James Cameron.', 'David Fincher.', 'Jean-Pierre Jeunet.']
    },
    'filemeserien-044-aliens': {
        'old': "['Sigourney Weaver.', 'Bill Paxton.', 'Lance Henriksen.']",
        'new': ['Sigourney Weaver.', 'Bill Paxton.', 'Lance Henriksen.']
    },
    'filemeserien-045-terminator': {
        'old': '["\\"I am here to protect you.\\"", "\\"I must go back.\\"", "\\"I am the protector.\\""]',
        'new': ['"I\'ll be back."', 'I am here to protect you.', 'I must go back.']
    },
    'filemeserien-046-terminator-2': {
        'old': "['Sarah Connor.', 'John Connor.', 'The T-1000.']",
        'new': ['Sarah Connor.', 'John Connor.', 'The T-1000.']
    },
    'filemeserien-047-mad-max-fury': {
        'old': "['Tom Hardy.', 'Nicholas Hoult.', 'Hugh Keays-Byrne.']",
        'new': ['Tom Hardy.', 'Nicholas Hoult.', 'Hugh Keays-Byrne.']
    },
}

def format_distractor(d):
    """Format a distractor string for TypeScript."""
    # Escape single quotes
    d = d.replace("'", "\\'")
    return f"'{d}'"

def apply_replacements(filepath):
    """Apply all replacements to the file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    count = 0
    
    for card_id, data in replacements.items():
        old_str = data['old']
        new_list = data['new']
        
        if old_str in content:
            # Format new distractors
            new_dist_strs = [format_distractor(d) for d in new_list]
            new_str = '[' + ', '.join(new_dist_strs) + ']'
            
            content = content.replace(old_str, new_str, 1)
            count += 1
            print(f"[+] {card_id}")
        else:
            print(f"[-] {card_id} (old pattern not found)")
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n[SUCCESS] Updated {count}/{len(replacements)} cards")
    else:
        print(f"\n[FAILED] No changes made")

if __name__ == '__main__':
    base_dir = Path(__file__).parent.parent
    film_file = base_dir / 'lib' / 'filmSerienCards.ts'
    apply_replacements(str(film_file))
