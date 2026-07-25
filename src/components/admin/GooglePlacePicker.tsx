"use client";

import {useEffect, useRef, useState} from "react";
import {MapPin} from "lucide-react";
import {loadGoogleMaps} from "@/lib/maps/google";

export type SelectedGooglePlace = {
  locationName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
};

export function GooglePlacePicker({
  onSelect,
}: {
  onSelect: (place: SelectedGooglePlace) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const element = container.current;
    if (!apiKey || !element) return;
    let active = true;
    let autocomplete: google.maps.places.PlaceAutocompleteElement | null = null;

    void loadGoogleMaps(apiKey)
      .then(async () => {
        const {PlaceAutocompleteElement} = (await google.maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;
        if (!active) return;
        autocomplete = new PlaceAutocompleteElement({
          includedRegionCodes: ["it"],
          placeholder: "Cerca un luogo o un indirizzo",
        });
        autocomplete.addEventListener("gmp-select", async (event) => {
          const prediction = (
            event as google.maps.places.PlacePredictionSelectEvent
          ).placePrediction;
          const place = prediction.toPlace();
          await place.fetchFields({
            fields: ["displayName", "formattedAddress", "location", "id"],
          });
          if (!active) return;
          onSelect({
            locationName: place.displayName ?? "",
            address: place.formattedAddress ?? "",
            latitude: place.location?.lat() ?? null,
            longitude: place.location?.lng() ?? null,
            googlePlaceId: place.id ?? null,
          });
        });
        element.replaceChildren(autocomplete);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("failed");
      });

    return () => {
      active = false;
      autocomplete?.remove();
    };
  }, [apiKey, onSelect]);

  if (!apiKey) {
    return (
      <div className="google-place-status">
        <MapPin aria-hidden="true" size={22} />
        <span>
          La chiave Google Maps non è ancora configurata. Inserisci il luogo
          manualmente qui sotto.
        </span>
      </div>
    );
  }

  return (
    <div className="google-place-picker">
      <label>Cerca con Google Maps</label>
      <div className="google-place-picker__element" ref={container}>
        {state === "loading" ? <span>Caricamento ricerca luogo…</span> : null}
      </div>
      {state === "failed" ? (
        <p>Google Maps non è disponibile. Usa i campi manuali qui sotto.</p>
      ) : null}
    </div>
  );
}
