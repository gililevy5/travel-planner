import SearchBar from '@/components/SearchBar';
import AuthButton from '@/components/AuthButton';
import Link from 'next/link';

const EXAMPLE_QUERIES = [
  { label: '🍜 Food & Nature couple', query: 'Flying from Tel Aviv, $3000 for a 7-day trip in August for a couple who loves food and nature' },
  { label: '🏔️ Adventure solo', query: 'Solo traveler from London, $2500 budget, 7 days in October, love adventure and hiking' },
  { label: '🕌 Culture & History', query: 'From New York, $2000 for a couple, 7 days in March, interested in culture and history' },
  { label: '🌿 Nature family', query: 'Family of 4 from Israel, $5000, 7-day trip in July, wildlife and outdoor adventures' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #0c4a6e 60%, #134e4a 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500 rounded-full filter blur-3xl opacity-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500 rounded-full filter blur-3xl opacity-5" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✈</span>
          <span className="text-white font-bold text-xl tracking-tight">TripAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/saved" className="text-sm text-blue-200 hover:text-white transition hidden sm:inline">
            My Trips
          </Link>
          <AuthButton />
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-teal-200 font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          AI-Powered Travel Planning
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6 max-w-4xl">
          Plan Your{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #2dd4bf, #38bdf8, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Perfect Trip
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-blue-200 max-w-2xl mb-12 leading-relaxed">
          Just describe your dream trip in your own words. We will instantly suggest 3 amazing
          destinations with full day-by-day itineraries and budget breakdowns.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl">
          <SearchBar />
        </div>

        {/* Example queries */}
        <div className="mt-10 w-full max-w-2xl">
          <p className="text-xs text-blue-300/70 uppercase tracking-wider font-medium mb-4">
            Try an example:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_QUERIES.map(example => (
              <Link
                key={example.label}
                href={`/results?q=${encodeURIComponent(example.query)}`}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-sm text-blue-100 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              >
                {example.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap gap-6 justify-center text-sm text-blue-300/80">
          {[
            { icon: '🌍', text: 'Any destination worldwide' },
            { icon: '📅', text: 'Full day-by-day itineraries' },
            { icon: '✈', text: 'Real flight prices via Amadeus' },
            { icon: '🗣️', text: 'Hebrew & English support' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-2">
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-blue-400/50 text-xs">
        Powered by Claude AI · Real flight data by Amadeus
      </footer>
    </div>
  );
}
