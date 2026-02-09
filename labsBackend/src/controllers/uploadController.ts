import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const file = req.file;

    if (!file) {
      sendError(res, 'No file uploaded');
      return;
    }

    const imagePath = `/api/uploads/${file.filename}`;

    sendSuccess(res, { path: imagePath }, 'Image uploaded');
  } catch (error) {
    console.error('Upload image error:', error);
    sendError(res, 'Failed to upload image', 500);
  }
};
