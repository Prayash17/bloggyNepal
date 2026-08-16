import { createImageUrlBuilder } from '@sanity/image-url'
import { dataset, projectId } from '@/sanity/env' // adjust import path to your env
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const builder = createImageUrlBuilder({ projectId, dataset })

export function urlForImage(source: SanityImageSource) {
  return builder.image(source)
}