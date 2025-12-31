import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';

function base64Url(input: Buffer) {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function GET(request: Request) {
  if (!process.env.SPOTIFY_CLIENT_ID) {
    return NextResponse.json({ error: 'Missing SPOTIFY_CLIENT_ID' }, { status: 500 });
  }

  const url = new URL(request.url);
  const returnToRaw = url.searchParams.get('return') || '/play';
  const returnTo = returnToRaw.startsWith('/') ? returnToRaw : '/play';

  const verifier = base64Url(randomBytes(64));
  const challenge = base64Url(createHash('sha256').update(verifier).digest());
  const state = base64Url(randomBytes(24));

  const redirectUri = new URL('/api/spotify/callback', url.origin).toString();

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state app-remote-control',
    state
  });

  const response = NextResponse.redirect(`${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`);
  response.cookies.set('spotify_cv', verifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600
  });

  response.cookies.set('spotify_state', `${state}|${encodeURIComponent(returnTo)}`, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600
  });

  return response;
}
