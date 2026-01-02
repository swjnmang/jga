#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix broken JSON keys in TypeScript files
"""

from pathlib import Path
import re

def fix_file(file_path: Path) -> bool:
    """Fix broken JSON keys in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix all broken JSON keys where " was replaced with umlaut
        # Pattern: find any umlaut at start of what should be a key
        
        # Direct replacements for known broken patterns
        fixes = {
            # Broken keys
            'answer"': '"answer"',
            'öutline-': '"outline-',
            'üong-': '"song-',
            'üources"': '"sources"',
            'üpotify"': '"spotify"',
            'üchwer"': '"schwer"',
            
            # Broken values with missing opening quote
            'Ümriss': '"Umriss',
            'Ändorra': '"Andorra',
            'Österreich': '"Österreich',
            'Ägypten': '"Ägypten',
            'Äthiopien': '"Äthiopien',
            'Äquatorialguinea': '"Äquatorialguinea',
        }
        
        for old, new in fixes.items():
            content = content.replace(old, new)
        
        # Additional regex-based fixes for any remaining pattern: ü/ö/ä followed by lowercase letters and "
        # This catches patterns like: üomething": should be "something":
        content = re.sub(r'([^\w"])[üöä]([a-z]+)":', r'\1"\2":', content)
        
        # Write back if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Fix all TypeScript files in lib directory"""
    base_path = Path(__file__).parent.parent
    lib_path = base_path / 'lib'
    
    fixed_files = []
    
    for ts_file in lib_path.glob('*.ts'):
        if fix_file(ts_file):
            fixed_files.append(ts_file.name)
            print(f"✅ Fixed: {ts_file.name}")
    
    if fixed_files:
        print(f"\n✅ Fixed {len(fixed_files)} files")
    else:
        print("\n✅ No issues found!")

if __name__ == '__main__':
    main()
