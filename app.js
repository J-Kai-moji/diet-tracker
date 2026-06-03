// --- Supabase 配置 ---
// 在 Supabase 项目设置 → API 中获取以下两个值
const SUPABASE_URL = 'https://yaqaxiqtiulfxfpfmxqn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E31ZWwgv6HCiCiR3-46pgw_N9Rw1vdO';

// --- State ---
let currentDate = formatDate(new Date());
let selectedFood = null;
let selectedMeal = 'lunch';
let selectedCategory = '';
let proteinGoal = parseInt(localStorage.getItem('proteinGoal') || '120', 10);

// --- Helpers ---
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function api(path, options = {}) {
  const url = SUPABASE_URL + '/rest/v1' + path;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// --- DOM refs ---
const $datePicker = document.getElementById('date-picker');
const $goalInput = document.getElementById('protein-goal');
const $foodSearch = document.getElementById('food-search');
const $categoryFilters = document.getElementById('category-filters');
const $foodGrid = document.getElementById('food-grid');
const $gramsInput = document.getElementById('grams-input');
const $unitLabel = document.getElementById('unit-label');
const $foodInfo = document.getElementById('food-info');
const $foodInfoName = document.getElementById('food-info-name');
const $foodInfoProtein = document.getElementById('food-info-protein');
const $foodInfoUnit = document.getElementById('food-info-unit');
const $proteinPreview = document.getElementById('protein-preview');
const $previewVal = document.getElementById('preview-val');
const $btnAdd = document.getElementById('btn-add');
const $recordsContainer = document.getElementById('records-container');
const $progressBar = document.getElementById('progress-bar');
const $progressText = document.getElementById('progress-text');
const $progressPct = document.getElementById('progress-pct');

// --- Init ---
$datePicker.value = currentDate;
$goalInput.value = proteinGoal;

$datePicker.addEventListener('change', () => {
  currentDate = $datePicker.value;
  loadPage();
});

$goalInput.addEventListener('change', () => {
  proteinGoal = parseInt($goalInput.value, 10) || 120;
  localStorage.setItem('proteinGoal', proteinGoal);
  loadPage();
});

// --- Food search ---
let searchTimer = null;

$foodSearch.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadFoodGrid(), 250);
});

// --- Load food grid ---
function showFoodGrid() { $foodGrid.classList.add('visible'); }
function hideFoodGrid() { $foodGrid.classList.remove('visible'); }

async function loadFoodGrid() {
  const kw = $foodSearch.value.trim();
  let query = 'select=*';
  if (kw) query += '&name=ilike.*' + encodeURIComponent(kw) + '*';
  if (selectedCategory) query += '&category=eq.' + encodeURIComponent(selectedCategory);
  query += '&limit=50';
  const foods = await api(`/foods?${query}`);
  renderFoodGrid(foods);
}

function renderFoodGrid(foods) {
  showFoodGrid();

  if (foods.length === 0) {
    $foodGrid.innerHTML = '<div class="food-grid-empty">未找到匹配食物</div>';
    return;
  }

  $foodGrid.innerHTML = foods.map(f => {
    const unit = f.unit || 'g';
    const selClass = (selectedFood && selectedFood.id === f.id) ? ' selected' : '';
    const uw = f.unit_weight ? ` data-unit-weight="${f.unit_weight}"` : '';
    const label = f.unit_weight ? `${f.protein}g / 100g (≈${(f.protein * f.unit_weight / 100).toFixed(1)}g/${f.unit})` : `${f.protein}g / 100${unit}`;
    return `<div class="food-card${selClass}" data-id="${f.id}" data-name="${f.name}" data-protein="${f.protein}" data-unit="${unit}"${uw}>
      <div class="food-card-name">${f.name}</div>
      <div class="food-card-cat">${f.category}</div>
      <div class="food-card-protein">${label}</div>
    </div>`;
  }).join('');

  $foodGrid.querySelectorAll('.food-card').forEach(card => {
    card.addEventListener('click', () => {
      const obj = {
        id: parseInt(card.dataset.id),
        name: card.dataset.name,
        protein: parseFloat(card.dataset.protein),
        unit: card.dataset.unit || 'g',
      };
      if (card.dataset.unitWeight) obj.unit_weight = parseFloat(card.dataset.unitWeight);
      selectFood(obj);
    });
  });
}

function selectFood(food) {
  if (selectedFood && selectedFood.id === food.id) {
    selectedFood = null;
    $foodInfo.style.display = 'none';
    $foodGrid.querySelectorAll('.food-card').forEach(c => c.classList.remove('selected'));
    return;
  }

  selectedFood = food;
  $foodSearch.value = food.name;

  $foodGrid.querySelectorAll('.food-card').forEach(c => {
    c.classList.toggle('selected', parseInt(c.dataset.id) === food.id);
  });

  const unit = food.unit || 'g';
  $foodInfoName.textContent = food.name;
  $foodInfoProtein.textContent = food.protein;
  $foodInfoUnit.textContent = food.unit_weight ? `g (≈${(food.protein * food.unit_weight / 100).toFixed(1)}g/${unit})` : unit;
  $foodInfo.style.display = 'flex';

  $unitLabel.textContent = unit;
  if (unit === 'ml') {
    $gramsInput.placeholder = '毫升';
  } else if (unit === 'g' || !unit) {
    $gramsInput.placeholder = '克数';
  } else {
    $gramsInput.placeholder = unit + '数';
  }

  updateProteinPreview();
}

// --- Category filters ---
async function loadCategories() {
  const rows = await api('/foods?select=category');
  const cats = [...new Set(rows.map(r => r.category))];
  const all = ['', ...cats];
  const labels = { '': '全部', '蛋奶': '蛋奶', '肉类': '肉类', '水产': '水产', '豆制品': '豆制品', '主食': '主食', '蔬菜': '蔬菜', '坚果': '坚果', '补剂': '补剂' };
  $categoryFilters.innerHTML = all.map(c =>
    `<button class="cat-btn${c === selectedCategory ? ' active' : ''}" data-cat="${c}">${labels[c] || c}</button>`
  ).join('');

  $categoryFilters.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      $categoryFilters.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (cat === selectedCategory && $foodGrid.classList.contains('visible')) {
        selectedCategory = '';
        hideFoodGrid();
        $categoryFilters.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        const allBtn = $categoryFilters.querySelector('[data-cat=""]');
        if (allBtn) allBtn.classList.add('active');
        return;
      }
      if (cat === '') {
        selectedCategory = '';
        $foodSearch.value = '';
        loadFoodGrid();
        return;
      }
      selectedCategory = cat;
      $foodSearch.value = '';
      loadFoodGrid();
    });
  });
}

// --- Grams & preview ---
$gramsInput.addEventListener('input', updateProteinPreview);

function updateProteinPreview() {
  const grams = parseFloat($gramsInput.value);
  if (selectedFood && grams > 0) {
    const effective = selectedFood.unit_weight ? grams * selectedFood.unit_weight : grams;
    const protein = (selectedFood.protein * effective / 100).toFixed(1);
    $previewVal.textContent = protein;
    $proteinPreview.style.display = 'block';
  } else {
    $proteinPreview.style.display = 'none';
  }
}

// --- Meal slider ---
const $mealSlider = document.getElementById('meal-slider');
const $mealIndicator = document.getElementById('meal-indicator');
const $mealBtns = document.querySelectorAll('.meal-slider-btn');
const MEAL_KEYS = [...$mealBtns].map(b => b.dataset.meal);

function getMealBtn(meal) {
  return document.querySelector(`.meal-slider-btn[data-meal="${meal}"]`);
}

function setIndicator(meal, animate) {
  const btn = getMealBtn(meal);
  if (!btn) return;
  $mealIndicator.style.transition = animate ? '' : 'none';
  $mealIndicator.style.left = btn.offsetLeft + 'px';
  $mealIndicator.style.width = btn.offsetWidth + 'px';
}

function updateMealActive(meal) {
  $mealBtns.forEach(b => b.classList.toggle('active', b.dataset.meal === meal));
}

function selectMeal(meal) {
  selectedMeal = meal;
  updateMealActive(meal);
  setIndicator(meal, true);
}

$mealSlider.addEventListener('click', (e) => {
  if (dragging) return;
  const btn = e.target.closest('.meal-slider-btn');
  if (!btn) return;
  selectMeal(btn.dataset.meal);
});

let dragging = false;
let dragStartX = 0;
let dragStartIdx = 1;

function getEventX(e) {
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function onDragStart(e) {
  dragging = true;
  dragStartX = getEventX(e);
  dragStartIdx = MEAL_KEYS.indexOf(selectedMeal);
  $mealIndicator.style.transition = 'none';
}

function onDragMove(e) {
  if (!dragging) return;
  e.preventDefault();
  const dx = getEventX(e) - dragStartX;
  const btnWidth = $mealSlider.offsetWidth / MEAL_KEYS.length;
  const idxFloat = dragStartIdx + dx / btnWidth;
  const clamped = Math.max(0, Math.min(MEAL_KEYS.length - 1, idxFloat));

  const floor = Math.floor(clamped);
  const ceil = Math.min(MEAL_KEYS.length - 1, Math.ceil(clamped));
  const frac = clamped - floor;

  const fromBtn = getMealBtn(MEAL_KEYS[floor]);
  const toBtn = getMealBtn(MEAL_KEYS[ceil]);
  if (fromBtn && toBtn) {
    $mealIndicator.style.left = (fromBtn.offsetLeft + (toBtn.offsetLeft - fromBtn.offsetLeft) * frac) + 'px';
    $mealIndicator.style.width = (fromBtn.offsetWidth + (toBtn.offsetWidth - fromBtn.offsetWidth) * frac) + 'px';
  }

  const nearestIdx = Math.round(clamped);
  if (nearestIdx !== MEAL_KEYS.indexOf(selectedMeal)) {
    selectedMeal = MEAL_KEYS[nearestIdx];
    updateMealActive(selectedMeal);
  }
}

function onDragEnd() {
  if (!dragging) return;
  dragging = false;
  selectMeal(selectedMeal);
}

$mealSlider.addEventListener('mousedown', onDragStart);
$mealSlider.addEventListener('touchstart', onDragStart, { passive: true });
document.addEventListener('mousemove', onDragMove);
document.addEventListener('touchmove', onDragMove, { passive: false });
document.addEventListener('mouseup', onDragEnd);
document.addEventListener('touchend', onDragEnd);

setIndicator(selectedMeal, false);
window.addEventListener('resize', () => setIndicator(selectedMeal, false));

// --- Add record ---
$btnAdd.addEventListener('click', async () => {
  if (!selectedFood) { alert('请先选择一种食物'); return; }
  const grams = parseFloat($gramsInput.value);
  if (!grams || grams <= 0) { alert('请输入有效的数值'); return; }

  try {
    const food = selectedFood;
    const effective = food.unit_weight ? grams * food.unit_weight : grams;
    const protein_grams = Math.round(food.protein * effective) / 100;

    await api('/meal_records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        food_id: food.id,
        meal_type: selectedMeal,
        grams,
        protein_grams,
        record_date: currentDate,
      }),
    });
    $foodSearch.value = '';
    $gramsInput.value = '';
    $unitLabel.textContent = 'g';
    $gramsInput.placeholder = '克数';
    selectedFood = null;
    selectedCategory = '';
    $foodInfo.style.display = 'none';
    $proteinPreview.style.display = 'none';
    hideFoodGrid();
    $categoryFilters.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    const allBtn = $categoryFilters.querySelector('[data-cat=""]');
    if (allBtn) allBtn.classList.add('active');
    await loadPage();
  } catch (e) {
    alert('添加失败: ' + e.message);
  }
});

// --- Delete record ---
async function deleteRecord(id) {
  if (!confirm('确定删除这条记录吗？')) return;
  try {
    await api(`/meal_records?id=eq.${id}`, { method: 'DELETE' });
    await loadPage();
  } catch (e) {
    alert('删除失败: ' + e.message);
  }
}

// --- Render ---
const MEAL_LABELS = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' };
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

function renderRecords(records) {
  if (!records || records.length === 0) {
    $recordsContainer.innerHTML = '<p class="empty-hint">暂无记录，开始添加吧</p>';
    return;
  }

  const groups = { breakfast: [], lunch: [], dinner: [], snack: [] };
  records.forEach(r => {
    if (groups[r.meal_type]) groups[r.meal_type].push(r);
  });

  let html = '';
  for (const meal of MEAL_ORDER) {
    const items = groups[meal];
    if (!items || items.length === 0) continue;
    const subtotal = items.reduce((s, r) => s + r.protein_grams, 0);
    html += `<div class="meal-group">
      <div class="meal-group-header">
        <span>${MEAL_LABELS[meal]}</span>
        <span class="meal-subtotal">${subtotal.toFixed(1)}g 蛋白质</span>
      </div>`;
    for (const r of items) {
      html += `<div class="record-item">
        <span class="record-food">${r.foods?.name || '(已删除)'}<span class="food-cat">${r.foods?.category || ''}</span></span>
        <span class="record-grams">${r.grams}g</span>
        <span class="record-protein">${r.protein_grams.toFixed(1)}g</span>
        <button class="record-del" onclick="deleteRecord(${r.id})" title="删除">×</button>
      </div>`;
    }
    html += '</div>';
  }
  $recordsContainer.innerHTML = html;
}

function renderProgress(totalProtein) {
  const pct = proteinGoal > 0 ? Math.min(100, Math.round((totalProtein / proteinGoal) * 100)) : 0;
  $progressBar.style.width = pct + '%';
  $progressText.textContent = `${totalProtein.toFixed(1)}g / ${proteinGoal}g`;
  $progressPct.textContent = pct + '%';

  if (pct >= 100) {
    $progressBar.style.background = '#FF9500';
  } else if (pct >= 90) {
    $progressBar.style.background = '#FF9500';
  } else {
    $progressBar.style.background = '#34C759';
  }
}

// --- Load page ---
async function loadPage() {
  try {
    const date = encodeURIComponent(currentDate);
    const records = await api(`/meal_records?select=*,foods(name,category)&record_date=eq.${date}&order=meal_type.asc,created_at.asc`);
    const summaryRows = await api(`/meal_records?select=meal_type,protein_grams,grams&record_date=eq.${date}`);

    const byMeal = {};
    let total = 0;
    for (const r of summaryRows) {
      if (!byMeal[r.meal_type]) byMeal[r.meal_type] = { count: 0, total_protein: 0 };
      byMeal[r.meal_type].count++;
      byMeal[r.meal_type].total_protein += r.protein_grams;
      total += r.protein_grams;
    }
    renderProgress(Math.round(total * 10) / 10);
    renderRecords(records);
  } catch (e) {
    console.error('加载失败:', e);
  }
}

// --- Bootstrap ---
loadCategories();
loadPage();
