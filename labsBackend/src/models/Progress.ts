import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnswer {
  cardId: Types.ObjectId;
  answer: string;
  isCorrect: boolean;
  pointsAwarded: number;
}

export interface IProgress extends Document {
  userId: Types.ObjectId;
  moduleId: Types.ObjectId;
  currentCardIndex: number;
  completed: boolean;
  startedAt: Date;
  completedAt: Date | null;
  pointsEarned: number;
  answers: IAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    cardId: {
      type: Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },
    answer: {
      type: String,
      default: '',
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const ProgressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    currentCardIndex: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    answers: {
      type: [AnswerSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound index: one progress per user per module
ProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);
export default Progress;
