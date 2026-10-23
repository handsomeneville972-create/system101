"use client";

import { useEffect } from "react";

export function ViewBeacon({ appId }: { appId: string }) {
  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (navigator.doNotTrack === "1" || nav.globalPrivacyControl === true) return;

    const body = JSON.stringify({
      referrer: document.referrer,
      search: window.location.search,
    });

    fetch(`/api/apps/${appId}/view`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [appId]);

  return null;
}
