/* ==========================================================================
 * 云泽璞舍 · 洱海密语  ——  文化知识库（共享内容层）
 * --------------------------------------------------------------------------
 * 这是 M1「文化解码器」与 M2「数字剧本引擎」共用的内容底座。
 * 同一份文件同时被 H5 与微信小程序引用（由 tools/sync.mjs 复制到各自目录）。
 *
 * ⚠ 内容声明（重要，答辩前必须处理）：
 *   以下条目为「工程原型用的公开常识性内容」，用于验证系统结构与交互，
 *   不属于原创田野成果。提交前必须：
 *     1. 由团队 fieldwork 重新采写，替换 summary / body / facts；
 *     2. 每条补齐 sources 中的采写人、受访匠人、时间、授权情况；
 *     3. 核对 ICH 名录层级与年份（见 README「内容核校清单」）。
 *   直接使用本文件内容申报，会在「原创贡献」「材料真实性」两项上失分。
 * ========================================================================== */

var LANGS = ['zh', 'en', 'ja'];

var KNOWLEDGE = [];

function kb(o) { KNOWLEDGE.push(o); }

/* K01 ------------------------------------------------------------------ */
kb({
  id: 'K01', emoji: '🌀', cat: 'craft', hot: 9,
  name: { zh: '白族扎染', en: 'Bai Tie-dye', ja: '白族の絞り染め' },
  alias: {
    zh: ['扎染', '扎染布', '绞缬', '板蓝根', '周城', '蓝染'],
    en: ['tie-dye', 'tiedye', 'indigo', 'jiaoxie', 'zhoucheng'],
    ja: ['絞り', '藍染', 'タイダイ']
  },
  tags: ['非遗', '手工艺', '色彩', '可体验', 'craft', 'indigo'],
  summary: {
    zh: '白族扎染古称「绞缬」：先用针线缝扎布料，再浸入板蓝根发酵的染液。被扎紧的地方染液进不去，解开后留下白花，于是得到蓝白相间的纹样。大理周城一带是主要传承地。',
    en: 'Bai tie-dye was historically called jiaoxie. Cloth is first stitched and bound with thread, then dipped in dye fermented from wild indigo. Where the cloth is bound the dye cannot reach, so white motifs remain once it is untied, producing blue-and-white patterns. Zhoucheng near Dali is the main centre of the craft.',
    ja: '白族の絞り染めは古く「絞纈」と呼ばれました。布を針と糸で縫い絞ってから、板藍根を発酵させた染液に浸します。縛った部分には染液が入らないため、ほどくと白い文様が残り、藍と白の模様が生まれます。大理の周城周辺が主な伝承地です。'
  },
  body: {
    zh: [
      '扎染的关键其实不在「染」，而在「扎」。匠人按图样用针线缝扎，或用木夹、石块压缚布料；被束缚之处染液渗不进去，解开后便留下白花。同一块布，因扎法不同而纹样各异，所以世上没有两件完全相同的扎染。',
      '传统染液取自板蓝根（马蓝）的茎叶，经发酵制成，需反复浸染、氧化、晾晒数日才能得到沉静的深蓝。它不靠化学蓝，颜色会随穿着与光照慢慢变化——这是植物染与工业染最直观的区别。'
    ],
    en: [
      'The craft is less about dyeing than about binding. Artisans stitch patterns with needle and thread, or clamp the cloth with wooden boards and stones. Where the cloth is bound, dye cannot penetrate, and white motifs remain once it is untied. Because the binding differs each time, no two pieces are ever the same.',
      'Traditional dye liquor comes from the fermented stems and leaves of wild indigo. Repeated dipping, oxidising and drying over several days produce a deep, quiet blue. It is not a chemical blue: the colour shifts slowly with wear and light, which is the most visible difference between plant dyeing and industrial dyeing.'
    ]
  },
  facts: {
    zh: ['古称「绞缬」，先扎后染', '染料来自板蓝根发酵，非化学蓝', '纹样不重复，每件独一无二', '2006 年列入第一批国家级非物质文化遗产代表性项目名录'],
    en: ['Historically called jiaoxie: bind first, dye second', 'Indigo fermented from wild indigo, not synthetic dye', 'Every piece is unique', 'Inscribed on China\u2019s first national ICH list, 2006']
  },
  sources: [
    { label: { zh: '白族扎染技艺 · 国家级非物质文化遗产代表性项目名录（2006 年第一批）', en: 'Bai Tie-dye Craft \u00b7 China National ICH List, 1st batch (2006)' }, kind: 'ich' },
    { label: { zh: '原型占位：待替换为团队在周城的田野访谈记录', en: 'Placeholder: to be replaced by team fieldwork in Zhoucheng' }, kind: 'fieldwork', pending: true }
  ],
  experience: {
    zh: '在民宿可预约「半日扎染」：从扎花、浸染到出缸，两小时带走自己的作品。',
    en: 'Guests can book a half-day tie-dye session: binding, dipping, and taking home your own piece in about two hours.'
  }
});

/* K02 ------------------------------------------------------------------ */
kb({
  id: 'K02', emoji: '🍵', cat: 'food', hot: 8,
  name: { zh: '白族三道茶', en: 'Three-Course Tea', ja: '白族の三道茶' },
  alias: {
    zh: ['三道茶', '苦茶', '甜茶', '回味茶', '乳扇', '烤茶'],
    en: ['three-course tea', 'three course tea', 'bitter tea', 'sweet tea', 'rushan'],
    ja: ['三道茶', '苦茶', '甘茶']
  },
  tags: ['茶', '礼俗', '可体验', '味觉', 'tea', 'ritual'],
  summary: {
    zh: '白族三道茶是待客礼俗：第一道「苦茶」、第二道「甜茶」、第三道「回味茶」，以「一苦、二甜、三回味」喻人生。常见于婚庆、节庆与迎客场合。',
    en: 'Three-course tea is a Bai welcoming rite: a bitter first cup, a sweet second, and a lingering third. The sequence \u2014 bitter, sweet, then aftertaste \u2014 is read as a metaphor for a life. It appears at weddings, festivals and on receiving guests.',
    ja: '白族の三道茶は来客をもてなす作法で、一杯目は苦茶、二杯目は甘茶、三杯目は余韻の茶。苦・甘・余韻という順序を人生になぞらえます。婚礼や祭り、客を迎える場面で振る舞われます。'
  },
  body: {
    zh: [
      '三道茶用砂罐在炭火上烤茶。第一道茶汤浓而苦，量少，一口饮尽；第二道加入乳扇、核桃仁与红糖，转为香甜；第三道以蜂蜜、花椒、姜、桂皮入茶，麻、辣、甜、香兼具，喝完口中留味，故称「回味」。',
      '2022 年，「中国传统制茶技艺及其相关习俗」列入联合国教科文组织人类非物质文化遗产代表作名录，白族三道茶是其中的组成部分。'
    ],
    en: [
      'The tea is roasted in a small clay pot over charcoal. The first cup is strong and bitter, served in a tiny quantity and drunk in one go; the second adds rushan (cow-milk cheese), walnut and brown sugar, turning sweet; the third brings in honey, Sichuan pepper, ginger and cinnamon, so that numbing, heat, sweetness and aroma all arrive at once and linger \u2014 hence the name.',
      'In 2022, \u201cTraditional tea processing techniques and associated social practices in China\u201d was inscribed on the UNESCO Representative List of the Intangible Cultural Heritage of Humanity; Bai three-course tea is one of its components.'
    ]
  },
  facts: {
    zh: ['一苦、二甜、三回味', '用砂罐在炭火上烤制', '甜茶佐乳扇、核桃仁、红糖', '2022 年作为人类非遗的组成部分列入 UNESCO 名录'],
    en: ['Bitter, sweet, then lingering', 'Roasted in a clay pot over charcoal', 'Sweet cup uses rushan, walnut and brown sugar', 'Part of the UNESCO ICH inscription of 2022']
  },
  sources: [
    { label: { zh: '中国传统制茶技艺及其相关习俗 · UNESCO 人类非物质文化遗产代表作名录（2022）', en: 'Traditional tea processing techniques in China \u00b7 UNESCO ICH List (2022)' }, kind: 'ich' },
    { label: { zh: '原型占位：待替换为团队对民宿茶艺师的访谈记录', en: 'Placeholder: to be replaced by team interview with a local tea host' }, kind: 'fieldwork', pending: true }
  ],
  experience: {
    zh: '民宿每晚有一场三道茶，配白语祝词的中文与英文字幕。',
    en: 'A three-course tea is served every evening, with Chinese and English subtitles for the Bai-language blessing.'
  }
});

/* K03 ------------------------------------------------------------------ */
kb({
  id: 'K03', emoji: '🖨️', cat: 'faith', hot: 6,
  name: { zh: '甲马（纸马）', en: 'Jiama Woodblock Prints', ja: '甲馬（紙馬）' },
  alias: {
    zh: ['甲马', '纸马', '木刻', '版画', '门神'],
    en: ['jiama', 'paper horse', 'woodblock', 'print'],
    ja: ['甲馬', '紙馬', '木版画']
  },
  tags: ['信仰', '版画', '图像', 'faith', 'print'],
  summary: {
    zh: '甲马又称「纸马」，是大理白族地区流传的木刻版画。民间艺人刻版、手工印制，画面多为本主、山神、水神等神祇形象，用于祭祀、祈福与禳灾。',
    en: 'Jiama, also called \u201cpaper horse\u201d, is a woodblock print tradition of the Bai areas around Dali. Artisans carve the block and print by hand; the images are mostly local deities, mountain and water gods, used in sacrifice, blessing and averting misfortune.',
    ja: '甲馬は「紙馬」とも呼ばれ、大理の白族地域に伝わる木版画です。職人が版を彫り、手で摺ります。図像は本主や山神・水神などの神々が中心で、祭祀・祈願・厄払いに用いられました。'
  },
  body: {
    zh: [
      '甲马线条粗犷、构图朴拙，用墨单一，印在粗糙的土纸上。使用时或焚化、或张贴于门楣灶头，被认为可以沟通人神、驱邪纳吉。',
      '题材远比想象中生活化：除了神祇，还有「招财」「和合」「桥神」「路神」等，几乎覆盖了日常生活的每个转角。它是研究白族民间信仰最直接的实物材料之一，甲马也在云南多地列入非物质文化遗产代表性项目名录。'
    ],
    en: [
      'The lines are rough, the composition plain, the ink a single black, printed on coarse handmade paper. Sheets are burned or pasted above doors and beside the stove, understood to connect people with deities and to keep misfortune out.',
      'The subjects are far more everyday than one might expect: alongside gods there are prints for \u201cattracting wealth\u201d, \u201charrmony\u201d, \u201cbridge god\u201d and \u201croad god\u201d, covering almost every corner of daily life. Jiama is among the most direct material evidence for Bai folk belief, and is listed as an intangible cultural heritage item in several parts of Yunnan.'
    ]
  },
  facts: {
    zh: ['又称「纸马」，木刻手工印制', '题材含神祇与「招财」「和合」等生活化形象', '用于焚化或张贴，祈求纳吉驱邪', '云南多地已列入非物质文化遗产代表性项目'],
    en: ['Also called \u201cpaper horse\u201d; carved and printed by hand', 'Subjects include gods and everyday figures such as \u201cwealth\u201d and \u201charrmony\u201d', 'Burned or pasted up to invite good fortune', 'Listed as ICH items in several parts of Yunnan']
  },
  sources: [
    { label: { zh: '原型占位：待替换为团队对甲马艺人的访谈与图版授权说明', en: 'Placeholder: to be replaced by interview and image licensing note' }, kind: 'fieldwork', pending: true }
  ],
  experience: {
    zh: '民宿设有甲马拓印台，游客可亲手拓一张带走——但请先听一段它「为什么被烧掉」的说明。',
    en: 'There is a rubbing table in the courtyard: you can pull your own print \u2014 after hearing why these sheets were once burned.'
  }
});

/* K04 ------------------------------------------------------------------ */
kb({
  id: 'K04', emoji: '⛩️', cat: 'faith', hot: 7,
  name: { zh: '本主信仰', en: 'Benzhu Patron Deities', ja: '本主信仰' },
  alias: {
    zh: ['本主', '本主庙', '本主节', '村神', '守护神'],
    en: ['benzhu', 'patron deity', 'village god', 'temple'],
    ja: ['本主', '村の守護神']
  },
  tags: ['信仰', '村落', '节庆', 'faith', 'village'],
  summary: {
    zh: '本主是白族村落的守护神。一村或数村共祀一位本主，本主庙多位于村口或村中，是村落公共生活的中心。各村的「主」不同，互不统属。',
    en: 'Benzhu is the patron deity of a Bai village. One village, or several together, honour a single patron; the temple usually stands at the village entrance or centre and serves as the hub of public life. Each village has its own patron, and none rules over another.',
    ja: '本主は白族の村を守る神です。一村あるいは数村で一柱の本主を祀り、本主廟は村の入口や中央に置かれ、村落の公共生活の中心となります。村ごとに「主」が異なり、互いに従属しません。'
  },
  body: {
    zh: [
      '本主多是历史人物、传说英雄，也可能是山石、树木、水泉等自然物。因村而异，各有姓名、封号与传说，有的还能说出「生前」做过什么。',
      '每年本主节，村民迎送本主、唱大本曲、跳霸王鞭，是全村的集体仪式。本主信仰不属于某一宗教体系，而是白族地方性的民间信仰，兼具祖先崇拜与地方神崇拜的特征——它回答的是「我们村是谁」。'
    ],
    en: [
      'Patrons are often historical figures or legendary heroes, but may also be a rock, a tree or a spring. They differ from village to village, each with a name, a title and a story \u2014 sometimes a story of what the patron did while alive.',
      'At the annual Benzhu festival, villagers carry the image out and back, sing dabengqu ballads and dance the bawangbian whip dance: the collective rite of the whole village. Benzhu belief belongs to no organised religion; it is a local folk faith blending ancestor veneration with territorial deities, and it answers the question \u201cwho are we, this village\u201d.'
    ]
  },
  facts: {
    zh: ['一村一主，各村不同', '本主庙是村落公共空间', '本主节有迎送、唱大本曲、跳霸王鞭', '属地方性民间信仰，不隶属某一宗教体系'],
    en: ['One patron per village, differing by village', 'The temple is the village\u2019s public space', 'Festival involves procession, ballads and whip dance', 'A local folk faith, not part of an organised religion']
  },
  sources: [
    { label: { zh: '原型占位：待替换为团队对村民与庙祝的访谈记录', en: 'Placeholder: to be replaced by interviews with villagers and temple keepers' }, kind: 'fieldwork', pending: true }
  ],
  experience: {
    zh: '本主庙往往就在民宿步行十分钟内。进庙请勿踩门槛、勿对神像开闪光灯。',
    en: 'The village temple is usually a ten-minute walk away. Please do not step on the threshold or use flash inside.'
  }
});

/* K05 ------------------------------------------------------------------ */
kb({
  id: 'K05', emoji: '🏯', cat: 'architecture', hot: 9,
  name: { zh: '三坊一照壁', en: 'Three Wings and a Screen Wall', ja: '三坊一照壁' },
  alias: {
    zh: ['三坊一照壁', '照壁', '天井', '白族民居', '院落', '四合五天井'],
    en: ['screen wall', 'courtyard', 'three wings', 'bai house'],
    ja: ['照壁', '中庭', '白族民居']
  },
  tags: ['建筑', '空间', '非遗', 'architecture', 'courtyard'],
  summary: {
    zh: '「三坊一照壁」是白族民居的典型布局：正房与两侧厢房三面围合，前面以一堵照壁补齐，中间形成天井。照壁白底，常题字绘饰。',
    en: '\u201cThree wings and a screen wall\u201d is the classic Bai house plan: a main hall and two side wings enclose three sides, and a white screen wall closes the fourth, leaving a sky-well courtyard in the middle. The wall is often inscribed and painted.',
    ja: '「三坊一照壁」は白族民居の典型的な配置です。主屋と両側の棟が三方を囲み、手前を白い照壁で閉じ、中央に中庭（天井）が生まれます。照壁には文字や絵が施されることが多いです。'
  },
  body: {
    zh: [
      '三坊均为三开间两层，正房高于厢房。照壁的作用远不止装饰：它挡住下关方向来的风，把日光反射进天井，使院子明亮而不直晒。所以白族人说「照壁是院里的一盏灯」。',
      '院内常见「家家流水、户户养花」，山墙与门楼多做彩绘，与青瓦白墙一起构成白族民居的整体面貌。理解了这个布局，你才知道为什么白族人的客厅面向院子，而不是面向街道。'
    ],
    en: [
      'Each wing has three bays and two storeys, with the main hall taller than the sides. The screen wall does far more than decorate: it blocks the wind coming from Xiaguan and reflects sunlight into the courtyard, keeping the yard bright without direct glare. Bai households call it \u201ca lamp in the courtyard\u201d.',
      'Water channels run past each door and flowers are grown in every household; gable walls and gate towers carry paintings, which together with grey tiles and white walls form the overall look of a Bai house. Once you see the plan, you understand why the living room faces the courtyard rather than the street.'
    ]
  },
  facts: {
    zh: ['三面房屋、一面照壁围合成院', '照壁挡风、反光、题字', '正房高于厢房，各三开间两层', '青瓦白墙＋彩绘构成整体面貌'],
    en: ['Three wings encloses, one screen wall completes', 'The wall blocks wind, bounces light, carries inscriptions', 'Main hall is taller than the wings; three bays, two storeys', 'Grey tiles, white walls and painted details']
  },
  sources: [
    { label: { zh: '原型占位：待替换为团队对营造匠人的测绘与访谈', en: 'Placeholder: to be replaced by surveying and interviews with builders' }, kind: 'fieldwork', pending: true }
  ],
  experience: {
    zh: '站在照壁前看地上的光斑：正午最亮的一点，就是白族人判断时辰的位置。',
    en: 'Stand before the screen wall and watch the patch of light: the brightest point at noon is how the household once told the time.'
  }
});

/* K06 ------------------------------------------------------------------ */
kb({
  id: 'K06', emoji: '🎨', cat: 'architecture', hot: 7,
  name: { zh: '白族民居彩绘', en: 'Bai House Painting', ja: '白族民居の彩画' },
  alias: {
    zh: ['彩绘', '门楼', '山墙', '民居彩绘', '斗拱', '彩画'],
    en: ['painting', 'gate tower', 'mural', 'gable'],
    ja: ['彩画', '門楼', '壁画']
  },
  tags: ['建筑', '绘画', '非遗', 'architecture', 'painting'],
  summary: {
    zh: '白族民居彩绘以门楼、山墙、照壁为载体，用矿物与植物颜料绘出山水、花鸟与诗文书画，2008 年列入国家级非物质文化遗产代表性项目名录。',
    en: 'Bai house painting works on gate towers, gable walls and screen walls, using mineral and plant pigments for landscapes, birds and flowers, calligraphy and painting. It was inscribed on the national ICH list in 2008.',
    ja: '白族民居の彩画は門楼・妻壁・照壁を担体とし、鉱物性・植物性の顔料で山水・花鳥・詩書画を描きます。2008 年に国家級無形文化遺産に登録されました。'
  },
  body: {
    zh: [
      '彩绘讲究「淡雅」：以白、蓝、赭为主色，构图多取对称，题材多含吉祥寓意。它不是把墙画满，而是留白——大面积的白墙本身就是构图的一部分。',
      '门楼是装饰最集中的部位，斗拱、梁枋、雀替皆有彩画，被视为一家门面的象征。看一户人家的门楼，大致能读出这户人家的讲究与家底。'
    ],
    en: [
      'The style prizes restraint: white, blue and ochre dominate, compositions tend towards symmetry, and subjects carry auspicious meaning. It is not about filling the wall but about leaving it empty \u2014 the large white surface is itself part of the composition.',
      'The gate tower carries the densest decoration: bracket sets, beams and spandrels are all painted, and it is read as the face of the household. The gate alone tells you something about the family\u2019s taste and means.'
    ]
  },
  facts: {
    zh: ['载体：门楼、山墙、照壁', '白、蓝、赭为主的淡雅用色', '2008 年列入国家级非物质文化遗产', '门楼是装饰最集中处'],
    en: ['Carried on gate towers, gables and screen walls', 'Restrained palette of white, blue, ochre', 'National ICH list, 2008', 'Gate towers are the densest']
  },
  sources: [
    { label: { zh: '白族民居彩绘 · 国家级非物质文化遗产代表性项目名录（2008 年第二批）', en: 'Bai House Painting \u00b7 China National ICH List, 2nd batch (2008)' }, kind: 'ich' },
    { label: { zh: '原型占位：待补充彩绘匠人口述与图像授权', en: 'Placeholder: to add painter oral history and image licensing' }, kind: 'fieldwork', pending: true }
  ],
  experience: {
    zh: '抬头看门楼内侧的雀替——那是全宅彩绘最细的地方，也是匠人签名常藏的位置。',
    en: 'Look up at the spandrels inside the gate: the finest painting in the house, and often where the artisan\u2019s mark hides.'
  }
});

/* K07 ------------------------------------------------------------------ */
kb({
  id: 'K07', emoji: '🔥', cat: 'festival', hot: 6,
  name: { zh: '白族火把节', en: 'Torch Festival', ja: '白族の火把節' },
  alias: {
    zh: ['火把节', '火把', '六月二十五', '绕三灵'],
    en: ['torch festival', 'torch', 'june 25'],
    ja: ['火把節', '松明']
  },
  tags: ['节庆', '夏季', '仪式', 'festival'],
  summary: {
    zh: '白族火把节在农历六月二十五举行：村民竖大火把、点火把、绕村巡游，祈求丰收与驱邪。青年绕火把歌舞，孩童持小火把游村。',
    en: 'The Bai Torch Festival falls on the 25th day of the sixth lunar month. Villagers raise a great torch, light it and walk the village boundary, praying for harvest and driving off misfortune; young people dance around it while children parade with small torches.',
    ja: '白族の火把節は旧暦六月二十五日。村人が大きな松明を立てて火を点し、村を巡って豊作と厄払いを願います。若者は松明を囲んで踊り、孩子们は小さな松明を持って村を歩きます。'
  },
  body: {
    zh: [
      '大火把以松木为干，插满小旗、水果与花束，点火后由村中长辈先拜。火把烧到一半，人们会抢「火把头」——据说带回家能保一年平安。',
      '火把节在白族、彝族、纳西族等多个民族中都有流传，日期相近而细节各异。在大理，它与「绕三灵」等一道，构成夏季节庆的主要形态。'
    ],
    en: [
      'The great torch is a pine trunk studded with small flags, fruit and flowers; after it is lit, village elders make the first offerings. When it has burned halfway people scramble for pieces of the torch head \u2014 carrying one home is said to keep the household safe for a year.',
      'Torch festivals are observed by the Bai, Yi, Naxi and other peoples on similar dates with different details. Around Dali it forms, together with rites such as Raosanling, the core of the summer festival season.'
    ]
  },
  facts: {
    zh: ['农历六月二十五', '竖大火把、持小火把游村', '祈丰收、驱邪、抢「火把头」', '多民族共有，细节各异'],
    en: ['25th day of the 6th lunar month', 'One great torch, many small ones', 'Harvest prayer, averting misfortune, scrambling for the torch head', 'Shared by several ethnic groups, differing in detail']
  },
  sources: [
    { label: { zh: '原型占位：待替换为团队在节庆现场的记录', en: 'Placeholder: to be replaced by team records made on site during the festival' }, kind: 'fieldwork', pending: true }
  ],
  experience: {
    zh: '若在六月到访，请向民宿确认当晚的观礼位置与安全须知——火把节的火焰是真的。',
    en: 'If you visit in the sixth lunar month, ask the house about viewing spots and safety \u2014 the flames are real.'
  }
});

/* K08 ------------------------------------------------------------------ */
kb({
  id: 'K08', emoji: '🌙', cat: 'landscape', hot: 8,
  name: { zh: '风花雪月', en: 'Wind, Flower, Snow, Moon', ja: '風花雪月' },
  alias: {
    zh: ['风花雪月', '下关风', '上关花', '苍山雪', '洱海月', '头饰', '金花'],
    en: ['wind flower snow moon', 'cangshan', 'erhai', 'head dress'],
    ja: ['風花雪月', '蒼山', '洱海']
  },
  tags: ['景观', '意象', '服饰', 'landscape', 'symbol'],
  summary: {
    zh: '「风花雪月」指下关风、上关花、苍山雪、洱海月，是大理最负盛名的四景，也是白族服饰、歌谣与工艺中反复出现的意象。',
    en: '\u201cWind, flower, snow, moon\u201d names four sights of Dali: the wind at Xiaguan, the flowers at Shangguan, the snow on Cangshan, the moon over Erhai. The set recurs constantly in Bai dress, song and craft.',
    ja: '「風花雪月」は下関の風、上関の花、蒼山の雪、洱海の月という大理の四景を指し、白族の衣装・歌謡・工芸に繰り返し現れる意象です。'
  },
  body: {
    zh: [
      '下关风终年不息，上关花指上关一带的杜鹃与茶花，苍山十九峰雪线常年可见，洱海月则是月夜水面如镜。四景各据一方，恰好围住了整个大理坝子。',
      '白族妇女头饰常以这四景为题：帽顶白绒喻雪，弯月形喻月，花饰喻花，飘带喻风——把整片风景戴在头上。这不是导游的解说词，而是当地人自己讲出来的说法，也是理解「地方感」最好的入口。'
    ],
    en: [
      'The wind at Xiaguan never stops; the flowers of Shangguan are rhododendrons and camellias; snow is visible year-round on the nineteen peaks of Cangshan; and on moonlit nights Erhai turns to a mirror. Each sight holds one quarter, together enclosing the Dali basin.',
      'Bai women\u2019s headdress often takes these four as its theme: white pile for snow, a crescent for the moon, floral ornaments for flowers, ribbons for wind \u2014 the whole landscape worn on the head. This is not a tour guide\u2019s line but a local explanation, and the best doorway into a sense of place.'
    ]
  },
  facts: {
    zh: ['下关风、上关花、苍山雪、洱海月', '白族头饰以四景为意象：白绒、弯月、花饰、飘带', '苍山十九峰、洱海形如耳', '四景各据大理坝子一方'],
    en: ['Wind, flower, snow, moon', 'Headdress encodes the four: white pile, crescent, flowers, ribbons', 'Nineteen peaks, a lake shaped like an ear', 'Each sight holds one quarter of the basin']
  },
  sources: [
    { label: { zh: '原型占位：待替换为团队对当地居民的口述记录', en: 'Placeholder: to be replaced by oral accounts collected locally' }, kind: 'fieldwork', pending: true }
  ],
  experience: {
    zh: '民宿二层露台是看洱海月最好的位置。农历十五前后，月亮会在二十一点左右从东岸升起。',
    en: 'The upper terrace is the best spot for the moon over Erhai: around the 15th of the lunar month it rises from the eastern shore at about 21:00.'
  }
});

/* 导出 ---------------------------------------------------------------- */
var KB = { LANGS: LANGS, entries: KNOWLEDGE };

if (typeof module !== 'undefined' && module.exports) { module.exports = KB; }
if (typeof window !== 'undefined') { window.KB = KB; }
