'use client';

import { FlightOffer, FlightFilters } from '@/lib/types';

interface FlightSectionProps {
  offers: FlightOffer[] | 'loading' | null;
  filters: FlightFilters;
  onFiltersChange: (f: FlightFilters) => void;
  selectedOfferId: string | null;
  onSelectOffer: (offer: FlightOffer) => void;
  destinationName: string;
}

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

export default function FlightSection({
  offers,
  filters,
  onFiltersChange,
  selectedOfferId,
  onSelectOffer,
  destinationName,
}: FlightSectionProps) {
  const filteredOffers = Array.isArray(offers)
    ? offers.filter(o => {
        if (filters.directOnly && o.stops > 0) return false;
        if (filters.maxStops !== null && o.stops > filters.maxStops) return false;
        if (filters.maxDurationHours !== null && o.totalDurationMinutes > filters.maxDurationHours * 60) return false;
        return true;
      })
    : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg">✈ Flights to {destinationName}</h3>
        <p className="text-xs text-gray-400 mt-0.5">Real prices from Amadeus · sorted by best value</p>
      </div>

      {/* Filter bar */}
      <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center">
        {/* Direct only toggle */}
        <button
          onClick={() => onFiltersChange({ ...filters, directOnly: !filters.directOnly, maxStops: filters.directOnly ? null : null })}
          className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition ${
            filters.directOnly
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
          }`}
        >
          <span className={`w-3 h-3 rounded-full border-2 ${filters.directOnly ? 'bg-white border-white' : 'border-gray-400'}`} />
          Direct only
        </button>

        {/* Max stops */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">Stops:</span>
          {MAX_STOPS_OPTIONS.map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => onFiltersChange({ ...filters, maxStops: opt.value, directOnly: opt.value === 0 })}
              className={`text-xs font-medium rounded-full px-2.5 py-1 border transition ${
                filters.maxStops === opt.value && !filters.directOnly
                  ? 'bg-teal-600 text-white border-teal-600'
                  : opt.value === 0 && filters.directOnly
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Max duration */}
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

      <div className="p-5">
        {/* Loading */}
        {offers === 'loading' && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* No Amadeus results */}
        {offers === null && (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm mb-3">No flight data available for this route.</p>
            <a
              href={`https://www.google.com/travel/flights`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium underline"
            >
              Search on Google Flights →
            </a>
          </div>
        )}

        {/* Filter zero results */}
        {Array.isArray(offers) && offers.length > 0 && filteredOffers.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-6">
            No flights match your filters — try relaxing them.
          </p>
        )}

        {/* Offer cards */}
        {filteredOffers.length > 0 && (
          <div className="space-y-2">
            {filteredOffers.map(offer => (
              <button
                key={offer.id}
                onClick={() => onSelectOffer(offer)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  selectedOfferId === offer.id
                    ? 'border-teal-500 bg-teal-50 shadow-sm'
                    : 'border-gray-100 hover:border-teal-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Outbound */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <span>{offer.outboundDeparture}</span>
                      <span className="text-gray-400">→</span>
                      <span>{offer.outboundArrival}</span>
                      <span className="text-xs text-gray-400 font-normal">{offer.originAirport}–{offer.destinationAirport}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{offer.airline}</span>
                      <span>·</span>
                      <span>{offer.outboundDuration}</span>
                      <span>·</span>
                      {offer.stops === 0
                        ? <span className="text-teal-600 font-medium">Direct</span>
                        : <span>{offer.stops} stop{offer.stops > 1 ? 's' : ''}</span>
                      }
                    </div>
                  </div>

                  {/* Return */}
                  <div className="hidden sm:block min-w-0 text-right">
                    <div className="text-xs text-gray-400">{offer.departureDate.slice(5)} → {offer.returnDate.slice(5)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Return: {offer.inboundDuration}</div>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-gray-900">${offer.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">${offer.pricePerPerson.toLocaleString()}/person</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
