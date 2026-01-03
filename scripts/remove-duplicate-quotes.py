import re

# Read file
with open('lib/cards.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# IDs of duplicates to remove (the second occurrences)
duplicates_to_remove = [
    'quote-wir-schaffen-das',  # Line 543
    'quote-houston-we-have-a-problem',  # Line 1336
    'quote-winter-is-coming'  # Line 1380
]

# For each duplicate, find and remove the SECOND occurrence
for dup_id in duplicates_to_remove:
    # Find all occurrences
    pattern = rf"  {{\s*id: '{re.escape(dup_id)}'.*?}},?\s*(?=\s*{{|\s*\])"
    matches = list(re.finditer(pattern, content, flags=re.DOTALL))
    
    if len(matches) >= 2:
        # Remove the second occurrence
        second_match = matches[1]
        content = content[:second_match.start()] + content[second_match.end():]
        print(f"✓ Removed duplicate: {dup_id}")

# Write back
with open('lib/cards.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Cleaned {len(duplicates_to_remove)} duplicate quote cards")
