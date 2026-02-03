import { createClient } from '@sanity/client';
import createImageUrlBuilder from '@sanity/image-url';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || import.meta.env.VITE_SANITY_DATASET || 'production';

export const client = createClient({
  projectId: projectId,
  dataset: dataset,
  useCdn: true,
  apiVersion: '2023-05-03',
});

const builder = createImageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source).auto('format').fit('max');
}
