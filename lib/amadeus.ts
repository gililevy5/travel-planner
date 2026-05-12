import { CheapestFlight, FlightOffer } from './types';

const BASE = 'https://test.api.amadeus.com';

let _token: string | null = null;
let _tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;
  const res = await fetch(`${BASE}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`);
  const data = await res.json() as { access_token: string; expires_in: number };
  _token = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _token;
}

async function amadeusGet(path: string): Promise<unknown> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Amadeus ${path} → ${res.status}`);
  return res.json();
}

export async function resolveIATA(city: string): Promise<string | null> {
  try {
    const data = await amadeusGet(
      `/v1/reference-data/locations?keyword=${encodeURIComponent(city)}&subType=AIRPORT,CITY&page[limit]=1`
    ) as { data?: Array<{ iataCode: string }> };
    return data.data?.[0]?.iataCode ?? null;
  } catch {
    return null;
  }
}

function monthToYYYYMM(month: string): string {
  const idx: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };
  const num = idx[month.toLowerCase()] ?? 1;
  const now = new Date();
  const year = num < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-${String(num).padStart(2, '0')}`;
}

function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  return (parseInt(m[1] ?? '0') * 60) + parseInt(m[2] ?? '0');
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export async function getCheapestDates(
  originIATA: string,
  destinationIATA: string,
  month: string,
  duration: number,
  travelers: number,
): Promise<CheapestFlight | null> {
  try {
    const yyyymm = monthToYYYYMM(month);
    const data = await amadeusGet(
      `/v1/shopping/flight-dates?origin=${originIATA}&destination=${destinationIATA}&departureDate=${yyyymm}&duration=${duration}&oneWay=false&viewBy=DATE`
    ) as { data?: Array<{ departureDate: string; returnDate: string; price: { total: string } }> };
    if (!data.data?.length) return null;
    const best = data.data[0];
    const pricePerPerson = parseFloat(best.price.total);
    return {
      departureDate: best.departureDate,
      returnDate: best.returnDate,
      pricePerPerson,
      total: Math.round(pricePerPerson * travelers),
    };
  } catch {
    return null;
  }
}

export async function getFlightOffers(
  originIATA: string,
  destinationIATA: string,
  departureDate: string,
  returnDate: string,
  travelers: number,
): Promise<FlightOffer[]> {
  try {
    const data = await amadeusGet(
      `/v2/shopping/flight-offers?originLocationCode=${originIATA}&destinationLocationCode=${destinationIATA}&departureDate=${departureDate}&returnDate=${returnDate}&adults=${travelers}&max=15&currencyCode=USD`
    ) as {
      data?: Array<{
        id: string;
        itineraries: Array<{
          duration: string;
          segments: Array<{
            departure: { iataCode: string; at: string };
            arrival: { iataCode: string; at: string };
            carrierCode: string;
          }>;
        }>;
        price: { grandTotal: string };
        travelerPricings: Array<{ price: { total: string } }>;
      }>;
    };
    if (!data.data?.length) return [];

    const offers: FlightOffer[] = data.data.map(offer => {
      const outbound = offer.itineraries[0];
      const inbound = offer.itineraries[1];
      const outMins = parseIsoDuration(outbound.duration);
      const inMins = parseIsoDuration(inbound.duration);
      const outFirst = outbound.segments[0];
      const outLast = outbound.segments[outbound.segments.length - 1];
      const inFirst = inbound.segments[0];
      const inLast = inbound.segments[inbound.segments.length - 1];
      const total = parseFloat(offer.price.grandTotal);
      const pricePerPerson = parseFloat(offer.travelerPricings[0]?.price.total ?? String(total / travelers));
      return {
        id: offer.id,
        departureDate,
        returnDate,
        pricePerPerson: Math.round(pricePerPerson),
        total: Math.round(total),
        outboundDuration: formatDuration(outMins),
        inboundDuration: formatDuration(inMins),
        totalDurationMinutes: outMins + inMins,
        stops: outbound.segments.length - 1,
        airline: outFirst.carrierCode,
        outboundDeparture: outFirst.departure.at.slice(11, 16),
        outboundArrival: outLast.arrival.at.slice(11, 16),
        inboundDeparture: inFirst.departure.at.slice(11, 16),
        inboundArrival: inLast.arrival.at.slice(11, 16),
        originAirport: outFirst.departure.iataCode,
        destinationAirport: outLast.arrival.iataCode,
        departureToken: '',
      };
    });

    // Sort by weighted score: 60% price, 40% duration (higher = better)
    const maxPrice = Math.max(...offers.map(o => o.total));
    const maxDur = Math.max(...offers.map(o => o.totalDurationMinutes));
    return offers.sort((a, b) => {
      const sa = 0.6 * (1 - a.total / maxPrice) + 0.4 * (1 - a.totalDurationMinutes / maxDur);
      const sb = 0.6 * (1 - b.total / maxPrice) + 0.4 * (1 - b.totalDurationMinutes / maxDur);
      return sb - sa;
    });
  } catch {
    return [];
  }
}
