import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';

export async function GET() {
  const store = cookies();
  const token = store.get('spotify_access_token')?.value;
  if (token) {
    return NextResponse.json({ accessToken: token });
  }

  // Access token expired (cookie maxAge ran out) — try to mint a fresh one via the refresh token.
  const refreshToken = store.get('spotify_refresh_token')?.value;
  if (!refreshToken || !process.env.SPOTIFY_CLIENT_ID) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.SPOTIFY_CLIENT_ID
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'refresh_failed' }, { status: 401 });
  }

  const data = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  const response = NextResponse.json({ accessToken: data.access_token });
  response.cookies.set('spotify_access_token', data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: data.expires_in
  });
  // Spotify rotates the refresh token on some grants — persist it if a new one comes back.
  if (data.refresh_token) {
    response.cookies.set('spotify_refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });
  }
  return response;
}
