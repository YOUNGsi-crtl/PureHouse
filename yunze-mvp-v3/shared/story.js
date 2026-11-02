/* ==========================================================================
 * 云泽璞舍 · 洱海密语  ——  数字剧本引擎内容（共享内容层）
 * --------------------------------------------------------------------------
 * 出处：《云泽璞舍》商业计划书 附录「特色剧本杀（部分）」
 *       ——《洱海迷雾：白族密语寻踪》（团队原创）
 * 本文件把它改造成「线上线下一体」的状态机结构：
 *   幕（act）→ 线索（clue，绑定真实空间位置 + 一条非遗知识）
 *   → 分支（choice）→ 结局（ending）
 *
 * 设计要点（答辩时可直接讲）：
 *   1. 线索不在屏幕上随便给出，必须「到真实空间里」通过扫码 / 输码获得；
 *   2. 每条线索解锁时同时弹出一张知识卡（kbId），即「找线索＝学文化」；
 *   3. 剧本与空间解耦：换一套 clue 配置即可搬到下一个民宿 / 村落。
 * ========================================================================== */

var ROLES = [
  {
    id: 'jinhua',
    name: { zh: '金花', en: 'Jinhua' },
    tag: { zh: '白族少女', en: 'Bai village girl' },
    desc: {
      zh: '热情、熟悉村落每一块石头。她知道祖父在照壁上留下过一句话，但只有月圆之夜才看得清。',
      en: 'Warm and knowing every stone in the village. She knows her grandfather left a line on the screen wall \u2014 legible only on a full-moon night.'
    },
    secret: {
      zh: '你的祖父曾是守宝人。他临终只留一句：「宝藏不在土里，在话里。」',
      en: 'Your grandfather was a keeper. His last words were: \u201cThe treasure is not in the earth, it is in the words.\u201d'
    }
  },
  {
    id: 'afeng',
    name: { zh: '阿风', en: 'Afeng' },
    tag: { zh: '年轻画家', en: 'Young painter' },
    desc: {
      zh: '内敛、观察力极强。他来大理找颜色，却在扎染的蓝里看见了自己没画过的东西。',
      en: 'Quiet and sharply observant. He came for colour, and found in the indigo of tie-dye something he had never painted.'
    },
    secret: {
      zh: '你昨夜在廊下画速写，画到一半发现：画里的照壁上多了一个你没有画的人。',
      en: 'Last night you sketched in the corridor and found, halfway through, a figure on the wall you had not drawn.'
    }
  },
  {
    id: 'chenwu',
    name: { zh: '陈武', en: 'Chen Wu' },
    tag: { zh: '退役镖师', en: 'Retired escort guard' },
    desc: {
      zh: '武艺高强、为人直爽。他厌倦了刀口上的日子，却在听到「宝藏」两个字时，手还是抖了一下。',
      en: 'Strong and blunt. He is tired of the blade, yet his hand still twitched at the word \u201ctreasure\u201d.'
    },
    secret: {
      zh: '二十年前你押过一趟镖，货箱上刻的正是这座院子的门楼纹样。那趟镖，没有到终点。',
      en: 'Twenty years ago you guarded a convoy whose crate was carved with this very gate pattern. That convoy never arrived.'
    }
  },
  {
    id: 'lifugui',
    name: { zh: '李富贵', en: 'Li Fugui' },
    tag: { zh: '神秘商人', en: 'Mysterious merchant' },
    desc: {
      zh: '笑容可掬、说话滴水不漏。他带来的线索太过准确，准确到不像「偶然听说」。',
      en: 'Smiling, never at a loss for words. His clues are too precise to have been \u201cmerely heard about\u201d.'
    },
    secret: {
      zh: '你并不缺钱。你要找的是一本册子——上面记着三十年前那批流散的文物去了哪里。',
      en: 'You are not short of money. You are looking for a ledger recording where the dispersed relics went, thirty years ago.'
    }
  },
  {
    id: 'linjiaoshou',
    name: { zh: '林教授', en: 'Prof. Lin' },
    tag: { zh: '考古学家', en: 'Archaeologist' },
    desc: {
      zh: '学识渊博、说话谨慎。她一眼认出照壁题字不是清代的东西，却不肯说是什么年代的。',
      en: 'Learned and careful. She saw at once the inscription was not Qing \u2014 and would not say what it was.'
    },
    secret: {
      zh: '你此行带着一份未公开的测绘报告：这座院子的天井，比图纸上多出三尺。',
      en: 'You carry an unpublished survey: this courtyard\u2019s sky-well is three chi larger than the drawings say.'
    }
  }
];

/* 线索：绑定真实空间位置 + 一条非遗知识 ------------------------------- */
var CLUES = [
  {
    code: 'YH-01', kbId: 'K05', act: 2,
    spot: { zh: '照壁前', en: 'Before the screen wall' },
    icon: '🌕',
    hint: { zh: '月光落在照壁上时，题字才会显形。', en: 'When moonlight falls on the wall, the inscription appears.' },
    reward: {
      zh: '你借灯笼的光看清了照壁上的字：「以白为心」。字下面有一行更小的刻痕——像是一串数字。',
      en: 'By lantern light you read the wall: \u201cA heart of white.\u201d Beneath it, fainter, a line of carved marks \u2014 like numbers.'
    },
    ask: { zh: '照壁为什么能当「灯」用？', en: 'Why does a screen wall work as a lamp?' }
  },
  {
    code: 'YH-02', kbId: 'K01', act: 2,
    spot: { zh: '晾布架下', en: 'Under the drying rack' },
    icon: '🌀',
    hint: { zh: '风把一块没染完的布吹到了你脚边。', en: 'The wind drops a half-dyed cloth at your feet.' },
    reward: {
      zh: '布的背面用白线缝着一个字，只有对着灯才看得出——「等」。扎染的扎法，本身就是一种密码。',
      en: 'On the reverse, stitched in white thread, a single character: \u201cwait\u201d. The binding itself is a cipher.'
    },
    ask: { zh: '为什么扎染每一件都不一样？', en: 'Why is every tie-dye piece different?' }
  },
  {
    code: 'YH-03', kbId: 'K02', act: 2,
    spot: { zh: '茶案旁', en: 'By the tea table' },
    icon: '🍵',
    hint: { zh: '第三道茶凉了，杯底沉着一样东西。', en: 'The third cup has gone cold; something settles at the bottom.' },
    reward: {
      zh: '杯底是一小片锡。三道茶的「三」不是随便定的——苦、甜、回味，正好对应三处藏点。第一处在哪，你已经知道了。',
      en: 'A flake of tin at the bottom. The three cups are not arbitrary \u2014 bitter, sweet, lingering map onto three hiding places. You already know the first.'
    },
    ask: { zh: '「一苦二甜三回味」到底在说什么？', en: 'What does \u201cbitter, sweet, lingering\u201d actually mean?' }
  },
  {
    code: 'YH-04', kbId: 'K03', act: 2,
    spot: { zh: '灶头', en: 'Above the stove' },
    icon: '🖨️',
    hint: { zh: '灶头上贴着一张褪色的甲马，边角被火燎过。', en: 'A faded jiama print above the stove, its corner scorched.' },
    reward: {
      zh: '甲马上画的是「桥神」。院子附近没有河，哪来的桥？——除非「桥」是隐喻。你想起了照壁上那行刻痕。',
      en: 'The print shows a bridge god. There is no river here \u2014 so the bridge must be a metaphor. You think of the carved marks.'
    },
    ask: { zh: '甲马为什么会被烧掉？', en: 'Why were these prints burned?' }
  },
  {
    code: 'YH-05', kbId: 'K06', act: 2,
    spot: { zh: '门楼内侧', en: 'Inside the gate tower' },
    icon: '🎨',
    hint: { zh: '抬头看雀替——匠人常把签名藏在最细的地方。', en: 'Look up at the spandrel: artisans hide their mark in the finest work.' },
    reward: {
      zh: '雀替的彩绘里藏着一个小小的「林」字。这不是匠人的姓——是三十年前一位测绘者的记号。',
      en: 'Inside the painted spandrel, a tiny \u201cLin\u201d. Not the artisan\u2019s surname \u2014 a surveyor\u2019s mark from thirty years ago.'
    },
    ask: { zh: '为什么白族民居要「留白」？', en: 'Why leave so much white space on a Bai wall?' }
  },
  {
    code: 'YH-06', kbId: 'K07', act: 2,
    spot: { zh: '院心火塘', en: 'The fire pit in the yard' },
    icon: '🔥',
    hint: { zh: '火塘里的灰是新的，但今晚没有人点火。', en: 'The ash is fresh, yet no fire was lit tonight.' },
    reward: {
      zh: '灰里埋着半张纸，写着火把节的日期——六月二十五。而今天是六月二十四。有人在等明天。',
      en: 'Half a sheet in the ash gives the Torch Festival date: the 25th of the sixth month. Today is the 24th. Someone is waiting for tomorrow.'
    },
    ask: { zh: '火把节为什么要抢「火把头」？', en: 'Why scramble for the torch head?' }
  }
];

/* 幕 ------------------------------------------------------------------- */
var ACTS = [
  {
    id: 1,
    needClues: 0,
    title: { zh: '第一幕 · 风起洱海', en: 'Act I \u00b7 Wind over Erhai' },
    body: {
      zh: [
        '入夜，你住进了洱海边的这座院子。白墙、青瓦、一进天井，抬头是一方被屋檐裁出的天。',
        '三更梆子响过三声，院里忽然起了风。有人在廊下低声说话，说的是白语，你只听懂一个词——「等」。',
        '桌上留着一张字条：「客人既是寻宝人，便请先认一认这院子。天亮之前，找到三处旧痕。」'
      ],
      en: [
        'At nightfall you take a room in the courtyard house by Erhai. White walls, grey tiles, one sky-well, and above it a square of sky cut by the eaves.',
        'Three strikes of the night watch, and a wind rises. Someone speaks low in the corridor, in Bai; you catch only one word \u2014 \u201cwait\u201d.',
        'A note on the table: \u201cGuest, since you seek the treasure, first learn this house. Before dawn, find three old traces.\u201d'
      ]
    }
  },
  {
    id: 2,
    needClues: 3,
    title: { zh: '第二幕 · 廊下密语', en: 'Act II \u00b7 Whispers in the Corridor' },
    body: {
      zh: [
        '院子不大，却处处有线头。照壁、晾布架、茶案、灶头、门楼、火塘——六处旧痕，找到其中三处，天就要亮了。',
        '每找到一处，你会同时读懂一件白族的东西。字条上说：「不懂的人，看见的只是石头和木头。」'
      ],
      en: [
        'The courtyard is small, yet threaded everywhere. Screen wall, drying rack, tea table, stove, gate tower, fire pit \u2014 six old traces. Find three, and dawn comes.',
        'Each trace you find also teaches you one thing about the Bai. The note says: \u201cTo those who do not understand, these are only stone and wood.\u201d'
      ]
    }
  },
  {
    id: 3,
    needClues: 3,
    title: { zh: '第三幕 · 宝藏真相', en: 'Act III \u00b7 What the Treasure Is' },
    body: {
      zh: [
        '天将亮。李富贵站在照壁前，手里是那本册子；林教授把测绘报告摊在石桌上；陈武的手按在刀上；阿风的速写本翻到了最后一页。',
        '金花看着你：「第三个藏点，只有你知道。现在，你来决定。」'
      ],
      en: [
        'Near dawn. Li Fugui stands before the screen wall holding the ledger; Prof. Lin spreads her survey on the stone table; Chen Wu\u2019s hand rests on his blade; Afeng\u2019s sketchbook is open at its last page.',
        'Jinhua looks at you: \u201cOnly you know the third place. Now \u2014 you decide.\u201d'
      ]
    }
  }
];

/* 分支与结局 ------------------------------------------------------------ */
var CHOICES = [
  {
    id: 'reveal', icon: '📣',
    label: { zh: '当众揭开照壁下的东西', en: 'Open what lies beneath the wall, publicly' },
    sub: { zh: '让全村人都看见', en: 'Let the whole village see' },
    endingId: 'e1'
  },
  {
    id: 'keep', icon: '🤫',
    label: { zh: '把册子交回金花，守口如瓶', en: 'Hand the ledger back to Jinhua and keep silent' },
    sub: { zh: '有些东西不该被搬走', en: 'Some things should not be taken away' },
    endingId: 'e2'
  },
  {
    id: 'publish', icon: '📖',
    label: { zh: '把测绘报告与册子合成一份公开档案', en: 'Merge the survey and the ledger into a public archive' },
    sub: { zh: '公布，但留在原地', en: 'Make it public \u2014 and leave it where it is' },
    endingId: 'e3'
  }
];

var ENDINGS = [
  {
    id: 'e1', code: 'E-01',
    title: { zh: '结局一 · 土里的宝藏', en: 'Ending 1 \u00b7 Treasure in the Earth' },
    body: {
      zh: [
        '照壁下三尺，是一口旧陶缸：锡器、几枚铜钱、半部湿烂的账册。没有金子。人群安静了很久。',
        '天亮后，文物部门来了。东西被封存、登记、运走。院子空了，游客不再来，村民在门口坐着，什么也没说。',
        '你带走了一张照片。照片里，照壁上的「以白为心」被拆下来时，背面原来什么都没有。'
      ],
      en: [
        'Three chi below the wall: an old clay jar, some tinware, a few coppers, half a rotted ledger. No gold. The crowd is quiet for a long time.',
        'At dawn the heritage office arrives. The objects are sealed, registered and taken away. The yard empties, the guests stop coming, the villagers sit at their doors and say nothing.',
        'You keep one photograph. In it, the wall inscription \u2014 \u201ca heart of white\u201d \u2014 is shown from behind, and there was nothing written there at all.'
      ]
    },
    lesson: { zh: '文物一旦离开原位，就只剩「物件」。', en: 'Once a relic leaves its place, it is only an object.' }
  },
  {
    id: 'e2', code: 'E-02',
    title: { zh: '结局二 · 话里的宝藏', en: 'Ending 2 \u00b7 Treasure in the Words' },
    body: {
      zh: [
        '金花把册子放进灶膛。火光照亮了她的脸，也照亮了灶头上那张桥神甲马。',
        '「宝藏不在土里，在话里。」她说，「我祖父守的不是缸，是这院子怎么盖、茶怎么敬、布怎么扎。这些，搬不走。」',
        '第二天，你在民宿的院子里坐下，跟着一位老人学扎第一朵花。你忽然明白第三个藏点在哪——它一直在这里，只是要有人愿意学。'
      ],
      en: [
        'Jinhua puts the ledger into the stove. The fire lights her face, and the bridge-god print above it.',
        '\u201cThe treasure is not in the earth, it is in the words,\u201d she says. \u201cMy grandfather kept no jar. He kept how this house is built, how tea is offered, how cloth is bound. None of that can be carried away.\u201d',
        'The next morning you sit in the yard and learn to tie your first motif. You understand where the third place is \u2014 it was always here; it only needed someone willing to learn.'
      ]
    },
    lesson: { zh: '活着的传承，是「有人还在做」。', en: 'A living tradition is simply someone still doing it.' }
  },
  {
    id: 'e3', code: 'E-03',
    title: { zh: '结局三 · 留原地的档案', en: 'Ending 3 \u00b7 The Archive That Stayed' },
    body: {
      zh: [
        '你把测绘报告、册子、六处旧痕的照片，做成一份公开档案：谁都可以查，但东西一件没动。',
        '林教授在报告扉页写下：「原位保存，是可核查的最高形式。」李富贵看了很久，最后在册子最后一页签了名——不是买主，是证人。',
        '半年后，这座院子成了村里第一个「可阅读的民宿」：每件旧物旁边都有一张卡片，写着它是什么、谁做的、为什么在这儿。'
      ],
      en: [
        'You turn the survey, the ledger and photographs of the six traces into a public archive: anyone may consult it, and not one object has moved.',
        'On the title page Prof. Lin writes: \u201cPreservation in situ is the most auditable form of care.\u201d Li Fugui reads for a long time, then signs the last page \u2014 not as a buyer, but as a witness.',
        'Half a year later the house becomes the village\u2019s first \u201creadable homestay\u201d: beside every old object is a card saying what it is, who made it, and why it is here.'
      ]
    },
    lesson: { zh: '可核查的公开，比锁起来的保护更有力。', en: 'Auditable openness protects better than a locked door.' }
  }
];

/* 导出 ---------------------------------------------------------------- */
var STORY = {
  title: { zh: '洱海密语', en: 'Whispers of Erhai' },
  subtitle: { zh: '《洱海迷雾：白族密语寻踪》数字版', en: 'Digital edition of \u201cMist over Erhai\u201d' },
  roles: ROLES,
  clues: CLUES,
  acts: ACTS,
  choices: CHOICES,
  endings: ENDINGS,
  needCluesToAdvance: 3
};

if (typeof module !== 'undefined' && module.exports) { module.exports = STORY; }
if (typeof window !== 'undefined') { window.STORY = STORY; }
