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
    """Fix missing opening quotes before umlauts"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix missing quote before umlauts in values
    # Pattern: : Ä -> : "Ä
    # Pattern: : ä -> : "ä
    # Pattern: : Ö -> : "Ö
    # Pattern: : ö -> : "ö
    # Pattern: : Ü -> : "Ü
    # Pattern: : ü -> : "ü
    content = re.sub(r':\s+([ÄäÖöÜüß])', r': "\1', content)
    
    # Fix missing quote in arrays: [ ü -> [ "ü, etc
    content = re.sub(r'\[\s+([ÄäÖöÜüß])', r'[ "\1', content)
    
    # Fix missing quote after comma in arrays: , ü -> , "ü
    content = re.sub(r',\s+([ÄäÖöÜüß])', r', "\1', content)
    
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
