import mongoose, { Schema, Document } from 'mongoose';

export interface ICardProgress {
  card: mongoose.Types.ObjectId;
  completed: boolean;
  quizAnswers: Record<string, number>; // blockIndex -> selectedOption
  quizCorrect: Record<string, boolean>; // blockIndex -> isCorrect
  uploadResponses: Record<string, string>; // blockIndex -> uploaded image URL
  completedAt: Date | null;
}

export interface IModuleProgress {
  module: mongoose.Types.ObjectId;
  completed: boolean;
  cardsProgress: ICardProgress[];
  pointsEarned: number;
  badgeEarned: mongoose.Types.ObjectId | null;
  rewardBoxOpened: boolean;
  completedAt: Date | null;
}

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  modulesProgress: IModuleProgress[];
  totalPoints: number;
  completed: boolean;
  completionBadgeEarned: boolean;
  completionBadge: mongoose.Types.ObjectId | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const cardProgressSchema = new Schema<ICardProgress>(
  {
    card: {
      type: Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    quizAnswers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    quizCorrect: {
      type: Schema.Types.Mixed,
      default: {},
    },
    uploadResponses: {
      type: Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const moduleProgressSchema = new Schema<IModuleProgress>(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    cardsProgress: [cardProgressSchema],
    pointsEarned: {
      type: Number,
      default: 0,
    },
    badgeEarned: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      default: null,
    },
    rewardBoxOpened: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const progressSchema = new Schema<IProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    modulesProgress: [moduleProgressSchema],
    totalPoints: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completionBadgeEarned: {
      type: Boolean,
      default: false,
    },
    completionBadge: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

progressSchema.index({ user: 1, course: 1 }, { unique: true });

export const Progress = mongoose.model<IProgress>('Progress', progressSchema);
