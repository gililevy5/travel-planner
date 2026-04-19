'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TripRequest, TripPlan } from '@/lib/types';
import DestinationCard from '@/components/DestinationCard';
import ItineraryView from '@/components/ItineraryView';
import AuthButton from '@/components/AuthButton';
import SaveTripButton from '@/components/SaveTripButton';

interface ResultsContentProps {
  request: TripRequest;
  trips: TripPlan[];
}

const PREF_LABELS: Record<string, string> = {
  food: 'Food',
  nature: 'Nature',
  culture: 'Culture',
  history: 'History',
  beach: 'Beach',
  adventure: 'Adventure',
  shopping: 'Shopping',
  relaxation: 'Relaxation',
};

export default function ResultsContent({ request, trips }: ResultsContentProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedPlan = trips[selectedIndex];

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
                onClick={() => setSelectedIndex(i)}
                travelers={request.travelers}
              />
            ))}
          </div>
        </div>

        {/* Itinerary for selected destination */}
        {selectedPlan && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedPlan.destination.emoji} {selectedPlan.destination.name} Itinerary
              </h2>
              <SaveTripButton request={request} plan={selectedPlan} />
            </div>
            <ItineraryView
              plan={selectedPlan}
              travelers={request.travelers}
              userBudget={request.budget}
            />
          </>
        )}
      </div>
    </div>
  );
}
