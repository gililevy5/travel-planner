# Real Flight Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace AI-estimated flight costs with real Amadeus flight data — cheapest dates shown on destination cards, full offer list with filters shown above the itinerary.

**Architecture:** Progressive enhancement using three server-side API routes (resolve-iata, cheapest, offers) that call Amadeus REST APIs directly. `ResultsContent` orchestrates all fetching client-side: resolve origin IATA once, fetch cheapest per destination in parallel, then fetch offers when user selects a destination. Everything falls back silently to AI estimates on failure.

**Tech Stack:** Next.js 16 App Router route handlers, Amadeus REST API (no SDK — raw fetch with OAuth2 token caching), TypeScript, Tailwind CSS.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `lib/types.ts` | Add `CheapestFlight`, `FlightOffer`, `FlightFilters`; add `iataCode` to `Destination` |
| Create | `lib/amadeus.ts` | Amadeus REST wrapper: token cache, `resolveIATA`, `getCheapestDates`, `getFlightOffers` |
| Create | `app/api/flights/resolve-iata/route.ts` | POST → resolve city name to IATA code |
| Create | `app/api/flights/cheapest/route.ts` | POST → cheapest round-trip in a month |
| Create | `app/api/flights/offers/route.ts` | POST → full flight offers for specific dates |
| Modify | `lib/claude-trips.ts` | Add `iataCode` to destination schema + prompt |
| Modify | `components/BudgetBreakdown.tsx` | Accept `realFlightCost?: number`, use it over AI estimate |
| Modify | `components/DestinationCard.tsx` | Flight price badge with loading shimmer |
| Create | `components/FlightSection.tsx` | Flight offer cards + filter bar |
| Modify | `app/results/ResultsContent.tsx` | Orchestrate all flight fetching; render FlightSection |
| Modify | `components/ItineraryView.tsx` | Accept + forward `realFlightCost` to BudgetBreakdown |
| Modify | `.env.local.example` | Add Amadeus keys |

---

### Task 1: Add flight types to `lib/types.ts`

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Add `iataCode` to `Destination` and add three new interfaces**

Open `lib/types.ts`. Add `iataCode: string` to `Destination`, and append the three new interfaces at the end of the file:

```typescript
export interface Destination {
  id: string;
  name: string;
  country: string;
  emoji: string;
  tagline: string;
  description: string;
  highlights: string[];
  matchScore: number;
  matchReasons: string[];
  iataCode: string; // ← ADD THIS LINE
}
```

Then at the end of the file add:

```typescript
export interface CheapestFlight {
  departureDate: string;     // YYYY-MM-DD
  returnDate: string;        // YYYY-MM-DD
  pricePerPerson: number;
  total: number;             // all travelers combined
}

export interface FlightOffer {
  id: string;
  departureDate: string;
  returnDate: string;
  pricePerPerson: number;
  total: number;
  outboundDuration: string;      // e.g. "5h 30m"
  inboundDuration: string;
  totalDurationMinutes: number;  // for sorting
  stops: number;                 // 0 = direct
  airline: string;               // IATA carrier code e.g. "LY"
  outboundDeparture: string;     // HH:MM
  outboundArrival: string;
  inboundDeparture: string;
  inboundArrival: string;
  originAirport: string;         // IATA
  destinationAirport: string;    // IATA
}

export interface FlightFilters {
  directOnly: boolean;
  maxStops: number | null;        // null = any
  maxDurationHours: number | null; // null = any
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -30
```

Expected: errors only about `iataCode` missing from object literals in `claude-trips.ts` (will be fixed in Task 6). No other new errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add lib/types.ts && git commit -m "feat: add flight types and iataCode to Destination"
```

---

### Task 2: Create `lib/amadeus.ts`

**Files:**
- Create: `lib/amadeus.ts`

- [ ] **Step 1: Create the file**

Create `/Users/gili.levy/travel-planner/lib/amadeus.ts`:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `lib/amadeus.ts`

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add lib/amadeus.ts && git commit -m "feat: add Amadeus REST wrapper with token caching"
```

---

### Task 3: Create `app/api/flights/resolve-iata/route.ts`

**Files:**
- Create: `app/api/flights/resolve-iata/route.ts`

- [ ] **Step 1: Create the file**

```typescript
import { NextResponse } from 'next/server';
import { resolveIATA } from '@/lib/amadeus';

export async function POST(request: Request) {
  const body = await request.json() as { city?: string };
  if (!body.city) return NextResponse.json({ iata: null });
  const iata = await resolveIATA(body.city);
  return NextResponse.json({ iata });
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add app/api/flights/resolve-iata/route.ts && git commit -m "feat: add /api/flights/resolve-iata route"
```

---

### Task 4: Create `app/api/flights/cheapest/route.ts`

**Files:**
- Create: `app/api/flights/cheapest/route.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add app/api/flights/cheapest/route.ts && git commit -m "feat: add /api/flights/cheapest route"
```

---

### Task 5: Create `app/api/flights/offers/route.ts`

**Files:**
- Create: `app/api/flights/offers/route.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add app/api/flights/offers/route.ts && git commit -m "feat: add /api/flights/offers route"
```

---

### Task 6: Extend `lib/claude-trips.ts` to output `iataCode`

**Files:**
- Modify: `lib/claude-trips.ts`

- [ ] **Step 1: Add `iataCode` to `DestinationSelection` interface**

In `lib/claude-trips.ts`, update the `DestinationSelection` interface (lines 5-17):

```typescript
interface DestinationSelection {
  id: string;
  name: string;
  country: string;
  emoji: string;
  tagline: string;
  description: string;
  highlights: string[];
  matchScore: number;
  matchReasons: string[];
  suggestedDays: number;
  estimatedFlightCost: number;
  iataCode: string; // ← ADD THIS LINE
}
```

- [ ] **Step 2: Add `iataCode` to `SELECTION_SCHEMA`**

Inside `SELECTION_SCHEMA.properties.selections.items.properties`, add after `estimatedFlightCost`:

```typescript
iataCode: {
  type: 'string',
  description: 'IATA airport code for the main gateway airport of this destination, e.g. "CDG" for Paris, "TYO" for Tokyo, "ATH" for Greek Islands. Use the single most relevant airport code.',
},
```

And add `'iataCode'` to the `required` array in `SELECTION_SCHEMA.properties.selections.items`:

```typescript
required: ['id', 'name', 'country', 'emoji', 'tagline', 'description', 'highlights', 'matchScore', 'matchReasons', 'suggestedDays', 'estimatedFlightCost', 'iataCode'],
```

- [ ] **Step 3: Add IATA instruction to the system prompt**

In the `selectDestinations` function's `system` prompt, add this line at the end:

```
iataCode: the single IATA airport code for the main gateway airport of the destination (e.g. CDG for France/Paris, NRT for Japan/Tokyo, ATH for Greece/Greek Islands).
```

- [ ] **Step 4: Forward `iataCode` in `getSuggestedTrips`**

In `getSuggestedTrips`, update the destination mapping inside `trips`:

```typescript
destination: {
  id: s.id,
  name: s.name,
  country: s.country,
  emoji: s.emoji,
  tagline: s.tagline,
  description: s.description,
  highlights: s.highlights,
  matchScore: Math.round(Math.min(100, Math.max(0, s.matchScore))),
  matchReasons: s.matchReasons,
  iataCode: s.iataCode, // ← ADD THIS LINE
},
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add lib/claude-trips.ts && git commit -m "feat: add iataCode to Claude destination selection"
```

---

### Task 7: Update `components/BudgetBreakdown.tsx`

**Files:**
- Modify: `components/BudgetBreakdown.tsx`

- [ ] **Step 1: Add `realFlightCost` prop and use it**

Replace the entire `BudgetBreakdown` component with:

```tsx
'use client';

import { BudgetBreakdown as BudgetType } from '@/lib/types';

interface BudgetBreakdownProps {
  budget: BudgetType;
  userBudget: number;
  travelers: number;
  realFlightCost?: number;
}

const categories = [
  { key: 'flights' as const, label: 'Flights', icon: '✈️', color: 'bg-blue-500' },
  { key: 'accommodation' as const, label: 'Accommodation', icon: '🏨', color: 'bg-purple-500' },
  { key: 'food' as const, label: 'Food & Dining', icon: '🍽️', color: 'bg-amber-500' },
  { key: 'activities' as const, label: 'Activities', icon: '🎯', color: 'bg-teal-500' },
  { key: 'transport' as const, label: 'Local Transport', icon: '🚌', color: 'bg-indigo-500' },
  { key: 'misc' as const, label: 'Miscellaneous', icon: '💼', color: 'bg-gray-400' },
];

export default function BudgetBreakdown({ budget, userBudget, travelers, realFlightCost }: BudgetBreakdownProps) {
  const flightCost = realFlightCost ?? budget.flights;
  const flightDiff = flightCost - budget.flights;
  const total = budget.total + flightDiff;
  const withinBudget = total <= userBudget;
  const difference = Math.abs(userBudget - total);
  const perPerson = Math.round(total / travelers);

  const displayBudget = { ...budget, flights: flightCost, total };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg mb-1">Budget Breakdown</h3>
        <p className="text-sm text-gray-500">Estimated costs for {travelers} traveler{travelers !== 1 ? 's' : ''}</p>
      </div>

      <div className="p-5 space-y-4">
        <div className={`rounded-xl p-4 ${withinBudget ? 'bg-teal-50 border border-teal-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs font-medium text-gray-500">Estimated Total</p>
              <p className="text-2xl font-bold text-gray-900">${total.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-500">Your Budget</p>
              <p className="text-2xl font-bold text-gray-700">${userBudget.toLocaleString()}</p>
            </div>
          </div>
          <div className={`text-sm font-semibold ${withinBudget ? 'text-teal-700' : 'text-orange-700'}`}>
            {withinBudget
              ? `✓ Saves you $${difference.toLocaleString()} under budget`
              : `⚠ $${difference.toLocaleString()} over your budget`}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 rounded-xl bg-gray-50 p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500">Per Person</p>
            <p className="text-lg font-bold text-gray-800">${perPerson.toLocaleString()}</p>
          </div>
          <div className="flex-1 rounded-xl bg-gray-50 p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500">Per Day</p>
            <p className="text-lg font-bold text-gray-800">${Math.round(total / Math.max(displayBudget.total > 0 ? 7 : 1, 1)).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map(cat => {
            const amount = displayBudget[cat.key];
            const pct = Math.round((amount / total) * 100);
            const isRealFlight = cat.key === 'flights' && realFlightCost !== undefined;
            return (
              <div key={cat.key}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                    {isRealFlight && (
                      <span className="text-xs bg-teal-100 text-teal-700 rounded-full px-2 py-0.5 font-medium">real</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-800">${amount.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 ml-1">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 text-center pt-1">
          {realFlightCost !== undefined
            ? '✈ Flight prices from Amadeus. Other costs are estimates.'
            : '* Prices are estimates in USD. Actual costs may vary.'}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add components/BudgetBreakdown.tsx && git commit -m "feat: add realFlightCost prop to BudgetBreakdown"
```

---

### Task 8: Update `components/DestinationCard.tsx` — flight badge

**Files:**
- Modify: `components/DestinationCard.tsx`

- [ ] **Step 1: Add `cheapestFlight` prop and render badge**

Replace the entire file with:

```tsx
'use client';

import { TripPlan, CheapestFlight } from '@/lib/types';

interface DestinationCardProps {
  plan: TripPlan;
  selected: boolean;
  onClick: () => void;
  travelers: number;
  cheapestFlight?: 'loading' | CheapestFlight | null;
}

export default function DestinationCard({ plan, selected, onClick, travelers, cheapestFlight }: DestinationCardProps) {
  const { destination, budget } = plan;
  const perPerson = Math.round(budget.total / travelers);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-5 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl ${
        selected
          ? 'bg-white border-2 border-teal-500 shadow-teal-100 scale-[1.01]'
          : 'bg-white border-2 border-transparent hover:border-teal-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{destination.emoji}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
            <p className="text-sm text-gray-500">{destination.country}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
          destination.matchScore >= 80
            ? 'bg-teal-500 text-white'
            : destination.matchScore >= 60
            ? 'bg-blue-500 text-white'
            : 'bg-gray-400 text-white'
        }`}>
          {destination.matchScore}% match
        </div>
      </div>

      {/* Tagline */}
      <p className="text-sm text-gray-600 italic mb-4 leading-relaxed">{destination.tagline}</p>

      {/* Highlights */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {destination.highlights.map(h => (
          <span key={h} className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {h}
          </span>
        ))}
      </div>

      {/* Match reasons */}
      {destination.matchReasons.length > 0 && (
        <ul className="space-y-1 mb-4">
          {destination.matchReasons.slice(0, 3).map((reason, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
              <span className="text-teal-500 mt-0.5 shrink-0">✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Flight badge */}
      {cheapestFlight === 'loading' && (
        <div className="mb-3 h-7 w-48 rounded-full bg-gray-200 animate-pulse" />
      )}
      {cheapestFlight && cheapestFlight !== 'loading' && (
        <div className="mb-3 inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 text-xs font-medium text-teal-700">
          <span>✈</span>
          <span>From ${cheapestFlight.pricePerPerson.toLocaleString()}/person · {cheapestFlight.departureDate.slice(5).replace('-', '/')}–{cheapestFlight.returnDate.slice(5).replace('-', '/')}</span>
        </div>
      )}

      {/* Budget */}
      <div className={`rounded-xl p-3 ${selected ? 'bg-teal-50' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 font-medium">Est. total ({travelers} traveler{travelers !== 1 ? 's' : ''})</p>
            <p className="text-xl font-bold text-gray-900">${budget.total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Per person</p>
            <p className="text-lg font-semibold text-teal-600">${perPerson.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {selected && (
        <div className="mt-3 flex items-center justify-center gap-2 text-teal-600 text-sm font-semibold">
          <span>▼</span> Viewing full itinerary
        </div>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add components/DestinationCard.tsx && git commit -m "feat: add real flight price badge to DestinationCard"
```

---

### Task 9: Create `components/FlightSection.tsx`

**Files:**
- Create: `components/FlightSection.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client';

import { FlightOffer, FlightFilters } from '@/lib/types';

interface FlightSectionProps {
  offers: FlightOffer[] | 'loading' | null;
  filters: FlightFilters;
  onFiltersChange: (f: FlightFilters) => void;
  selectedOfferId: string | null;
  onSelectOffer: (offer: FlightOffer) => void;
  destinationName: string;
}

const MAX_STOPS_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: 'Any', value: null },
  { label: '1 stop', value: 1 },
  { label: 'Direct', value: 0 },
];

const MAX_DURATION_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: 'Any', value: null },
  { label: '6h', value: 6 },
  { label: '9h', value: 9 },
  { label: '12h', value: 12 },
];

export default function FlightSection({
  offers,
  filters,
  onFiltersChange,
  selectedOfferId,
  onSelectOffer,
  destinationName,
}: FlightSectionProps) {
  const filteredOffers = Array.isArray(offers)
    ? offers.filter(o => {
        if (filters.directOnly && o.stops > 0) return false;
        if (filters.maxStops !== null && o.stops > filters.maxStops) return false;
        if (filters.maxDurationHours !== null && o.totalDurationMinutes > filters.maxDurationHours * 60) return false;
        return true;
      })
    : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg">✈ Flights to {destinationName}</h3>
        <p className="text-xs text-gray-400 mt-0.5">Real prices from Amadeus · sorted by best value</p>
      </div>

      {/* Filter bar */}
      <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center">
        {/* Direct only toggle */}
        <button
          onClick={() => onFiltersChange({ ...filters, directOnly: !filters.directOnly, maxStops: filters.directOnly ? null : null })}
          className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition ${
            filters.directOnly
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
          }`}
        >
          <span className={`w-3 h-3 rounded-full border-2 ${filters.directOnly ? 'bg-white border-white' : 'border-gray-400'}`} />
          Direct only
        </button>

        {/* Max stops */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Stops:</span>
          {MAX_STOPS_OPTIONS.map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => onFiltersChange({ ...filters, maxStops: opt.value, directOnly: opt.value === 0 })}
              className={`text-xs font-medium rounded-full px-2.5 py-1 border transition ${
                filters.maxStops === opt.value && !filters.directOnly
                  ? 'bg-teal-600 text-white border-teal-600'
                  : opt.value === 0 && filters.directOnly
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Max duration */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Max flight:</span>
          {MAX_DURATION_OPTIONS.map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => onFiltersChange({ ...filters, maxDurationHours: opt.value })}
              className={`text-xs font-medium rounded-full px-2.5 py-1 border transition ${
                filters.maxDurationHours === opt.value
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {/* Loading */}
        {offers === 'loading' && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* No Amadeus results */}
        {offers === null && (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm mb-3">No flight data available for this route.</p>
            <a
              href={`https://www.google.com/travel/flights`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium underline"
            >
              Search on Google Flights →
            </a>
          </div>
        )}

        {/* Filter zero results */}
        {Array.isArray(offers) && offers.length > 0 && filteredOffers.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-6">
            No flights match your filters — try relaxing them.
          </p>
        )}

        {/* Offer cards */}
        {filteredOffers.length > 0 && (
          <div className="space-y-2">
            {filteredOffers.map(offer => (
              <button
                key={offer.id}
                onClick={() => onSelectOffer(offer)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  selectedOfferId === offer.id
                    ? 'border-teal-500 bg-teal-50 shadow-sm'
                    : 'border-gray-100 hover:border-teal-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Outbound */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <span>{offer.outboundDeparture}</span>
                      <span className="text-gray-400">→</span>
                      <span>{offer.outboundArrival}</span>
                      <span className="text-xs text-gray-400 font-normal">{offer.originAirport}–{offer.destinationAirport}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{offer.airline}</span>
                      <span>·</span>
                      <span>{offer.outboundDuration}</span>
                      <span>·</span>
                      {offer.stops === 0
                        ? <span className="text-teal-600 font-medium">Direct</span>
                        : <span>{offer.stops} stop{offer.stops > 1 ? 's' : ''}</span>
                      }
                    </div>
                  </div>

                  {/* Return */}
                  <div className="hidden sm:block min-w-0 text-right">
                    <div className="text-xs text-gray-400">{offer.departureDate.slice(5)} → {offer.returnDate.slice(5)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Return: {offer.inboundDuration}</div>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-gray-900">${offer.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">${offer.pricePerPerson.toLocaleString()}/person</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add components/FlightSection.tsx && git commit -m "feat: add FlightSection component with offer cards and filters"
```

---

### Task 10: Update `app/results/ResultsContent.tsx` — orchestration

**Files:**
- Modify: `app/results/ResultsContent.tsx`

- [ ] **Step 1: Replace the file with the full orchestrated version**

Replace the entire `app/results/ResultsContent.tsx`:

```tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TripRequest, TripPlan, CheapestFlight, FlightOffer, FlightFilters } from '@/lib/types';
import DestinationCard from '@/components/DestinationCard';
import ItineraryView from '@/components/ItineraryView';
import AuthButton from '@/components/AuthButton';
import SaveTripButton from '@/components/SaveTripButton';
import FlightSection from '@/components/FlightSection';

interface ResultsContentProps {
  request: TripRequest;
  trips: TripPlan[];
  hideSaveButton?: boolean;
}

const PREF_LABELS: Record<string, string> = {
  food: 'Food', nature: 'Nature', culture: 'Culture', history: 'History',
  beach: 'Beach', adventure: 'Adventure', shopping: 'Shopping', relaxation: 'Relaxation',
};

type CheapestState = 'loading' | CheapestFlight | null;

export default function ResultsContent({ request, trips, hideSaveButton }: ResultsContentProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [originIATA, setOriginIATA] = useState<string | null | undefined>(undefined);
  const [cheapestFlights, setCheapestFlights] = useState<CheapestState[]>(
    () => new Array(trips.length).fill('loading')
  );
  const [flightOffers, setFlightOffers] = useState<FlightOffer[] | 'loading' | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<FlightOffer | null>(null);
  const [flightFilters, setFlightFilters] = useState<FlightFilters>({
    directOnly: false,
    maxStops: null,
    maxDurationHours: null,
  });

  const selectedPlan = trips[selectedIndex];
  const selectedCheapest = cheapestFlights[selectedIndex];

  // Effect 1: resolve origin IATA once
  useEffect(() => {
    fetch('/api/flights/resolve-iata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: request.origin }),
    })
      .then(r => r.json())
      .then(({ iata }: { iata: string | null }) => setOriginIATA(iata))
      .catch(() => setOriginIATA(null));
  }, [request.origin]);

  // Effect 2: fetch cheapest flights for all destinations once origin IATA resolves
  useEffect(() => {
    if (!originIATA) return;
    trips.forEach((plan, i) => {
      const destIATA = plan.destination.iataCode;
      if (!destIATA) {
        setCheapestFlights(prev => { const n = [...prev]; n[i] = null; return n; });
        return;
      }
      fetch('/api/flights/cheapest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originIATA,
          destinationIATA: destIATA,
          month: request.month,
          duration: plan.itinerary.length,
          travelers: request.travelers,
        }),
      })
        .then(r => r.json())
        .then(({ flight }: { flight: CheapestFlight | null }) => {
          setCheapestFlights(prev => { const n = [...prev]; n[i] = flight; return n; });
        })
        .catch(() => {
          setCheapestFlights(prev => { const n = [...prev]; n[i] = null; return n; });
        });
    });
  }, [originIATA]);

  // Effect 3: fetch offers when selected destination + cheapest dates are ready
  useEffect(() => {
    if (!originIATA || !selectedCheapest || selectedCheapest === 'loading') {
      if (selectedCheapest === null) setFlightOffers(null);
      return;
    }
    const destIATA = selectedPlan.destination.iataCode;
    if (!destIATA) { setFlightOffers(null); return; }

    setFlightOffers('loading');
    setSelectedOffer(null);

    fetch('/api/flights/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originIATA,
        destinationIATA: destIATA,
        departureDate: selectedCheapest.departureDate,
        returnDate: selectedCheapest.returnDate,
        travelers: request.travelers,
      }),
    })
      .then(r => r.json())
      .then(({ offers }: { offers: FlightOffer[] }) => {
        setFlightOffers(offers);
        if (offers.length > 0) setSelectedOffer(offers[0]);
      })
      .catch(() => setFlightOffers(null));
  }, [selectedIndex, selectedCheapest, originIATA]);

  const handleSelectIndex = (i: number) => {
    setSelectedIndex(i);
    setFlightFilters({ directOnly: false, maxStops: null, maxDurationHours: null });
  };

  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No matching destinations found</h2>
          <p className="text-gray-500 mb-6">
            We could not find trips matching your budget of ${request.budget.toLocaleString()}.
            Try adjusting your budget or preferences.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition">
            ← Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition font-medium text-sm">
            <span>←</span>
            <span className="hidden sm:inline">Back to Planner</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="text-xl">✈</span>
            <span>TripAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/saved" className="text-xs text-gray-500 hover:text-teal-600 transition hidden sm:inline">
              My Trips
            </Link>
            <AuthButton />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Parsed summary card */}
        <div className="bg-gradient-to-r from-blue-900 to-teal-800 rounded-2xl p-5 text-white mb-8 shadow-lg">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-blue-300 font-medium uppercase tracking-wider mb-2">Your Trip Request</p>
              <p className="text-blue-100 text-sm italic mb-3 max-w-lg opacity-80">
                &ldquo;{request.rawInput}&rdquo;
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                  <span>📅</span>
                  <span>Up to {request.duration} days · {request.month}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                  <span>🛫</span>
                  <span>From {request.origin}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                  <span>👥</span>
                  <span>{request.travelers === 1 ? 'Solo' : request.travelers === 2 ? 'Couple' : `${request.travelers} travelers`}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                  <span>💰</span>
                  <span>Budget: ${request.budget.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <p className="text-xs text-blue-300 font-medium uppercase tracking-wider mb-2">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {request.preferences.map(p => (
                  <span key={p} className="bg-teal-500/40 border border-teal-400/30 rounded-full px-2.5 py-1 text-xs font-medium text-teal-100">
                    {PREF_LABELS[p] ?? p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Destination cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {trips.length} Destinations Matched
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trips.map((plan, i) => (
              <DestinationCard
                key={plan.destination.id}
                plan={plan}
                selected={selectedIndex === i}
                onClick={() => handleSelectIndex(i)}
                travelers={request.travelers}
                cheapestFlight={cheapestFlights[i]}
              />
            ))}
          </div>
        </div>

        {/* Selected destination itinerary */}
        {selectedPlan && (
          <>
            {/* Flight section — show only once cheapest has resolved (not still loading) */}
            {originIATA && selectedCheapest !== 'loading' && (
              <FlightSection
                offers={flightOffers}
                filters={flightFilters}
                onFiltersChange={setFlightFilters}
                selectedOfferId={selectedOffer?.id ?? null}
                onSelectOffer={setSelectedOffer}
                destinationName={selectedPlan.destination.name}
              />
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedPlan.destination.emoji} {selectedPlan.destination.name} Itinerary
              </h2>
              {!hideSaveButton && <SaveTripButton request={request} plan={selectedPlan} />}
            </div>
            <ItineraryView
              plan={selectedPlan}
              travelers={request.travelers}
              userBudget={request.budget}
              realFlightCost={selectedOffer?.total}
            />
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -30
```

Expected: errors only about `realFlightCost` on `ItineraryView` (fixed in Task 11). No other new errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add app/results/ResultsContent.tsx && git commit -m "feat: orchestrate flight fetching in ResultsContent"
```

---

### Task 11: Update `components/ItineraryView.tsx` — forward `realFlightCost`

**Files:**
- Modify: `components/ItineraryView.tsx`

- [ ] **Step 1: Add `realFlightCost` prop and forward to BudgetBreakdown**

Replace `components/ItineraryView.tsx`:

```tsx
'use client';

import { TripPlan } from '@/lib/types';
import DayCard from './DayCard';
import BudgetBreakdown from './BudgetBreakdown';

interface ItineraryViewProps {
  plan: TripPlan;
  travelers: number;
  userBudget: number;
  realFlightCost?: number;
}

export default function ItineraryView({ plan, travelers, userBudget, realFlightCost }: ItineraryViewProps) {
  const { destination, itinerary, budget } = plan;

  return (
    <div className="mt-8 animate-fadeIn">
      {/* Destination Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-teal-700 p-6 text-white mb-6 shadow-xl">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-5xl">{destination.emoji}</span>
          <div>
            <h2 className="text-3xl font-bold">{destination.name}</h2>
            <p className="text-blue-200 text-lg">{destination.country}</p>
          </div>
          <div className="ml-auto">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-blue-200 font-medium">Match Score</p>
              <p className="text-2xl font-bold">{destination.matchScore}%</p>
            </div>
          </div>
        </div>
        <p className="text-blue-100 leading-relaxed">{destination.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {destination.matchReasons.map((reason, i) => (
            <span key={i} className="text-xs bg-white/15 rounded-full px-3 py-1 text-blue-50">
              ✓ {reason}
            </span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-gray-900 text-xl mb-4">{itinerary.length}-Day Itinerary</h3>
          {itinerary.map(day => (
            <DayCard key={day.day} day={day} travelers={travelers} />
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <BudgetBreakdown
              budget={budget}
              userBudget={userBudget}
              travelers={travelers}
              realFlightCost={realFlightCost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify full TypeScript build**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -30
```

Expected: **zero errors**

- [ ] **Step 3: Verify production build**

```bash
cd /Users/gili.levy/travel-planner && npm run build 2>&1 | tail -20
```

Expected: build succeeds, routes listed include `/api/flights/cheapest`, `/api/flights/offers`, `/api/flights/resolve-iata`

- [ ] **Step 4: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add components/ItineraryView.tsx && git commit -m "feat: forward realFlightCost from ItineraryView to BudgetBreakdown"
```

---

### Task 12: Update `.env.local.example`

**Files:**
- Modify: `.env.local.example`

- [ ] **Step 1: Add Amadeus keys**

Append to `.env.local.example`:

```
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
```

- [ ] **Step 2: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add .env.local.example && git commit -m "docs: add Amadeus env vars to example"
```

---

## Manual Test Checklist

Run `npm run dev`, add Amadeus credentials to `.env.local`, then verify:

- [ ] Plan a trip — destination cards show grey shimmer on flight badge while loading
- [ ] Cards update with real price + dates badge (e.g. `✈ From $342/person · 08/05–08/12`)
- [ ] Click a destination — FlightSection appears above itinerary with real flight offers
- [ ] Flight offer cards show outbound times, airline, duration, stops, total price
- [ ] Selecting a flight highlights it with teal border
- [ ] Budget breakdown updates flights row with `real` badge and recalculates total
- [ ] "Direct only" filter hides flights with stops
- [ ] Max stops / max duration pills filter correctly
- [ ] Zero results message appears when filters are too restrictive
- [ ] With invalid Amadeus keys: app still works, AI estimate shown, no errors thrown
