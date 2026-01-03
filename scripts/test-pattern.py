import re
content = open('lib/cards.ts', 'r', encoding='utf-8').read()

# Test pattern
pattern = r"id: '(quote-[^']+)'[^{]*?answer: '([^']+?)'[^{]*?year: (\d+)"
quotes = re.findall(pattern, content)
print(f"Found {len(quotes)} quotes")
if quotes:
    print(f"First one: {quotes[0]}")
