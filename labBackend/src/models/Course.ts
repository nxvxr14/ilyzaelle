import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  coverImage: string;
  isPublished: boolean;
  modules: mongoose.Types.ObjectId[];
  completionBadge: mongoose.Types.ObjectId | null;
  enrolledCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    modules: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Module',
      },
    ],
    completionBadge: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      default: null,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model<ICourse>('Course', courseSchema);
