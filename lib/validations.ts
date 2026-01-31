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
  headline: z.string().max(200).optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  socialLinks: z
    .object({
      facebook: z.string().url().optional().or(z.literal("")),
      linkedin: z.string().url().optional().or(z.literal("")),
      instagram: z.string().url().optional().or(z.literal("")),
      website: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  areasServed: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  defaultSplit: z.number().min(0).max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================
// INQUIRY VALIDATIONS
// ============================================

export const inquiryStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "VIEWING_SCHEDULED",
  "NEGOTIATING",
  "CONVERTED",
  "CLOSED",
]);

export const createInquirySchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Invalid phone number")
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
});

export const updateInquirySchema = z.object({
  status: inquiryStatusEnum.optional(),
  notes: z.string().max(5000).optional(),
  contactedAt: z.string().datetime().optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryInput = z.infer<typeof updateInquirySchema>;

// ============================================
// MESSAGE VALIDATIONS
// ============================================

export const createConversationSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  propertyId: z.string().optional(),
  initialMessage: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message too long"),
});

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message too long"),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ============================================
// USER (BUYER) VALIDATIONS
// ============================================

export const userRegisterSchema = z.object({
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
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^[0-9+\-\s()]+$/)
    .optional()
    .or(z.literal("")),
  preferredLocations: z.array(z.string()).optional(),
  preferredTypes: z.array(propertyTypeEnum).optional(),
  minBudget: z.number().positive().optional(),
  maxBudget: z.number().positive().optional(),
});

export const savedSearchSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  query: z.object({
    q: z.string().optional(),
    type: propertyTypeEnum.optional(),
    transaction: transactionTypeEnum.optional(),
    location: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    beds: z.number().int().min(0).optional(),
    baths: z.number().int().min(0).optional(),
  }),
  alertsOn: z.boolean().default(true),
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type SavedSearchInput = z.infer<typeof savedSearchSchema>;

// ============================================
// ADMIN VALIDATIONS
// ============================================

export const adminRoleEnum = z.enum(["SUPER_ADMIN", "ADMIN", "MODERATOR"]);

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(12, "Admin password must be at least 12 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  role: adminRoleEnum.default("MODERATOR"),
});

export const updateAgentStatusSchema = z.object({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

export const moderateListingSchema = z.object({
  isFeatured: z.boolean().optional(),
  isFlagged: z.boolean().optional(),
  flagReason: z.string().max(500).optional(),
  status: z.enum(["AVAILABLE", "UNLISTED"]).optional(),
});

export const updateAdminSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: adminRoleEnum.optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(12, "Admin password must be at least 12 characters").optional(),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type UpdateAgentStatusInput = z.infer<typeof updateAgentStatusSchema>;
export type ModerateListingInput = z.infer<typeof moderateListingSchema>;
