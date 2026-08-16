"use client";
import { useEffect, useRef } from "react";

export function Map({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";

      const map = L.map(containerRef.current).setView([lat, lng], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();
    })();
  }, [lat, lng, name]);

  return (
    <div
      ref={containerRef}
      className="h-[400px] w-full rounded-lg shadow-md"
    />
  );
}
