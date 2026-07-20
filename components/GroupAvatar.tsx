"use client";

import { isImageAvatar } from '@/lib/imageAvatar';

// Groessen entsprechen den bisherigen Emoji-Textgroessen (text-base / text-lg / text-2xl)
const SIZES = {
  sm: { img: 'w-4 h-4', emoji: 'text-base' },
  md: { img: 'w-5 h-5', emoji: 'text-lg' },
  lg: { img: 'w-7 h-7', emoji: 'text-2xl' },
} as const;

/**
 * Zeigt den Gruppen-Avatar an: entweder ein Emoji oder ein aufgenommenes Foto
 * (Base64-Data-URL) als rundes Mini-Bild in gleicher Groesse.
 */
export default function GroupAvatar({
  avatar,
  size = 'md',
}: {
  avatar?: string | null;
  size?: keyof typeof SIZES;
}) {
  if (!avatar) return null;
  if (isImageAvatar(avatar)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt="Gruppen-Avatar"
        className={`${SIZES[size].img} rounded-full object-cover flex-shrink-0 border border-ink/20`}
      />
    );
  }
  return <span className={SIZES[size].emoji}>{avatar}</span>;
}
