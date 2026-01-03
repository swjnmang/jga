#!/usr/bin/env python3
import re
import os
from pathlib import Path

# Film/Serien Distraktoren - komplett neu erstellt mit korrekten IDs
film_distractors = {
    'filmeserien-001-der-pate': [
        'Marlon Brando als Don Vito Corleone.',
        'Robert Duvall als Tom Hagen, der Consigliere.',
        'John Cazale als Fredo Corleone.'
    ],
    'filmeserien-002-der-pate-2': [
        'Coppola schrieb auch das Drehbuch mit Mario Puzo.',
        'Das Cinematography war von Gordon Willis.',
        'Der Film gewann 6 Academy Awards.'
    ],
    'filmeserien-003-goodfellas': [
        'Joe Pesci spielt Tommy DeVito.',
        'Ray Liotta spielt Henry Hill.',
        'Paul Sorvino spielt Paul Cicero.'
    ],
    'filmeserien-004-schindlers-liste': [
        'Ein blauer Mantel.',
        'Ein gelber Mantel.',
        'Ein rosa Mantel.'
    ],
    'filmeserien-005-shawshank': [
        'Ein kalter Stein.',
        'Ein rostiges Messer.',
        'Eine alte Bibel.'
    ],
    'filmeserien-006-fight-club': [
        'Die zweite Regel ist: Du fragst nie nach.',
        'Die dritte Regel ist: Keiner redet und keiner hört auf.',
        'Die vierte Regel ist: Jeder redet, schreit und kämpft.'
    ],
    'filmeserien-007-matrix': [
        'Die blaue Pille zeigt die Realität nicht.',
        'Die grüne Pille führt tiefer in die Matrix.',
        'Die schwarze Pille erlaubt das Ausloggen.'
    ],
    'filmeserien-008-lotr': [
        'Viggo Mortensen (Aragorn).',
        'Sean Astin (Samweis).',
        'Orlando Bloom (Legolas).'
    ],
    'filmeserien-009-lotr-gollum': [
        'Peter Jackson (auch Regisseur).',
        'Martin Freeman (Bilbo in Hobbits).',
        'Benedict Cumberbatch (im selben Universum).'
    ],
    'filmeserien-010-hp-stein': [
        'Hans Zimmer (andere Blockbuster).',
        'Henry Jackman (Ant-Man komponist).',
        'James Newton Howard (Batman-Komponist).'
    ],
    'filmeserien-011-hp-dumbledore': [
        'Ian McKellen und Michael Gambon (richtig, aber falsche Reihenfolge).',
        'Richard Harris und Daniel Radcliffe.',
        'Richard Harris und Ian McKellen.'
    ],
    'filmeserien-012-star-wars-iv': [
        'Alderaan.',
        'Mustafar (Vulkan-Planet).',
        'Coruscant (Hauptstadt des Imperiums).'
    ],
    'filmeserien-013-star-wars-v': [
        'Palpatine (der Imperator).',
        'Yoda (das grüne Wesen).',
        'Obi-Wan Kenobi (Lukes Mentor).'
    ],
    'filmeserien-014-star-wars-vi': [
        'Jawas (kurze Wüstenbewohner).',
        'Sandpeople (Tusken Raider).',
        'Ewoks sind tatsächlich Ewoks.'
    ],
    'filmeserien-015-star-wars-vii': [
        'Finn.',
        'Poe Dameron.',
        'Kylo Ren.'
    ],
    'filmeserien-016-rogue-one': [
        'Ein Lichtschwert.',
        'Die Falken des Widerstands.',
        'Eine Raumstation zum Zerstören.'
    ],
    'filmeserien-017-marvel-ironman': [
        'Chris Evans (Captain America).',
        'Mark Ruffalo (Hulk).',
        'Chris Hemsworth (Thor).'
    ],
    'filmeserien-018-marvel-avengers': [
        'Ava DuVernay (Black Panther Regisseurin).',
        'Kenneth Branagh (Thor Regisseur).',
        'Matthew Vaughn (X-Men Regisseur).'
    ],
    'filmeserien-019-marvel-endgame': [
        '"I am Thanos" - würde den falschen Gegner nennen.',
        '"This is the way" - ist aus Mandalorian.',
        '"Avengers, assemble!" - ist ein später im Film gesagter Satz.'
    ],
    'filmeserien-020-marvel-thanos': [
        'Acht (richtig, aber für andere Dinge).',
        'Sieben (nie genau gesagt).',
        'Fünf (zu wenig).'
    ],
    'filmeserien-021-marvel-loki': [
        'Time Ministry (ähnlich, aber falsch).',
        'Temporal Agency (auch nicht richtig).',
        'Chronological Bureau (nicht die Bezeichnung).'
    ],
    'filmeserien-022-dc-dark-knight': [
        'Jack Nicholson in Batman 1989.',
        'Jared Leto in Suicide Squad 2016.',
        'Joaquin Phoenix in Joker 2019 (ein anderer Film).'
    ],
    'filmeserien-023-dc-dark-knight-rises': [
        'The Riddler.',
        'Scarecrow.',
        'Two-Face.'
    ],
    'filmeserien-024-dc-joker': [
        'Martin Scorsese (Regisseur, nicht Schauspieler).',
        'Todd Phillips (Regisseur des Films).',
        'Christopher Nolan (anderer Batman-Regisseur).'
    ],
    'filmeserien-025-dune-2021': [
        'Steven Spielberg.',
        'Ridley Scott.',
        'Christopher Nolan.'
    ],
    'filmeserien-026-dune-spice': [
        'Arrakis ist der Planet, nicht das Gewürz.',
        'Caladan ist ein anderer Planet.',
        'Giedi Prime ist der Planet der Harkonnen.'
    ],
    'filmeserien-027-blade-runner': [
        'Ridley Scott (Regisseur).',
        'Denis Villeneuve (schließlich Dune-Regisseur).',
        'David Fincher (andere SF-Filme).'
    ],
    'filmeserien-028-blade-runner-2049': [
        'Rick Deckard (Hauptcharakter aus dem Original).',
        'K (der echte Name des Charakters).',
        'Sapper (anderer Character).'
    ],
    'filmeserien-029-inception': [
        'Hans Zimmer (Komponist, nicht das Objekt).',
        'Ludvig Göransson (andere Filmkomponist).',
        'John Williams (berühmter Komponist).'
    ],
    'filmeserien-030-interstellar': [
        'Endurance (das Raumschiff).',
        'Ranger (ein anderes Raumschiff).',
        'Lander (das Abstiegsmodul).'
    ],
    'filmeserien-031-tenet': [
        'Turnstile (die Maschinen für Inversion).',
        'Protagonist (der Name des Charakters, nicht "inversion").',
        'Neil (ein anderer Character).'
    ],
    'filemeserien-032-memento': [
        'In seinem Notizbuch aufschreiben.',
        'In Fotos markieren.',
        'Sich selbst an einen Tisch binden.'
    ],
    'filemeserien-033-oppenheimer': [
        'Enrico Fermi (Physiker, kein Darsteller).',
        'Albert Einstein (Physiker, Cameo nicht Hauptrolle).',
        'General Leslie Groves (historischer General, nicht Schauspieler).'
    ],
    'filemeserien-034-barbie': [
        'Margot Robbie (Schauspielerin).',
        'Ryan Gosling (Schauspieler).',
        'Will Ferrell (Schauspieler, nicht Regisseur).'
    ],
    'filemeserien-035-titanic': [
        'James Cameron (Regisseur, nicht Komponist).',
        'Enya (sang einen anderen Song).',
        'Henry Jackman (anderer Filmkomponist).'
    ],
    'filemeserien-036-avatar': [
        'James Cameron (Regisseur, nicht Name der blauen Bewohner).',
        'Denis Villeneuve (anderer Regisseur).',
        'Zoe Saldana (Schauspielerin, nicht Name der Spezies).'
    ],
    'filemeserien-037-avatar-2': [
        'Avatar: Fire and Ash (späterer Teil).',
        'Avatar: The Last Airbender (anderes Franchise).',
        'Avatar: Legends of Pandora (nicht der richtige Titel).'
    ],
    'filemeserien-038-jaws': [
        'Jaws 2 (Sequel).',
        'Jaws 3 (noch ein Sequel).',
        'Jaws: The Revenge (vierter Film).'
    ],
    'filemeserien-039-e-t': [
        'Henry Thomas (Schauspieler, nicht E.T.).',
        'Elliott (der Junge, nicht E.T.).',
        'Drew Barrymore (Schauspielerin).'
    ],
    'filemeserien-040-jurassic-park': [
        'Velociraptor (andere Dino-Art).',
        'Stegosaurus (andere Dino-Art).',
        'Triceratops (andere Dino-Art).'
    ],
    'filemeserien-041-indiana-jones': [
        'Harrison Ford (Schauspieler).',
        'Tom Selleck (anderer Kandidat für die Rolle).',
        'Pierce Brosnan (Bond-Darsteller).'
    ],
    'filemeserien-042-indiana-jones-3': [
        'River Phoenix (spielte Junger Indy).',
        'Alison Doody (Schauspielerin im Film).',
        'Denholm Elliott (anderer Schauspieler im Film).'
    ],
    'filemeserien-043-alien': [
        'James Cameron (Aliens-Regisseur, nicht Alien).',
        'David Fincher (Alien3-Regisseur).',
        'Jean-Pierre Jeunet (Alien Resurrection-Regisseur).'
    ],
    'filemeserien-044-aliens': [
        'Sigourney Weaver (Schauspielerin, nicht Regisseur).',
        'Bill Paxton (Schauspieler im Film).',
        'Lance Henriksen (anderer Schauspieler).'
    ],
    'filemeserien-045-terminator': [
        'I am here to protect you.',
        'I must go back.',
        'I am the machine.'
    ],
    'filemeserien-046-terminator-2': [
        'Sarah Connor (Charakter, nicht das Modell).',
        'John Connor (anderer Charakter).',
        'The T-800 (in T2 ist er der Gute).'
    ],
    'filemeserien-047-mad-max-fury': [
        'Tom Hardy (Schauspieler, nicht Furiosa).',
        'Nicholas Hoult (anderer Schauspieler).',
        'Hugh Keays-Byrne (anderer Schauspieler).'
    ],
}

# Funktion zum Ersetzen der Distraktoren
def apply_distractors_to_file(filepath, distractors_dict):
    """
    Apply distractors to a TypeScript card file by replacing content smartly.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        count = 0
        not_found = []
        
        for card_id, new_distractors in distractors_dict.items():
            # Escape quotes for TypeScript
            safe_distractors = []
            for d in new_distractors:
                # Replace single quotes with escaped versions for TypeScript
                d_safe = d.replace("'", "\\'")
                safe_distractors.append(f"'{d_safe}'")
            
            distractors_str = ', '.join(safe_distractors)
            
            # Try to find and replace the card's distractors field
            # Pattern: match the card by ID, then find the distractors array and replace it
            pattern = f"(id: '{re.escape(card_id)}'[^}}]{{0,500}}?), distractors: \\[[^\\]]*\\]"
            replacement = f"\\1, distractors: [{distractors_str}]"
            
            new_content = re.sub(pattern, replacement, content, count=1, flags=re.DOTALL)
            
            if new_content != content:
                content = new_content
                count += 1
                print(f"✓ {card_id}")
            else:
                not_found.append(card_id)
        
        # Write back if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"\n✅ Successfully updated {count}/{len(distractors_dict)} cards")
            if not_found:
                print(f"⚠️  {len(not_found)} cards not found (check IDs)")
                for card_id in not_found[:5]:  # Show first 5
                    print(f"   - {card_id}")
                if len(not_found) > 5:
                    print(f"   ... and {len(not_found) - 5} more")
        else:
            print("❌ No changes made")
    
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == '__main__':
    base_dir = Path(__file__).parent.parent
    film_file = base_dir / 'lib' / 'filmSerienCards.ts'
    
    print("Applying film/series distractors...")
    apply_distractors_to_file(str(film_file), film_distractors)
