# Flex Quiz (ohne QR)

Flexibles Timeline-Quiz mit Flex Buttons und mehreren Kategorien (Musik, Zitate, Videos, Bilder). Kein QR-Scan: Die Fragen erscheinen direkt in der App, Karten bleiben leer für eigene Fragen und Lösungen.

## Schnellstart

```bash
npm install
npm run dev
```

Lokale URL: http://localhost:3000

## Wichtige Seiten

- `/` Landing mit Hauptmenü (Spiel starten, Einstellungen, Spielregeln)
- `/play` Spielmodus: Fragen direkt anzeigen, 3:00 Timer, „Zur nächsten Frage“
 - `/play` Spielmodus: Fragen direkt anzeigen, 3:00 Timer, „Zur nächsten Frage“, optional Spotify-Premium Login
- `/print` Drucklayout: Leere Karten (Front: Team-Lösung, Back: Musterlösung)
- `/rules` Spielregeln
- `/settings` Lokales Hinzufügen von Karten (Prototyp, nur Browser-Storage)

## Flex Buttons (Kurzfassung)

- Einsatz nach dem Zug eines anderen Teams; bei korrekter Flex-Lösung geht die letzte Karte an dich, sonst ist der Button weg.
- Buttons verdienst du im eigenen Zug nur, wenn du das Jahr richtig einordnest und zusätzlich Titel/Interpret bzw. Name/Zitatgeber korrekt nennst.

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

## Spotify Login (PKCE)

- Setze `SPOTIFY_CLIENT_ID` in `.env.local`.
- Beim ersten Besuch von /play erscheint ein Dialog zum Spotify-Premium-Login. Der Flow nutzt PKCE (ohne Client Secret) über `/api/spotify/authorize` → `/api/spotify/callback` und speichert Tokens in HTTP-only Cookies.