import { routeMetadata } from '../src/page-metadata.ts';
import { writeFileSync } from 'node:fs';
const routes = Object.entries(routeMetadata).map(([key, value]) => ({
  key, path: '/' + value.path, artifact: value.path === '' || value.path.endsWith('/') ? value.path + 'index.html' : value.path,
  canonical: 'https://dentix.ua/' + value.path, title: value.title, description: value.description,
  source_key: `src/page-metadata.ts:routeMetadata.${key}`,
}));
if (routes.length !== 12) throw new Error('PR05 requires exactly twelve patient routes');
writeFileSync('ops/release/routes.json', JSON.stringify({ schema_version: 1, site_id: 'DENTIX', routes }, null, 2) + '\n');
