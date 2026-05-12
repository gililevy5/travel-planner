import { NextResponse } from 'next/server';
import { getPlanForSelection, DestinationSelection } from '@/lib/claude-trips';
import { TripRequest } from '@/lib/types';

export async function POST(request: Request) {
  const { selection, tripRequest } = await request.json() as {
    selection: DestinationSelection;
    tripRequest: TripRequest;
  };
  if (!selection || !tripRequest) {
    return NextResponse.json({ error: 'Missing selection or tripRequest' }, { status: 400 });
  }
  const plan = await getPlanForSelection(selection, tripRequest);
  return NextResponse.json({ plan });
}
