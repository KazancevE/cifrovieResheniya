export interface Item {
    id: number;
    name: string;
    selected: boolean;
  }
  
  export interface ItemsResponse {
    items: Item[];
    total: number;
  }
  
  export interface OrderResponse {
    order: number[];
  }