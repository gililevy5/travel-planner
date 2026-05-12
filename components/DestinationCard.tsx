'use client';

import { TripPlan, CheapestFlight } from '@/lib/types';

interface DestinationCardProps {
  plan: TripPlan;
  selected: boolean;
  onClick: () => void;
  travelers: number;
  cheapestFlight?: 'loading' | CheapestFlight | null;
  loading?: boolean; // itinerary still generating
}

export default function DestinationCard({ plan, selected, onClick, travelers, cheapestFlight, loading }: DestinationCardProps) {
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
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 w-32 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-6 w-24 rounded-full bg-gray-200 animate-pulse" />
          </div>
        ) : (
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
        )}
      </div>

      {selected && (
        <div className="mt-3 flex items-center justify-center gap-2 text-teal-600 text-sm font-semibold">
          <span>▼</span> Viewing full itinerary
        </div>
      )}
    </button>
  );
}
