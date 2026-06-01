import { apiGet, apiGetById, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface Product {
  _id: string;
  name: string;
  amount: number;
  cod_dicount: number;
  prepad_disocount: number;
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

export type CreateProductPayload = Omit<Product, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

// GET /api/products?page=&limit=&search=
export const fetchProducts = async (params?: FetchParams): Promise<PaginatedResponse<Product>> => {
  const { data } = await apiGet(endPointApi.products, params);
  return data;
};

// GET /api/products/:id
export const fetchProduct = async (id: string): Promise<Product> => {
  const { data } = await apiGetById(endPointApi.products, id);
  return data;
};

// POST /api/products
export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const { data } = await apiPost(endPointApi.productCreate, payload);
  return data;
};

// PUT /api/products/:id
export const updateProduct = async (id: string, payload: UpdateProductPayload): Promise<Product> => {
  const { data } = await apiPut(endPointApi.productUpdate, id, payload);
  return data;
};

// DELETE /api/products/:id
export const deleteProduct = async (id: string): Promise<void> => {
  await apiDelete(endPointApi.productDelete, id);
};

// GET /api/products/export?search=
export const exportProducts = async (search?: string): Promise<Product[]> => {
  const { data } = await apiGet(endPointApi.productExport, search ? { search } : undefined);
  return data;
};
