#!/usr/bin/env python3
"""Extract source-only distractors for quote cards (without the quotes themselves)"""
import re
import random

def extract_source(answer_string):
    """Extract just the source/author from an answer string, removing the quote itself"""
    # Remove the surrounding quotes from the string
    answer = answer_string.strip("'")
    
    # Format 1: "Quote Text – Source." → Extract everything after "–"
    if '–' in answer:
        parts = answer.split('–')
        if len(parts) >= 2:
            source = parts[-1].strip()
            # Remove trailing period and extra info
            source = re.sub(r'\s*\(.*?\)', '', source)  # Remove parentheses
            return source.rstrip('.')
    
    # Format 2: "Person 'Quote' in Context." → Extract Person + simplified context
    if '"' in answer or "'" in answer:
        # Try to extract just the person and context without the quote
        # Match pattern: "Person 'quote' in/bei/nach context"
        match = re.match(r'^([^"\']+?)\s+["\'].*?["\']\s+(in|bei|als|nach|im|zur|zum)\s+(.+)$', answer)
        if match:
            person = match.group(1).strip()
            context = match.group(3).strip().rstrip('.')
            return f"{person}, {context}"
        # If quote is at the start: "'Quote' – Source"
        match = re.match(r'^["\'].*?["\']\s+–\s+(.+)$', answer)
        if match:
            return match.group(1).strip().rstrip('.')
    
    # Format 3: "Person, Context." → Already good, just clean up
    if ',' in answer and not any(x in answer for x in ['"', "'", '–']):
        # Remove dates in format dd.mm.
        answer = re.sub(r'\d{2}\.\d{2}\.\.?', '', answer)
        # Keep person and simplified context
        parts = answer.split(',', 1)
        if len(parts) == 2:
            return f"{parts[0].strip()}, {parts[1].strip().rstrip('.')}"
        return answer.rstrip('.')
    
    # Format 4: "Aus Film/Show – Description" → Extract film/show name
    if answer.startswith('Aus '):
        match = re.match(r'Aus (.+?)\s+[–—]', answer)
        if match:
            return match.group(1).strip()
        # Otherwise take everything after "Aus"
        return answer[4:].split('–')[0].strip().rstrip('.')
    
    # Format 5: Just a person/source name
    # Remove parentheses with extra info
    answer = re.sub(r'\s*\(.*?\)', '', answer)
    return answer.strip().rstrip('.')

filepath = 'lib/cards.ts'

# Read all lines
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Parse to find all quotes
quotes = []
i = 0
while i < len(lines):
    line = lines[i]
    
    if "id: 'quote-" in line:
        id_match = re.search(r"id: '(quote-[^']+)'", line)
        if id_match:
            quote_id = id_match.group(1)
            
            answer_line = None
            year_val = 2000
            for j in range(i, min(i+15, len(lines))):
                if 'answer:' in lines[j]:
                    ans_match = re.search(r"answer: ('.*?'),", lines[j])
                    if ans_match:
                        answer_line = ans_match.group(1)
                if 'year:' in lines[j]:
                    yr_match = re.search(r'year: (-?\d+)', lines[j])
                    if yr_match:
                        year_val = int(yr_match.group(1))
            
            if answer_line:
                # Extract just the source part
                source_only = extract_source(answer_line)
                quotes.append((quote_id, source_only, year_val))
    
    i += 1

print(f"Found {len(quotes)} quote cards")
print(f"Example sources extracted:")
for q in quotes[:5]:
    print(f"  {q[0]}: {q[1]}")

# Group by decade
quotes_by_decade = {}
for quote_id, source, year in quotes:
    decade = (year // 10) * 10 if year > 0 else -500
    if decade not in quotes_by_decade:
        quotes_by_decade[decade] = []
    quotes_by_decade[decade].append((quote_id, source, year))

# Read full content
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# First, remove all existing distractors from quote cards
content = re.sub(
    r"(id: 'quote-[^']+.*?sources: \{.*?\}),\s*distractors: \[.*?\]",
    r"\1",
    content,
    flags=re.DOTALL
)

# Generate new distractors with sources only
count = 0
for quote_id, source, year in quotes:
    decade = (year // 10) * 10 if year > 0 else -500
    
    # Get potential distractors
    potential = []
    for d in [decade - 20, decade - 10, decade, decade + 10, decade + 20]:
        if d in quotes_by_decade:
            potential.extend([src for qid, src, y in quotes_by_decade[d] if qid != quote_id])
    
    if len(potential) >= 3:
        selected = random.sample(potential, 3)
        # Escape single quotes properly for TypeScript
        selected_escaped = [s.replace("'", "\\'") for s in selected]
        dists_json = "', '".join(selected_escaped)
        
        # Add distractors after sources
        pattern = f"(id: '{re.escape(quote_id)}'.*?sources: {{.*?}})"
        replacement = f"\\1,\\n    distractors: ['{dists_json}']"
        
        old_content = content
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        if content != old_content:
            count += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Added source-only distractors to {count}/{len(quotes)} quote cards")
