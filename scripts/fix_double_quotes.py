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
    """Fix double quotes in JSON keys"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix double quotes at the start of JSON keys
    # Pattern: ""key" -> "key"
    content = re.sub(r'(\s+)""([a-zA-Z_]+)":', r'\1"\2":', content)
    
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
