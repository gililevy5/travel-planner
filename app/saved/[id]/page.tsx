"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getTrip, SavedTrip } from "@/lib/firestore";
import AuthButton from "@/components/AuthButton";
import ResultsContent from "@/app/results/ResultsContent";

export default function SavedTripPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [trip, setTrip] = useState<SavedTrip | null | undefined>(undefined);

  useEffect(() => {
    if (!user || !id) return;
    getTrip(user.uid, id).then(setTrip);
  }, [user, id]);

  // Auth loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view this trip</h2>
          <p className="text-gray-500 mb-6">Your trips are saved to your account.</p>
          <AuthButton />
        </div>
      </div>
    );
  }

  // Fetching trip
  if (trip === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Trip not found
  if (trip === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Trip not found</h2>
          <p className="text-gray-500 mb-6">This trip may have been deleted or doesn&apos;t belong to your account.</p>
          <Link
            href="/saved"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition"
          >
            ← My Saved Trips
          </Link>
        </div>
      </div>
    );
  }

  return <ResultsContent request={trip.request} trips={[trip.plan]} hideSaveButton />;
}
