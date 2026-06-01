import { apiGet, apiGetById, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface ReturnOrderType {
  _id: string;
  name: string;
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

export type CreateReturnOrderTypePayload = { name: string };
export type UpdateReturnOrderTypePayload = Partial<CreateReturnOrderTypePayload>;

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

// GET /api/return-order-types?page=&limit=&search=
export const fetchReturnOrderTypes = async (params?: FetchParams): Promise<PaginatedResponse<ReturnOrderType>> => {
  const { data } = await apiGet(endPointApi.returnOrderTypes, params);
  return data;
};

// GET /api/return-order-types/:id
export const fetchReturnOrderType = async (id: string): Promise<ReturnOrderType> => {
  const { data } = await apiGetById(endPointApi.returnOrderTypes, id);
  return data;
};

// POST /api/return-order-types
export const createReturnOrderType = async (payload: CreateReturnOrderTypePayload): Promise<ReturnOrderType> => {
  const { data } = await apiPost(endPointApi.returnOrderTypeCreate, payload);
  return data;
};

// PUT /api/return-order-types/:id
export const updateReturnOrderType = async (id: string, payload: UpdateReturnOrderTypePayload): Promise<ReturnOrderType> => {
  const { data } = await apiPut(endPointApi.returnOrderTypeUpdate, id, payload);
  return data;
};

// DELETE /api/return-order-types/:id
export const deleteReturnOrderType = async (id: string): Promise<void> => {
  await apiDelete(endPointApi.returnOrderTypeDelete, id);
};

// GET /api/return-order-types/export?search=
export const exportReturnOrderTypes = async (search?: string): Promise<ReturnOrderType[]> => {
  const { data } = await apiGet(endPointApi.returnOrderTypeExport, search ? { search } : undefined);
  return data;
};
