export interface WarehouseResponse {
  id: number;
  name: string;
  location: string;
  code: string;
  capacity: number;
  managerName: string;
}

export interface CreateWarehouseRequest {
  name: string;
  location: string;
  capacity: number;
  code: string;
  managerId: number;
}
