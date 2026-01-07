#!/usr/bin/env python3
"""
Findet verdächtige Jahreszahlen in Musik-Karten
Analysiert Muster wie:
- Songs mit Jahr 2000+ aber älteren Künstlern
- IDs die nicht zum Jahr passen
- Duplikate mit unterschiedlichen Jahren
"""

import re
import json
from collections import defaultdict


def _primary_artist(song: dict) -> str:
    """Extrahiere den primären Künstler aus der Answer-Zeile."""
    answer = song.get('answer', '') or ''
    if '—' in answer:
        artist_part = answer.split('—', 1)[0]
    elif '-' in answer:
        artist_part = answer.split('-', 1)[0]
    else:
        artist_part = answer
    return artist_part.strip().lower()

def extract_all_songs(file_path):
    """Extrahiert alle Songs aus der TypeScript-Datei"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    songs = []
    lines = content.split('\n')
    current_song = {}
    in_song = False
    
    for i, line in enumerate(lines):
        if '"id": "song-' in line:
            in_song = True
            current_song = {'line_num': i + 1}
            match = re.search(r'"id":\s*"([^"]*)"', line)
            if match:
                current_song['id'] = match.group(1)
        
        if in_song:
            if '"title":' in line:
                match = re.search(r'"title":\s*"([^"]*)"', line)
                if match:
                    current_song['title'] = match.group(1)
            
            if '"year":' in line:
                match = re.search(r'"year":\s*(\d+)', line)
                if match:
                    current_song['year'] = int(match.group(1))
            
            if '"answer":' in line:
                match = re.search(r'"answer":\s*"([^"]*)"', line)
                if match:
                    current_song['answer'] = match.group(1)
            
            if line.strip() == '},' or line.strip() == '}':
                if 'id' in current_song and 'year' in current_song:
                    songs.append(current_song)
                in_song = False
                current_song = {}
    
    return songs

def analyze_suspicious_years(songs):
    """Findet verdächtige Jahreszahlen"""
    suspicious = []
    
    # Prüfe ID-Jahr-Diskrepanz
    for song in songs:
        id_str = song.get('id', '')
        year = song.get('year', 0)
        
        # Extrahiere Jahr aus ID wenn vorhanden
        id_year_match = re.search(r'-(\d{4})$', id_str)
        if id_year_match:
            id_year = int(id_year_match.group(1))
            if id_year != year:
                suspicious.append({
                    'song': song,
                    'issue': f'ID enthält Jahr {id_year}, aber year ist {year}',
                    'severity': 'high'
                })
    
    # Prüfe sehr moderne Jahre (2000+) - könnten Remakes/Remasters sein
    modern_songs = [s for s in songs if s.get('year', 0) >= 2000]
    
    # Gruppiere nach (Titel, Künstler), damit verschiedene Künstler nicht als Konflikt zählen
    by_title_artist = defaultdict(list)
    for song in songs:
        title = song.get('title', '').lower()
        artist = _primary_artist(song)
        if title:
            by_title_artist[(title, artist)].append(song)

    # Finde Duplikate mit unterschiedlichen Jahren pro Künstler
    for (_, _artist), song_list in by_title_artist.items():
        if len(song_list) > 1:
            years = [s.get('year', 0) for s in song_list]
            if len(set(years)) > 1:
                years_sorted = sorted(set(years))
                suspicious.append({
                    'song': song_list[0],
                    'issue': f'Duplikate mit unterschiedlichen Jahren: {years_sorted}',
                    'severity': 'medium',
                    'all_songs': song_list
                })
    
    return suspicious

def main():
    file_path = 'lib/playlistCards.ts'
    
    print("📊 Analysiere Musik-Karten...\n")
    
    songs = extract_all_songs(file_path)
    print(f"Gefunden: {len(songs)} Songs\n")
    
    suspicious = analyze_suspicious_years(songs)
    
    if not suspicious:
        print("✅ Keine verdächtigen Einträge gefunden!")
        return
    
    print(f"⚠️  {len(suspicious)} verdächtige Einträge gefunden:\n")
    print("="*80)
    
    high_prio = [s for s in suspicious if s.get('severity') == 'high']
    medium_prio = [s for s in suspicious if s.get('severity') == 'medium']
    
    if high_prio:
        print("\n🔴 HOHE PRIORITÄT (ID-Jahr-Diskrepanz):\n")
        for item in high_prio[:20]:  # Zeige max 20
            song = item['song']
            print(f"  Line {song.get('line_num', '?')}: {song.get('title', 'Unknown')}")
            print(f"    ID: {song.get('id', '')}")
            print(f"    {item['issue']}")
            print()
    
    if medium_prio:
        print("\n🟡 MITTLERE PRIORITÄT (Duplikate):\n")
        for item in medium_prio[:10]:  # Zeige max 10
            print(f"  {item['song'].get('title', 'Unknown')}")
            print(f"    {item['issue']}")
            print()
    
    print("="*80)
    print(f"\nTipp: Überprüfe diese Einträge manuell auf korrektes Erstveröffentlichungsjahr!")

if __name__ == '__main__':
    main()
