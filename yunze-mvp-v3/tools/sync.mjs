#!/usr/bin/env node
/**
 * 把 shared/ 下的共享内容层同步到两个端：
 *   shared/*.js  ->  h5/data/*.js
 *   shared/*.js  ->  miniprogram/data/*.js
 *
 * 共享文件同时兼容两种加载方式（已内置）：
 *   - 浏览器：  <script src="data/knowledge.js"></script>  -> window.KB
 *   - 小程序：  require('../../data/knowledge.js')          -> module.exports
 *
 * 用法：node tools/sync.mjs
 * 说明：这是唯一的复制动作，不要手工编辑 h5/data 或 miniprogram/data 里的文件。
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const shared = join(root, 'shared');

const targets = [
  join(root, 'h5', 'data'),
  join(root, 'miniprogram', 'data'),
];

const BANNER = `/* AUTO-GENERATED from shared/ by tools/sync.mjs — do not edit this copy.\n * Edit shared/{file} instead, then re-run: node tools/sync.mjs\n */\n`;

const files = (await readdir(shared)).filter((f) => f.endsWith('.js'));

if (!files.length) {
  console.error('shared/ 下没有 .js 文件');
  process.exit(1);
}

for (const dir of targets) {
  await mkdir(dir, { recursive: true });
  for (const f of files) {
    const src = await readFile(join(shared, f), 'utf8');
    const out = BANNER.replace('{file}', f) + src;
    await writeFile(join(dir, f), out, 'utf8');
  }
  console.log(`synced ${files.length} file(s) -> ${dir}`);
}

console.log('done:', files.join(', '));
