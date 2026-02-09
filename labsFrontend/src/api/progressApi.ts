import api from './axios';
import type {
  ApiResponse,
  Progress,
  SubmitAnswerResponse,
  CompleteModuleResponse,
} from '@/types';

export const getProgress = async (moduleId: string): Promise<ApiResponse<Progress>> => {
  const { data } = await api.get<ApiResponse<Progress>>(`/progress/${moduleId}`);
  return data;
};

export const getAllProgress = async (): Promise<ApiResponse<Progress[]>> => {
  const { data } = await api.get<ApiResponse<Progress[]>>('/progress/all');
  return data;
};

export const startModule = async (moduleId: string): Promise<ApiResponse<Progress>> => {
  const { data } = await api.post<ApiResponse<Progress>>(`/progress/${moduleId}/start`);
  return data;
};

export const submitAnswer = async (
  moduleId: string,
  cardId: string,
  answer: string
): Promise<ApiResponse<SubmitAnswerResponse>> => {
  const { data } = await api.post<ApiResponse<SubmitAnswerResponse>>(
    `/progress/${moduleId}/answer`,
    { cardId, answer }
  );
  return data;
};

export const advanceCard = async (
  moduleId: string,
  cardIndex: number
): Promise<ApiResponse<Progress>> => {
  const { data } = await api.post<ApiResponse<Progress>>(
    `/progress/${moduleId}/advance`,
    { cardIndex }
  );
  return data;
};

export const completeModule = async (
  moduleId: string
): Promise<ApiResponse<CompleteModuleResponse>> => {
  const { data } = await api.post<ApiResponse<CompleteModuleResponse>>(
    `/progress/${moduleId}/complete`
  );
  return data;
};
