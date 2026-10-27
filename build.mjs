import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const source = join(root, 'public');
const output = join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
for (const name of ['styles.css', 'script.js']) {
  const sourcePath = join(output, name);
  const content = await readFile(sourcePath);
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const fingerprinted = name.replace(/\.(css|js)$/, `-${hash}.$1`);
  await writeFile(join(output, fingerprinted), content);
  await rm(sourcePath);
  const htmlPath = join(output, 'index.html');
  const html = await readFile(htmlPath, 'utf8');
  await writeFile(htmlPath, html.replaceAll(`/${name}`, `/${fingerprinted}`));
}
console.log(`Built ${output} with content-hashed CSS and JS.`);
