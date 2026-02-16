import { Request, Response } from 'express';
import { Module } from '../models/Module';
import { Card } from '../models/Card';
import { Course } from '../models/Course';
import { processModuleImage, deleteImage } from '../utils/imageProcessing';

export const createModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, courseId, points, badgeDropChance } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const order = course.modules.length;

    const moduleData: Record<string, unknown> = {
      title,
      description,
      course: courseId,
      order,
      points: points || 20,
      badgeDropChance: badgeDropChance ?? 20,
    };

    if (req.file) {
      moduleData.coverImage = await processModuleImage(req.file.buffer, req.file.originalname);
    }

    const mod = await Module.create(moduleData);

    course.modules.push(mod._id as any);
    await course.save();

    res.status(201).json(mod);
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getModuleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const mod = await Module.findById(req.params.id)
      .populate({
        path: 'cards',
        options: { sort: { order: 1 } },
      });

    if (!mod) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    res.json(mod);
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, order, points, badgeDropChance } = req.body;
    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (order !== undefined) updates.order = order;
    if (points !== undefined) updates.points = points;
    if (badgeDropChance !== undefined) updates.badgeDropChance = badgeDropChance;

    if (req.file) {
      const existingModule = await Module.findById(req.params.id);
      if (existingModule?.coverImage) {
        deleteImage(existingModule.coverImage);
      }
      updates.coverImage = await processModuleImage(req.file.buffer, req.file.originalname);
    }

    const mod = await Module.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!mod) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    res.json(mod);
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const mod = await Module.findById(req.params.id);
    if (!mod) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    // Remove from course
    await Course.findByIdAndUpdate(mod.course, {
      $pull: { modules: mod._id },
    });

    // Delete cards
    await Card.deleteMany({ module: mod._id });

    if (mod.coverImage) deleteImage(mod.coverImage);

    await Module.findByIdAndDelete(mod._id);

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const reorderModules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { modules } = req.body; // Array of { id, order }

    for (const { id, order } of modules) {
      await Module.findByIdAndUpdate(id, { order });
    }

    res.json({ message: 'Modules reordered successfully' });
  } catch (error) {
    console.error('Reorder modules error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
