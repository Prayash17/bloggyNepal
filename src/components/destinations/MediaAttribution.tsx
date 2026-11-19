import type { SanityImage } from "@/types/destination";

function safeExternalUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Attribution metadata is a record, not proof of copyright clearance.
 * Only display fields entered and verified by a human editor.
 */
export default function MediaAttribution({
  image,
  kind = "Photo",
  className = "",
}: {
  image?: SanityImage | null;
  kind?: "Photo" | "Map";
  className?: string;
}) {
  if (!image) return null;

  const credit = image.credit?.trim();
  const license = image.license?.trim();
  const sourceUrl = safeExternalUrl(image.source);
  const licenseUrl = safeExternalUrl(image.licenseUrl);

  if (!credit && !license && !sourceUrl && !licenseUrl) return null;

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-stone-600 ${className}`}>
      {credit && <span>{kind}: {credit}</span>}
      {sourceUrl && (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-stone-300 underline-offset-2 hover:text-stone-900">
          Original source
        </a>
      )}
      {license && <span>License: {license.replace(/-/g, " ").toUpperCase()}</span>}
      {licenseUrl && (
        <a href={licenseUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-stone-300 underline-offset-2 hover:text-stone-900">
          License terms
        </a>
      )}
    </div>
  );
}
