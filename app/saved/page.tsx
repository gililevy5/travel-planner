"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getUserTrips, deleteTrip, SavedTrip } from "@/lib/firestore";
import AuthButton from "@/components/AuthButton";

export default function SavedTripsPage() {
  const { user, loading } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [fetching, setFetching] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    getUserTrips(user.uid)
      .then(setTrips)
      .finally(() => setFetching(false));
  }, [user]);

  async function handleDelete(tripId: string) {
    if (!user) return;
    setDeletingId(tripId);
    try {
      await deleteTrip(user.uid, tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition font-medium text-sm">
            <span>←</span>
            <span>TripAI</span>
          </Link>
          <h1 className="text-sm font-bold text-gray-900">My Saved Trips</h1>
          <AuthButton />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Not signed in */}
        {!loading && !user && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔒</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to see your saved trips</h2>
            <p className="text-gray-500 mb-6">Your trips are saved to your account.</p>
            <AuthButton />
          </div>
        )}

        {/* Loading auth */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Fetching trips */}
        {user && fetching && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {user && !fetching && trips.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">✈</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No saved trips yet</h2>
            <p className="text-gray-500 mb-6">Plan a trip and hit &ldquo;Save trip&rdquo; to keep it here.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition">
              Plan a Trip
            </Link>
          </div>
        )}

        {/* Trip list */}
        {user && !fetching && trips.length > 0 && (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <span className="text-3xl shrink-0">{trip.plan.destination.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">
                      {trip.plan.destination.name},{" "}
                      <span className="font-normal text-gray-500">{trip.plan.destination.country}</span>
                    </p>
                    <p className="text-sm text-gray-500 truncate mt-0.5 max-w-sm">
                      &ldquo;{trip.query}&rdquo;
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Saved {trip.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Link
                        href={`/saved/${trip.id}`}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        View trip →
                      </Link>
                      <Link
                        href={`/results?q=${encodeURIComponent(trip.query)}`}
                        className="text-sm text-gray-400 hover:text-gray-600"
                      >
                        Re-plan
                      </Link>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(trip.id)}
                  disabled={deletingId === trip.id}
                  className="shrink-0 text-gray-400 hover:text-red-500 disabled:opacity-50 transition text-sm"
                  aria-label="Delete trip"
                >
                  {deletingId === trip.id ? "…" : "✕"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
