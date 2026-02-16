import { Request, Response } from 'express';
import { Card } from '../models/Card';
import { Module } from '../models/Module';
import { processCardImage } from '../utils/imageProcessing';

export const createCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, moduleId, blocks } = req.body;

    const mod = await Module.findById(moduleId);
    if (!mod) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    const order = mod.cards.length;
    const parsedBlocks = typeof blocks === 'string' ? JSON.parse(blocks) : blocks;

    const card = await Card.create({
      title,
      module: moduleId,
      order,
      blocks: parsedBlocks || [],
    });

    mod.cards.push(card._id as any);
    await mod.save();

    res.status(201).json(card);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    res.json(card);
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, blocks, order } = req.body;
    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title;
    if (order !== undefined) updates.order = order;
    if (blocks !== undefined) {
      updates.blocks = typeof blocks === 'string' ? JSON.parse(blocks) : blocks;
    }

    const card = await Card.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    res.json(card);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    await Module.findByIdAndUpdate(card.module, {
      $pull: { cards: card._id },
    });

    await Card.findByIdAndDelete(card._id);
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadCardImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const imagePath = await processCardImage(req.file.buffer, req.file.originalname);
    res.json({ url: imagePath });
  } catch (error) {
    console.error('Upload card image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/** Student-facing upload for photo-upload blocks (authenticate only, no admin) */
export const uploadStudentImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const imagePath = await processCardImage(req.file.buffer, req.file.originalname);
    res.json({ url: imagePath });
  } catch (error) {
    console.error('Upload student image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const reorderCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cards } = req.body; // Array of { id, order }

    for (const { id, order } of cards) {
      await Card.findByIdAndUpdate(id, { order });
    }

    res.json({ message: 'Cards reordered successfully' });
  } catch (error) {
    console.error('Reorder cards error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
