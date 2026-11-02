/* ==========================================================================
 * 云泽璞舍 · 洱海密语 —— 加入我们（合作伙伴招募）× 文创商城 共享内容层
 * --------------------------------------------------------------------------
 * 与 showcase.js 一样，本文件是「唯一内容源」，由 tools/sync.mjs 复制到
 * h5/data 与 miniprogram/data，双端共用。
 *
 * 内容对齐《云泽璞舍——针对免签政策，探索国内特色文化民宿新模式》策划书：
 *   - JOIN  合作方向 / 岗位 / 流程：第 2.2（一宿带一村）、4.1.2（平台）、
 *           4.1.3（IP 联名）、6.2（团队岗位）、6.3（招聘选拔）章
 *   - SHOP  商品矩阵：第 4.1.3（产品体系）、5.3.1（文创与联名）章
 *
 * 内容声明：合作权益与商品价格为原型示意，正式上线前须替换为真实协议
 * 与经营数据。
 * ========================================================================== */

var GROWTH = (function () {
  'use strict';

  /* ====================== 加入我们：合作方向 ====================== */
  var JOIN_TRACKS = [
    {
      id: 'ich', emoji: '🪡',
      name: { zh: '非遗传承人', en: 'ICH inheritors', ja: '無継承人' },
      tag: { zh: '扎染 / 木雕 / 陶艺', en: 'Tie-dye / wood / clay', ja: '絞り・木・土' },
      desc: {
        zh: '与白族扎染、木雕、陶艺传承人深度合作，共创可体验的文创产品与课程，技艺按分成计酬。',
        en: 'Co-create experiencable products and courses with Bai tie-dye, woodcarving and pottery masters, paid by share.'
      }
    },
    {
      id: 'ip', emoji: '🎭',
      name: { zh: '文化 IP 联名', en: 'Culture IP co-branding', ja: '文化 IP コラボ' },
      tag: { zh: '动漫 / 影视 / 历史 IP', en: 'Anime / film / history IPs', ja: 'アニメ・映像・歴史' },
      desc: {
        zh: '与国内外知名 IP 联名开发兼具文化性与时尚感的文创：联名手作、服饰、文具与纪念品。',
        en: 'Co-branded drops with well-known IPs — handcrafts, apparel, stationery and keepsakes.'
      }
    },
    {
      id: 'village', emoji: '🏘️',
      name: { zh: '村集体 · 一宿带一村', en: 'Village collectives', ja: '村集体' },
      tag: { zh: '分红机制', en: 'Dividend scheme', ja: '配当スキーム' },
      desc: {
        zh: '村民成为文化解说员与工艺导师，民宿按「保底 + 分红」让村集体共享收益，实现共富。',
        en: 'Villagers join as cultural interpreters and craft tutors; the village shares gains via base-plus-dividend.'
      }
    },
    {
      id: 'farm', emoji: '🌾',
      name: { zh: '农庄 · 食材直供', en: 'Farms', ja: '農園' },
      tag: { zh: '有机直供', en: 'Farm-direct organic', ja: '有機直送' },
      desc: {
        zh: '民宿餐桌与「本地农夫市集」由周边农庄直供，分成模式售卖有机农产品。',
        en: 'Our tables and the farmers\' market run on partner-farm produce, sold on a revenue-share model.'
      }
    },
    {
      id: 'study', emoji: '📚',
      name: { zh: '研学机构', en: 'Study-travel agencies', ja: '研究機関' },
      tag: { zh: '文化认证课程', en: 'Certified courses', ja: '認定コース' },
      desc: {
        zh: '共同开发文化认证课程与研学线路，把白族文化变成可学习、可认证的内容。',
        en: 'Jointly build certified culture courses and study-travel itineraries around Bai heritage.'
      }
    },
    {
      id: 'biz', emoji: '☕',
      name: { zh: '本地商家', en: 'Local businesses', ja: '地元商店' },
      tag: { zh: '住宿 + 体验套票', en: 'Stay + experience bundles', ja: '宿＋体験セット' },
      desc: {
        zh: '与本地咖啡馆、餐厅、景区联名推出「住宿 + 体验」套票，互相导流、共担成本。',
        en: 'Cross-promoted stay-plus-experience bundles with local cafés, restaurants and scenic spots.'
      }
    },
    {
      id: 'campus', emoji: '🎓',
      name: { zh: '校园人才', en: 'Campus talent', ja: 'キャンパス人材' },
      tag: { zh: '语言 + 导游证', en: 'Languages + tour license', ja: '語学＋ガイド資格' },
      desc: {
        zh: '对接校园资源，招募语言文化类专业、持导游证的毕业生，提供兼职与就业通道。',
        en: 'Recruit language-major graduates with tour-guide licenses for part-time and full-time roles.'
      }
    }
  ];

  /* ====================== 加入我们：招募岗位 ====================== */
  var JOIN_POSITIONS = [
    {
      id: 'butler', emoji: '🛎️',
      name: { zh: '民宿管家', en: 'House butler', ja: '管家（バトラー）' },
      req: { zh: '3 年以上酒店管理经验，熟悉 OTA 运营与收益管理', en: '3+ yrs hotel management, OTA & revenue savvy' }
    },
    {
      id: 'culture', emoji: '🪡',
      name: { zh: '文化研发专员', en: 'Culture R&D', ja: '文化リサーチ' },
      req: { zh: '深挖扎染 / 三道茶 / 甲马等非遗元素，建立文化素材库', en: 'Build the ICH asset library: tie-dye, tea, jiama' }
    },
    {
      id: 'marketing', emoji: '📣',
      name: { zh: '数字营销专员', en: 'Digital marketing', ja: 'デジタル広報' },
      req: { zh: '运营抖音 / 小红书，策划非遗直播与苍山徒步内容', en: 'Run Douyin/Xiaohongshu; ICH livestreams & hikes' }
    },
    {
      id: 'bilingual', emoji: '🌏',
      name: { zh: '双语客服 / 向导', en: 'Bilingual host', ja: 'バイリンガル係' },
      req: { zh: '多平台客服操作熟练，可担任来华游客随行向导', en: 'Multichannel support; guide for inbound guests' }
    },
    {
      id: 'chef', emoji: '🍲',
      name: { zh: '在地主厨', en: 'Local chef', ja: 'シェフ' },
      req: { zh: '擅长本地特色菜与围炉煮茶，接受季节性菜单', en: 'Local dishes & fireside tea; seasonal menus' }
    }
  ];

  /* ====================== 加入我们：合作流程 ====================== */
  var JOIN_STEPS = [
    { n: 1, title: { zh: '提交意向', en: 'Send intent', ja: '意向を送る' },
      desc: { zh: '在本页留下联系方式与资源简介', en: 'Leave your contact and a one-line intro here' } },
    { n: 2, title: { zh: '评估洽谈', en: 'Review & talk', ja: '評価・協議' },
      desc: { zh: '三个工作日内回复，商定合作形式与分工', en: 'Reply within 3 working days to scope the deal' } },
    { n: 3, title: { zh: '签约共建', en: 'Sign & build', ja: '契約・共作' },
      desc: { zh: '以「保底 + 分红」签约，权责与分成写进合同', en: 'Base-plus-dividend contract with clear shares' } },
    { n: 4, title: { zh: '落地运营', en: 'Launch & run', ja: '運用開始' },
      desc: { zh: '课程 / 产品 / 服务上线，后台数据对双方透明', en: 'Courses, products and services go live; shared dashboards' } }
  ];

  /* 合作模式说明（策划书 2.2 / 6.2 / 7.1.3） */
  var JOIN_MODE = {
    zh: '轻资产「保底 + 分红」：非遗传承人出技艺、村集体出场地与解说、农庄直供食材、研学机构共创课程，收益按约定分成；村民可成为文化解说员与工艺导师，实现「一宿带一村」。薪酬端，员工绩效与复购率、评分挂钩，另设旺季超额奖与创新奖。',
    en: 'Asset-light base-plus-dividend: masters bring craft, villages bring venues and storytelling, farms bring produce, study agencies co-build courses — gains split by contract. Staff pay ties to ratings and repeat bookings, plus peak-season and innovation bonuses.',
    ja: '「保証＋配当」の軽資産モデル：職人は技術、村は場所と解説、農園は食材、研究機関は講座を提供し、収益を分配します。'
  };

  var JOIN_CONTACT = {
    zh: '合作洽谈：partner@yunze.example（原型示意邮箱）· 电话 0872-000-0000',
    en: 'Partnerships: partner@yunze.example (demo inbox) · +86 872-000-0000',
    ja: '提携：partner@yunze.example（デモ）・ +86 872-000-0000'
  };

  /* ====================== 文创商城：商品矩阵 ======================
   * 品类（对齐策划书 4.1.3）：tie 扎染布艺 / wood 木雕陶艺 /
   * wear 民族服饰 / paper 纸本文创 / co 联名系列
   * ================================================================ */
  var SHOP_CATS = ['tie', 'wood', 'wear', 'paper', 'co'];

  var PRODUCTS = [
    {
      id: 'P01', cat: 'tie', emoji: '🧵',
      name: { zh: '周城扎染方巾', en: 'Zhoucheng tie-dye square', ja: '周城絞り染めハンカチ' },
      price: 68,
      desc: {
        zh: '非遗传承人指导的周城工坊出品，板蓝根植物染，每一块的冰纹都独一无二。',
        en: 'From the Zhoucheng workshops: plant-dyed, no two ice-crack patterns alike.'
      }
    },
    {
      id: 'P02', cat: 'tie', emoji: '👜',
      name: { zh: '扎染帆布托特包', en: 'Tie-dye canvas tote', ja: '絞り染めトート' },
      price: 128,
      desc: {
        zh: '厚帆布 + 扎染布面，装得下电脑与旅途，也装得下一块洱海的蓝。',
        en: 'Heavy canvas with a tie-dye face — fits a laptop and a piece of the lake.'
      }
    },
    {
      id: 'P03', cat: 'tie', emoji: '🪣',
      name: { zh: '扎染体验包（含工坊预约）', en: 'Tie-dye DIY kit', ja: '絞り染め体験キット' },
      price: 168,
      desc: {
        zh: '材料包 + 周城工坊一次预约名额，跟着传承人做一块自己的方巾（T01/T05 路线可用）。',
        en: 'Materials plus one workshop slot in Zhoucheng — dye your own square on routes T01/T05.'
      }
    },
    {
      id: 'P04', cat: 'wood', emoji: '🔖',
      name: { zh: '剑川木雕书签', en: 'Jianchuan woodcarve bookmark', ja: '剣川木彫しおり' },
      price: 45,
      desc: {
        zh: '剑川木雕匠人手作，楸木打磨，刻的是苍山云纹。',
        en: 'Hand-carved qiwood bookmark with Cangshan cloud motifs.'
      }
    },
    {
      id: 'P05', cat: 'wood', emoji: '🍵',
      name: { zh: '白族陶艺茶杯', en: 'Bai pottery cup', ja: '白族陶器カップ' },
      price: 88,
      desc: {
        zh: '凤仪土窑烧制，配三道茶饮法小卡，一苦二甜三回味。',
        en: 'Kiln-fired cup with a three-course tea card: bitter, sweet, afterglow.'
      }
    },
    {
      id: 'P06', cat: 'wear', emoji: '🧣',
      name: { zh: '白族披肩', en: 'Bai shawl', ja: '白族ショール' },
      price: 158,
      desc: {
        zh: '传统纹样机织披肩，清风里拍照极出片，也是剧本杀换装的百搭件。',
        en: 'Traditional-motif woven shawl — photogenic in the wind, handy for mystery-night costumes.'
      }
    },
    {
      id: 'P07', cat: 'wear', emoji: '📌',
      name: { zh: '白族服饰冰箱贴套装', en: 'Bai attire magnets', ja: '白族衣装マグネット' },
      price: 38,
      desc: {
        zh: '金花与阿鹏的服饰微缩徽章一套六枚，把白族的色彩钉回家。',
        en: 'Six mini badges of Jinhua & Apeng outfits — pin Bai colour to your fridge.'
      }
    },
    {
      id: 'P08', cat: 'paper', emoji: '✉️',
      name: { zh: '洱海四季明信片（8 张）', en: 'Erhai seasons postcards', ja: '洱海絵葉書' },
      price: 25,
      desc: {
        zh: '驻院摄影师拍的洱海四季，背面印一句白族谚语，可代寄。',
        en: 'Four seasons by our resident photographer, a Bai proverb on the back; we mail it for you.'
      }
    },
    {
      id: 'P09', cat: 'paper', emoji: '📖',
      name: { zh: '文化解读书签套装', en: 'Decoding bookmark set', ja: '解説しおり' },
      price: 38,
      desc: {
        zh: '照壁、甲马、三道茶等六个文化解码卡片书签，扫二维码可听三语讲解。',
        en: 'Six culture-decoding bookmarks with QR audio guides in three languages.'
      }
    },
    {
      id: 'P10', cat: 'paper', emoji: '🎫',
      name: { zh: '甲马木刻版画笺纸', en: 'Jiama woodblock stationery', ja: '甲馬版画紙' },
      price: 56,
      desc: {
        zh: '以白族甲马木刻为底的信笺，写给很重要的人。',
        en: 'Letter paper printed from Bai jiama woodblocks — for someone who matters.'
      }
    },
    {
      id: 'P11', cat: 'co', emoji: '🎗️',
      name: { zh: '非遗联名扎染丝巾', en: 'ICH co-branded silk scarf', ja: '無継承コラボスカーフ' },
      price: 299,
      desc: {
        zh: '与非遗传承人联名的真丝扎染，编号限量 200 条，附传承人签名卡。',
        en: 'Co-created with an ICH master: numbered silk run of 200, signed card included.'
      }
    },
    {
      id: 'P12', cat: 'co', emoji: '🎬',
      name: { zh: '《洱海迷雾》剧本杀纪念徽章', en: 'Mystery badge', ja: 'ミステリー記章' },
      price: 48,
      desc: {
        zh: '通关《洱海迷雾：白族密语寻踪》可兑换，也可直接收藏六个角色徽章。',
        en: 'Redeemable after finishing the mystery, or collect all six role badges directly.'
      }
    }
  ];

  /* ====================== 导出 ====================== */
  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }

  var api = {
    JOIN_TRACKS: JOIN_TRACKS,
    JOIN_POSITIONS: JOIN_POSITIONS,
    JOIN_STEPS: JOIN_STEPS,
    JOIN_MODE: JOIN_MODE,
    JOIN_CONTACT: JOIN_CONTACT,
    SHOP_CATS: SHOP_CATS,
    PRODUCTS: PRODUCTS,
    productById: byId
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.GROWTH = api;
  return api;
})();
