var st = require('../../utils/store.js');

Page({
  data: {
    L: {},
    mode: 'entry',      // entry | low
    pct: 0,
    hasPct: false,
    emoji: '',
    title: '',
    cat: '',
    id: '',
    summary: '',
    paras: [],
    facts: [],
    sources: [],
    exp: '',
    related: [],
    lowTitle: '',
    lowBody: '',
    query: ''
  },

  onLoad: function (options) {
    var lang = st.getLang();
    this.setData({
      L: {
        match: st.t('decodeMatch', lang),
        summary: st.t('decodeSummary', lang),
        body: st.t('decodeBody', lang),
        facts: st.t('decodeFacts', lang),
        sources: st.t('decodeSources', lang),
        exp: st.t('decodeExp', lang),
        related: st.t('decodeRelated', lang),
        srcPending: st.t('srcPending', lang),
        srcIch: st.t('srcIch', lang),
        srcFieldwork: st.t('srcFieldwork', lang),
        fallback: st.t('decodeFallback', lang),
        back: st.t('commonBack', lang)
      }
    });

    if (options && options.id) {
      this.renderEntry(st.byId(options.id), null, '');
      return;
    }

    var q = options && options.q ? options.q : '';
    try { q = decodeURIComponent(q); } catch (e) {}
    if (q) this.renderQuery(q);
  },

  /* 直接用条目 id 打开 */
  renderEntry: function (e, pct, q) {
    if (!e) {
      this.setData({ mode: 'low', lowTitle: st.t('decodeLowTitle', st.getLang()), lowBody: '', related: [] });
      return;
    }
    var lang = st.getLang();
    var body = st.pick(e.body, lang);
    var paras = body instanceof Array ? body : (body ? [body] : []);
    var facts = st.pick(e.facts, lang);
    if (!(facts instanceof Array)) facts = facts ? [facts] : [];

    var sources = (e.sources || []).map(function (s, i) {
      var tag = s.pending ? 'pending' : (s.kind === 'ich' ? 'ich' : 'fieldwork');
      return { no: '[' + (i + 1) + ']', label: st.pick(s.label, lang), pending: !!s.pending, kind: s.kind };
    });

    this.setData({
      mode: 'entry',
      hasPct: pct !== null && pct !== undefined,
      pct: pct || 0,
      emoji: e.emoji,
      title: st.pick(e.name, lang),
      cat: st.t(st.catKey(e.cat), lang),
      id: e.id,
      summary: st.pick(e.summary, lang),
      paras: paras,
      facts: facts,
      sources: sources,
      exp: e.experience ? st.pick(e.experience, lang) : '',
      related: [],
      query: q || ''
    });

    if (st.isFallback(e.body, lang)) {
      wx.showToast({ title: st.t('decodeFallback', lang), icon: 'none', duration: 2200 });
    }
  },

  /* 按自然语言问题检索 */
  renderQuery: function (q) {
    var lang = st.getLang();
    var res = st.Engine.compose(q, st.KB);

    st.logEvent('search', {
      q: q,
      hit: res.kind === 'answer' ? res.entry.id : null,
      kbId: res.kind === 'answer' ? res.entry.id : null
    });

    if (res.kind === 'low') {
      var items = (res.items || []).map(function (e) {
        return { id: e.id, emoji: e.emoji, name: st.pick(e.name, lang), cat: st.t(st.catKey(e.cat), lang) };
      });
      this.setData({
        mode: 'low',
        lowTitle: st.t('decodeLowTitle', lang),
        lowBody: st.t('decodeLowBody', lang),
        related: items,
        query: q
      });
      return;
    }

    this.renderEntry(res.entry, res.pct, q);

    var related = (res.related || []).map(function (e) {
      return { id: e.id, emoji: e.emoji, name: st.pick(e.name, lang), cat: st.t(st.catKey(e.cat), lang) };
    });
    this.setData({ related: related });
  },

  onRelated: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.redirectTo({ url: '/pages/decode/decode?id=' + id });
  },

  onBack: function () {
    wx.navigateBack({ delta: 1 });
  }
});
