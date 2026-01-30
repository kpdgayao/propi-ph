import { z } from "zod";

// ============================================
// AUTH VALIDATIONS
// ============================================

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .min(10, "Invalid phone number")
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  prcLicense: z
    .string()
    .min(5, "Invalid PRC license number")
    .max(20)
    .regex(/^[A-Z0-9\-]+$/i, "Invalid PRC license format"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// PROPERTY VALIDATIONS
// ============================================

export const propertyTypeEnum = z.enum([
  "HOUSE",
  "CONDO",
  "TOWNHOUSE",
  "APARTMENT",
  "LOT",
  "COMMERCIAL",
  "WAREHOUSE",
  "FARM",
]);

export const transactionTypeEnum = z.enum(["SALE", "RENT"]);

export const furnishingEnum = z.enum([
  "UNFURNISHED",
  "SEMI_FURNISHED",
  "FULLY_FURNISHED",
]);

export const createListingSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title too long"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000),
  propertyType: propertyTypeEnum,
  transactionType: transactionTypeEnum,
  price: z.number().positive("Price must be positive"),

  // Location
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  barangay: z.string().optional(),
  address: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Specifications
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  carpark: z.number().int().min(0).optional(),
  lotArea: z.number().positive().optional(),
  floorArea: z.number().positive().optional(),
  floors: z.number().int().min(1).optional(),
  yearBuilt: z.number().int().min(1900).max(2030).optional(),

  // Features
  features: z.array(z.string()).default([]),
  furnishing: furnishingEnum.optional(),

  // Co-Brokerage
  allowCoBroke: z.boolean().default(true),
  coBrokeSplit: z.number().min(0).max(100).default(50),
});

export const updateListingSchema = createListingSchema.partial();

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;

// ============================================
// AGENT PROFILE VALIDATIONS
// ============================================

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^[0-9+\-\s()]+$/)
    .optional(),
  photo: z.string().url().optional(),
  bio: z.string().max(1000).optional(),
  areasServed: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  defaultSplit: z.number().min(0).max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
