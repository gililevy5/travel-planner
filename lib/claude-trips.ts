import { anthropic } from './claude';
import { TripRequest, TripPlan, DayPlan, BudgetBreakdown } from './types';

// ─── Phase 1: Destination selection ──────────────────────────────────────────

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
  estimatedFlightCost: number; // round-trip per person in USD
  iataCode: string;
}

const SELECTION_SCHEMA = {
  type: 'object',
  properties: {
    selections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique kebab-case id, e.g. "greek-islands" or "kyoto"' },
          name: { type: 'string', description: 'Destination name — can be a city, region, island group, or country' },
          country: { type: 'string' },
          emoji: { type: 'string', description: 'Single emoji representing the destination' },
          tagline: { type: 'string', description: 'One evocative sentence' },
          description: { type: 'string', description: '2–3 sentences on what makes this destination special' },
          highlights: {
            type: 'array',
            items: { type: 'string' },
            description: '4–6 top highlights or attractions',
          },
          matchScore: { type: 'number', description: 'Match score 0–100' },
          matchReasons: {
            type: 'array',
            items: { type: 'string' },
            description: '2–4 concise reasons this fits the traveler request',
          },
          suggestedDays: {
            type: 'number',
            description: 'Ideal number of days, capped at the traveler\'s maximum duration',
          },
          estimatedFlightCost: {
            type: 'number',
            description: 'Round-trip flight cost per person in USD from the traveler\'s origin',
          },
          iataCode: {
            type: 'string',
            description: 'IATA airport code for the main gateway airport of this destination, e.g. "CDG" for Paris, "TYO" for Tokyo, "ATH" for Greek Islands. Use the single most relevant airport code.',
          },
        },
        required: ['id', 'name', 'country', 'emoji', 'tagline', 'description', 'highlights', 'matchScore', 'matchReasons', 'suggestedDays', 'estimatedFlightCost', 'iataCode'],
        additionalProperties: false,
      },
    },
  },
  required: ['selections'],
  additionalProperties: false,
};

async function selectDestinations(request: TripRequest): Promise<DestinationSelection[]> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    output_config: {
      format: { type: 'json_schema', schema: SELECTION_SCHEMA },
    },
    system: `You are an expert travel advisor. Given a traveler's request, suggest the best 1–3 destinations worldwide. You are not limited to any catalog — recommend any destination that genuinely fits the traveler's needs. Always return at least 1 match.

Think beyond single cities: suggest countries, regions, island groups, or multi-city routes when that better fits the request (e.g. "Japan" for a culture-seeker, "Greek Islands" for a beach honeymoon, "Patagonia" for adventure).

Scoring guidelines (0–100):
- Budget fit (40 pts): Does the estimated total trip cost (flights × travelers + other costs) fit within the traveler's budget? Be generous — within ±50% still earns partial credit.
- Preference match (50 pts): How many of the traveler's interests does this destination cover?
- Seasonal fit (10 pts): Is the travel month ideal for this destination?

suggestedDays: ideal days to truly experience the destination, capped at the traveler's maximum. Factor in flight duration from origin — long-haul destinations warrant more days to be worthwhile.

estimatedFlightCost: realistic round-trip cost per person in USD from the traveler's origin city.
iataCode: the single IATA airport code for the main gateway airport of the destination (e.g. CDG for France/Paris, NRT for Japan/Tokyo, ATH for Greece/Greek Islands).`,
    messages: [{
      role: 'user',
      content: `Traveler request:
- Origin: ${request.origin}
- Budget: $${request.budget.toLocaleString()} total for ${request.travelers} traveler${request.travelers > 1 ? 's' : ''}
- Maximum duration: ${request.duration} days
- Month: ${request.month}
- Travelers: ${request.travelers === 1 ? 'solo' : request.travelers === 2 ? 'couple' : `group of ${request.travelers}`}
- Interests: ${request.preferences.join(', ')}
- Raw input: "${request.rawInput}"

Suggest the best 1–3 destinations worldwide.`,
    }],
  });

  const text = response.content.find(b => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('No response from Claude destination selector');
  const { selections } = JSON.parse(text.text) as { selections: DestinationSelection[] };
  console.log('[claude-trips] selections:', JSON.stringify(selections.map(s => ({ id: s.id, name: s.name, days: s.suggestedDays, flight: s.estimatedFlightCost })), null, 2));
  return selections;
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

export async function getSuggestedTrips(request: TripRequest): Promise<TripPlan[]> {
  const selections = await selectDestinations(request);

  const trips = await Promise.all(
    selections.map(async (s): Promise<TripPlan> => {
      const { itinerary, budget } = await generatePlan(s, request);
      return {
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
          iataCode: s.iataCode,
        },
        itinerary,
        budget,
      };
    }),
  );

  return trips;
}
