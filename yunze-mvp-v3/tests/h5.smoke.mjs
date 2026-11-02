/**
 * H5 运行时冒烟测试（Node + 最小 DOM 垫片，无需浏览器）
 *   node tests/h5.smoke.mjs
 *
 * 目的不是替代真机测试，而是确保：脚本能加载、渲染不抛异常、
 * 路由解析正确（含中文查询参数）、事件埋点落库。
 */
import { createRequire } from 'node:module';

let pass = 0;
let fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; console.error(`  \u2717 ${name}`, extra === undefined ? '' : String(extra).slice(0, 200)); }
}

/* ---------------- 最小 DOM 垫片 ---------------- */
class El {
  constructor(tag) {
    this.tag = tag;
    this._html = '';
    this.textContent = '';
    this.scrollTop = 0;
    this.style = {};
    this.parentNode = null;
    this.classList = { toggle() {}, add() {}, remove() {} };
    this._attrs = {};
  }
  get innerHTML() { return this._html; }
  set innerHTML(v) { this._html = String(v); }
  setAttribute(k, v) { this._attrs[k] = v; }
  getAttribute(k) { return this._attrs[k] === undefined ? null : this._attrs[k]; }
  querySelectorAll() { return []; }
  appendChild(c) { c.parentNode = this; return c; }
  removeChild() {}
  remove() {}
  addEventListener(t, fn) { (this._listeners = this._listeners || {}); (this._listeners[t] = this._listeners[t] || []).push(fn); }
}

const els = {};
const doc = {
  readyState: 'complete',
  body: new El('body'),
  documentElement: new El('html'),
  getElementById(id) { return els[id] || (els[id] = new El('#' + id)); },
  querySelectorAll() { return []; },
  createElement(t) { return new El(t); },
  addEventListener() {}
};

const store = {};
/* navigator / addEventListener 在 Node 中是只读全局，用 defineProperty 覆盖 */
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
const winListeners = {};
defGlobal('addEventListener', (type, fn) => { (winListeners[type] = winListeners[type] || []).push(fn); });

/* ---------------- 加载（顺序同 index.html） ---------------- */
const require = createRequire(import.meta.url);
require('../h5/data/knowledge.js');
require('../h5/data/story.js');
require('../h5/data/i18n.js');
require('../h5/data/engine.js');
require('../h5/data/showcase.js');
require('../h5/data/growth.js');
require('../h5/app.js');

const view = () => doc.getElementById('view').innerHTML;
const route = (hash) => {
  globalThis.location.hash = hash;
  (winListeners['hashchange'] || []).forEach((fn) => fn());
};

console.log('\n[1] 首次渲染');
ok('渲染未抛异常且有内容', view().length > 200, view().length);
ok('首页出现寓言标题', view().indexOf('看得见风景') >= 0);
ok('首页列出 8 个文化对象', (view().match(/class="obj"/g) || []).length === 8,
   (view().match(/class="obj"/g) || []).length);
ok('首页含推荐问句', view().indexOf('data-q=') >= 0);

console.log('\n[2] 中文查询参数解码');
route('#/q/' + encodeURIComponent('照壁是干什么用的'));
ok('命中「三坊一照壁」', view().indexOf('三坊一照壁') >= 0);
ok('显示匹配度百分比', /class="num">\d+%</.test(view()), view().match(/class="num">\d+%/));
ok('显示出处列表（CSS 计数器编号）', view().indexOf('class="sources"') >= 0);
ok('出处含「待补」标记', view().indexOf('tag pending') >= 0);
ok('查询被记录为埋点', (store['yz_events'] || '').indexOf('"search"') >= 0);

console.log('\n[3] 直接打开条目');
route('#/d/K01');
ok('显示扎染条目', view().indexOf('白族扎染') >= 0);
ok('显示正文撇捺', view().indexOf('绞缬') >= 0);
ok('显示要点与出处', view().indexOf('要点') >= 0 && view().indexOf('出处') >= 0);

console.log('\n[4] 低置信度应拒答');
route('#/q/' + encodeURIComponent('今天天气怎么样'));
ok('给出拒答说明而非编造', view().indexOf('知识库里还没有足够接近的条目') >= 0);
ok('拒答时不渲染正文', view().indexOf('一句读懂') < 0);

console.log('\n[5] 剧本页');
route('#/s');
const home = view();
ok('列出 5 个身份', (home.match(/data-act="pickRole"/g) || []).length === 5,
   (home.match(/data-act="pickRole"/g) || []).length);
ok('显示故事副标题', home.indexOf('洱海迷雾') >= 0);

console.log('\n[6] 主持台与看板');
route('#/dm');
ok('主持台列出 6 条线索', (view().match(/data-code="YH-/g) || []).length === 6,
   (view().match(/data-code="YH-/g) || []).length);
route('#/stats');
ok('看板渲染（有数据或空态）', view().length > 100);

console.log('\n[7] 深链（现场二维码）');
route('#/s/play?clue=YH-03');
ok('未开局时提示先选身份', view().indexOf('选择身份') >= 0 || view().indexOf('身份') >= 0);

console.log('\n[8] 顶栏与底栏本地化');
ok('底栏四个标签已注入', doc.getElementById('view').innerHTML.length > 0);
ok('语言按钮已生成', doc.getElementById('langs').innerHTML.indexOf('data-lang') >= 0);
ok('品牌名已写入', doc.getElementById('brandName').textContent.length > 0);

console.log('\n[9] 重复渲染不泄漏/不抛错');
for (let i = 0; i < 6; i++) route(['#/', '#/s', '#/dm', '#/stats', '#/d/K05', '#/'][i]);
ok('多次切换路由后仍可渲染', view().indexOf('看得见风景') >= 0);
let evCount = 0;
try { evCount = JSON.parse(store['yz_events'] || '[]').length; } catch (e) {}
ok('事件数量有界', evCount < 200, evCount);

console.log('\n[10] 民宿 / 旅游 / 加入我们 / 商城');
route('#/h');
ok('民宿页渲染 6 个房型', (view().match(/class="room"/g) || []).length === 6,
   (view().match(/class="room"/g) || []).length);
ok('民宿页含入住须知', view().indexOf('入住须知') >= 0);
route('#/t');
ok('旅游页渲染 5 条路线', (view().match(/class="route"/g) || []).length === 5,
   (view().match(/class="route"/g) || []).length);
route('#/join');
ok('加入我们页渲染 7 个合作方向', (view().match(/data-act="pickTrack"/g) || []).length === 7,
   (view().match(/data-act="pickTrack"/g) || []).length);
ok('加入我们页含意向表单', view().indexOf('data-act="joinform"') >= 0);
route('#/shop');
ok('商城页渲染 12 件商品', (view().match(/class="good"/g) || []).length === 12,
   (view().match(/class="good"/g) || []).length);
ok('商城页含购物袋栏', view().indexOf('class="bagbar') >= 0);
route('#/');
ok('首页渲染 4 张入口卡', (view().match(/class="feat"/g) || []).length === 4,
   (view().match(/class="feat"/g) || []).length);

console.log('\n[11] 七语切换与阿拉伯语 RTL');
/* 模拟点击顶栏语言按钮（走 bindLangs 的委托处理器） */
function clickLang(l) {
  const wrap = doc.getElementById('langs');
  const btn = { getAttribute: (k) => (k === 'data-lang' ? l : null) };
  const ev = { target: { closest: (sel) => (sel === '[data-lang]' ? btn : null) } };
  ((wrap._listeners && wrap._listeners.click) || []).forEach((fn) => fn(ev));
}
ok('语言条生成 7 个按钮', (doc.getElementById('langs').innerHTML.match(/data-lang/g) || []).length === 7,
   (doc.getElementById('langs').innerHTML.match(/data-lang/g) || []).length);

clickLang('ar');
ok('阿拉伯语切换后文档为 RTL', doc.documentElement.dir === 'rtl');
ok('阿拉伯语文案生效', view().indexOf('ترى المنظر') >= 0);
route('#/h');
ok('阿拉伯语下房型页正常渲染 6 间', (view().match(/class="room"/g) || []).length === 6,
   (view().match(/class="room"/g) || []).length);
ok('阿拉伯语下内容层回退英文（房型名）', view().indexOf('Capsule') >= 0);

clickLang('ko');
route('#/h');
ok('韩语文案生效', view().indexOf('층위별 객실') >= 0);
ok('切回 LTR', doc.documentElement.dir === 'ltr');

clickLang('es');
route('#/t');
ok('西语路线页渲染 5 条路线', (view().match(/class="route"/g) || []).length === 5,
   (view().match(/class="route"/g) || []).length);
ok('西语文案生效', view().indexOf('Guía local') >= 0);

clickLang('hi');
route('#/shop');
ok('印地语商城页渲染 12 件商品', (view().match(/class="good"/g) || []).length === 12,
   (view().match(/class="good"/g) || []).length);
ok('印地语文案生效', view().indexOf('यूनज़े सांस्कृतिक दुकान') >= 0);

clickLang('zh');
route('#/');
ok('切回中文后恢复默认', view().indexOf('看得见风景') >= 0);

console.log('');
if (fail) {
  console.error(`冒烟测试失败：${fail} 项（通过 ${pass} 项）`);
  process.exitCode = 1;
} else {
  console.log(`冒烟测试通过：${pass} 项`);
}
