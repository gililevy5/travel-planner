import { anthropic } from './claude';
import { TripRequest } from './types';

const TRIP_REQUEST_SCHEMA = {
  type: 'object',
  properties: {
    budget: {
      type: 'number',
      description: 'Total trip budget in USD (extract number only)',
    },
    duration: {
      type: 'number',
      description: 'Trip duration in days',
    },
    month: {
      type: 'string',
      description: 'Month of travel as full English name (e.g. "August")',
    },
    travelers: {
      type: 'number',
      description: 'Number of travelers (1 = solo, 2 = couple, etc.)',
    },
    preferences: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['food', 'nature', 'culture', 'history', 'beach', 'adventure', 'shopping', 'relaxation'],
      },
      description: 'List of travel interests extracted from the request',
    },
    origin: {
      type: 'string',
      description: 'Departure city or country (e.g. "Tel Aviv", "London", "New York"). Default to "Israel" if not mentioned.',
    },
  },
  required: ['budget', 'duration', 'month', 'travelers', 'preferences', 'origin'],
  additionalProperties: false,
};

export async function parseRequest(rawInput: string): Promise<TripRequest> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    output_config: {
      format: {
        type: 'json_schema',
        schema: TRIP_REQUEST_SCHEMA,
      },
    },
    system: `You are a travel request parser. Extract structured trip information from user input.
The user may write in English, Hebrew, or a mix of both.

Budget currency conversion — always output budget in USD:
- $ or "dollars" → USD, use as-is
- ₪ or "שקל" or "שקלים" or "NIS" → multiply by 0.27 to convert to USD
- € or "euros" → multiply by 1.08
- £ or "pounds" → multiply by 1.27
- Round the converted amount to the nearest 100

Duration extraction rules:
- "up to N days" or "at most N days" or "maximum N days" → use N
- "about N days" or "around N days" → use N
- A range like "10-14 days" → use the higher number (14)
- If no duration mentioned, default to 7

Origin extraction rules:
- Look for phrases like "from Tel Aviv", "flying from", "departing from", "I'm in", "I live in", "מישראל", "מתל אביב"
- If not mentioned, default to "Israel"

Defaults when information is missing:
- budget: 3000
- duration: 7
- month: "August"
- travelers: 2
- preferences: ["culture", "food"]

For preferences, map interests to these categories only:
food, nature, culture, history, beach, adventure, shopping, relaxation

Hebrew hints: אוכל=food, טבע=nature, תרבות=culture, היסטוריה=history, חוף=beach, הרפתקה=adventure, קניות=shopping, מנוחה=relaxation`,
    messages: [{ role: 'user', content: rawInput }],
  });

  const text = response.content.find(b => b.type === 'text');
  if (!text || text.type !== 'text') {
    throw new Error('No text response from Claude parser');
  }

  const parsed = JSON.parse(text.text) as Omit<TripRequest, 'rawInput'>;

  return {
    ...parsed,
    preferences: parsed.preferences.length > 0 ? parsed.preferences : ['culture', 'food'],
    origin: parsed.origin || 'Israel',
    rawInput,
  };
}
