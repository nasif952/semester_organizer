"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const id = setInterval(callback, 30_000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return Date.now();
}

function getServerSnapshot() {
  // No "current time" on the server render pass - callers treat 0 as
  // "not mounted yet" to avoid a hydration mismatch.
  return 0;
}

/** Ticking clock, updated every 30s. Returns null until mounted client-side. */
export function useNow(): Date | null {
  const ms = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return ms ? new Date(ms) : null;
}
