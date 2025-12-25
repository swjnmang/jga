import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getCardById } from '@/lib/cards';
import { getAppBaseUrl } from '@/lib/url';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const card = getCardById(params.id);
  if (!card) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const base = getAppBaseUrl();
  const targetUrl = `${base}/card/${card.id}`;
  const buffer = await QRCode.toBuffer(targetUrl, {
    type: 'png',
    width: 512,
    margin: 1,
    color: { dark: '#0f172a', light: '#ffffff' }
  });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
