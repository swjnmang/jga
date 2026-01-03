#!/usr/bin/env python3
"""Generate quote distractors by reusing existing answer strings (already properly escaped)"""
import re
import random

filepath = 'lib/cards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all quote cards with their answer strings EXACTLY as they appear in the file
# This preserves the original escaping
quote_pattern = r"id: '(quote-[^']+)'[^\n]*?\n[^\n]*?\n[^\n]*?\n[^\n]*?answer: ('([^']|\\')*?'),"
quotes = []

for match in re.finditer(quote_pattern, content, flags=re.MULTILINE):
    quote_id = match.group(1)
    # Extract the EXACT answer string including the quotes
    answer_with_quotes = match.group(2)
    # Also try to extract year
    snippet = content[match.start():match.start()+500]
    year_match = re.search(r"year: (-?\d+)", snippet)
    year = int(year_match.group(1)) if year_match else 2000
    
    quotes.append((quote_id, answer_with_quotes, year))

print(f"Found {len(quotes)} quote cards")

# Group by decade
quotes_by_decade = {}
for quote_id, answer_str, year in quotes:
    decade = (year // 10) * 10 if year > 0 else -500
    if decade not in quotes_by_decade:
        quotes_by_decade[decade] = []
    quotes_by_decade[decade].append((quote_id, answer_str, year))

# Generate distractors
count = 0
for quote_id, answer_str, year in quotes:
    decade = (year // 10) * 10 if year > 0 else -500
    
    # Get potential distractors
    potential = []
    for d in [decade - 20, decade - 10, decade, decade + 10, decade + 20]:
        if d in quotes_by_decade:
            potential.extend([ans for qid, ans, y in quotes_by_decade[d] if qid != quote_id])
    
    if len(potential) >= 3:
        selected = random.sample(potential, 3)
        # Join the answer strings with commas - they are already properly escaped!
        dists_json = ", ".join(selected)
        
        # Add distractors after sources
        pattern = f"(id: '{re.escape(quote_id)}'.*?sources: {{.*?}})"
        replacement = f"\\1,\\n    distractors: [{dists_json}]"
        
        old_content = content
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        if content != old_content:
            count += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Added distractors to {count}/{len(quotes)} quote cards")
