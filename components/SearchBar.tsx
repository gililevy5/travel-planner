'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  initialValue?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({ initialValue = '', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    if (onSearch) {
      onSearch(query.trim());
    } else {
      router.push(`/results?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex flex-col gap-3">
        <div className="relative">
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as FormEvent);
              }
            }}
            placeholder='e.g. "I have $3000 for a 7-day trip in August for a couple who loves food and nature"'
            rows={3}
            className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-4 pr-14 text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none shadow-xl transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white font-semibold text-lg py-4 px-8 shadow-lg shadow-orange-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Planning your trip...
            </>
          ) : (
            <>
              <span className="text-xl">✈</span>
              Plan My Trip
            </>
          )}
        </button>
      </div>
    </form>
  );
}
