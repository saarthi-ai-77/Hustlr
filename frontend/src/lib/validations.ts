import { z } from 'zod';

// Client validation schemas
export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  company: z.string().max(100, 'Company name too long').optional(),
  email: z.string().email('Invalid email address'),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  twitter: z.string().max(50, 'Twitter handle too long').optional().or(z.literal('')),
  isGhostedInitial: z.boolean().optional(),
});

export const clientCreateSchema = clientSchema.omit({ isGhostedInitial: true });

// Project validation schemas
export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  status: z.enum(['Urgent AF', 'Chillin\'', 'Blocked']),
  dueDate: z.string().optional(),
  client_id: z.string().optional(),
});

export const projectCreateSchema = projectSchema;

// Invoice validation schemas
export const invoiceSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(100, 'Client name too long'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['Paid', 'Pending', 'Overdue']),
  project_id: z.string().optional(),
});

export const invoiceCreateSchema = invoiceSchema;

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type exports
export type ClientFormData = z.infer<typeof clientCreateSchema>;
export type ProjectFormData = z.infer<typeof projectCreateSchema>;
export type InvoiceFormData = z.infer<typeof invoiceCreateSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;