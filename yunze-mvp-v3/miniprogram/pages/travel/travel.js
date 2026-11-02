var st = require('../../utils/store.js');
var SC = st.SHOWCASE;

/* 主题 → 实景照片（assets/ 下，缺失时回退到色调色块） */
var THEME_PHOTO = { erhai: 'erhai.png', xizhou: 'xizhou.png' };
var KIND_PHOTO = { erhai: 'erhai.png', xizhou: 'xizhou.png' };
var SCENE_EMOJI = {
  erhai: '🌊', cangshan: '⛰️', xizhou: '🌾',
  shuanglang: '🏖️', ancient: '🏮', shaxi: '🌄'
};

Page({
  data: {
    L: {},
    langs: [],
    routes: [],
    scenes: [],
    sheet: { show: false }
  },

  onShow: function () {
    this.build();
    st.syncTabBar(st.getLang());
  },

  build: function () {
    var lang = st.getLang();

    var routes = SC.ROUTES.map(function (rt) {
      return {
        id: rt.id,
        emoji: rt.emoji,
        name: st.pick(rt.name, lang),
        days: rt.days,
        level: st.pick(rt.level, lang),
        summary: st.pick(rt.summary, lang),
        photo: THEME_PHOTO[rt.theme] || ''
      };
    });

    var scenes = SC.SCENES.map(function (sc) {
      return {
        id: sc.id,
        emoji: SCENE_EMOJI[sc.id] || '📍',
        name: st.pick(sc.name, lang),
        desc: st.pick(sc.desc, lang),
        photo: KIND_PHOTO[sc.kind] || ''
      };
    });

    this.setData({
      langs: st.langList(lang),
      L: {
        title: st.t('tvTitle', lang),
        lead: st.t('tvLead', lang),
        routes: st.t('tvRoutes', lang),
        scenes: st.t('tvScenes', lang),
        days: st.t('tvDays', lang),
        level: st.t('tvLevel', lang),
        summary: st.t('tvSummary', lang),
        itinerary: st.t('tvItinerary', lang),
        tip: st.t('tvTip', lang),
        food: st.t('tvFood', lang),
        note: st.t('tvNote', lang)
      },
      routes: routes,
      scenes: scenes
    });
  },

  onRoute: function (e) {
    var id = e.currentTarget.dataset.id;
    var rt = SC.routeById(id);
    if (!rt) return;
    var lang = st.getLang();

    var stops = (rt.stops || []).map(function (s) {
      return {
        dayLabel: st.dayLabel(s.day, lang),
        place: st.pick(s.place, lang),
        desc: st.pick(s.desc, lang),
        tip: st.pick(s.tip, lang)
      };
    });
    var food = (rt.food || []).map(function (f) { return st.pick(f, lang); });

    this.setData({
      sheet: {
        show: true,
        id: rt.id,
        name: st.pick(rt.name, lang),
        days: rt.days,
        level: st.pick(rt.level, lang),
        summary: st.pick(rt.summary, lang),
        stops: stops,
        food: food,
        note: st.pick(rt.note, lang)
      }
    });
  },

  closeSheet: function () { this.setData({ sheet: { show: false } }); },
  stop: function () {},

  onLang: function (e) {
    var lang = e.currentTarget.dataset.lang;
    if (lang === st.getLang()) return;
    st.setLang(lang);
    st.logEvent('lang', { value: lang });
    this.build();
    st.syncTabBar(lang);
  },

  onShareAppMessage: function () {
    return { title: st.t('tvTitle', st.getLang()), path: '/pages/travel/travel' };
  }
});
