import api from './axios';
import type { ApiResponse, Module } from '@/types';

export const getModulesByCategory = async (categoryId: string): Promise<ApiResponse<Module[]>> => {
  const { data } = await api.get<ApiResponse<Module[]>>(`/modules/category/${categoryId}`);
  return data;
};

export const getModuleById = async (id: string): Promise<ApiResponse<Module>> => {
  const { data } = await api.get<ApiResponse<Module>>(`/modules/${id}`);
  return data;
};
