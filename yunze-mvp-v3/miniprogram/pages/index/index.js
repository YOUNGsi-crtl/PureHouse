var st = require('../../utils/store.js');

Page({
  data: {
    L: {},
    langs: [],
    tries: [],
    objects: [],
    q: ''
  },

  onShow: function () {
    this.build();
    st.syncTabBar(st.getLang());
  },

  build: function () {
    var lang = st.getLang();
    var KB = st.KB;

    var objects = KB.entries.map(function (e) {
      return {
        id: e.id,
        emoji: e.emoji,
        name: st.pick(e.name, lang),
        cat: st.t(st.catKey(e.cat), lang)
      };
    });

    var tries = st.t('homeTryList', lang);
    if (!(tries instanceof Array)) tries = [];

    this.setData({
      langs: st.langList(lang),
      L: {
        brand: st.t('brand', lang),
        brandSub: st.t('brandSub', lang),
        hero: st.t('homeHero', lang),
        lead: st.t('homeLead', lang),
        ph: st.t('homeSearchPh', lang),
        ask: st.t('homeAsk', lang),
        tryLabel: st.t('homeTry', lang),
        objectsLabel: st.t('homeObjects', lang),
        notice: st.t('homeNotice', lang),
        featHeading: st.t('featHeading', lang),
        featStay: st.t('featStay', lang),
        featStaySub: st.t('featStaySub', lang),
        featTravel: st.t('featTravel', lang),
        featTravelSub: st.t('featTravelSub', lang),
        featShop: st.t('featShop', lang),
        featShopSub: st.t('featShopSub', lang),
        featJoin: st.t('featJoin', lang),
        featJoinSub: st.t('featJoinSub', lang)
      },
      tries: tries,
      objects: objects
    });
  },

  onInput: function (e) {
    this.setData({ q: e.detail.value });
  },

  onAsk: function () {
    var q = (this.data.q || '').trim();
    if (!q) return;
    wx.navigateTo({ url: '/pages/decode/decode?q=' + encodeURIComponent(q) });
  },

  onChip: function (e) {
    var q = e.currentTarget.dataset.q;
    wx.navigateTo({ url: '/pages/decode/decode?q=' + encodeURIComponent(q) });
  },

  onObj: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/decode/decode?id=' + id });
  },

  onLang: function (e) {
    var lang = e.currentTarget.dataset.lang;
    if (lang === st.getLang()) return;
    st.setLang(lang);
    st.logEvent('lang', { value: lang });
    this.build();
    st.syncTabBar(lang);
  },

  onHomestay: function () {
    wx.navigateTo({ url: '/pages/homestay/homestay' });
  },

  onTravel: function () {
    wx.navigateTo({ url: '/pages/travel/travel' });
  },

  onShop: function () {
    wx.navigateTo({ url: '/pages/shop/shop' });
  },

  onJoin: function () {
    wx.navigateTo({ url: '/pages/join/join' });
  }
});
