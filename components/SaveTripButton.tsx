"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { saveTrip } from "@/lib/firestore";
import { TripRequest, TripPlan } from "@/lib/types";

interface Props {
  request: TripRequest;
  plan: TripPlan;
}

type State = "idle" | "saving" | "saved" | "error";

export default function SaveTripButton({ request, plan }: Props) {
  const { user, signInWithGoogle } = useAuth();
  const [state, setState] = useState<State>("idle");

  async function handleSave() {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setState("saving");
    try {
      await saveTrip(user.uid, request, plan);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  if (state === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
        ✓ Saved
      </span>
    );
  }

  if (state === "error") {
    return (
      <button
        onClick={handleSave}
        className="flex items-center gap-1.5 text-red-600 text-sm font-medium hover:underline"
      >
        Failed — retry?
      </button>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={state === "saving"}
      className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
    >
      {state === "saving" ? "Saving…" : user ? "Save trip" : "Sign in to save"}
    </button>
  );
}
