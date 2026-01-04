#!/usr/bin/env python3
"""
Analyze all music-based quote cards and find better distractors based on artist gender.
For each quote with a male artist, suggest 3 songs by OTHER male artists.
For each quote with a female artist, suggest 3 songs by OTHER female artists.
"""

import re
import json

# Gender mapping for artists
MALE_ARTISTS = {
    'ed sheeran', 'bruno mars', 'post malone', 'the weeknd', 'eminem',
    'john lennon', 'jimi hendrix', 'david bowie', 'prince', 'michael jackson',
    'elton john', 'billy joel', 'bruce springsteen', 'bob dylan',
    'eric clapton', 'joe cocker', 'phil collins', 'sting',
    'lil nas x', 'travis scott', 'drake', 'kanye west',
    'george michael', 'billy idol', 'mark ronson', 'shawn mendes',
    'john legend', 'usher', 'chris brown',
    'the killers', 'coldplay', 'muse', 'radiohead',
    'bon jovi', 'axl rose', 'slash', 'freddie mercury', 'queen',
    'led zeppelin', 'jimmy page', 'robert plant',
    'david gilmour', 'pink floyd', 'roger waters',
    'nirvana', 'kurt cobain', 'grunge',
    'r.e.m.', 'michael stipe',
    'the police', 'sting', 'gordon sumner',
    'the beatles', 'paul mccartney', 'ringo starr', 'george harrison',
    'jethro tull', 'ian anderson',
    'deep purple', 'smoke on water',
    'eagles', 'don henley', 'glenn frey',
    'fleetwood mac', 'mick fleetwood', 'lindsey buckingham',
    'the rolling stones', 'mick jagger', 'keith richards',
    'a-ha', 'morten harket',
    'journey', 'steve perry',
    'foreigner', 'lou gramm',
    'toto', 'dennis',
    'boney m.',
    'bobby mcferrin',
    'louis armstrong',
    'bill withers',
    'smash mouth',
    'sugar ray',
    'onerepublic', 'ryan tedder',
    'imagine dragons',
}

FEMALE_ARTISTS = {
    'billie eilish', 'ariana grande', 'taylor swift', 'dua lipa',
    'mariah carey', 'whitney houston', 'celine dion', 'beyonce',
    'rihanna', 'lady gaga', 'madonna', 'britney spears',
    'christina aguilera', 'pink', 'halsey',
    'demi lovato', 'selena gomez', 'miley cyrus',
    'adele', 'amy winehouse', 'norah jones',
    'idina menzel', 'frozen', 'let it go',
    'nena', 'helene fischer', 'atemlos durch die nacht',
    'spice girls', 'wannabe',
    'joan baez',
}

# Read the cards.ts file
with open('../lib/cards.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all quote entries (music songs)
# Look for entries with category: 'quote' AND they're likely songs
quote_pattern = r"\{\s*id:\s*'(quote-[^']+)'[^}]*?title:\s*'([^']+)'[^}]*?category:\s*'quote'[^}]*?year:\s*(\d+)[^}]*?answer:\s*'([^']+)'[^}]*?difficulty:\s*'([^']+)'[^}]*?\}"

quote_entries = []
for match in re.finditer(quote_pattern, content, re.DOTALL):
    quote_id = match.group(1)
    title = match.group(2)
    year = match.group(3)
    answer = match.group(4)
    difficulty = match.group(5)
    
    # Check if it's likely a music quote (contains " – " and common music terms)
    if ' – ' in answer or 'album' in answer.lower() or any(word in answer.lower() for word in ['song', 'artist', 'band', 'lennon', 'beatles', 'queen']):
        # Extract artist name
        artist_match = re.search(r'(.+?)\s*(?:–|—|Album|Lied)', answer)
        if artist_match:
            artist_str = artist_match.group(1).strip().lower()
            
            # Determine gender
            gender = None
            if any(male_artist in artist_str for male_artist in MALE_ARTISTS):
                gender = 'male'
            elif any(female_artist in artist_str for female_artist in FEMALE_ARTISTS):
                gender = 'female'
            
            quote_entries.append({
                'id': quote_id,
                'title': title,
                'answer': answer,
                'difficulty': difficulty,
                'artist_str': artist_str,
                'gender': gender,
                'is_music': True
            })

print(f"Found {len(quote_entries)} music quotes\n")

# Count by gender
male_count = sum(1 for e in quote_entries if e['gender'] == 'male')
female_count = sum(1 for e in quote_entries if e['gender'] == 'female')
unknown_count = sum(1 for e in quote_entries if e['gender'] is None)

print(f"Distribution by gender:")
print(f"  Male artists: {male_count}")
print(f"  Female artists: {female_count}")
print(f"  Unknown: {unknown_count}\n")

# Now extract all SONG entries (non-quote) to use as distractors
song_pattern = r"\{\s*id:\s*'(song-[^']+)'[^}]*?title:\s*'([^']+)'[^}]*?answer:\s*'([^']+)'[^}]*?\}"

all_songs = {}
for match in re.finditer(song_pattern, content, re.DOTALL):
    song_id = match.group(1)
    song_title = match.group(2)
    song_answer = match.group(3)
    
    # Extract artist name
    artist_match = re.search(r'(.+?)\s*(?:–|—)', song_answer)
    if artist_match:
        artist_str = artist_match.group(1).strip().lower()
        
        # Determine gender
        gender = None
        if any(male_artist in artist_str for male_artist in MALE_ARTISTS):
            gender = 'male'
        elif any(female_artist in artist_str for female_artist in FEMALE_ARTISTS):
            gender = 'female'
        
        if gender:
            if gender not in all_songs:
                all_songs[gender] = []
            all_songs[gender].append({
                'id': song_id,
                'title': song_title,
                'answer': song_answer,
                'artist_str': artist_str
            })

print(f"Available songs for distractors:")
print(f"  By male artists: {len(all_songs.get('male', []))}")
print(f"  By female artists: {len(all_songs.get('female', []))}\n")

# Now create a report
print("="*140)
print("MUSIC QUOTES - GENDER-BASED DISTRACTOR ANALYSIS")
print("="*140)

for i, entry in enumerate(quote_entries, 1):
    if entry['gender']:
        print(f"\n{i}. {entry['id']}")
        print(f"   Title: {entry['title']}")
        print(f"   Artist: {entry['answer'][:60]}")
        print(f"   Difficulty: {entry['difficulty']}")
        print(f"   Gender: {entry['gender'].upper()}")
        
        # Find distractor candidates
        available_gender = entry['gender']
        if available_gender in all_songs:
            candidates = all_songs[available_gender]
            # Filter out the same artist
            other_artists = [s for s in candidates if s['artist_str'] != entry['artist_str']]
            
            print(f"   Available distractors (same gender): {len(other_artists)}")
            if len(other_artists) >= 3:
                print(f"   Top 3 suggestions:")
                for j, cand in enumerate(other_artists[:3], 1):
                    print(f"      {j}. {cand['answer'][:70]}")
            else:
                print(f"   ⚠️  Only {len(other_artists)} candidates available (need 3)")
                for cand in other_artists:
                    print(f"      - {cand['answer'][:70]}")
        else:
            print(f"   ⚠️  NO songs available for {available_gender} artists")
        
        print("-" * 140)
    else:
        print(f"\n{i}. {entry['id']} - UNKNOWN GENDER: {entry['artist_str']}")
