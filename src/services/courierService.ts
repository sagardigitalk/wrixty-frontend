import { apiGet, apiGetById, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface Courier {
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

export type CreateCourierPayload = Omit<Courier, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateCourierPayload = Partial<CreateCourierPayload>;

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

let cachedCouriers: any = null;
let cachedCouriersTime = 0;
let couriersPromise: Promise<any> | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// GET /api/couriers?page=&limit=&search=
export const fetchCouriers = async (params?: FetchParams): Promise<PaginatedResponse<Courier>> => {
  if (params?.page === 1 && params?.limit === 100 && !params?.search) {
    if (cachedCouriers && Date.now() - cachedCouriersTime < CACHE_TTL) return cachedCouriers;
    if (couriersPromise) return couriersPromise;
    couriersPromise = apiGet(endPointApi.couriers, params).then(({ data }) => {
      cachedCouriers = data;
      cachedCouriersTime = Date.now();
      couriersPromise = null;
      return data;
    }).catch(err => {
      couriersPromise = null;
      throw err;
    });
    return couriersPromise;
  }
  const { data } = await apiGet(endPointApi.couriers, params);
  return data;
};

export const clearCourierCache = () => { cachedCouriers = null; };

// GET /api/couriers/:id
export const fetchCourier = async (id: string): Promise<Courier> => {
  const { data } = await apiGetById(endPointApi.couriers, id);
  return data;
};

// POST /api/couriers
export const createCourier = async (payload: CreateCourierPayload): Promise<Courier> => {
  clearCourierCache();
  const { data } = await apiPost(endPointApi.courierCreate, payload);
  return data;
};

// PUT /api/couriers/:id
export const updateCourier = async (id: string, payload: UpdateCourierPayload): Promise<Courier> => {
  clearCourierCache();
  const { data } = await apiPut(endPointApi.courierUpdate, id, payload);
  return data;
};

// DELETE /api/couriers/:id
export const deleteCourier = async (id: string): Promise<void> => {
  clearCourierCache();
  await apiDelete(endPointApi.courierDelete, id);
};
