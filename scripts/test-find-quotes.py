import re
content = open('lib/cards.ts', 'r', encoding='utf-8').read()
quotes = re.findall(r"id: '(quote-[^']+)'", content)
print(f"Found {len(quotes)} quote IDs")
if quotes:
    print(f"First 5: {quotes[:5]}")
