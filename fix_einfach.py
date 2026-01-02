import pathlib

lib_path = pathlib.Path('lib')
for ts_file in lib_path.glob('*.ts'):
    content = ts_file.read_text(encoding='utf-8')
    updated = content.replace("'einfach'", "'leicht'")
    if updated != content:
        ts_file.write_text(updated, encoding='utf-8')
        print(f'✅ {ts_file.name} aktualisiert')
    else:
        print(f'⏭️  {ts_file.name} (kein Update nötig)')
