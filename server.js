const express = require('express');
const path = require('path');
const db = require('./database');
const seed = require('./seed');

// Initialize seed data on first run
if (db.getFoodCount() === 0) {
  db.bulkInsertFoods(seed.foods);
  console.log(`已导入 ${seed.foods.length} 种内置食物数据`);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/foods', require('./routes/foods'));
app.use('/api/records', require('./routes/records'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`饮食记录服务已启动 → http://localhost:${PORT}`);
  console.log(`局域网访问 → http://192.168.1.3:${PORT}`);
});
