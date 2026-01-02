import pathlib
import json
import re

# Mapping von Artists zu Schwierigkeitsgraden
artist_difficulty = {
    # Leicht - Sehr bekannte Superstars der 2000er
    'Backstreet Boys': 'leicht',
    'P!nk': 'leicht',
    'Britney Spears': 'leicht',
    '*NSYNC': 'leicht',
    'Christina Aguilera': 'leicht',
    'Beyoncé': 'leicht',
    'Rihanna': 'leicht',
    'Eminem': 'leicht',
    'Coldplay': 'leicht',
    'Green Day': 'leicht',
    'Avril Lavigne': 'leicht',
    'Linkin Park': 'leicht',
    'Black Eyed Peas': 'leicht',
    'Shakira': 'leicht',
    'Usher': 'leicht',
    'Nelly Furtado': 'leicht',
    'OutKast': 'leicht',
    'Maroon 5': 'leicht',
    'Kelly Clarkson': 'leicht',
    'Alicia Keys': 'leicht',
    'Justin Timberlake': 'leicht',
    '50 Cent': 'leicht',
    'Gwen Stefani': 'leicht',
    'Amy Winehouse': 'leicht',
    'Kanye West': 'leicht',
    'The Killers': 'leicht',
    'Fall Out Boy': 'leicht',
    'My Chemical Romance': 'leicht',
    'Gorillaz': 'leicht',
    'Red Hot Chili Peppers': 'leicht',
    'U2': 'leicht',
    "Destiny's Child": 'leicht',
    'Nickelback': 'leicht',
    'Foo Fighters': 'leicht',
    'Evanescence': 'leicht',
    'Norah Jones': 'leicht',
    'Lady Gaga': 'leicht',
    'Katy Perry': 'leicht',
    'Miley Cyrus': 'leicht',
    'Taylor Swift': 'leicht',
    'The Black Eyed Peas': 'leicht',
    'Enrique Iglesias': 'leicht',
    
    # Schwer - One-Hit-Wonder oder weniger bekannte Artists
    'Daniel Powter': 'schwer',
    'Natasha Bedingfield': 'schwer',
    'Sophie Ellis-Bextor': 'schwer',
    'Wheatus': 'schwer',
    'James Blunt': 'schwer',
    'The Fray': 'schwer',
    'Howie Day': 'schwer',
    'Michelle Branch': 'schwer',
    'Vanessa Carlton': 'schwer',
    'Jesse McCartney': 'schwer',
    'JoJo': 'schwer',
    'Ashlee Simpson': 'schwer',
    'Daniel Bedingfield': 'schwer',
    'Dido': 'schwer',
}

file_path = pathlib.Path('lib/playlistCards.ts')
content = file_path.read_text(encoding='utf-8')

changes = 0
for artist, difficulty in artist_difficulty.items():
    # Escape special regex characters in artist name
    artist_escaped = re.escape(artist)
    # Find pattern: artist name followed by difficulty: mittel, within the 2000s playlist
    pattern = f'("answer": "{artist_escaped}[^"]*",\\s*"hint": "{artist_escaped}",\\s*"difficulty": )"mittel"'
    
    def replace_fn(match):
        global changes
        changes += 1
        return match.group(1) + f'"{difficulty}"'
    
    content = re.sub(pattern, replace_fn, content)

file_path.write_text(content, encoding='utf-8')
print(f"✅ {changes} Schwierigkeitsgrade angepasst!")
