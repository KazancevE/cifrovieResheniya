const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Имитация базы данных
let items = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  selected: false
}));

// Состояние сортировки
let customOrder = [...items.map(item => item.id)];

// Получение элементов с пагинацией
app.get('/api/items', (req, res) => {
  // Явно преобразуем параметры в числа
  const page = Number(req.query.page) || 1; // По умолчанию 1
  const limit = Number(req.query.limit) || 20; // По умолчанию 20
  const offset = (page - 1) * limit;

  // Фильтрация (если есть поиск)
  let filteredItems = items;
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(search)
    );
  }

  // Пагинация с преобразованием offset и limit в числа
  const paginatedItems = filteredItems.slice(offset, offset + limit);

  // Сортировка только текущей страницы
  const orderMap = new Map();
  customOrder.forEach((id, index) => orderMap.set(id, index));

  const sortedPageItems = [...paginatedItems].sort(
    (a, b) => orderMap.get(a.id) - orderMap.get(b.id)
  );

  res.json({
    items: sortedPageItems,
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