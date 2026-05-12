export interface TripRequest {
  budget: number;
  duration: number; // days (maximum)
  month: string;
  travelers: number;
  preferences: string[]; // e.g. ['food', 'nature', 'culture']
  origin: string; // departure city or country, e.g. "Tel Aviv" or "Israel"
  originIATA: string; // IATA code for origin airport, e.g. "TLV"
  rawInput: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  emoji: string;
  tagline: string;
  description: string;
  highlights: string[];
  matchScore: number; // 0-100
  matchReasons: string[];
  iataCode: string;
}

export interface Activity {
  time: string; // e.g. "09:00"
  name: string;
  description: string;
  cost: number; // per person
  type: 'food' | 'nature' | 'culture' | 'transport' | 'accommodation' | 'leisure' | 'adventure';
  duration: string; // e.g. "2 hours"
}

export interface DayPlan {
  day: number;
  title: string;
  location: string;
  activities: Activity[];
}

export interface BudgetBreakdown {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
  misc: number;
  total: number;
  currency: string;
}

export interface TripPlan {
  destination: Destination;
  itinerary: DayPlan[];
  budget: BudgetBreakdown;
}

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
  airline: string;
  outboundDeparture: string;     // HH:MM
  outboundArrival: string;
  inboundDeparture: string;
  inboundArrival: string;
  originAirport: string;         // IATA
  destinationAirport: string;    // IATA
  departureToken: string;        // SerpAPI token for fetching booking links
}

export interface FlightFilters {
  directOnly: boolean;
  maxStops: number | null;        // null = any
  maxDurationHours: number | null; // null = any
}
