import mongoose, { Schema, Document } from 'mongoose';

export interface IModule extends Document {
  title: string;
  description: string;
  coverImage: string;
  course: mongoose.Types.ObjectId;
  order: number;
  cards: mongoose.Types.ObjectId[];
  badge: mongoose.Types.ObjectId | null;
  badgeDropChance: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    cards: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Card',
      },
    ],
    badge: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      default: null,
    },
    badgeDropChance: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    points: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

export const Module = mongoose.model<IModule>('Module', moduleSchema);
