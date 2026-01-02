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
    """Fix triple and double quotes before umlauts"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix triple quotes: """ -> "
    content = content.replace('"""', '"')
    
    # Fix double quotes in middle of string values: "" -> "
    # But be careful not to break empty strings
    content = re.sub(r':\s+""([ÄäÖöÜüß])', r': "\1', content)
    
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
