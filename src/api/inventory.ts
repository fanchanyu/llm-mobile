/**
 * Inventory API
 */
import api from './client';

export interface StockItem {
  id: number;
  part_no: string;
  part_name: string;
  quantity: number;
  location: string;
  unit: string;
  min_stock?: number;
  max_stock?: number;
}

export const inventoryApi = {
  /** 查詢即時庫存 */
  getStock: (params?: { search?: string; low_stock?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.low_stock) query.set('low_stock', 'true');
    const qs = query.toString();
    return api.get<{ items: StockItem[]; total: number }>(
      `/api/inventory/stock${qs ? `?${qs}` : ''}`,
    );
  },
};
