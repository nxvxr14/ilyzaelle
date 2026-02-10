import { Request, Response } from 'express';
import { Badge } from '../models/Badge';
import { processBadgeImage, validateBadgeImageDimensions, deleteImage } from '../utils/imageProcessing';

export const createBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, rarity } = req.body;

    if (!req.file) {
      res.status(400).json({ error: 'Badge image is required' });
      return;
    }

    const isValid = await validateBadgeImageDimensions(req.file.buffer);
    if (!isValid) {
      res.status(400).json({ error: 'Badge image must be exactly 40x40 pixels' });
      return;
    }

    const imagePath = await processBadgeImage(req.file.buffer, req.file.originalname);

    const badge = await Badge.create({
      name,
      description,
      image: imagePath,
      rarity: rarity || 'common',
    });

    res.status(201).json(badge);
  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllBadges = async (_req: Request, res: Response): Promise<void> => {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });
    res.json(badges);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBadgeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      res.status(404).json({ error: 'Badge not found' });
      return;
    }
    res.json(badge);
  } catch (error) {
    console.error('Get badge error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, rarity } = req.body;
    const updates: Record<string, unknown> = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (rarity !== undefined) updates.rarity = rarity;

    if (req.file) {
      const isValid = await validateBadgeImageDimensions(req.file.buffer);
      if (!isValid) {
        res.status(400).json({ error: 'Badge image must be exactly 40x40 pixels' });
        return;
      }

      const existing = await Badge.findById(req.params.id);
      if (existing?.image) deleteImage(existing.image);

      updates.image = await processBadgeImage(req.file.buffer, req.file.originalname);
    }

    const badge = await Badge.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!badge) {
      res.status(404).json({ error: 'Badge not found' });
      return;
    }

    res.json(badge);
  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      res.status(404).json({ error: 'Badge not found' });
      return;
    }

    if (badge.image) deleteImage(badge.image);
    await Badge.findByIdAndDelete(badge._id);

    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
