interface ProvinceMapProps {
  provinceName: string;
  lat?: number;
  lng?: number;
  height?: string;
}

export function ProvinceMap({
  provinceName,
  lat,
  lng,
  height = "500px",
}: ProvinceMapProps) {
  let mapUrl: string;

  if (lat && lng) {
    mapUrl = `https://www.google.com/maps?q=${lat},${lng}&z=8&output=embed`;
  } else {
    const query = encodeURIComponent(`${provinceName} Province, Nepal`);
    mapUrl = `https://www.google.com/maps?q=${query}&z=8&output=embed`;
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
        title={`Map of ${provinceName} Province`}
      />
    </div>
  );
}
