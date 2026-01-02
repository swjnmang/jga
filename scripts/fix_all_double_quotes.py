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
    """Fix all double quotes before umlauts"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix all patterns with double quotes before umlauts
    # This will catch: "title": "Flagge ""Ägypten" -> "title": "Flagge Ägypten"
    content = re.sub(r'("")([ÄÖÜäöüß])', r'"\2', content)
    
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
