'use client';

import { TripPlan } from '@/lib/types';
import DayCard from './DayCard';
import BudgetBreakdown from './BudgetBreakdown';

interface ItineraryViewProps {
  plan: TripPlan;
  travelers: number;
  userBudget: number;
}

export default function ItineraryView({ plan, travelers, userBudget }: ItineraryViewProps) {
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

        {/* Match reasons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {destination.matchReasons.map((reason, i) => (
            <span key={i} className="text-xs bg-white/15 rounded-full px-3 py-1 text-blue-50">
              ✓ {reason}
            </span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Itinerary */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-gray-900 text-xl mb-4">{itinerary.length}-Day Itinerary</h3>
          {itinerary.map(day => (
            <DayCard key={day.day} day={day} travelers={travelers} />
          ))}
        </div>

        {/* Budget sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <BudgetBreakdown budget={budget} userBudget={userBudget} travelers={travelers} />
          </div>
        </div>
      </div>
    </div>
  );
}
