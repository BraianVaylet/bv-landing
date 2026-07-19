// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Absolute URL used for canonical links, sitemap, and OG tags.
// Override with a real domain via the SITE env var when deploying to Vercel.
const SITE_URL = process.env.SITE ?? 'https://bv-landingpage.vercel.app';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
  // Static output — content baked into HTML, no adapter needed on Vercel.
  output: 'static',
});
