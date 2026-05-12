# Saved Trip View — Design Spec

**Date:** 2026-04-19  
**Status:** Approved

## Problem

The `/saved` page lists saved trips but only offers "Re-plan this trip →", which re-runs the Claude AI query from scratch. Users lose the exact itinerary they saved. There is no way to view a saved trip's full plan directly.

## Goal

Add a `/saved/[id]` route that loads and renders a saved trip's full itinerary (destination card, day-by-day plan, budget breakdown) without re-querying the AI.

## Architecture

### New route: `/saved/[id]`

- Client-side page (auth-dependent, uses `useAuth`)
- Auth gate: if not signed in, show sign-in prompt (consistent with `/saved`)
- Fetches single trip from Firestore via new `getTrip(userId, tripId)`
- Renders using existing `ResultsContent` with `trips={[trip.plan]}` and `request={trip.request}`
- `SaveTripButton` is hidden (trip is already saved; showing it would create duplicates)

### Data flow

1. User clicks "View trip →" on `/saved` → navigates to `/saved/[id]`
2. Auth state resolves
3. `getTrip(userId, tripId)` fetches `users/{userId}/trips/{tripId}` from Firestore
4. `ResultsContent` renders with the saved request + plan

## File Changes

| File | Change |
|---|---|
| `lib/firestore.ts` | Add `getTrip(userId, tripId): Promise<SavedTrip \| null>` |
| `app/saved/[id]/page.tsx` | New page — auth gate, fetch, render via `ResultsContent` |
| `components/ResultsContent.tsx` | Add optional `hideSaveButton?: boolean` prop |
| `app/saved/page.tsx` | Update links: "View trip →" to `/saved/[id]`, keep "Re-plan" secondary |

## Error Handling

| Case | Behavior |
|---|---|
| Not signed in | Sign-in prompt (same pattern as `/saved`) |
| Trip not found / wrong user | "Trip not found" message + link back to `/saved` |
| Auth loading | Spinner |

## Out of Scope

- Editing saved trips
- Sharing trips via public URL
- Auto-save after OAuth sign-in from SaveTripButton
