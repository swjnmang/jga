import re
from pathlib import Path

# Files to fix
files = [
    'lib/cards.ts',
    'lib/flagCards.ts',
    'lib/outlineCards.ts',
    'lib/playlistCards.ts',
    'lib/triviaExtraCards.ts'
]

def fix_file(file_path):
    """Remove leftover quotes in title fields"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix pattern: "title": "Flagge "Ägypten" -> "title": "Flagge Ägypten"
    # Fix pattern: "title": "Umriss "Ägypten" -> "title": "Umriss Ägypten"
    content = re.sub(r'"title": "(Flagge|Umriss) "([^"]+)"', r'"title": "\1 \2"', content)
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Fix all files
fixed_count = 0
for file in files:
    if fix_file(file):
        print(f'✅ Fixed: {file}')
        fixed_count += 1
    else:
        print(f'⏭️  Skipped: {file} (no changes needed)')

print(f'\n✅ Fixed {fixed_count} files')
