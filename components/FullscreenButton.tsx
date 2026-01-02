"use client";

import { useEffect, useState } from 'react';

function requestFullscreen() {
  if (!document.documentElement.requestFullscreen) return;
  document.documentElement.requestFullscreen().catch(() => {
    // Swallow rejections when the user blocks the request.
  });
}

export default function FullscreenButton() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const canFullscreen = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;
    setSupported(canFullscreen);
  }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={requestFullscreen}
      className="fixed right-4 top-4 sm:right-6 sm:top-6 z-50 rounded-full bg-ink text-inkDark px-3 py-2 text-xs font-semibold shadow-lg border border-ink/30 hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-sand/60"
    >
      Vollbild
    </button>
  );
}
