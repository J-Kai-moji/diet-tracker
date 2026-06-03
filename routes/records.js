const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/records?date=YYYY-MM-DD
router.get('/', (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'date 参数必填' });
  }
  const records = db.getRecords(date);
  res.json(records);
});

// POST /api/records
router.post('/', (req, res) => {
  const { food_id, meal_type, grams, record_date } = req.body;
  if (!food_id || !meal_type || !grams || grams <= 0 || !record_date) {
    return res.status(400).json({ error: '参数不完整或无效' });
  }
  if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal_type)) {
    return res.status(400).json({ error: '餐次类型无效' });
  }
  try {
    const record = db.addRecord({ food_id, meal_type, grams, record_date });
    // Return with food name joined
    const food = db.getFoodById(food_id);
    res.status(201).json({ ...record, food_name: food ? food.name : '' });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// GET /api/records/summary?date=YYYY-MM-DD
router.get('/summary', (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'date 参数必填' });
  }
  const summary = db.getSummary(date);
  res.json(summary);
});

// DELETE /api/records/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const ok = db.deleteRecord(id);
  if (!ok) {
    return res.status(404).json({ error: '记录不存在' });
  }
  res.json({ success: true });
});

module.exports = router;
