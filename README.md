# QR Timeline Game

Kartenbasiertes Spiel à la Hitster mit mehreren Kategorien (Musik, Zitate, Videos, Bilder). Jede Karte enthält einen QR-Code, der auf eine Wiedergabeseite zeigt. Medien werden direkt über YouTube oder Spotify gestreamt; eigene Bilder/Zitate kannst du unter `public/assets/` ablegen.

## Schnellstart

```bash
npm install
npm run dev
```

Lokale URL: http://localhost:3000

## Wichtige Seiten

- `/` Landing mit Hauptmenü (Spiel starten, Einstellungen, Spielregeln)
- `/scan` QR-Scanner (Smartphone-freundlich)
- `/card/{id}` Wiedergabe + Lösung (Titel/Jahr verdeckt bis Aufdecken)
- `/print` Drucklayout (Vorder- und Rückseite) mit QR-Codes
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

Setze `NEXT_PUBLIC_APP_URL` in `.env.local`, damit die QR-Codes auf die richtige Domain zeigen (z.B. Vercel-URL). Fallback ist `http://localhost:3000`.

## Timer & Verdeckung

- Musik/Video werden verdeckt eingebettet (Overlay), Titel/Jahr sind erst nach "Aufdecken" sichtbar.
- 3:00 Timer startet nach dem Scan.