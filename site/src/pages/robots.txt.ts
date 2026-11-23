import type { APIRoute } from 'astro';
import { SITE_URL_FALLBACK } from '@/config/site-url';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() || SITE_URL_FALLBACK;
  // The sitemap is written at the site root, which lives under `base`.
  const sitemapUrl = new URL(import.meta.env.BASE_URL, siteUrl).toString();

  const robotsTxt = `
User-agent: *
Allow: /

# Block API routes
Disallow: /api/

# Plain-Markdown map of this site for language models — see https://llmstxt.org
Sitemap: ${sitemapUrl}sitemap-index.xml
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
