/**
 * 引擎逻辑自测（Node 直接运行，不需要浏览器）
 *   node tests/engine.test.mjs
 *
 * 验证四件事：
 *   1. 三语查询都能命中正确条目；
 *   2. 无关问题会触发「低置信度拒答」，而不是硬答；
 *   3. 剧本状态机：解锁、去重、宽容码格式、进阶门槛、分支结局；
 *   4. 埋点聚合能算出语种分布、热度、漏斗。
 */
import { createRequire } from 'node:module';
import assert from 'node:assert';

const require = createRequire(import.meta.url);
const KB = require('../shared/knowledge.js');
const STORY = require('../shared/story.js');
const Engine = require('../shared/engine.js');
const { I18N, t, pick } = require('../shared/i18n.js');

let pass = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  \u2713 ${name}`); }
  else { console.error(`  \u2717 ${name}`, extra === undefined ? '' : extra); process.exitCode = 1; }
}

console.log('\n[1] 检索：三语命中');
const cases = [
  ['扎染为什么每件都不一样', 'K01'],
  ['照壁是干什么用的', 'K05'],
  ['三道茶有什么讲究', 'K02'],
  ['本主是谁', 'K04'],
  ['火把节是哪天', 'K07'],
  ['风花雪月是什么意思', 'K08'],
  ['what is a screen wall for', 'K05'],
  ['why is tie-dye unique', 'K01'],
  ['three course tea', 'K02'],
  ['絞り染めはなぜ違う', 'K01'],
  ['照壁', 'K05'],
];
for (const [q, want] of cases) {
  const r = Engine.compose(q, KB);
  ok(`"${q}" -> ${want} (pct=${r.kind === 'answer' ? r.pct : '-'})`,
     r.kind === 'answer' && r.entry.id === want,
     r.kind === 'answer' ? r.entry.id : r.kind);
}

console.log('\n[2] 拒答：无关问题不硬答');
for (const q of ['今天天气怎么样', 'how do I renew my visa', 'zzzzz qqqq']) {
  const r = Engine.compose(q, KB);
  ok(`"${q}" -> low/empty`, r.kind === 'low', r.kind);
}
const low = Engine.compose('今天天气怎么样', KB);
ok('拒答时给出候选条目（可为空）', Array.isArray(low.items));
ok('拒答不返回 entry', low.entry === undefined);

console.log('\n[3] 阈值与分数单调性');
const strong = Engine.compose('白族扎染', KB);
const weak = Engine.compose('布', KB);
ok('强命中 pct 显著高于弱命中', strong.pct > (weak.kind === 'answer' ? weak.pct : 0),
   `${strong.pct} vs ${weak.kind === 'answer' ? weak.pct : 'low'}`);
ok('pct 永不超过 97', strong.pct <= 97, strong.pct);

console.log('\n[4] 剧本状态机');
let st = Engine.newStory('jinhua', 'zh');
ok('初始为第一幕、零线索', st.act === 1 && st.clues.length === 0);
ok('第一幕（序）无需线索即可进阶', Engine.canAdvance(st, STORY) === true);

let adv = Engine.advance(st, STORY);
ok('进阶到第二幕', adv.ok === true && st.act === 2);

let r1 = Engine.unlockClue(st, 'YH-01', STORY);
ok('标准码解锁', r1.ok === true && r1.clue.code === 'YH-01');
let r2 = Engine.unlockClue(st, 'yh1', STORY);
ok('宽容格式 yh1 命中同一条', r2.ok === false && r2.reason === 'dup');
let r3 = Engine.unlockClue(st, '99', STORY);
ok('错误码被拒绝', r3.ok === false && r3.reason === 'wrong');
let r4 = Engine.unlockClue(st, '晾布架下', STORY);
ok('可用空间名解锁', r4.ok === true && r4.clue.code === 'YH-02');

ok('线索不足（2/3）时不可进阶', Engine.canAdvance(st, STORY) === false);
ok('线索不足时 advance 返回 need_more',
   Engine.advance(st, STORY).reason === 'need_more');
Engine.unlockClue(st, 'YH-03', STORY);
ok('满 3 条后可进阶', Engine.canAdvance(st, STORY) === true);

adv = Engine.advance(st, STORY);
ok('进阶到第三幕', adv.ok === true && st.act === 3);
adv = Engine.advance(st, STORY);
ok('第三幕后不再进阶', adv.ok === false);

let ch = Engine.choose(st, 'keep', STORY);
ok('选择分支产生结局', ch.ok === true && ch.ending.id === 'e2');
ok('结局记录写入状态', st.endingId === 'e2' && typeof st.finishedAt === 'number');
ok('未知分支被拒绝', Engine.choose(st, 'nope', STORY).ok === false);

const prog = Engine.progress(st, STORY);
ok('进度对象正确', prog.found === 3 && prog.need === 3 && prog.ready === true);
ok('每条线索都绑定了知识卡',
   STORY.clues.every((c) => KB.entries.some((e) => e.id === c.kbId)));

console.log('\n[5] 埋点与聚合');
const ev = [];
Engine.logEvent(ev, 'session_start', { lang: 'zh' });
Engine.logEvent(ev, 'session_start', { lang: 'en' });
Engine.logEvent(ev, 'session_start', { lang: 'en' });
Engine.logEvent(ev, 'clue', { kbId: 'K01' });
Engine.logEvent(ev, 'clue', { kbId: 'K01' });
Engine.logEvent(ev, 'clue', { kbId: 'K05' });
Engine.logEvent(ev, 'act', { act: 2 });
Engine.logEvent(ev, 'act', { act: 3 });
Engine.logEvent(ev, 'ending', { endingId: 'e2' });
Engine.logEvent(ev, 'rating', { value: 5 });
Engine.logEvent(ev, 'rating', { value: 4 });

const agg = Engine.aggregate(ev, KB);
ok('场次统计', agg.sessions === 3, agg.sessions);
ok('线索统计', agg.cluesUnlocked === 3, agg.cluesUnlocked);
ok('结局统计', agg.endings === 1, agg.endings);
ok('平均分', agg.avgRating === 4.5, agg.avgRating);
ok('语种分布按降序', agg.langs[0].key === 'en' && agg.langs[0].count === 2, JSON.stringify(agg.langs));
ok('热度第一名是 K01', agg.heat[0].key === 'K01' && agg.heat[0].count === 2, JSON.stringify(agg.heat[0]));
ok('热度带可读名称', agg.heat[0].name === '白族扎染', agg.heat[0].name);
ok('漏斗四段', agg.funnel.length === 4);
ok('漏斗末端为结局数', agg.funnel[3].count === 1);

console.log('\n[6] 三语文案完整性');
const keys = Object.keys(I18N.zh);
for (const lang of ['en', 'ja']) {
  const missing = keys.filter((k) => I18N[lang][k] === undefined);
  ok(`${lang} 缺少 ${missing.length} 个键`, missing.length === 0, missing.join(', '));
}
ok('t() 回退到中文', t('fr', 'navDecode') === I18N.zh.navDecode);
ok('pick() ja 缺失时回退英文',
   pick('ja', { zh: '中', en: 'EN' }) === 'EN');
ok('pick() 有 ja 时优先 ja',
   pick('ja', { zh: '中', en: 'EN', ja: '日' }) === '日');

console.log('\n[7] 内容结构检查');
for (const e of KB.entries) {
  ok(`${e.id} 有 zh/en 摘要`, !!(e.summary.zh && e.summary.en));
  ok(`${e.id} 有出处`, Array.isArray(e.sources) && e.sources.length > 0);
  ok(`${e.id} 有要点`, Array.isArray(e.facts.zh) && e.facts.zh.length > 0);
}
for (const c of STORY.clues) {
  ok(`${c.code} 有中英奖励文本`, !!(c.reward.zh && c.reward.en));
}
ok('5 个角色', STORY.roles.length === 5);
ok('3 个结局', STORY.endings.length === 3);
ok('6 条线索', STORY.clues.length === 6);

console.log(`\n通过 ${pass} 项断言`);
