import { anthropic } from './claude';
import { TripRequest, TripPlan, DayPlan, BudgetBreakdown } from './types';

// ─── Phase 1: Destination selection ──────────────────────────────────────────

export interface DestinationSelection {
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
  estimatedFlightCost: number; // round-trip per person in USD
  iataCode: string;
}

const PARSE_AND_SELECT_SCHEMA = {
  type: 'object',
  properties: {
    request: {
      type: 'object',
      properties: {
        budget: { type: 'number', description: 'Total budget in USD' },
        duration: { type: 'number', description: 'Max trip duration in days' },
        month: { type: 'string', description: 'Month of travel, full English name e.g. "August"' },
        travelers: { type: 'number', description: 'Number of travelers' },
        preferences: {
          type: 'array',
          items: { type: 'string', enum: ['food', 'nature', 'culture', 'history', 'beach', 'adventure', 'shopping', 'relaxation'] },
        },
        origin: { type: 'string', description: 'Departure city or country, e.g. "Tel Aviv"' },
        originIATA: { type: 'string', description: 'IATA airport code for the origin, e.g. "TLV" for Tel Aviv, "LHR" for London, "JFK" for New York' },
      },
      required: ['budget', 'duration', 'month', 'travelers', 'preferences', 'origin', 'originIATA'],
      additionalProperties: false,
    },
    selections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique kebab-case id' },
          name: { type: 'string', description: 'Destination name — city, region, island group, or country' },
          country: { type: 'string' },
          emoji: { type: 'string', description: 'Single emoji' },
          tagline: { type: 'string', description: 'One short evocative sentence, max 10 words' },
          description: { type: 'string', description: '1–2 sentences max' },
          highlights: { type: 'array', items: { type: 'string' }, description: 'Exactly 3 top highlights, 2–3 words each' },
          matchScore: { type: 'number', description: 'Match score 0–100' },
          matchReasons: { type: 'array', items: { type: 'string' }, description: 'Exactly 2 reasons, one short phrase each' },
          suggestedDays: { type: 'number', description: 'Ideal days, capped at max duration' },
          estimatedFlightCost: { type: 'number', description: 'Round-trip per person in USD' },
          iataCode: { type: 'string', description: 'IATA gateway airport code, e.g. CDG, NRT, ATH' },
        },
        required: ['id', 'name', 'country', 'emoji', 'tagline', 'description', 'highlights', 'matchScore', 'matchReasons', 'suggestedDays', 'estimatedFlightCost', 'iataCode'],
        additionalProperties: false,
      },
    },
  },
  required: ['request', 'selections'],
  additionalProperties: false,
};

export async function parseAndSelectDestinations(rawInput: string): Promise<{ request: TripRequest; selections: DestinationSelection[] }> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    output_config: {
      format: { type: 'json_schema', schema: PARSE_AND_SELECT_SCHEMA },
    },
    system: `You are a travel planning assistant. Given a free-text trip request (English or Hebrew), do two things in one pass:

1. PARSE the request into structured fields:
   - budget: total in USD (convert ₪×0.27, €×1.08, £×1.27; round to nearest 100; default 3000)
   - duration: days (default 7)
   - month: full English month name (default "August")
   - travelers: count (default 2)
   - preferences: subset of [food, nature, culture, history, beach, adventure, shopping, relaxation]
   - origin: departure city/country (look for "from X", "flying from", "מישראל"; default "Israel")
   - originIATA: IATA airport code for origin (e.g. TLV for Israel/Tel Aviv, LHR for London, JFK for New York, CDG for Paris)

2. SELECT the best 1–3 destinations worldwide that match the parsed request. Think beyond single cities — suggest regions, island groups, or countries when fitting.

Scoring (0–100): budget fit 40pts, preference match 50pts, seasonal fit 10pts.
suggestedDays: capped at parsed duration. estimatedFlightCost: round-trip per person in USD from origin.
iataCode: single IATA code for the main gateway airport.`,
    messages: [{ role: 'user', content: rawInput }],
  });

  const text = response.content.find(b => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('No response from Claude');
  const data = JSON.parse(text.text) as { request: Omit<TripRequest, 'rawInput'>; selections: DestinationSelection[] };
  return {
    request: { ...data.request, rawInput },
    selections: data.selections,
  };
}

// ─── Phase 2: Itinerary + budget generation ───────────────────────────────────

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    itinerary: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'number' },
          title: { type: 'string', description: 'Evocative day title' },
          location: { type: 'string', description: 'Primary location for the day' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'string', description: 'HH:MM format, e.g. "09:00"' },
                name: { type: 'string' },
                description: { type: 'string', description: 'One sentence description' },
                cost: { type: 'number', description: 'Cost per person in USD' },
                type: {
                  type: 'string',
                  enum: ['food', 'nature', 'culture', 'transport', 'accommodation', 'leisure', 'adventure'],
                },
                duration: { type: 'string', description: 'e.g. "2 hours"' },
              },
              required: ['time', 'name', 'description', 'cost', 'type', 'duration'],
              additionalProperties: false,
            },
          },
        },
        required: ['day', 'title', 'location', 'activities'],
        additionalProperties: false,
      },
    },
    budget: {
      type: 'object',
      properties: {
        flights: { type: 'number', description: 'Total round-trip flights for ALL travelers in USD' },
        accommodation: { type: 'number', description: 'Total accommodation for all travelers, full trip, in USD' },
        food: { type: 'number', description: 'Total food for all travelers, full trip, in USD' },
        activities: { type: 'number', description: 'Total activities for all travelers in USD' },
        transport: { type: 'number', description: 'Total local transport in USD' },
        misc: { type: 'number', description: 'Miscellaneous expenses in USD' },
        total: { type: 'number', description: 'Sum of all categories in USD' },
        currency: { type: 'string', description: 'Always "USD"' },
      },
      required: ['flights', 'accommodation', 'food', 'activities', 'transport', 'misc', 'total', 'currency'],
      additionalProperties: false,
    },
  },
  required: ['itinerary', 'budget'],
  additionalProperties: false,
};

// Cap generated days to keep output within token limits; longer trips are scaled by cycling.
const MAX_GENERATED_DAYS = 7;

async function generatePlan(
  selection: DestinationSelection,
  request: TripRequest,
): Promise<{ itinerary: DayPlan[]; budget: BudgetBreakdown }> {
  const totalFlights = Math.round(selection.estimatedFlightCost * request.travelers);
  const daysToGenerate = Math.min(selection.suggestedDays, MAX_GENERATED_DAYS);

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    output_config: {
      format: { type: 'json_schema', schema: PLAN_SCHEMA },
    },
    system: `You are an expert travel planner. Generate a realistic day-by-day itinerary and budget breakdown for a trip.

Itinerary guidelines:
- Exactly 3 activities per day (morning, midday, evening)
- Day 1: include hotel check-in as the first activity; last day: check-out
- Use real, named places, restaurants, and attractions
- Keep activity descriptions to one short sentence
- Activity costs are per person in USD

Budget guidelines:
- All totals are in USD for ALL travelers combined for the FULL trip duration (not just the sample days)
- Use the exact flight cost provided
- Ensure total = flights + accommodation + food + activities + transport + misc`,
    messages: [{
      role: 'user',
      content: `Generate a ${daysToGenerate}-day sample itinerary and budget for a ${selection.suggestedDays}-day trip to:

Destination: ${selection.name}, ${selection.country}
Travelers: ${request.travelers} (${request.travelers === 1 ? 'solo' : request.travelers === 2 ? 'couple' : `group of ${request.travelers}`})
Month: ${request.month}
Interests: ${request.preferences.join(', ')}
Total flight cost (all travelers, round-trip): $${totalFlights}
Total budget: $${request.budget.toLocaleString()}`,
    }],
  });

  const text = response.content.find(b => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error(`No response from Claude plan generator for ${selection.name}`);
  const { itinerary, budget } = JSON.parse(text.text) as { itinerary: DayPlan[]; budget: BudgetBreakdown };

  return {
    itinerary: scaleItinerary(itinerary, selection.suggestedDays),
    budget,
  };
}

function scaleItinerary(base: DayPlan[], targetDays: number): DayPlan[] {
  if (targetDays <= base.length) return base.slice(0, targetDays);
  const result: DayPlan[] = [];
  for (let i = 0; i < targetDays; i++) {
    result.push({ ...base[i % base.length], day: i + 1 });
  }
  return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

function selectionToDestination(s: DestinationSelection) {
  return {
    id: s.id,
    name: s.name,
    country: s.country,
    emoji: s.emoji,
    tagline: s.tagline,
    description: s.description,
    highlights: s.highlights,
    matchScore: Math.round(Math.min(100, Math.max(0, s.matchScore))),
    matchReasons: s.matchReasons,
    iataCode: s.iataCode,
  };
}

export async function getPlanForSelection(
  selection: DestinationSelection,
  request: TripRequest,
): Promise<TripPlan> {
  const { itinerary, budget } = await generatePlan(selection, request);
  return {
    destination: selectionToDestination(selection),
    itinerary,
    budget,
  };
}

export async function getSuggestedTrips(rawInput: string): Promise<TripPlan[]> {
  const { request, selections } = await parseAndSelectDestinations(rawInput);
  return Promise.all(selections.map(s => getPlanForSelection(s, request)));
}
