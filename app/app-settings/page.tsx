"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { applyTheme, loadTheme, saveTheme, themes, ThemeId } from '@/lib/theme';
import styles from './appsettings.module.css';

const THEME_SWATCH: Record<ThemeId, string> = {
  aurora: 'linear-gradient(135deg, #0d1b2a, #6fd5ff)',
  dark: 'linear-gradient(135deg, #0a0a0a, #2a2a2a)',
  urban: 'linear-gradient(135deg, #f0f0f0, #cfcfcf)',
};

function AppSettingsContent() {
  const [theme, setTheme] = useState<ThemeId>('dark');
  const searchParams = useSearchParams();
  const authError = searchParams.get('authError');
  const authSuccess = searchParams.get('authSuccess');
  // Direkt nach dem OAuth-Redirect ist der Status schon aus der URL bekannt,
  // damit kein kurzer "nicht verbunden"-Flash vor dem ersten Session-Fetch auftritt.
  const [spotifyLinked, setSpotifyLinked] = useState(authSuccess === '1');

  useEffect(() => {
    const initialTheme = loadTheme('urban');
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Spotify-Verbindungsstatus laden und bei Rückkehr aus dem OAuth-Redirect
  // (Tab-Fokus-Wechsel) neu prüfen, damit der Status hier nicht nur einmalig
  // per authSuccess-Banner, sondern dauerhaft sichtbar ist.
  useEffect(() => {
    const checkSpotifySession = async () => {
      try {
        const res = await fetch('/api/spotify/session');
        const data = await res.json();
        setSpotifyLinked(data.authenticated);
      } catch (err) {
        console.error('Failed to check Spotify session:', err);
      }
    };
    checkSpotifySession();
    window.addEventListener('focus', checkSpotifySession);
    return () => window.removeEventListener('focus', checkSpotifySession);
  }, []);

  const handleThemeChange = (value: ThemeId) => {
    setTheme(value);
    applyTheme(value);
    saveTheme(value);
  };

  const errorMessage = authError === 'missing_client_id'
    ? 'Spotify ist serverseitig nicht konfiguriert (SPOTIFY_CLIENT_ID fehlt). Bitte prüfe die Vercel-Umgebungsvariablen.'
    : authError === 'access_denied'
    ? 'Du hast den Spotify-Zugriff abgelehnt. Bitte erneut versuchen.'
    : authError
    ? `Spotify-Fehler: ${authError}`
    : null;

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.headBlock}>
          <Link href="/" className={styles.back}>
            ← Zurück
          </Link>
          <h1 className={styles.title}>⚙️ Einstellungen</h1>
          <p className={styles.intro}>
            Diese Einstellungen gelten für die gesamte App-Oberfläche. Die Spiel-Einstellungen (Kategorien, Timer, Schwierigkeitsgrade)
            findest du weiterhin im Bereich „Neues Spiel starten".
          </p>
        </div>

        {errorMessage && <div className={styles.bannerError}>⚠️ {errorMessage}</div>}
        {authSuccess === '1' && <div className={styles.bannerSuccess}>✅ Spotify erfolgreich verbunden!</div>}

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionEyebrow}>Design</p>
              <h2 className={styles.sectionTitle}>Aussehen der App</h2>
            </div>
            <span className={styles.badge}>{themes.length} Themes</span>
          </div>
          <div className={styles.themeGrid}>
            {themes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleThemeChange(option.id)}
                className={theme === option.id ? styles.themeBtnActive : styles.themeBtn}
              >
                <span className={styles.themeSwatch} style={{ background: THEME_SWATCH[option.id] }} />
                {option.name}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionEyebrow}>Spotify</p>
              <h2 className={styles.sectionTitle}>Spotify Premium verknüpfen</h2>
            </div>
            {spotifyLinked && <span className={styles.badgeActive}>✓ Verbunden</span>}
          </div>
          <p className={styles.sectionDesc}>
            {spotifyLinked
              ? 'Dein Spotify-Premium-Konto ist verbunden, Songs können in voller Länge abgespielt werden. Bei Problemen kannst du hier erneut verbinden, um die Session aufzufrischen.'
              : 'Starte den Login, um Premium-Wiedergabe ohne Werbung zu ermöglichen. Falls du bereits eingeloggt bist, kannst du hier erneut verbinden, um die Session aufzufrischen.'}
          </p>
          <a href="/api/spotify/authorize?return=/app-settings" className={styles.spotifyBtn}>
            {spotifyLinked ? 'Erneut verbinden' : 'Spotify-Login starten'}
          </a>
        </section>

        <Link href="/" className={styles.primaryBtn}>
          Speichern und zurück ins Hauptmenü
        </Link>
      </div>
    </main>
  );
}

export default function AppSettingsPage() {
  return (
    <Suspense>
      <AppSettingsContent />
    </Suspense>
  );
}
