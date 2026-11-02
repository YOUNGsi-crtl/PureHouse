var st = require('../../utils/store.js');
var G = st.GROWTH;

var CAT_TONE = {
  tie: 'tone-blue', wood: 'tone-gold', wear: 'tone-red',
  paper: 'tone-jade', co: 'tone-ink'
};

function catLabelKey(cat) {
  return cat === 'all' ? 'spCatAll' : 'spCat' + cat.charAt(0).toUpperCase() + cat.slice(1);
}

Page({
  data: {
    L: {},
    langs: [],
    cats: [],
    goods: [],
    cartCount: 0,
    cartTotal: 0,
    cat: 'all',
    sheet: { show: false, items: [], total: 0 }
  },

  onShow: function () {
    this.build();
    st.syncTabBar(st.getLang());
  },

  build: function () {
    var lang = st.getLang();
    var cat = this.data.cat;

    var cats = ['all'].concat(G.SHOP_CATS).map(function (c) {
      return { id: c, label: st.t(catLabelKey(c), lang), on: c === cat };
    });

    var cart = st.getCart();
    var goods = G.PRODUCTS.filter(function (p) {
      return cat === 'all' || p.cat === cat;
    }).map(function (p) {
      return {
        id: p.id,
        emoji: p.emoji,
        name: st.pick(p.name, lang),
        desc: st.pick(p.desc, lang),
        price: p.price,
        tone: CAT_TONE[p.cat] || 'tone-ink',
        inBag: cart[p.id] || 0
      };
    });

    var count = st.cartCount(cart);
    var bagTotal = 0;
    for (var k in cart) {
      var p = G.productById(k);
      if (p) bagTotal += p.price * cart[k];
    }

    this.setData({
      langs: st.langList(lang),
      L: {
        title: st.t('spTitle', lang),
        lead: st.t('spLead', lang),
        bag: st.t('spBag', lang),
        bagEmpty: st.t('spBagEmpty', lang),
        total: st.t('spTotal', lang),
        add: st.t('spAdd', lang),
        added: st.t('spAdded', lang),
        checkout: st.t('spCheckout', lang),
        checked: st.t('spChecked', lang),
        checkedBody: st.t('spCheckedBody', lang),
        clear: st.t('spClear', lang),
        cny: st.t('spCny', lang),
        back: st.t('spBack', lang),
        demo: st.t('spDemo', lang)
      },
      cats: cats,
      goods: goods,
      cartCount: count,
      cartTotal: bagTotal
    });
  },

  onCat: function (e) {
    var id = e.currentTarget.dataset.id || 'all';
    this.setData({ cat: id });
    this.build();
  },

  onAdd: function (e) {
    var id = e.currentTarget.dataset.id;
    if (!G.productById(id)) return;
    var cart = st.getCart();
    cart[id] = (cart[id] || 0) + 1;
    st.setCart(cart);
    wx.showToast({ title: st.t('spAdded', st.getLang()), icon: 'none' });
    this.build();
  },

  /* 打开购物袋弹层 */
  onBag: function () {
    var cart = st.getCart();
    var lang = st.getLang();
    var items = [];
    var total = 0;
    for (var k in cart) {
      var p = G.productById(k);
      if (!p) continue;
      total += p.price * cart[k];
      items.push({
        id: p.id,
        emoji: p.emoji,
        name: st.pick(p.name, lang),
        price: p.price,
        qty: cart[k]
      });
    }
    this.setData({ sheet: { show: true, items: items, total: total } });
  },

  onInc: function (e) {
    var id = e.currentTarget.dataset.id;
    var cart = st.getCart();
    if (cart[id]) cart[id]++;
    st.setCart(cart);
    this.build();
    this.onBag();
  },

  onDec: function (e) {
    var id = e.currentTarget.dataset.id;
    var cart = st.getCart();
    if (cart[id]) {
      cart[id]--;
      if (cart[id] <= 0) delete cart[id];
    }
    st.setCart(cart);
    this.build();
    this.onBag();
  },

  onDel: function (e) {
    var id = e.currentTarget.dataset.id;
    var cart = st.getCart();
    delete cart[id];
    st.setCart(cart);
    this.build();
    this.onBag();
  },

  onClear: function () {
    st.setCart({});
    this.closeSheet();
    this.build();
  },

  onCheckout: function () {
    var count = this.data.cartCount;
    if (!count) return;
    st.logEvent('shop_order', { count: count, total: this.data.cartTotal });
    st.setCart({});
    this.closeSheet();
    this.build();
    var lang = st.getLang();
    wx.showToast({ title: st.t('spChecked', lang), icon: 'none' });
    wx.showModal({
      title: st.t('spChecked', lang),
      content: st.t('spCheckedBody', lang),
      showCancel: false,
      confirmText: st.t('spBack', lang)
    });
  },

  closeSheet: function () { this.setData({ sheet: { show: false, items: [], total: 0 } }); },
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
    return { title: st.t('spTitle', st.getLang()), path: '/pages/shop/shop' };
  }
});
