import type { APIRoute } from 'astro';
import siteConfig from '@/config/site.config';
import { BASE_PATH, withBase } from '@/lib/base';

export const GET: APIRoute = () => {
  const { name, description, branding } = siteConfig;

  const manifest = {
    name,
    short_name: name,
    description,
    start_url: `${BASE_PATH}/`,
    display: 'standalone',
    background_color: branding.colors.backgroundColor,
    theme_color: branding.colors.themeColor,
    icons: [
      {
        src: branding.favicon.svg,
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: withBase('/pwa-192x192.png'),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: withBase('/pwa-512x512.png'),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
};
