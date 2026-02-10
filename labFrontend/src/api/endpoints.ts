import api from './client';
import type {
  AuthResponse,
  CheckEmailResponse,
  User,
  Course,
  Module,
  Card,
  Badge,
  Progress,
  AdminStats,
  RewardResult,
  UserBadge,
} from '@/types';

// Auth
export const checkEmail = (email: string) =>
  api.post<CheckEmailResponse>('/auth/check-email', { email });

export const registerUser = (data: FormData) =>
  api.post<AuthResponse>('/auth/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getProfile = () =>
  api.get<User>('/auth/profile');

export const updateProfile = (data: FormData) =>
  api.put<User>('/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getAllUsers = () =>
  api.get<User[]>('/auth/users');

export const deleteUser = (id: string) =>
  api.delete(`/auth/users/${id}`);

// Courses
export const getPublishedCourses = () =>
  api.get<Course[]>('/courses/published');

export const getAllCourses = () =>
  api.get<Course[]>('/courses');

export const getCourseById = (id: string) =>
  api.get<Course>(`/courses/${id}`);

export const createCourse = (data: { title: string; description: string }) =>
  api.post<Course>('/courses', data);

export const updateCourse = (id: string, data: Partial<Course>) =>
  api.put<Course>(`/courses/${id}`, data);

export const deleteCourse = (id: string) =>
  api.delete(`/courses/${id}`);

export const uploadCourseCover = (id: string, data: FormData) =>
  api.put<Course>(`/courses/${id}/cover`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const enrollInCourse = (id: string) =>
  api.post(`/courses/${id}/enroll`);

export const unenrollFromCourse = (id: string) =>
  api.delete(`/courses/${id}/enroll`);

// Modules
export const getModuleById = (id: string) =>
  api.get<Module>(`/modules/${id}`);

export const createModule = (data: FormData) =>
  api.post<Module>('/modules', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateModule = (id: string, data: FormData) =>
  api.put<Module>(`/modules/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteModule = (id: string) =>
  api.delete(`/modules/${id}`);

export const reorderModules = (modules: { id: string; order: number }[]) =>
  api.put('/modules/reorder/batch', { modules });

// Cards
export const getCardById = (id: string) =>
  api.get<Card>(`/cards/${id}`);

export const createCard = (data: { title: string; moduleId: string; blocks: unknown[] }) =>
  api.post<Card>('/cards', data);

export const updateCard = (id: string, data: Partial<Card>) =>
  api.put<Card>(`/cards/${id}`, data);

export const deleteCard = (id: string) =>
  api.delete(`/cards/${id}`);

export const uploadCardImage = (file: FormData) =>
  api.post<{ url: string }>('/cards/upload-image', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const reorderCards = (cards: { id: string; order: number }[]) =>
  api.put('/cards/reorder/batch', { cards });

// Badges
export const getAllBadges = () =>
  api.get<Badge[]>('/badges');

export const getBadgeById = (id: string) =>
  api.get<Badge>(`/badges/${id}`);

export const createBadge = (data: FormData) =>
  api.post<Badge>('/badges', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateBadge = (id: string, data: FormData) =>
  api.put<Badge>(`/badges/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteBadge = (id: string) =>
  api.delete(`/badges/${id}`);

// Progress
export const getCourseProgress = (courseId: string) =>
  api.get<Progress>(`/progress/course/${courseId}`);

export const completeCard = (courseId: string, moduleId: string, cardId: string, quizAnswers?: Record<string, number>) =>
  api.post<Progress>(`/progress/course/${courseId}/module/${moduleId}/card/${cardId}/complete`, { quizAnswers });

export const completeModuleProgress = (courseId: string, moduleId: string) =>
  api.post<{ progress: Progress; reward: RewardResult }>(`/progress/course/${courseId}/module/${moduleId}/complete`);

export const getUserBadges = () =>
  api.get<UserBadge[]>('/progress/badges');

export const getUserActivity = () =>
  api.get<Progress[]>('/progress/activity');

export const getAdminStats = () =>
  api.get<AdminStats>('/progress/admin/stats');
