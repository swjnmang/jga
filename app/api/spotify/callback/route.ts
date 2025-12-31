import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';

export async function GET(request: Request) {
  if (!process.env.SPOTIFY_CLIENT_ID) {
    return NextResponse.json({ error: 'Missing SPOTIFY_CLIENT_ID' }, { status: 500 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const stateCookie = cookies().get('spotify_state');
  const [expectedState, encodedReturn] = stateCookie?.value?.split('|') ?? [];
  const returnTo = encodedReturn ? decodeURIComponent(encodedReturn) : '/play';
  const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/play';

  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL(`${safeReturnTo}?authError=state`, url.origin));
  }

  if (error) {
    return NextResponse.redirect(new URL(`${safeReturnTo}?authError=${encodeURIComponent(error)}`, url.origin));
  }
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const cvCookie = cookies().get('spotify_cv');
  if (!cvCookie?.value) {
    return NextResponse.json({ error: 'Missing code verifier' }, { status: 400 });
  }

  const redirectUri = new URL('/api/spotify/callback', url.origin).toString();
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    code_verifier: cvCookie.value
  });

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL(`${safeReturnTo}?authError=token`, url.origin));
  }

  const data = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
  };

  const response = NextResponse.redirect(new URL(safeReturnTo, url.origin));
  response.cookies.set('spotify_access_token', data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: data.expires_in
  });

  if (data.refresh_token) {
    response.cookies.set('spotify_refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });
  }

  response.cookies.delete('spotify_cv');
  response.cookies.delete('spotify_state');
  return response;
}
