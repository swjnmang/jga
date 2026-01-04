#!/usr/bin/env python3
"""
Analyze all quote cards and their distractors by difficulty level.
Output a structured report for improving distractor quality.
"""

import re
import json

# Read the cards.ts file
with open('../lib/cards.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all quote entries more carefully
# Pattern: from id: 'quote-...' to the closing }
quote_pattern = r"\{\s*id:\s*'(quote-[^']+)'[^}]*?category:\s*'quote'[^}]*?\}"

quote_blocks = re.findall(quote_pattern, content, re.DOTALL)
print(f"Total quote blocks found: {len(quote_blocks)}\n")

# Now for each match, extract the full block
quote_entries = []
for match in re.finditer(r"\{\s*id:\s*'(quote-[^']+)'[^}]*?category:\s*'quote'[^}]*?\}", content, re.DOTALL):
    block = match.group(0)
    
    # Extract fields
    id_match = re.search(r"id:\s*'([^']+)'", block)
    answer_match = re.search(r"answer:\s*'([^']+)'", block)
    diff_match = re.search(r"difficulty:\s*'([^']+)'", block)
    dist_match = re.search(r"distractors:\s*\[([^\]]+)\]", block)
    
    if not id_match or not diff_match:
        continue
    
    quote_id = id_match.group(1)
    answer = answer_match.group(1) if answer_match else "N/A"
    difficulty = diff_match.group(1)
    
    # Extract distractors (strings within quotes)
    distractors = []
    if dist_match:
        dist_str = dist_match.group(1)
        distractors = re.findall(r"'([^']*(?:\\'[^']*)*)'", dist_str)
    
    quote_entries.append({
        'id': quote_id,
        'answer': answer,
        'difficulty': difficulty,
        'distractors': distractors,
        'has_distractors': len(distractors) > 0
    })

print(f"Parsed {len(quote_entries)} quote entries\n")

# Group by difficulty
by_diff = {'leicht': [], 'mittel': [], 'schwer': []}
for entry in quote_entries:
    diff = entry['difficulty']
    if diff in by_diff:
        by_diff[diff].append(entry)

print("Distribution by difficulty:")
for diff in ['leicht', 'mittel', 'schwer']:
    count = len(by_diff[diff])
    with_dist = len([e for e in by_diff[diff] if e['has_distractors']])
    print(f"  {diff:8}: {count:3} entries ({with_dist:3} with distractors)")

print("\n" + "="*140)
print("ANALYSE DER LEICHTEN ZITATE")
print("="*140)

for i, entry in enumerate(by_diff['leicht'], 1):
    print(f"\n{i}. ID: {entry['id']}")
    print(f"   Autor: {entry['answer'][:80]}{'...' if len(entry['answer']) > 80 else ''}")
    
    if entry['distractors']:
        print(f"   Distraktoren:")
        for j, dist in enumerate(entry['distractors'], 1):
            print(f"      {j}. {dist[:80]}")
    else:
        print(f"   ⚠️  KEINE DISTRAKTOREN!")
    print("-" * 140)

print(f"\n✓ Gesamt leichte Zitate: {len(by_diff['leicht'])}")
print(f"  Mit Distraktoren: {len([e for e in by_diff['leicht'] if e['has_distractors']])}")
print(f"  OHNE Distraktoren: {len([e for e in by_diff['leicht'] if not e['has_distractors']])}")
