import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type CardType = 'text' | 'text-input' | 'multiple-choice' | 'photo-upload';

export interface CardOptionInput {
  text: string;
  isCorrect: boolean;
}

export interface CreateCardInput {
  moduleId: string;
  type: CardType;
  title: string;
  content: string;
  image?: string;
  options?: CardOptionInput[];
  correctAnswer?: string;
  points: number;
  order: number;
}

export interface RegisterInput {
  email: string;
  name: string;
  username: string;
  slogan?: string;
}

export interface LoginInput {
  email: string;
}
