import re
import pathlib

# Sehr bekannte 2000er Artists = leicht
easy_artists = {
    'Backstreet Boys', 'P!nk', 'Britney Spears', '*NSYNC', 'Christina Aguilera',
    'Beyoncé', 'Rihanna', 'Eminem', 'Coldplay', 'Green Day', 'Avril Lavigne',
    'Linkin Park', 'Black Eyed Peas', 'Shakira', 'Usher', 'Nelly Furtado',
    'OutKast', 'Maroon 5', 'Kelly Clarkson', 'Alicia Keys', 'Justin Timberlake',
    '50 Cent', 'Gwen Stefani', 'Amy Winehouse', 'Kanye West', 'The Killers',
    'Fall Out Boy', 'My Chemical Romance', 'Gorillaz', 'Red Hot Chili Peppers',
    'U2', 'Destiny\'s Child', 'Nickelback', 'Foo Fighters', 'Evanescence',
    'Norah Jones', 'Lady Gaga', 'Katy Perry', 'Miley Cyrus', 'Taylor Swift'
}

# Weniger bekannte/One-Hit-Wonder = schwer
hard_artists = {
    'Daniel Powter', 'Natasha Bedingfield', 'Sophie Ellis-Bextor', 
    'Wheatus', 'James Blunt', 'The Fray', 'Howie Day', 'Michelle Branch',
    'Vanessa Carlton', 'Jesse McCartney', 'JoJo', 'Ashlee Simpson',
    'Daniel Bedingfield', 'Dido', 'Train', 'Lifehouse', 'Plain White T\'s',
    'Jet', 'The Calling', 'Hoobastank', 'Trapt', 'Breaking Benjamin',
    'Three Days Grace', 'Seether', 'Shinedown', 'Theory of a Deadman'
}

file_path = pathlib.Path('lib/playlistCards.ts')
content = file_path.read_text(encoding='utf-8')

# Find all entries for the 2000s playlist
pattern = r'(\{[^}]*?"playlists":\s*\[\s*"1K766ohE2LA7b7ghtTm7mP"\s*\][^}]*?\})'

def adjust_difficulty(match):
    entry = match.group(1)
    
    # Check if artist is in easy or hard list
    for artist in easy_artists:
        if artist in entry:
            entry = re.sub(r'"difficulty":\s*"mittel"', '"difficulty": "leicht"', entry)
            break
    
    for artist in hard_artists:
        if artist in entry:
            entry = re.sub(r'"difficulty":\s*"mittel"', '"difficulty": "schwer"', entry)
            break
    
    return entry

content = re.sub(pattern, adjust_difficulty, content, flags=re.DOTALL)

file_path.write_text(content, encoding='utf-8')
print("✅ Schwierigkeitsgrade für 2000er Playlist angepasst!")
