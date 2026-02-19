export interface InventoryResponse {
  id: number;
  warehouseId: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  reorderThreshold: number;
}
