import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
export const client = createClient({
  apiVersion: "2024-01-01",
  dataset: "production",
  projectId: "fsntdlwj",
  useCdn: false,
});

const builder = createImageUrlBuilder(client);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlForImage(source: any) {
  return builder.image(source);
}
