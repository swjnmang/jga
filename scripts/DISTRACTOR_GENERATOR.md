# Distractor Generator

Automatisches Generieren von Multiple-Choice-Distraktoren mit OpenAI API.

## Voraussetzungen

1. Python 3.8+
2. OpenAI API Key

## Installation

```powershell
# Python-Paket installieren
pip install openai
```

## Verwendung

### 1. API-Key setzen

```powershell
# In PowerShell (temporär für diese Session):
$env:OPENAI_API_KEY = "sk-..."

# Oder dauerhaft in Windows:
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-...', 'User')
```

### 2. Script ausführen

```powershell
cd scripts
python generate-distractors.py
```

### 3. Kategorien anpassen

Bearbeite `CATEGORIES_TO_PROCESS` in der Script-Datei:

```python
CATEGORIES_TO_PROCESS = [
    'naturTechnikCards.ts',
    'filmSerienCards.ts',
    'triviaExtraCards.ts',
    # Füge weitere hinzu...
]
```

## Was macht das Script?

1. **Liest** alle Card-Dateien
2. **Findet** Karten ohne `distractors`-Feld
3. **Generiert** für jede Frage 3 passende Distraktoren mit GPT-4
4. **Aktualisiert** die Dateien mit den neuen Distraktoren

## Beispiel-Output

```
🚀 Distractor Generator
============================================================

📁 Processing: naturTechnikCards.ts
   Found 250 cards without distractors
   [1/250] naturtechnik-easy-006... ✅
   [2/250] naturtechnik-easy-007... ✅
   [3/250] naturtechnik-easy-008... ✅
   ...
   💾 File updated!

============================================================
✅ Done! Run 'npm run build' to verify.
```

## Qualitätsrichtlinien

Das Script sorgt dafür, dass Distraktoren:
- ✅ Thematisch zur Frage passen
- ✅ Die gleiche Einheit/Format verwenden
- ✅ Nicht offensichtlich falsch sind
- ✅ Auf Deutsch sind
- ✅ Konsistent formatiert sind (mit/ohne Punkt)

## Kosten

- Model: GPT-4o
- Pro Karte: ~0,001-0,002 USD
- 250 Karten: ~0,25-0,50 USD
- 500 Karten: ~0,50-1,00 USD

## Troubleshooting

**Problem:** `OPENAI_API_KEY not set`
- Lösung: API-Key setzen (siehe oben)

**Problem:** `ModuleNotFoundError: No module named 'openai'`
- Lösung: `pip install openai`

**Problem:** Distraktoren passen nicht
- Lösung: Prompt in `generate_distractors()` anpassen
- Alternative: Andere Models testen (gpt-4, gpt-3.5-turbo)

**Problem:** Rate Limit exceeded
- Lösung: Pause zwischen Requests einbauen: `import time; time.sleep(0.5)`

## Batch-Verarbeitung

Für große Mengen kannst du das Script in Batches laufen lassen:

```python
# In generate-distractors.py nach Zeile mit cards[:]:
cards = cards[:50]  # Nur erste 50 Karten
```

## Nach dem Generieren

1. **Build testen:**
   ```powershell
   npm run build
   ```

2. **Qualität prüfen:**
   - Stichproben ansehen
   - Im Spiel testen
   - Bei Bedarf manuell nachbessern

3. **Committen:**
   ```powershell
   git add lib/*.ts
   git commit -m "Add auto-generated distractors"
   git push
   ```
