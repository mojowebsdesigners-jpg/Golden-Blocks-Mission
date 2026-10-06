import { z } from 'zod'

const phone = z
  .string()
  .trim()
  .max(24)
  .refine((v) => !v || /^[+()\d\s-]{7,24}$/.test(v), 'Enter a valid phone number')
  .optional()
  .or(z.literal(''))

export const contactSchema = z.object({
  full_name: z.string().trim().min(2, 'Please enter your full name').max(120),
  email: z.string().trim().email('Enter a valid email address').max(160),
  phone,
  subject: z.string().trim().min(3, 'Please add a subject').max(160),
  message: z.string().trim().min(10, 'Your message should be at least 10 characters').max(4000),
  website: z.string().max(0).optional(),
})
export type ContactValues = z.infer<typeof contactSchema>

export const partnershipSchema = z.object({
  organisation_name: z.string().trim().max(160).optional().or(z.literal('')),
  contact_person: z.string().trim().min(2, 'Please enter a contact name').max(120),
  email: z.string().trim().email('Enter a valid email address').max(160),
  phone,
  partnership_type: z.string().min(1, 'Choose how you would like to be involved'),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)').max(4000),
  website: z.string().max(0).optional(),
})
export type PartnershipValues = z.infer<typeof partnershipSchema>
