export type ProjectCategory = 'construction' | 'renovation' | 'community'
export type ProjectStatus = 'planned' | 'ongoing' | 'completed'
export type EnquiryStatus = 'new' | 'in_progress' | 'resolved' | 'archived'
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'pledged'
export type PaymentMethod = 'mpesa' | 'card' | 'bank_transfer'
export type DonationFrequency = 'one_time' | 'monthly'
export type GalleryCategory =
  | 'architecture'
  | 'interiors'
  | 'construction'
  | 'renovation'
  | 'details'
  | 'community'
  | 'outreach'
  | 'volunteers'

export interface Project {
  id: string
  title: string
  slug: string
  summary: string | null
  description: string
  category: ProjectCategory
  location: string | null
  status: ProjectStatus
  cover_image: string | null
  objectives: string[]
  start_date: string | null
  completion_date: string | null
  featured: boolean
  published: boolean
  is_demo: boolean
  created_at: string
  updated_at: string
}

export interface ProjectImage {
  id: string
  project_id: string
  image_url: string
  caption: string | null
  display_order: number
  created_at: string
}

export interface ProjectUpdate {
  id: string
  project_id: string
  title: string
  content: string
  images: string[]
  published: boolean
  created_at: string
}

export interface GalleryItem {
  id: string
  title: string
  description: string | null
  image_url: string
  thumb_url: string | null
  category: GalleryCategory
  width: number | null
  height: number | null
  credit_author: string | null
  credit_license: string | null
  credit_source: string | null
  featured: boolean
  published: boolean
  display_order: number
  created_at: string
}

export interface Donation {
  id: string
  donor_name: string | null
  donor_email: string | null
  donor_phone: string | null
  anonymous: boolean
  amount: number
  currency: string
  frequency: DonationFrequency
  designation: string
  project_id: string | null
  payment_method: PaymentMethod
  payment_reference: string | null
  provider_reference: string | null
  payment_status: DonationStatus
  message: string | null
  verified_at: string | null
  created_at: string
}

export interface ContactMessage {
  id: string
  full_name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: EnquiryStatus
  created_at: string
}

export interface PartnershipEnquiry {
  id: string
  organisation_name: string | null
  contact_person: string
  email: string
  phone: string | null
  partnership_type: string
  message: string
  status: EnquiryStatus
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: 'admin' | 'editor' | 'user'
  created_at: string
}

/** Editable organisation details (site_settings table, key = 'organisation'). */
export interface SiteSettings {
  email: string | null
  phone: string | null
  address: string | null
  office_hours: string | null
  socials: { facebook?: string; instagram?: string; youtube?: string; x?: string; tiktok?: string; linkedin?: string }
  bank: { bank_name?: string; account_name?: string; account_number?: string; branch?: string; swift?: string } | null
  mpesa_paybill: { paybill?: string; account?: string } | null
  sda_logo_url: string | null
  partnership_statement: string | null
}

/** podcast_episodes table. `media_url` is a YouTube / Spotify / SoundCloud / Apple Podcasts link or a direct audio file. */
export interface PodcastEpisode {
  id: string
  title: string
  description: string | null
  media_url: string
  cover_image: string | null
  episode_number: number | null
  duration_minutes: number | null
  published_on: string | null
  published: boolean
  created_at: string
  updated_at: string
  /** Local preview content only (never stored in the database). */
  is_demo?: boolean
}

/** faqs table. */
export interface Faq {
  id: string
  question: string
  answer: string
  category: string
  display_order: number
  published: boolean
  created_at: string
  updated_at: string
}

/** sponsorship_programs table. `amount_label` is free text, e.g. "KES 2,000 / month". */
export interface SponsorshipProgram {
  id: string
  title: string
  summary: string | null
  description: string
  amount_label: string | null
  cover_image: string | null
  display_order: number
  published: boolean
  created_at: string
  updated_at: string
  /** Local preview content only (never stored in the database). */
  is_demo?: boolean
}
