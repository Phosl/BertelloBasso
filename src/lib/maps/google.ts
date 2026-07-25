"use client";

let mapsLoader: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MAPS_BROWSER_ONLY"));
  }
  if (typeof window.google !== "undefined") return Promise.resolve();
  if (mapsLoader) return mapsLoader;

  mapsLoader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-bertello-google-maps="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), {once: true});
      existing.addEventListener(
        "error",
        () => reject(new Error("MAPS_LOAD_FAILED")),
        {once: true},
      );
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.bertelloGoogleMaps = "true";
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
      "&v=weekly&loading=async";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("MAPS_LOAD_FAILED"));
    document.head.append(script);
  });

  return mapsLoader;
}

export function googleMapsLink({
  address,
  latitude,
  longitude,
  placeId,
}: {
  address: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
}) {
  const query =
    latitude !== null && longitude !== null
      ? `${latitude},${longitude}`
      : address;
  const params = new URLSearchParams({api: "1", query});
  if (placeId) params.set("query_place_id", placeId);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
