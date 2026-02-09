import mongoose, { Schema, Document, Types } from 'mongoose';

export type CardType = 'text' | 'text-input' | 'multiple-choice' | 'photo-upload';

export interface ICardOption {
  text: string;
  isCorrect: boolean;
}

export interface ICard extends Document {
  moduleId: Types.ObjectId;
  type: CardType;
  title: string;
  content: string;
  image: string;
  options: ICardOption[];
  correctAnswer: string;
  points: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CardOptionSchema = new Schema<ICardOption>(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const CardSchema = new Schema<ICard>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'text-input', 'multiple-choice', 'photo-upload'],
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    options: {
      type: [CardOptionSchema],
      default: [],
    },
    correctAnswer: {
      type: String,
      default: '',
    },
    points: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Card = mongoose.model<ICard>('Card', CardSchema);
export default Card;
