import mongoose, { Schema, Document } from 'mongoose';

// Block types for the card editor
export interface ITextBlock {
  type: 'text';
  content: string;
  fontSize: number; // in px
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
}

export interface IImageBlock {
  type: 'image';
  url: string;
  alt: string;
  caption: string;
}

export interface IButtonBlock {
  type: 'button';
  label: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline';
}

export interface IQuizBlock {
  type: 'quiz';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface ICodeBlock {
  type: 'code';
  language: string;
  content: string;
}

export interface IDownloadBlock {
  type: 'download';
  label: string;
  fileUrl: string;
  fileName: string;
}

export type CardBlock = ITextBlock | IImageBlock | IButtonBlock | IQuizBlock | ICodeBlock | IDownloadBlock;

export interface ICard extends Document {
  title: string;
  module: mongoose.Types.ObjectId;
  order: number;
  blocks: CardBlock[];
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    blocks: {
      type: Schema.Types.Mixed,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Card = mongoose.model<ICard>('Card', cardSchema);
