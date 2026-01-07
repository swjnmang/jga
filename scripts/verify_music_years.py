#!/usr/bin/env python3
"""
Überprüft und korrigiert Jahreszahlen in playlistCards.ts
Fokus auf Erstveröffentlichungsjahr der Songs
"""

import json
import re

# Bekannte Korrekturen (Titel oder ID -> korrektes Jahr)
KNOWN_CORRECTIONS = {
    "The Safety Dance": 1982,  # Men Without Hats
    "song-the-safety-dance-2010": 1982,
    
    # Weitere häufige Fehler können hier hinzugefügt werden
    # Format: "Titel" oder "song-id": korrektes_jahr
}

def extract_songs_from_ts(file_path):
    """Extrahiert Song-Objekte aus der TypeScript-Datei"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Finde alle Song-Objekte
    song_pattern = r'\{[^}]*"id":\s*"song-[^"]*"[^}]*\}'
    songs = []
    
    # Verwende einen robusteren Ansatz: Finde jeden Block zwischen { und }
    # der eine song-ID enthält
    depth = 0
    current_obj = ""
    in_song = False
    
    for i, char in enumerate(content):
        if char == '{':
            depth += 1
            if depth == 1:
                current_obj = "{"
                in_song = False
        elif char == '}':
            current_obj += char
            depth -= 1
            if depth == 0 and in_song:
                songs.append(current_obj)
                current_obj = ""
                in_song = False
        else:
            current_obj += char
            
        # Check ob wir in einem Song-Objekt sind
        if depth == 1 and '"id": "song-' in current_obj and not in_song:
            in_song = True
    
    return songs

def parse_song_object(song_str):
    """Parse ein Song-Objekt String zu einem Dict"""
    try:
        # Extrahiere die relevanten Felder
        id_match = re.search(r'"id":\s*"([^"]*)"', song_str)
        title_match = re.search(r'"title":\s*"([^"]*)"', song_str)
        year_match = re.search(r'"year":\s*(\d+)', song_str)
        answer_match = re.search(r'"answer":\s*"([^"]*)"', song_str)
        
        if not all([id_match, title_match, year_match]):
            return None
            
        return {
            'id': id_match.group(1),
            'title': title_match.group(1),
            'year': int(year_match.group(1)),
            'answer': answer_match.group(1) if answer_match else "",
            'original': song_str
        }
    except Exception as e:
        print(f"Error parsing song: {e}")
        return None

def check_year(song):
    """Überprüft ob das Jahr eines Songs korrigiert werden muss"""
    # Prüfe bekannte Korrekturen
    if song['id'] in KNOWN_CORRECTIONS:
        correct_year = KNOWN_CORRECTIONS[song['id']]
        if song['year'] != correct_year:
            return correct_year
    
    if song['title'] in KNOWN_CORRECTIONS:
        correct_year = KNOWN_CORRECTIONS[song['title']]
        if song['year'] != correct_year:
            return correct_year
    
    return None

def main():
    file_path = '../lib/playlistCards.ts'
    
    print("Lese playlistCards.ts...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Extrahiere Songs...")
    songs = extract_songs_from_ts(file_path)
    print(f"Gefunden: {len(songs)} Songs")
    
    corrections_needed = []
    
    print("\nÜberprüfe Jahreszahlen...")
    for song_str in songs:
        song = parse_song_object(song_str)
        if not song:
            continue
        
        correct_year = check_year(song)
        if correct_year:
            corrections_needed.append({
                'id': song['id'],
                'title': song['title'],
                'current_year': song['year'],
                'correct_year': correct_year,
                'original': song['original']
            })
    
    if not corrections_needed:
        print("\n✅ Alle bekannten Fehler sind bereits korrigiert!")
        return
    
    print(f"\n❌ Gefunden: {len(corrections_needed)} Korrekturen nötig:\n")
    
    for correction in corrections_needed:
        print(f"  • {correction['title']}")
        print(f"    ID: {correction['id']}")
        print(f"    Aktuell: {correction['current_year']} → Korrekt: {correction['correct_year']}")
        print()
    
    # Führe Korrekturen durch
    print("Korrigiere Jahreszahlen...")
    new_content = content
    
    for correction in corrections_needed:
        # Ersetze das Jahr in der Original-Zeile
        old_pattern = f'"year": {correction["current_year"]}'
        new_pattern = f'"year": {correction["correct_year"]}'
        
        # Finde den spezifischen Song-Block und ersetze dort
        song_id = correction['id']
        
        # Suche nach dem Song-Block mit dieser ID und ersetze das Jahr darin
        # Verwende einen kontextspezifischen Ersatz
        id_pattern = f'"id": "{song_id}"'
        id_pos = new_content.find(id_pattern)
        
        if id_pos != -1:
            # Finde das nächste "year" nach der ID
            year_start = new_content.find(old_pattern, id_pos)
            if year_start != -1 and year_start < id_pos + 500:  # Max 500 Zeichen nach ID
                new_content = new_content[:year_start] + new_pattern + new_content[year_start + len(old_pattern):]
                print(f"  ✓ Korrigiert: {correction['title']}")
    
    # Schreibe korrigierte Datei
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"\n✅ {len(corrections_needed)} Korrekturen durchgeführt!")
    print(f"Datei aktualisiert: {file_path}")

if __name__ == '__main__':
    main()
