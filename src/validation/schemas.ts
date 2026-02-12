import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .min(5, 'Email must be at least 5 characters')
        .max(255, 'Email must be at most 255 characters'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(50, 'Password must be at most 50 characters'),
});

export const registerSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .min(5, 'Email must be at least 5 characters')
        .max(255, 'Email must be at most 255 characters'),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password must be at most 100 characters'),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters'),
    type: z
        .string()
        .max(100, 'type must be at most 100 characters'),
    mobileNumber: z
        .number()  // Changed from z.Number() to z.number()
        .int('Mobile number must be an integer')
        .refine((val) => val.toString().length === 10, {
            message: 'Mobile number must be exactly 10 digits'
        }),
});// Medicine validation schemas
export const medicineSearchSchema = z.object({
    query: z
        .string()
        .min(1, 'Search query must be at least 1 character')
        .max(100, 'Search query must be at most 100 characters'),
});

export const medicineCreateSchema = z.object({
    name: z
        .string()
        .min(2, 'Medicine name must be at least 2 characters')
        .max(200, 'Medicine name must be at most 200 characters'),
    dosage: z
        .string()
        .min(1, 'Dosage must be at least 1 character')
        .max(50, 'Dosage must be at most 50 characters'),
    type: z
        .string()
        .min(2, 'Type must be at least 2 characters')
        .max(50, 'Type must be at most 50 characters'),
    manufacturer: z
        .string()
        .max(100, 'Manufacturer must be at most 100 characters')
        .optional(),
});

// Patient validation schemas
export const patientSchema = z.object({
    patientId: z
        .string()
        .min(1, 'Patient ID must be at least 1 character')
        .max(50, 'Patient ID must be at most 50 characters'),
    name: z
        .string()
        .min(2, 'Patient name must be at least 2 characters')
        .max(100, 'Patient name must be at most 100 characters'),
});

// Timing validation
export const timingTypeSchema = z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'CUSTOM']);

export const customTimeSchema = z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM');

export const prescriptionTimingSchema = z.object({
    timingType: timingTypeSchema,
    customTime: customTimeSchema.optional(),
}).refine(
    (data) => {
        // If timing type is CUSTOM, customTime is required
        if (data.timingType === 'CUSTOM') {
            return data.customTime !== undefined && data.customTime !== '';
        }
        return true;
    },
    { message: 'Custom time is required when timing type is CUSTOM' }
);

// Prescription validation schemas
export const prescriptionCreateSchema = z.object({
    patientId: z
        .string()
        .min(1, 'Patient ID is required')
        .max(50, 'Patient ID must be at most 50 characters'),
    patientName: z
        .string()
        .min(2, 'Patient name must be at least 2 characters')
        .max(100, 'Patient name must be at most 100 characters'),
    patientMobileNumber: z
        .number()
        .int('Mobile number must be an integer')
        .refine((val) => val.toString().length === 10, {
            message: 'Mobile number must be exactly 10 digits'
        }),
    patientProblem: z
        .string()
        .min(1, 'Patient problem/condition is required')
        .max(500, 'Problem description must be at most 500 characters'),
    medicineId: z
        .string()
        .min(1, 'Medicine ID is required'),
    timings: z
        .array(prescriptionTimingSchema)
        .min(1, 'At least one timing must be selected')
        .max(10, 'Cannot have more than 10 timings'),
    notes: z
        .string()
        .max(500, 'Notes must be at most 500 characters')
        .optional(),
});


// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MedicineSearchInput = z.infer<typeof medicineSearchSchema>;
export type MedicineCreateInput = z.infer<typeof medicineCreateSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type PrescriptionTimingInput = z.infer<typeof prescriptionTimingSchema>;
export type PrescriptionCreateInput = z.infer<typeof prescriptionCreateSchema>;
