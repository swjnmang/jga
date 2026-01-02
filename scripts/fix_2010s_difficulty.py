import pathlib
import re

# Mapping von Artists zu Schwierigkeitsgraden für 2010er
artist_difficulty = {
    # Leicht - Mega-Stars der 2010er
    'Ariana Grande': 'leicht',
    'Adele': 'leicht',
    'Drake': 'leicht',
    'Ed Sheeran': 'leicht',
    'Taylor Swift': 'leicht',
    'Bruno Mars': 'leicht',
    'Rihanna': 'leicht',
    'Beyoncé': 'leicht',
    'Justin Bieber': 'leicht',
    'Katy Perry': 'leicht',
    'Lady Gaga': 'leicht',
    'The Weeknd': 'leicht',
    'Billie Eilish': 'leicht',
    'Sam Smith': 'leicht',
    'Miley Cyrus': 'leicht',
    'Calvin Harris': 'leicht',
    'David Guetta': 'leicht',
    'Avicii': 'leicht',
    'Eminem': 'leicht',
    'Sia': 'leicht',
    'Pharrell Williams': 'leicht',
    'Maroon 5': 'leicht',
    'OneRepublic': 'leicht',
    'Imagine Dragons': 'leicht',
    'Coldplay': 'leicht',
    'P!nk': 'leicht',
    'Shawn Mendes': 'leicht',
    'Dua Lipa': 'leicht',
    'Post Malone': 'leicht',
    'Khalid': 'leicht',
    'Charlie Puth': 'leicht',
    'Selena Gomez': 'leicht',
    'Demi Lovato': 'leicht',
    'Ellie Goulding': 'leicht',
    'Meghan Trainor': 'leicht',
    'Halsey': 'leicht',
    'twenty one pilots': 'leicht',
    'Lorde': 'leicht',
    'John Legend': 'leicht',
    
    # Schwer - Weniger bekannte oder One-Hit-Wonder der 2010er
    'Christina Perri': 'schwer',
    'Alec Benjamin': 'schwer',
    'Jess Glynne': 'schwer',
    'WALK THE MOON': 'schwer',
    'Nico & Vinz': 'schwer',
    'Mike Posner': 'schwer',
    'Andy Grammer': 'schwer',
    'Phillip Phillips': 'schwer',
    'American Authors': 'schwer',
    'Bastille': 'schwer',
    'Vance Joy': 'schwer',
    'Lukas Graham': 'schwer',
    'Walk off the Earth': 'schwer',
    'MAGIC!': 'schwer',
    'Capital Cities': 'schwer',
    'Echosmith': 'schwer',
    'MKTO': 'schwer',
    'Omi': 'schwer',
    'X Ambassadors': 'schwer',
    'Kodaline': 'schwer',
    'James Bay': 'schwer',
    'George Ezra': 'schwer',
    'Hozier': 'schwer',
}

file_path = pathlib.Path('lib/playlistCards.ts')
content = file_path.read_text(encoding='utf-8')

changes = 0
for artist, difficulty in artist_difficulty.items():
    # Escape special regex characters
    artist_escaped = re.escape(artist)
    # Pattern to match artist in answer/hint with mittel difficulty in 2010s playlist
    pattern = f'("answer": "[^"]*{artist_escaped}[^"]*",\\s*"hint": "[^"]*{artist_escaped}[^"]*",\\s*"difficulty": )"mittel"'
    
    def replace_fn(match):
        global changes
        changes += 1
        return match.group(1) + f'"{difficulty}"'
    
    content = re.sub(pattern, replace_fn, content)

file_path.write_text(content, encoding='utf-8')
print(f"✅ {changes} Schwierigkeitsgrade für 2010er Playlist angepasst!")
