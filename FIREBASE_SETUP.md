# Firebase Multiplayer Einrichtung

## 1. Firebase-Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Klicke auf "Projekt hinzufügen"
3. Gib einen Projektnamen ein (z.B. "jga-multiplayer")
4. Folge den Anweisungen

## 2. Realtime Database aktivieren

1. Klicke in der linken Seitenleiste auf "Realtime Database"
2. Klicke auf "Datenbank erstellen"
3. Wähle einen Standort (z.B. `europe-west1`)
4. Starte im **Testmodus** (später auf Produktionsmodus umstellen)

## 3. Web-App registrieren

1. Klicke auf das Web-Icon (</>) in der Projektübersicht
2. Gib einen App-Namen ein (z.B. "JGA Web")
3. Kopiere die Firebase-Konfiguration

## 4. Umgebungsvariablen einrichten

1. Erstelle eine `.env.local` Datei im Root-Verzeichnis
2. Kopiere die Vorlage aus `.env.example`
3. Füge deine Firebase-Konfigurationswerte ein:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=dein-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://dein-projekt-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=dein-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=dein-app-id
```

## 5. Sicherheitsregeln einrichten

Gehe in der Firebase Console zu "Realtime Database" → "Regeln" und ersetze die Regeln mit:

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["createdAt", "state"],
        "groups": {
          "$groupId": {
            "avatar": {
              ".validate": "newData.isString() && newData.val().length <= 51200"
            }
          }
        }
      }
    }
  }
}
```

Die `avatar`-Validierung begrenzt Foto-Avatare (Base64-Data-URLs) auf max. ~50 KB, damit keine unkomprimierten Bilder in die Datenbank geschrieben werden können.

**⚠️ Wichtig:** Diese Regeln sind für die Entwicklung. Für Produktion sollten sie verschärft werden!

## 6. Development Server starten

```bash
npm run dev
```

## Multiplayer-Features

### Spielablauf

1. **Spiel erstellen**: Eine Gruppe erstellt ein Spiel und erhält einen 6-stelligen PIN
2. **Beitreten**: Andere Gruppen treten mit dem PIN bei
3. **Bereit markieren**: Alle Gruppen markieren sich als bereit
4. **Host startet**: Der Host startet das Spiel
5. **Spielen**: Alle sehen die gleiche Karte und platzieren auf ihrem Gerät
6. **Live-Sync**: Alle Updates werden in Echtzeit synchronisiert

### Technische Details

- **Firebase Realtime Database**: Echtzeit-Synchronisation
- **PIN-System**: 6-stellige PINs für einfaches Beitreten
- **Gruppen-Farben**: Automatische Farbzuweisung
- **Presence-Tracking**: "Last Seen" für Verbindungsstatus
- **Score-Tracking**: Live-Punkte für jede Gruppe

## Produktionsbereitschaft

Für den Produktiveinsatz:

1. **Sicherheitsregeln** verschärfen
2. **Authentifizierung** hinzufügen (optional)
3. **Rate Limiting** implementieren
4. **Alte Spiele** automatisch löschen (Cloud Functions)
5. **Monitoring** einrichten
