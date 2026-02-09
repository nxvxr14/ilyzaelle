import api from './axios';
import type { ApiResponse, LoginResponse, RegisterInput, User } from '@/types';

export const loginUser = async (email: string): Promise<ApiResponse<LoginResponse>> => {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email });
  return data;
};

export const registerUser = async (input: RegisterInput): Promise<ApiResponse<{ user: User }>> => {
  const { data } = await api.post<ApiResponse<{ user: User }>>('/auth/register', input);
  return data;
};

export const updateProfilePhoto = async (file: File): Promise<ApiResponse<{ profilePhoto: string }>> => {
  const formData = new FormData();
  formData.append('profilePhoto', file);
  const { data } = await api.put<ApiResponse<{ profilePhoto: string }>>('/auth/profile-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
