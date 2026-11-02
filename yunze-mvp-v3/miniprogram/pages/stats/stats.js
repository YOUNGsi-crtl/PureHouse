var st = require('../../utils/store.js');

Page({
  data: {
    L: {},
    langs: [],
    empty: true,
    kpis: [],
    langsRows: [],
    heatRows: [],
    funnel: []
  },

  onShow: function () {
    this.build();
    st.syncTabBar(st.getLang());
  },

  build: function () {
    var lang = st.getLang();
    var agg = st.Engine.aggregate(st.getEvents(), st.KB);
    var LANG_LABEL = { zh: '中文', en: 'EN', ja: '日本語' };

    var kpis = [
      { k: agg.sessions, l: st.t('statsSessions', lang) },
      { k: agg.cluesUnlocked, l: st.t('statsUnlocked', lang) },
      { k: agg.endings, l: st.t('statsFinished', lang) },
      { k: agg.ratingCount ? agg.avgRating : '—', l: st.t('statsAvg', lang) }
    ];

    var langsRows = agg.langs.map(function (r) {
      return { name: LANG_LABEL[r.key] || r.key, count: r.count, pct: r.pct };
    });

    var heatRows = agg.heat.map(function (r) {
      return { name: r.name, count: r.count, pct: r.pct };
    });

    var endingText = st.t('storyEnding', lang);
    var funnel = agg.funnel.map(function (f) {
      return {
        count: f.count,
        label: f.label === 4 ? endingText : String(f.label),
        h: Math.max(12, Math.round(f.pct * 1.5))
      };
    });

    this.setData({
      langs: st.langList(lang),
      L: {
        title: st.t('statsTitle', lang),
        lead: st.t('statsLead', lang),
        emptyTxt: st.t('statsEmpty', lang),
        langsL: st.t('statsLangs', lang),
        heatL: st.t('statsHeat', lang),
        funnelL: st.t('statsFunnel', lang),
        reset: st.t('statsReset', lang),
        storyL: st.t('navStory', lang)
      },
      empty: !agg.totalEvents,
      kpis: kpis,
      langsRows: langsRows,
      heatRows: heatRows,
      funnel: funnel
    });
  },

  onReset: function () {
    var that = this;
    wx.showModal({
      title: st.t('statsReset', st.getLang()),
      content: '将清空全部事件记录，不可恢复。',
      success: function (r) {
        if (!r.confirm) return;
        st.clearEvents();
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
