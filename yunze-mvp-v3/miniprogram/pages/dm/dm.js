var st = require('../../utils/store.js');

Page({
  data: {
    L: {},
    langs: [],
    act: '—',
    roleName: '',
    clues: [],
    logs: [],
    hasLog: false
  },

  onShow: function () {
    this.build();
    st.syncTabBar(st.getLang());
  },

  build: function () {
    var lang = st.getLang();
    var story = st.getStory();
    var events = st.getEvents();

    var role = story && story.roleId ? st.roleById(story.roleId) : null;

    var clues = st.STORY.clues.map(function (c) {
      return {
        code: c.code,
        icon: c.icon,
        spot: st.pick(c.spot, lang),
        found: !!(story && story.clues.indexOf(c.code) >= 0)
      };
    });

    var logs = events.slice(-40).reverse().map(function (ev) {
      var d = new Date(ev.t);
      var hm = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
      var line = ev.type;
      if (ev.code) line += ' · ' + ev.code;
      if (ev.kbId) line += ' · ' + ev.kbId;
      if (ev.act) line += ' · act' + ev.act;
      if (ev.lang) line += ' · ' + ev.lang;
      return { tm: hm, line: line };
    });

    this.setData({
      langs: st.langList(lang),
      L: {
        title: st.t('dmTitle', lang),
        lead: st.t('dmLead', lang),
        actL: st.t('dmAct', lang),
        roleL: st.t('dmRole', lang),
        cluesL: st.t('dmClues', lang),
        push: st.t('dmPush', lang),
        reset: st.t('dmReset', lang),
        log: st.t('dmLog', lang),
        empty: st.t('dmEmpty', lang),
        note: st.t('dmNote', lang),
        none: st.t('dmNone', lang),
        found: st.t('storyFound', lang),
        storyL: st.t('navStory', lang)
      },
      act: story ? story.act : '—',
      roleName: role ? st.pick(role.name, lang) : st.t('dmNone', lang),
      clues: clues,
      logs: logs,
      hasLog: logs.length > 0
    });
  },

  onPush: function (e) {
    var code = e.currentTarget.dataset.code;
    var story = st.getStory();
    if (!story || !story.roleId) {
      wx.showToast({ title: st.t('dmNone', st.getLang()), icon: 'none' });
      return;
    }
    var res = st.Engine.unlockClue(story, code, st.STORY);
    if (res.ok) {
      st.setStory(story);
      st.logEvent('clue', { code: res.clue.code, kbId: res.clue.kbId, by: 'dm' });
      this.build();
      wx.showToast({ title: code, icon: 'none' });
    } else {
      wx.showToast({ title: st.t('storyAlready', st.getLang()), icon: 'none' });
    }
  },

  onReset: function () {
    var that = this;
    wx.showModal({
      title: st.t('dmReset', st.getLang()),
      content: '确定清空本局进度？事件日志会保留。',
      success: function (r) {
        if (!r.confirm) return;
        st.setStory(null);
        that.build();
      }
    });
  },

  onGoStory: function () {
    wx.switchTab({ url: '/pages/story/story' });
  },

  onLang: function (e) {
    var lang = e.currentTarget.dataset.lang;
    if (lang === st.getLang()) return;
    st.setLang(lang);
    st.logEvent('lang', { value: lang });
    this.build();
    st.syncTabBar(lang);
  }
});
