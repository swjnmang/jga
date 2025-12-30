#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const argIds = process.argv.slice(2).filter(Boolean);
const envIdsRaw = process.env.SPOTIFY_PLAYLIST_IDS || process.env.SPOTIFY_PLAYLIST_ID || '';
const envIds = envIdsRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const playlistIds = argIds.length > 0 ? argIds : envIds;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const providedAccessToken = process.env.SPOTIFY_ACCESS_TOKEN;

if (!playlistIds || playlistIds.length === 0) {
  console.error('Missing playlist id(s). Set SPOTIFY_PLAYLIST_IDS (comma separated) or pass as args.');
  process.exit(1);
}

if ((!clientId || !clientSecret) && !providedAccessToken) {
  console.error('Missing Spotify credentials. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET, or provide SPOTIFY_ACCESS_TOKEN.');
  process.exit(1);
}

async function getToken() {
  if (providedAccessToken) {
    return providedAccessToken;
  }

  const body = new URLSearchParams({ grant_type: 'client_credentials' });
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed: ${res.status} ${res.statusText} – ${text}`);
  }

  const json = await res.json();
  return json.access_token;
}

const artistCache = new Map();

async function getArtist(token, id) {
  if (artistCache.has(id)) return artistCache.get(id);
  const res = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Artist fetch failed: ${res.status} ${res.statusText} – ${text}`);
  }
  const json = await res.json();
  artistCache.set(id, json);
  return json;
}

async function fetchAllTracks(token, id) {
  const items = [];
  let offset = 0;
  const limit = 100;

  for (;;) {
    const url = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Playlist fetch failed: ${res.status} ${res.statusText} – ${text}`);
    }

    const json = await res.json();
    const pageItems = json.items ?? [];
    items.push(...pageItems);

    if (!json.next || pageItems.length === 0) break;
    offset += pageItems.length;
  }

  return items;
}

async function getPlaylistMeta(token, id) {
  const url = `https://api.spotify.com/v1/playlists/${id}?fields=id,name`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Playlist meta fetch failed: ${res.status} ${res.statusText} – ${text}`);
  }
  const json = await res.json();
  return { id: json.id || id, name: json.name || id };
}

function toYear(releaseDate) {
  if (!releaseDate) return new Date().getFullYear();
  const year = Number(String(releaseDate).slice(0, 4));
  return Number.isFinite(year) ? year : new Date().getFullYear();
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function toCard(item, genres = [], playlistTag) {
  const track = item.track;
  if (!track || track.type !== 'track') return null;
  const artists = track.artists?.map((a) => a.name).filter(Boolean) ?? [];
  const artistStr = artists.join(', ') || 'Unbekannter Artist';
  const year = toYear(track.album?.release_date);
  const slug = slugify(`${track.name}-${year}`) || track.id;

  return {
    id: `song-${slug}`,
    title: track.name,
    category: 'music',
    year,
    cue: 'Song anhören und einordnen.',
    answer: `${artistStr} — ${year}, ${track.name}.`,
    hint: artistStr,
    difficulty: 'mittel',
    sources: {
      spotify: track.external_urls?.spotify,
    },
    genres,
    playlists: playlistTag ? [playlistTag] : undefined,
  };
}

function mapGenres(rawGenres) {
  const tags = new Set();
  const lower = (rawGenres || []).map((g) => g.toLowerCase());

  const has = (needle) => lower.some((g) => g.includes(needle));

  if (has('metal') || has('hardcore') || has('deathcore') || has('thrash') || has('djent')) tags.add('metal');
  if (has('rap') || has('hip hop') || has('hip-hop') || has('trap') || has('drill')) tags.add('hiphop');
  if (has('schlager') || has('apres-ski') || has('ballermann') || has('mallorca') || has('party')) tags.add('schlagerparty');

  if (tags.size === 0) tags.add('poprock');
  // Pop/Rock is also a good secondary default alongside other matches
  if (tags.has('hiphop') || tags.has('metal') || tags.has('schlagerparty')) tags.add('poprock');

  return Array.from(tags);
}

async function processPlaylist(token, playlistId) {
  let meta = { id: playlistId, name: playlistId };
  try {
    meta = await getPlaylistMeta(token, playlistId);
  } catch (err) {
    console.warn(err?.message || err);
  }

  const rawItems = await fetchAllTracks(token, playlistId);
  // Prefetch artist genres
  const artistIds = Array.from(
    new Set(
      rawItems
        .map((item) => item.track?.artists || [])
        .flat()
        .map((a) => a?.id)
        .filter(Boolean)
    )
  );

  const artistGenres = new Map();
  for (const id of artistIds) {
    try {
      const artist = await getArtist(token, id);
      artistGenres.set(id, artist.genres || []);
    } catch (_err) {
      artistGenres.set(id, []);
    }
  }

  const cards = rawItems
    .map((item) => {
      const track = item.track;
      const artistTags = (track?.artists || [])
        .map((a) => mapGenres(artistGenres.get(a.id) || []))
        .flat();
      const dedupedGenres = Array.from(new Set(artistTags));
      return toCard(item, dedupedGenres, playlistId);
    })
    .filter(Boolean);

  return { info: meta, cards };
}

function mergeCards(lists) {
  const bySpotify = new Map();

  const mergeArrays = (a = [], b = []) => Array.from(new Set([...(a || []), ...(b || [])]));

  for (const card of lists.flat()) {
    const key = card.sources.spotify || card.id;
    if (!key) continue;
    const existing = bySpotify.get(key);
    if (!existing) {
      bySpotify.set(key, card);
    } else {
      bySpotify.set(key, {
        ...existing,
        genres: mergeArrays(existing.genres, card.genres),
        playlists: mergeArrays(existing.playlists, card.playlists),
      });
    }
  }

  return Array.from(bySpotify.values());
}

async function main() {
  const token = await getToken();
  const allCards = [];
  const playlistInfos = [];

  for (const id of playlistIds) {
    console.log(`Fetching playlist ${id}...`);
    const { info, cards } = await processPlaylist(token, id);
    playlistInfos.push(info);
    allCards.push(cards);
  }

  const merged = mergeCards(allCards);
  const mergedPlaylistInfo = Array.from(new Map(playlistInfos.map((p) => [p.id, p])).values());

  const outputPath = path.join(process.cwd(), 'lib', 'playlistCards.ts');
  const file = `// AUTO-GENERATED by scripts/sync-playlist.mjs\n` +
    `// Do not edit manually.\n` +
    `import { Card } from './types';\n\n` +
    `export type PlaylistInfo = { id: string; name: string };\n` +
    `export const playlistInfo: PlaylistInfo[] = ${JSON.stringify(mergedPlaylistInfo, null, 2)};\n\n` +
    `export const playlistCards: Card[] = ${JSON.stringify(merged, null, 2)};\n`;

  fs.writeFileSync(outputPath, file);
  console.log(`Wrote ${merged.length} cards from ${playlistIds.length} playlist(s) to ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
