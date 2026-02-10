import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo valido'),
  name: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'El titulo es obligatorio')
    .max(100, 'Maximo 100 caracteres'),
  description: z
    .string()
    .min(1, 'La descripcion es obligatoria')
    .max(500, 'Maximo 500 caracteres'),
});

export type CreateCourseFormData = z.infer<typeof createCourseSchema>;

export const editCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'El titulo es obligatorio')
    .max(100, 'Maximo 100 caracteres'),
  description: z
    .string()
    .min(1, 'La descripcion es obligatoria')
    .max(500, 'Maximo 500 caracteres'),
});

export type EditCourseFormData = z.infer<typeof editCourseSchema>;

export const createModuleSchema = z.object({
  title: z
    .string()
    .min(1, 'El titulo es obligatorio')
    .max(100, 'Maximo 100 caracteres'),
  description: z
    .string()
    .max(300, 'Maximo 300 caracteres'),
  points: z
    .number({ invalid_type_error: 'Debe ser un numero' })
    .min(0, 'Minimo 0 puntos')
    .max(10000, 'Maximo 10000 puntos'),
});

export type CreateModuleFormData = z.infer<typeof createModuleSchema>;

export const createBadgeSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(50, 'Maximo 50 caracteres'),
  description: z
    .string()
    .max(200, 'Maximo 200 caracteres'),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary'], {
    required_error: 'Selecciona una rareza',
  }),
});

export type CreateBadgeFormData = z.infer<typeof createBadgeSchema>;

export const profileNameSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(50, 'Maximo 50 caracteres'),
});

export type ProfileNameFormData = z.infer<typeof profileNameSchema>;
