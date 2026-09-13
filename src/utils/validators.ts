import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long'),
});

export const projectCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title cannot be empty')
    .max(200, 'Project title cannot exceed 200 characters'),
  id: z.string().optional(),
  badge: z.string().optional().default(''),
  domain: z.string().optional().default(''),
  domainColor: z.string().optional().default('#38bdf8'),
  description: z.string().optional().default(''),
  featured: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  highlights: z.array(z.string()).optional().default([]),
  tech: z.array(z.string()).optional().default([]),
  techStack: z.array(z.string()).optional(),
  github: z.string().optional().default(''),
  githubUrl: z.string().optional(),
  liveDemo: z.string().nullable().optional(),
  liveUrl: z.string().nullable().optional(),
  figmaLink: z.string().nullable().optional(),
  figmaUrl: z.string().nullable().optional(),
  metrics: z
    .array(
      z.object({
        label: z.string().optional().default(''),
        value: z.string().optional().default(''),
      })
    )
    .optional()
    .default([]),
  order: z.number().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const projectReorderSchema = z
  .object({
    orderedIds: z.array(z.string()).optional(),
    projectIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      (Array.isArray(data.orderedIds) && data.orderedIds.length > 0) ||
      (Array.isArray(data.projectIds) && data.projectIds.length > 0),
    {
      message: 'Either orderedIds or projectIds array is required',
    }
  );

export const statusUpdateSchema = z.union([
  z.string().min(1, 'Status mode cannot be empty'),
  z.object({
    mode: z.string().optional(),
    status: z.string().optional(),
    modes: z.record(z.string(), z.any()).optional(),
  }),
]);

export const apiEndpointUpdateSchema = z.any();

