import { Request, Response } from 'express';
import Card from '../models/Card';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

export const getCardsByModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { moduleId } = req.params;
    const cards = await Card.find({ moduleId })
      .sort({ order: 1 })
      .lean();

    sendSuccess(res, cards);
  } catch (error) {
    console.error('Get cards error:', error);
    sendError(res, 'Failed to fetch cards', 500);
  }
};

export const getCardById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id).lean();

    if (!card) {
      sendError(res, 'Card not found', 404);
      return;
    }

    sendSuccess(res, card);
  } catch (error) {
    console.error('Get card error:', error);
    sendError(res, 'Failed to fetch card', 500);
  }
};

export const createCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      moduleId,
      type,
      title,
      content,
      image,
      options,
      correctAnswer,
      points,
      order,
    } = req.body;

    const maxOrder = await Card.findOne({ moduleId })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const card = await Card.create({
      moduleId,
      type,
      title: title?.trim() || '',
      content: content?.trim() || '',
      image: image || '',
      options: options || [],
      correctAnswer: correctAnswer?.trim() || '',
      points: points || 0,
      order: order ?? (maxOrder ? maxOrder.order + 1 : 0),
    });

    sendCreated(res, card);
  } catch (error) {
    console.error('Create card error:', error);
    sendError(res, 'Failed to create card', 500);
  }
};

export const updateCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const card = await Card.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!card) {
      sendError(res, 'Card not found', 404);
      return;
    }

    sendSuccess(res, card, 'Card updated');
  } catch (error) {
    console.error('Update card error:', error);
    sendError(res, 'Failed to update card', 500);
  }
};

export const deleteCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const card = await Card.findByIdAndDelete(id);

    if (!card) {
      sendError(res, 'Card not found', 404);
      return;
    }

    sendSuccess(res, null, 'Card deleted');
  } catch (error) {
    console.error('Delete card error:', error);
    sendError(res, 'Failed to delete card', 500);
  }
};

export const reorderCards = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cards } = req.body;

    if (!Array.isArray(cards)) {
      sendError(res, 'Cards array is required');
      return;
    }

    const updatePromises = cards.map(
      (item: { id: string; order: number }) =>
        Card.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);
    sendSuccess(res, null, 'Cards reordered');
  } catch (error) {
    console.error('Reorder cards error:', error);
    sendError(res, 'Failed to reorder cards', 500);
  }
};
