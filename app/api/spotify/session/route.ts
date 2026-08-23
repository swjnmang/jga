import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const store = cookies();
  const hasAccessToken = Boolean(store.get('spotify_access_token')?.value);
  const hasRefreshToken = Boolean(store.get('spotify_refresh_token')?.value);
  return NextResponse.json({ authenticated: hasAccessToken || hasRefreshToken });
}
