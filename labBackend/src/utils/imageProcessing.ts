import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { config } from '../config/constants';

interface ProcessImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  subdir: 'profiles' | 'modules' | 'badges' | 'cards';
}

export const processImage = async (
  buffer: Buffer,
  filename: string,
  options: ProcessImageOptions
): Promise<string> => {
  const { width, height, quality = 80, subdir } = options;
  const ext = '.webp';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const dirPath = path.join(config.uploadsDir, subdir);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const outputPath = path.join(dirPath, uniqueName);

  let pipeline = sharp(buffer);

  if (width && height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'cover',
      position: 'center',
    });
  } else if (width) {
    pipeline = pipeline.resize(width, undefined, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  await pipeline
    .webp({ quality })
    .toFile(outputPath);

  return `/uploads/${subdir}/${uniqueName}`;
};

export const processProfileImage = async (buffer: Buffer, filename: string): Promise<string> => {
  return processImage(buffer, filename, {
    width: 200,
    height: 200,
    quality: 85,
    subdir: 'profiles',
  });
};

export const processModuleImage = async (buffer: Buffer, filename: string): Promise<string> => {
  // 9:16 ratio, width 400px -> height ~711px
  return processImage(buffer, filename, {
    width: 400,
    height: 711,
    quality: 80,
    subdir: 'modules',
  });
};

export const processBadgeImage = async (buffer: Buffer, filename: string): Promise<string> => {
  return processImage(buffer, filename, {
    width: 40,
    height: 40,
    quality: 90,
    subdir: 'badges',
  });
};

export const processCardImage = async (buffer: Buffer, filename: string): Promise<string> => {
  return processImage(buffer, filename, {
    width: 800,
    quality: 80,
    subdir: 'cards',
  });
};

export const processCourseImage = async (buffer: Buffer, filename: string): Promise<string> => {
  // Keep original resolution from the frontend crop (already 16:9)
  // Only convert to WebP with high quality — no resize
  return processImage(buffer, filename, {
    quality: 92,
    subdir: 'modules', // reuse modules folder for course covers too
  });
};

export const validateBadgeImageDimensions = async (buffer: Buffer): Promise<boolean> => {
  const metadata = await sharp(buffer).metadata();
  return metadata.width === 40 && metadata.height === 40;
};

export const deleteImage = (imagePath: string): void => {
  if (!imagePath) return;
  const fullPath = path.join(process.cwd(), imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};
