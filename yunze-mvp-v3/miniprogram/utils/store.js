/**
 * 云泽璞舍 · 洱海密语 —— 小程序端存储与文案适配层
 * 让页面只关心「展示什么」，不关心「数据从哪来」。
 */

var KB = require('../data/knowledge.js');
var STORY = require('../data/story.js');
var I18N = require('../data/i18n.js');
var Engine = require('../data/engine.js');
var SHOWCASE = require('../data/showcase.js');
var GROWTH = require('../data/growth.js');

var KEY = { lang: 'yz_lang', story: 'yz_story', events: 'yz_events' };

function getLang() {
  var v = wx.getStorageSync(KEY.lang);
  return v || 'zh';
}
function setLang(l) {
  wx.setStorageSync(KEY.lang, l);
}

function getStory() {
  var v = wx.getStorageSync(KEY.story);
  if (!v || typeof v !== 'object') return null;
  /* 兼容旧版本 / 损坏数据，避免页面渲染时抛异常 */
  if (!(v.clues instanceof Array)) v.clues = [];
  if (typeof v.act !== 'number' || v.act < 1 || v.act > 3) v.act = 1;
  if (typeof v.rating !== 'number') v.rating = 0;
  if (v.roleId && !roleById(v.roleId)) return null;
  return v;
}
function setStory(s) {
  if (s) wx.setStorageSync(KEY.story, s);
  else wx.removeStorageSync(KEY.story);
}

function getEvents() {
  var v = wx.getStorageSync(KEY.events);
  return Array.isArray(v) ? v : [];
}
function logEvent(type, data) {
  var ev = getEvents();
  Engine.logEvent(ev, type, data);
  wx.setStorageSync(KEY.events, ev);
}
function clearEvents() {
  wx.setStorageSync(KEY.events, []);
}

function t(key, lang) { return I18N.t(lang || getLang(), key); }
function pick(obj, lang) { return I18N.pick(lang || getLang(), obj); }
function isFallback(obj, lang) { return I18N.isFallback(lang || getLang(), obj); }

function byId(id) {
  for (var i = 0; i < KB.entries.length; i++) {
    if (KB.entries[i].id === id) return KB.entries[i];
  }
  return null;
}
function roleById(id) {
  for (var i = 0; i < STORY.roles.length; i++) {
    if (STORY.roles[i].id === id) return STORY.roles[i];
  }
  return null;
}
function clueByCode(code) {
  for (var i = 0; i < STORY.clues.length; i++) {
    if (STORY.clues[i].code === code) return STORY.clues[i];
  }
  return null;
}

function catKey(cat) { return 'cat' + cat.charAt(0).toUpperCase() + cat.slice(1); }

/* 选房状态（与 H5 的 yz_room 同源键名） */
function getRoom() {
  var v = wx.getStorageSync('yz_room');
  return v || '';
}
function setRoom(id) {
  if (id) wx.setStorageSync('yz_room', id);
  else wx.removeStorageSync('yz_room');
}
function dayLabel(n, lang) {
  if (lang === 'ja') return '第 ' + n + ' 日';
  if (lang === 'zh') return '第 ' + n + ' 天';
  if (lang === 'ko') return n + '일째';
  if (lang === 'es') return 'Día ' + n;
  if (lang === 'ar') return 'اليوم ' + n;
  if (lang === 'hi') return 'दिन ' + n;
  return 'Day ' + n;
}

/* 购物袋（与 H5 的 yz_cart 同源键名，结构为 { 商品id: 数量 }） */
function getCart() {
  var v = wx.getStorageSync('yz_cart');
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  return v;
}
function setCart(cart) {
  if (cart && Object.keys(cart).length) wx.setStorageSync('yz_cart', cart);
  else wx.removeStorageSync('yz_cart');
}
function cartCount(cart) {
  var n = 0;
  for (var k in cart) n += cart[k];
  return n;
}

/** 底栏文字随语言切换（tabBar 文字不支持模板绑定，只能调用接口改） */
function syncTabBar(lang) {
  var keys = ['navDecode', 'navStory', 'navStats', 'navDm'];
  for (var i = 0; i < keys.length; i++) {
    try {
      wx.setTabBarItem({ index: i, text: t(keys[i], lang), fail: function () {} });
    } catch (e) {}
  }
}

/** 统一的语言切换组件用数据 */
function langList(lang) {
  return [
    { key: 'zh', label: '中文', on: lang === 'zh' },
    { key: 'en', label: 'EN', on: lang === 'en' },
    { key: 'ja', label: '日本語', on: lang === 'ja' },
    { key: 'es', label: 'ES', on: lang === 'es' },
    { key: 'ar', label: 'عربي', on: lang === 'ar' },
    { key: 'hi', label: 'हिंदी', on: lang === 'hi' },
    { key: 'ko', label: '한국어', on: lang === 'ko' }
  ];
}

module.exports = {
  KB: KB,
  STORY: STORY,
  Engine: Engine,
  I18N: I18N,
  SHOWCASE: SHOWCASE,
  GROWTH: GROWTH,
  getLang: getLang,
  setLang: setLang,
  getStory: getStory,
  setStory: setStory,
  getEvents: getEvents,
  logEvent: logEvent,
  clearEvents: clearEvents,
  t: t,
  pick: pick,
  isFallback: isFallback,
  byId: byId,
  roleById: roleById,
  clueByCode: clueByCode,
  catKey: catKey,
  syncTabBar: syncTabBar,
  langList: langList,
  getRoom: getRoom,
  setRoom: setRoom,
  dayLabel: dayLabel,
  getCart: getCart,
  setCart: setCart,
  cartCount: cartCount
};
