import { apiGet, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface Customer {
  _id?: string;
  name: string;
  phone_number: string;
  createdAt?: string;
}

export const fetchCustomers = async (search: string = '', page: number = 1, limit: number = 10) => {
  try {
    const { data } = await apiGet('/customers', { search, page, limit });
    return data;
  } catch (error) {
    console.error("Failed to fetch customers", error);
    return { data: [] };
  }
};

export const createCustomerApi = async (customerData: Partial<Customer>) => {
  const { data } = await apiPost('/customers', customerData);
  return data;
};

export const updateCustomerApi = async (id: string, customerData: Partial<Customer>) => {
  const { data } = await apiPut('/customers', id, customerData);
  return data;
};

export const deleteCustomerApi = async (id: string) => {
  const { data } = await apiDelete('/customers', id);
  return data;
};
