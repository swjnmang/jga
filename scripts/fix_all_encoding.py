#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix all encoding issues in TypeScript files
Replaces malformed characters with correct UTF-8 characters
"""

from pathlib import Path
import re

def fix_file(file_path: Path) -> bool:
    """Fix encoding in a single file"""
    try:
        # Read file with UTF-8 encoding
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Phase 1: Fix specific broken patterns first (longest/most specific first)
        specific_fixes = {
            'mßsen': 'müssen',
            'J"rgen': 'Jürgen',
            'Pr"vention': 'Prävention',
            'änswer"': 'answer"',  # Fix JSON key
            '"Auge"': '"Auge"',  # Fix quoted word
            '"Universalspender"': '"Universalspender"',
            'Symbol "O"': 'Symbol "O"',
        }
        
        for old, new in specific_fixes.items():
            content = content.replace(old, new)
        
        # Phase 2: Fix all remaining " + letter combinations (umlauts)
        umlaut_map = {
            '"a': 'ä',
            '"o': 'ö',
            '"u': 'ü',
            '"A': 'Ä',
            '"O': 'Ö',
            '"U': 'Ü',
            '"s': 'ß',
        }
        
        for old, new in umlaut_map.items():
            content = content.replace(old, new)
        
        # Phase 3: Fix any remaining ß that should be ü
        # Use regex to avoid replacing actual ß characters
        content = re.sub(r'([bcdfghjklmnpqrstvwxyz])ß([bcdfghjklmnpqrstvwxyz])', r'\1ü\2', content)
        
        # Phase 4: Fix quote marks
        quote_fixes = {
            '„ "': '„',  # Double quotes together
            '.„': '."',  # Quote after period
            ',„': ',"',  # Quote after comma
            '!„': '!"',  # Quote after exclamation
            '?„': '?"',  # Quote after question mark
            '„': '"',    # Closing quote mark (various forms)
            '„': '"',    # Alternative closing quote
        }
        
        for old, new in quote_fixes.items():
            content = content.replace(old, new)
        
        # Phase 5: Fix remaining " patterns for quotes
        # Opening quotes: " followed by space or uppercase
        content = re.sub(r'" ([A-ZÄÖÜ])', r'„ \1', content)
        # Closing quotes: " preceded by punctuation
        content = re.sub(r'([.!?,;:])"', r'\1"', content)
        
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
    
    # Process all .ts files in lib directory
    for ts_file in lib_path.glob('*.ts'):
        if fix_file(ts_file):
            fixed_files.append(ts_file.name)
            print(f"✅ Fixed: {ts_file.name}")
    
    if fixed_files:
        print(f"\n✅ Fixed {len(fixed_files)} files:")
        for f in fixed_files:
            print(f"   - {f}")
    else:
        print("\n✅ No encoding issues found!")

if __name__ == '__main__':
    main()
