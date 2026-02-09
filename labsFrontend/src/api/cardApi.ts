import api from './axios';
import type { ApiResponse, Card } from '@/types';

export const getCardsByModule = async (moduleId: string): Promise<ApiResponse<Card[]>> => {
  const { data } = await api.get<ApiResponse<Card[]>>(`/cards/module/${moduleId}`);
  return data;
};

export const getCardById = async (id: string): Promise<ApiResponse<Card>> => {
  const { data } = await api.get<ApiResponse<Card>>(`/cards/${id}`);
  return data;
};
