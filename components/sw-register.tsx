"use client";

import { useEffect } from "react";

/** Registers the service worker (public/sw.js). No-op where unsupported. */
export function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("[sw] registration failed:", err);
    });
  }, []);
  return null;
}
