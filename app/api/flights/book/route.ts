import { NextResponse } from 'next/server';

const BASE = 'https://serpapi.com/search.json';

interface BookingOption {
  book_with?: Array<{
    book_with_airline?: { link?: string };
    together_price?: { lowest?: { value?: number } };
  }>;
  together?: { book_with_airline?: { link?: string } };
}

interface BookingResponse {
  booking_options?: BookingOption[];
  error?: string;
}

export async function POST(request: Request) {
  const { departureToken } = await request.json() as { departureToken: string };
  if (!departureToken) return NextResponse.json({ url: null });

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return NextResponse.json({ url: null });

  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_token: departureToken,
    api_key: apiKey,
  });

  try {
    const res = await fetch(`${BASE}?${params}`);
    if (!res.ok) return NextResponse.json({ url: null });
    const data = await res.json() as BookingResponse;
    if (data.error || !data.booking_options?.length) return NextResponse.json({ url: null });

    // Try to find the first airline direct booking link
    let url: string | null = null;
    for (const option of data.booking_options) {
      url = option.together?.book_with_airline?.link
        ?? option.book_with?.[0]?.book_with_airline?.link
        ?? null;
      if (url) break;
    }

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ url: null });
  }
}
