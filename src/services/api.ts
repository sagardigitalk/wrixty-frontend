import axios from 'axios';
import endPointApi from './endpoints';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper: GET /endpoint
export const apiGet = (endpoint: string, params?: object) =>
  api.get(endpoint, { params });

// Helper: GET /endpoint/:id
export const apiGetById = (endpoint: string, id: string) =>
  api.get(`${endpoint}/${id}`);

// Helper: POST /endpoint
export const apiPost = (endpoint: string, body: object) =>
  api.post(endpoint, body);

// Helper: PUT /endpoint/:id
export const apiPut = (endpoint: string, id: string, body: object) =>
  api.put(`${endpoint}/${id}`, body);

// Helper: DELETE /endpoint/:id
export const apiDelete = (endpoint: string, id: string) =>
  api.delete(`${endpoint}/${id}`);

export { endPointApi };
export default api;
