const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const FOODS_FILE = path.join(DATA_DIR, 'foods.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --- Generic JSON store helpers ---

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Foods ---

function getFoods({ search, category } = {}) {
  let foods = readJSON(FOODS_FILE);
  if (search) {
    const kw = search.toLowerCase();
    foods = foods.filter(f => f.name.toLowerCase().includes(kw));
  }
  if (category) {
    foods = foods.filter(f => f.category === category);
  }
  return foods.slice(0, 50);
}

function getFoodById(id) {
  const foods = readJSON(FOODS_FILE);
  return foods.find(f => f.id === id) || null;
}

function addFood({ name, category, protein, fat, carbs, calories, unit, unit_weight }) {
  const foods = readJSON(FOODS_FILE);
  const maxId = foods.length > 0 ? Math.max(...foods.map(f => f.id)) : 0;
  const food = {
    id: maxId + 1,
    name,
    category: category || '其他',
    protein: protein || 0,
    fat: fat || 0,
    carbs: carbs || 0,
    calories: calories || 0,
    is_builtin: 0,
  };
  if (unit) food.unit = unit;
  if (unit_weight) food.unit_weight = unit_weight;
  foods.push(food);
  writeJSON(FOODS_FILE, foods);
  return food;
}

function getCategories() {
  const foods = readJSON(FOODS_FILE);
  return [...new Set(foods.map(f => f.category))];
}

function getFoodCount() {
  return readJSON(FOODS_FILE).length;
}

function bulkInsertFoods(items) {
  writeJSON(FOODS_FILE, items);
}

// --- Records ---

function getRecords(date) {
  const records = readJSON(RECORDS_FILE);
  return records
    .filter(r => r.record_date === date)
    .map(r => {
      const food = getFoodById(r.food_id);
      return {
        ...r,
        food_name: food ? food.name : '(已删除)',
        food_protein_per_100g: food ? food.protein : 0,
        food_category: food ? food.category : '',
      };
    })
    .sort((a, b) => {
      const order = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
      const cmp = (order[a.meal_type] || 5) - (order[b.meal_type] || 5);
      if (cmp !== 0) return cmp;
      return a.created_at.localeCompare(b.created_at);
    });
}

function addRecord({ food_id, meal_type, grams, record_date }) {
  const food = getFoodById(food_id);
  if (!food) throw new Error('食物不存在');
  const effective_grams = food.unit_weight ? grams * food.unit_weight : grams;
  const protein_grams = Math.round(food.protein * effective_grams) / 100;
  const records = readJSON(RECORDS_FILE);
  const maxId = records.length > 0 ? Math.max(...records.map(r => r.id)) : 0;
  const record = {
    id: maxId + 1,
    food_id,
    meal_type,
    grams,
    protein_grams,
    record_date,
    created_at: new Date().toISOString(),
  };
  records.push(record);
  writeJSON(RECORDS_FILE, records);
  return record;
}

function deleteRecord(id) {
  let records = readJSON(RECORDS_FILE);
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return false;
  records.splice(idx, 1);
  writeJSON(RECORDS_FILE, records);
  return true;
}

function getSummary(date) {
  const records = readJSON(RECORDS_FILE).filter(r => r.record_date === date);
  const byMeal = {};
  for (const r of records) {
    if (!byMeal[r.meal_type]) {
      byMeal[r.meal_type] = { count: 0, total_protein: 0, total_grams: 0 };
    }
    byMeal[r.meal_type].count++;
    byMeal[r.meal_type].total_protein += r.protein_grams;
    byMeal[r.meal_type].total_grams += r.grams;
  }
  // Round values
  for (const key of Object.keys(byMeal)) {
    byMeal[key].total_protein = Math.round(byMeal[key].total_protein * 10) / 10;
    byMeal[key].total_grams = Math.round(byMeal[key].total_grams * 10) / 10;
  }
  const total_protein = records.reduce((sum, r) => sum + r.protein_grams, 0);
  return {
    date,
    byMeal,
    total_protein: Math.round(total_protein * 10) / 10,
  };
}

module.exports = {
  getFoods,
  getFoodById,
  addFood,
  getCategories,
  getFoodCount,
  bulkInsertFoods,
  getRecords,
  addRecord,
  deleteRecord,
  getSummary,
};
