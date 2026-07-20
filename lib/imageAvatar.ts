// Foto-Avatare: Bilder werden clientseitig komprimiert und als Base64-Data-URL
// im bestehenden avatar-Feld in der Realtime Database gespeichert (kein Firebase Storage noetig).

// Maximale Kantenlaenge des quadratischen Avatars in Pixeln
const AVATAR_SIZE = 128;
// Ziel: Data-URL unter ~32 KB halten (Firebase-Regel erlaubt bis 51200 Zeichen)
const MAX_DATA_URL_LENGTH = 32_000;

export function isImageAvatar(avatar?: string | null): boolean {
  return !!avatar && avatar.startsWith('data:image');
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Bild konnte nicht geladen werden')); };
    img.src = url;
  });
}

/**
 * Verkleinert ein Foto auf einen quadratischen Avatar (Center-Crop) und
 * komprimiert es als JPEG-Data-URL. Senkt die Qualitaet schrittweise,
 * bis die Data-URL unter dem Groessenlimit liegt.
 */
export async function compressImageToAvatar(file: File): Promise<string> {
  const img = await loadImage(file);

  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas wird nicht unterstuetzt');
  ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

  for (const quality of [0.8, 0.7, 0.6, 0.5, 0.4]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl;
  }
  // Bei 128x128 JPEG praktisch unerreichbar, aber sicher ist sicher
  throw new Error('Bild konnte nicht ausreichend komprimiert werden');
}
