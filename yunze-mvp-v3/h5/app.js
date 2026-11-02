/* ==========================================================================
 * 云泽璞舍 · 洱海密语  —  H5 应用逻辑
 * 无框架、无构建、无网络请求：可直接双击 index.html 打开，也可部署到任意静态托管。
 * 数据与算法全部来自 data/*.js（由 tools/sync.mjs 从 shared/ 复制）。
 * ========================================================================== */

(function () {
  'use strict';

  var LANG_LABEL = { zh: '中文', en: 'EN', ja: '日本語', es: 'ES', ar: 'عربي', hi: 'हिंदी', ko: '한국어' };
  var TTS_LANG = { zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', es: 'es-ES', ar: 'ar-SA', hi: 'hi-IN', ko: 'ko-KR' };
  var LANG_KEYS = ['zh', 'en', 'ja', 'es', 'ar', 'hi', 'ko'];
  var TAB_META = [
    { hash: '#/', tab: 'decode', ico: '◎', key: 'navDecode' },
    { hash: '#/h', tab: 'homestay', ico: '🏡', key: 'navHomestay' },
    { hash: '#/t', tab: 'travel', ico: '🧭', key: 'navTravel' },
    { hash: '#/s', tab: 'story', ico: '☾', key: 'navStory' },
    { hash: '#/stats', tab: 'stats', ico: '◔', key: 'navStats' },
    { hash: '#/dm', tab: 'dm', ico: '✦', key: 'navDm' }
  ];

  var K_LANG = 'yz_lang', K_STORY = 'yz_story', K_EVENTS = 'yz_events', K_ROOM = 'yz_room';
  var K_CART = 'yz_cart';

  /* 民宿 / 旅游 内容层（由 data/showcase.js 注入 window.SHOWCASE） */
  var SHOWCASE = window.SHOWCASE || {
    ROOMS: [], ROUTES: [], SCENES: [], HOUSE_RULES: [], LOCATION: {},
    PHOTOS: {}, ROOM_IMG: {}, SCENE_IMG: {},
    roomById: function () { return null; }, routeById: function () { return null; }
  };

  /* 加入我们 / 文创商城 内容层（由 data/growth.js 注入 window.GROWTH） */
  var GROWTH = window.GROWTH || {
    JOIN_TRACKS: [], JOIN_POSITIONS: [], JOIN_STEPS: [], JOIN_MODE: {}, JOIN_CONTACT: {},
    SHOP_CATS: [], PRODUCTS: [], productById: function () { return null; }
  };

  var S = {
    lang: 'zh',
    story: null,
    events: [],
    picking: null,
    selectedRoom: null,
    lastLoggedQ: null,
    deepLinkDone: false,
    /* 文创商城 / 加入我们 */
    cart: {},
    shopCat: 'all',
    joinTrack: '',
    joinDone: false
  };

  /* ---------------- 存储 ---------------- */
  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function save(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
  }
  function boot() {
    var l = load(K_LANG, null);
    if (l && LANG_LABEL[l]) {
      S.lang = l;
    } else {
      var n = (navigator.language || 'zh').toLowerCase();
      var hit = null;
      for (var i = 0; i < LANG_KEYS.length; i++) {
        if (n.indexOf(LANG_KEYS[i]) === 0) { hit = LANG_KEYS[i]; break; }
      }
      S.lang = hit || 'en';
    }
    S.story = load(K_STORY, null);
    S.events = load(K_EVENTS, []);
    if (!Array.isArray(S.events)) S.events = [];
    S.selectedRoom = load(K_ROOM, null);
    S.cart = load(K_CART, {});
    if (!S.selectedRoom) S.selectedRoom = null;
    if (!S.cart || typeof S.cart !== 'object' || Array.isArray(S.cart)) S.cart = {};
    if (S.story && typeof S.story !== 'object') S.story = null;
    if (S.story) {
      /* 兼容旧版本 / 损坏数据，避免渲染时抛异常 */
      if (!Array.isArray(S.story.clues)) S.story.clues = [];
      if (typeof S.story.act !== 'number' || S.story.act < 1 || S.story.act > 3) S.story.act = 1;
      if (typeof S.story.rating !== 'number') S.story.rating = 0;
      if (S.story.roleId && !roleById(S.story.roleId)) S.story = null;
    }
  }
  function persist() {
    save(K_LANG, S.lang);
    save(K_STORY, S.story);
    save(K_EVENTS, S.events);
    save(K_ROOM, S.selectedRoom);
    save(K_CART, S.cart);
  }

  /* 照片背景：缺失时只显示渐变，不报错。返回 CSS background 值 */
  function photoBg(name, grad) {
    var f = SHOWCASE.PHOTOS && SHOWCASE.PHOTOS[name];
    var url = f ? ('assets/' + f) : '';
    if (url) return grad + ';background-image:url(' + url + ');background-size:cover;background-position:center';
    return grad;
  }

  /* 行程「第 N 天」随语言变化 */
  function dayLabel(n) {
    if (S.lang === 'zh') return '第 ' + n + ' 天';
    if (S.lang === 'ja') return '第 ' + n + ' 日';
    return 'Day ' + n;
  }

  /* ---------------- 工具 ---------------- */
  function tt(k) { return window.t(S.lang, k); }
  function P(obj) { return window.pick(S.lang, obj); }
  function isFb(obj) { return window.isFallback(S.lang, obj); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function byId(id) {
    for (var i = 0; i < KB.entries.length; i++) if (KB.entries[i].id === id) return KB.entries[i];
    return null;
  }
  function roleById(id) {
    for (var i = 0; i < STORY.roles.length; i++) if (STORY.roles[i].id === id) return STORY.roles[i];
    return null;
  }
  function clueByCode(code) {
    for (var i = 0; i < STORY.clues.length; i++) if (STORY.clues[i].code === code) return STORY.clues[i];
    return null;
  }
  function catKey(cat) { return 'cat' + cat.charAt(0).toUpperCase() + cat.slice(1); }

  function srcTag(s) {
    if (s.pending) return '<span class="tag pending">' + tt('srcPending') + '</span>';
    if (s.kind === 'ich') return '<span class="tag">' + tt('srcIch') + '</span>';
    return '<span class="tag">' + tt('srcFieldwork') + '</span>';
  }

  function toast(msg) {
    var root = document.getElementById('overlay-root');
    if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1900);
  }

  function log(type, data) {
    window.Engine.logEvent(S.events, type, data);
    persist();
  }

  /* ---------------- 弹层 ---------------- */
  function showSheet(html) {
    var root = document.getElementById('overlay-root');
    root.innerHTML = '<div class="overlay"><div class="sheet">' + html + '</div></div>';
  }
  function closeSheet() {
    document.getElementById('overlay-root').innerHTML = '';
  }

  /* ---------------- 路由 ---------------- */
  function parseRoute() {
    var raw = location.hash.replace(/^#/, '');
    if (!raw) raw = '/';
    var qi = raw.indexOf('?');
    var path = qi >= 0 ? raw.slice(0, qi) : raw;
    var qs = qi >= 0 ? raw.slice(qi + 1) : '';
    var params = {};
    qs.split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('=');
      var k = i >= 0 ? kv.slice(0, i) : kv;
      var v = i >= 0 ? kv.slice(i + 1) : '';
      try { params[decodeURIComponent(k)] = decodeURIComponent(v); } catch (e) {}
    });
    var parts = path.split('/').filter(function (p) { return p !== ''; }).map(function (p) {
      try { return decodeURIComponent(p); } catch (e) { return p; }
    });
    return { parts: parts, params: params };
  }
  function go(hash) {
    if (location.hash === hash) { render(); }
    else { location.hash = hash; }
  }
  function decodeQ(q) { return '#/q/' + encodeURIComponent(q); }

  /* ================= 视图 ================= */

  function viewHome() {
    var phCourtyard = photoBg('courtyard', 'linear-gradient(135deg,#2f6d5b,#17253b)');
    var phErhai = photoBg('erhai', 'linear-gradient(135deg,#9cc4cf,#2f6d5b)');
    var feat =
      '<div class="eyebrow">' + esc(tt('featHeading')) + '</div>' +
      '<div class="feat-grid">' +
        '<a class="feat" href="#/h" style="' + phCourtyard + '">' +
          '<div class="feat-emoji">🏡</div>' +
          '<div class="feat-title">' + esc(tt('featStay')) + '</div>' +
          '<div class="feat-sub">' + esc(tt('featStaySub')) + '</div>' +
          '<div class="feat-go">→</div>' +
        '</a>' +
        '<a class="feat" href="#/t" style="' + phErhai + '">' +
          '<div class="feat-emoji">🧭</div>' +
          '<div class="feat-title">' + esc(tt('featTravel')) + '</div>' +
          '<div class="feat-sub">' + esc(tt('featTravelSub')) + '</div>' +
          '<div class="feat-go">→</div>' +
        '</a>' +
        '<a class="feat" href="#/shop" style="linear-gradient(135deg,#c9a14a,#8a6a33)">' +
          '<div class="feat-emoji">🎁</div>' +
          '<div class="feat-title">' + esc(tt('featShop')) + '</div>' +
          '<div class="feat-sub">' + esc(tt('featShopSub')) + '</div>' +
          '<div class="feat-go">→</div>' +
        '</a>' +
        '<a class="feat" href="#/join" style="linear-gradient(135deg,#b13a2e,#6d2820)">' +
          '<div class="feat-emoji">🤝</div>' +
          '<div class="feat-title">' + esc(tt('featJoin')) + '</div>' +
          '<div class="feat-sub">' + esc(tt('featJoinSub')) + '</div>' +
          '<div class="feat-go">→</div>' +
        '</a>' +
      '</div>';

    var cards = KB.entries.map(function (e) {
      return '<a class="obj" href="#/d/' + e.id + '">' +
        '<span class="emoji">' + e.emoji + '</span>' +
        '<div class="nm">' + esc(P(e.name)) + '</div>' +
        '<div class="sub">' + esc(tt(catKey(e.cat))) + '</div>' +
        '</a>';
    }).join('');

    var tries = tt('homeTryList');
    if (!Array.isArray(tries)) tries = [];
    var chips = tries.map(function (q) {
      return '<button class="chip" data-act="ask" data-q="' + esc(q) + '">' + esc(q) + '</button>';
    }).join('');

    return '<div class="h1">' + esc(tt('homeHero')) + '</div>' +
      '<p class="lead">' + esc(tt('homeLead')) + '</p>' +
      feat +
      '<form class="search" data-act="askform">' +
        '<input id="q" type="search" autocomplete="off" placeholder="' + esc(tt('homeSearchPh')) + '">' +
        '<button class="btn" type="submit">' + esc(tt('homeAsk')) + '</button>' +
      '</form>' +
      '<div class="eyebrow">' + esc(tt('homeTry')) + '</div>' +
      '<div class="chips">' + chips + '</div>' +
      '<div class="eyebrow">' + esc(tt('homeObjects')) + '</div>' +
      '<div class="grid">' + cards + '</div>' +
      '<div class="footnote">' + esc(tt('homeNotice')) + '</div>';
  }

  function entryBlock(e, withClueBadge) {
    var body = P(e.body);
    var paras = Array.isArray(body) ? body : (body ? [body] : []);
    var facts = P(e.facts);
    if (!Array.isArray(facts)) facts = facts ? [facts] : [];

    var html = '<div class="entry-head">' +
        '<span class="emoji">' + e.emoji + '</span>' +
        '<div class="grow">' +
          '<div class="entry-title">' + esc(P(e.name)) + '</div>' +
          '<div class="entry-meta">' +
            '<span class="pill">' + esc(tt(catKey(e.cat))) + '</span>' +
            '<span class="pill jade">' + esc(e.id) + '</span>' +
            (withClueBadge ? '<span class="pill red">' + esc(tt('decodeClue')) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';

    if (isFb(e.body)) html += '<div class="mt12"><span class="pill gold">' + esc(tt('decodeFallback')) + '</span></div>';

    html += '<div class="mt12 quote">' + esc(P(e.summary)) + '</div>';

    html += '<div class="eyebrow">' + esc(tt('decodeBody')) + '</div>';
    html += paras.map(function (p) { return '<p class="para">' + esc(p) + '</p>'; }).join('');

    if (facts.length) {
      html += '<div class="eyebrow">' + esc(tt('decodeFacts')) + '</div><ul class="facts">' +
        facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>';
    }

    if (e.sources && e.sources.length) {
      html += '<div class="eyebrow">' + esc(tt('decodeSources')) + '</div><ol class="sources">' +
        e.sources.map(function (s) {
          return '<li><span>' + esc(P(s.label)) + '</span>' + srcTag(s) + '</li>';
        }).join('') + '</ol>';
    }

    var exp = e.experience ? P(e.experience) : '';
    if (exp) html += '<div class="expbox"><b>' + esc(tt('decodeExp')) + '</b>' + esc(exp) + '</div>';

    html += '<div class="row mt16">' +
      '<button class="btn ghost sm" data-act="speak" data-id="' + e.id + '">🔊 ' + esc(tt('decodeSpeak')) + '</button>' +
      '<button class="btn ghost sm" data-act="fb" data-v="1" data-kb="' + e.id + '">👍 ' + esc(tt('decodeHelpful')) + '</button>' +
      '<button class="btn ghost sm" data-act="fb" data-v="0" data-kb="' + e.id + '">👎 ' + esc(tt('decodeUnhelpful')) + '</button>' +
      '</div>';

    return html;
  }

  function viewDecodeEntry(id) {
    var e = byId(id);
    if (!e) return '<div class="empty"><span class="big">🕯️</span>' + esc(tt('decodeLowTitle')) +
      '<div class="mt12"><a class="btn ghost" href="#/">' + esc(tt('commonBack')) + '</a></div></div>';
    return entryBlock(e, false) +
      '<div class="mt16"><a class="btn ghost wide" href="#/">' + esc(tt('commonBack')) + '</a></div>';
  }

  function viewDecodeQuery(q) {
    var res = window.Engine.compose(q, KB);
    var head = '<div class="eyebrow">' + esc(tt('homeAsk')) + ' · «' + esc(q) + '»</div>';

    if (S.lastLoggedQ !== q) {
      S.lastLoggedQ = q;
      log('search', { q: q, hit: res.kind === 'answer' ? res.entry.id : null, kbId: res.kind === 'answer' ? res.entry.id : null });
    }

    if (res.kind === 'low') {
      var items = (res.items || []).map(function (e) {
        return '<a class="obj" href="#/d/' + e.id + '">' +
          '<span class="emoji">' + e.emoji + '</span>' +
          '<div class="nm">' + esc(P(e.name)) + '</div>' +
          '<div class="sub">' + esc(tt(catKey(e.cat))) + '</div></a>';
      }).join('');

      return head +
        '<div class="card mt8">' +
          '<span class="pill red">' + esc(tt('decodeLowTitle')) + '</span>' +
          '<p class="para mt12">' + esc(tt('decodeLowBody')) + '</p>' +
        '</div>' +
        (items ? '<div class="eyebrow">' + esc(tt('decodeRelated')) + '</div><div class="grid">' + items + '</div>' : '') +
        '<div class="mt16"><a class="btn ghost wide" href="#/">' + esc(tt('commonBack')) + '</a></div>';
    }

    var bar = '<div class="match">' +
      '<span class="pill jade">' + esc(tt('decodeMatch')) + '</span>' +
      '<span class="track"><span class="fill" style="width:' + res.pct + '%"></span></span>' +
      '<span class="num">' + res.pct + '%</span></div>';

    var rel = (res.related || []).map(function (e) {
      return '<a class="obj" href="#/d/' + e.id + '">' +
        '<span class="emoji">' + e.emoji + '</span>' +
        '<div class="nm">' + esc(P(e.name)) + '</div>' +
        '<div class="sub">' + esc(tt(catKey(e.cat))) + '</div></a>';
    }).join('');

    return head + bar + entryBlock(res.entry, false) +
      (rel ? '<div class="eyebrow">' + esc(tt('decodeRelated')) + '</div><div class="grid">' + rel + '</div>' : '') +
      '<div class="mt16"><a class="btn ghost wide" href="#/">' + esc(tt('commonBack')) + '</a></div>';
  }

  function viewStoryHub() {
    var st = S.story;
    var html = '<div class="h1">' + esc(tt('storyTitle')) + '</div>' +
      '<p class="lead">' + esc(tt('storyLead')) + '</p>';

    if (st && st.roleId && !st.endingId) {
      var role = roleById(st.roleId);
      var prog = window.Engine.progress(st, STORY);
      html += '<div class="card">' +
        '<div class="row between">' +
          '<div><span class="pill red">' + esc(tt('storyContinue')) + '</span>' +
          '<div class="entry-title" style="font-size:16px;margin-top:8px">' +
            esc(role ? P(role.name) : '') + '</div></div>' +
          '<div style="text-align:right"><div class="kv" style="font-family:var(--serif);font-size:20px;font-weight:700">' +
            prog.found + '/' + prog.need + '</div>' +
            '<div class="footnote" style="margin:2px 0 0">' + esc(tt('storyProgress')) + '</div></div>' +
        '</div>' +
        '<a class="btn wide mt12" href="#/s/play">' + esc(tt('storyContinue')) + ' →</a>' +
        '</div>';
    }

    if (st && st.endingId) {
      var end = window.Engine.endingById(STORY, st.endingId);
      html += '<div class="card">' +
        '<span class="pill jade">' + esc(tt('storyEnding')) + '</span>' +
        '<div class="entry-title" style="font-size:16px;margin-top:8px">' + esc(end ? P(end.title) : '') + '</div>' +
        '<p class="para mt8">' + esc(end ? P(end.lesson) : '') + '</p>' +
        '<a class="btn wide mt12" href="#/s/play">' + esc(tt('storyEnding')) + ' →</a>' +
        '</div>';
    }

    var selected = S.picking || (st && st.roleId) || null;
    if (st && st.endingId) selected = null;

    html += '<div class="eyebrow">' + esc(tt('storyPick')) + '</div>';
    html += STORY.roles.map(function (r) {
      var on = selected === r.id;
      return '<button class="role' + (on ? ' on' : '') + '" data-act="pickRole" data-v="' + r.id + '">' +
        '<span class="av">' + esc(P(r.name).slice(0, 1)) + '</span>' +
        '<span class="grow">' +
          '<span class="rn" style="display:block">' + esc(P(r.name)) + '</span>' +
          '<span class="rt" style="display:block">' + esc(P(r.tag)) + '</span>' +
          '<span class="rd" style="display:block">' + esc(P(r.desc)) + '</span>' +
        '</span></button>';
    }).join('');

    if (selected) {
      var rr = roleById(selected);
      if (rr) {
        html += '<div class="secret mt12"><b>' + esc(tt('storySecret')) + '</b>' + esc(P(rr.secret)) + '</div>' +
          '<button class="btn red wide mt12" data-act="startStory" data-v="' + selected + '">' +
          esc(tt('storyStart')) + '</button>';
      }
    }

    html += '<div class="footnote">' + esc(tt('storySub')) + '</div>';
    return html;
  }

  function viewStoryPlay() {
    var st = S.story;
    if (!st || !st.roleId) {
      return '<div class="empty"><span class="big">🌙</span>' + esc(tt('storyPick')) +
        '<div class="mt12"><a class="btn" href="#/s">' + esc(tt('storyPick')) + '</a></div></div>';
    }

    var html = '';

    /* 结局 */
    if (st.endingId) {
      var end = window.Engine.endingById(STORY, st.endingId);
      if (!end) { st.endingId = null; }
      else {
        html += '<div class="ending">' +
          '<div class="ec">' + esc(end.code) + '</div>' +
          '<div class="et">' + esc(P(end.title)) + '</div>';
        var eb = P(end.body);
        if (!Array.isArray(eb)) eb = [eb];
        html += eb.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
        html += '<div class="lesson"><b>' + esc(tt('storyLesson')) + '</b>' + esc(P(end.lesson)) + '</div></div>';

        html += '<div class="card mt12">' +
          '<div class="row between">' +
            '<span class="pill">' + esc(tt('storyRate')) + '</span>' +
            '<span class="pill jade">' + (st.rating ? st.rating + ' / 5' : '—') + '</span>' +
          '</div>' +
          '<div class="stars">' + [1, 2, 3, 4, 5].map(function (n) {
            return '<button data-act="rate" data-v="' + n + '" class="' + (st.rating >= n ? 'on' : '') + '">★</button>';
          }).join('') + '</div>' +
          (st.rating ? '<div class="footnote" style="margin-top:0">' + esc(tt('storyRated')) + '</div>' : '') +
          '</div>';

        html += '<div class="row mt12">' +
          '<button class="btn ghost grow" data-act="restart">' + esc(tt('storyRestart')) + '</button>' +
          '<a class="btn grow" href="#/stats">' + esc(tt('navStats')) + ' →</a></div>';
        return html;
      }
    }

    var act = STORY.acts[st.act - 1] || STORY.acts[0];
    var prog = window.Engine.progress(st, STORY);

    html += '<div class="act-rule">' + esc(tt('storyProgress')) + '</div>' +
      '<div class="act-title">' + esc(P(act.title)) + '</div>';

    if (st.act >= 2) {
      html += '<div class="prog"><span class="track"><span class="fill" style="width:' +
        Math.min(100, Math.round(prog.found * 100 / prog.need)) + '%"></span></span>' +
        '<span class="lab">' + prog.found + '/' + prog.need + '</span></div>';
    }

    var ab = P(act.body);
    if (!Array.isArray(ab)) ab = [ab];
    html += ab.map(function (p) { return '<p class="para">' + esc(p) + '</p>'; }).join('');

    if (st.act === 2) {
      html += '<div class="eyebrow">' + esc(tt('storyProgress')) + '</div>';
      html += '<div class="clues">' + STORY.clues.map(function (c) {
        var found = st.clues.indexOf(c.code) >= 0;
        return '<button class="clue ' + (found ? 'found' : 'locked') + '" data-act="openClue" data-code="' + c.code + '">' +
          '<span class="ci">' + (found ? c.icon : '🔒') + '</span>' +
          '<span class="cs" style="display:block">' + esc(found ? P(c.spot) : tt('storyLocked')) + '</span>' +
          '<span class="cc" style="display:block">' + esc(c.code) + '</span>' +
          '</button>';
      }).join('') + '</div>';

      html += '<form class="codebar" data-act="unlockform">' +
        '<input id="code" type="text" autocomplete="off" placeholder="' + esc(tt('storyCodePh')) + '">' +
        '<button class="btn" type="submit">' + esc(tt('storySubmit')) + '</button>' +
        '</form>' +
        '<button class="btn ghost wide mt8" data-act="simScan">📷 ' + esc(tt('storySimulate')) + '</button>';

      html += '<button class="btn wide mt16" data-act="next"' + (prog.ready ? '' : ' disabled') + '>' +
        esc(prog.ready ? tt('storyNext') : tt('storyNeedMore')) + '</button>';
    }

    if (st.act === 1) {
      html += '<button class="btn wide mt16" data-act="next">' + esc(tt('storyNext')) + ' →</button>';
    }

    if (st.act === 3) {
      html += '<div class="eyebrow">' + esc(tt('storyDecide')) + '</div>' +
        '<div class="choices">' + STORY.choices.map(function (c) {
          return '<button class="choice" data-act="choose" data-v="' + c.id + '">' +
            '<span class="ci">' + c.icon + '</span>' +
            '<span class="grow"><span class="cl" style="display:block">' + esc(P(c.label)) + '</span>' +
            '<span class="cs" style="display:block">' + esc(P(c.sub)) + '</span></span></button>';
        }).join('') + '</div>';
    }

    html += '<div class="row mt16">' +
      '<button class="btn ghost sm" data-act="restart">' + esc(tt('storyRestart')) + '</button>' +
      '<a class="btn ghost sm" href="#/dm">' + esc(tt('navDm')) + '</a></div>';

    return html;
  }

  function openClueSheet(code) {
    var c = clueByCode(code);
    if (!c) return;
    var st = S.story;
    var found = !!(st && st.clues.indexOf(code) >= 0);
    var e = byId(c.kbId);

    var html = '<div class="grab"></div>' +
      '<h3>' + c.icon + ' ' + esc(P(c.spot)) + '</h3>' +
      (found
        ? '<p class="para">' + esc(P(c.reward)) + '</p>'
        : '<p class="para" style="color:#8a6a33">🔒 ' + esc(tt('storyHintTitle')) + '：' + esc(P(c.hint)) + '</p>') +
      '<div class="row"><span class="pill jade">' + esc(c.code) + '</span>' +
      '<span class="pill">' + (found ? esc(tt('storyFound')) : esc(tt('storyLocked'))) + '</span></div>';

    if (found && e) {
      html += '<div class="eyebrow">' + esc(tt('storyLearnCard')) + '</div>' +
        '<a class="obj" href="#/d/' + e.id + '" data-act="closeSheet">' +
        '<span class="emoji">' + e.emoji + '</span>' +
        '<div class="nm">' + esc(P(e.name)) + '</div>' +
        '<div class="sub">' + esc(P(e.summary).slice(0, 30)) + '…</div></a>';
    }
    html += '<button class="btn ghost wide mt16" data-act="closeSheet">' + esc(tt('commonBack')) + '</button>';
    showSheet(html);
  }

  function viewDM() {
    var st = S.story;
    var logs = S.events.slice(-40).reverse();

    var html = '<div class="h1">' + esc(tt('dmTitle')) + '</div>' +
      '<p class="lead">' + esc(tt('dmLead')) + '</p>' +
      '<div class="kpis">' +
        '<div class="kpi"><div class="kv">' + (st ? st.act : '—') + '</div>' +
          '<div class="kl">' + esc(tt('dmAct')) + '</div></div>' +
        '<div class="kpi"><div class="kv" style="font-size:15px;line-height:1.4">' +
          esc(st && st.roleId ? P(roleById(st.roleId).name) : tt('dmNone')) + '</div>' +
          '<div class="kl">' + esc(tt('dmRole')) + '</div></div>' +
      '</div>';

    html += '<div class="eyebrow">' + esc(tt('dmClues')) + '</div>';
    html += STORY.clues.map(function (c) {
      var found = !!(st && st.clues.indexOf(c.code) >= 0);
      return '<div class="card" style="padding:11px 13px;margin-bottom:7px">' +
        '<div class="row between">' +
          '<div class="row" style="min-width:0">' +
            '<span>' + c.icon + '</span>' +
            '<span style="font-family:var(--serif);font-size:13px">' + esc(P(c.spot)) + '</span>' +
            '<span class="pill">' + esc(c.code) + '</span>' +
          '</div>' +
          (found
            ? '<span class="pill jade">' + esc(tt('storyFound')) + '</span>'
            : '<button class="btn sm ghost" data-act="dmPush" data-code="' + c.code + '">' + esc(tt('dmPush')) + '</button>') +
        '</div></div>';
    }).join('');

    html += '<div class="row mt16">' +
      '<button class="btn ghost grow" data-act="dmReset">' + esc(tt('dmReset')) + '</button>' +
      '<a class="btn ghost grow" href="#/s/play">' + esc(tt('navStory')) + ' →</a></div>';

    html += '<div class="eyebrow">' + esc(tt('dmLog')) + '</div><div class="log">' +
      (logs.length ? logs.map(function (ev) {
        var d = new Date(ev.t);
        var hm = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
        return '<div class="li"><span class="tm">' + hm + '</span>' + esc(ev.type) +
          (ev.kbId ? ' · ' + esc(ev.kbId) : '') +
          (ev.code ? ' · ' + esc(ev.code) : '') +
          (ev.act ? ' · act' + esc(ev.act) : '') +
          (ev.lang ? ' · ' + esc(ev.lang) : '') + '</div>';
      }).join('') : '<div class="li">' + esc(tt('dmEmpty')) + '</div>') + '</div>';

    html += '<div class="footnote">' + esc(tt('dmNote')) + '</div>';
    return html;
  }

  function viewStats() {
    var agg = window.Engine.aggregate(S.events, KB);
    var html = '<div class="h1">' + esc(tt('statsTitle')) + '</div>' +
      '<p class="lead">' + esc(tt('statsLead')) + '</p>';

    if (!agg.totalEvents) {
      return html + '<div class="empty"><span class="big">📊</span>' + esc(tt('statsEmpty')) +
        '<div class="mt12"><a class="btn" href="#/s">' + esc(tt('navStory')) + ' →</a></div></div>';
    }

    html += '<div class="kpis">' +
      '<div class="kpi"><div class="kv">' + agg.sessions + '</div><div class="kl">' + esc(tt('statsSessions')) + '</div></div>' +
      '<div class="kpi"><div class="kv">' + agg.cluesUnlocked + '</div><div class="kl">' + esc(tt('statsUnlocked')) + '</div></div>' +
      '<div class="kpi"><div class="kv">' + agg.endings + '</div><div class="kl">' + esc(tt('statsFinished')) + '</div></div>' +
      '<div class="kpi"><div class="kv">' + (agg.ratingCount ? agg.avgRating : '—') + '</div><div class="kl">' + esc(tt('statsAvg')) + '</div></div>' +
      '</div>';

    if (agg.langs.length) {
      html += '<div class="eyebrow">' + esc(tt('statsLangs')) + '</div><div class="bars">' +
        agg.langs.map(function (r) {
          return '<div class="brow"><div class="bl"><b>' + esc(LANG_LABEL[r.key] || r.key) +
            '</b><span>' + r.count + '</span></div><div class="track">' +
            '<div class="fill" style="width:' + r.pct + '%"></div></div></div>';
        }).join('') + '</div>';
    }

    if (agg.heat.length) {
      html += '<div class="eyebrow">' + esc(tt('statsHeat')) + '</div><div class="bars">' +
        agg.heat.map(function (r) {
          return '<div class="brow alt"><div class="bl"><b>' + esc(r.name) +
            '</b><span>' + r.count + '</span></div><div class="track">' +
            '<div class="fill" style="width:' + r.pct + '%"></div></div></div>';
        }).join('') + '</div>';
    }

    html += '<div class="eyebrow">' + esc(tt('statsFunnel')) + '</div><div class="funnel">' +
      agg.funnel.map(function (f) {
        var h = Math.max(6, Math.round(f.pct * 0.68));
        return '<div class="fcol"><div class="fn">' + f.count + '</div>' +
          '<div class="fb" style="height:' + h + 'px"></div>' +
          '<div class="fl">' + (f.label === 4 ? esc(tt('storyEnding')) : f.label) + '</div></div>';
      }).join('') + '</div>';

    html += '<div class="row mt16">' +
      '<button class="btn ghost grow" data-act="statsReset">' + esc(tt('statsReset')) + '</button>' +
      '<button class="btn ghost grow" data-act="statsExport">' + esc(tt('statsExport')) + '</button></div>';

    return html;
  }

  /* ================= 民宿（选房间） ================= */
  function viewHomestay() {
    var sel = S.selectedRoom ? SHOWCASE.roomById(S.selectedRoom) : null;
    var selBanner = '';
    if (sel) {
      selBanner = '<div class="card picked">' +
        '<span class="pill jade">' + esc(tt('hsPicked')) + '</span> ' +
        '<b>' + esc(P(sel.name)) + '</b>' +
        ' <a class="lnk" href="#/h/' + sel.id + '">' + esc(tt('hsBack')) + ' →</a>' +
        ' <button class="lnkbtn" data-act="clearRoom">×</button>' +
        '</div>';
    }

    var rooms = SHOWCASE.ROOMS.map(function (r) {
      var on = S.selectedRoom === r.id;
      var img = SHOWCASE.ROOM_IMG[r.type] || '';
      return '<a class="room" href="#/h/' + r.id + '">' +
        (img ? '<img class="thumb" src="' + img + '" alt="">' : '') +
        (on ? '<span class="badge">' + esc(tt('hsSelected')) + '</span>' : '') +
        '<div class="rn">' + esc(P(r.name)) + '</div>' +
        '<div class="rmeta">' + esc(P(r.view)) + '</div>' +
        '<div class="rprice"><b>' + r.price + '</b> ' + esc(tt('hsPerNight')) + '</div>' +
        '</a>';
    }).join('');

    var rules = (SHOWCASE.HOUSE_RULES || []).map(function (x) {
      return '<li>' + esc(P(x)) + '</li>';
    }).join('');

    return '<div class="h1">' + esc(tt('hsTitle')) + '</div>' +
      '<p class="lead">' + esc(tt('hsLead')) + '</p>' +
      selBanner +
      '<div class="eyebrow">' + esc(tt('hsIntro')) + '</div>' +
      '<p class="para">' + esc(P(SHOWCASE.LOCATION)) + '</p>' +
      '<p class="para mt8">' + esc(tt('hsIntroBody')) + '</p>' +
      '<div class="eyebrow">' + esc(tt('hsRooms')) + '</div>' +
      '<div class="rooms">' + rooms + '</div>' +
      '<div class="eyebrow">' + esc(tt('hsHouseRules')) + '</div>' +
      '<ul class="rules">' + rules + '</ul>';
  }

  function viewRoom(id) {
    var r = SHOWCASE.roomById(id);
    if (!r) return '<div class="empty"><span class="big">🏡</span>' + esc(tt('hsRooms')) +
      '<div class="mt12"><a class="btn ghost" href="#/h">' + esc(tt('hsBack')) + '</a></div></div>';
    var on = S.selectedRoom === r.id;
    var header = photoBg('room', 'linear-gradient(135deg,#2f6d5b,#17253b)');
    var am = (r.amenities || []).map(function (a) {
      return '<span class="pill">' + esc(a) + '</span>';
    }).join('');
    return '<a class="back" href="#/h">← ' + esc(tt('hsBack')) + '</a>' +
      '<div class="hero" style="' + header + '"><span class="hero-emoji">' + r.emoji + '</span>' +
        '<div class="hero-title">' + esc(P(r.name)) + '</div></div>' +
      '<div class="card mt12"><div class="specs">' +
        '<div><span class="sk">' + esc(tt('hsArea')) + '</span><span class="sv">' + r.area + ' ㎡</span></div>' +
        '<div><span class="sk">' + esc(tt('hsBeds')) + '</span><span class="sv">' + esc(P(r.beds)) + '</span></div>' +
        '<div><span class="sk">' + esc(tt('hsView')) + '</span><span class="sv">' + esc(P(r.view)) + '</span></div>' +
        '<div><span class="sk">' + esc(tt('hsPrice')) + '</span><span class="sv"><b>' + r.price + '</b> ' + esc(tt('hsPerNight')) + '</span></div>' +
      '</div></div>' +
      '<p class="para mt12">' + esc(P(r.desc)) + '</p>' +
      '<div class="eyebrow">' + esc(tt('hsAmenities')) + '</div><div class="pills">' + am + '</div>' +
      '<div class="eyebrow">' + esc(tt('hsSuitable')) + '</div><div class="para">' + esc(P(r.suitable)) + '</div>' +
      '<button class="btn ' + (on ? 'ghost' : 'red') + ' wide mt16" data-act="selectRoom" data-id="' + r.id + '">' +
        (on ? '✓ ' + esc(tt('hsSelected')) : esc(tt('hsSelect'))) + '</button>';
  }

  /* ================= 旅游（大理本地攻略） ================= */
  function viewTravel() {
    var routes = SHOWCASE.ROUTES.map(function (rt) {
      var img = SHOWCASE.SCENE_IMG[rt.theme] || '';
      return '<a class="route" href="#/t/' + rt.id + '">' +
        (img ? '<img class="thumb" src="' + img + '" alt="">' : '') +
        '<div class="rt-name">' + esc(P(rt.name)) + '</div>' +
        '<div class="rt-meta"><span class="pill">' + rt.days + ' ' + esc(tt('tvDays')) + '</span>' +
          '<span class="pill jade">' + esc(P(rt.level)) + '</span></div>' +
        '<div class="rt-sum">' + esc(P(rt.summary)) + '</div>' +
        '</a>';
    }).join('');

    var scenes = SHOWCASE.SCENES.map(function (sc) {
      var img = SHOWCASE.SCENE_IMG[sc.kind] || '';
      return '<div class="scene">' +
        (img ? '<img class="thumb sm" src="' + img + '" alt="">' : '') +
        '<div class="sc-name">' + esc(P(sc.name)) + '</div>' +
        '<div class="sc-desc">' + esc(P(sc.desc)) + '</div>' +
        '</div>';
    }).join('');

    return '<div class="h1">' + esc(tt('tvTitle')) + '</div>' +
      '<p class="lead">' + esc(tt('tvLead')) + '</p>' +
      '<div class="eyebrow">' + esc(tt('tvRoutes')) + '</div>' +
      '<div class="routes">' + routes + '</div>' +
      '<div class="eyebrow">' + esc(tt('tvScenes')) + '</div>' +
      '<div class="scenes">' + scenes + '</div>';
  }

  function viewRoute(id) {
    var rt = SHOWCASE.routeById(id);
    if (!rt) return '<div class="empty"><span class="big">🧭</span>' + esc(tt('tvRoutes')) +
      '<div class="mt12"><a class="btn ghost" href="#/t">' + esc(tt('tvBackRoutes')) + '</a></div></div>';
    var stops = rt.stops.map(function (s) {
      return '<div class="stop">' +
        '<div class="stop-day">' + dayLabel(s.day) + '</div>' +
        '<div class="stop-body">' +
          '<div class="stop-place">' + esc(P(s.place)) + '</div>' +
          '<div class="para">' + esc(P(s.desc)) + '</div>' +
          '<div class="tip">💡 ' + esc(tt('tvTip')) + '：' + esc(P(s.tip)) + '</div>' +
        '</div></div>';
    }).join('');
    var food = (rt.food || []).map(function (f) { return '<li>' + esc(P(f)) + '</li>'; }).join('');
    return '<a class="back" href="#/t">← ' + esc(tt('tvBackRoutes')) + '</a>' +
      '<div class="card"><div class="entry-title">' + esc(P(rt.name)) + '</div>' +
        '<div class="row" style="margin-top:8px">' +
          '<span class="pill">' + rt.days + ' ' + esc(tt('tvDays')) + '</span>' +
          '<span class="pill jade">' + esc(P(rt.level)) + '</span>' +
          '<span class="pill">' + esc(tt('tvSummary')) + '</span></div>' +
      '</div>' +
      '<p class="para mt12">' + esc(P(rt.summary)) + '</p>' +
      '<div class="eyebrow">' + esc(tt('tvItinerary')) + '</div>' + stops +
      '<div class="eyebrow">' + esc(tt('tvFood')) + '</div><ul class="rules">' + food + '</ul>' +
      '<div class="eyebrow">' + esc(tt('tvNote')) + '</div><p class="para">' + esc(P(rt.note)) + '</p>' +
      '<a class="btn ghost wide mt16" href="#/t">' + esc(tt('tvBackRoutes')) + '</a>';
  }

  /* ================= 加入我们（合作伙伴招募） ================= */
  function viewJoin() {
    var html = '<div class="h1">' + esc(tt('juTitle')) + '</div>' +
      '<p class="lead">' + esc(tt('juLead')) + '</p>';

    if (S.joinDone) {
      return html + '<div class="card">' +
        '<span class="pill jade">' + esc(tt('juDone')) + '</span>' +
        '<p class="para mt8">' + esc(tt('juDoneBody')) + '</p>' +
        '<div class="row mt12">' +
          '<button class="btn ghost grow" data-act="juReset">' + esc(tt('juAgain')) + '</button>' +
          '<a class="btn grow" href="#/">' + esc(tt('commonBack')) + '</a></div>' +
        '</div>' +
        '<div class="footnote">' + esc(P(GROWTH.JOIN_CONTACT)) + '</div>';
    }

    var tracks = GROWTH.JOIN_TRACKS.map(function (t) {
      var on = S.joinTrack === t.id;
      return '<button class="jtrack' + (on ? ' on' : '') + '" data-act="pickTrack" data-v="' + t.id + '">' +
        '<span class="jt-ico">' + t.emoji + '</span>' +
        '<div class="jt-body">' +
          '<div class="jt-name">' + esc(P(t.name)) + '</div>' +
          '<div class="jt-tag">' + esc(P(t.tag)) + '</div>' +
          '<div class="jt-desc">' + esc(P(t.desc)) + '</div>' +
        '</div></button>';
    }).join('');

    var positions = GROWTH.JOIN_POSITIONS.map(function (p) {
      return '<div class="jpos"><span class="jp-ico">' + p.emoji + '</span>' +
        '<div><div class="jt-name">' + esc(P(p.name)) + '</div>' +
        '<div class="jt-desc">' + esc(P(p.req)) + '</div></div></div>';
    }).join('');

    var steps = GROWTH.JOIN_STEPS.map(function (st) {
      return '<div class="jstep"><span class="js-n">' + st.n + '</span>' +
        '<div><div class="jt-name">' + esc(P(st.title)) + '</div>' +
        '<div class="jt-desc">' + esc(P(st.desc)) + '</div></div></div>';
    }).join('');

    html += '<div class="eyebrow">' + esc(tt('juTracks')) + '</div><div class="jtracks">' + tracks + '</div>' +
      '<div class="eyebrow">' + esc(tt('juPositions')) + '</div><div class="jpos-list">' + positions + '</div>' +
      '<div class="eyebrow">' + esc(tt('juSteps')) + '</div><div class="jsteps">' + steps + '</div>' +
      '<div class="card modebox"><b>' + esc(tt('juMode')) + '</b>' + esc(P(GROWTH.JOIN_MODE)) + '</div>' +
      '<div class="eyebrow">' + esc(tt('juApply')) + '</div>' +
      '<p class="para">' + esc(tt('juApplyLead')) + '</p>' +
      '<form class="applyform" data-act="joinform">' +
        '<label>' + esc(tt('juName')) + '<input id="juName" type="text" autocomplete="off" placeholder="' + esc(tt('juNamePh')) + '"></label>' +
        '<label>' + esc(tt('juContact')) + '<input id="juContact" type="text" autocomplete="off" placeholder="' + esc(tt('juContactPh')) + '"></label>' +
        '<label>' + esc(tt('juMsg')) + '<textarea id="juMsg" rows="3" placeholder="' + esc(tt('juMsgPh')) + '"></textarea></label>' +
        '<button class="btn red wide" type="submit">' + esc(tt('juSubmit')) + '</button>' +
      '</form>' +
      '<div class="footnote">' + esc(P(GROWTH.JOIN_CONTACT)) + '</div>';
    return html;
  }

  /* ================= 文创商城 ================= */
  var CAT_TONE = {
    tie: 'linear-gradient(135deg,#5d8a9c,#2f4a63)', wood: 'linear-gradient(135deg,#a07a4a,#6b4a2a)',
    wear: 'linear-gradient(135deg,#b13a2e,#6d2820)', paper: 'linear-gradient(135deg,#c9a14a,#8a6a33)',
    co: 'linear-gradient(135deg,#2f6d5b,#17253b)'
  };
  function catLabel(cat) {
    var k = cat === 'all' ? 'spCatAll' : 'spCat' + cat.charAt(0).toUpperCase() + cat.slice(1);
    return tt(k);
  }

  function cartCount() {
    var n = 0;
    for (var k in S.cart) n += S.cart[k];
    return n;
  }
  function cartTotal() {
    var n = 0;
    for (var k in S.cart) {
      var p = GROWTH.productById(k);
      if (p) n += p.price * S.cart[k];
    }
    return n;
  }

  function viewShop() {
    var cats = ['all'].concat(GROWTH.SHOP_CATS).map(function (c) {
      var on = S.shopCat === c;
      return '<button class="chip' + (on ? ' on' : '') + '" data-act="shopCat" data-v="' + c + '">' +
        esc(catLabel(c)) + '</button>';
    }).join('');

    var goods = GROWTH.PRODUCTS.filter(function (p) {
      return S.shopCat === 'all' || p.cat === S.shopCat;
    }).map(function (p) {
      var inBag = S.cart[p.id] || 0;
      return '<div class="good">' +
        '<div class="gd-head" style="' + (CAT_TONE[p.cat] || CAT_TONE.co) + '"><span class="gd-emoji">' + p.emoji + '</span>' +
          (inBag ? '<span class="badge">' + inBag + '</span>' : '') + '</div>' +
        '<div class="gd-name">' + esc(P(p.name)) + '</div>' +
        '<div class="gd-desc">' + esc(P(p.desc)) + '</div>' +
        '<div class="gd-row"><span class="gd-price"><b>' + p.price + '</b> ' + esc(tt('spCny')) + '</span>' +
          '<button class="btn sm" data-act="addCart" data-id="' + p.id + '">＋ ' + esc(tt('spAdd')) + '</button></div>' +
        '</div>';
    }).join('');

    var n = cartCount();
    var bagbar = '<div class="bagbar' + (n ? '' : ' empty') + '" data-act="openBag">' +
      '<span class="bb-ico">🧺 ' + esc(tt('spBag')) + (n ? ' · ' + n : '') + '</span>' +
      (n ? '<span class="bb-total">' + esc(tt('spTotal')) + ' <b>¥' + cartTotal() + '</b></span>' +
        '<span class="bb-go">' + esc(tt('spCheckout')) + ' →</span>'
          : '<span class="bb-empty">' + esc(tt('spBagEmpty')) + '</span>') +
      '</div>';

    return '<div class="h1">' + esc(tt('spTitle')) + '</div>' +
      '<p class="lead">' + esc(tt('spLead')) + '</p>' +
      '<div class="chips">' + cats + '</div>' +
      '<div class="goods">' + goods + '</div>' +
      bagbar +
      '<div class="footnote">' + esc(tt('spDemo')) + '</div>';
  }

  function openBagSheet() {
    var ids = Object.keys(S.cart);
    if (!ids.length) {
      toast(tt('spBagEmpty'));
      return;
    }
    var lines = ids.map(function (id) {
      var p = GROWTH.productById(id);
      var q = S.cart[id];
      if (!p) return '';
      return '<div class="bagline">' +
        '<span class="bl-ico">' + p.emoji + '</span>' +
        '<div class="bl-name">' + esc(P(p.name)) + '</div>' +
        '<div class="bl-qty">' +
          '<button class="btn sm ghost" data-act="decCart" data-id="' + id + '">−</button>' +
          '<b>' + q + '</b>' +
          '<button class="btn sm ghost" data-act="incCart" data-id="' + id + '">＋</button>' +
        '</div>' +
        '<div class="bl-sum">¥' + (p.price * q) + '</div>' +
        '<button class="lnkbtn" data-act="delItem" data-id="' + id + '">×</button>' +
        '</div>';
    }).join('');

    showSheet('<div class="grab"></div>' +
      '<h3>🧺 ' + esc(tt('spBag')) + '</h3>' +
      lines +
      '<div class="row between mt12"><span class="kv2">' + esc(tt('spTotal')) + '</span>' +
      '<span class="gd-price"><b>¥' + cartTotal() + '</b></span></div>' +
      '<button class="btn red wide mt12" data-act="checkout">' + esc(tt('spCheckout')) + '</button>' +
      '<div class="row mt8">' +
        '<button class="btn ghost sm grow" data-act="clearBag">' + esc(tt('spClear')) + '</button>' +
        '<button class="btn ghost sm grow" data-act="closeSheet">' + esc(tt('spBack')) + '</button>' +
      '</div>');
  }

  function checkout() {
    if (!cartCount()) return;
    log('shop_order', { count: cartCount(), total: cartTotal() });
    S.cart = {};
    persist();
    closeSheet();
    toast(tt('spChecked'));
    render();
  }


  /* ================= 主渲染 ================= */
  function render() {
    /* 阿拉伯语启用 RTL 文档方向（flex 行、文本对齐随写作方向自动镜像） */
    if (document.documentElement) {
      document.documentElement.lang = S.lang;
      document.documentElement.dir = (S.lang === 'ar') ? 'rtl' : 'ltr';
    }
    var r = parseRoute();
    var parts = r.parts;
    var tab = 'decode';
    var html;

    if (parts[0] === 'd' && parts[1]) html = viewDecodeEntry(parts[1]);
    else if (parts[0] === 'q' && parts[1]) html = viewDecodeQuery(parts[1]);
    else if (parts[0] === 's' && parts[1] === 'play') { html = viewStoryPlay(); tab = 'story'; }
    else if (parts[0] === 's') { html = viewStoryHub(); tab = 'story'; }
    else if (parts[0] === 'h' && parts[1]) { html = viewRoom(parts[1]); tab = 'homestay'; }
    else if (parts[0] === 'h') { html = viewHomestay(); tab = 'homestay'; }
    else if (parts[0] === 't' && parts[1]) { html = viewRoute(parts[1]); tab = 'travel'; }
    else if (parts[0] === 't') { html = viewTravel(); tab = 'travel'; }
    else if (parts[0] === 'join') { html = viewJoin(); tab = 'join'; }
    else if (parts[0] === 'shop') { html = viewShop(); tab = 'shop'; }
    else if (parts[0] === 'dm') { html = viewDM(); tab = 'dm'; }
    else if (parts[0] === 'stats') { html = viewStats(); tab = 'stats'; }
    else html = viewHome();

    var view = document.getElementById('view');
    view.innerHTML = html;
    view.scrollTop = 0;

    /* 顶栏 / 底栏文案 */
    var bn = document.getElementById('brandName');
    var bs = document.getElementById('brandSub');
    if (bn) bn.textContent = tt('brand');
    if (bs) bs.textContent = tt('brandSub');

    var tabs = document.querySelectorAll('.tabs a');
    for (var i = 0; i < tabs.length; i++) {
      var m = TAB_META[i];
      tabs[i].setAttribute('data-tab', m.tab);
      tabs[i].innerHTML = '<span class="ico">' + m.ico + '</span>' + esc(tt(m.key));
      tabs[i].classList.toggle('on', m.tab === tab);
    }

    var langs = document.getElementById('langs');
    if (langs) {
      var bs2 = langs.querySelectorAll('button');
      for (var j = 0; j < bs2.length; j++) {
        bs2[j].classList.toggle('on', bs2[j].getAttribute('data-lang') === S.lang);
      }
    }

    /* 现场二维码深链：#/s/play?clue=YH-03 */
    if (!S.deepLinkDone && r.params.clue) {
      S.deepLinkDone = true;
      var code = r.params.clue;
      try { history.replaceState(null, '', location.pathname + location.search + '#/s/play'); } catch (e) {}
      if (S.story && S.story.roleId) handleUnlock(code, false);
      else { S.pendingClue = code; }
    }
  }

  /* ================= 交互 ================= */
  function handleUnlock(input, quiet) {
    if (!S.story || !S.story.roleId) {
      toast(tt('storyPick'));
      go('#/s');
      return;
    }
    var res = window.Engine.unlockClue(S.story, input, STORY);
    if (res.ok) {
      log('clue', { code: res.clue.code, kbId: res.clue.kbId });
      render();
      openClueSheet(res.clue.code);
    } else if (res.reason === 'dup') {
      openClueSheet(res.clue.code);
    } else if (!quiet) {
      toast(tt('storyWrong'));
    }
  }

  function findNextLocked() {
    if (!S.story) return null;
    for (var i = 0; i < STORY.clues.length; i++) {
      if (S.story.clues.indexOf(STORY.clues[i].code) < 0) return STORY.clues[i];
    }
    return null;
  }

  function speak(id) {
    var e = byId(id);
    if (!e) return;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      toast('此浏览器不支持语音朗读');
      return;
    }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(P(e.name) + '。' + P(e.summary));
    u.lang = TTS_LANG[S.lang] || 'zh-CN';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }

  function exportJSON() {
    var data = { exportedAt: new Date().toISOString(), lang: S.lang, story: S.story, events: S.events };
    try {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'yunze-insight-' + Date.now() + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); if (a.parentNode) a.parentNode.removeChild(a); }, 500);
    } catch (e) { toast('导出失败'); }
  }

  /* 语言切换（顶栏） */
  (function bindLangs() {
    var wrap = document.getElementById('langs');
    if (!wrap) return;
    wrap.innerHTML = LANG_KEYS.map(function (l) {
      return '<button data-lang="' + l + '">' + LANG_LABEL[l] + '</button>';
    }).join('');
    wrap.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('[data-lang]') : null;
      if (!b) return;
      S.lang = b.getAttribute('data-lang');
      if (S.story) S.story.lang = S.lang;
      S.lastLoggedQ = null;
      log('lang', { value: S.lang });
      render();
    });
  })();

  /* 弹层：点遮罩关闭，点内容不关闭 */
  document.getElementById('overlay-root').addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('.sheet') : null;
    if (t && !ev.target.closest('[data-act="closeSheet"]')) return;
    closeSheet();
  });

  /* 委托点击 */
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-act]') : null;
    if (!t) return;
    var act = t.getAttribute('data-act');

    switch (act) {
      case 'closeSheet':
        closeSheet();
        break;

      case 'ask':
        var q = t.getAttribute('data-q') || '';
        if (q) go(decodeQ(q));
        break;

      case 'speak':
        speak(t.getAttribute('data-id'));
        break;

      case 'fb':
        log('feedback', { kbId: t.getAttribute('data-kb'), value: Number(t.getAttribute('data-v')) });
        toast(tt('decodeThanks'));
        break;

      case 'pickRole':
        S.picking = t.getAttribute('data-v');
        render();
        break;

      case 'startStory':
        S.story = window.Engine.newStory(t.getAttribute('data-v'), S.lang);
        S.picking = null;
        log('session_start', { lang: S.lang });
        go('#/s/play');
        if (S.pendingClue) {
          var pc = S.pendingClue;
          S.pendingClue = null;
          setTimeout(function () { handleUnlock(pc, false); }, 120);
        }
        break;

      case 'openClue':
        openClueSheet(t.getAttribute('data-code'));
        break;

      case 'simScan':
        var nc = findNextLocked();
        if (nc) handleUnlock(nc.code, false);
        else toast(tt('storyAlready'));
        break;

      case 'next':
        var adv = window.Engine.advance(S.story, STORY);
        if (adv.ok) { log('act', { act: adv.act }); render(); }
        else toast(tt('storyNeedMore'));
        break;

      case 'choose':
        var ch = window.Engine.choose(S.story, t.getAttribute('data-v'), STORY);
        if (ch.ok) { log('ending', { endingId: ch.ending.id }); render(); }
        break;

      case 'rate':
        if (!S.story) break;
        S.story.rating = Number(t.getAttribute('data-v'));
        log('rating', { value: S.story.rating });
        toast(tt('storyRated'));
        render();
        break;

      case 'restart':
        S.story = null;
        S.picking = null;
        S.pendingClue = null;
        persist();
        go('#/s');
        break;

      case 'dmPush':
        handleUnlock(t.getAttribute('data-code'), true);
        break;

      case 'dmReset':
        S.story = null;
        persist();
        render();
        break;

      case 'statsReset':
        S.events = [];
        S.lastLoggedQ = null;
        persist();
        render();
        break;

      case 'statsExport':
        exportJSON();
        break;

      case 'selectRoom':
        S.selectedRoom = t.getAttribute('data-id');
        persist();
        log('room_pick', { id: S.selectedRoom });
        toast(tt('hsSelected'));
        render();
        break;

      case 'clearRoom':
        S.selectedRoom = null;
        persist();
        render();
        break;

      /* —— 加入我们 —— */
      case 'pickTrack':
        S.joinTrack = t.getAttribute('data-v');
        render();
        break;

      case 'juReset':
        S.joinDone = false;
        render();
        break;

      /* —— 文创商城 —— */
      case 'shopCat':
        S.shopCat = t.getAttribute('data-v') || 'all';
        render();
        break;

      case 'addCart': {
        var pid = t.getAttribute('data-id');
        if (!GROWTH.productById(pid)) break;
        S.cart[pid] = (S.cart[pid] || 0) + 1;
        persist();
        toast(tt('spAdded'));
        render();
        break;
      }

      case 'openBag':
        openBagSheet();
        break;

      case 'incCart': {
        var iid = t.getAttribute('data-id');
        if (S.cart[iid]) { S.cart[iid]++; persist(); }
        openBagSheet();
        render();
        break;
      }

      case 'decCart': {
        var did = t.getAttribute('data-id');
        if (S.cart[did]) {
          S.cart[did]--;
          if (S.cart[did] <= 0) delete S.cart[did];
          persist();
        }
        openBagSheet();
        render();
        break;
      }

      case 'delItem': {
        var xid = t.getAttribute('data-id');
        delete S.cart[xid];
        persist();
        openBagSheet();
        render();
        break;
      }

      case 'clearBag':
        S.cart = {};
        persist();
        closeSheet();
        render();
        break;

      case 'checkout':
        checkout();
        break;
    }
  });

  /* 表单提交 */
  document.addEventListener('submit', function (ev) {
    var f = ev.target;
    var act = f.getAttribute('data-act');
    if (!act) return;
    ev.preventDefault();

    if (act === 'askform') {
      var input = document.getElementById('q');
      var q = ((input && input.value) || '').trim();
      if (q) go(decodeQ(q));
      return;
    }
    if (act === 'unlockform') {
      var ci = document.getElementById('code');
      var v = ((ci && ci.value) || '').trim();
      if (!v) return;
      if (ci) ci.value = '';
      handleUnlock(v, false);
      return;
    }
    if (act === 'joinform') {
      var jn = document.getElementById('juName');
      var jc = document.getElementById('juContact');
      var jm = document.getElementById('juMsg');
      var name = ((jn && jn.value) || '').trim();
      var contact = ((jc && jc.value) || '').trim();
      var msg = ((jm && jm.value) || '').trim();
      if (!name || !contact) { toast(tt('juName') + ' / ' + tt('juContact')); return; }
      log('join_apply', { track: S.joinTrack || '', name: name, msg: msg.slice(0, 60) });
      S.joinDone = true;
      persist();
      toast(tt('juDone'));
      render();
      return;
    }
  });

  /* 启动 */
  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', function () {
    boot();
    render();
  });

  /* 若脚本在 DOMContentLoaded 之后才执行（部分内嵌浏览器），兜底启动 */
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    boot();
    render();
  }
})();
