import api from './axios';
import type { ApiResponse } from '@/types';

export const uploadImage = async (file: File): Promise<ApiResponse<{ path: string }>> => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post<ApiResponse<{ path: string }>>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
