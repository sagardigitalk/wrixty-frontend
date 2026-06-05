import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchSettings = async () => {
  const res = await axios.get(`${API_URL}/settings`);
  return res.data;
};

export const updateSettings = async (data: any) => {
  const token = localStorage.getItem('wrixty_token');
  const headers: any = {
    Authorization: `Bearer ${token}`
  };
  
  if (data instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data';
  }
  
  const res = await axios.put(`${API_URL}/settings`, data, { headers });
  return res.data;
};

export const uploadFile = async (file: File) => {
  const token = localStorage.getItem('wrixty_token');
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};
