import { FlightOffer } from './types';

const BASE = 'https://serpapi.com/search.json';

function monthToDate(month: string, day: number): string {
  const months: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };
  const m = months[month.toLowerCase()] ?? 8;
  const now = new Date();
  const year = m <= now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface SerpLeg {
  departure_airport: { id: string; time: string };
  arrival_airport: { id: string; time: string };
  duration: number;
  airline: string;
}

interface SerpFlight {
  flights: SerpLeg[];
  total_duration: number;
  price: number;
  departure_token: string;
}

interface SerpResponse {
  best_flights?: SerpFlight[];
  other_flights?: SerpFlight[];
  error?: string;
}

function parseOffers(
  data: SerpResponse,
  departureDate: string,
  returnDate: string,
  travelers: number,
  idPrefix: string,
): FlightOffer[] {
  const all = [...(data.best_flights ?? []), ...(data.other_flights ?? [])];
  return all
    .filter(f => typeof f.price === 'number' && f.price > 0 && f.flights?.length > 0)
    .map((f, i): FlightOffer => {
      const first = f.flights[0];
      const last = f.flights[f.flights.length - 1];
      const outboundMins = f.flights.reduce((s, l) => s + (l.duration ?? 0), 0);
      const totalMins = f.total_duration ?? outboundMins;
      const inboundMins = Math.max(0, totalMins - outboundMins);
      const total = Math.round(f.price);
      return {
        id: `${idPrefix}-${i}-${departureDate}`,
        departureDate,
        returnDate,
        pricePerPerson: Math.round(total / travelers),
        total,
        outboundDuration: fmt(outboundMins),
        inboundDuration: inboundMins > 0 ? fmt(inboundMins) : '—',
        totalDurationMinutes: totalMins,
        stops: f.flights.length - 1,
        airline: first.airline,
        outboundDeparture: first.departure_airport.time.slice(11, 16),
        outboundArrival: last.arrival_airport.time.slice(11, 16),
        inboundDeparture: '—',
        inboundArrival: '—',
        originAirport: first.departure_airport.id,
        destinationAirport: last.arrival_airport.id,
        departureToken: f.departure_token ?? '',
      };
    });
}

async function fetchOneDate(
  originIATA: string,
  destIATA: string,
  departureDate: string,
  returnDate: string,
  travelers: number,
  apiKey: string,
): Promise<FlightOffer[]> {
  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: originIATA,
    arrival_id: destIATA,
    outbound_date: departureDate,
    return_date: returnDate,
    adults: String(travelers),
    currency: 'USD',
    hl: 'en',
    type: '1',
    api_key: apiKey,
  });
  try {
    const res = await fetch(`${BASE}?${params}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json() as SerpResponse;
    if (data.error) return [];
    return parseOffers(data, departureDate, returnDate, travelers, `${originIATA}-${destIATA}`);
  } catch {
    return [];
  }
}

export async function searchFlights(
  originIATA: string,
  destIATA: string,
  month: string,
  duration: number,
  travelers: number,
): Promise<FlightOffer[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return [];

  // Sample 3 windows across the month: beginning, middle, end
  const departureDays = [5, 14, 23];
  const searches = departureDays.map(day => {
    const departureDate = monthToDate(month, day);
    const returnDate = addDays(departureDate, duration);
    return fetchOneDate(originIATA, destIATA, departureDate, returnDate, travelers, apiKey);
  });

  const results = await Promise.all(searches);
  const combined = results.flat();

  if (combined.length === 0) return [];

  // Score: 60% price, 40% duration — pick best 5 across all date windows
  const maxPrice = Math.max(...combined.map(o => o.total), 1);
  const maxDur = Math.max(...combined.map(o => o.totalDurationMinutes), 1);
  return combined
    .sort((a, b) => {
      const sa = 0.6 * (1 - a.total / maxPrice) + 0.4 * (1 - a.totalDurationMinutes / maxDur);
      const sb = 0.6 * (1 - b.total / maxPrice) + 0.4 * (1 - b.totalDurationMinutes / maxDur);
      return sb - sa;
    })
    .slice(0, 5);
}
