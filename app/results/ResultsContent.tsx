'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TripRequest, TripPlan, FlightOffer, FlightFilters } from '@/lib/types';
import { DestinationSelection } from '@/lib/claude-trips';
import DestinationCard from '@/components/DestinationCard';
import ItineraryView from '@/components/ItineraryView';
import AuthButton from '@/components/AuthButton';
import SaveTripButton from '@/components/SaveTripButton';
import FlightSection from '@/components/FlightSection';

interface ResultsContentProps {
  query: string;
}

// Also used by saved/[id]/page.tsx with pre-loaded data
interface PreloadedResultsContentProps {
  request: TripRequest;
  trips: TripPlan[];
  hideSaveButton?: boolean;
}

export type ResultsContentCombinedProps = ResultsContentProps | PreloadedResultsContentProps;

const PREF_LABELS: Record<string, string> = {
  food: 'Food', nature: 'Nature', culture: 'Culture', history: 'History',
  beach: 'Beach', adventure: 'Adventure', shopping: 'Shopping', relaxation: 'Relaxation',
};

type Phase = 'selecting' | 'ready' | 'error';
type PlanState = TripPlan | 'loading' | null;

const LOADING_STEPS = [
  'Parsing your request…',
  'Finding the best destinations…',
  'Generating day-by-day itineraries…',
];

function isPreloaded(props: ResultsContentCombinedProps): props is PreloadedResultsContentProps {
  return 'request' in props && 'trips' in props;
}

function ProgressiveResults({ query }: ResultsContentProps) {
  const [phase, setPhase] = useState<Phase>('selecting');
  const [loadingStep, setLoadingStep] = useState(0);
  const [tripRequest, setTripRequest] = useState<TripRequest | null>(null);
  const [selections, setSelections] = useState<DestinationSelection[]>([]);
  const [plans, setPlans] = useState<PlanState[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[] | 'loading' | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<FlightOffer | null>(null);
  const [flightFilters, setFlightFilters] = useState<FlightFilters>({
    directOnly: false,
    maxStops: null,
    maxDurationHours: null,
  });

  // Phase 1: parse + select destinations
  useEffect(() => {
    let cancelled = false;
    setLoadingStep(0);
    const stepTimer = setTimeout(() => !cancelled && setLoadingStep(1), 2000);

    fetch('/api/trips/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to select destinations');
        return r.json();
      })
      .then(({ request, selections: sels }: { request: TripRequest; selections: DestinationSelection[] }) => {
        if (cancelled) return;
        clearTimeout(stepTimer);
        setTripRequest(request);
        setSelections(sels);
        setPlans(new Array(sels.length).fill('loading'));
        setLoadingStep(2);
        setPhase('ready');
      })
      .catch(err => {
        if (cancelled) return;
        setErrorMessage((err as Error).message ?? 'Something went wrong');
        setPhase('error');
      });

    return () => { cancelled = true; clearTimeout(stepTimer); };
  }, [query]);

  // Phase 2: generate itinerary for each destination in parallel
  useEffect(() => {
    if (phase !== 'ready' || !tripRequest || selections.length === 0) return;
    selections.forEach((selection, i) => {
      fetch('/api/trips/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selection, tripRequest }),
      })
        .then(r => {
          if (!r.ok) throw new Error('Failed to generate itinerary');
          return r.json();
        })
        .then(({ plan }: { plan: TripPlan }) => {
          setPlans(prev => { const n = [...prev]; n[i] = plan; return n; });
        })
        .catch(() => {
          setPlans(prev => { const n = [...prev]; n[i] = null; return n; });
        });
    });
  }, [phase]);

  const selectedPlan = plans[selectedIndex];
  const selectedPlanData = selectedPlan !== 'loading' && selectedPlan !== null ? selectedPlan : null;

  // Fetch flights whenever selected destination changes
  useEffect(() => {
    if (!tripRequest || !selections[selectedIndex]) return;
    const originIATA = tripRequest.originIATA;
    const destIATA = selections[selectedIndex].iataCode;
    if (!originIATA || !destIATA) { setFlightOffers(null); return; }

    setFlightOffers('loading');
    setSelectedOffer(null);

    fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originIATA,
        destIATA,
        month: tripRequest.month,
        duration: selections[selectedIndex].suggestedDays,
        travelers: tripRequest.travelers,
      }),
    })
      .then(r => r.json())
      .then(({ offers }: { offers: FlightOffer[] }) => {
        setFlightOffers(offers.length > 0 ? offers : null);
        if (offers.length > 0) setSelectedOffer(offers[0]);
      })
      .catch(() => setFlightOffers(null));
  }, [selectedIndex, tripRequest]);

  const handleSelectIndex = useCallback((i: number) => {
    setSelectedIndex(i);
    setFlightFilters({ directOnly: false, maxStops: null, maxDurationHours: null });
  }, []);

  if (phase === 'selecting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-6 animate-bounce">✈</div>
          <h2 className="text-xl font-bold text-gray-900 mb-8">Planning your perfect trip…</h2>
          <div className="space-y-3">
            {LOADING_STEPS.map((step, i) => (
              <div key={step} className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                i < loadingStep ? 'text-teal-600' : i === loadingStep ? 'text-gray-900 font-medium' : 'text-gray-300'
              }`}>
                <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                  {i < loadingStep
                    ? '✓'
                    : i === loadingStep
                    ? <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin block" />
                    : <span className="w-2 h-2 bg-gray-200 rounded-full block mx-auto" />}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{errorMessage}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition">
            ← Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ResultsLayout
      tripRequest={tripRequest}
      selections={selections}
      plans={plans}
      selectedIndex={selectedIndex}
      onSelectIndex={handleSelectIndex}
      flightOffers={flightOffers}
      flightFilters={flightFilters}
      onFiltersChange={setFlightFilters}
      selectedOffer={selectedOffer}
      onSelectOffer={setSelectedOffer}
      selectedPlan={selectedPlan}
      selectedPlanData={selectedPlanData}
    />
  );
}

interface ResultsLayoutProps {
  tripRequest: TripRequest | null;
  selections: DestinationSelection[];
  plans: PlanState[];
  selectedIndex: number;
  onSelectIndex: (i: number) => void;
  flightOffers: FlightOffer[] | 'loading' | null;
  flightFilters: FlightFilters;
  onFiltersChange: (f: FlightFilters) => void;
  selectedOffer: FlightOffer | null;
  onSelectOffer: (o: FlightOffer) => void;
  selectedPlan: PlanState;
  selectedPlanData: TripPlan | null;
  hideSaveButton?: boolean;
}

function ResultsLayout({
  tripRequest,
  selections,
  plans,
  selectedIndex,
  onSelectIndex,
  flightOffers,
  flightFilters,
  onFiltersChange,
  selectedOffer,
  onSelectOffer,
  selectedPlan,
  selectedPlanData,
  hideSaveButton,
}: ResultsLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
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
        {tripRequest && (
          <div className="bg-gradient-to-r from-blue-900 to-teal-800 rounded-2xl p-5 text-white mb-8 shadow-lg">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-blue-300 font-medium uppercase tracking-wider mb-2">Your Trip Request</p>
                <p className="text-blue-100 text-sm italic mb-3 max-w-lg opacity-80">
                  &ldquo;{tripRequest.rawInput}&rdquo;
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                    <span>📅</span>
                    <span>Up to {tripRequest.duration} days · {tripRequest.month}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                    <span>🛫</span>
                    <span>From {tripRequest.origin}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                    <span>👥</span>
                    <span>{tripRequest.travelers === 1 ? 'Solo' : tripRequest.travelers === 2 ? 'Couple' : `${tripRequest.travelers} travelers`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                    <span>💰</span>
                    <span>Budget: ${tripRequest.budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <p className="text-xs text-blue-300 font-medium uppercase tracking-wider mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {tripRequest.preferences.map(p => (
                    <span key={p} className="bg-teal-500/40 border border-teal-400/30 rounded-full px-2.5 py-1 text-xs font-medium text-teal-100">
                      {PREF_LABELS[p] ?? p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {selections.length} Destinations Matched
            </h2>
            {plans.some(p => p === 'loading') && (
              <span className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
                <span className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin inline-block" />
                Building itineraries…
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selections.map((sel, i) => {
              const plan = plans[i];
              const tripPlan = plan !== 'loading' && plan !== null ? plan : undefined;
              const travelers = tripRequest?.travelers ?? 1;
              const fallbackPlan: TripPlan = {
                destination: {
                  id: sel.id,
                  name: sel.name,
                  country: sel.country,
                  emoji: sel.emoji,
                  tagline: sel.tagline,
                  description: sel.description,
                  highlights: sel.highlights,
                  matchScore: Math.round(Math.min(100, Math.max(0, sel.matchScore))),
                  matchReasons: sel.matchReasons,
                  iataCode: sel.iataCode,
                },
                itinerary: [],
                budget: {
                  flights: sel.estimatedFlightCost * travelers,
                  accommodation: 0, food: 0, activities: 0, transport: 0, misc: 0,
                  total: sel.estimatedFlightCost * travelers,
                  currency: 'USD',
                },
              };
              return (
                <DestinationCard
                  key={sel.id}
                  plan={tripPlan ?? fallbackPlan}
                  selected={selectedIndex === i}
                  onClick={() => onSelectIndex(i)}
                  travelers={travelers}
                  loading={plan === 'loading'}
                />
              );
            })}
          </div>
        </div>

        {selections[selectedIndex] && (
          <>
            <FlightSection
              offers={flightOffers}
              filters={flightFilters}
              onFiltersChange={onFiltersChange}
              selectedOfferId={selectedOffer?.id ?? null}
              onSelectOffer={onSelectOffer}
              destinationName={selections[selectedIndex].name}
              travelers={tripRequest?.travelers ?? 1}
            />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {selections[selectedIndex].emoji} {selections[selectedIndex].name} Itinerary
              </h2>
              {!hideSaveButton && selectedPlanData && tripRequest && (
                <SaveTripButton request={tripRequest} plan={selectedPlanData} />
              )}
            </div>

            {selectedPlan === 'loading' && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 rounded-2xl bg-gray-200 animate-pulse" />
                ))}
                <p className="text-center text-sm text-gray-400 pt-2">Generating your itinerary…</p>
              </div>
            )}

            {selectedPlan === null && (
              <div className="text-center py-12 text-gray-500">
                Failed to load itinerary.{' '}
                <Link href="/" className="text-teal-600 underline">Try again</Link>
              </div>
            )}

            {selectedPlanData && tripRequest && (
              <ItineraryView
                plan={selectedPlanData}
                travelers={tripRequest.travelers}
                userBudget={tripRequest.budget}
                realFlightCost={selectedOffer?.total}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Default export — handles both progressive (query) and preloaded (saved trips) use cases
export default function ResultsContent(props: ResultsContentCombinedProps) {
  if (isPreloaded(props)) {
    const { request, trips, hideSaveButton } = props;
    const selections: DestinationSelection[] = trips.map(t => ({
      id: t.destination.id,
      name: t.destination.name,
      country: t.destination.country,
      emoji: t.destination.emoji,
      tagline: t.destination.tagline,
      description: t.destination.description,
      highlights: t.destination.highlights,
      matchScore: t.destination.matchScore,
      matchReasons: t.destination.matchReasons,
      iataCode: t.destination.iataCode,
      suggestedDays: t.itinerary.length,
      estimatedFlightCost: Math.round(t.budget.flights / Math.max(1, request.travelers)),
    }));

    return (
      <ResultsLayout
        tripRequest={request}
        selections={selections}
        plans={trips}
        selectedIndex={0}
        onSelectIndex={() => {}}
        flightOffers={null}
        flightFilters={{ directOnly: false, maxStops: null, maxDurationHours: null }}
        onFiltersChange={() => {}}
        selectedOffer={null}
        onSelectOffer={() => {}}
        selectedPlan={trips[0] ?? null}
        selectedPlanData={trips[0] ?? null}
        hideSaveButton={hideSaveButton}
      />
    );
  }

  return <ProgressiveResults query={props.query} />;
}
