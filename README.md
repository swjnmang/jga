# Timeline Game (ohne QR)

Kartenbasiertes Spiel à la Hitster mit mehreren Kategorien (Musik, Zitate, Videos, Bilder). Kein QR-Scan: Die Fragen erscheinen direkt in der App, Teams nutzen leere Karten zum Beschriften.

## Schnellstart

```bash
npm install
npm run dev
```

Lokale URL: http://localhost:3000

## Wichtige Seiten

- `/` Landing mit Hauptmenü (Spiel starten, Einstellungen, Spielregeln)
- `/play` Spielmodus: Fragen direkt anzeigen, 3:00 Timer, „Zur nächsten Frage“
- `/print` Drucklayout: Leere Karten (Front: Team-Lösung, Back: Musterlösung)
- `/rules` Spielregeln
- `/settings` Lokales Hinzufügen von Karten (Prototyp, nur Browser-Storage)

## Karten konfigurieren

Bearbeite [lib/cards.ts](lib/cards.ts). Felder pro Karte:

- `id`: eindeutiger Slug
- `category`: `music | quote | video | image`
- `year`: Zahl für die zeitliche Einordnung
- `cue`: Aufgabe/Prompt
- `answer`: Text für die Rückseite
- `sources`: Links auf Medien (YouTube, Spotify, eigenes Asset, Text)

Eigenes Hosting: Lege Dateien unter `public/assets/images` oder `public/assets/quotes` ab und verlinke sie als `/assets/...` in `sources`.

## QR-Basis-URL

Setze `NEXT_PUBLIC_APP_URL` in `.env.local`, falls du externe Links generierst. Spielmodus benötigt keine QR-Codes mehr.

## Timer & Verdeckung

- Musik/Video werden verdeckt eingebettet (Overlay), Titel/Jahr bleiben verborgen.
- 3:00 Timer pro Frage; nach Ablauf wird der Bildschirm schwarz, manuell zur nächsten Frage.