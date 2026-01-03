#!/usr/bin/env python3
"""
Generate comprehensive, non-obvious distractors for all categories.
Strategy: Create distractors that are plausibly related but not simply
other answers from the same category.
"""
import re
import json

# Distractor mappings - manually curated for each question
# Strategy: Use contextually related but different answers
distractors_by_id = {
    # IMAGE CARDS IN cards.ts
    'image-berliner-mauerfall': ['Untergang der Mauer 1961 Berlin', 'Mauerfall DDR 1991', 'Fluchtversuch an der Grenze'],
    'image-1989-tiananmen': ['Proteste in Prag 1989', 'Revolte in Oestberlin 1989', 'Buergerproteste in Ungarn 1989'],
    
    # FILM/SERIES CARDS - Will read from filmSerienCards.ts
    # Strategy: For each movie/series, provide distractors of other movies/series from similar era or genre
    
    # OUTLINE CARDS - Will read from outlineCards.ts
    # Strategy: For each country outline, provide other countries with similar shapes or regions
    
    # NATUR/TECHNIK CARDS - Will read from naturTechnikCards.ts
    # Strategy: For scientific questions, provide plausible but wrong answers
    'naturtechnik-easy-001': ['Kohlenstoffdioxid', 'Stickstoff', 'Edelgas'],
    'naturtechnik-easy-002': ['Hämoglobin', 'Melanin', 'Karotin'],
    
    # TRIVIA EXTRA CARDS - Will read from triviaExtraCards.ts
    # Strategy: Contextually related wrong answers
}

def read_json_cards(filepath):
    """Read cards from JSON-like TypeScript files"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract the array content between [ and ]
        match = re.search(r'\[\s*\{.*?\}\s*\]', content, re.DOTALL)
        if match:
            # This is complex JSON, we'll parse it differently
            # Extract individual card objects
            cards = []
            # Split by closing brace followed by comma and opening brace
            card_matches = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', content, re.DOTALL)
            return card_matches
        return []
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

def extract_cards_from_typescript(filepath):
    """Extract card objects from TypeScript files"""
    cards = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Find all card objects
        current_card = ""
        brace_count = 0
        
        for line in lines:
            if '{' in line:
                brace_count += 1
                current_card += line
            elif '}' in line:
                current_card += line
                brace_count -= 1
                if brace_count == 0 and current_card.strip().startswith('{'):
                    cards.append(current_card)
                    current_card = ""
            elif brace_count > 0:
                current_card += line
        
        return cards
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

# For now, create a master distractors dictionary
# This is a partial implementation - we need ALL cards first

comprehensive_distractors = {
    # FILM/SERIEN EXAMPLES (these will be expanded with actual cards)
    'film-1977-star-wars': ['Jäger des verlorenen Schatzes 1981', 'Zurück in die Zukunft 1985', 'Der weiße Hai 1975'],
    'film-1994-forrest-gump': ['Das Shining 1980', 'E.T. 1982', 'Tage des Donners 1990'],
    'film-1997-titanic': ['Der Titanen 1997', 'Avatar 2009', 'Inception 2010'],
    
    # OUTLINE CARDS EXAMPLES
    'outline-france': ['Spanien', 'Deutschland', 'Italien'],
    'outline-australia': ['Neuseeland', 'Brasilien', 'Afrika'],
    
    # NATUR/TECHNIK EXAMPLES (more will be generated)
    'nature-planet-mars': ['Venus', 'Merkur', 'Jupiter'],
    'nature-gravity': ['Magnetismus', 'Reibung', 'Auftrieb'],
}

def generate_generic_distractors(answer, category):
    """Generate plausible but wrong distractors based on answer and category"""
    # This is a fallback for cards we haven't specifically curated
    
    generic_distractors = []
    
    if category == 'image':
        generic_distractors = [
            'Erinnerung an historisches Ereignis',
            'Dokumentation einer Bewegung',
            'Zeugnis eines Umbruchs'
        ]
    elif category == 'film':
        generic_distractors = [
            'Spielfilm von Steven Spielberg',
            'Blockbuster aus der 80er Jahren',
            'Klassiker des Hollywood-Kinos'
        ]
    elif category == 'outline':
        generic_distractors = [
            'Land in Europa',
            'Kuestenstaat',
            'Inselgruppe'
        ]
    elif category in ['naturtechnik', 'nature']:
        generic_distractors = [
            'Naturphaenomen',
            'Physikalisches Konzept',
            'Biologischer Prozess'
        ]
    elif category == 'trivia':
        generic_distractors = [
            'Verwandter Begriff',
            'Aehnliches Konzept',
            'Alternative Antwort'
        ]
    
    return generic_distractors[:3]

print("Reading all card files...")

# This is complex - we need to parse TypeScript files with card definitions
# For now, output the strategy

print("""
STRATEGY FOR NON-OBVIOUS DISTRACTORS:

1. IMAGE CARDS: Historical events from similar time periods or related themes
2. FILM/SERIEN CARDS: Other movies/series from the same director, actor, genre or era
3. OUTLINE CARDS: Geographically similar countries or countries in same region
4. NATUR/TECHNIK CARDS: Scientifically plausible alternatives (test common misconceptions)
5. TRIVIA EXTRA CARDS: Related concepts from same domain but different context

IMPLEMENTATION:
- Read each card file
- Extract answer for each card
- Generate 3 non-obvious distractors per card
- Replace or add distractors in original files

This script requires detailed knowledge of:
1. What the correct answer is
2. What common wrong answers are for each question
3. What related-but-wrong concepts exist in the same domain
""")

# The actual implementation would need:
# 1. Full list of all cards with their answers
# 2. Mapping of related concepts for each answer
# 3. Careful curation to ensure distractors are plausible but not obvious

print("\nNOTE: This is a template. Full implementation requires:")
print("- Complete card database")
print("- Domain-specific distractor research")
print("- Category-specific strategies")
print("\nFor now, quote cards have been handled.")
print("Image, Film, Outline, NaturTechnik, and TriviaExtra need manual curation.")
