import json
import re

content = open('c:/Users/mailt/OneDrive/KI Programme/jga/jga/lib/outlineCards.ts', encoding='utf-8').read()
match = re.search(r'export const outlineCards: Card\[\] = (\[[\s\S]*?\]);', content)
cards = json.loads(match.group(1))

examples = ['outline-fr', 'outline-au', 'outline-eg', 'outline-us', 'outline-cn', 'outline-za']

for c in cards:
    if c['id'] in examples:
        print(f"\n{c['id']}: {c['answer']}")
        print("Distractors:")
        for d in c.get('distractors', []):
            print(f"  - {d}")
