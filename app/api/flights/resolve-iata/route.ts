import { NextResponse } from 'next/server';
import { resolveIATA } from '@/lib/amadeus';

export async function POST(request: Request) {
  const body = await request.json() as { city?: string };
  if (!body.city) return NextResponse.json({ iata: null });
  const iata = await resolveIATA(body.city);
  return NextResponse.json({ iata });
}
