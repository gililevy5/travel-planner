import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { TripRequest, TripPlan } from "./types";

export interface SavedTrip {
  id: string;
  query: string;
  request: TripRequest;
  plan: TripPlan;
  createdAt: Date;
}

function tripsRef(userId: string) {
  return collection(db, "users", userId, "trips");
}

export async function saveTrip(
  userId: string,
  request: TripRequest,
  plan: TripPlan
): Promise<string> {
  const docRef = await addDoc(tripsRef(userId), {
    query: request.rawInput,
    request,
    plan,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserTrips(userId: string): Promise<SavedTrip[]> {
  const q = query(tripsRef(userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      query: data.query as string,
      request: data.request as TripRequest,
      plan: data.plan as TripPlan,
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    };
  });
}

export async function deleteTrip(userId: string, tripId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "trips", tripId));
}

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
