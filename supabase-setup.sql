-- 在 Supabase SQL Editor 中执行此脚本
-- https://app.supabase.com → 你的项目 → SQL Editor

-- 1. 食物库表
CREATE TABLE IF NOT EXISTS foods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  protein REAL NOT NULL,
  fat REAL NOT NULL DEFAULT 0,
  carbs REAL NOT NULL DEFAULT 0,
  calories REAL NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'g',
  unit_weight REAL,
  is_builtin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 饮食记录表
CREATE TABLE IF NOT EXISTS meal_records (
  id SERIAL PRIMARY KEY,
  food_id INTEGER REFERENCES foods(id),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  grams REAL NOT NULL,
  protein_grams REAL NOT NULL,
  record_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_records_date ON meal_records(record_date);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);

-- 4. 开放匿名访问（个人使用，无需认证）
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有人读取食物" ON foods FOR SELECT USING (true);
CREATE POLICY "允许所有人添加食物" ON foods FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人读取记录" ON meal_records FOR SELECT USING (true);
CREATE POLICY "允许所有人添加记录" ON meal_records FOR INSERT WITH CHECK (true);
CREATE POLICY "允许所有人删除记录" ON meal_records FOR DELETE USING (true);

-- 5. 导入 36 种内置食物
INSERT INTO foods (id, name, category, protein, fat, carbs, calories, unit, unit_weight, is_builtin) VALUES
(1,  '鸡蛋(煮)',       '蛋奶',  13.1, 8.6,  2.4,  139, '个', 50, true),
(2,  '鸡蛋白',         '蛋奶',  11.6, 0.1,  3.1,  60,  '个', 30, true),
(3,  '牛奶(全脂)',     '蛋奶',  3.3,  3.6,  4.9,  65,  'ml', NULL, true),
(4,  '酸奶(原味)',     '蛋奶',  2.8,  2.6,  12.9, 86,  'ml', NULL, true),
(5,  '鸡胸肉',         '肉类',  24.6, 1.9,  0.6,  118, 'g', NULL, true),
(6,  '鸡腿肉(去皮)',   '肉类',  20.2, 7.2,  0,    146, 'g', NULL, true),
(7,  '牛肉(瘦)',       '肉类',  21.3, 2.5,  1.3,  113, 'g', NULL, true),
(8,  '牛腱子',         '肉类',  23.0, 3.3,  0,    122, 'g', NULL, true),
(9,  '猪里脊',         '肉类',  19.6, 7.9,  0,    150, 'g', NULL, true),
(10, '猪瘦肉',         '肉类',  20.3, 6.2,  1.5,  143, 'g', NULL, true),
(11, '瘦羊肉',         '肉类',  20.5, 3.9,  0.2,  118, 'g', NULL, true),
(12, '鸭胸肉',         '肉类',  15.0, 1.5,  4.0,  90,  'g', NULL, true),
(13, '三文鱼',         '水产',  17.2, 7.8,  0,    139, 'g', NULL, true),
(14, '虾仁',           '水产',  18.6, 0.8,  0.2,  85,  'g', NULL, true),
(15, '金枪鱼(水浸)',   '水产',  23.5, 0.6,  0,    99,  'g', NULL, true),
(16, '鸡胗',           '肉类',  19.2, 2.8,  4.0,  118, 'g', NULL, true),
(17, '豆浆',           '豆制品',3.0,  1.6,  1.2,  31,  'ml', NULL, true),
(18, '豆腐(北)',       '豆制品',9.2,  8.1,  3.0,  116, 'g', NULL, true),
(19, '豆腐干',         '豆制品',14.9, 11.3, 9.6,  197, 'g', NULL, true),
(20, '豆腐皮',         '豆制品',51.6, 23.0, 12.5, 447, 'g', NULL, true),
(21, '腐竹',           '豆制品',44.6, 21.7, 22.3, 461, 'g', NULL, true),
(22, '毛豆(煮)',       '豆制品',13.1, 5.0,  10.5, 131, 'g', NULL, true),
(23, '米饭(蒸)',       '主食',  2.6,  0.3,  25.9, 116, 'g', NULL, true),
(24, '面条(煮)',       '主食',  8.9,  0.6,  65.6, 301, 'g', NULL, true),
(25, '馒头',           '主食',  7.0,  1.1,  45.0, 221, 'g', NULL, true),
(26, '全麦面包',       '主食',  9.1,  2.5,  43.0, 234, 'g', NULL, true),
(27, '燕麦片',         '主食',  13.5, 6.7,  61.6, 367, 'g', NULL, true),
(28, '红薯',           '主食',  0.7,  0.2,  15.3, 61,  'g', NULL, true),
(29, '土豆',           '主食',  2.6,  0.2,  17.8, 81,  'g', NULL, true),
(30, '西兰花',         '蔬菜',  3.5,  0.6,  3.7,  27,  'g', NULL, true),
(31, '菠菜',           '蔬菜',  2.6,  0.3,  4.5,  28,  'g', NULL, true),
(32, '番茄',           '蔬菜',  0.9,  0.2,  3.3,  15,  'g', NULL, true),
(33, '核桃仁',         '坚果',  14.9, 58.8, 19.1, 646, 'g', NULL, true),
(34, '花生(炒)',       '坚果',  21.7, 48.0, 23.8, 601, 'g', NULL, true),
(35, '乳清蛋白粉',     '补剂',  80.0, 3.0,  8.0,  380, 'g', NULL, true),
(36, '火山石烤肠',     '肉类',  13.0, 20.0, 7.0,  260, '根', 55, true);
