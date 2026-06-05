import { apiGet, apiGetById, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface Status {
  _id: string;
  name: string;
  color: string;
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

export type CreateStatusPayload = Omit<Status, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateStatusPayload = Partial<CreateStatusPayload>;

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

let cachedStatuses: any = null;
let cachedStatusesTime = 0;
let statusesPromise: Promise<any> | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// GET /api/statuses?page=&limit=&search=
export const fetchStatuses = async (params?: FetchParams): Promise<PaginatedResponse<Status>> => {
  if (params?.page === 1 && params?.limit === 100 && !params?.search) {
    if (cachedStatuses && Date.now() - cachedStatusesTime < CACHE_TTL) return cachedStatuses;
    if (statusesPromise) return statusesPromise;
    statusesPromise = apiGet(endPointApi.statuses, params).then(({ data }) => {
      cachedStatuses = data;
      cachedStatusesTime = Date.now();
      statusesPromise = null;
      return data;
    }).catch(err => {
      statusesPromise = null;
      throw err;
    });
    return statusesPromise;
  }
  const { data } = await apiGet(endPointApi.statuses, params);
  return data;
};

export const clearStatusCache = () => { cachedStatuses = null; };

// GET /api/statuses/:id
export const fetchStatus = async (id: string): Promise<Status> => {
  const { data } = await apiGetById(endPointApi.statuses, id);
  return data;
};

// POST /api/statuses
export const createStatus = async (payload: CreateStatusPayload): Promise<Status> => {
  clearStatusCache();
  const { data } = await apiPost(endPointApi.statusCreate, payload);
  return data;
};

// PUT /api/statuses/:id
export const updateStatus = async (id: string, payload: UpdateStatusPayload): Promise<Status> => {
  clearStatusCache();
  const { data } = await apiPut(endPointApi.statusUpdate, id, payload);
  return data;
};

// DELETE /api/statuses/:id
export const deleteStatus = async (id: string): Promise<void> => {
  clearStatusCache();
  await apiDelete(endPointApi.statusDelete, id);
};

// GET /api/statuses/export?search=
export const exportStatuses = async (search?: string): Promise<Status[]> => {
  const { data } = await apiGet(endPointApi.statusExport, search ? { search } : undefined);
  return data;
};
