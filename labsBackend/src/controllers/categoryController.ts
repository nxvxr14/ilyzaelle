import { Request, Response } from 'express';
import Category from '../models/Category';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

export const getCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    sendSuccess(res, categories);
  } catch (error) {
    console.error('Get categories error:', error);
    sendError(res, 'Failed to fetch categories', 500);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).lean();

    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }

    sendSuccess(res, category);
  } catch (error) {
    console.error('Get category error:', error);
    sendError(res, 'Failed to fetch category', 500);
  }
};

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, image, order } = req.body;

    const maxOrder = await Category.findOne()
      .sort({ order: -1 })
      .select('order')
      .lean();

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || '',
      image: image || '',
      order: order ?? (maxOrder ? maxOrder.order + 1 : 0),
    });

    sendCreated(res, category);
  } catch (error) {
    console.error('Create category error:', error);
    sendError(res, 'Failed to create category', 500);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }

    sendSuccess(res, category, 'Category updated');
  } catch (error) {
    console.error('Update category error:', error);
    sendError(res, 'Failed to update category', 500);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }

    sendSuccess(res, null, 'Category deleted');
  } catch (error) {
    console.error('Delete category error:', error);
    sendError(res, 'Failed to delete category', 500);
  }
};

export const getAllCategoriesAdmin = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find().sort({ order: 1 }).lean();
    sendSuccess(res, categories);
  } catch (error) {
    console.error('Get all categories admin error:', error);
    sendError(res, 'Failed to fetch categories', 500);
  }
};
