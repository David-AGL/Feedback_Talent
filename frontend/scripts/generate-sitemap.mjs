import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function loadConfig() {
  const cfgPath = join(process.cwd(), 'sitemap-config.json');
  const raw = await readFile(cfgPath, { encoding: 'utf8' });
  return JSON.parse(raw);
}

function buildUrlEntry(baseUrl, route, defaultLastMod) {
  const loc = `${baseUrl.replace(/\/$/, '')}${route.path}`;
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${route.lastmod || defaultLastMod}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`;
}

async function main() {
  try {
    const cfg = await loadConfig();
    const baseUrl = cfg.baseUrl || 'https://example.com';
    const defaultLastMod = cfg.defaultLastMod || new Date().toISOString().slice(0,10);

    const header = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const entries = (cfg.routes || []).map(r => buildUrlEntry(baseUrl, r, defaultLastMod)).join('\n');

    const footer = `\n</urlset>\n`;

    const xml = header + entries + footer;

    const outPath = join(process.cwd(), 'public', 'sitemap.xml');
    await writeFile(outPath, xml, { encoding: 'utf8' });
    console.log(`sitemap.xml generado en: ${outPath}`);
  } catch (err) {
    console.error('Error generando sitemap:', err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('generate-sitemap.mjs')) {
  main();
}
