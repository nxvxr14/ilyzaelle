// User
export interface User {
  _id: string;
  email: string;
  name: string;
  profileImage: string;
  isAdmin: boolean;
  enrolledCourses: string[];
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Course
export interface Course {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  isPublished: boolean;
  modules: Module[];
  completionBadge: Badge | null;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

// Module
export interface Module {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  course: string;
  order: number;
  cards: Card[];
  badge: Badge | null;
  badgeDropChance: number;
  points: number;
  createdAt: string;
  updatedAt: string;
}

// Card blocks
export interface TextBlock {
  type: 'text';
  content: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
}

export interface ImageBlock {
  type: 'image';
  url: string;
  alt: string;
  caption: string;
}

export interface ButtonBlock {
  type: 'button';
  label: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline';
}

export interface QuizBlock {
  type: 'quiz';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface CodeBlock {
  type: 'code';
  language: string;
  content: string;
}

export interface DownloadBlock {
  type: 'download';
  label: string;
  fileUrl: string;
  fileName: string;
}

export type CardBlock = TextBlock | ImageBlock | ButtonBlock | QuizBlock | CodeBlock | DownloadBlock;

export interface Card {
  _id: string;
  title: string;
  module: string;
  order: number;
  blocks: CardBlock[];
  createdAt: string;
  updatedAt: string;
}

// Badge
export interface Badge {
  _id: string;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt: string;
  updatedAt: string;
}

// Progress
export interface CardProgress {
  card: string;
  completed: boolean;
  quizAnswers: Record<string, number>;
  quizCorrect: Record<string, boolean>;
  completedAt: string | null;
}

export interface ModuleProgress {
  module: string;
  completed: boolean;
  cardsProgress: CardProgress[];
  pointsEarned: number;
  badgeEarned: Badge | null;
  rewardBoxOpened: boolean;
  completedAt: string | null;
}

export interface Progress {
  _id: string;
  user: string;
  course: string | Course;
  modulesProgress: ModuleProgress[];
  totalPoints: number;
  completed: boolean;
  completionBadgeEarned: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Admin stats
export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalModules: number;
  totalEnrollments: number;
  completedCourses: number;
}

// Reward box result
export interface RewardResult {
  points: number;
  badgeEarned: Badge | null;
  courseCompleted?: boolean;
  completionBadge?: Badge | null;
}

// User badge
export interface UserBadge {
  badge: Badge;
  earnedFrom: Course;
  earnedAt: string;
  isCompletionBadge?: boolean;
}
