import { apiGet, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface OrderProduct {
  productId: string;
  name: string;
  amount: number;
  quantity: number;
}

export interface Order {
  _id?: string;
  leadId?: string;
  name: string;
  phone_number: string;
  products?: OrderProduct[];
  product?: string;
  amount?: number;
  quantity?: number;
  grandTotal?: number;
  paymentType: 'COD' | 'Prepaid';
  courier?: string;
  assginTo?: string;
  transactionId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

// GET /api/orders
export const fetchOrders = async (params?: FetchParams): Promise<PaginatedResponse<Order>> => {
  const { data } = await apiGet(endPointApi.orders, params);
  return data;
};

// POST /api/orders
export const createOrderApi = async (payload: Order): Promise<Order> => {
  const { data } = await apiPost(endPointApi.orderCreate, payload);
  return data;
};

// PUT /api/orders/:id
export const updateOrderApi = async (id: string, payload: Partial<Order>): Promise<Order> => {
  const { data } = await apiPut(endPointApi.orderUpdate, id, payload);
  return data;
};

// DELETE /api/orders/:id
export const deleteOrderApi = async (id: string): Promise<void> => {
  await apiDelete(endPointApi.orderDelete, id);
};
