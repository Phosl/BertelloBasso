"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {ArrowUpRight, MapPin} from "lucide-react";
import type {Locale} from "@/lib/i18n/config";
import {getMessages} from "@/lib/i18n/messages";
import {googleMapsLink, loadGoogleMaps} from "@/lib/maps/google";

export function GalleryMap({
  locale,
  locationName,
  address,
  latitude,
  longitude,
  placeId,
}: {
  locale: Locale;
  locationName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
}) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const copy = getMessages(locale).photography;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const canRenderMap =
    Boolean(apiKey) && latitude !== null && longitude !== null;
  const mapsHref = useMemo(
    () =>
      googleMapsLink({
        address: address || locationName,
        latitude,
        longitude,
        placeId,
      }),
    [address, latitude, locationName, longitude, placeId],
  );

  useEffect(() => {
    const element = mapElement.current;
    if (!element || !canRenderMap) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {rootMargin: "200px"},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [canRenderMap]);

  useEffect(() => {
    const element = mapElement.current;
    if (
      !visible ||
      !apiKey ||
      latitude === null ||
      longitude === null ||
      !element
    ) {
      return;
    }
    let active = true;

    void loadGoogleMaps(apiKey)
      .then(async () => {
        const [{Map}, {AdvancedMarkerElement}] = await Promise.all([
          google.maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
          google.maps.importLibrary(
            "marker",
          ) as Promise<google.maps.MarkerLibrary>,
        ]);
        if (!active) return;
        const position = {lat: latitude, lng: longitude};
        const map = new Map(element, {
          center: position,
          zoom: 13,
          mapId: "DEMO_MAP_ID",
          disableDefaultUI: true,
          gestureHandling: "cooperative",
          colorScheme: google.maps.ColorScheme.LIGHT,
        });
        new AdvancedMarkerElement({map, position, title: locationName});
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [apiKey, latitude, locationName, longitude, visible]);

  return (
    <section className="gallery-location">
      <div className="gallery-location__copy">
        <p className="eyebrow">{copy.location}</p>
        <MapPin aria-hidden="true" size={25} />
        <h2>{locationName}</h2>
        {address ? <p>{address}</p> : null}
        <a href={mapsHref} rel="noreferrer" target="_blank">
          {copy.openMaps} <ArrowUpRight aria-hidden="true" size={18} />
        </a>
      </div>
      <div
        aria-label={locationName}
        className={`gallery-location__map ${
          !canRenderMap || failed ? "is-fallback" : ""
        }`}
        ref={mapElement}
        role={canRenderMap && !failed ? "region" : undefined}
      >
        {!canRenderMap || failed ? (
          <div>
            <MapPin aria-hidden="true" size={28} />
            <span>{failed ? copy.mapUnavailable : locationName}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
