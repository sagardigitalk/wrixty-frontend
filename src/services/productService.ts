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

let cachedProducts: any = null;
let cachedProductsTime = 0;
let productsPromise: Promise<any> | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// GET /api/products?page=&limit=&search=
export const fetchProducts = async (params?: FetchParams): Promise<PaginatedResponse<Product>> => {
  if (params?.page === 1 && params?.limit === 100 && !params?.search) {
    if (cachedProducts && Date.now() - cachedProductsTime < CACHE_TTL) return cachedProducts;
    if (productsPromise) return productsPromise;
    productsPromise = apiGet(endPointApi.products, params).then(({ data }) => {
      cachedProducts = data;
      cachedProductsTime = Date.now();
      productsPromise = null;
      return data;
    }).catch(err => {
      productsPromise = null;
      throw err;
    });
    return productsPromise;
  }
  const { data } = await apiGet(endPointApi.products, params);
  return data;
};

export const clearProductCache = () => { cachedProducts = null; };

// GET /api/products/:id
export const fetchProduct = async (id: string): Promise<Product> => {
  const { data } = await apiGetById(endPointApi.products, id);
  return data;
};

// POST /api/products
export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  clearProductCache();
  const { data } = await apiPost(endPointApi.productCreate, payload);
  return data;
};

// PUT /api/products/:id
export const updateProduct = async (id: string, payload: UpdateProductPayload): Promise<Product> => {
  clearProductCache();
  const { data } = await apiPut(endPointApi.productUpdate, id, payload);
  return data;
};

// DELETE /api/products/:id
export const deleteProduct = async (id: string): Promise<void> => {
  clearProductCache();
  await apiDelete(endPointApi.productDelete, id);
};

// GET /api/products/export?search=
export const exportProducts = async (search?: string): Promise<Product[]> => {
  const { data } = await apiGet(endPointApi.productExport, search ? { search } : undefined);
  return data;
};
