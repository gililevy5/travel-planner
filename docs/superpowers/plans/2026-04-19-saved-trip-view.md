# Saved Trip View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/saved/[id]` page that renders a saved trip's full itinerary from Firestore without re-querying the AI.

**Architecture:** A new client-side dynamic route reads the trip ID via `useParams()`, fetches the saved trip from Firestore using a new `getTrip` function scoped to the authenticated user, and renders it via the existing `ResultsContent` component. `ResultsContent` gets a `hideSaveButton` prop to suppress the duplicate-save button.

**Tech Stack:** Next.js 16 App Router, Firebase Firestore, TypeScript, Tailwind CSS

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `lib/firestore.ts` | Add `getTrip(userId, tripId)` |
| Modify | `components/ResultsContent.tsx` | Add `hideSaveButton?: boolean` prop |
| Create | `app/saved/[id]/page.tsx` | Auth gate + fetch + render |
| Modify | `app/saved/page.tsx` | "View trip →" + secondary "Re-plan" links |

---

### Task 1: Add `getTrip` to `lib/firestore.ts`

**Files:**
- Modify: `lib/firestore.ts`

- [ ] **Step 1: Add `getTrip` function**

Open `lib/firestore.ts` and add after the `deleteTrip` function:

```typescript
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,          // add this import
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
```

Then add the function:

```typescript
export async function getTrip(
  userId: string,
  tripId: string
): Promise<SavedTrip | null> {
  const snap = await getDoc(doc(db, "users", userId, "trips", tripId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    query: data.query as string,
    request: data.request as TripRequest,
    plan: data.plan as TripPlan,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing errors unrelated to `firestore.ts`)

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add lib/firestore.ts && git commit -m "feat: add getTrip to firestore lib"
```

---

### Task 2: Add `hideSaveButton` prop to `ResultsContent`

**Files:**
- Modify: `components/ResultsContent.tsx`

- [ ] **Step 1: Update props interface and conditional render**

In `components/ResultsContent.tsx`, update the `ResultsContentProps` interface and the `SaveTripButton` render:

```typescript
interface ResultsContentProps {
  request: TripRequest;
  trips: TripPlan[];
  hideSaveButton?: boolean;
}

export default function ResultsContent({ request, trips, hideSaveButton }: ResultsContentProps) {
```

Find the block that renders `SaveTripButton` (around line 135-139) and wrap it:

```tsx
<div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-bold text-gray-900">
    {selectedPlan.destination.emoji} {selectedPlan.destination.name} Itinerary
  </h2>
  {!hideSaveButton && <SaveTripButton request={request} plan={selectedPlan} />}
</div>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add components/ResultsContent.tsx && git commit -m "feat: add hideSaveButton prop to ResultsContent"
```

---

### Task 3: Create `/saved/[id]` page

**Files:**
- Create: `app/saved/[id]/page.tsx`

- [ ] **Step 1: Create the file**

Create `app/saved/[id]/page.tsx` with this content:

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add app/saved/[id]/page.tsx && git commit -m "feat: add /saved/[id] page to view saved trip"
```

---

### Task 4: Update `/saved` page links

**Files:**
- Modify: `app/saved/page.tsx`

- [ ] **Step 1: Replace "Re-plan" link with "View trip" primary + "Re-plan" secondary**

In `app/saved/page.tsx`, find the `Link` that says "Re-plan this trip →" (around line 103) and replace it with:

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/gili.levy/travel-planner && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Build to verify no runtime errors**

```bash
cd /Users/gili.levy/travel-planner && npm run build 2>&1 | tail -20
```

Expected: build completes successfully

- [ ] **Step 4: Commit**

```bash
cd /Users/gili.levy/travel-planner && git add app/saved/page.tsx && git commit -m "feat: add View trip link to saved trips list"
```

---

## Manual Test Checklist

After all tasks complete, verify end-to-end in the browser (`npm run dev`):

- [ ] Sign in with Google
- [ ] Plan a trip and save it via "Save trip" button
- [ ] Navigate to `/saved` — trip appears with "View trip →" and "Re-plan" links
- [ ] Click "View trip →" — navigates to `/saved/[id]`, shows full itinerary with correct destination, days, and budget
- [ ] "Save trip" button is NOT shown on the saved trip view
- [ ] Click "Re-plan" — navigates to `/results?q=...` and re-runs the AI query
- [ ] Navigate to `/saved/nonexistent-id` — shows "Trip not found" with link back to `/saved`
- [ ] Sign out, navigate to `/saved/[id]` — shows sign-in prompt
