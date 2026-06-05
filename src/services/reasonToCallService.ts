import { apiGet, apiGetById, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface ReasonToCall {
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

export type CreateReasonToCallPayload = Omit<ReasonToCall, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateReasonToCallPayload = Partial<CreateReasonToCallPayload>;

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

let cachedReasonToCalls: any = null;
let cachedReasonToCallsTime = 0;
let reasonToCallsPromise: Promise<any> | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// GET /api/reason-to-calls?page=&limit=&search=
export const fetchReasonToCalls = async (params?: FetchParams): Promise<PaginatedResponse<ReasonToCall>> => {
  if (params?.page === 1 && params?.limit === 100 && !params?.search) {
    if (cachedReasonToCalls && Date.now() - cachedReasonToCallsTime < CACHE_TTL) return cachedReasonToCalls;
    if (reasonToCallsPromise) return reasonToCallsPromise;
    reasonToCallsPromise = apiGet(endPointApi.reasonToCalls, params).then(({ data }) => {
      cachedReasonToCalls = data;
      cachedReasonToCallsTime = Date.now();
      reasonToCallsPromise = null;
      return data;
    }).catch(err => {
      reasonToCallsPromise = null;
      throw err;
    });
    return reasonToCallsPromise;
  }
  const { data } = await apiGet(endPointApi.reasonToCalls, params);
  return data;
};

export const clearReasonToCallCache = () => { cachedReasonToCalls = null; };

// GET /api/reason-to-calls/:id
export const fetchReasonToCall = async (id: string): Promise<ReasonToCall> => {
  const { data } = await apiGetById(endPointApi.reasonToCalls, id);
  return data;
};

// POST /api/reason-to-calls
export const createReasonToCall = async (payload: CreateReasonToCallPayload): Promise<ReasonToCall> => {
  clearReasonToCallCache();
  const { data } = await apiPost(endPointApi.reasonToCallCreate, payload);
  return data;
};

// PUT /api/reason-to-calls/:id
export const updateReasonToCall = async (id: string, payload: UpdateReasonToCallPayload): Promise<ReasonToCall> => {
  clearReasonToCallCache();
  const { data } = await apiPut(endPointApi.reasonToCallUpdate, id, payload);
  return data;
};

// DELETE /api/reason-to-calls/:id
export const deleteReasonToCall = async (id: string): Promise<void> => {
  clearReasonToCallCache();
  await apiDelete(endPointApi.reasonToCallDelete, id);
};

// GET /api/reason-to-calls/export?search=
export const exportReasonToCalls = async (search?: string): Promise<ReasonToCall[]> => {
  const { data } = await apiGet(endPointApi.reasonToCallExport, search ? { search } : undefined);
  return data;
};
