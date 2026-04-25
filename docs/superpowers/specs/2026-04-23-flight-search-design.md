# Real Flight Search Integration — Design Spec

**Date:** 2026-04-23
**Status:** Approved

## Problem

Flight costs in TripAI are entirely AI-estimated — no real prices, no real dates, no real availability. The value proposition of this feature is that TripAI scans the user's entire travel month to find the **best departure + return dates** (lowest price, shortest duration) — something no manual search site does automatically.

## Goal

Integrate Amadeus flight APIs to:
1. Show real cheapest flight price + best dates on each destination card
2. Show full flight offer list (with filters) above the itinerary when a destination is selected
3. Update the budget breakdown with the real selected flight cost

## Approach: Progressive Enhancement

Destination cards render immediately with AI-estimated prices. Amadeus data loads in parallel and swaps in. If Amadeus fails at any point, the app silently falls back to AI estimates — it always shows something.

## Architecture

### Two server-side API routes

**`POST /api/flights/cheapest`**
- Input: `{ originIATA, destinationIATA, month, year, travelers }`
- Calls: Amadeus `GET /v1/shopping/flight-dates?origin=&destination=&departureDate=YYYY-MM`
- Returns: `{ departureDate, returnDate, pricePerPerson, total }` for the cheapest window matching trip duration
- Fallback: returns `null` on any error

**`POST /api/flights/offers`**
- Input: `{ originIATA, destinationIATA, departureDate, returnDate, travelers }`
- Calls: Amadeus `GET /v2/shopping/flight-offers?...&max=15`
- Returns: array of `FlightOffer` sorted by weighted score (60% price, 40% duration)
- Fallback: returns `[]` on any error

### IATA Resolution

- **Destinations:** Claude's destination selection prompt is extended to output `iataCode` (e.g. `"TYO"`) per destination
- **Origin:** Resolved once via Amadeus `GET /v1/reference-data/locations?keyword={origin}&subType=AIRPORT,CITY` and cached in component state for the session
- **Fallback:** If origin can't be resolved, skip all flight fetches silently

### Amadeus SDK wrapper: `lib/amadeus.ts`

Three exported functions:
- `resolveIATA(cityName: string): Promise<string | null>`
- `getCheapestDates(params): Promise<CheapestFlight | null>`
- `getFlightOffers(params): Promise<FlightOffer[]>`

Amadeus OAuth2 token is fetched and cached server-side (expires in 1799s).

## New Types (`lib/types.ts`)

```typescript
interface CheapestFlight {
  departureDate: string;  // YYYY-MM-DD
  returnDate: string;     // YYYY-MM-DD
  pricePerPerson: number;
  total: number;          // all travelers
}

interface FlightOffer {
  id: string;
  departureDate: string;
  returnDate: string;
  pricePerPerson: number;
  total: number;
  outboundDuration: string;   // e.g. "5h 30m"
  inboundDuration: string;
  totalDuration: string;      // outbound + inbound combined
  stops: number;              // 0 = direct
  airline: string;
  outboundDeparture: string;  // HH:MM
  outboundArrival: string;
  inboundDeparture: string;
  inboundArrival: string;
  originAirport: string;      // IATA
  destinationAirport: string; // IATA
}

interface FlightFilters {
  directOnly: boolean;
  maxStops: number | null;    // null = any
  maxDurationHours: number | null;
}
```

`Destination` gains `iataCode: string` field.

## File Changes

| File | Change |
|---|---|
| `lib/types.ts` | Add `FlightOffer`, `CheapestFlight`, `FlightFilters`; add `iataCode` to `Destination` |
| `lib/amadeus.ts` | **New** — Amadeus SDK wrapper with token caching |
| `lib/claude-trips.ts` | Extend destination schema + prompt to output `iataCode` |
| `app/api/flights/cheapest/route.ts` | **New** — server route |
| `app/api/flights/offers/route.ts` | **New** — server route |
| `components/DestinationCard.tsx` | Real flight price badge with shimmer |
| `components/FlightSection.tsx` | **New** — offers list + filters |
| `components/ItineraryView.tsx` | Add FlightSection; pass selected flight price to BudgetBreakdown |
| `components/BudgetBreakdown.tsx` | Accept `realFlightCost?: number`; use over AI estimate when present |
| `.env.local.example` | Add `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET` |

## UI

### Destination card flight badge
- **Loading:** grey shimmer pill
- **Loaded:** `✈ From $342 · Mar 3–10` in teal
- **Failed:** shows AI estimate, no visual difference to user

### FlightSection (above itinerary)
- **Loading:** skeleton card
- **Loaded:** filter bar + up to 15 offer cards, best option pre-selected

### Filter bar
| Filter | Control |
|---|---|
| Direct only | Toggle switch |
| Max stops | Pill selector: Any / 1 / Direct |
| Max duration | Pill selector: Any / 6h / 9h / 12h |

Filters apply client-side instantly. Zero results → "No flights match — try relaxing your filters."

### Flight offer card
- Left: departure + arrival times, airports, airline
- Center: duration + stops (or "Direct" badge)
- Right: total price + "Select" button
- Selected: teal border highlight

### Budget impact
Selecting a flight updates the Flights row in BudgetBreakdown and recalculates total live.

## Error Handling

| Case | Handling |
|---|---|
| Amadeus auth failure | Silent fallback to AI estimate |
| No flights found | Badge: "Flights unavailable"; FlightSection: Google Flights deep-link fallback |
| Origin IATA unresolvable | Skip all flight fetches; AI estimates used throughout |
| Active filters → zero results | "No flights match — try relaxing your filters" |
| Amadeus rate limit (429) | Silent fallback to AI estimate |

## Environment Variables

```
AMADEUS_CLIENT_ID=your_client_id
AMADEUS_CLIENT_SECRET=your_client_secret
```

Obtain from: https://developers.amadeus.com (free test account, 2,000 calls/month)

## Out of Scope

- One-way flights
- Multi-city routing
- Seat class selection (always economy)
- Booking / redirect to airline
- Caching flight results in Firestore
