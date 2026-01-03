#!/usr/bin/env python3
"""Add distractors to all filmSerienCards (001-200)"""
import re

# Movie/TV show related distractors - plausible wrong answers
distractors_data = {
    'filmeserien-001-der-pate': ['Robert De Niro.', 'Marlon Brando.', 'Marlon Brando Jr.'],
    'filmeserien-002-der-pate-2': ['Martin Scorsese.', 'Steven Spielberg.', 'Brian De Palma.'],
    'filmeserien-003-goodfellas': ['Steven Spielberg.', 'Francis Ford Coppola.', 'Brian De Palma.'],
    'filmeserien-004-schindlers-liste': ['Ein blauer Mantel.', 'Ein weißer Mantel.', 'Ein schwarzer Mantel.'],
    'filmeserien-005-shawshank': ['Ein Seilseil.', 'Ein Sprengstoff.', 'Ein Gewehr.'],
    'filmeserien-006-fight-club': ['Du kämpfst allein im Fight Club.', 'Jedermann spricht über den Fight Club.', 'Niemand kämpft im Fight Club.'],
    'filmeserien-007-matrix': ['Die blaue Pille.', 'Die grüne Pille.', 'Die schwarze Pille.'],
    'filmeserien-008-lotr': ['Ian McKellen.', 'Viggo Mortensen.', 'Sean Astin.'],
    'filmeserien-009-lotr-gollum': ['Peter Jackson.', 'Martin Freeman.', 'Benedict Cumberbatch.'],
    'filmeserien-010-hp-stein': ['Hans Zimmer.', 'Henry Jackman.', 'James Newton Howard.'],
    'filmeserien-011-hp-dumbledore': ['Ian McKellen und Michael Gambon.', 'Richard Harris und Daniel Radcliffe.', 'Richard Harris und Ian McKellen.'],
    'filmeserien-012-star-wars-iv': ['Alderaan.', 'Mustafar.', 'Coruscant.'],
    'filmeserien-013-star-wars-v': ['Palpatine (Darth Sidious).', 'Yoda.', 'Obi-Wan Kenobi.'],
    'filmeserien-014-star-wars-vi': ['Jawas.', 'Sandpeople.', 'Tusken Raider.'],
    'filmeserien-015-star-wars-vii': ['Finn.', 'Poe Dameron.', 'Kylo Ren.'],
    'filmeserien-016-rogue-one': ['Ein Lichtschwert.', 'Die Falken.', 'Eine Raumstation.'],
    'filmeserien-017-marvel-ironman': ['Chris Evans.', 'Mark Ruffalo.', 'Chris Hemsworth.'],
    'filmeserien-018-marvel-avengers': ['Ava DuVernay.', 'Kenneth Branagh.', 'Matthew Vaughn.'],
    'filmeserien-019-marvel-endgame': ['"I am Thanos."', '"This is the way."', '"Avengers, assemble!"'],
    'filmeserien-020-marvel-thanos': ['Acht.', 'Sieben.', 'Fünf.'],
    'filmeserien-021-marvel-loki': ['Time Ministry (TM).', 'Temporal Regulation Authority (TRA).', 'Chronological Control Bureau (CCB).'],
}

filepath = 'lib/filmSerienCards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
# For each card, add distractors
for card_id, distractors in distractors_data.items():
    distractors_json = ', '.join([f"'{d}'" for d in distractors])
    pattern = f"(id: '{card_id}'[^}}]*?)sources: {{}}"
    replacement = f"\\1sources: {{}}, distractors: [{distractors_json}]"
    
    if re.search(pattern, content, flags=re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        count += 1
        print(f"✓ {card_id}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✓ Added distractors to {count} cards")
print(f"\nNote: Cards 022-200 need manual creation or expansion.")
print(f"Current coverage: {count}/200 cards ({int(count/200*100)}%)")
