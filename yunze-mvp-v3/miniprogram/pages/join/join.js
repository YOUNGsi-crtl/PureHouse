var st = require('../../utils/store.js');
var G = st.GROWTH;

Page({
  data: {
    L: {},
    langs: [],
    tracks: [],
    positions: [],
    steps: [],
    modeBody: '',
    contact: '',
    done: false,
    pickedTrack: '',
    fName: '',
    fContact: '',
    fMsg: ''
  },

  onShow: function () {
    this.build();
    st.syncTabBar(st.getLang());
  },

  build: function () {
    var lang = st.getLang();

    var tracks = G.JOIN_TRACKS.map(function (t) {
      return {
        id: t.id,
        emoji: t.emoji,
        name: st.pick(t.name, lang),
        tag: st.pick(t.tag, lang),
        desc: st.pick(t.desc, lang)
      };
    });
    var positions = G.JOIN_POSITIONS.map(function (p) {
      return {
        id: p.id,
        emoji: p.emoji,
        name: st.pick(p.name, lang),
        req: st.pick(p.req, lang)
      };
    });
    var steps = G.JOIN_STEPS.map(function (s) {
      return { n: s.n, title: st.pick(s.title, lang), desc: st.pick(s.desc, lang) };
    });

    this.setData({
      langs: st.langList(lang),
      L: {
        title: st.t('juTitle', lang),
        lead: st.t('juLead', lang),
        tracks: st.t('juTracks', lang),
        positions: st.t('juPositions', lang),
        steps: st.t('juSteps', lang),
        mode: st.t('juMode', lang),
        apply: st.t('juApply', lang),
        applyLead: st.t('juApplyLead', lang),
        name: st.t('juName', lang),
        namePh: st.t('juNamePh', lang),
        contact: st.t('juContact', lang),
        contactPh: st.t('juContactPh', lang),
        msg: st.t('juMsg', lang),
        msgPh: st.t('juMsgPh', lang),
        submit: st.t('juSubmit', lang),
        done: st.t('juDone', lang),
        doneBody: st.t('juDoneBody', lang),
        again: st.t('juAgain', lang)
      },
      tracks: tracks,
      positions: positions,
      steps: steps,
      modeBody: st.pick(G.JOIN_MODE, lang),
      contact: st.pick(G.JOIN_CONTACT, lang)
    });
  },

  onTrack: function (e) {
    var id = e.currentTarget.dataset.id;
    this.setData({ pickedTrack: this.data.pickedTrack === id ? '' : id });
  },

  onInputName: function (e) { this.setData({ fName: e.detail.value }); },
  onInputContact: function (e) { this.setData({ fContact: e.detail.value }); },
  onInputMsg: function (e) { this.setData({ fMsg: e.detail.value }); },

  onSubmit: function () {
    var name = (this.data.fName || '').trim();
    var contact = (this.data.fContact || '').trim();
    var lang = st.getLang();
    if (!name || !contact) {
      wx.showToast({ title: st.t('juName', lang) + ' / ' + st.t('juContact', lang), icon: 'none' });
      return;
    }
    st.logEvent('join_apply', {
      track: this.data.pickedTrack || '',
      name: name,
      msg: (this.data.fMsg || '').slice(0, 60)
    });
    this.setData({ done: true });
    wx.showToast({ title: st.t('juDone', lang), icon: 'none' });
  },

  onAgain: function () {
    this.setData({ done: false, pickedTrack: '', fName: '', fContact: '', fMsg: '' });
  },

  onLang: function (e) {
    var lang = e.currentTarget.dataset.lang;
    if (lang === st.getLang()) return;
    st.setLang(lang);
    st.logEvent('lang', { value: lang });
    this.build();
    st.syncTabBar(lang);
  },

  onShareAppMessage: function () {
    return { title: st.t('juTitle', st.getLang()), path: '/pages/join/join' };
  }
});
