import { apiGet, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface Lead {
  _id?: string;
  name: string;
  phone_number: string;
  product?: string;
  amount?: number;
  quantity?: number;
  assgin?: string;
  status?: string;
  reason_call?: string;
  note?: string;
  reminder?: string;
  orderStatus?: boolean;
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

// GET /api/leads
export const fetchLeads = async (params?: FetchParams): Promise<PaginatedResponse<Lead>> => {
  const { data } = await apiGet(endPointApi.leads, params);
  return data;
};

// POST /api/leads
export const createLeadApi = async (payload: Lead): Promise<Lead> => {
  const { data } = await apiPost(endPointApi.leadCreate, payload);
  return data;
};

// PUT /api/leads/:id
export const updateLeadApi = async (id: string, payload: Partial<Lead>): Promise<Lead> => {
  const { data } = await apiPut(endPointApi.leadUpdate, id, payload);
  return data;
};

// DELETE /api/leads/:id  (soft delete)
export const deleteLeadApi = async (id: string): Promise<void> => {
  await apiDelete(endPointApi.leadDelete, id);
};

