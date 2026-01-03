import re

with open('lib/cards.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

ids = []
duplicates = []
for i, line in enumerate(lines):
    if "id: 'quote-" in line:
        m = re.search(r"id: '(quote-[^']+)'", line)
        if m:
            if m.group(1) in ids:
                duplicates.append((i+1, m.group(1)))
            else:
                ids.append(m.group(1))

print(f"Found {len(duplicates)} duplicate quote IDs:")
for line_num, qid in duplicates:
    print(f"  Line {line_num}: {qid}")
