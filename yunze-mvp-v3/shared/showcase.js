/* ==========================================================================
 * 云泽璞舍 · 洱海密语  ——  民宿（选房间）× 旅游（大理本地攻略）共享内容层
 * --------------------------------------------------------------------------
 * 与 knowledge.js / story.js 一样，本文件是「唯一内容源」，由 tools/sync.mjs
 * 同时复制到 h5/data 与 miniprogram/data，双端共用。
 *
 * 内容声明（同知识库）：以下房型 / 路线为原型示例，价格、日程、贴士均为
 * 示意性内容，正式申报或上线前须替换为团队真实勘景与经营数据。
 *
 * 图片策略（零依赖、可离线）：
 *   - 每个房型 / 路线都配一幅程序生成的 SVG 插画（data URI），双击 index.html
 *     或离线部署都能显示，不依赖任何网络图片；
 *   - 同时提供 4 张在 assets/ 下的实景照片（院子 / 洱海 / 喜洲 / 客房），
 *     用于各模块头图，缺失时由视图层 onerror 优雅降级（不报错、不空白）。
 * ========================================================================== */

var SHOWCASE = (function () {
  'use strict';

  /* ====================== SVG 插画生成 ====================== */
  var C = {
    ink: '#17253b', jade: '#2f6d5b', gold: '#c9a14a', paper: '#f6f3ec',
    sky1: '#bfe0e8', sky2: '#eef6f3', water: '#8fc0c8', sun: '#f6dca0',
    green1: '#7fae6e', green2: '#5d8a52', snow: '#f4f7f8', tile: '#5b6670',
    wall: '#f3efe6', gold2: '#d8b25a', night: '#22324a', moon: '#f3dca0',
    red: '#c8482e'
  };

  function svgWrap(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" ' +
      'preserveAspectRatio="xMidYMid slice">' + inner + '</svg>';
  }

  /* ---------- 风景 / 路线插画 ---------- */
  function sceneSVG(kind) {
    var s = '';
    if (kind === 'cangshan') {
      s =
        '<rect width="320" height="200" fill="#d7e9ec"/>' +
        '<polygon points="0,150 70,52 140,150" fill="#6f9b8e"/>' +
        '<polygon points="100,150 185,38 270,150" fill="#5e8c86"/>' +
        '<polygon points="205,150 275,66 340,150" fill="#6f9b8e"/>' +
        '<polygon points="158,62 185,38 212,62 196,74 170,74" fill="' + C.snow + '"/>' +
        '<polygon points="48,70 70,52 92,70 80,80 60,80" fill="' + C.snow + '"/>' +
        '<polygon points="25,150 16,118 34,118" fill="#3f6f4a"/>' +
        '<polygon points="25,150 34,118 52,118" fill="#4f8060"/>' +
        '<polygon points="285,150 276,120 294,120" fill="#3f6f4a"/>' +
        '<polygon points="285,150 294,120 312,120" fill="#4f8060"/>' +
        '<rect x="0" y="150" width="320" height="50" fill="' + C.green1 + '"/>';
    } else if (kind === 'xizhou') {
      s =
        '<rect width="320" height="200" fill="#e9f0e6"/>' +
        '<rect x="0" y="118" width="320" height="82" fill="#d9c98a"/>' +
        '<rect x="0" y="118" width="320" height="12" fill="#c9b86f"/>' +
        '<rect x="44" y="78" width="74" height="54" fill="' + C.wall + '"/>' +
        '<polygon points="38,78 81,52 124,78" fill="' + C.tile + '"/>' +
        '<rect x="180" y="90" width="62" height="42" fill="' + C.wall + '"/>' +
        '<polygon points="176,90 211,68 246,90" fill="' + C.tile + '"/>' +
        '<rect x="58" y="96" width="14" height="20" fill="#7a5a3a"/>' +
        '<rect x="196" y="104" width="12" height="16" fill="#7a5a3a"/>' +
        '<rect x="0" y="150" width="320" height="50" fill="' + C.green1 + '" opacity="0.45"/>';
    } else if (kind === 'ancient') {
      s =
        '<rect width="320" height="200" fill="' + C.night + '"/>' +
        '<circle cx="58" cy="44" r="16" fill="' + C.moon + '"/>' +
        '<rect x="0" y="138" width="320" height="62" fill="#9a7b53"/>' +
        '<rect x="0" y="126" width="320" height="14" fill="#b08e5f"/>' +
        '<rect x="14" y="118" width="16" height="10" fill="#b08e5f"/>' +
        '<rect x="54" y="118" width="16" height="10" fill="#b08e5f"/>' +
        '<rect x="94" y="118" width="16" height="10" fill="#b08e5f"/>' +
        '<rect x="134" y="118" width="16" height="10" fill="#b08e5f"/>' +
        '<rect x="174" y="118" width="16" height="10" fill="#b08e5f"/>' +
        '<rect x="214" y="118" width="16" height="10" fill="#b08e5f"/>' +
        '<rect x="254" y="118" width="16" height="10" fill="#b08e5f"/>' +
        '<rect x="294" y="118" width="16" height="10" fill="#b08e5f"/>' +
        '<line x1="120" y1="92" x2="120" y2="70" stroke="#6b4a2a" stroke-width="2"/>' +
        '<circle cx="120" cy="64" r="9" fill="' + C.red + '"/>' +
        '<line x1="208" y1="92" x2="208" y2="70" stroke="#6b4a2a" stroke-width="2"/>' +
        '<circle cx="208" cy="64" r="9" fill="' + C.red + '"/>';
    } else if (kind === 'shaxi') {
      s =
        '<rect width="320" height="200" fill="#dcebe2"/>' +
        '<polygon points="0,200 0,116 150,200" fill="' + C.green2 + '"/>' +
        '<polygon points="320,200 320,104 190,200" fill="' + C.green1 + '"/>' +
        '<rect x="0" y="168" width="320" height="32" fill="' + C.water + '"/>' +
        '<path d="M120 168 Q160 146 200 168" stroke="#7a5a3a" stroke-width="7" fill="none"/>' +
        '<rect x="150" y="150" width="20" height="18" fill="#8a6a44"/>' +
        '<circle cx="60" cy="46" r="14" fill="' + C.sun + '"/>';
    } else { /* erhai 默认 */
      s =
        '<rect width="320" height="200" fill="' + C.sky1 + '"/>' +
        '<rect y="128" width="320" height="72" fill="' + C.water + '"/>' +
        '<circle cx="252" cy="56" r="23" fill="' + C.sun + '"/>' +
        '<polygon points="0,128 84,74 168,128" fill="#86ab9f"/>' +
        '<polygon points="112,128 198,58 300,128" fill="#5e8c86"/>' +
        '<circle cx="252" cy="150" r="15" fill="' + C.sun + '" opacity="0.32"/>' +
        '<rect x="44" y="150" width="42" height="6" rx="3" fill="#3f6f74"/>';
    }
    return svgWrap(s);
  }

  /* ---------- 房型插画（窗景 / 室内） ---------- */
  function roomSVG(kind) {
    var frame = '<rect x="8" y="8" width="304" height="184" rx="6" fill="none" ' +
      'stroke="' + C.ink + '" stroke-width="5"/>' +
      '<line x1="160" y1="8" x2="160" y2="192" stroke="' + C.ink + '" stroke-width="3"/>' +
      '<line x1="8" y1="100" x2="312" y2="100" stroke="' + C.ink + '" stroke-width="3"/>';
    var s;
    if (kind === 'sea') {
      s = sceneSVG('erhai');
    } else if (kind === 'court') {
      s =
        '<rect width="320" height="200" fill="#f1e7d4"/>' +
        '<rect x="40" y="40" width="150" height="120" fill="' + C.wall + '"/>' +
        '<circle cx="115" cy="96" r="34" fill="' + C.jade + '" opacity="0.85"/>' +
        '<circle cx="115" cy="96" r="34" fill="none" stroke="' + C.gold2 + '" stroke-width="3"/>' +
        '<polygon points="196,160 196,40 250,40 250,160" fill="#6b4a2a"/>' +
        '<rect x="196" y="40" width="54" height="120" fill="#7a5a3a"/>' +
        '<polygon points="190,40 223,18 256,40" fill="' + C.tile + '"/>' +
        '<rect x="262" y="120" width="14" height="40" fill="' + C.green2 + '"/>' +
        '<circle cx="269" cy="112" r="12" fill="' + C.gold2 + '"/>';
    } else if (kind === 'suite') {
      s =
        '<rect width="320" height="200" fill="#efe7d8"/>' +
        '<rect x="0" y="150" width="320" height="50" fill="#cdb78c"/>' +
        '<rect x="30" y="92" width="120" height="58" rx="8" fill="#7a5a3a"/>' +
        '<rect x="44" y="80" width="92" height="20" rx="6" fill="#9a7b53"/>' +
        '<rect x="200" y="60" width="86" height="70" rx="4" fill="#cfe3ea"/>' +
        '<line x1="243" y1="60" x2="243" y2="130" stroke="#fff" stroke-width="3"/>' +
        '<rect x="210" y="120" width="14" height="30" fill="' + C.green2 + '"/>' +
        '<circle cx="217" cy="112" r="11" fill="' + C.gold2 + '"/>';
    } else if (kind === 'family') {
      s =
        '<rect width="320" height="200" fill="#f3ecdd"/>' +
        '<rect x="0" y="150" width="320" height="50" fill="#d8c79a"/>' +
        '<rect x="40" y="40" width="110" height="60" rx="6" fill="#7a5a3a"/>' +
        '<rect x="40" y="100" width="110" height="50" rx="6" fill="#9a7b53"/>' +
        '<rect x="190" y="110" width="90" height="40" rx="6" fill="#8fb38a"/>' +
        '<rect x="205" y="78" width="22" height="22" rx="3" fill="' + C.red + '"/>' +
        '<rect x="236" y="78" width="22" height="22" rx="11" fill="' + C.gold2 + '"/>' +
        '<circle cx="270" cy="86" r="11" fill="#6f9bd0"/>';
    } else if (kind === 'tatami') {
      s =
        '<rect width="320" height="200" fill="#efe6d3"/>' +
        '<rect x="0" y="140" width="320" height="60" fill="#cdb78c"/>' +
        '<rect x="60" y="96" width="150" height="44" rx="4" fill="#d8c79a"/>' +
        '<rect x="200" y="40" width="84" height="80" rx="3" fill="#dfeef2"/>' +
        '<line x1="242" y1="40" x2="242" y2="120" stroke="#fff" stroke-width="3"/>' +
        '<line x1="200" y1="80" x2="284" y2="80" stroke="#fff" stroke-width="3"/>' +
        '<rect x="78" y="112" width="40" height="14" rx="3" fill="#9a7b53"/>' +
        '<circle cx="120" cy="60" r="16" fill="' + C.sun + '"/>';
    } else { /* attic 星空房 */
      s =
        '<rect width="320" height="200" fill="#27374f"/>' +
        '<polygon points="8,100 160,30 312,100" fill="#34465f"/>' +
        '<polygon points="120,100 160,60 200,100" fill="#1d2b40"/>' +
        '<rect x="120" y="60" width="40" height="40" fill="#cfe3ea"/>' +
        '<circle cx="140" cy="50" r="3" fill="#fff"/><circle cx="180" cy="40" r="2" fill="#fff"/>' +
        '<circle cx="90" cy="46" r="2" fill="#fff"/><circle cx="230" cy="54" r="2" fill="#fff"/>' +
        '<rect x="40" y="120" width="120" height="40" rx="6" fill="#7a5a3a"/>' +
        '<circle cx="252" cy="150" r="14" fill="' + C.gold2 + '"/>';
    }
    return svgWrap(s + frame);
  }

  function svgToUri(svg) {
    return 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/\s{2,}/g, ' ').trim());
  }

  /* 预生成 data URI，两端直接当作图片地址使用 */
  var ROOM_IMG = {
    sea: svgToUri(roomSVG('sea')),
    court: svgToUri(roomSVG('court')),
    suite: svgToUri(roomSVG('suite')),
    family: svgToUri(roomSVG('family')),
    tatami: svgToUri(roomSVG('tatami')),
    attic: svgToUri(roomSVG('attic'))
  };
  var SCENE_IMG = {
    erhai: svgToUri(sceneSVG('erhai')),
    cangshan: svgToUri(sceneSVG('cangshan')),
    xizhou: svgToUri(sceneSVG('xizhou')),
    ancient: svgToUri(sceneSVG('ancient')),
    shaxi: svgToUri(sceneSVG('shaxi'))
  };

  /* 实景照片（见 assets/）。两端路径前缀不同，由视图层自行拼接。 */
  var PHOTOS = {
    courtyard: 'yunze-courtyard.png',
    erhai: 'erhai.png',
    xizhou: 'xizhou.png',
    room: 'room.png'
  };

  /* ====================== 民宿：房型 ======================
   * 房型结构对齐策划书 3.3.2「分层房型」与 5.2 / 8.3.6 细分定位：
   *   胶囊（年轻人高性价比）· 风格双床（装修风格差异）· 家庭套房
   *   · 轻奢独栋（高端 / 来华游客）· 银发康养 · 宠物友好
   * 价格覆盖 300–500 元主力区间与 400+ 高端需求（策划书 3.1.1 / 3.2.1）。
   * ============================================================ */
  var ROOMS = [
    {
      id: 'R01', type: 'sea', emoji: '🌊',
      name: { zh: '银发康养 · 观海房', en: 'Silver Wellness Sea-view', ja: 'シニアウェルネス・湖景' },
      area: 30,
      beds: { zh: '1.8m 舒适大床', en: '1.8m comfy king', ja: '1.8m キング' },
      view: { zh: '正面洱海 · 无障碍动线', en: 'Erhai view, step-free', ja: '洱海ビュー・バリアフリー' },
      price: 428,
      suitable: { zh: '银发客群 / 康养度假', en: 'Silver travellers / wellness', ja: 'シニア・保養' },
      amenities: ['Wi-Fi', '地暖', '无障碍扶手', '紧急呼叫', '防滑地面', '茶席'],
      desc: {
        zh: '为银发客群打造的康养房：床垫加高、卫生间装扶手与防滑砖，一键呼叫直连值班管家。清晨可在露台跟管家练一段八段锦，白天环海生态廊道平坦适合漫步，「银发疗养周」含有机三餐与陪行向导。',
        en: 'A wellness room for silver travellers: raised bedding, bathroom grab bars and non-slip tiles, one-button assistance to the duty butler. Morning tai-ji on the terrace, flat lakeside walks, organic meals during Silver Wellness Week.',
        ja: 'シニア向けの保養ルーム：高めのベッド、浴室の手すりと滑り止め、ワンタップで当直管家へ。朝はテラスで太極拳、昼は平坦な湖畔散歩。'
      }
    },
    {
      id: 'R02', type: 'court', emoji: '🏡',
      name: { zh: '风格庭院 · 双床房', en: 'Courtyard Style Twin', ja: '中庭スタイル・ツイン' },
      area: 26,
      beds: { zh: '两张 1.2m 床', en: 'Two 1.2m beds', ja: '1.2m ベッド×2' },
      view: { zh: '三坊一照壁庭院', en: 'Screen-wall courtyard', ja: '三坊一照壁の中庭' },
      price: 388,
      suitable: { zh: '好友结伴 / 年轻客群', en: 'Friends / young travellers', ja: '友人同士・若い旅人' },
      amenities: ['Wi-Fi', '地暖', '书桌椅', '茶席', '阳台'],
      desc: {
        zh: '主力性价比房型：白族民居风格装修，照壁彩绘与天井流水之间是两张互不打扰的床和一张喝茶的小桌。预算友好的同时，把「风格差异」做成我们的辨识度——不与竞品的田园风同质化。',
        en: 'Our value pick: Bai-style décor around the screen wall and sky-well, two undisturbed beds and a small tea table. Budget-friendly, yet styled apart from the pastoral cliché of competitors.',
        ja: 'コスパ重視の主力：照壁と中庭に囲まれた白族風の内装。2 ベッドと茶卓、飽きない個性。'
      }
    },
    {
      id: 'R03', type: 'suite', emoji: '🌿',
      name: { zh: '轻奢独栋 · 套房', en: 'Light-luxe Detached Suite', ja: '軽贅沢・離れスイート' },
      area: 52,
      beds: { zh: '一室一厅 · 1.8m 床', en: '1 bedrm + living', ja: '1LDK' },
      view: { zh: '独立小院 · 私汤', en: 'Private yard & bath', ja: '専用庭・露天' },
      price: 988,
      suitable: { zh: '高端家庭 / 来华游客 / 情侣', en: 'Premium families / inbound couples', ja: '高級層・インバウンド' },
      amenities: ['Wi-Fi', '地暖', '私汤', '客厅', '小厨房', '洗衣机', '双语管家'],
      desc: {
        zh: '整栋独院是面向高端与来华游客的「轻奢独栋」：私汤夜里泡着看星星，客厅容得下一家人。双语管家提供行程定制、文化讲解与多语言支持，把策划书里「来华游客专属服务」落到房间。',
        en: 'A detached yard for the premium and inbound segments: soak under the stars, a living room for the whole family, and a bilingual butler for custom itineraries and cultural briefings.',
        ja: '高級・インバウンド向けの離れ：星空の下の露天、家族用リビング、バイリンガル管家による行程提案。'
      }
    },
    {
      id: 'R04', type: 'family', emoji: '🧸',
      name: { zh: '家庭亲子 · 套房', en: 'Family Suite', ja: 'ファミリースイート' },
      area: 34,
      beds: { zh: '1.5m 大床 + 儿童床', en: '1.5m + kids bed', ja: '1.5m＋子ども用' },
      view: { zh: '苍山景 · 朝东', en: 'Cangshan, east', ja: '蒼山・東向き' },
      price: 458,
      suitable: { zh: '亲子家庭 / 多孩家庭', en: 'Families with kids', ja: '子ども連れ' },
      amenities: ['Wi-Fi', '地暖', '儿童滑梯', '绘本角', '防撞角', '儿童餐椅'],
      desc: {
        zh: '策划书 5.2.2 的「家庭套房」：小滑梯、绘本角、全屋防撞条与儿童餐椅，员工经亲子互动能力考察后上岗。窗外是苍山，早晨孩子在院里追蝴蝶，大人在廊下喝茶——多孩家庭友好，也接得住寒暑假的亲子潮。',
        en: 'The family suite from our plan: slide, reading nook, padded corners, kids chair — staffed by hosts trained for parent-child interaction. Cangshan outside, butterflies in the yard, tea on the porch.',
        ja: '計画書の「ファミリースイート」：すべり台・絵本コーナー・衝突防止。蒼山を望み、庭で蝶と遊ぶ。'
      }
    },
    {
      id: 'R05', type: 'tatami', emoji: '🎒',
      name: { zh: '胶囊 · 榻榻米青年铺', en: 'Youth Capsule Tatami', ja: 'カプセル・畳ベッド' },
      area: 8,
      beds: { zh: '榻榻米独立铺位', en: 'Private tatami berth', ja: '畳の専用ベッド' },
      view: { zh: '公共海景客厅', en: 'Shared lake-view lounge', ja: '共有ラウンジ' },
      price: 98,
      suitable: { zh: '背包客 / 学生 / 数字游民', en: 'Backpackers / students / nomads', ja: 'バックパッカー・学生' },
      amenities: ['Wi-Fi', '独立帘铺位', '公共客厅', '自助厨房', '自习工位', '洗衣机'],
      desc: {
        zh: '策划书 3.3.2 的「有充足公共空间的胶囊式房型」：帘子一拉是自己的小世界，拉开就是正对洱海的公共客厅。配自助厨房、自习工位与高速 Wi-Fi，承接学生党、背包客与远程办公的「微度假 + 数字游民」客群。',
        en: 'The capsule-style budget room from our plan: pull the curtain for your own world, open it to a lake-view lounge. Shared kitchen, study desks and fast Wi-Fi for students, backpackers and remote workers.',
        ja: '計画書の「カプセル型」：カーテンを閉めれば個室、開ければ洱海に面したラウンジ。共有キッチンと作業デスク。'
      }
    },
    {
      id: 'R06', type: 'attic', emoji: '🐾',
      name: { zh: '宠物友好 · 阁楼房', en: 'Pet-friendly Attic', ja: 'ペットフレンドリー・屋根裏' },
      area: 24,
      beds: { zh: '1.5m 斜顶床', en: '1.5m under eaves', ja: '1.5m 勾配下' },
      view: { zh: '天窗可观星 · 独立小院', en: 'Skylight stars & side yard', ja: '天窓と専用庭' },
      price: 428,
      suitable: { zh: '带宠家庭 / 情侣', en: 'Guests with pets', ja: 'ペット同伴' },
      amenities: ['Wi-Fi', '地暖', '天窗', '宠物窝垫', '院栏', '遛狗地图'],
      desc: {
        zh: '策划书 8.3.6 的「错位竞争壁垒」房型：阁楼天窗躺着数星星，楼下独立小院围栏专供毛孩子撒欢。备宠物窝垫、食盆与手绘遛狗地图，可预约宠物 SPA 与跟拍——竞品难以复制的细分服务。',
        en: 'Our differentiation play from the plan: skylight stars above, a fenced side yard below for four-legged guests. Pet bedding, bowls, a hand-drawn dog-walk map, plus pet spa and photo sessions.',
        ja: '差別化戦略のルーム：天窓の星とペット専用の中庭。ペットベッド・散歩マップ・スパ予約も。'
      }
    }
  ];

  /* 入住须知（对齐策划书 9.2 运营管理规范与 5.3.1 售后条款） */
  var HOUSE_RULES = [
    { zh: '入住 14:00 / 退房 12:00，行李可寄存', en: 'Check-in 14:00 / out 12:00, luggage storage' },
    { zh: '公共区域设有监控并已提前告知，客房内无任何摄像头', en: 'CCTV in public areas only (disclosed); none inside rooms' },
    { zh: '每层配备灭火器与烟雾报警器，疏散通道请勿堆放物品', en: 'Extinguishers & smoke alarms on every floor; keep exits clear' },
    { zh: '全院禁烟（庭院设指定吸烟区），夜间 22:00 后请轻声', en: 'Non-smoking indoors; quiet after 22:00' },
    { zh: '宠物仅限宠物友好房型，需提前告知并加收清洁费', en: 'Pets only in pet-friendly rooms (notify ahead, cleaning fee)' },
    { zh: '线上预订即刻生效，现场二维码核销，30 天内无条件退款', en: 'Book online, redeem by QR on site, 30-day unconditional refund' }
  ];

  var LOCATION = {
    zh: '云南 · 大理 · 大理市海东镇（洱海东岸）。距大理机场约 40 分钟，距大理站约 50 分钟。',
    en: 'Haidong Town, Dali, Yunnan, on the east shore of Erhai. ~40 min from the airport, ~50 min from the train station.',
    ja: '雲南省大理市海東鎮（洱海東岸）。空港から約 40 分、駅から約 50 分。'
  };

  /* ====================== 旅游：大理本地攻略 ======================
   * 路线对齐策划书 4.1 三条官方线路 + 1.3/5.1 三类主题路线：
   *   环洱海文化体验线 · 苍山生态探索线 · 古城历史穿越线
   *   · 短时高效游（免签中转）· 民宿周边游（沉浸体验）
   * ================================================================ */
  var ROUTES = [
    {
      id: 'T01', theme: 'erhai', emoji: '🌊',
      name: { zh: '环洱海文化体验线', en: 'Erhai Culture Loop', ja: '洱海文化体験ライン' },
      days: 2,
      level: { zh: '轻松', en: 'Easy', ja: '楽' },
      summary: {
        zh: '策划书 4.1 线路一：入住后沿洱海骑行或乘游船，串联双廊、喜洲等古镇与白族古建筑，途中体验扎染、木雕非遗技艺，在文创商店选购伴手礼，夜里回到民宿参加剧本杀——把「住·游·文·购」串成闭环。',
        en: 'Route one from our plan: bike or boat around Erhai linking Shuanglang and Xizhou, meet Bai architecture, try tie-dye and woodcarving with ICH masters, shop for gifts, then return for the mansion-mystery night — a full stay-tour-shop loop.',
        ja: '計画書ライン 1：洱海を自転車か船で巡り、双廊・喜洲の白族建築を見て、絞り染めと木彫りを体験。夜は宿でミステリー劇へ。'
      },
      stops: [
        { day: 1, place: { zh: '双廊古镇', en: 'Shuanglang', ja: '双廊' },
          desc: { zh: '沿环海路向北第一站，临海咖啡馆与白族渔巷交错，可租电动车继续北上。', en: 'First stop north on the lake road: waterside cafés mixed with Bai fishing lanes.' },
          tip: { zh: '周末车位紧张，建议 10 点前抵达。', en: 'Parking tight on weekends — arrive before 10.' } },
        { day: 1, place: { zh: '喜洲古镇 · 严家大院', en: 'Xizhou · Yan Compound', ja: '喜洲・厳家大院' },
          desc: { zh: '看白族古建筑的彩绘门楼与「三坊一照壁」，稻田边喝一杯才村咖啡。', en: 'Painted gate towers and the screen-wall layout, coffee by the rice fields.' },
          tip: { zh: '请讲解或用导览，不然只看院子会觉得空。', en: 'Take a guide; the yards need context.' } },
        { day: 1, place: { zh: '周城 · 扎染工坊', en: 'Zhoucheng tie-dye workshop', ja: '周城・絞り染め工房' },
          desc: { zh: '非遗传承人指导你亲手扎花、浸染、拆线，做一块自己的扎染方巾带回。', en: 'An ICH master walks you through tying, dyeing and untying your own square to take home.' },
          tip: { zh: '可在文创商城提前购买「扎染体验包」锁定名额。', en: 'Book the tie-dye kit in the shop to secure a slot.' } },
        { day: 2, place: { zh: '海西生态廊道 · 才村', en: 'West corridor · Caicun', ja: '海西・才村' },
          desc: { zh: '清晨看苍山倒映洱海，廊道平坦适合骑行与晨拍。', en: 'Morning reflections of Cangshan; the flat corridor is perfect for a slow ride.' },
          tip: { zh: '廊道机动车禁行，租自行车最舒服。', en: 'No cars — rent a bike.' } },
        { day: 2, place: { zh: '夜 · 回民宿剧本杀', en: 'Night · back to the mansion mystery', ja: '夜・宿のミステリー' },
          desc: { zh: '与线路剧情联动的《洱海迷雾：白族密语寻踪》，换上白族服饰入场。', en: 'The lake-mist mystery ties into this route; costumes provided.' },
          tip: { zh: '旺季夜场需提前一天预约。', en: 'Book the night session a day ahead in season.' } }
      ],
      food: [
        { zh: '喜洲破酥粑粑', en: 'Xizhou crispy pastry' },
        { zh: '白族三道茶', en: 'Three-course tea' },
        { zh: '酸辣鱼', en: 'Sour-spicy fish' },
        { zh: '烤乳扇', en: 'Grilled rushan' }
      ],
      note: { zh: '骑行请戴头盔、靠右行；游船与工坊旺季需提前预约，可请管家统一安排。', en: 'Helmets and keep right; book boats and workshops ahead in season — the butler can arrange it.' }
    },
    {
      id: 'T02', theme: 'cangshan', emoji: '⛰️',
      name: { zh: '苍山生态探索线', en: 'Cangshan Eco Explorer', ja: '蒼山エコ探検ライン' },
      days: 1,
      level: { zh: '中等', en: 'Moderate', ja: '中' },
      summary: {
        zh: '策划书 4.1 线路二：从民宿出发上苍山，徒步探索自然生态与珍稀动植物，沿途设休息点与观景台，提供当地特色小吃与饮品；下山走访山脚文化村落的手工作坊，选购苍山主题文创。',
        en: 'Route two: hike Cangshan for its ecology and rare species with rest points, viewpoints and local snacks; then visit hillside craft villages and pick up Cangshan-themed gifts.',
        ja: '計画書ライン 2：蒼山をハイキングし、希少動植物と休憩所・展望台を巡る。麓の工芸村で土産選び。'
      },
      stops: [
        { day: 1, place: { zh: '感通索道 · 玉带路', en: 'Gantong cable · Jade Belt Path', ja: '感通ロープウェイ・玉帯路' },
          desc: { zh: '索道上山后沿 2600 米平缓步道横切，一侧绝壁一侧云海。', en: 'Cable up, then a gentle 2600m traverse — cliff on one side, clouds below.' },
          tip: { zh: '索道 8:30 开，早去云雾少、能见度高。', en: 'Cable opens 8:30; early is clearer.' } },
        { day: 1, place: { zh: '观景台休息点', en: 'Viewpoint rest stop', ja: '展望休憩所' },
          desc: { zh: '途中休息点备当地特色小吃与饮品：烤乳扇、鲜奶冰棍、白族烤茶。', en: 'Rest points serve local snacks and drinks: rushan, milk popsicles, roasted tea.' },
          tip: { zh: '高原紫外线强，带足水与防晒。', en: 'Strong UV — water and sunscreen.' } },
        { day: 1, place: { zh: '寂照庵', en: 'Jizhao Nunnery', ja: '寂照庵' },
          desc: { zh: '以多肉植物和斋饭闻名的尼庵，11:30 开斋，人多需排队。', en: 'Famous for succulents and its 11:30 vegetarian meal; expect a queue.' },
          tip: { zh: '斋饭随喜功德，请勿浪费。', en: 'Meals by donation — take only what you eat.' } },
        { day: 1, place: { zh: '山脚文化村落 · 手工作坊', en: 'Foothill craft village', ja: '麓の工芸村' },
          desc: { zh: '参观木雕、陶艺作坊，了解民族文化与传统工艺，选购苍山风景明信片与动植物图案饰品。', en: 'Woodcarving and pottery studios, plus postcards and wildlife-motif trinkets.' },
          tip: { zh: '手作小件易碎，购买后可请商家打包托运。', en: 'Ask for padded packing if you buy ceramics.' } }
      ],
      food: [
        { zh: '寂照庵斋饭', en: 'Nunnery vegetarian meal' },
        { zh: '白族烤茶', en: 'Bai roasted tea' },
        { zh: '苍山野菜', en: 'Wild mountain greens' }
      ],
      note: { zh: '海拔高、温差大，备外套；雷雨天气勿在峰顶逗留，下山末班索道约 17:00。', en: 'Bring a jacket; leave peaks in storms; last cable down ~17:00.' }
    },
    {
      id: 'T03', theme: 'ancient', emoji: '🏮',
      name: { zh: '古城历史穿越线', en: 'Old Town Time-travel', ja: '古城歴史ライン' },
      days: 1,
      level: { zh: '轻松', en: 'Easy', ja: '楽' },
      summary: {
        zh: '策划书 4.1 线路三：以大理古城为核心，白天登五华楼、访文献楼与大理王府，聆听古城历史故事，参与传统戏曲与古代礼仪体验；逛文创街区选古风服饰与文房四宝周边，夜晚回民宿参加以古城历史为背景的剧本杀，仿佛穿越回南诏。',
        en: 'Route three: the old town by day — Wuhua Tower, Wenxian Tower, the Dali palace, opera and etiquette experiences, a heritage shopping street; back at the inn, a mystery set in the town\'s past.',
        ja: '計画書ライン 3：昼は五華楼・文献楼・大理王府と戯曲・礼儀体験、文創街区で買い物。夜は古城を舞台にしたミステリー。'
      },
      stops: [
        { day: 1, place: { zh: '五华楼 · 文献楼', en: 'Wuhua & Wenxian Towers', ja: '五華楼・文献楼' },
          desc: { zh: '古城标志性楼阁，登楼俯瞰南北大街，听一段南诏往事。', en: 'Landmark towers with a view down the main street and a Nanzhao tale or two.' },
          tip: { zh: '傍晚登楼光线最好，也避正午暴晒。', en: 'Dusk light is best.' } },
        { day: 1, place: { zh: '大理王府 · 历史故事讲解', en: 'Dali Palace · history talk', ja: '大理王府・歴史解説' },
          desc: { zh: '在王府遗址听管家讲「妙香佛国」的来龙去脉，理解大理为何称「文献名邦」。', en: 'A butler-led talk on the Buddhist kingdom and why Dali earned its scholarly name.' },
          tip: { zh: '讲解场次每日两场，可提前在前台登记。', en: 'Two talks daily — sign up at the desk.' } },
        { day: 1, place: { zh: '传统戏曲与礼仪体验', en: 'Opera & etiquette session', ja: '戯曲・礼儀体験' },
          desc: { zh: '看一场白族大本曲，学一套古代揖礼，把「参与」而不只是「观看」写进行程。', en: 'Catch a Dabenqu performance and learn a classical bow — participate, don\'t just watch.' },
          tip: { zh: '体验含服装租赁，拍照很出片。', en: 'Costume rental included — very photogenic.' } },
        { day: 1, place: { zh: '古城文创街区', en: 'Heritage shopping street', ja: '文創街区' },
          desc: { zh: '古风服饰、传统字画、文房四宝周边，选一件与夜晚剧本杀呼应的道具。', en: 'Hanfu, calligraphy and stationery — pick a prop that echoes tonight\'s mystery.' },
          tip: { zh: '理性消费，辨真伪；大件可快递回民宿。', en: 'Buy thoughtfully; bulky items can ship to the inn.' } },
        { day: 1, place: { zh: '夜 · 古城主题剧本杀', en: 'Night · old-town mystery', ja: '夜・古城ミステリー' },
          desc: { zh: '以古城历史为背景的夜场剧本杀，穿着白天淘来的古风服饰入场更有代入感。', en: 'A mystery set in the town\'s past — wear what you bought for full immersion.' },
          tip: { zh: '旺季需提前一天预约，DM 会备好角色本。', en: 'Book a day ahead in season; the DM preps your script.' } }
      ],
      food: [
        { zh: '鲜花饼', en: 'Flower pastry' },
        { zh: '烤乳扇', en: 'Grilled rushan' },
        { zh: '酸辣鱼', en: 'Sour-spicy fish' }
      ],
      note: { zh: '古城内步行即可，多数区域免费；夜归注意电瓶车，未成年人勿饮酒。', en: 'Walkable and mostly free; mind e-bikes at night.' }
    },
    {
      id: 'T04', theme: 'xizhou', emoji: '⚡',
      name: { zh: '短时高效游 · 免签中转', en: 'Fast-track Visa-free Day', ja: '短期高効率コース' },
      days: 1,
      level: { zh: '轻松', en: 'Easy', ja: '楽' },
      summary: {
        zh: '策划书 1.3 / 5.1 的「短时高效游」：为免签中转或时间紧张的游客定制，依免签停留时间倒排动线，一天内打卡洱海日出、喜洲与古城精华，由管家动态规划，短时间看最多的大理。',
        en: 'The fast-track route from our plan: built around a visa-free layover — sunrise over Erhai, Xizhou and the old town in one day, with the butler re-planning around crowds.',
        ja: '計画書の「短時間高効率コース」：ビザなし乗り継ぎ向けに、日の出・喜洲・古城を 1 日で巡る。'
      },
      stops: [
        { day: 1, place: { zh: '清晨 · 洱海日出', en: 'Dawn · Erhai sunrise', ja: '朝・洱海の日の出' },
          desc: { zh: '民宿露台或小普陀看日出，管家备好热茶与保暖毯。', en: 'Sunrise from the terrace or Xiaoputuo, with hot tea and blankets from the butler.' },
          tip: { zh: '日出约 7:00–7:30，提前 20 分钟到位。', en: 'Sunrise ~7:00–7:30; be there 20 min early.' } },
        { day: 1, place: { zh: '上午 · 喜洲精华', en: 'Morning · Xizhou highlights', ja: '午前・喜洲' },
          desc: { zh: '严家大院 + 稻田转角楼 + 一块破酥粑粑，两小时看懂白族民居。', en: 'Yan Compound, the corner tower, fields and a pastry — Bai architecture in two hours.' },
          tip: { zh: '行李可寄存民宿，轻装出行。', en: 'Leave luggage at the inn.' } },
        { day: 1, place: { zh: '下午 · 大理古城速览', en: 'Afternoon · old town express', ja: '午後・古城' },
          desc: { zh: '五华楼—人民路—洋人街一条线走完，文创街区留 40 分钟购物。', en: 'Wuhua Tower to Renmin Road in one line, with 40 minutes for gifts.' },
          tip: { zh: '返程航班/车次前预留 90 分钟路上时间。', en: 'Leave 90 minutes of buffer before your departure.' } },
        { day: 1, place: { zh: '傍晚 · 庭院围炉复盘', en: 'Dusk · fireside recap', ja: '夕方・囲炉裏' },
          desc: { zh: '回民宿围炉煮茶，管家帮挑照片、打包文创，最后一小时也留给大理。', en: 'Fireside tea at the inn while the butler helps pick photos and pack your gifts.' },
          tip: { zh: '可预约送机，费用已在套餐内。', en: 'Airport drop-off is in the package.' } }
      ],
      food: [
        { zh: '喜洲破酥粑粑', en: 'Xizhou crispy pastry' },
        { zh: '鲜花饼', en: 'Flower pastry' },
        { zh: '鲜奶冰棍', en: 'Fresh-milk popsicle' }
      ],
      note: { zh: '动线由管家按当日人流动态调整；可预约双语向导，多语言讲解随行。', en: 'The butler re-plans around crowds; bilingual guides available.' }
    },
    {
      id: 'T05', theme: 'shaxi', emoji: '🌿',
      name: { zh: '民宿周边 · 沉浸体验游', en: 'Around-the-inn Immersive', ja: '周辺没入コース' },
      days: 1,
      level: { zh: '轻松', en: 'Easy', ja: '楽' },
      summary: {
        zh: '策划书 1.3 / 5.1 的「民宿周边游」：围绕民宿构建全方位沉浸式体验——白族歌舞与民族表演、扎染木雕 DIY 手工、本地农夫市集导览，把「住」本身变成「玩」。',
        en: 'The around-the-inn route: Bai song-and-dance performances, tie-dye and woodcarving DIY, a farmers\' market tour — the stay itself becomes the day.',
        ja: '計画書の「民泊周遊」：白族歌舞・DIY 工芸・農民市場——宿にいるだけで遊べる。'
      },
      stops: [
        { day: 1, place: { zh: '清晨 · 农夫市集导览', en: 'Morning · farmers\' market', ja: '朝・農民市場' },
          desc: { zh: '管家带逛本地农夫市集，认识有机食材与农庄直供体系，回程顺路买鲜花饼。', en: 'Butler-led market walk meeting the farm-direct suppliers; flowers pastries on the way back.' },
          tip: { zh: '有机农产品按分成模式与农庄合作，购买即支持在地。', en: 'Purchases support the partner farms directly.' } },
        { day: 1, place: { zh: '上午 · 白族歌舞与三道茶', en: 'Late morning · Bai dance & tea', ja: '午前・白族歌舞と三道茶' },
          desc: { zh: '庭院小舞台的白族歌舞与含互动的民族表演，配一苦二甜三回味的三道茶。', en: 'Courtyard-stage Bai dances with audience parts, plus the three-course tea.' },
          tip: { zh: '表演场次以当日公示为准，雨天移至堂屋。', en: 'Showtimes posted daily; rain moves it indoors.' } },
        { day: 1, place: { zh: '下午 · DIY 手工工坊', en: 'Afternoon · DIY workshops', ja: '午後・DIY 工房' },
          desc: { zh: '扎染、木雕、陶艺任选，非遗传承人手把手教学，成品当天带走。', en: 'Tie-dye, woodcarving or pottery with an ICH master; take your piece home the same day.' },
          tip: { zh: '「扎染体验包」可在文创商城提前购买。', en: 'The tie-dye kit can be pre-bought in the shop.' } },
        { day: 1, place: { zh: '傍晚 · 庭院夜话篝火', en: 'Dusk · courtyard fireside', ja: '夕方・中庭の焚き火' },
          desc: { zh: '围炉煮茶与篝火夜话，听管家讲白族传说，为明天的剧本杀埋下伏笔。', en: 'Fireside tea and stories that foreshadow tomorrow\'s mystery.' },
          tip: { zh: '篝火季为 10 月至次年 3 月，夏季改为星空茶会。', en: 'Fire season Oct–Mar; starlit tea in summer.' } }
      ],
      food: [
        { zh: '有机时蔬', en: 'Organic greens' },
        { zh: '围炉煮茶', en: 'Fireside tea' },
        { zh: '土鸡火锅', en: 'Free-range chicken hotpot' }
      ],
      note: { zh: 'DIY 体验包可提前购买；表演与工坊名额有限，旺季建议入住当日预约。', en: 'Buy DIY kits ahead; book shows and workshops on check-in during season.' }
    }
  ];

  /* ====================== 旅游：必看风景 ====================== */
  var SCENES = [
    { id: 'erhai', kind: 'erhai', name: { zh: '洱海', en: 'Erhai Lake', ja: '洱海' },
      desc: { zh: '云南第二大淡水湖，苍山脚下的一弯碧水，是大理的灵魂。', en: 'Yunnan’s second-largest freshwater lake, the soul of Dali at the foot of Cangshan.' } },
    { id: 'cangshan', kind: 'cangshan', name: { zh: '苍山', en: 'Cangshan', ja: '蒼山' },
      desc: { zh: '十九峰十八溪，山顶终年积雪，是横断山脉的门户。', en: 'Nineteen peaks and eighteen streams, snow-capped summits at the edge of the Hengduan range.' } },
    { id: 'xizhou', kind: 'xizhou', name: { zh: '喜洲', en: 'Xizhou', ja: '喜洲' },
      desc: { zh: '白族民居保存最完整的古镇，稻田与照壁相间。', en: 'The best-preserved Bai town, rice fields between white-walled courtyards.' } },
    { id: 'shuanglang', kind: 'erhai', name: { zh: '双廊', en: 'Shuanglang', ja: '双廊' },
      desc: { zh: '洱海东北岸的艺术小镇，临海咖啡馆一字排开。', en: 'An arts town on Erhai’s northeast shore, waterside cafés in a row.' } },
    { id: 'ancient', kind: 'ancient', name: { zh: '大理古城', en: 'Dali Old Town', ja: '大理古城' },
      desc: { zh: '千年南诏故地，五华楼下仍是人间烟火。', en: 'The old Nanzhao capital; still alive below the Wuhua Tower.' } },
    { id: 'shaxi', kind: 'shaxi', name: { zh: '沙溪', en: 'Shaxi', ja: '沙渓' },
      desc: { zh: '茶马古道最后的集市，安静得能听见水声。', en: 'The last market town of the Tea Horse Road, quiet enough to hear the river.' } }
  ];

  /* ====================== 导出 ====================== */
  var api = {
    ROOMS: ROOMS,
    ROUTES: ROUTES,
    SCENES: SCENES,
    HOUSE_RULES: HOUSE_RULES,
    LOCATION: LOCATION,
    PHOTOS: PHOTOS,
    ROOM_IMG: ROOM_IMG,
    SCENE_IMG: SCENE_IMG,
    roomById: function (id) {
      for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === id) return ROOMS[i];
      return null;
    },
    routeById: function (id) {
      for (var i = 0; i < ROUTES.length; i++) if (ROUTES[i].id === id) return ROUTES[i];
      return null;
    },
    roomSVG: function (k) { return roomSVG(k); },
    sceneSVG: function (k) { return sceneSVG(k); }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.SHOWCASE = api;
  return api;
})();
