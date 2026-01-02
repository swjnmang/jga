import pathlib
import re

# Mapping von Artists zu Schwierigkeitsgraden für 2020er
artist_difficulty = {
    # Leicht - Mega-Stars der 2020er
    'Dua Lipa': 'leicht',
    'The Weeknd': 'leicht',
    'Olivia Rodrigo': 'leicht',
    'Billie Eilish': 'leicht',
    'Harry Styles': 'leicht',
    'Ariana Grande': 'leicht',
    'Ed Sheeran': 'leicht',
    'Taylor Swift': 'leicht',
    'Drake': 'leicht',
    'Post Malone': 'leicht',
    'Justin Bieber': 'leicht',
    'Bad Bunny': 'leicht',
    'BTS': 'leicht',
    'BLACKPINK': 'leicht',
    'SZA': 'leicht',
    'Adele': 'leicht',
    'Lil Nas X': 'leicht',
    'Lizzo': 'leicht',
    'Miley Cyrus': 'leicht',
    'Sam Smith': 'leicht',
    'Doja Cat': 'leicht',
    'Megan Thee Stallion': 'leicht',
    'Lil Baby': 'leicht',
    'Roddy Ricch': 'leicht',
    'DaBaby': 'leicht',
    'Travis Scott': 'leicht',
    'Cardi B': 'leicht',
    'Bruno Mars': 'leicht',
    'Anderson .Paak': 'leicht',
    'Silk Sonic': 'leicht',
    'Glass Animals': 'leicht',
    'Tate McRae': 'leicht',
    'Måneskin': 'leicht',
    'Lewis Capaldi': 'leicht',
    'Shawn Mendes': 'leicht',
    'Khalid': 'leicht',
    'Halsey': 'leicht',
    'Camila Cabello': 'leicht',
    
    # Schwer - Weniger bekannte oder neue Artists der 2020er
    'Conan Gray': 'schwer',
    'girl in red': 'schwer',
    'beabadoobee': 'schwer',
    'Gracie Abrams': 'schwer',
    'Reneé Rapp': 'schwer',
    'Sabrina Carpenter': 'schwer',
    'Gayle': 'schwer',
    'Mimi Webb': 'schwer',
    'Clinton Kane': 'schwer',
    'Ruel': 'schwer',
    'Jeremy Zucker': 'schwer',
    'JVKE': 'schwer',
    'Nessa Barrett': 'schwer',
    'Mae Stephens': 'schwer',
    'David Kushner': 'schwer',
}

file_path = pathlib.Path('lib/playlistCards.ts')
content = file_path.read_text(encoding='utf-8')

changes = 0
for artist, difficulty in artist_difficulty.items():
    # Escape special regex characters
    artist_escaped = re.escape(artist)
    # Pattern to match artist in answer/hint with mittel difficulty
    pattern = f'("answer": "[^"]*{artist_escaped}[^"]*",\\s*"hint": "[^"]*{artist_escaped}[^"]*",\\s*"difficulty": )"mittel"'
    
    def replace_fn(match):
        global changes
        changes += 1
        return match.group(1) + f'"{difficulty}"'
    
    content = re.sub(pattern, replace_fn, content)

file_path.write_text(content, encoding='utf-8')
print(f"✅ {changes} Schwierigkeitsgrade für 2020er Playlist angepasst!")
