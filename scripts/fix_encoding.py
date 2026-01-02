import pathlib

# Mapping von kaputten Zeichen zu korrekten Zeichen
replacements = {
    '�': '—',  # Em dash
    '�': 'ä',
    '�': 'ö',
    '�': 'ü',
    '�': 'Ä',
    '�': 'Ö',
    '�': 'Ü',
    '�': 'ß',
    '�': '„',  # Opening German quote
    '�': '"',  # Closing German quote or opening English quote
}

file_path = pathlib.Path('lib/cards.ts')
content = file_path.read_text(encoding='utf-8')

for bad, good in replacements.items():
    content = content.replace(bad, good)

file_path.write_text(content, encoding='utf-8')
print("✅ Encoding-Probleme in cards.ts behoben!")
