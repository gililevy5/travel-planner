'use client';

import { useState } from 'react';
import { FlightOffer, FlightFilters } from '@/lib/types';

interface FlightSectionProps {
  offers: FlightOffer[] | 'loading' | null;
  filters: FlightFilters;
  onFiltersChange: (f: FlightFilters) => void;
  selectedOfferId: string | null;
  onSelectOffer: (offer: FlightOffer) => void;
  destinationName: string;
  travelers: number;
}

type SortMode = 'best' | 'price' | 'duration';

const MAX_STOPS_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: 'Any', value: null },
  { label: '1 stop', value: 1 },
  { label: 'Direct', value: 0 },
];

const MAX_DURATION_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: 'Any', value: null },
  { label: '6h', value: 6 },
  { label: '9h', value: 9 },
  { label: '12h', value: 12 },
];

function nightsBetween(dep: string, ret: string): number {
  return Math.round((new Date(ret).getTime() - new Date(dep).getTime()) / 86_400_000);
}

function googleFlightsUrl(offer: FlightOffer, travelers: number): string {
  return `https://www.google.com/travel/flights#flt=${offer.originAirport}.${offer.destinationAirport}.${offer.departureDate}*${offer.destinationAirport}.${offer.originAirport}.${offer.returnDate};c:USD;e:${travelers}`;
}

function sortOffers(offers: FlightOffer[], mode: SortMode): FlightOffer[] {
  if (mode === 'price') return [...offers].sort((a, b) => a.total - b.total);
  if (mode === 'duration') return [...offers].sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
  const maxPrice = Math.max(...offers.map(o => o.total), 1);
  const maxDur = Math.max(...offers.map(o => o.totalDurationMinutes), 1);
  return [...offers].sort((a, b) => {
    const sa = 0.6 * (1 - a.total / maxPrice) + 0.4 * (1 - a.totalDurationMinutes / maxDur);
    const sb = 0.6 * (1 - b.total / maxPrice) + 0.4 * (1 - b.totalDurationMinutes / maxDur);
    return sb - sa;
  });
}

export default function FlightSection({
  offers,
  filters,
  onFiltersChange,
  selectedOfferId,
  onSelectOffer,
  destinationName,
  travelers,
}: FlightSectionProps) {
  const [sortMode, setSortMode] = useState<SortMode>('best');

  const filtered = Array.isArray(offers)
    ? offers.filter(o => {
        if (filters.directOnly && o.stops > 0) return false;
        if (filters.maxStops !== null && o.stops > filters.maxStops) return false;
        if (filters.maxDurationHours !== null && o.totalDurationMinutes > filters.maxDurationHours * 60) return false;
        return true;
      })
    : [];

  const sortedOffers = sortOffers(filtered, sortMode);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg">✈ Flights to {destinationName}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Live data from Google Flights · base fares only, baggage fees vary by airline
        </p>
      </div>

      {/* Filter + sort bar */}
      <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => onFiltersChange({ ...filters, directOnly: !filters.directOnly, maxStops: null })}
            className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition ${
              filters.directOnly
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
            }`}
          >
            <span className={`w-3 h-3 rounded-full border-2 ${filters.directOnly ? 'bg-white border-white' : 'border-gray-400'}`} />
            Direct only
          </button>

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Stops:</span>
            {MAX_STOPS_OPTIONS.map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => onFiltersChange({ ...filters, maxStops: opt.value, directOnly: opt.value === 0 })}
                className={`text-xs font-medium rounded-full px-2.5 py-1 border transition ${
                  (filters.maxStops === opt.value && !filters.directOnly) || (opt.value === 0 && filters.directOnly)
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Max flight:</span>
            {MAX_DURATION_OPTIONS.map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => onFiltersChange({ ...filters, maxDurationHours: opt.value })}
                className={`text-xs font-medium rounded-full px-2.5 py-1 border transition ${
                  filters.maxDurationHours === opt.value
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {([['best', 'Best'], ['price', 'Cheapest'], ['duration', 'Fastest']] as [SortMode, string][]).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`text-xs font-medium rounded-md px-3 py-1.5 transition ${
                sortMode === mode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {offers === 'loading' && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {offers === null && (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm mb-3">No flight data available for this route.</p>
            <a
              href="https://www.google.com/travel/flights"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium underline"
            >
              Search on Google Flights →
            </a>
          </div>
        )}

        {Array.isArray(offers) && offers.length > 0 && sortedOffers.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-6">
            No flights match your filters — try relaxing them.
          </p>
        )}

        {sortedOffers.length > 0 && (
          <div className="space-y-2">
            {sortedOffers.map(offer => {
              const nights = nightsBetween(offer.departureDate, offer.returnDate);
              return (
                <button
                  key={offer.id}
                  onClick={() => onSelectOffer(offer)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    selectedOfferId === offer.id
                      ? 'border-teal-500 bg-teal-50 shadow-sm'
                      : 'border-gray-100 hover:border-teal-200 hover:bg-gray-50'
                  }`}
                >
                  {/* Airline + dates + nights */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900">{offer.airline}</span>
                    <span className="text-xs text-gray-500">
                      {offer.departureDate.slice(5).replace('-', '/')} → {offer.returnDate.slice(5).replace('-', '/')}
                      <span className="text-gray-400 ml-1">({nights} nights)</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <span>{offer.outboundDeparture}</span>
                        <span className="text-gray-400">→</span>
                        <span>{offer.outboundArrival}</span>
                        <span className="text-xs text-gray-400 font-normal">{offer.originAirport}–{offer.destinationAirport}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{offer.outboundDuration}</span>
                        <span>·</span>
                        {offer.stops === 0
                          ? <span className="text-teal-600 font-medium">Direct</span>
                          : <span>{offer.stops} stop{offer.stops > 1 ? 's' : ''}</span>
                        }
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold text-gray-900">${(offer.total ?? 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mb-1.5">${(offer.pricePerPerson ?? 0).toLocaleString()}/person</p>
                      <a
                        href={googleFlightsUrl(offer, travelers)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-block text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg transition"
                      >
                        Search →
                      </a>
                    </div>
                  </div>
                </button>
              );
            })}

            <p className="text-xs text-gray-400 text-center pt-2">
              Prices are base fares. Baggage, seats, and meals are extra — check with the airline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
