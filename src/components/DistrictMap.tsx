interface DistrictMapProps {
  districtName: string;
  provinceName?: string;
  lat?: number;
  lng?: number;
  height?: string;
}

export function DistrictMap({
  districtName,
  provinceName,
  lat,
  lng,
  height = "450px",
}: DistrictMapProps) {
  // Build the Google Maps embed URL
  // Strategy: If we have coordinates, use them. Otherwise, search by name.
  let mapUrl: string;

  if (lat && lng) {
    // Use exact coordinates (most accurate)
    mapUrl = `https://www.google.com/maps?q=${lat},${lng}&z=11&output=embed`;
  } else {
    // Fallback: search by district name
    const query = encodeURIComponent(
      `${districtName} District, ${provinceName || ""} Nepal`.trim()
    );
    mapUrl = `https://www.google.com/maps?q=${query}&z=11&output=embed`;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ height }}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map of ${districtName} district`}
      />
    </div>
  );
}
