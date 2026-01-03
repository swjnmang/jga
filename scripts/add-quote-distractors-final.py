#!/usr/bin/env python3
"""Generate quote distractors by simple line-by-line parsing"""
import re
import random

filepath = 'lib/cards.ts'

# Read all lines
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Parse to find all quotes
quotes = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Look for quote ID
    if "id: 'quote-" in line:
        id_match = re.search(r"id: '(quote-[^']+)'", line)
        if id_match:
            quote_id = id_match.group(1)
            
            # Look ahead for answer (usually 3-4 lines down)
            answer_line = None
            year_val = 2000
            for j in range(i, min(i+15, len(lines))):
                if 'answer:' in lines[j]:
                    # Extract the full answer value including quotes
                    ans_match = re.search(r"answer: ('.*?'),", lines[j])
                    if ans_match:
                        answer_line = ans_match.group(1)
                if 'year:' in lines[j]:
                    yr_match = re.search(r'year: (-?\d+)', lines[j])
                    if yr_match:
                        year_val = int(yr_match.group(1))
            
            if answer_line:
                quotes.append((quote_id, answer_line, year_val))
    
    i += 1

print(f"Found {len(quotes)} quote cards")

# Group by decade
quotes_by_decade = {}
for quote_id, answer_str, year in quotes:
    decade = (year // 10) * 10 if year > 0 else -500
    if decade not in quotes_by_decade:
        quotes_by_decade[decade] = []
    quotes_by_decade[decade].append((quote_id, answer_str, year))

# Read full content for replacement
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Generate distractors
count = 0
for quote_id, answer_str, year in quotes:
    decade = (year // 10) * 10 if year > 0 else -500
    
    # Get potential distractors from nearby decades
    potential = []
    for d in [decade - 20, decade - 10, decade, decade + 10, decade + 20]:
        if d in quotes_by_decade:
            potential.extend([ans for qid, ans, y in quotes_by_decade[d] if qid != quote_id])
    
    if len(potential) >= 3:
        selected = random.sample(potential, 3)
        # These answer strings are already properly quoted/escaped!
        dists_json = ", ".join(selected)
        
        # Find this card and add distractors after sources
        pattern = f"(id: '{re.escape(quote_id)}'.*?sources: {{.*?}})"
        replacement = f"\\1,\\n    distractors: [{dists_json}]"
        
        old_content = content
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        if content != old_content:
            count += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Added distractors to {count}/{len(quotes)} quote cards")
