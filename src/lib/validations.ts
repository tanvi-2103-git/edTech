/**
 * Zod validation schemas for API request/response validation
 * Ensures data sanitization and prevents injection vulnerabilities
 */
import { z } from "zod";

// Auth validations
export const signUpSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .transform((v) => v.trim()),
  role: z.enum(["LEARNER", "INSTRUCTOR"]).optional().default("LEARNER"),
});

export const signInSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

// Course validations
export const createCourseSchema = z.object({
  title: z.string().min(1, "Title required").max(200).trim(),
  description: z.string().max(2000).optional(),
  published: z.boolean().optional().default(false),
});

export const updateCourseSchema = createCourseSchema.partial();

// Module validations
export const createModuleSchema = z.object({
  title: z.string().min(1, "Title required").max(200).trim(),
  content: z.string().min(1, "Content required").max(50000),
  order: z.number().int().min(0),
});

export const updateModuleSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  content: z.string().min(1).max(50000).optional(),
  order: z.number().int().min(0).optional(),
});

// Enrollment
export const enrollSchema = z.object({
  courseId: z.string().cuid(),
});

// Progress
export const updateProgressSchema = z.object({
  completed: z.boolean(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
