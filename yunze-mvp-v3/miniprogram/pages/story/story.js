var st = require('../../utils/store.js');

Page({
  data: {
    L: {},
    langs: [],
    phase: 'pick',      // pick | play | ending
    roles: [],
    selected: '',
    secret: '',

    actTitle: '',
    actBody: [],
    actNo: 1,

    clues: [],
    found: 0,
    need: 3,
    pct: 0,
    ready: false,

    code: '',

    choices: [],
    ending: null,
    rating: 0,

    sheet: { show: false, icon: '', title: '', body: '', hint: '', found: false, kb: null }
  },

  onShow: function () {
    this.buildLabels();
    this.refresh();
    st.syncTabBar(st.getLang());
  },

  buildLabels: function () {
    var lang = st.getLang();
    this.setData({
      langs: st.langList(lang),
      L: {
        title: st.t('storyTitle', lang),
        sub: st.t('storySub', lang),
        lead: st.t('storyLead', lang),
        pick: st.t('storyPick', lang),
        secret: st.t('storySecret', lang),
        start: st.t('storyStart', lang),
        cont: st.t('storyContinue', lang),
        restart: st.t('storyRestart', lang),
        progress: st.t('storyProgress', lang),
        needMore: st.t('storyNeedMore', lang),
        locked: st.t('storyLocked', lang),
        found: st.t('storyFound', lang),
        codePh: st.t('storyCodePh', lang),
        submit: st.t('storySubmit', lang),
        scan: st.t('storyScan', lang),
        simulate: st.t('storySimulate', lang),
        wrong: st.t('storyWrong', lang),
        already: st.t('storyAlready', lang),
        next: st.t('storyNext', lang),
        decide: st.t('storyDecide', lang),
        endingL: st.t('storyEnding', lang),
        lesson: st.t('storyLesson', lang),
        rate: st.t('storyRate', lang),
        rated: st.t('storyRated', lang),
        hint: st.t('storyHintTitle', lang),
        learn: st.t('storyLearnCard', lang),
        close: st.t('commonBack', lang)
      }
    });
  },

  /* 根据存储中的剧本状态重建视图 */
  refresh: function () {
    var lang = st.getLang();
    var story = st.getStory();
    var STORY = st.STORY;

    var roles = STORY.roles.map(function (r) {
      return {
        id: r.id,
        name: st.pick(r.name, lang),
        tag: st.pick(r.tag, lang),
        desc: st.pick(r.desc, lang),
        initial: st.pick(r.name, lang).slice(0, 1)
      };
    });

    /* 未开局：选择身份 */
    if (!story || !story.roleId) {
      this.setData({ phase: 'pick', roles: roles, selected: '', secret: '', clues: [], found: 0, pct: 0, ready: false });
      return;
    }

    var role = st.roleById(story.roleId);
    var secret = role ? st.pick(role.secret, lang) : '';

    /* 已结局 */
    if (story.endingId) {
      var end = st.Engine.endingById(STORY, story.endingId);
      var body = end ? st.pick(end.body, lang) : [];
      if (!(body instanceof Array)) body = [body];
      this.setData({
        phase: 'ending',
        roles: roles,
        selected: story.roleId,
        secret: secret,
        ending: end ? {
          code: end.code,
          title: st.pick(end.title, lang),
          paras: body,
          lesson: st.pick(end.lesson, lang)
        } : null,
        rating: story.rating || 0
      });
      return;
    }

    /* 进行中 */
    var act = STORY.acts[story.act - 1] || STORY.acts[0];
    var actBody = st.pick(act.body, lang);
    if (!(actBody instanceof Array)) actBody = [actBody];

    var clues = STORY.clues.map(function (c) {
      var f = story.clues.indexOf(c.code) >= 0;
      return {
        code: c.code,
        icon: f ? c.icon : '🔒',
        spot: f ? st.pick(c.spot, lang) : st.t('storyLocked', lang),
        found: f
      };
    });

    var prog = st.Engine.progress(story, STORY);
    var choices = STORY.choices.map(function (c) {
      return { id: c.id, icon: c.icon, label: st.pick(c.label, lang), sub: st.pick(c.sub, lang) };
    });

    this.setData({
      phase: 'play',
      roles: roles,
      selected: story.roleId,
      secret: secret,
      actNo: story.act,
      actTitle: st.pick(act.title, lang),
      actBody: actBody,
      clues: clues,
      found: prog.found,
      need: prog.need,
      pct: Math.min(100, Math.round(prog.found * 100 / prog.need)),
      ready: prog.ready,
      choices: choices
    });
  },

  /* ---------- 身份 ---------- */
  onPick: function (e) {
    var id = e.currentTarget.dataset.id;
    var lang = st.getLang();
    var role = st.roleById(id);
    this.setData({ selected: id, secret: role ? st.pick(role.secret, lang) : '' });
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  onStart: function () {
    var id = this.data.selected;
    if (!id) return;
    var story = st.Engine.newStory(id, st.getLang());
    st.setStory(story);
    st.logEvent('session_start', { lang: st.getLang() });
    this.refresh();
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  /* ---------- 线索 ---------- */
  onCodeInput: function (e) {
    this.setData({ code: e.detail.value });
  },

  onUnlock: function () {
    var v = (this.data.code || '').trim();
    if (!v) return;
    this.setData({ code: '' });
    this.doUnlock(v, false);
  },

  onScan: function () {
    var that = this;
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: function (res) {
        var raw = res.result || res.path || '';
        var code = that.parseClue(raw);
        if (code) that.doUnlock(code, false);
        else wx.showToast({ title: st.t('storyWrong', st.getLang()), icon: 'none' });
      },
      fail: function () {
        /* 模拟器 / 无相机：退化为「推送下一条未解锁线索」，便于现场演示 */
        var next = that.nextLocked();
        if (next) that.doUnlock(next, true);
        else wx.showToast({ title: st.t('storyAlready', st.getLang()), icon: 'none' });
      }
    });
  },

  onSimulate: function () {
    var next = this.nextLocked();
    if (next) this.doUnlock(next, false);
    else wx.showToast({ title: st.t('storyAlready', st.getLang()), icon: 'none' });
  },

  parseClue: function (raw) {
    var s = String(raw || '');
    var m = s.match(/[?&#]clue=([A-Za-z0-9\-]+)/);
    if (m) return m[1];
    var m2 = s.match(/YH-?\s*0?([1-6])/i);
    if (m2) return 'YH-0' + m2[1];
    return '';
  },

  nextLocked: function () {
    var story = st.getStory();
    if (!story) return '';
    for (var i = 0; i < st.STORY.clues.length; i++) {
      if (story.clues.indexOf(st.STORY.clues[i].code) < 0) return st.STORY.clues[i].code;
    }
    return '';
  },

  doUnlock: function (input, quiet) {
    var story = st.getStory();
    if (!story || !story.roleId) return;

    var res = st.Engine.unlockClue(story, input, st.STORY);
    if (res.ok) {
      st.setStory(story);
      st.logEvent('clue', { code: res.clue.code, kbId: res.clue.kbId });
      this.refresh();
      this.openClue(res.clue.code);
    } else if (res.reason === 'dup') {
      this.openClue(res.clue.code);
    } else if (!quiet) {
      wx.showToast({ title: st.t('storyWrong', st.getLang()), icon: 'none' });
    }
  },

  onOpenClue: function (e) {
    this.openClue(e.currentTarget.dataset.code);
  },

  openClue: function (code) {
    var lang = st.getLang();
    var c = st.clueByCode(code);
    if (!c) return;
    var story = st.getStory();
    var found = !!(story && story.clues.indexOf(code) >= 0);
    var e = st.byId(c.kbId);

    this.setData({
      sheet: {
        show: true,
        icon: c.icon,
        title: st.pick(c.spot, lang),
        body: found ? st.pick(c.reward, lang) : '',
        hint: found ? '' : st.pick(c.hint, lang),
        found: found,
        code: c.code,
        kb: (found && e) ? {
          id: e.id,
          emoji: e.emoji,
          name: st.pick(e.name, lang),
          summary: st.pick(e.summary, lang)
        } : null
      }
    });
  },

  onCloseSheet: function () {
    this.setData({ sheet: { show: false, icon: '', title: '', body: '', hint: '', found: false, kb: null } });
  },

  onOpenKb: function () {
    var kb = this.data.sheet.kb;
    if (!kb) return;
    this.onCloseSheet();
    wx.navigateTo({ url: '/pages/decode/decode?id=' + kb.id });
  },

  stop: function () {},

  /* ---------- 推进 ---------- */
  onNext: function () {
    var story = st.getStory();
    if (!story) return;
    var r = st.Engine.advance(story, st.STORY);
    if (r.ok) {
      st.setStory(story);
      st.logEvent('act', { act: r.act });
      this.refresh();
      wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    } else {
      wx.showToast({ title: st.t('storyNeedMore', st.getLang()), icon: 'none' });
    }
  },

  onChoose: function (e) {
    var id = e.currentTarget.dataset.id;
    var story = st.getStory();
    if (!story) return;
    var r = st.Engine.choose(story, id, st.STORY);
    if (r.ok) {
      st.setStory(story);
      st.logEvent('ending', { endingId: r.ending.id });
      this.refresh();
      wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    }
  },

  onRate: function (e) {
    var n = Number(e.currentTarget.dataset.n);
    var story = st.getStory();
    if (!story) return;
    story.rating = n;
    st.setStory(story);
    st.logEvent('rating', { value: n });
    this.setData({ rating: n });
    wx.showToast({ title: st.t('storyRated', st.getLang()), icon: 'none' });
  },

  onRestart: function () {
    st.setStory(null);
    this.setData({ rating: 0 });
    this.refresh();
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
  },

  onLang: function (e) {
    var lang = e.currentTarget.dataset.lang;
    if (lang === st.getLang()) return;
    st.setLang(lang);
    st.logEvent('lang', { value: lang });
    this.buildLabels();
    this.refresh();
    st.syncTabBar(lang);
  },

  onShareAppMessage: function () {
    return {
      title: st.t('storyTitle', st.getLang()) + ' · ' + st.t('storySub', st.getLang()),
      path: '/pages/story/story'
    };
  }
});
