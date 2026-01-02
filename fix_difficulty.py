#!/usr/bin/env python3
import pathlib

lib_path = pathlib.Path('lib')
for ts_file in lib_path.glob('*.ts'):
    content = ts_file.read_text(encoding='utf-8')
    # Replace "einfach" with "leicht"
    content = content.replace('"einfach"', '"leicht"')
    ts_file.write_text(content, encoding='utf-8')
    print(f'✅ {ts_file.name} aktualisiert')

print("\n✅ Alle Dateien fertig!")
