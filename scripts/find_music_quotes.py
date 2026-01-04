#!/usr/bin/env python3
"""
Find all music-based quote cards and generate gender-consistent distractor suggestions.
This script reads line-by-line to handle the multi-line structure properly.
"""

import re

# GENDER MAPPING
MALE_ARTISTS = {
    'nirvana', 'queen', 'michael jackson', 'ed sheeran', 'the weeknd', 
    'a-ha', 'david bowie', 'john lennon', 'eagles', 'outkast',
    'the white stripes', 'daft punk', 'pharrell williams',
    'eminem', 'bon jovi', 'the beatles', 'the rolling stones',
    'led zeppelin', 'radiohead', 'coldplay', 'the killers',
    'muse', 'imagine dragons', 'deep purple', 'foreigner',
    'journey', 'jethro tull', 'pink floyd', 'backstreet boys'
}

FEMALE_ARTISTS = {
    'adele', 'billie eilish', 'taylor swift', 'ariana grande',
    'rihanna', 'lady gaga', 'madonna', 'beyonce', 'whitney houston',
    'mariah carey', 'britney spears', 'christina aguilera',
    'amy winehouse', 'norah jones', 'celine dion', 'nena',
    'helene fischer', 'spice girls'
}

# Read and parse the file
with open('../lib/cards.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Extract all songs first
print("STEP 1: Extract all songs (category: 'music')\n")

songs_by_gender = {'male': [], 'female': [], 'unknown': []}

i = 0
while i < len(lines):
    if "category: 'music'" in lines[i]:
        # Found a music entry, extract answer
        j = i
        while j < len(lines) and 'answer:' not in lines[j]:
            j += 1
        
        if j < len(lines):
            answer_line = lines[j].strip()
            # Extract answer value
            answer_match = re.search(r"answer:\s*'([^']+)'", answer_line)
            if answer_match:
                answer = answer_match.group(1)
                
                # Extract artist
                artist_match = re.search(r'^([^–—]+)', answer)
                if artist_match:
                    artist = artist_match.group(1).strip().lower()
                    
                    # Determine gender
                    gender = 'unknown'
                    for male in MALE_ARTISTS:
                        if male in artist:
                            gender = 'male'
                            break
                    if gender == 'unknown':
                        for female in FEMALE_ARTISTS:
                            if female in artist:
                                gender = 'female'
                                break
                    
                    songs_by_gender[gender].append({
                        'answer': answer,
                        'artist': artist
                    })
    i += 1

print(f"Songs by gender:")
print(f"  Male: {len(songs_by_gender['male'])}")
for s in songs_by_gender['male'][:3]:
    print(f"    - {s['answer'][:60]}")
print(f"  Female: {len(songs_by_gender['female'])}")
for s in songs_by_gender['female']:
    print(f"    - {s['answer'][:60]}")

# Now find music quotes (category: 'quote' with " – " in answer)
print("\n" + "="*120)
print("STEP 2: Find all music-based quotes (category: 'quote' with '–')\n")

music_quotes = []

i = 0
while i < len(lines):
    if "id: 'quote-" in lines[i]:
        quote_id_match = re.search(r"id: '(quote-[^']+)'", lines[i])
        if quote_id_match:
            quote_id = quote_id_match.group(1)
            
            # Find the answer in the next lines
            j = i
            answer = None
            difficulty = None
            current_distractors = None
            
            while j < len(lines) and j < i + 30:  # Look ahead up to 30 lines
                if 'answer:' in lines[j]:
                    answer_match = re.search(r"answer:\s*'([^']+)'", lines[j])
                    if answer_match:
                        answer = answer_match.group(1)
                
                if 'difficulty:' in lines[j]:
                    diff_match = re.search(r"difficulty:\s*'([^']+)'", lines[j])
                    if diff_match:
                        difficulty = diff_match.group(1)
                
                if 'distractors:' in lines[j]:
                    dist_match = re.search(r"distractors:\s*\[([^\]]+)\]", lines[j])
                    if dist_match:
                        dist_str = dist_match.group(1)
                        current_distractors = re.findall(r"'([^']+)'", dist_str)
                        break
                j += 1
            
            # Check if it's a music quote
            if answer and ' – ' in answer:
                # Extract artist
                artist_match = re.search(r'^([^–—]+)', answer)
                if artist_match:
                    artist = artist_match.group(1).strip().lower()
                    
                    # Determine gender
                    gender = 'unknown'
                    for male in MALE_ARTISTS:
                        if male in artist:
                            gender = 'male'
                            break
                    if gender == 'unknown':
                        for female in FEMALE_ARTISTS:
                            if female in artist:
                                gender = 'female'
                                break
                    
                    music_quotes.append({
                        'id': quote_id,
                        'answer': answer,
                        'difficulty': difficulty,
                        'gender': gender,
                        'artist': artist,
                        'current_distractors': current_distractors or []
                    })
    i += 1

print(f"Found {len(music_quotes)} music quotes\n")

print("="*120)
print("MUSIC QUOTES WITH NEW DISTRACTOR SUGGESTIONS\n")

# Generate suggestions
for quote in music_quotes:
    print(f"\nID: {quote['id']}")
    print(f"Answer: {quote['answer']}")
    print(f"Difficulty: {quote['difficulty']}")
    print(f"Gender: {quote['gender']}")
    print(f"Current distractors: {quote['current_distractors'][:1]}...")
    
    # Get available songs for this gender
    available = [s for s in songs_by_gender[quote['gender']] if s['artist'] != quote['artist']]
    
    if available:
        print(f"Suggested new distractors ({len(available)} available):")
        for j, song in enumerate(available[:3], 1):
            print(f"  {j}. {song['answer']}")
    else:
        print(f"WARNING: No other songs by {quote['gender']} artists available!")
    
    print("-" * 120)

print(f"\nTotal music quotes to fix: {len(music_quotes)}")
