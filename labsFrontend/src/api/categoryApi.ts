import api from './axios';
import type { ApiResponse, Category } from '@/types';

export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  const { data } = await api.get<ApiResponse<Category[]>>('/categories');
  return data;
};

export const getCategoryById = async (id: string): Promise<ApiResponse<Category>> => {
  const { data } = await api.get<ApiResponse<Category>>(`/categories/${id}`);
  return data;
};
