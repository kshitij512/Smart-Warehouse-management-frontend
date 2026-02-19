export type OrderStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'PICKING'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemResponse {
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  customerName: string;
  totalAmount: number;
  warehouseId: number;
  assignedStaffName?: string;
  createdAt: string;
  items: OrderItemResponse[];
}
