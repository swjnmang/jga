#!/usr/bin/env python3
"""
Analyze music quotes and songs to create gender-consistent distractor suggestions.
"""

import re
import json

# Read the file
with open('../lib/cards.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# GENDER MAPPING - Artists in our database
MALE_ARTISTS = {
    'nirvana', 'queen', 'michael jackson', 'ed sheeran', 'the weeknd', 
    'a-ha', 'david bowie', 'john lennon', 'eagles', 'outkast',
    'the white stripes', 'daft punk', 'pharrell williams',
    'eminem', 'bon jovi', 'the beatles', 'the rolling stones',
    'led zeppelin', 'radiohead', 'coldplay', 'the killers',
    'muse', 'imagine dragons', 'deep purple', 'foreigner',
    'journey', 'jethro tull', 'pink floyd'
}

FEMALE_ARTISTS = {
    'adele', 'billie eilish', 'taylor swift', 'ariana grande',
    'rihanna', 'lady gaga', 'madonna', 'beyonce', 'whitney houston',
    'mariah carey', 'britney spears', 'christina aguilera',
    'amy winehouse', 'norah jones', 'celine dion', 'nena',
    'helene fischer', 'spice girls'
}

# Extract all songs (category: 'music')
print("EXTRACTING SONGS FROM DATABASE...\n")
songs_by_gender = {'male': [], 'female': [], 'unknown': []}

song_pattern = r"id:\s*'(song-[^']+)'[^}]*?title:\s*'([^']+)'[^}]*?category:\s*'music'[^}]*?answer:\s*'([^']+)'"

for match in re.finditer(song_pattern, content, re.DOTALL):
    song_id = match.group(1)
    song_title = match.group(2)
    song_answer = match.group(3)
    
    # Extract artist name
    artist_match = re.search(r'^([^–—]+)', song_answer)
    if artist_match:
        artist = artist_match.group(1).strip().lower()
        
        # Determine gender
        gender = 'unknown'
        for male_artist in MALE_ARTISTS:
            if male_artist in artist:
                gender = 'male'
                break
        
        if gender == 'unknown':
            for female_artist in FEMALE_ARTISTS:
                if female_artist in artist:
                    gender = 'female'
                    break
        
        song_entry = {
            'id': song_id,
            'title': song_title,
            'answer': song_answer,
            'artist': artist
        }
        
        songs_by_gender[gender].append(song_entry)

print(f"Songs categorized:")
print(f"  Male artists: {len(songs_by_gender['male'])}")
print(f"  Female artists: {len(songs_by_gender['female'])}")
print(f"  Unknown: {len(songs_by_gender['unknown'])}\n")

# Show categorized songs
print("MALE ARTISTS:")
for song in songs_by_gender['male']:
    print(f"  {song['answer']}")

print("\nFEMALE ARTISTS:")
for song in songs_by_gender['female']:
    print(f"  {song['answer']}")

print("\nUNKNOWN:")
for song in songs_by_gender['unknown']:
    print(f"  {song['answer']}")

# Now extract all QUOTE entries that look like music quotes
print("\n" + "="*140)
print("ANALYZING MUSIC QUOTES...\n")

music_quotes = []
quote_pattern = r"id:\s*'(quote-[^']+)'[^}]*?title:\s*'([^']+)'[^}]*?category:\s*'quote'[^}]*?answer:\s*'([^']+)'[^}]*?difficulty:\s*'([^']+)'[^}]*?distractors:\s*\[([^\]]+)\]"

for match in re.finditer(quote_pattern, content, re.DOTALL):
    quote_id = match.group(1)
    title = match.group(2)
    answer = match.group(3)
    difficulty = match.group(4)
    distractors_str = match.group(5)
    
    # Check if it looks like a music quote (has dash and song-like structure)
    if ' – ' in answer or ' — ' in answer:
        # Extract artist
        artist_match = re.search(r'^([^–—]+)', answer)
        if artist_match:
            artist = artist_match.group(1).strip().lower()
            
            # Determine gender
            gender = 'unknown'
            for male_artist in MALE_ARTISTS:
                if male_artist in artist:
                    gender = 'male'
                    break
            
            if gender == 'unknown':
                for female_artist in FEMALE_ARTISTS:
                    if female_artist in artist:
                        gender = 'female'
                        break
            
            # Extract current distractors
            current_distractors = re.findall(r"'([^']+)'", distractors_str)
            
            music_quotes.append({
                'id': quote_id,
                'title': title,
                'answer': answer,
                'difficulty': difficulty,
                'gender': gender,
                'artist': artist,
                'current_distractors': current_distractors
            })

print(f"Found {len(music_quotes)} music quotes\n")

# Now suggest new distractors for each music quote
print("="*140)
print("MUSIC QUOTE DISTRACTOR SUGGESTIONS\n")

suggestions = []

for quote in music_quotes:
    print(f"\nID: {quote['id']}")
    print(f"Title: {quote['title']}")
    print(f"Answer: {quote['answer']}")
    print(f"Gender: {quote['gender']}")
    print(f"Current distractors: {', '.join(quote['current_distractors'][:1])}...")
    
    # Get available songs for this gender
    available_songs = songs_by_gender.get(quote['gender'], [])
    
    if len(available_songs) >= 3:
        print(f"Suggested new distractors:")
        for j, song in enumerate(available_songs[:3], 1):
            print(f"  {j}. {song['answer']}")
        
        suggestions.append({
            'quote_id': quote['id'],
            'new_distractors': [song['answer'] for song in available_songs[:3]]
        })
    else:
        print(f"WARNING: Not enough {quote['gender']} songs ({len(available_songs)} available)")
    
    print("-" * 140)

# Save suggestions to file
with open('music_distractors_suggestions.json', 'w', encoding='utf-8') as f:
    json.dump(suggestions, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(suggestions)} distractor suggestions to music_distractors_suggestions.json")
