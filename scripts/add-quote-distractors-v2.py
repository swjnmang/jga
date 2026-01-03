#!/usr/bin/env python3
"""Automatically generate distractors for quote cards"""
import re
import random

filepath = 'lib/cards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find all quote cards by parsing line by line
quotes = []
current_id = None
current_answer = None
current_year = None

for line in lines:
    id_match = re.search(r"id: '(quote-[^']+)'", line)
    if id_match:
        current_id = id_match.group(1)
    
    answer_match = re.search(r"answer: '([^']+)'", line)
    if answer_match and current_id:
        current_answer = answer_match.group(1)
    
    year_match = re.search(r"year: (-?\d+)", line)
    if year_match and current_id:
        current_year = int(year_match.group(1))
    
    # When we have all three, save the quote
    if current_id and current_answer and current_year is not None:
        quotes.append((current_id, current_answer, current_year))
        current_id = None
        current_answer = None
        current_year = None

print(f"Found {len(quotes)} quote cards")

# Read full content
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Group quotes by decade
quotes_by_decade = {}
for quote_id, answer, year in quotes:
    decade = (year // 10) * 10 if year > 0 else -500
    if decade not in quotes_by_decade:
        quotes_by_decade[decade] = []
    quotes_by_decade[decade].append((quote_id, answer, year))

# Generate distractors for each quote
count = 0
for quote_id, answer, year in quotes:
    decade = (year // 10) * 10 if year > 0 else -500
    
    # Get potential distractors from same decade and neighboring decades
    potential_distractors = []
    for d in [decade - 20, decade - 10, decade, decade + 10, decade + 20]:
        if d in quotes_by_decade:
            potential_distractors.extend([ans for qid, ans, y in quotes_by_decade[d] if qid != quote_id])
    
    # Select 3 random distractors
    if len(potential_distractors) >= 3:
        selected = random.sample(potential_distractors, 3)
        
        # Escape single quotes properly for TypeScript
        selected_escaped = []
        for d in selected:
            # Replace ' with \'
            d_escaped = d.replace("'", "\\'")
            selected_escaped.append(d_escaped)
        
        dists_json = "', '".join(selected_escaped)
        
        # Add distractors to the card - find the sources block and add after it
        pattern = f"(id: '{re.escape(quote_id)}'[^}}]*?sources: {{[^}}]*?}})"
        replacement = f"\\1,\\n    distractors: ['{dists_json}']"
        
        old_content = content
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        if content != old_content:
            count += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Added distractors to {count}/{len(quotes)} quote cards")
