// 初始化 jsPsych
const jsPsych = initJsPsych();

// --- API 配置 ---
const API_URL = window.location.origin + '/api';
const {
  useState,
  useEffect,
  useRef
} = React;

// --- 配置 ---
const TRIALS_PER_BLOCK = 10;
const BGM_URL = "./bgm.mp3";

// --- 10道专业 AI 接受度问卷 (基于 GAAI/ATSAID) ---
const SURVEY_QUESTIONS = [
// 1. 总体开放度
{
  id: "q1",
  text: "在日常生活中，我是一个乐于尝试 AI 新技术（如 ChatGPT）的人。",
  type: "scale"
},
// 2. 咨询意愿
{
  id: "q2",
  text: "如果我有心理困扰，我会愿意尝试向 AI 进行初步倾诉。",
  type: "scale"
},
// 3. 客观性认知
{
  id: "q3",
  text: "相较于人类，我认为 AI 在分析问题时更加客观、中立，没有偏见。",
  type: "scale"
},
// 4. 隐私安全感
{
  id: "q4",
  text: "相比面对真人咨询师，面对 AI 让我感到更安全，更敢于说出秘密。",
  type: "scale"
},
// 5. 情感能力质疑 (负向)
{
  id: "q5",
  text: "我认为 AI 毕竟是机器，永远无法真正理解人类细腻的情感。",
  type: "scale"
},
// 6. 替代性预期
{
  id: "q6",
  text: "我认为在未来，AI 有能力处理轻度的心理咨询需求。",
  type: "scale"
},
// 7. 恐怖谷/不安感 (负向)
{
  id: "q7",
  text: "如果 AI 表现得太像真人，我会感到有些害怕或不舒服。",
  type: "scale"
},
// 8. 便捷性偏好
{
  id: "q8",
  text: "AI 能够随时随地秒回消息，这一点对我来说非常有吸引力。",
  type: "scale"
},
// 9. 信任倾向
{
  id: "q9",
  text: "如果 AI 给我提出了心理调节建议，我会愿意参考并去尝试。",
  type: "scale"
},
// 10. 总体前景
{
  id: "q10",
  text: "总体而言，我看好人工智能在心理健康领域的应用前景。",
  type: "scale"
}];

// --- 内部合成音效 ---
const playSynthSound = type => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'receive') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
};
const TOPICS = [{
  id: "t1",
  style: "Rational",
  optionLabel: "📄 投简历没人回",
  userText: "投了几十份简历都石沉大海，连个面试机会都没有，我是不是真的很差劲？",
  aiReply: "这种‘简历黑洞’在校招季很普遍，数据显示平均转化率仅5%。这反映供需比而非你个人能力。建议优化简历关键词匹配度。",
  humanReply: "这种‘简历黑洞’在校招季很普遍，数据显示平均转化率仅5%。这反映供需比而非你个人能力。建议优化简历关键词匹配度。"
}, {
  id: "t2",
  style: "Empathy",
  optionLabel: "🎮 室友半夜吵闹",
  userText: "室友每天半夜打游戏大喊大叫，我说了好几次他都不听，我快神经衰弱了。",
  aiReply: "宿舍本该是休息的港湾，现在却成了战场。想发火又怕撕破脸，只能独自忍受噪音和委屈，真的让人非常窒息。",
  humanReply: "宿舍本该是休息的港湾，现在却成了战场。想发火又怕撕破脸，只能独自忍受噪音和委屈，真的让人非常窒息。"
}, {
  id: "t3",
  style: "Empathy",
  optionLabel: "📚 考研二战失败",
  userText: "考研二战失败了，看着同学们都工作升职了，感觉自己这几年白活了。",
  aiReply: "你仿佛被按下了暂停键，而世界在倍速播放。看着同龄人绝尘而去，这种被抛下的恐慌感，一定让你深夜难眠。",
  humanReply: "你仿佛被按下了暂停键，而世界在倍速播放。看着同龄人绝尘而去，这种被抛下的恐慌感，一定让你深夜难眠。"
}, {
  id: "t4",
  style: "Rational",
  optionLabel: "⏰ 入职不敢下班",
  userText: "刚入职不敢准点下班，看老员工都在加班，我也只能耗着，很憋屈。",
  aiReply: "这是‘从众压力’下的表演性加班。长期如此会职业倦怠。建议设定个人效能指标，并在非关键期尝试准点离开，观察实际后果。",
  humanReply: "这是‘从众压力’下的表演性加班。长期如此会职业倦怠。建议设定个人效能指标，并在非关键期尝试准点离开，观察实际后果。"
}, {
  id: "t5",
  style: "Empathy",
  optionLabel: "🏠 父母逼我考公",
  userText: "父母非要我回老家考公务员，可我想留在大城市，每天都在吵架。",
  aiReply: "这不仅是职业冲突，更是‘做父母满意的孩子’还是‘做自己’的博弈。夹在梦想和孝顺中间，真的很撕裂。",
  humanReply: "这不仅是职业冲突，更是‘做父母满意的孩子’还是‘做自己’的博弈。夹在梦想和孝顺中间，真的很撕裂。"
}, {
  id: "t6",
  style: "Rational",
  optionLabel: "🎤 团建自我介绍",
  userText: "社恐严重，明天团建要自我介绍，想到就手脚冰凉。",
  aiReply: "被审视的感觉触发了战逃反应。请准备简短脚本并背熟，视为‘任务’而非‘表演’。讲话时目光聚焦在友善同事眉心。",
  humanReply: "被审视的感觉触发了战逃反应。请准备简短脚本并背熟，视为‘任务’而非‘表演’。讲话时目光聚焦在友善同事眉心。"
}, {
  id: "t7",
  style: "Empathy",
  optionLabel: "📱 男友不回消息",
  userText: "男朋友玩游戏从来不回我消息，因为这个吵了很多次，心很累。",
  aiReply: "你感觉自己被排在了游戏之后，这种‘次要感’让你觉得不被重视。每一次争吵，其实都是在呼喊：‘请看看我’。",
  humanReply: "你感觉自己被排在了游戏之后，这种‘次要感’让你觉得不被重视。每一次争吵，其实都是在呼喊：‘请看看我’。"
}, {
  id: "t8",
  style: "Rational",
  optionLabel: "📉 带团队搞砸了",
  userText: "第一次带团队项目就搞砸了，给公司造成损失，领导肯定对我很失望。",
  aiReply: "试用‘最坏情况分析法’。问自己：最坏结果是什么？赔偿还是辞退？概率多大？将模糊的焦虑具体化，恐惧感会降低。",
  humanReply: "试用‘最坏情况分析法’。问自己：最坏结果是什么？赔偿还是辞退？概率多大？将模糊的焦虑具体化，恐惧感会降低。"
}, {
  id: "t9",
  style: "Empathy",
  optionLabel: "💸 工资只够房租",
  userText: "每个月工资交完房租就没剩多少了，不敢社交不敢生病，是在生存不是生活。",
  aiReply: "看着万家灯火却没有一盏属于自己，那种每一步都必须小心翼翼、经不起一点风吹草动的脆弱感，真的让人很心酸。",
  humanReply: "看着万家灯火却没有一盏属于自己，那种每一步都必须小心翼翼、经不起一点风吹草动的脆弱感，真的让人很心酸。"
}, {
  id: "t10",
  style: "Empathy",
  optionLabel: "💔 暗恋的人有对象",
  userText: "暗恋那个男生很久了，最近发现他好像有喜欢的人了，只能偷偷哭。",
  aiReply: "这是一种‘未完成的哀伤’。所有期待在还没开始时就宣告结束。只能把满腔喜欢硬生生憋回去的滋味，太苦涩了。",
  humanReply: "这是一种‘未完成的哀伤’。所有期待在还没开始时就宣告结束。只能把满腔喜欢硬生生憋回去的滋味，太苦涩了。"
}, {
  id: "t11",
  style: "Rational",
  optionLabel: "🎓 论文写不出来",
  userText: "写毕业论文完全没有思路，导师还一直催，我焦虑得开始拔头发。",
  aiReply: "拔毛是高焦虑症状。建议将任务降级：先不要想‘写好’，只想‘写满’。采用‘烂初稿’策略，先完成堆砌再修改，打破瘫痪。",
  humanReply: "拔毛是高焦虑症状。建议将任务降级：先不要想‘写好’，只想‘写满’。采用‘烂初稿’策略，先完成堆砌再修改，打破瘫痪。"
}, {
  id: "t12",
  style: "Rational",
  optionLabel: "🤳 朋友圈P图两小时",
  userText: "感觉自己长得不好看，每次发朋友圈都要P图两小时，没人点赞就会删掉。",
  aiReply: "你把自我价值绑定在他人的反馈上。建议进行‘数字排毒’。同时练习在镜子前找出一个非外貌的优点，建立内在评价系。",
  humanReply: "你把自我价值绑定在他人的反馈上。建议进行‘数字排毒’。同时练习在镜子前找出一个非外貌的优点，建立内在评价系。"
}, {
  id: "t13",
  style: "Empathy",
  optionLabel: "🌙 下班后回消息",
  userText: "领导总是在下班后发微信布置工作，我不敢不回，完全没有个人空间。",
  aiReply: "这严重侵犯了你的边界。你像随时待命的士兵，时刻紧绷。这种被工作吞噬、无法喘息的压迫感，让你失去了生活掌控权。",
  humanReply: "这严重侵犯了你的边界。你像随时待命的士兵，时刻紧绷。这种被工作吞噬、无法喘息的压迫感，让你失去了生活掌控权。"
}, {
  id: "t14",
  style: "Rational",
  optionLabel: "🐶 母胎Solo焦虑",
  userText: "周围同学都脱单了，就我还是母胎solo，我是不是注定孤独终老？",
  aiReply: "这是‘单一归因谬误’。单身由环境、机遇等多因素造成，不代表你缺乏吸引力。建议扩大社交半径，从建立弱连接开始。",
  humanReply: "这是‘单一归因谬误’。单身由环境、机遇等多因素造成，不代表你缺乏吸引力。建议扩大社交半径，从建立弱连接开始。"
}, {
  id: "t15",
  style: "Empathy",
  optionLabel: "🍳 实习被甩锅",
  userText: "实习的时候被老员工甩锅，明明不是我的错，却被主管骂了一顿。",
  aiReply: "百口莫辩的委屈感像石头一样堵在胸口吧？因为话语权不对等而被迫背负不属于自己的错误，这种职场霸凌是非常真实的创伤。",
  humanReply: "百口莫辩的委屈感像石头一样堵在胸口吧？因为话语权不对等而被迫背负不属于自己的错误，这种职场霸凌是非常真实的创伤。"
}, {
  id: "t16",
  style: "Rational",
  optionLabel: "🚆 异地恋发展冲突",
  userText: "我想去大城市闯闯，但男朋友想留在家乡，我们是不是只能分手了？",
  aiReply: "这属于核心需求冲突。建议深度沟通未来5年蓝图。如果无法在不牺牲核心自我的前提下妥协，及时止损也是负责的选择。",
  humanReply: "这属于核心需求冲突。建议深度沟通未来5年蓝图。如果无法在不牺牲核心自我的前提下妥协，及时止损也是负责的选择。"
}, {
  id: "t17",
  style: "Rational",
  optionLabel: "🙏 不敢拒绝借钱",
  userText: "总觉得自己是‘讨好型人格’，别人借钱我都不敢拒绝，怕得罪人。",
  aiReply: "需进行‘拒绝脱敏训练’。从拒绝微小请求开始（如拒帮带快递），观察结果——天不会塌，对方也不会绝交。修正错误认知。",
  humanReply: "需进行‘拒绝脱敏训练’。从拒绝微小请求开始（如拒帮带快递），观察结果——天不会塌，对方也不会绝交。修正错误认知。"
}, {
  id: "t18",
  style: "Empathy",
  optionLabel: "📖 看不进书想躺平",
  userText: "考研复习了一年，现在离考试越近越看不进去书，只想躺平。",
  aiReply: "这是大脑的‘过载保护’。你不是想偷懒，是太累了。身体在强制你休息，试着接纳停顿，允许自己休息，而不是自责内耗。",
  humanReply: "这是大脑的‘过载保护’。你不是想偷懒，是太累了。身体在强制你休息，试着接纳停顿，允许自己休息，而不是自责内耗。"
}, {
  id: "t19",
  style: "Rational",
  optionLabel: "🍂 大学同学渐远",
  userText: "我感觉自己和大学同学渐行渐远了，群里都没人说话，挺失落的。",
  aiReply: "这是‘情境性友谊’的消退。生活轨迹分叉导致话题减少是必然的。建议主动筛选出愿意维系的核心朋友，接受其他人成为过客。",
  humanReply: "这是‘情境性友谊’的消退。生活轨迹分叉导致话题减少是必然的。建议主动筛选出愿意维系的核心朋友，接受其他人成为过客。"
}, {
  id: "t20",
  style: "Empathy",
  optionLabel: "🚇 通勤太久绝望",
  userText: "每天通勤单程一个半小时，感觉生命都被浪费在地铁上了，很绝望。",
  aiReply: "被挤成沙丁鱼、在封闭车厢里摇晃的时刻，真的让人怀疑人生。每天三小时被切除，这种对生活失去掌控的无力感太折磨人。",
  humanReply: "被挤成沙丁鱼、在封闭车厢里摇晃的时刻，真的让人怀疑人生。每天三小时被切除，这种对生活失去掌控的无力感太折磨人。"
}, {
  id: "t21",
  style: "Rational",
  optionLabel: "💍 被催婚不想回家",
  userText: "被家里催婚催得不想回家过年，他们根本不理解现代人的压力。",
  aiReply: "这反映代际价值观冲突。父母眼中结婚是安全感，你眼中是束缚。尝试温和坚定表达：‘我知道你们担心，但我有自己节奏’。",
  humanReply: "这反映代际价值观冲突。父母眼中结婚是安全感，你眼中是束缚。尝试温和坚定表达：‘我知道你们担心，但我有自己节奏’。"
}, {
  id: "t22",
  style: "Empathy",
  optionLabel: "🎭 感觉自己是冒牌",
  userText: "我感觉自己好像有点‘冒充者综合症’，拿到offer觉得是运气好，怕进去露馅。",
  aiReply: "你总觉得在欺骗世界，时刻等着靴子掉下来。明明是你努力得来的成果却不敢认领。这种小心翼翼、觉得自己配不上的感觉很累。",
  humanReply: "你总觉得在欺骗世界，时刻等着靴子掉下来。明明是你努力得来的成果却不敢认领。这种小心翼翼、觉得自己配不上的感觉很累。"
}, {
  id: "t23",
  style: "Rational",
  optionLabel: "🔙 前任想复合",
  userText: "前任突然联系我，说想复合，我心里很乱，不知道该不该答应。",
  aiReply: "建议进行‘回忆检视’：导致分手的根本原因解决了吗？如果原则性问题没变，复合只是重演历史。别让孤独美化了痛苦。",
  humanReply: "建议进行‘回忆检视’：导致分手的根本原因解决了吗？如果原则性问题没变，复合只是重演历史。别让孤独美化了痛苦。"
}, {
  id: "t24",
  style: "Empathy",
  optionLabel: "🧴 室友乱用东西",
  userText: "合租的室友总是用我的东西不打招呼，洗发水都被用空了。",
  aiReply: "这是对私人边界的公然入侵。在自己租的房子里还要防贼一样，这种安全感的丧失和无法放松的紧绷感，真的让人抓狂。",
  humanReply: "这是对私人边界的公然入侵。在自己租的房子里还要防贼一样，这种安全感的丧失和无法放松的紧绷感，真的让人抓狂。"
}, {
  id: "t25",
  style: "Rational",
  optionLabel: "🗑️ 觉得自己是废物",
  userText: "我觉得自己什么都做不好，是个彻底的废物，活着浪费空气。",
  aiReply: "这是‘全或无’思维。你把挫折泛化到了整个人生。请列出本周做成的三件小事，用具体证据驳斥‘废物’标签，重建效能感。",
  humanReply: "这是‘全或无’思维。你把挫折泛化到了整个人生。请列出本周做成的三件小事，用具体证据驳斥‘废物’标签，重建效能感。"
}, {
  id: "t26",
  style: "Rational",
  optionLabel: "🏃‍♂️ 两年换三份工",
  userText: "毕业两年换了三份工作，每份都干不长，我是不是没长性？",
  aiReply: "职业探索期变动正常。建议分析原因：是人际还是能力？若是寻找‘完美工作’需调整预期：任何工作都有苦，关键愿意吃哪种苦。",
  humanReply: "职业探索期变动正常。建议分析原因：是人际还是能力？若是寻找‘完美工作’需调整预期：任何工作都有苦，关键愿意吃哪种苦。"
}, {
  id: "t27",
  style: "Empathy",
  optionLabel: "🌚 深夜想起尴尬事",
  userText: "经常半夜emo，想起以前做过的蠢事，尴尬得想在那一刻掐死自己。",
  aiReply: "深夜里你成了自己最严苛的法官，反复审判过去。这种无法原谅自己、恨不得抹去过去的羞耻感，真的非常折磨人。",
  humanReply: "深夜里你成了自己最严苛的法官，反复审判过去。这种无法原谅自己、恨不得抹去过去的羞耻感，真的非常折磨人。"
}, {
  id: "t28",
  style: "Rational",
  optionLabel: "🍋 别人都在晒Offer",
  userText: "朋友圈里大家都在晒旅游、晒offer，只有我在出租屋里吃泡面。",
  aiReply: "社交媒体是‘高光时刻’。你用自己的后台（狼狈现实）对比别人的前台（光鲜展示）。这种比较不公平，建议限制刷圈。",
  humanReply: "社交媒体是‘高光时刻’。你用自己的后台（狼狈现实）对比别人的前台（光鲜展示）。这种比较不公平，建议限制刷圈。"
}, {
  id: "t29",
  style: "Empathy",
  optionLabel: "🔒 女友总查手机",
  userText: "女朋友总是查我手机，不给看就说我有鬼，我感觉一点隐私都没有。",
  aiReply: "在亲密关系中被像犯人一样审视，这种不被信任的感觉非常刺痛。你既爱她又渴望独立空间，这种反复拉扯的窒息感很难受。",
  humanReply: "在亲密关系中被像犯人一样审视，这种不被信任的感觉非常刺痛。你既爱她又渴望独立空间，这种反复拉扯的窒息感很难受。"
}, {
  id: "t30",
  style: "Rational",
  optionLabel: "🍰 心情不好狂吃",
  userText: "最近总是暴饮暴食，心情不好就疯狂吃甜食，吃完又后悔。",
  aiReply: "这是‘情绪性进食’。大脑在寻求多巴胺。建议建立‘情绪急救包’：列出5件除吃以外的开心事（如撸猫），强迫延迟满足。",
  humanReply: "这是‘情绪性进食’。大脑在寻求多巴胺。建议建立‘情绪急救包’：列出5件除吃以外的开心事（如撸猫），强迫延迟满足。"
}, {
  id: "t31",
  style: "Empathy",
  optionLabel: "💒 单亲家庭恐婚",
  userText: "我是单亲家庭长大的，很怕结婚，觉得婚姻最后都会是一地鸡毛。",
  aiReply: "父母婚姻失败在你心里投下阴影。你目睹破碎，所以预设悲剧。想爱又怕重蹈覆辙而选择逃避，这是令人心疼的保护色。",
  humanReply: "父母婚姻失败在你心里投下阴影。你目睹破碎，所以预设悲剧。想爱又怕重蹈覆辙而选择逃避，这是令人心疼的保护色。"
}, {
  id: "t32",
  style: "Rational",
  optionLabel: "📥 领导一直加活",
  userText: "工作太多做不完，领导还一直加塞，我都在工位上崩溃大哭了。",
  aiReply: "建议管理预期。当加塞时，拿出任务清单温和展示：‘如果先做这个，A和B会延期，您看优先级怎么排？’把选择权抛回。",
  humanReply: "建议管理预期。当加塞时，拿出任务清单温和展示：‘如果先做这个，A和B会延期，您看优先级怎么排？’把选择权抛回。"
}, {
  id: "t33",
  style: "Empathy",
  optionLabel: "👻 集体里没存在感",
  userText: "感觉自己是个‘小透明’，在集体里从来没有存在感，也没人听我说话。",
  aiReply: "被淹没、像在演哑剧的感觉很孤独。你渴望被接纳，但现实的冷漠一次次把你推回角落，这种被遗忘的失落感真的很沉重。",
  humanReply: "被淹没、像在演哑剧的感觉很孤独。你渴望被接纳，但现实的冷漠一次次把你推回角落，这种被遗忘的失落感真的很沉重。"
}, {
  id: "t34",
  style: "Rational",
  optionLabel: "🛡️ 答辩PPT没做完",
  userText: "马上要毕业答辩了，PPT还没做完，我好想逃避，什么都不想干。",
  aiReply: "逃避是杏仁核的防御。告诉自己‘先做一张最丑的’。降低标准，只要开始做，焦虑就会下降。动作是对抗焦虑的解药。",
  humanReply: "逃避是杏仁核的防御。告诉自己‘先做一张最丑的’。降低标准，只要开始做，焦虑就会下降。动作是对抗焦虑的解药。"
}, {
  id: "t35",
  style: "Empathy",
  optionLabel: "📱 异地恋只剩吵架",
  userText: "异地恋一年了，见不到面只能对着手机吵架，不知道还要不要坚持。",
  aiReply: "隔着屏幕的拥抱没温度，争吵却诛心。这种谈‘电子恋爱’的孤独和对未来的恐慌，正在一点点耗尽你的耐心和爱意。",
  humanReply: "隔着屏幕的拥抱没温度，争吵却诛心。这种谈‘电子恋爱’的孤独和对未来的恐慌，正在一点点耗尽你的耐心和爱意。"
}, {
  id: "t36",
  style: "Empathy",
  optionLabel: "⚖️ 父母拿我比亲戚",
  userText: "我爸妈总是拿我和亲戚家的孩子比，说人家考上公务员了，我就是个打工的。",
  aiReply: "这种比较像刀子，否定了你所有的努力。在父母眼里价值只取决于编制，这种不被至亲认可的委屈，真的非常伤人。",
  humanReply: "这种比较像刀子，否定了你所有的努力。在父母眼里价值只取决于编制，这种不被至亲认可的委屈，真的非常伤人。"
}, {
  id: "t37",
  style: "Rational",
  optionLabel: "🧠 最近记性特差",
  userText: "最近记性特别差，刚说要做什么转头就忘，我是不是痴呆了？",
  aiReply: "这通常是压力导致的‘假性痴呆’。大脑超负荷运转。建议减少碎片化信息，每天冥想10分钟，给大脑‘碎片整理’的时间。",
  humanReply: "这通常是压力导致的‘假性痴呆’。大脑超负荷运转。建议减少碎片化信息，每天冥想10分钟，给大脑‘碎片整理’的时间。"
}, {
  id: "t38",
  style: "Rational",
  optionLabel: "⚡ 男友想要贤妻良母",
  userText: "和男朋友三观不合，他觉得女生就该相夫教子，我想搞事业。",
  aiReply: "这涉及核心价值观冲突。与其试图改变对方，不如评估差异可调和性。如果永远不改变你能接受吗？若不能，长痛不如短痛。",
  humanReply: "这涉及核心价值观冲突。与其试图改变对方，不如评估差异可调和性。如果永远不改变你能接受吗？若不能，长痛不如短痛。"
}, {
  id: "t39",
  style: "Empathy",
  optionLabel: "🎭 朋友圈装现充",
  userText: "我觉得自己活得很假，在朋友圈装现充，其实每天都很丧。",
  aiReply: "你在舞台上表演快乐，台下早已精疲力竭。人前光鲜和人后破碎的撕裂感，让你觉得自己像骗子，无法展示脆弱是最深的孤独。",
  humanReply: "你在舞台上表演快乐，台下早已精疲力竭。人前光鲜和人后破碎的撕裂感，让你觉得自己像骗子，无法展示脆弱是最深的孤独。"
}, {
  id: "t40",
  style: "Rational",
  optionLabel: "🚫 还没做就说不行",
  userText: "每次想尝试新事物，脑子里就有个声音说‘你肯定不行’，还没开始就放弃了。",
  aiReply: "这是内在‘批评家’。给它起个名（如唐老鸭），当它出现时幽默地说：‘谢谢提醒，但我决定试一试’。将消极声音客体化。",
  humanReply: "这是内在‘批评家’。给它起个名（如唐老鸭），当它出现时幽默地说：‘谢谢提醒，但我决定试一试’。将消极声音客体化。"
}];

// --- 组件 ---
const CompactSlider = ({
  label,
  description,
  value,
  onChange,
  minLabel,
  maxLabel,
  color
}) => {
  const isIndigo = color === 'indigo';
  const colorHex = isIndigo ? '#6366f1' : '#8b5cf6';
  return /*#__PURE__*/React.createElement("div", {
    className: "mb-4 last:mb-0 animate-fade-up"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-end mb-1.5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-slate-700 text-xs tracking-tight block"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-500 font-medium leading-none"
  }, description)), /*#__PURE__*/React.createElement("span", {
    className: `font-mono font-bold text-[10px] px-2 py-0.5 rounded-full bg-opacity-10 ${isIndigo ? 'bg-indigo-600 text-indigo-700' : 'bg-violet-600 text-violet-700'}`
  }, value)), /*#__PURE__*/React.createElement("div", {
    className: "relative w-full h-6 flex items-center"
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "100",
    value: value,
    onChange: e => onChange(Number(e.target.value)),
    className: `w-full h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none ${isIndigo ? 'text-indigo-600' : 'text-violet-600'}`,
    style: {
      background: `linear-gradient(90deg, ${colorHex} ${value}%, #e2e8f0 ${value}%)`
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider -mt-1"
  }, /*#__PURE__*/React.createElement("span", null, minLabel), /*#__PURE__*/React.createElement("span", null, maxLabel)));
};
const SettingsPanel = ({
  musicOn,
  toggleMusic,
  sfxOn,
  toggleSfx
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed top-4 right-4 flex gap-2 z-50 animate-pop-in"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: toggleMusic,
    className: "bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-white transition text-slate-600 border border-white/50"
  }, musicOn ? /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFB5") : /*#__PURE__*/React.createElement("span", {
    className: "opacity-50 line-through"
  }, "\uD83C\uDFB5")), /*#__PURE__*/React.createElement("button", {
    onClick: toggleSfx,
    className: "bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-white transition text-slate-600 border border-white/50"
  }, sfxOn ? /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD0A") : /*#__PURE__*/React.createElement("span", {
    className: "opacity-50 line-through"
  }, "\uD83D\uDD0A")));
};
const App = () => {
  const [appStage, setAppStage] = useState('WELCOME');
  const [studentId, setStudentId] = useState(''); // 新增：学号状态
  const [studentName, setStudentName] = useState(''); // 新增：姓名状态
  const [blockOrder, setBlockOrder] = useState([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [trialsInBlock, setTrialsInBlock] = useState(0);
  const [usedTopicIds, setUsedTopicIds] = useState([]);
  const [sessionPhase, setSessionPhase] = useState('SELECTION');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [cognitiveVal, setCognitiveVal] = useState(50);
  const [affectiveVal, setAffectiveVal] = useState(50);
  const [interactions, setInteractions] = useState([]);
  const [turingData, setTuringData] = useState([]);
  const [turingIndex, setTuringIndex] = useState(0);

  // 新增：问卷数据状态
  const [surveyData, setSurveyData] = useState({});
  const chatEndRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const audioRef = useRef(null);

  // 新增：上传数据函数
  const uploadData = async (finalStudentId, finalStudentName, finalInteractions, finalTuringData, finalSurveyData) => {
    console.log("Starting data upload...");
    console.log("Student ID:", finalStudentId);
    console.log("API URL:", API_URL);
    console.log("Data to upload:", {
      student_id: finalStudentId,
      student_name: finalStudentName,
      interactions: finalInteractions,
      turing_test: finalTuringData,
      survey: finalSurveyData
    });
    try {
      const response = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: finalStudentId,
          student_name: finalStudentName,
          interactions: finalInteractions,
          turing_test: finalTuringData,
          survey: finalSurveyData
        })
      });
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log("Upload Success:", data);
    } catch (error) {
      console.error("Upload Failed:", error);
      alert('数据上传失败：' + error.message + '\n请打开浏览器控制台查看详细错误信息');
    }
  };
  useEffect(() => {
    audioRef.current = new Audio(BGM_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    audioRef.current.load();
  }, []);
  useEffect(() => {
    if (!audioRef.current) return;
    if (musicOn && appStage !== 'WELCOME' && appStage !== 'END' && appStage !== 'SURVEY') {
      audioRef.current.play().catch(e => {
        console.log("Audio waiting for interaction");
      });
    } else {
      audioRef.current.pause();
    }
  }, [musicOn, appStage]);
  const playEffect = type => {
    if (!sfxOn) return;
    playSynthSound(type);
  };
  useEffect(() => {
    if (chatEndRef.current) {
      setTimeout(() => {
        chatEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      }, 100);
    }
  }, [chatHistory, sessionPhase]);
  const initExperiment = () => {
    const order = Math.random() < 0.5 ? ['AI', 'HUMAN'] : ['HUMAN', 'AI'];
    setBlockOrder(order);
    setCurrentBlockIndex(0);
    setTrialsInBlock(0);
    setUsedTopicIds([]);
    setInteractions([]);
    setAppStage('BLOCK_INTRO');
  };
  const startBlock = () => {
    setChatHistory([]);
    setTrialsInBlock(0);
    setAppStage('CHAT_SESSION');
    prepareNewTrial();
  };
  const prepareNewTrial = () => {
    setSessionPhase('SELECTION');
    setCognitiveVal(50);
    setAffectiveVal(50);
    const available = TOPICS.filter(topic => !usedTopicIds.includes(topic.id));
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    setCurrentChoices(shuffled.slice(0, 3));
  };
  const handleTopicSelection = topic => {
    playEffect('send');
    setActiveTopic(topic);
    setUsedTopicIds(prev => [...prev, topic.id]);
    const newHistory = [...chatHistory, {
      id: Date.now().toString(),
      role: 'user',
      text: topic.userText
    }, {
      id: 'typing-placeholder',
      role: 'agent',
      isTyping: true
    }];
    setChatHistory(newHistory);
    setSessionPhase('TYPING');
    setTimeout(() => {
      const currentBlock = blockOrder[currentBlockIndex];
      const replyText = currentBlock === 'AI' ? topic.aiReply : topic.humanReply;
      setChatHistory(prev => [...prev.filter(m => !m.isTyping), {
        id: Date.now().toString() + '_reply',
        role: 'agent',
        text: replyText
      }]);
      playEffect('receive');
      setSessionPhase('RATING');
    }, 1200 + Math.random() * 500);
  };
  const submitRating = e => {
    if (e) e.preventDefault();
    if (!activeTopic) return;
    const currentBlock = blockOrder[currentBlockIndex];
    const record = {
      topicId: activeTopic.id,
      blockType: currentBlock,
      style: activeTopic.style,
      userText: activeTopic.userText,
      agentReply: currentBlock === 'AI' ? activeTopic.aiReply : activeTopic.humanReply,
      cognitiveScore: cognitiveVal,
      affectiveScore: affectiveVal
    };
    try {
      jsPsych.data.get().push(record);
    } catch (err) {}
    const newInteractions = [...interactions, record];
    setInteractions(newInteractions);
    if (trialsInBlock + 1 < TRIALS_PER_BLOCK) {
      setTrialsInBlock(prev => prev + 1);
      prepareNewTrial();
    } else {
      if (currentBlockIndex < blockOrder.length - 1) {
        setCurrentBlockIndex(prev => prev + 1);
        setAppStage('BLOCK_INTRO');
      } else {
        setAppStage('TURING_INTRO');
        initTuringTest(newInteractions);
      }
    }
  };
  const initTuringTest = records => {
    const shuffled = [...records].sort(() => 0.5 - Math.random());
    setTuringData(shuffled.slice(0, 6));
    setTuringIndex(0);
  };
  const handleTuringGuess = guess => {
    const updated = [...turingData];
    updated[turingIndex].turingGuess = guess;
    setTuringData(updated);
    try {
      jsPsych.data.get().push({
        type: 'turing_test',
        topicId: updated[turingIndex].topicId,
        guess: guess,
        actual: updated[turingIndex].blockType
      });
    } catch (err) {}
    if (turingIndex < turingData.length - 1) {
      setTuringIndex(prev => prev + 1);
    } else {
      // 图灵测试结束，进入问卷阶段
      setAppStage('SURVEY');
    }
  };

  // 新增：问卷提交逻辑
  const handleSurveySubmit = () => {
    if (Object.keys(surveyData).length < SURVEY_QUESTIONS.length) {
      alert("请先完成所有题目哦");
      return;
    }

    // 提交问卷后，统一上传数据（传递 studentId）
    uploadData(studentId, studentName, interactions, turingData, surveyData);
    setAppStage('END');
  };

  // --- UI 渲染 ---
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SettingsPanel, {
    musicOn: musicOn,
    toggleMusic: () => setMusicOn(!musicOn),
    sfxOn: sfxOn,
    toggleSfx: () => setSfxOn(!sfxOn)
  }), /*#__PURE__*/React.createElement("div", {
    id: "root",
    class: "w-full h-full flex items-center justify-center p-4"
  }, appStage === 'WELCOME' && /*#__PURE__*/React.createElement("div", {
    className: "glass-card p-10 max-w-lg text-center shadow-xl border border-white/60 rounded-3xl animate-pop-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-6xl mb-6 animate-bounce"
  }, "\uD83E\uDDE0"), /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-bold text-slate-800 mb-2"
  }, "\u4EBA\u673A\u4EA4\u4E92\u5FC3\u7406\u7814\u7A76"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 mb-8 font-medium"
  }, "\u63A2\u7D22 AI \u4E0E\u4EBA\u7C7B\u54A8\u8BE2\u5E08\u56DE\u590D\u7ED9\u4EBA\u7684\u5FC3\u7406\u611F\u53D7\u5DEE\u5F02\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "bg-white/50 rounded-2xl p-6 text-left text-sm mb-8 border border-white/50 shadow-inner"
  }, /*#__PURE__*/React.createElement("strong", {
    className: "block mb-3 text-indigo-600 font-bold uppercase tracking-wider text-xs"
  }, "\uD83D\uDCDA \u5B9E\u9A8C\u8BF4\u660E"), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2 text-slate-600 list-disc list-inside"
  }, /*#__PURE__*/React.createElement("li", null, "\u5B9E\u9A8C\u5206\u4E3A\u4E24\u4E2A\u9636\u6BB5 (AI / \u771F\u4EBA)\uFF0C\u5404 10 \u9898\u3002"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "\u9636\u6BB5\u51FA\u73B0\u7684\u987A\u5E8F\u7531\u7CFB\u7EDF\u968F\u673A\u62BD\u53D6\u51B3\u5B9A\u3002")), /*#__PURE__*/React.createElement("li", null, "\u8BF7\u4ECE\u7ED9\u51FA\u7684\u8BDD\u9898\u4E2D\u9009\u62E9\u4F60\u611F\u5174\u8DA3\u7684\u63D0\u95EE\u3002"), /*#__PURE__*/React.createElement("li", null, "\u6536\u5230\u56DE\u590D\u540E\uFF0C\u8BF7\u51ED\u76F4\u89C9\u8BC4\u4EF7\u7406\u89E3\u5EA6\u548C\u6E29\u5EA6\u3002"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAppStage('STUDENT_ID'),
    className: "w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5 active:scale-95"
  }, "\u5F00\u59CB\u5B9E\u9A8C")), appStage === 'STUDENT_ID' && /*#__PURE__*/React.createElement("div", {
    className: "glass-card p-10 max-w-lg text-center shadow-xl border border-white/60 rounded-3xl animate-pop-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-6xl mb-6"
  }, "\uD83C\uDF93"), /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-bold text-slate-800 mb-2"
  }, "\u8BF7\u8F93\u5165\u60A8\u7684\u5B66\u53F7\u548C\u59D3\u540D"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 mb-8 font-medium"
  }, "\u5B66\u53F7\u548C\u59D3\u540D\u5C06\u4F5C\u4E3A\u60A8\u7684\u552F\u4E00\u6807\u8BC6\uFF0C\u8BF7\u786E\u4FDD\u8F93\u5165\u6B63\u786E\u3002"), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      const idInput = document.getElementById('studentIdInput').value.trim();
      const nameInput = document.getElementById('studentNameInput').value.trim();
      if (!idInput) {
        alert('请输入学号');
        return;
      }
      if (!nameInput) {
        alert('请输入姓名');
        return;
      }
      setStudentId(idInput);
      setStudentName(nameInput);
      initExperiment();
    },
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "studentIdInput",
    placeholder: "\u8BF7\u8F93\u5165\u5B66\u53F7",
    className: "w-full px-6 py-4 text-lg border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none transition text-center font-semibold",
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "studentNameInput",
    placeholder: "\u8BF7\u8F93\u5165\u59D3\u540D",
    className: "w-full px-6 py-4 text-lg border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none transition text-center font-semibold",
    required: true
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5 active:scale-95"
  }, "\u786E\u8BA4\u5E76\u7EE7\u7EED"))), appStage === 'BLOCK_INTRO' && /*#__PURE__*/React.createElement("div", {
    className: "glass-card p-12 max-w-md text-center shadow-2xl rounded-3xl animate-pop-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-8xl mb-6 transform transition duration-500 hover:scale-110 cursor-default"
  }, blockOrder[currentBlockIndex] === 'AI' ? "🤖" : "👨‍⚕️"), /*#__PURE__*/React.createElement("h2", {
    className: `text-2xl font-bold mb-4 ${blockOrder[currentBlockIndex] === 'AI' ? "text-indigo-600" : "text-amber-600"}`
  }, blockOrder[currentBlockIndex] === 'AI' ? "阶段 1 / 2 : 智能 AI 助手" : `阶段 2 / 2 : 真人咨询师`), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-600 mb-8 text-lg font-medium"
  }, blockOrder[currentBlockIndex] === 'AI' ? "接下来，你将与一位 AI 智能模型进行对话。" : "接下来，你将与一位资深心理咨询师进行对话。"), /*#__PURE__*/React.createElement("button", {
    onClick: startBlock,
    className: "px-10 py-3 bg-white border border-indigo-100 hover:border-indigo-300 text-indigo-900 rounded-full font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
  }, "\u8FDB\u5165\u804A\u5929")), appStage === 'CHAT_SESSION' && /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-md h-[90vh] sm:h-[700px] flex flex-col relative z-10 animate-pop-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card w-full h-full flex flex-col !p-0 overflow-hidden shadow-2xl border border-white/60 rounded-3xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white/70 backdrop-blur-md p-4 border-b border-white/40 flex items-center justify-center gap-2 shrink-0 shadow-sm z-20"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, blockOrder[currentBlockIndex] === 'AI' ? "🤖" : "👨‍⚕️"), /*#__PURE__*/React.createElement("span", {
    className: `font-bold text-base ${blockOrder[currentBlockIndex] === 'AI' ? "text-indigo-600" : "text-amber-600"}`
  }, blockOrder[currentBlockIndex] === 'AI' ? "AI 智能助手" : "资深咨询师")), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto px-5 py-6 chat-scroll scroll-smooth bg-white/30"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-6"
  }, chatHistory.map(msg => /*#__PURE__*/React.createElement("div", {
    key: msg.id,
    className: `flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-up`
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider mx-2"
  }, msg.role === 'user' ? "我" : blockOrder[currentBlockIndex] === 'AI' ? "AI 智能助手" : "资深咨询师"), msg.isTyping ? /*#__PURE__*/React.createElement("div", {
    className: "px-4 py-3 rounded-2xl rounded-tl-none bg-white shadow-sm border border-white/60"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1.5 animate-pulse"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 bg-indigo-400 rounded-full"
  }), /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 bg-indigo-400 rounded-full",
    style: {
      animationDelay: '0.15s'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 bg-indigo-400 rounded-full",
    style: {
      animationDelay: '0.3s'
    }
  }))) : /*#__PURE__*/React.createElement("div", {
    className: `px-5 py-3.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-md
                                                    ${msg.role === 'user' ? 'bg-white text-slate-700 border border-white/60 rounded-tr-none' : `text-white rounded-tl-none bg-gradient-to-br ${blockOrder[currentBlockIndex] === 'AI' ? "from-indigo-500 to-violet-500" : "from-amber-500 to-orange-500"}`}`
  }, msg.text))), /*#__PURE__*/React.createElement("div", {
    className: "h-20"
  }), /*#__PURE__*/React.createElement("div", {
    ref: chatEndRef
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-5 bg-white/80 backdrop-blur-lg border-t border-white/50 shrink-0 z-20"
  }, sessionPhase === 'SELECTION' && /*#__PURE__*/React.createElement("div", {
    className: "animate-fade-up"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-center text-xs text-indigo-900/60 mb-3 font-semibold uppercase tracking-wide"
  }, "\u8BF7\u4ECE\u4E0B\u65B9\u9009\u62E9\u4E00\u4E2A\u8BDD\u9898..."), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-2.5"
  }, currentChoices.map(topic => /*#__PURE__*/React.createElement("button", {
    key: topic.id,
    onClick: () => handleTopicSelection(topic),
    className: "bg-white hover:bg-indigo-50 p-3.5 rounded-xl text-left transition hover:-translate-y-0.5 hover:shadow-md border border-indigo-100/50 group w-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-lg"
  }, topic.optionLabel.split(" ")[0]), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col overflow-hidden"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-bold text-slate-700 group-hover:text-indigo-600 truncate"
  }, topic.optionLabel.split(" ").slice(1).join(" ")), /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-slate-400 truncate w-full"
  }, topic.userText))))))), sessionPhase === 'RATING' && /*#__PURE__*/React.createElement("div", {
    className: "animate-pop-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-4 pb-3 border-b border-slate-200/60"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest"
  }, "\u8BF7\u8BC4\u4EF7\u6B64\u56DE\u590D"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-full"
  }, "\u8FDB\u5EA6 ", trialsInBlock + 1, " / ", TRIALS_PER_BLOCK)), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement(CompactSlider, {
    label: "\uD83E\uDDE0 \u7406\u89E3\u7A0B\u5EA6",
    description: "\u7406\u89E3\u662F\u5426\u51C6\u786E\uFF1F",
    value: cognitiveVal,
    onChange: setCognitiveVal,
    minLabel: "\u6CA1\u61C2",
    maxLabel: "\u61C2\u6211",
    color: "indigo"
  }), /*#__PURE__*/React.createElement(CompactSlider, {
    label: "\u2764\uFE0F \u60C5\u611F\u6E29\u5EA6",
    description: "\u662F\u5426\u611F\u5230\u6E29\u6696\uFF1F",
    value: affectiveVal,
    onChange: setAffectiveVal,
    minLabel: "\u51B0\u51B7",
    maxLabel: "\u6E29\u6696",
    color: "violet"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: submitRating,
    className: "w-full mt-5 py-3.5 rounded-xl font-bold text-sm shadow-lg transition active:scale-95 bg-slate-900 hover:bg-black text-white cursor-pointer"
  }, "\u63D0\u4EA4\u8BC4\u4EF7")), sessionPhase === 'TYPING' && /*#__PURE__*/React.createElement("div", {
    className: "h-12 flex items-center justify-center text-xs text-slate-400 italic"
  }, "\u5BF9\u65B9\u6B63\u5728\u8F93\u5165...")))), appStage === 'TURING_INTRO' && /*#__PURE__*/React.createElement("div", {
    className: "glass-card p-10 max-w-md text-center shadow-2xl rounded-3xl animate-pop-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-6xl mb-6"
  }, "\uD83D\uDD75\uFE0F\u200D\u2640\uFE0F"), /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-bold text-slate-800 mb-4"
  }, "\u6700\u540E\u7684\u6311\u6218"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-600 mb-6 font-medium"
  }, "\u5176\u5B9E\uFF0C\u521A\u624D\u770B\u5230\u7684\u8EAB\u4EFD\u6807\u7B7E\uFF08AI/\u54A8\u8BE2\u5E08\uFF09\u53EF\u80FD\u662F\u5177\u6709\u8BEF\u5BFC\u6027\u7684\uFF0C\u8EAB\u4EFD\u548C\u56DE\u7B54\u4E0D\u4E00\u5B9A\u662F\u5B8C\u5168\u5339\u914D\u7684\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "bg-red-50 p-4 rounded-xl text-sm text-red-800 mb-8 border border-red-100 shadow-inner font-medium"
  }, "\u6211\u4EEC\u4ECE\u521A\u624D\u7684\u5BF9\u8BDD\u4E2D\u968F\u673A\u62BD\u53D6\u4E86 6 \u6761\u3002\u8BF7\u51ED\u76F4\u89C9\u731C\u6D4B\uFF1A\u8FD9\u53E5\u8BDD\u5230\u5E95\u662F\u8C01\u5199\u7684\uFF1F"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAppStage('TURING_TEST'),
    className: "w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition transform hover:-translate-y-0.5"
  }, "\u5F00\u59CB\u731C\u6D4B")), appStage === 'TURING_TEST' && /*#__PURE__*/React.createElement("div", {
    className: "glass-card p-8 max-w-lg w-full shadow-2xl rounded-3xl animate-pop-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6 border-b pb-4 border-slate-100"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold text-slate-400 uppercase tracking-widest"
  }, "\u7B2C ", turingIndex + 1, " / ", turingData.length, " \u9898"), /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-slate-800 mt-2"
  }, "\u4F60\u89C9\u5F97\u8FD9\u662F\u8C01\u5199\u7684\uFF1F")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4 mb-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-100 text-slate-600 px-5 py-4 rounded-2xl rounded-tl-none text-sm self-start max-w-[90%] font-medium"
  }, turingData[turingIndex].userText), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-800 text-slate-100 px-5 py-4 rounded-2xl rounded-tr-none text-sm shadow-md self-end max-w-[90%] leading-relaxed"
  }, turingData[turingIndex].agentReply)), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleTuringGuess('AI'),
    className: "flex-1 py-4 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl font-bold shadow-sm transition group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-2xl mb-1 group-hover:scale-110 transition-transform"
  }, "\uD83E\uDD16"), "\u50CF\u662F AI"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleTuringGuess('HUMAN'),
    className: "flex-1 py-4 bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-2xl font-bold shadow-sm transition group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-2xl mb-1 group-hover:scale-110 transition-transform"
  }, "\uD83D\uDC68\u200D\u2695\uFE0F"), "\u50CF\u662F \u4EBA\u7C7B"))), appStage === 'SURVEY' && /*#__PURE__*/React.createElement("div", {
    className: "glass-card p-8 max-w-lg w-full shadow-xl rounded-3xl animate-pop-in overflow-y-auto max-h-[85vh] scrollbar-hide"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-slate-800 mb-2 text-center"
  }, "\uD83D\uDCCB \u6700\u540E\u4E00\u6B65"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 text-xs mb-6 text-center"
  }, "\u8BF7\u6839\u636E\u60A8\u5E73\u65F6\u7684\u770B\u6CD5\u8BC4\u4EF7\u4EE5\u4E0B\u89C2\u70B9\uFF081=\u975E\u5E38\u4E0D\u540C\u610F\uFF0C5=\u975E\u5E38\u540C\u610F\uFF09"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, SURVEY_QUESTIONS.map((q, idx) => /*#__PURE__*/React.createElement("div", {
    key: q.id,
    className: "animate-fade-up",
    style: {
      animationDelay: idx * 0.1 + 's'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold text-slate-700 mb-3"
  }, idx + 1, ". ", q.text), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center bg-white/50 p-2 rounded-xl"
  }, [1, 2, 3, 4, 5].map(score => /*#__PURE__*/React.createElement("label", {
    key: score,
    className: "flex flex-col items-center cursor-pointer group flex-1"
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: q.id,
    value: score,
    className: "peer sr-only",
    onChange: () => setSurveyData({
      ...surveyData,
      [q.id]: score
    }),
    checked: surveyData[q.id] === score
  }), /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-full border-2 border-indigo-200 flex items-center justify-center text-sm font-bold text-slate-400 peer-checked:bg-indigo-500 peer-checked:text-white peer-checked:border-indigo-500 transition-all group-hover:border-indigo-400"
  }, score), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 mt-1 opacity-0 peer-checked:opacity-100 transition-opacity font-medium h-3"
  }, score === 1 ? "不同意" : score === 5 ? "同意" : ""))))))), /*#__PURE__*/React.createElement("button", {
    onClick: handleSurveySubmit,
    className: "w-full mt-8 py-3.5 bg-slate-800 hover:bg-black text-white rounded-xl font-bold shadow-lg transition transform active:scale-95"
  }, "\u63D0\u4EA4\u5E76\u7ED3\u675F\u5B9E\u9A8C")), appStage === 'END' && /*#__PURE__*/React.createElement("div", {
    className: "glass-card p-10 text-center shadow-2xl rounded-3xl animate-pop-in"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl font-bold text-emerald-500 mb-2"
  }, "\uD83C\uDF89 \u5B9E\u9A8C\u7ED3\u675F"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 mb-8 font-medium"
  }, "\u6570\u636E\u5DF2\u81EA\u52A8\u5B89\u5168\u4E0A\u4F20\uFF0C\u975E\u5E38\u611F\u8C22\u60A8\u7684\u53C2\u4E0E\u3002"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-400"
  }, "\u60A8\u53EF\u4EE5\u76F4\u63A5\u5173\u95ED\u6B64\u9875\u9762\u3002"))));
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));
