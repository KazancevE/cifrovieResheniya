const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Имитация базы данных
let items = Array.from({ length: 1000000 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  selected: false
}));

// Состояние сортировки
let customOrder = [...items.map(item => item.id)];

// Получение элементов с пагинацией
app.get('/api/items', (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;

  let filteredItems = [...items];
  
  if (search) {
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Применяем кастомный порядок
  const orderedItems = [...filteredItems].sort((a, b) => {
    return customOrder.indexOf(a.id) - customOrder.indexOf(b.id);
  });

  const paginatedItems = orderedItems.slice(offset, offset + limit);
  
  res.json({
    items: paginatedItems,
    total: filteredItems.length
  });
});

// Обновление выбранного состояния
app.post('/api/items/select', (req, res) => {
  const { id, selected } = req.body;
  const item = items.find(item => item.id === id);
  if (item) {
    item.selected = selected;
  }
  res.json({ success: true });
});

// Обновление порядка
app.post('/api/items/order', (req, res) => {
  customOrder = req.body.order;
  res.json({ success: true });
});

// Получение текущего порядка
app.get('/api/items/order', (req, res) => {
  res.json({ order: customOrder });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});