import { Request, Response } from 'express';
import { Course } from '../models/Course';
import { Module } from '../models/Module';
import { Card } from '../models/Card';
import { Progress } from '../models/Progress';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { deleteImage, processCourseImage } from '../utils/imageProcessing';

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    const course = await Course.create({ title, description });
    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find()
      .populate('modules')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPublishedCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find({ isPublished: true })
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error('Get published courses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'modules',
        options: { sort: { order: 1 } },
        populate: [
          { path: 'cards', select: '_id order' },
        ],
      });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, isPublished, points, coverImage } = req.body;
    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (isPublished !== undefined) updates.isPublished = isPublished;
    if (points !== undefined) updates.points = points;
    if (coverImage !== undefined) updates.coverImage = coverImage;

    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('modules');

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json(course);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id).populate('modules');
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Delete all modules and their cards
    for (const moduleId of course.modules) {
      const mod = await Module.findById(moduleId);
      if (mod) {
        if (mod.coverImage) deleteImage(mod.coverImage);
        await Card.deleteMany({ module: mod._id });
        await Module.findByIdAndDelete(mod._id);
      }
    }

    if (course.coverImage) deleteImage(course.coverImage);
    await Progress.deleteMany({ course: course._id });
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );
    await Course.findByIdAndDelete(course._id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const userId = req.user?._id;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (!course.isPublished) {
      res.status(400).json({ error: 'Course is not published yet' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const alreadyEnrolled = user.enrolledCourses.some(
      (c) => c.toString() === courseId
    );

    if (alreadyEnrolled) {
      res.status(400).json({ error: 'Already enrolled in this course' });
      return;
    }

    user.enrolledCourses.push(course._id as any);
    await user.save();

    course.enrolledCount += 1;
    await course.save();

    // Initialize progress
    const courseWithModules = await Course.findById(courseId).populate('modules');
    const modulesProgress = (courseWithModules?.modules || []).map((mod: any) => ({
      module: mod._id,
      completed: false,
      cardsProgress: [],
      pointsEarned: 0,
      badgeEarned: null,
      rewardBoxOpened: false,
      completedAt: null,
    }));

    await Progress.create({
      user: userId,
      course: courseId,
      modulesProgress,
    });

    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unenrollFromCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const userId = req.user?._id;

    await User.findByIdAndUpdate(userId, {
      $pull: { enrolledCourses: courseId },
    });

    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledCount: -1 },
    });

    await Progress.findOneAndDelete({ user: userId, course: courseId });

    res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    console.error('Unenroll error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadCourseCover = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Delete old cover if exists
    if (course.coverImage) {
      deleteImage(course.coverImage);
    }

    const imagePath = await processCourseImage(req.file.buffer, req.file.originalname);
    course.coverImage = imagePath;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error('Upload course cover error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
