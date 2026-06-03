const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/foods?search=&category=
router.get('/', (req, res) => {
  const { search, category } = req.query;
  const foods = db.getFoods({ search, category });
  res.json(foods);
});

// GET /api/foods/categories
router.get('/categories', (req, res) => {
  const categories = db.getCategories();
  res.json(categories);
});

// POST /api/foods
router.post('/', (req, res) => {
  const { name, category, protein, fat, carbs, calories, unit, unit_weight } = req.body;
  if (!name) {
    return res.status(400).json({ error: '食物名称不能为空' });
  }
  const food = db.addFood({ name, category, protein, fat, carbs, calories, unit, unit_weight });
  res.status(201).json(food);
});

module.exports = router;
