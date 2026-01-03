import re, json

# Load distractors from JSON (no escaping issues)
quote_distractors = json.loads(r"""
{
  "quote-atemlos": ["Helene Fischer, Atembergend.", "Andrea Berg, Du hast mich 1000mal belogen.", "Matthias Reim, Verdammt ich lieb dich."]
}
""")

filepath = "lib/cards.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

count = 0
for card_id, dists in quote_distractors.items():
    dists_json = ", ".join([f"'{d}'" for d in dists])
    pattern = f"(id: '{card_id}'[^}}]*?sources: {{[^}}]*?}})"
    replacement = f"\\1,\\n    distractors: [{dists_json}]"
    if re.search(pattern, content, flags=re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        count += 1

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Added distractors to {count} quote cards")
