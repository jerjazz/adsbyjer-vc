import type { APIRoute } from 'astro';

const site = 'https://vc.adsbyjer.com';

const pages = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/thank-you/', priority: 0.3, changefreq: 'yearly' },
  { url: '/audit-thank-you/', priority: 0.5, changefreq: 'yearly' },
];

export const GET: APIRoute = () => {
  const today = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${site}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
