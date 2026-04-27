import { NextResponse } from 'next/server';
import { getFlightOffers } from '@/lib/amadeus';

export async function POST(request: Request) {
  const body = await request.json() as {
    originIATA: string;
    destinationIATA: string;
    departureDate: string;
    returnDate: string;
    travelers: number;
  };
  const offers = await getFlightOffers(
    body.originIATA,
    body.destinationIATA,
    body.departureDate,
    body.returnDate,
    body.travelers,
  );
  return NextResponse.json({ offers });
}
