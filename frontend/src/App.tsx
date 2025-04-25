import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchItems, 
  updateSelection, 
  updateOrder 
} from './api';

interface Item {
  id: number;
  name: string;
  selected: boolean;
}

const App = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Загрузка данных
  const loadItems = useCallback(async (pageToLoad = 1, search = '') => {
    setIsLoading(true);
    try {
      const { items: fetchedItems, total } = await fetchItems(pageToLoad, search);
      console.log(await fetchItems(pageToLoad, search));
      if (pageToLoad === 1) {
        setItems(fetchedItems);
        setTotalItems(total);
      } else {
        setItems(prev => [...prev, ...fetchedItems]);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Первоначальная загрузка
  useEffect(() => {
    loadItems();
    console.log(items, totalItems);
  }, [loadItems]);

  // Поиск
  useEffect(() => {
    setPage(1);
    loadItems(1, searchTerm);
  }, [searchTerm, loadItems]);

  // Обработчик скролла для подгрузки
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoading || items.length >= totalItems) return;
    
    const { scrollTop, clientHeight, scrollHeight } = listRef.current;
    if (scrollHeight - (scrollTop + clientHeight) < 50) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadItems(nextPage, searchTerm);
    }
  }, [isLoading, items.length, totalItems, page, searchTerm, loadItems]);

  // Выбор элемента
  const toggleSelect = async (id: number) => {
    const newSelectedItems = new Set(selectedItems);
    const isSelected = !newSelectedItems.has(id);
    
    if (isSelected) {
      newSelectedItems.add(id);
    } else {
      newSelectedItems.delete(id);
    }
    
    setSelectedItems(newSelectedItems);
    
    try {
      await updateSelection(id, isSelected);
    } catch (error) {
      console.error('Error updating selection:', error);
      // Откатываем изменения в случае ошибки
      setSelectedItems(new Set(selectedItems));
    }
  };

  // Drag & Drop функции
  const handleDragStart = (id: number) => {
    setDragItem(id);
  };

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    setDragOverItem(id);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem === null || dragOverItem === null || dragItem === dragOverItem) {
      setDragItem(null);
      setDragOverItem(null);
      return;
    }

    const dragIndex = items.findIndex(item => item.id === dragItem);
    const dragOverIndex = items.findIndex(item => item.id === dragOverItem);
    
    if (dragIndex === -1 || dragOverIndex === -1) return;

    // Сохраняем текущие items для возможного отката
    const oldItems = [...items];
    
    // Создаем новый массив с измененным порядком
    const newItems = [...items];
    const [movedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dragOverIndex, 0, movedItem);
    
    // Оптимистичное обновление UI
    setItems(newItems);
    setDragItem(null);
    setDragOverItem(null);

    try {
      await updateOrder(newItems.map(item => item.id));
    } catch (error) {
      console.error('Error updating order:', error);
      // Откатываем изменения в случае ошибки
      setItems(oldItems);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h1 style={{ textAlign: 'center' }}>Item List (1 - 1,000,000)</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
      </div>
      
      <div 
        ref={listRef}
        style={{ 
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
        onScroll={handleScroll}
      >
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDrop={handleDrop}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid #eee',
              backgroundColor: selectedItems.has(item.id) 
                ? '#e6f7ff' 
                : dragOverItem === item.id 
                  ? '#f5f5f5' 
                  : 'white',
              cursor: 'grab',
              transition: 'background-color 0.2s',
              userSelect: 'none'
            }}
          >
            <input
              type="checkbox"
              checked={selectedItems.has(item.id)}
              onChange={() => toggleSelect(item.id)}
              style={{ 
                marginRight: '12px',
                cursor: 'pointer'
              }}
            />
            <span style={{ flex: 1 }}>{item.name}</span>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ 
            padding: '16px', 
            textAlign: 'center',
            color: '#666'
          }}>
            Loading more items...
          </div>
        )}
      </div>
      
      <div style={{ 
        marginTop: '12px',
        padding: '8px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        Showing {items.length} of {totalItems} items | Selected: {selectedItems.size}
      </div>
    </div>
  );
};

export default App;