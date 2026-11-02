/**
 * H5 剧本视图冒烟测试：在「第二幕 / 第三幕 / 结局 / 深链解锁」四种状态下渲染
 *   node tests/h5.story.mjs
 *
 * 这是评委现场点得最多的几屏，必须保证不白屏、按钮与星级状态正确。
 * 做法：每个状态重新加载一次 app.js（清 require 缓存 + 重置存储），
 *      这样能真实走一遍 boot()，而不需要给生产代码留测试钩子。
 */
import { createRequire } from 'node:module';

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.error(`  \u2717 ${name}`, extra === undefined ? '' : String(extra).slice(0, 160)); }
}

/* ---------------- DOM 垫片 ---------------- */
class El {
  constructor(tag) {
    this.tag = tag; this._html = ''; this.textContent = ''; this.scrollTop = 0;
    this.style = {}; this.parentNode = null; this._attrs = {};
    this.classList = { toggle() {}, add() {}, remove() {} };
  }
  get innerHTML() { return this._html; }
  set innerHTML(v) { this._html = String(v); }
  setAttribute(k, v) { this._attrs[k] = v; }
  getAttribute(k) { return this._attrs[k] === undefined ? null : this._attrs[k]; }
  querySelectorAll() { return []; }
  appendChild(c) { c.parentNode = this; return c; }
  removeChild() {} remove() {} addEventListener() {}
}
const els = {};
const doc = {
  readyState: 'complete',
  body: new El('body'),
  getElementById(id) { return els[id] || (els[id] = new El('#' + id)); },
  querySelectorAll() { return []; },
  createElement(t) { return new El(t); },
  addEventListener() {}
};

const store = { yz_lang: JSON.stringify('zh') };

function defGlobal(name, value) {
  Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
}
defGlobal('window', globalThis);
defGlobal('document', doc);
defGlobal('navigator', { language: 'zh-CN' });
defGlobal('location', { hash: '', pathname: '/index.html', search: '' });
defGlobal('history', { replaceState() {} });
defGlobal('localStorage', {
  getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
  setItem(k, v) { store[k] = String(v); },
  removeItem(k) { delete store[k]; }
});
let winListeners = {};
defGlobal('addEventListener', (type, fn) => { (winListeners[type] = winListeners[type] || []).push(fn); });

const require = createRequire(import.meta.url);
require('../h5/data/knowledge.js');
require('../h5/data/story.js');
require('../h5/data/i18n.js');
require('../h5/data/engine.js');

const APP = require.resolve('../h5/app.js');
const view = () => doc.getElementById('view').innerHTML;
const overlay = () => doc.getElementById('overlay-root').innerHTML;

function baseState(over) {
  return Object.assign({
    v: 1, roleId: 'jinhua', lang: 'zh', act: 2,
    clues: ['YH-01', 'YH-02'], choiceId: null, endingId: null,
    startedAt: Date.now(), finishedAt: null, rating: 0, pushed: []
  }, over || {});
}

function load(state, hash) {
  store.yz_story = JSON.stringify(state);
  store.yz_events = JSON.stringify([]);
  globalThis.location.hash = hash || '';
  winListeners = {};
  delete require.cache[APP];
  require(APP);
}

function route(hash) {
  globalThis.location.hash = hash;
  (winListeners['hashchange'] || []).forEach((fn) => fn());
}

/* ================= 1. 第二幕：线索不足 ================= */
console.log('\n[1] 第二幕 · 线索不足');
load(baseState(), '#/s/play');
let h = view();
ok('渲染第二幕标题', h.indexOf('第二幕') >= 0, h.slice(0, 80));
ok('进度显示 2/3', h.indexOf('2/3') >= 0);
ok('6 个线索格子', (h.match(/data-act="openClue"/g) || []).length === 6,
   (h.match(/data-act="openClue"/g) || []).length);
ok('已解锁的显示为已找到', h.indexOf('照壁前') >= 0 && h.indexOf('晾布架下') >= 0);
ok('未解锁的显示锁图标', h.indexOf('🔒') >= 0);
ok('「下一幕」为禁用态', h.indexOf('data-act="next" disabled') >= 0);
ok('禁用时说明还差几处旧痕', h.indexOf('天亮前还差几处旧痕') >= 0);
ok('提供模拟扫码兜底', h.indexOf('data-act="simScan"') >= 0);

/* ================= 2. 第三幕：可抉择 ================= */
console.log('\n[2] 第三幕 · 可抉择');
load(baseState({ act: 3, clues: ['YH-01', 'YH-02', 'YH-03'] }), '#/s/play');
h = view();
ok('渲染第三幕标题', h.indexOf('第三幕') >= 0, h.slice(0, 80));
ok('给出 3 个分支', (h.match(/data-act="choose"/g) || []).length === 3,
   (h.match(/data-act="choose"/g) || []).length);
ok('分支含「守口如瓶」选项', h.indexOf('守口如瓶') >= 0);
ok('第三幕不再显示线索格', h.indexOf('data-act="openClue"') < 0);

/* ================= 3. 结局页 ================= */
console.log('\n[3] 结局页 + 评分');
load(baseState({
  act: 3, clues: ['YH-01', 'YH-02', 'YH-03'],
  choiceId: 'keep', endingId: 'e2', finishedAt: Date.now(), rating: 5
}), '#/s/play');
h = view();
ok('渲染结局二', h.indexOf('结局二') >= 0, h.slice(0, 120));
ok('显示结局编号 E-02', h.indexOf('E-02') >= 0);
ok('显示「这一局想说的」', h.indexOf('这一局想说的') >= 0);
ok('5 颗星全部点亮', (h.match(/class="on">★/g) || []).length === 5,
   (h.match(/class="on">★/g) || []).length);
ok('提供重新开始', h.indexOf('data-act="restart"') >= 0);

/* ================= 4. 深链解锁（现场二维码） ================= */
console.log('\n[4] 深链解锁 ?clue=YH-03');
load(baseState({ clues: ['YH-01'] }), '#/s/play?clue=YH-03');
h = view();
ok('未抛异常且已渲染', h.length > 100);
ok('弹层出现并显示线索码', overlay().indexOf('YH-03') >= 0, overlay().slice(0, 120));
ok('弹层内出现知识卡入口', overlay().indexOf('#/d/K02') >= 0, overlay().slice(0, 160));
ok('解锁结果写入存储', String(store.yz_story).indexOf('YH-03') >= 0);
ok('渲染后线索变为已找到', view().indexOf('茶案旁') >= 0, view().indexOf('茶案旁'));

/* ================= 5. 未开局时深链 ================= */
console.log('\n[5] 未开局时深链应提示先选身份');
store.yz_story = JSON.stringify(null);
globalThis.location.hash = '#/s/play?clue=YH-05';
winListeners = {};
delete require.cache[APP];
require(APP);
h = view();
ok('提示选择身份而不是崩溃', h.indexOf('选择身份') >= 0, h.slice(0, 120));

/* ================= 6. 损坏数据不应白屏 ================= */
console.log('\n[6] 损坏的存储数据');
store.yz_story = JSON.stringify({ roleId: 'nobody', act: 99 });
globalThis.location.hash = '#/s/play';
winListeners = {};
delete require.cache[APP];
let threw = null;
try { require(APP); } catch (e) { threw = e; }
ok('损坏数据不抛异常', threw === null, threw && threw.message);
ok('仍然渲染出内容', view().length > 100);

console.log('');
if (fail) {
  console.error(`剧本视图测试失败：${fail} 项（通过 ${pass} 项）`);
  process.exitCode = 1;
} else {
  console.log(`剧本视图测试通过：${pass} 项`);
}
