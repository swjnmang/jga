#!/usr/bin/env python3
"""Automatically generate distractors for quote cards by finding similar quotes"""
import re
import random

filepath = 'lib/cards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all quote cards - answer can span multiple lines and contain special chars
quote_pattern = r"id: '(quote-[^']+)'[^}]*?answer: '([^']+)'[^}]*?year: (\d+)"
quotes = re.findall(quote_pattern, content, flags=re.DOTALL)

print(f"Found {len(quotes)} quote cards")

# Group quotes by decade for better distractor matching
quotes_by_decade = {}
for quote_id, answer, year in quotes:
    decade = (int(year) // 10) * 10 if int(year) > 0 else -500
    if decade not in quotes_by_decade:
        quotes_by_decade[decade] = []
    quotes_by_decade[decade].append((quote_id, answer, year))

# Generate distractors for each quote
count = 0
for quote_id, answer, year in quotes:
    decade = (int(year) // 10) * 10 if int(year) > 0 else -500
    
    # Get potential distractors from same decade and neighboring decades
    potential_distractors = []
    for d in [decade - 20, decade - 10, decade, decade + 10, decade + 20]:
        if d in quotes_by_decade:
            potential_distractors.extend([ans for qid, ans, y in quotes_by_decade[d] if qid != quote_id])
    
    # Select 3 random distractors
    if len(potential_distractors) >= 3:
        selected = random.sample(potential_distractors, 3)
        
        # Escape single quotes in distractors for TypeScript
        selected_escaped = [d.replace("'", "\\'") for d in selected]
        dists_json = "', '".join(selected_escaped)
        
        # Add distractors to the card
        pattern = f"(id: '{quote_id}'[^}}]*?sources: {{[^}}]*?}})"
        replacement = f"\\1,\\n    distractors: ['{dists_json}']"
        
        if re.search(pattern, content, flags=re.DOTALL):
            content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
            count += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Added distractors to {count}/{len(quotes)} quote cards")
