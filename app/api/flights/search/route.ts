import { NextResponse } from 'next/server';
import { searchFlights } from '@/lib/serpapi';

export async function POST(request: Request) {
  const { originIATA, destIATA, month, duration, travelers } = await request.json() as {
    originIATA: string;
    destIATA: string;
    month: string;
    duration: number;
    travelers: number;
  };
  const offers = await searchFlights(originIATA, destIATA, month, duration, travelers);
  return NextResponse.json({ offers });
}
