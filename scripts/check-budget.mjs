import { readdir, readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const files = await readdir('dist/assets');
let total = 0;
let javascript = 0;
let css = 0;
let criticalImages = 0;
let movie = 0;
for (const file of files) {
  const path = `dist/assets/${file}`;
  const { size } = await stat(path);
  total += size;
  if (file.endsWith('.js')) javascript += gzipSync(await readFile(path)).byteLength;
  if (file.endsWith('.css')) css += gzipSync(await readFile(path)).byteLength;
  if (/^(hero|tech|music)-/.test(file)) criticalImages += size;
  if (file.endsWith('.mp4')) movie += size;
}
const critical = javascript + css + criticalImages;
const report = {
  allAssetsBytes: total,
  allJavaScriptGzipBytes: javascript,
  criticalBytesEstimate: critical,
  videoBytes: movie,
};
console.log(JSON.stringify(report, null, 2));
const failures = [];
if (javascript > 300_000) failures.push('JavaScript exceeds 300 KB gzip');
if (critical > 1_500_000) failures.push('Critical resources exceed 1.5 MB');
if (movie > 3_000_000) failures.push('Video exceeds 3 MB');
if (total > 6_000_000) failures.push('Total assets exceed 6 MB');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Resource budgets passed. Timing and frame rate require browser measurements.');
