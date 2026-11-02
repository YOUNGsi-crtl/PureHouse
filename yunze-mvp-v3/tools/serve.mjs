#!/usr/bin/env node
/**
 * 本地静态服务器（零依赖）：用于在手机上真机试用 H5 端。
 *   node tools/serve.mjs          默认端口 8080
 *   node tools/serve.mjs 3000     指定端口
 *
 * 启动后：
 *   - 电脑上打开  http://localhost:8080/
 *   - 手机连同一个 Wi-Fi，打开终端打印的「手机访问」地址
 *   - 也可以把那个地址贴进 tools/qr.html 生成二维码，微信扫码打开
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const PORT = Number(process.argv[2] || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

const ROUTES = [
  ['/tools/', join(ROOT, 'tools')],
  ['/', join(ROOT, 'h5')]
];

function safeJoin(base, urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const full = join(base, clean);
  return full.startsWith(base) ? full : null;
}

const server = createServer(async (req, res) => {
  const urlPath = req.url || '/';
  let base = null;
  let rest = urlPath;
  for (const [prefix, dir] of ROUTES) {
    if (urlPath.startsWith(prefix)) { base = dir; rest = urlPath.slice(prefix.length - 1); break; }
  }
  if (!base) { res.writeHead(404); res.end('not found'); return; }

  let full = safeJoin(base, rest);
  if (!full) { res.writeHead(403); res.end('forbidden'); return; }

  try {
    const s = await stat(full);
    if (s.isDirectory()) full = join(full, 'index.html');
  } catch (e) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 ' + urlPath);
    return;
  }

  try {
    const buf = await readFile(full);
    res.writeHead(200, {
      'content-type': MIME[extname(full).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    res.end(buf);
  } catch (e) {
    res.writeHead(500);
    res.end('500');
  }
});

function lanIPs() {
  const out = [];
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const ni of nets[name] || []) {
      if (ni.family === 'IPv4' && !ni.internal) out.push(ni.address);
    }
  }
  return out;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  云泽璞舍 · 洱海密语  本地预览已启动');
  console.log('  ------------------------------------------');
  console.log(`  电脑打开 :  http://localhost:${PORT}/`);
  console.log(`  二维码页 :  http://localhost:${PORT}/tools/qr.html`);
  for (const ip of lanIPs()) {
    console.log(`  手机访问 :  http://${ip}:${PORT}/     (需同一 Wi-Fi)`);
  }
  console.log('');
  console.log('  按 Ctrl+C 停止。');
  console.log('');
});
