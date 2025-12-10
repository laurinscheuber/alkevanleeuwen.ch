import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Safe initialization
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET;

export const client = createClient({
  projectId: projectId || 'undefined', // Prevent crash if missing
  dataset: dataset || 'production',
  useCdn: true, 
  apiVersion: '2023-05-03',
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
