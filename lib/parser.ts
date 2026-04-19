import { TripRequest } from './types';

const MONTH_MAP: Record<string, string> = {
  january: 'January', jan: 'January',
  february: 'February', feb: 'February',
  march: 'March', mar: 'March',
  april: 'April', apr: 'April',
  may: 'May',
  june: 'June', jun: 'June',
  july: 'July', jul: 'July',
  august: 'August', aug: 'August',
  september: 'September', sep: 'September', sept: 'September',
  october: 'October', oct: 'October',
  november: 'November', nov: 'November',
  december: 'December', dec: 'December',
  // seasons
  summer: 'July',
  winter: 'January',
  spring: 'April',
  fall: 'October',
  autumn: 'October',
};

const PREFERENCE_KEYWORDS: Record<string, string[]> = {
  food: ['food', 'cuisine', 'dining', 'eat', 'restaurant', 'culinary', 'אוכל', 'מסעדות', 'אכילה'],
  nature: ['nature', 'natural', 'outdoor', 'hiking', 'wildlife', 'forest', 'mountain', 'park', 'טבע', 'טיולים', 'הרים'],
  culture: ['culture', 'cultural', 'history', 'historic', 'museum', 'art', 'architecture', 'heritage', 'תרבות', 'היסטוריה', 'מוזיאון'],
  beach: ['beach', 'ocean', 'sea', 'coast', 'snorkel', 'diving', 'island', 'חוף', 'ים', 'שחייה'],
  adventure: ['adventure', 'thrill', 'extreme', 'zip line', 'rafting', 'climbing', 'הרפתקה', 'ספורט אתגרי'],
  history: ['history', 'historic', 'ancient', 'ruins', 'monument', 'temple', 'castle', 'היסטוריה', 'עתיקות', 'מקדש'],
  shopping: ['shopping', 'market', 'bazaar', 'mall', 'קניות', 'שוק', 'בזאר'],
  relaxation: ['relax', 'spa', 'wellness', 'peaceful', 'calm', 'leisure', 'מנוחה', 'ספא', 'שלווה'],
};

export function parseRequest(input: string): TripRequest {
  const lower = input.toLowerCase();

  // Parse budget
  let budget = 3000; // default
  const budgetPatterns = [
    /\$\s*([\d,]+)/,
    /([\d,]+)\s*dollars?/i,
    /budget\s+(?:of\s+)?\$?([\d,]+)/i,
    /spend\s+\$?([\d,]+)/i,
    /\$?([\d,]+)\s+budget/i,
  ];
  for (const pattern of budgetPatterns) {
    const match = input.match(pattern);
    if (match) {
      budget = parseInt(match[1].replace(/,/g, ''), 10);
      break;
    }
  }

  // Parse duration
  let duration = 7; // default
  const durationPatterns = [
    /(\d+)[-\s]days?/i,
    /(\d+)[-\s]night/i,
    /(\d+)[-\s]week/i,
    /week/i,
    /fortnight/i,
  ];
  for (const pattern of durationPatterns) {
    const match = input.match(pattern);
    if (match) {
      if (pattern.source === 'week' || (match[0] && match[0].toLowerCase() === 'week')) {
        duration = 7;
      } else if (pattern.source === 'fortnight') {
        duration = 14;
      } else if (match[1]) {
        const num = parseInt(match[1], 10);
        if (pattern.source.includes('week')) {
          duration = num * 7;
        } else {
          duration = num;
        }
      }
      break;
    }
  }

  // Parse month
  let month = 'August'; // default
  for (const [keyword, monthName] of Object.entries(MONTH_MAP)) {
    if (lower.includes(keyword)) {
      month = monthName;
      break;
    }
  }

  // Parse travelers
  let travelers = 2; // default
  if (/\bsolo\b|\bone person\b|\balone\b|\bby myself\b/i.test(input)) {
    travelers = 1;
  } else if (/\bcouple\b|\btwo of us\b|\b2 people\b|\bme and my (wife|husband|partner|girlfriend|boyfriend)\b/i.test(input)) {
    travelers = 2;
  } else if (/family of (\d+)/i.test(input)) {
    const match = input.match(/family of (\d+)/i);
    if (match) travelers = parseInt(match[1], 10);
  } else if (/group of (\d+)/i.test(input)) {
    const match = input.match(/group of (\d+)/i);
    if (match) travelers = parseInt(match[1], 10);
  } else if (/\bfamily\b|\bgroup\b/i.test(input)) {
    travelers = 4;
  } else if (/(\d+)\s+(?:people|persons|travelers|travellers)/i.test(input)) {
    const match = input.match(/(\d+)\s+(?:people|persons|travelers|travellers)/i);
    if (match) travelers = parseInt(match[1], 10);
  }

  // Parse preferences
  const preferences: string[] = [];
  for (const [pref, keywords] of Object.entries(PREFERENCE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        if (!preferences.includes(pref)) {
          preferences.push(pref);
        }
        break;
      }
    }
  }

  // Ensure at least some default preferences
  if (preferences.length === 0) {
    preferences.push('culture', 'food');
  }

  return {
    budget,
    duration,
    month,
    travelers,
    preferences,
    origin: 'Israel',
    rawInput: input,
  };
}
