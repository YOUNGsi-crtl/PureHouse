/* ==========================================================================
 * 云泽璞舍 · 洱海密语  ——  共享引擎（检索 / 剧本状态机 / 埋点统计）
 * --------------------------------------------------------------------------
 * 纯函数、无平台 API、无网络请求：
 *   - H5     通过 <script> 直接使用 window.Engine
 *   - 小程序 通过 require() 使用
 *   - Node   通过 require() 使用（tests/engine.test.mjs 会调用）
 *
 * 设计立场（答辩可讲）：
 *   1. 所有回答只来自本地知识库，不调用大模型 —— 弱网 / 无网可用，且绝不编造；
 *   2. 每条回答带 score 与 pct，低于阈值一律拒答并降级为「推荐条目」；
 *   3. 大模型接入点被隔离在 llmHint() 里，接入时只需替换该函数，
 *      但必须保留 citation 校验，否则会破坏「可溯源」这一产品承诺。
 * ========================================================================== */

var Engine = (function () {
  'use strict';

  var LOW_THRESHOLD = 26;   // 低于此分数判为「不够接近」，拒绝生成回答

  /* ---------- 文本工具 ---------- */
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function cjkChars(s) {
    var out = [];
    var arr = String(s).split('');
    for (var i = 0; i < arr.length; i++) {
      var c = arr[i].charCodeAt(0);
      if ((c >= 0x3400 && c <= 0x9fff) || (c >= 0x3040 && c <= 0x30ff) || (c >= 0xac00 && c <= 0xd7af)) {
        out.push(arr[i]);
      }
    }
    return out;
  }

  function tokens(q) {
    var s = norm(q), out = {}, i;
    var words = s.match(/[a-z0-9']+/g) || [];
    for (i = 0; i < words.length; i++) {
      if (words[i].length > 1) out['w:' + words[i]] = 1;
    }
    var ch = cjkChars(s);
    if (ch.length === 1) out['b:' + ch[0]] = 1;
    for (i = 0; i < ch.length - 1; i++) out['b:' + ch[i] + ch[i + 1]] = 1;
    return Object.keys(out);
  }

  function flatText(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) {
      var a = [];
      for (var i = 0; i < v.length; i++) a.push(flatText(v[i]));
      return a.join(' ');
    }
    if (typeof v === 'object') {
      var b = [];
      for (var k in v) { if (Object.prototype.hasOwnProperty.call(v, k)) b.push(flatText(v[k])); }
      return b.join(' ');
    }
    return String(v);
  }

  /* ---------- 检索 ---------- */
  function buildIndex(kb) {
    var idx = [];
    for (var i = 0; i < kb.entries.length; i++) {
      var e = kb.entries[i];
      var aliases = [];
      for (var L in e.alias) {
        if (Object.prototype.hasOwnProperty.call(e.alias, L)) {
          aliases = aliases.concat(e.alias[L] || []);
        }
      }
      var hay = norm(flatText(e.name) + ' ' + flatText(e.summary) + ' ' +
                     flatText(e.body) + ' ' + flatText(e.facts) + ' ' +
                     flatText(e.tags) + ' ' + aliases.join(' '));
      var hayTokens = {};
      var tk = tokens(hay);
      for (var j = 0; j < tk.length; j++) hayTokens[tk[j]] = 1;
      idx.push({
        entry: e,
        aliases: aliases.map(norm),
        names: [norm(e.name.zh), norm(e.name.en), norm(e.name.ja)].filter(Boolean),
        tags: (e.tags || []).map(norm),
        hay: hay,
        hayTokens: hayTokens
      });
    }
    return idx;
  }

  function scoreOne(item, q, qt) {
    var s = norm(q), score = 0, i;

    for (i = 0; i < item.names.length; i++) {
      if (item.names[i] && s.indexOf(item.names[i]) >= 0) score += 55;
    }
    for (i = 0; i < item.aliases.length; i++) {
      var a = item.aliases[i];
      if (a && a.length > 0 && s.indexOf(a) >= 0) score += 34 + Math.min(a.length, 6) * 5;
    }
    for (i = 0; i < item.tags.length; i++) {
      if (item.tags[i] && s.indexOf(item.tags[i]) >= 0) score += 7;
    }
    var overlap = 0;
    for (i = 0; i < qt.length; i++) {
      if (item.hayTokens[qt[i]]) overlap++;
    }
    score += Math.min(overlap * 5, 55);

    return score;
  }

  function pct(score) {
    /* 单调映射到 0—97，永远不给 100，避免「绝对确定」的错觉 */
    return Math.min(97, Math.round(100 * score / (score + 62)));
  }

  function search(q, kb) {
    var qtrim = norm(q);
    if (!qtrim) return [];
    var idx = kb.__idx || (kb.__idx = buildIndex(kb));
    var qt = tokens(qtrim);
    var out = [];
    for (var i = 0; i < idx.length; i++) {
      var sc = scoreOne(idx[i], qtrim, qt);
      if (sc > 0) out.push({ id: idx[i].entry.id, entry: idx[i].entry, score: sc, pct: pct(sc) });
    }
    out.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return (b.entry.hot || 0) - (a.entry.hot || 0);
    });
    return out;
  }

  /**
   * 组装回答。返回：
   *   { kind:'answer', entry, pct, related:[entry] }
   *   { kind:'low',    items:[entry] }
   */
  function compose(q, kb) {
    var res = search(q, kb);
    if (!res.length) return { kind: 'low', items: [], query: q };
    if (res[0].score < LOW_THRESHOLD) {
      return { kind: 'low', items: res.slice(0, 3).map(pickEntry), query: q };
    }
    return {
      kind: 'answer',
      entry: res[0].entry,
      pct: res[0].pct,
      score: res[0].score,
      related: res.slice(1, 4).map(pickEntry),
      query: q
    };
  }

  function pickEntry(r) { return r.entry; }

  /**
   * 大模型接入点（当前不启用）。
   * 若接入：把知识库条目作为唯一上下文传给模型，并要求返回
   * {answer, citations:[kbId]}；此处必须校验 citations 均存在于检索结果中，
   * 校验失败则丢弃模型输出、回退到本地组装。切勿跳过这一步。
   */
  function llmHint(enabled) {
    return {
      enabled: !!enabled,
      note: 'LLM adapter reserved. When enabled, validate citations against retrieved ids before using the output.'
    };
  }

  /* ---------- 剧本状态机 ---------- */
  function now() { return Date.now(); }

  function newStory(roleId, lang) {
    return {
      v: 1,
      roleId: roleId || null,
      lang: lang || 'zh',
      act: 1,
      clues: [],
      choiceId: null,
      endingId: null,
      startedAt: now(),
      finishedAt: null,
      rating: 0,
      pushed: []
    };
  }

  function findClue(input, story) {
    var s = norm(input).replace(/\s+/g, '');
    if (!s) return null;
    var list = story.clues;
    var i, c;
    for (i = 0; i < list.length; i++) {
      c = list[i];
      if (norm(c.code).replace(/\s+/g, '') === s) return c;
    }
    /* 宽容格式：yh3 / yh03 / 3 / 03 */
    var m = s.match(/^(?:yh)?-?0?(\d{1,2})$/);
    if (m) {
      var want = 'YH-0' + m[1];
      for (i = 0; i < list.length; i++) if (list[i].code === want) return list[i];
    }
    /* 允许输入空间名（中英文） */
    for (i = 0; i < list.length; i++) {
      c = list[i];
      if (flatText(c.spot).toLowerCase().indexOf(norm(input)) >= 0 && norm(input).length >= 2) return c;
    }
    return null;
  }

  function unlockClue(state, input, story) {
    var clue = findClue(input, story);
    if (!clue) return { ok: false, reason: 'wrong' };
    if (state.clues.indexOf(clue.code) >= 0) return { ok: false, reason: 'dup', clue: clue };
    state.clues.push(clue.code);
    return { ok: true, reason: 'ok', clue: clue };
  }

  function progress(state, story) {
    var need = story.needCluesToAdvance;
    return {
      found: state.clues.length,
      need: need,
      act: state.act,
      ready: state.clues.length >= need
    };
  }

  function canAdvance(state, story) {
    if (state.act >= story.acts.length) return false;
    if (state.act === 1) return true;
    return state.clues.length >= story.needCluesToAdvance;
  }

  function advance(state, story) {
    if (!canAdvance(state, story)) return { ok: false, reason: 'need_more' };
    state.act += 1;
    return { ok: true, act: state.act };
  }

  function choose(state, choiceId, story) {
    var i, choice = null;
    for (i = 0; i < story.choices.length; i++) {
      if (story.choices[i].id === choiceId) { choice = story.choices[i]; break; }
    }
    if (!choice) return { ok: false, reason: 'no_such_choice' };
    state.choiceId = choice.id;
    state.endingId = choice.endingId;
    state.finishedAt = now();
    return { ok: true, ending: endingById(story, choice.endingId) };
  }

  function endingById(story, id) {
    for (var i = 0; i < story.endings.length; i++) {
      if (story.endings[i].id === id) return story.endings[i];
    }
    return null;
  }

  /* ---------- 埋点与统计 ---------- */
  function logEvent(list, type, data) {
    var ev = { t: now(), type: type };
    if (data) { for (var k in data) { if (Object.prototype.hasOwnProperty.call(data, k)) ev[k] = data[k]; } }
    list.push(ev);
    if (list.length > 5000) list.splice(0, list.length - 5000);
    return ev;
  }

  function countBy(list, key) {
    var m = {}, i;
    for (i = 0; i < list.length; i++) {
      var k = list[i][key];
      if (k == null) continue;
      m[k] = (m[k] || 0) + 1;
    }
    return m;
  }

  function aggregate(events, kb) {
    var i, e;
    var sessions = 0, clues = 0, finished = 0, ratings = [], langs = {}, heat = {}, acts = {};

    for (i = 0; i < events.length; i++) {
      e = events[i];
      if (e.type === 'session_start') sessions++;
      else if (e.type === 'clue') {
        clues++;
        heat[e.kbId] = (heat[e.kbId] || 0) + 1;
      } else if (e.type === 'ending') finished++;
      else if (e.type === 'rating' && typeof e.value === 'number') ratings.push(e.value);
      else if (e.type === 'act') acts[e.act] = (acts[e.act] || 0) + 1;
      else if (e.type === 'search' && e.kbId) heat[e.kbId] = (heat[e.kbId] || 0) + 1;
      if (e.type === 'session_start' && e.lang) langs[e.lang] = (langs[e.lang] || 0) + 1;
    }
    if (!sessions && langs && Object.keys(langs).length === 0 && events.length) sessions = 0;

    var avg = 0;
    for (i = 0; i < ratings.length; i++) avg += ratings[i];
    if (ratings.length) avg = Math.round((avg / ratings.length) * 10) / 10;

    var langRows = [];
    var langTotal = 0;
    for (var L in langs) { if (Object.prototype.hasOwnProperty.call(langs, L)) langTotal += langs[L]; }
    for (L in langs) {
      if (Object.prototype.hasOwnProperty.call(langs, L)) {
        langRows.push({ key: L, count: langs[L], pct: langTotal ? Math.round(langs[L] * 100 / langTotal) : 0 });
      }
    }
    langRows.sort(function (a, b) { return b.count - a.count; });

    var heatRows = [];
    var heatMax = 0, hk;
    for (hk in heat) { if (Object.prototype.hasOwnProperty.call(heat, hk)) heatMax = Math.max(heatMax, heat[hk]); }
    for (hk in heat) {
      if (!Object.prototype.hasOwnProperty.call(heat, hk)) continue;
      var name = hk;
      if (kb) {
        for (i = 0; i < kb.entries.length; i++) {
          if (kb.entries[i].id === hk) { name = kb.entries[i].name.zh; break; }
        }
      }
      heatRows.push({
        key: hk, name: name, count: heat[hk],
        pct: heatMax ? Math.round(heat[hk] * 100 / heatMax) : 0
      });
    }
    heatRows.sort(function (a, b) { return b.count - a.count; });
    heatRows = heatRows.slice(0, 8);

    var funnel = [
      { key: 'act1', label: 1, count: acts[1] || 0 },
      { key: 'act2', label: 2, count: acts[2] || 0 },
      { key: 'act3', label: 3, count: acts[3] || 0 },
      { key: 'end', label: 4, count: finished }
    ];
    var fmax = 0;
    for (i = 0; i < funnel.length; i++) fmax = Math.max(fmax, funnel[i].count);
    for (i = 0; i < funnel.length; i++) funnel[i].pct = fmax ? Math.round(funnel[i].count * 100 / fmax) : 0;

    return {
      sessions: sessions,
      cluesUnlocked: clues,
      endings: finished,
      ratingCount: ratings.length,
      avgRating: avg,
      langs: langRows,
      heat: heatRows,
      funnel: funnel,
      totalEvents: events.length
    };
  }

  /* ---------- 导出 ---------- */
  return {
    LOW_THRESHOLD: LOW_THRESHOLD,
    tokens: tokens,
    search: search,
    compose: compose,
    llmHint: llmHint,
    newStory: newStory,
    findClue: findClue,
    unlockClue: unlockClue,
    progress: progress,
    canAdvance: canAdvance,
    advance: advance,
    choose: choose,
    endingById: endingById,
    logEvent: logEvent,
    aggregate: aggregate
  };
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = Engine; }
if (typeof window !== 'undefined') { window.Engine = Engine; }
