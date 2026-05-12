import ResultsContent from './ResultsContent';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ResultsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q ?? '';

  if (!query.trim()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-6xl mb-4">✈</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No trip query found</h1>
          <p className="text-gray-500 mb-6">Describe your dream trip to get personalized suggestions.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition">
            ← Back to Planner
          </Link>
        </div>
      </div>
    );
  }

  return <ResultsContent query={query} />;
}
