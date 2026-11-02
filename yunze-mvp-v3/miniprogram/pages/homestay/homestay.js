var st = require('../../utils/store.js');
var SC = st.SHOWCASE;

var TONE = {
  sea: 'tone-blue', court: 'tone-jade', suite: 'tone-gold',
  family: 'tone-green', tatami: 'tone-teal', attic: 'tone-ink'
};

Page({
  data: {
    L: {},
    langs: [],
    rooms: [],
    rules: [],
    selectedName: '',
    sheet: { show: false }
  },

  onShow: function () {
    this.build();
    st.syncTabBar(st.getLang());
  },

  build: function () {
    var lang = st.getLang();
    var sel = st.getRoom();

    var rooms = SC.ROOMS.map(function (r) {
      return {
        id: r.id,
        emoji: r.emoji,
        name: st.pick(r.name, lang),
        view: st.pick(r.view, lang),
        price: r.price,
        tone: TONE[r.type] || 'tone-jade',
        selected: (sel === r.id)
      };
    });

    var rules = (SC.HOUSE_RULES || []).map(function (x) { return st.pick(x, lang); });

    var selName = '';
    if (sel) { var sr = SC.roomById(sel); if (sr) selName = st.pick(sr.name, lang); }

    this.setData({
      langs: st.langList(lang),
      L: {
        title: st.t('hsTitle', lang),
        lead: st.t('hsLead', lang),
        intro: st.t('hsIntro', lang),
        introBody: st.t('hsIntroBody', lang),
        picked: st.t('hsPicked', lang),
        rooms: st.t('hsRooms', lang),
        houseRules: st.t('hsHouseRules', lang),
        area: st.t('hsArea', lang),
        beds: st.t('hsBeds', lang),
        view: st.t('hsView', lang),
        price: st.t('hsPrice', lang),
        perNight: st.t('hsPerNight', lang),
        amenities: st.t('hsAmenities', lang),
        suitable: st.t('hsSuitable', lang),
        select: st.t('hsSelect', lang),
        selected: st.t('hsSelected', lang)
      },
      rooms: rooms,
      rules: rules,
      selectedName: selName,
      locBody: st.pick(SC.LOCATION, lang)
    });
  },

  onRoom: function (e) {
    var id = e.currentTarget.dataset.id;
    var lang = st.getLang();
    var r = SC.roomById(id);
    if (!r) return;
    var sel = st.getRoom();
    this.setData({
      sheet: {
        show: true,
        id: r.id,
        emoji: r.emoji,
        tone: TONE[r.type] || 'tone-jade',
        name: st.pick(r.name, lang),
        area: r.area,
        beds: st.pick(r.beds, lang),
        view: st.pick(r.view, lang),
        price: r.price,
        desc: st.pick(r.desc, lang),
        amenities: (r.amenities || []).map(function (a) { return a; }),
        suitable: st.pick(r.suitable, lang),
        selected: (sel === r.id)
      }
    });
  },

  onSelect: function () {
    var s = this.data.sheet;
    if (!s.show) return;
    st.setRoom(s.id);
    st.logEvent('room_pick', { id: s.id });
    wx.showToast({ title: st.t('hsSelected', st.getLang()), icon: 'none' });
    this.closeSheet();
    this.build();
  },

  onClear: function () {
    st.setRoom('');
    this.build();
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
    return { title: st.t('hsTitle', st.getLang()), path: '/pages/homestay/homestay' };
  }
});
