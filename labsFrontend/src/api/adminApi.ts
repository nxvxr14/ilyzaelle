import api from './axios';
import type {
  ApiResponse,
  DashboardStats,
  User,
  Progress,
  Category,
  Module,
  Card,
  ModuleProgressStats,
  CategoryProgressStats,
} from '@/types';

// Dashboard
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  const { data } = await api.get<ApiResponse<DashboardStats>>('/admin/stats');
  return data;
};

// Users
export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  const { data } = await api.get<ApiResponse<User[]>>('/admin/users');
  return data;
};

export const getUserProgress = async (userId: string): Promise<ApiResponse<Progress[]>> => {
  const { data } = await api.get<ApiResponse<Progress[]>>(`/admin/users/${userId}/progress`);
  return data;
};

// Progress
export const getModuleProgress = async (moduleId: string): Promise<ApiResponse<ModuleProgressStats>> => {
  const { data } = await api.get<ApiResponse<ModuleProgressStats>>(`/admin/progress/module/${moduleId}`);
  return data;
};

export const getCategoryProgress = async (categoryId: string): Promise<ApiResponse<CategoryProgressStats>> => {
  const { data } = await api.get<ApiResponse<CategoryProgressStats>>(`/admin/progress/category/${categoryId}`);
  return data;
};

// Categories
export const getAllCategoriesAdmin = async (): Promise<ApiResponse<Category[]>> => {
  const { data } = await api.get<ApiResponse<Category[]>>('/admin/categories');
  return data;
};

export const createCategory = async (
  input: Partial<Category> | FormData
): Promise<ApiResponse<Category>> => {
  const { data } = await api.post<ApiResponse<Category>>('/admin/categories', input);
  return data;
};

export const updateCategory = async (
  id: string,
  input: Partial<Category> | FormData
): Promise<ApiResponse<Category>> => {
  const { data } = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, input);
  return data;
};

export const deleteCategory = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`/admin/categories/${id}`);
  return data;
};

// Modules
export const getAllModulesAdmin = async (): Promise<ApiResponse<Module[]>> => {
  const { data } = await api.get<ApiResponse<Module[]>>('/admin/modules');
  return data;
};

export const createModule = async (
  input: Partial<Module> | FormData
): Promise<ApiResponse<Module>> => {
  const { data } = await api.post<ApiResponse<Module>>('/admin/modules', input);
  return data;
};

export const updateModule = async (
  id: string,
  input: Partial<Module> | FormData
): Promise<ApiResponse<Module>> => {
  const { data } = await api.put<ApiResponse<Module>>(`/admin/modules/${id}`, input);
  return data;
};

export const deleteModule = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`/admin/modules/${id}`);
  return data;
};

// Cards
export const getCardsByModuleAdmin = async (
  moduleId: string
): Promise<ApiResponse<Card[]>> => {
  const { data } = await api.get<ApiResponse<Card[]>>(`/admin/cards/${moduleId}`);
  return data;
};

export const createCard = async (
  input: Partial<Card>
): Promise<ApiResponse<Card>> => {
  const { data } = await api.post<ApiResponse<Card>>('/admin/cards', input);
  return data;
};

export const updateCard = async (
  id: string,
  input: Partial<Card>
): Promise<ApiResponse<Card>> => {
  const { data } = await api.put<ApiResponse<Card>>(`/admin/cards/${id}`, input);
  return data;
};

export const deleteCard = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`/admin/cards/${id}`);
  return data;
};

export const reorderCards = async (
  _moduleId: string,
  orderedIds: string[]
): Promise<ApiResponse<null>> => {
  const cards = orderedIds.map((id, index) => ({ id, order: index }));
  const { data } = await api.put<ApiResponse<null>>(`/admin/cards/reorder`, { cards });
  return data;
};
