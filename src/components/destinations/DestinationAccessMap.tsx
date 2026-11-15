import Image from "next/image";
import type {
  Destination,
  DestinationAccessPoint,
  DestinationRoutePoint,
} from "@/types/destination";

type MapPoint = DestinationAccessPoint | DestinationRoutePoint;

function validCoordinates(point: { lat?: number; lng?: number } | undefined): point is { lat: number; lng: number } {
  return Boolean(
    point &&
      typeof point.lat === "number" &&
      Number.isFinite(point.lat) &&
      point.lat >= -90 &&
      point.lat <= 90 &&
      typeof point.lng === "number" &&
      Number.isFinite(point.lng) &&
      point.lng >= -180 &&
      point.lng <= 180
  );
}

function openStreetMapLink(point: { lat: number; lng: number }) {
  const params = new URLSearchParams({
    mlat: String(point.lat),
    mlon: String(point.lng),
  });
  return `https://www.openstreetmap.org/?${params.toString()}#map=13/${point.lat}/${point.lng}`;
}

function pinMapUrl(point: { lat: number; lng: number }, zoom: number) {
  // OpenStreetMap's shareable embed is a locator, not a trek routing service.
  const delta = Math.max(0.007, 0.08 * Math.pow(2, 12 - zoom));
  const params = new URLSearchParams({
    bbox: [point.lng - delta, point.lat - delta, point.lng + delta, point.lat + delta].join(","),
    layer: "mapnik",
    marker: `${point.lat},${point.lng}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

function isSafeHttpUrl(value?: string): value is string {
  if (!value) return false;
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function MapPointCard({
  point,
  index,
  ordered = false,
}: {
  point: MapPoint;
  index: number;
  ordered?: boolean;
}) {
  const coordinates = validCoordinates(point.coordinates) ? point.coordinates : null;
  const sourceUrl = isSafeHttpUrl(point.sourceUrl) ? point.sourceUrl : null;
  return (
    <li className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-950" aria-hidden="true">
        {ordered ? index + 1 : "•"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold text-slate-900">{point.name}</h4>
          {point.locationAccuracy === "approximate" && (
            <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] text-stone-700">Approximate area</span>
          )}
        </div>
        {"kind" in point && (
          <p className="mt-1 text-xs capitalize text-stone-500">{point.kind.replace(/([a-z])([A-Z])/g, "$1 $2")}</p>
        )}
        {"modeFromPrevious" in point && point.modeFromPrevious && index > 0 && (
          <p className="mt-1 text-xs text-stone-500">From previous: {point.modeFromPrevious}</p>
        )}
        {point.description && <p className="mt-2 text-sm leading-6 text-stone-600">{point.description}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {coordinates && (
            <a href={openStreetMapLink(coordinates)} target="_blank" rel="noopener noreferrer" className="font-semibold text-red-800 underline underline-offset-2">
              View location
            </a>
          )}
          {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-slate-600 underline underline-offset-2">Location source</a>}
          {point.verifiedAt && sourceUrl && (
            <span className="text-slate-500">Checked {point.verifiedAt}</span>
          )}
        </div>
      </div>
    </li>
  );
}

export default function DestinationAccessMap({
  destination,
  mapUrl,
}: {
  destination: Destination;
  mapUrl: string | null;
}) {
  const pins = destination.accessPoints ?? [];
  const stops = destination.routePoints ?? [];
  const mainPoint = validCoordinates(destination.coordinates)
    ? destination.coordinates
    : pins.map((point) => point.coordinates).find(validCoordinates) ??
      stops.map((point) => point.coordinates).find(validCoordinates);
  const embed = isSafeHttpUrl(destination.mapEmbedUrl) ? destination.mapEmbedUrl : null;
  const mapSrc = embed ?? (mainPoint ? pinMapUrl(mainPoint, destination.mapZoom ?? 12) : null);

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 bg-stone-50 px-5 py-5 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-800">Where to go · how to arrive</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Locate the destination, check access points and review the suggested stop sequence. Pins and stops do not represent verified navigable trails.
        </p>
      </div>
      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-2">
        {mapSrc ? (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
            <iframe
              src={mapSrc}
              title={`Locator map for ${destination.title}`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-[290px] w-full border-0 sm:h-[380px]"
            />
          </div>
        ) : mapUrl ? (
          <div className="relative min-h-[260px] overflow-hidden rounded-2xl bg-stone-100">
            <Image src={mapUrl} alt={destination.mapImage?.alt || `Location illustration for ${destination.title}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" />
          </div>
        ) : null}
        <div className={`flex flex-col justify-center rounded-2xl bg-[#f8f6f1] p-5 sm:p-6 ${!mapSrc && !mapUrl ? "lg:col-span-2" : ""}`}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-800">Your travel starting point</p>
          <h3 className="mt-3 font-serif text-2xl font-bold text-[#243e32]">{destination.title}</h3>
          {[destination.district?.name, destination.province?.name].filter(Boolean).length > 0 && (
            <p className="mt-2 text-sm text-slate-600">
              {[destination.district?.name, destination.province?.name].filter(Boolean).join(" · ")}
            </p>
          )}
          {destination.mapAdvisory ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <strong>Access note:</strong> {destination.mapAdvisory}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Roadheads, vehicle access and trail conditions can change. Confirm the approach locally before departure.
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {mainPoint && (
              <a href={openStreetMapLink(mainPoint)} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-[#27483b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#193328] focus-visible:outline-2 focus-visible:outline-offset-2">
                Open location map ↗
              </a>
            )}
            {destination.lastRouteVerifiedAt && (
              <span className="text-xs text-slate-500">Route notes checked {destination.lastRouteVerifiedAt}</span>
            )}
          </div>
        </div>
      </div>
      {(pins.length > 0 || stops.length > 0) && (
        <div className="grid gap-6 border-t border-stone-200 p-4 sm:p-6 lg:grid-cols-2">
          {pins.length > 0 && (
            <div>
              <h3 className="mb-3 font-serif text-xl font-bold text-slate-900">Access points</h3>
              <ul className="space-y-3">{pins.map((point, index) => <MapPointCard key={point._key ?? `${point.name}-${index}`} point={point} index={index} />)}</ul>
            </div>
          )}
          {stops.length > 0 && (
            <div>
              <h3 className="mb-3 font-serif text-xl font-bold text-slate-900">Suggested route stops</h3>
              <p className="mb-3 text-xs leading-5 text-stone-600">Stops listed in travel order, not a verified GPS path.</p>
              <ol className="space-y-3">{stops.map((point, index) => <MapPointCard key={point._key ?? `${point.name}-${index}`} point={point} index={index} ordered />)}</ol>
            </div>
          )}
        </div>
      )}
      <p className="border-t border-stone-100 px-5 py-3 text-xs leading-5 text-stone-500 sm:px-7">
        Map is for orientation only; not for emergency navigation. Source and verification dates appear next to individual points when supplied.
        {mapSrc && !embed ? " Map data © OpenStreetMap contributors." : ""}
      </p>
    </div>
  );
}
