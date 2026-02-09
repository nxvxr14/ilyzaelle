import { Request, Response } from 'express';
import Module from '../models/Module';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

export const getModulesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const modules = await Module.find({
      categoryId,
      isActive: true,
    })
      .sort({ order: 1 })
      .lean();

    sendSuccess(res, modules);
  } catch (error) {
    console.error('Get modules error:', error);
    sendError(res, 'Failed to fetch modules', 500);
  }
};

export const getModuleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const module = await Module.findById(id).lean();

    if (!module) {
      sendError(res, 'Module not found', 404);
      return;
    }

    sendSuccess(res, module);
  } catch (error) {
    console.error('Get module error:', error);
    sendError(res, 'Failed to fetch module', 500);
  }
};

export const createModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, image, categoryId, order } = req.body;

    const maxOrder = await Module.findOne({ categoryId })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const module = await Module.create({
      categoryId,
      name: name.trim(),
      description: description?.trim() || '',
      image: image || '',
      order: order ?? (maxOrder ? maxOrder.order + 1 : 0),
    });

    sendCreated(res, module);
  } catch (error) {
    console.error('Create module error:', error);
    sendError(res, 'Failed to create module', 500);
  }
};

export const updateModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const module = await Module.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!module) {
      sendError(res, 'Module not found', 404);
      return;
    }

    sendSuccess(res, module, 'Module updated');
  } catch (error) {
    console.error('Update module error:', error);
    sendError(res, 'Failed to update module', 500);
  }
};

export const deleteModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const module = await Module.findByIdAndDelete(id);

    if (!module) {
      sendError(res, 'Module not found', 404);
      return;
    }

    sendSuccess(res, null, 'Module deleted');
  } catch (error) {
    console.error('Delete module error:', error);
    sendError(res, 'Failed to delete module', 500);
  }
};

export const getAllModulesAdmin = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const modules = await Module.find().sort({ order: 1 }).populate('categoryId', 'name');
    sendSuccess(res, modules);
  } catch (error) {
    console.error('Get all modules admin error:', error);
    sendError(res, 'Failed to get modules', 500);
  }
};
