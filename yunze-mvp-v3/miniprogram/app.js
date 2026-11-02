var store = require('./utils/store.js');

App({
  globalData: {
    lang: 'zh'
  },
  onLaunch: function () {
    this.globalData.lang = store.getLang();
    store.syncTabBar(this.globalData.lang);
  },
  onShow: function () {
    store.syncTabBar(store.getLang());
  }
});
