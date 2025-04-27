import { ItemsResponse } from "./types";

export const fetchItems = async (page: number = 1, search: string = ''): Promise<ItemsResponse> => {
    const response = await fetch(
      `http://83.166.245.137:3001/api/items?page=${page}&limit=20&search=${search}`
    );
    return await response.json();
  };

  export const updateSelection = async (id: number, selected: boolean): Promise<{ success: boolean }> => {
    const response = await fetch('http://83.166.245.137:3001/api/items/select', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, selected }),
    });
    return await response.json();
  };
  
  export const updateOrder = async (order: number[]): Promise<{ success: boolean }> => {
    const response = await fetch('http://83.166.245.137:3001/api/items/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order }),
    });
    return await response.json();
  };