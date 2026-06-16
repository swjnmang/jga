import { execSync } from 'child_process';

/**
 * Gibt den Zeitpunkt des letzten Git-Commits zurück – nicht die aktuelle Build-Zeit.
 * Vercel: VERCEL_GIT_COMMIT_TIMESTAMP (stabil, ändert sich nur bei neuem Commit).
 * Lokal:  git log -1 als Fallback.
 * Der Wert ist damit unabhängig davon, wann der Server startet oder next.config.mjs
 * neu ausgewertet wird.
 */
function getLastCommitTime() {
  // Vercel-Umgebung: System-Env-Variable enthält den Git-Commit-Timestamp
  const vercelTs = process.env.VERCEL_GIT_COMMIT_TIMESTAMP;
  if (vercelTs) {
    try {
      // Kann Unix-Sekunden (Zahl) oder ISO-String sein
      const date = isNaN(Number(vercelTs))
        ? new Date(vercelTs)
        : new Date(Number(vercelTs) * 1000);
      if (!isNaN(date.getTime())) return date.toISOString();
    } catch { /* weiter zum Fallback */ }
  }
  // Lokale Entwicklung / anderes CI: git log
  try {
    const raw = execSync('git log -1 --format=%cI', { timeout: 3000 }).toString().trim();
    return new Date(raw).toISOString();
  } catch { /* weiter zum letzten Fallback */ }
  // Absoluter Fallback: aktuelle Zeit
  return new Date().toISOString();
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_TIME: getLastCommitTime(),
  },
};

export default nextConfig;
