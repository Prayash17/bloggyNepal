import { createImageUrlBuilder } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";

export { client };

const builder = createImageUrlBuilder(client);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlForImage(source: any) {
  return builder.image(source);
}
