"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/firebase";

export default function FirebaseAnalytics() {
  useEffect(() => {
    analytics.catch(console.error);
  }, []);

  return null;
}
