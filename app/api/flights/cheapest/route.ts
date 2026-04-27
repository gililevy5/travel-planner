import { NextResponse } from 'next/server';
import { getCheapestDates } from '@/lib/amadeus';

export async function POST(request: Request) {
  const body = await request.json() as {
    originIATA: string;
    destinationIATA: string;
    month: string;
    duration: number;
    travelers: number;
  };
  const flight = await getCheapestDates(
    body.originIATA,
    body.destinationIATA,
    body.month,
    body.duration,
    body.travelers,
  );
  return NextResponse.json({ flight });
}
