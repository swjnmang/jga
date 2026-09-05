'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createCodenamesGame } from '@/lib/codenamesService';
import { CODENAMES_LOCAL_STORAGE_KEY } from '@/lib/codenamesTypes';
import type { CodenamesTeam, CodenamesRole } from '@/lib/codenamesTypes';
import styles from './codenames.module.css';

export default function CodenamesLandingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');

  const [hostName, setHostName] = useState('');
  const [hostTeam, setHostTeam] = useState<CodenamesTeam>('red');
  const [hostRole, setHostRole] = useState<CodenamesRole>('spymaster');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [joinPin, setJoinPin] = useState('');

  async function handleCreate() {
    if (!hostName.trim()) {
      setError('Bitte gib deinen Namen ein.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const { pin, hostPlayerId } = await createCodenamesGame({
        hostPlayerName: hostName,
        hostTeam,
        hostRole,
      });
      window.localStorage.setItem(CODENAMES_LOCAL_STORAGE_KEY, JSON.stringify({ pin, playerId: hostPlayerId }));
      router.push(`/codenames/${pin}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Spiel konnte nicht erstellt werden.');
      setCreating(false);
    }
  }

  function handleJoin() {
    const pin = joinPin.trim().toUpperCase();
    if (!pin) {
      setError('Bitte gib einen PIN ein.');
      return;
    }
    router.push(`/codenames/${pin}`);
  }

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.headBlock}>
          <Link href="/create" className={styles.back}>
            ← Zurück
          </Link>
          <h1 className={styles.title}>🕵️ Wortagenten</h1>
        </div>

        <p className={styles.intro}>
          Zwei Teams, ein Wortraster: Der Geheimdienstchef gibt einen Hinweis aus einem Wort und einer
          Zahl, die Ermittler tippen die passenden Begriffe an. Wer zuerst alle eigenen Wörter findet,
          gewinnt – aber Vorsicht vor dem Attentäter! Jeder spielt mit dem eigenen Handy.
        </p>
        <p className={styles.hint}>
          📱 Mindestens 4 Geräte nötig – pro Team 1 Geheimdienstchef + 1 Ermittler. Größere Teams mit
          mehreren Ermittlern funktionieren genauso gut, wenn ihr im selben Raum zusammen ratet.
        </p>

        <div className={styles.toggleRow}>
          <button onClick={() => setTab('create')} className={tab === 'create' ? styles.toggleBtnOn : styles.toggleBtn}>
            Spiel erstellen
          </button>
          <button onClick={() => setTab('join')} className={tab === 'join' ? styles.toggleBtnOn : styles.toggleBtn}>
            Spiel beitreten
          </button>
        </div>

        {tab === 'create' && (
          <>
            <div className={styles.section}>
              <p className={styles.label}>Dein Name</p>
              <input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="z.B. Anna"
                className={styles.field}
              />
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Dein Team</p>
              <div className={styles.teamGrid}>
                <button
                  onClick={() => setHostTeam('red')}
                  className={hostTeam === 'red' ? styles.teamOptionRedActive : styles.teamOptionRed}
                >
                  🔴 Rot
                </button>
                <button
                  onClick={() => setHostTeam('blue')}
                  className={hostTeam === 'blue' ? styles.teamOptionBlueActive : styles.teamOptionBlue}
                >
                  🔵 Blau
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Deine Rolle</p>
              <div className={styles.roleList}>
                <button
                  onClick={() => setHostRole('spymaster')}
                  className={hostRole === 'spymaster' ? styles.roleOptionActive : styles.roleOption}
                >
                  <span className={styles.roleOptionName}>🕵️ Geheimdienstchef</span>
                  <span className={styles.roleOptionDesc}>Sieht alle Farben, gibt Hinweise (Wort + Zahl).</span>
                </button>
                <button
                  onClick={() => setHostRole('operative')}
                  className={hostRole === 'operative' ? styles.roleOptionActive : styles.roleOption}
                >
                  <span className={styles.roleOptionName}>🔎 Ermittler</span>
                  <span className={styles.roleOptionDesc}>Tippt anhand der Hinweise die richtigen Begriffe an.</span>
                </button>
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <button onClick={handleCreate} disabled={creating} className={styles.primaryBtn}>
              {creating ? 'Erstelle Spiel …' : 'Spiel erstellen →'}
            </button>
          </>
        )}

        {tab === 'join' && (
          <>
            <div className={styles.section}>
              <p className={styles.label}>PIN vom Spielleiter</p>
              <input
                value={joinPin}
                onChange={(e) => setJoinPin(e.target.value.toUpperCase())}
                placeholder="z.B. AB12CD"
                maxLength={8}
                className={styles.fieldPin}
              />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
            <button onClick={handleJoin} className={styles.primaryBtn}>
              Weiter →
            </button>
          </>
        )}
      </div>
    </main>
  );
}
