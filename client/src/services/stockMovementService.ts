import { apiRequest } from './apiClient';

export type MovementType =
  | 'RECEIVED'
  | 'SOLD'
  | 'DISPOSED';

export interface StockMovementResponse {
  id: number;
  batchId: number;
  type: MovementType;
  quantity: number;
  createdAt: string;
  note: string | null;
}

export const stockMovementService = {
  async record(
    batchId: string,
    type: MovementType,
    quantity: number,
    note: string
  ): Promise<StockMovementResponse> {

    const id = Number(batchId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error('Invalid batch ID');
    }

    if (!Number.isInteger(quantity) ||
        quantity <= 0 ||
        quantity > 2147483647) {
      throw new Error('Enter a valid positive quantity');
    }

    return apiRequest<StockMovementResponse>(
      '/stock-movements',
      {
        method: 'POST',
        body: JSON.stringify({
          batchId: id,
          type,
          quantity,
          note: note.trim()
        })
      }
    );
  },

  async getHistory(
    batchId: string
  ): Promise<StockMovementResponse[]> {

    const id = Number(batchId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error('Invalid batch ID');
    }

    return apiRequest<StockMovementResponse[]>(
      `/stock-movements?batchId=${id}`
    );
  }
};