// 内置中式常见食物营养数据 (固体每 100g，液体每 100ml)
// 数据来源：《中国食物成分表标准版（第6版）》—— 中国疾病预防控制中心营养与健康所 编著
// — 标注的为官方数据库中未收录的加工食品，沿用通用营养参考值
const foods = [
  // --- 蛋奶 ---
  { id: 1,  name: '鸡蛋(煮)',       category: '蛋奶',   protein: 13.1, fat: 8.6,  carbs: 2.4,  calories: 139, is_builtin: 1, unit: '个', unit_weight: 50 }, // 鸡蛋（代表值），可食部约50g/个
  { id: 2,  name: '鸡蛋白',         category: '蛋奶',   protein: 11.6, fat: 0.1,  carbs: 3.1,  calories: 60,  is_builtin: 1, unit: '个', unit_weight: 30 }, // 鸡蛋白，约30g/个
  { id: 3,  name: '牛奶(全脂)',     category: '蛋奶',   protein: 3.3,  fat: 3.6,  carbs: 4.9,  calories: 65,  is_builtin: 1, unit: 'ml' }, // 纯牛奶（代表值，全脂）
  { id: 4,  name: '酸奶(原味)',     category: '蛋奶',   protein: 2.8,  fat: 2.6,  carbs: 12.9, calories: 86,  is_builtin: 1, unit: 'ml' }, // 酸奶（代表值，全脂）

  // --- 肉类 ---
  { id: 5,  name: '鸡胸肉',         category: '肉类',   protein: 24.6, fat: 1.9,  carbs: 0.6,  calories: 118, is_builtin: 1 },       // 鸡胸脯肉
  { id: 6,  name: '鸡腿肉(去皮)',   category: '肉类',   protein: 20.2, fat: 7.2,  carbs: 0,    calories: 146, is_builtin: 1 },       // 鸡腿
  { id: 7,  name: '牛肉(瘦)',       category: '肉类',   protein: 21.3, fat: 2.5,  carbs: 1.3,  calories: 113, is_builtin: 1 },       // 牛肉（代表值，瘦）
  { id: 8,  name: '牛腱子',         category: '肉类',   protein: 23.0, fat: 3.3,  carbs: 0,    calories: 122, is_builtin: 1 },       // 牛肉（小腿肉）[牛腱子]
  { id: 9,  name: '猪里脊',         category: '肉类',   protein: 19.6, fat: 7.9,  carbs: 0,    calories: 150, is_builtin: 1 },       // 猪肉（里脊）
  { id: 10, name: '猪瘦肉',         category: '肉类',   protein: 20.3, fat: 6.2,  carbs: 1.5,  calories: 143, is_builtin: 1 },       // 猪肉（瘦）
  { id: 11, name: '瘦羊肉',         category: '肉类',   protein: 20.5, fat: 3.9,  carbs: 0.2,  calories: 118, is_builtin: 1 },       // 羊肉（fat 4g）
  { id: 12, name: '鸭胸肉',         category: '肉类',   protein: 15.0, fat: 1.5,  carbs: 4.0,  calories: 90,  is_builtin: 1 },       // 鸭胸脯肉

  // --- 水产 ---
  { id: 13, name: '三文鱼',         category: '水产',   protein: 17.2, fat: 7.8,  carbs: 0,    calories: 139, is_builtin: 1 },       // 鲑鱼[三文鱼]
  { id: 14, name: '虾仁',           category: '水产',   protein: 18.6, fat: 0.8,  carbs: 0.2,  calories: 85,  is_builtin: 1 },       // — 通用参考值
  { id: 15, name: '金枪鱼(水浸)',   category: '水产',   protein: 23.5, fat: 0.6,  carbs: 0,    calories: 99,  is_builtin: 1 },       // 金枪鱼（盐水浸）
  { id: 16, name: '鸡胗',           category: '肉类',   protein: 19.2, fat: 2.8,  carbs: 4.0,  calories: 118, is_builtin: 1 },       // 鸡肫[鸡胗]

  // --- 豆制品 ---
  { id: 17, name: '豆浆',           category: '豆制品', protein: 3.0,  fat: 1.6,  carbs: 1.2,  calories: 31,  is_builtin: 1, unit: 'ml' }, // 豆浆
  { id: 18, name: '豆腐(北)',       category: '豆制品', protein: 9.2,  fat: 8.1,  carbs: 3.0,  calories: 116, is_builtin: 1 },       // 豆腐（北豆腐）
  { id: 19, name: '豆腐干',         category: '豆制品', protein: 14.9, fat: 11.3, carbs: 9.6,  calories: 197, is_builtin: 1 },       // 豆腐干（代表值）
  { id: 20, name: '豆腐皮',         category: '豆制品', protein: 51.6, fat: 23.0, carbs: 12.5, calories: 447, is_builtin: 1 },       // 豆腐皮
  { id: 21, name: '腐竹',           category: '豆制品', protein: 44.6, fat: 21.7, carbs: 22.3, calories: 461, is_builtin: 1 },       // 腐竹
  { id: 22, name: '毛豆(煮)',       category: '豆制品', protein: 13.1, fat: 5.0,  carbs: 10.5, calories: 131, is_builtin: 1 },       // 毛豆（鲜）

  // --- 主食 ---
  { id: 23, name: '米饭(蒸)',       category: '主食',   protein: 2.6,  fat: 0.3,  carbs: 25.9, calories: 116, is_builtin: 1 },       // 米饭（蒸，代表值）
  { id: 24, name: '面条(煮)',       category: '主食',   protein: 8.9,  fat: 0.6,  carbs: 65.6, calories: 301, is_builtin: 1 },       // 面条（生，代表值）
  { id: 25, name: '馒头',           category: '主食',   protein: 7.0,  fat: 1.1,  carbs: 45.0, calories: 221, is_builtin: 1 },       // — 通用参考值
  { id: 26, name: '全麦面包',       category: '主食',   protein: 9.1,  fat: 2.5,  carbs: 43.0, calories: 234, is_builtin: 1 },       // — 通用参考值
  { id: 27, name: '燕麦片',         category: '主食',   protein: 13.5, fat: 6.7,  carbs: 61.6, calories: 367, is_builtin: 1 },       // — 通用参考值
  { id: 28, name: '红薯',           category: '主食',   protein: 0.7,  fat: 0.2,  carbs: 15.3, calories: 61,  is_builtin: 1 },       // 甘薯（红心）[红薯]
  { id: 29, name: '土豆',           category: '主食',   protein: 2.6,  fat: 0.2,  carbs: 17.8, calories: 81,  is_builtin: 1 },       // 马铃薯[土豆]

  // --- 蔬菜 ---
  { id: 30, name: '西兰花',         category: '蔬菜',   protein: 3.5,  fat: 0.6,  carbs: 3.7,  calories: 27,  is_builtin: 1 },       // 西兰花[绿菜花]
  { id: 31, name: '菠菜',           category: '蔬菜',   protein: 2.6,  fat: 0.3,  carbs: 4.5,  calories: 28,  is_builtin: 1 },       // 菠菜（鲜）[赤根菜]
  { id: 32, name: '番茄',           category: '蔬菜',   protein: 0.9,  fat: 0.2,  carbs: 3.3,  calories: 15,  is_builtin: 1 },       // 番茄[西红柿]

  // --- 坚果 ---
  { id: 33, name: '核桃仁',         category: '坚果',   protein: 14.9, fat: 58.8, carbs: 19.1, calories: 646, is_builtin: 1 },       // 核桃（干）[胡桃]
  { id: 34, name: '花生(炒)',       category: '坚果',   protein: 21.7, fat: 48.0, carbs: 23.8, calories: 601, is_builtin: 1 },       // 花生（炒）

  // --- 补剂 ---
  { id: 35, name: '乳清蛋白粉',     category: '补剂',   protein: 80.0, fat: 3.0,  carbs: 8.0,  calories: 380, is_builtin: 1 },       // — 通用参考值
];

module.exports = { foods };
