export type CardType = 'text' | 'text-input' | 'multiple-choice' | 'photo-upload';

export interface User {
  _id: string;
  email: string;
  name: string;
  username: string;
  slogan: string;
  profilePhoto: string;
  isAdmin: boolean;
  totalPoints: number;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface Module {
  _id: string;
  categoryId: string;
  name: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface CardOption {
  text: string;
  isCorrect: boolean;
}

export interface Card {
  _id: string;
  moduleId: string;
  type: CardType;
  title: string;
  content: string;
  image: string;
  options: CardOption[];
  correctAnswer: string;
  points: number;
  order: number;
}

export interface Answer {
  cardId: string;
  answer: string;
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface Progress {
  _id: string;
  userId: string;
  moduleId: string;
  currentCardIndex: number;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
  pointsEarned: number;
  answers: Answer[];
}

export interface LeaderboardEntry {
  rank: number;
  _id: string;
  name: string;
  username: string;
  profilePhoto: string;
  totalPoints: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalCategories: number;
  totalModules: number;
  totalCards: number;
  totalStarted: number;
  totalCompleted: number;
  totalIncomplete: number;
  completionRate: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  exists: boolean;
  email?: string;
  user?: User;
}

export interface RegisterInput {
  email: string;
  name: string;
  username: string;
  slogan?: string;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  pointsAwarded: number;
  totalPoints: number;
  currentCardIndex: number;
}

export interface CompleteModuleResponse {
  pointsEarned: number;
  timeTakenMs: number;
  completedAt: string;
}

export interface ModuleProgressStats {
  moduleId: string;
  total: number;
  completed: number;
  incomplete: number;
  completionRate: number;
  users: Progress[];
}

export interface CategoryProgressStats {
  categoryId: string;
  total: number;
  completed: number;
  incomplete: number;
  completionRate: number;
  modules: Array<{
    _id: string;
    name: string;
    totalStarted: number;
    totalCompleted: number;
  }>;
}
