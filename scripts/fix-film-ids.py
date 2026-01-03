#!/usr/bin/env python3
import re

with open('lib/filmSerienCards.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Marvel Endgame - find the actual distractor pattern
# We know it has this answer
pattern1 = r'(id: \'filmeserien-019-marvel-endgame\'[^}]+?answer: \'"I am Iron Man\.\'"[^}]+?distractors: \[)[^\]]+(\])'
replacement1 = r'\1\'"I am Thanos.\"\', \'"This is the way.\"\', \'"Avengers, assemble!"\'\2'

# Terminator - fix the category and IDs back
# Replace all filemeserien- back to filmeserien-
content = content.replace("filemeserien-", "filmeserien-")

with open('lib/filmSerienCards.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("[OK] Fixed ID formats and filemeserien->filmeserien")
