#!/usr/bin/env node
/**
 * 静态一致性检查（不需要启动小程序或浏览器）
 *   node tools/check.mjs
 *
 * 检查项：
 *   1. H5 中 tt('key') 引用的文案键在三语中都存在
 *   2. H5 中 data-act 引用的动作都有 switch 分支
 *   3. 小程序页面 wxml 中 {{L.xxx}} 引用的字段都在 setData 的 L 对象里
 *   4. 小程序 wxml 中 bindtap/bindinput 引用的方法都在 page js 里定义
 *   5. app.json 里的页面文件齐全（js/wxml/json）
 *   6. 剧本线索引用的知识条目 id 都存在
 *   7. H5 中 #/d/<id> 链接指向存在的条目
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');

const KB = require('../shared/knowledge.js');
const STORY = require('../shared/story.js');
const { I18N } = require('../shared/i18n.js');

let errors = 0;
let checked = 0;

function fail(msg) { errors++; console.error('  \u2717 ' + msg); }
function pass(msg) { checked++; }
function section(t) { console.log('\n' + t); }

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const uniq = (a) => [...new Set(a)];

/* 界面文案覆盖的七种语言：zh / en / ja / es / ar / hi / ko */
const ALL_LANGS = ['zh', 'en', 'ja', 'es', 'ar', 'hi', 'ko'];

/* ---------- 1 & 2：H5 ---------- */
section('[1] H5 文案键');
const h5app = read('h5/app.js');
const ttKeys = uniq([...h5app.matchAll(/tt\('([A-Za-z0-9_]+)'\)/g)].map((m) => m[1]));
for (const k of ttKeys) {
  for (const lang of ALL_LANGS) {
    if (I18N[lang][k] === undefined) fail(`tt('${k}') 在 ${lang} 中缺失`);
    else pass();
  }
}
console.log(`  检查了 ${ttKeys.length} 个文案键 × 7 语言`);

section('[2] H5 data-act 动作');
const acts = uniq([...h5app.matchAll(/data-act="([A-Za-z0-9_]+)"/g)].map((m) => m[1]));
const handled = new Set([
  ...[...h5app.matchAll(/case '([A-Za-z0-9_]+)':/g)].map((m) => m[1]),
  ...[...h5app.matchAll(/f\.getAttribute\('data-act'\)[\s\S]{0,80}?act === '([A-Za-z0-9_]+)'/g)].map((m) => m[1]),
]);
// submit 分支单独写在 if 里
for (const m of h5app.matchAll(/act === '([A-Za-z0-9_]+)'/g)) handled.add(m[1]);
for (const a of acts) {
  if (!handled.has(a)) fail(`data-act="${a}" 没有对应的处理分支`);
  else pass();
}
console.log(`  检查了 ${acts.length} 个动作`);

section('[3] H5 页面 id 链接');
const ids = new Set(KB.entries.map((e) => e.id));
for (const m of h5app.matchAll(/#\/d\/([A-Za-z0-9_]+)/g)) {
  // 模板里拼接的 id 是变量，静态写死的才检查
  if (!ids.has(m[1]) && /^K\d+$/.test(m[1])) fail(`#/d/${m[1]} 指向不存在的条目`);
  else pass();
}
console.log('  检查完成');

/* ---------- 4、3、5：小程序 ---------- */
const appJson = JSON.parse(read('miniprogram/app.json'));
section('[4] 小程序页面文件');
for (const p of appJson.pages) {
  for (const ext of ['js', 'wxml', 'json']) {
    const f = `miniprogram/${p}.${ext}`;
    if (!existsSync(join(ROOT, f))) fail(`缺少文件 ${f}`);
    else pass();
  }
}
console.log(`  ${appJson.pages.length} 个页面 × 3 个文件`);

section('[5] 小程序 WXML 绑定与方法');
for (const p of appJson.pages) {
  const js = read(`miniprogram/${p}.js`);
  const wxml = read(`miniprogram/${p}.wxml`);

  // 方法：xxx: function
  const methods = new Set([...js.matchAll(/^\s{2}([A-Za-z0-9_]+)\s*:\s*function\s*\(/gm)].map((m) => m[1]));
  const binds = uniq([...wxml.matchAll(/(?:bind|catch)(?:tap|input|confirm|change|longtap)="([A-Za-z0-9_]+)"/g)].map((m) => m[1]));
  for (const b of binds) {
    if (!methods.has(b)) fail(`${p}.wxml 绑定了不存在的方法 ${b}`);
    else pass();
  }

  // 文案字段：prop: st.t('key'
  const lProps = new Set([...js.matchAll(/([A-Za-z0-9_]+)\s*:\s*st\.t\('([A-Za-z0-9_]+)'/g)].map((m) => m[1]));
  const used = uniq([...wxml.matchAll(/L\.([A-Za-z0-9_]+)/g)].map((m) => m[1]));
  const missing = used.filter((u) => !lProps.has(u));
  if (missing.length) fail(`${p}.wxml 使用了未在 L 中定义的字段: ${missing.join(', ')}`);
  else pass();
  console.log(`  ${p}: ${binds.length} 个事件绑定, ${used.length} 个文案字段`);
}

section('[6] 线索 → 知识条目');
for (const c of STORY.clues) {
  if (!ids.has(c.kbId)) fail(`${c.code} 的 kbId=${c.kbId} 不存在`);
  else pass();
}
console.log(`  ${STORY.clues.length} 条线索`);

section('[7] 七语章节键完整性');
const zhKeys = Object.keys(I18N.zh);
for (const lang of ALL_LANGS.filter((l) => l !== 'zh')) {
  const miss = zhKeys.filter((k) => I18N[lang][k] === undefined);
  if (miss.length) fail(`${lang} 缺 ${miss.join(', ')}`);
  else pass();
}
console.log(`  ${zhKeys.length} 个键 × 7 语言（${ALL_LANGS.join(' / ')}）`);

/* ---------- 结果 ---------- */
console.log('');
if (errors) {
  console.error(`检查未通过：${errors} 个问题（通过 ${checked} 项）`);
  process.exitCode = 1;
} else {
  console.log(`全部通过：${checked} 项检查，0 个问题`);
}
