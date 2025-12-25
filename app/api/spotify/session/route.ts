import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const token = cookies().get('spotify_access_token')?.value;
  return NextResponse.json({ authenticated: Boolean(token) });
}
