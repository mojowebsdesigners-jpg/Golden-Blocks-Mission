import type { SupabaseClient } from '@supabase/supabase-js'
import type { Faq, GalleryItem, PodcastEpisode, Project, ProjectImage, ProjectUpdate, SiteSettings, SponsorshipProgram } from '@/types'

const configured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

/** Loads the Supabase SDK on demand so it never blocks first paint. */
async function db(): Promise<SupabaseClient | null> {
  if (!configured) return null
  return (await import('@/lib/supabase')).supabase
}
const demo = () => import('@/data/demoProjects')
const localGallery = async () => (await import('@/data/gallery')).LOCAL_GALLERY

/**
 * Public content readers. When Supabase is connected these return live,
 * RLS-filtered (published-only) data. When it is not connected yet, they
 * fall back to the curated local gallery and clearly-labelled demo projects
 * so the site remains reviewable.
 */

export async function getProjects(): Promise<Project[]> {
  const supabase = await db()
  if (!supabase) return (await demo()).DEMO_PROJECTS
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const supabase = await db()
  if (!supabase) return (await demo()).DEMO_PROJECTS.filter((p) => p.featured).slice(0, limit)
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as Project[]
}

export interface ProjectDetail {
  project: Project
  images: ProjectImage[]
  updates: ProjectUpdate[]
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const supabase = await db()
  if (!supabase) {
    const { DEMO_PROJECTS, DEMO_PROJECT_IMAGES, DEMO_PROJECT_UPDATES } = await demo()
    const project = DEMO_PROJECTS.find((p) => p.slug === slug)
    if (!project) return null
    return { project, images: DEMO_PROJECT_IMAGES[project.id] ?? [], updates: DEMO_PROJECT_UPDATES[project.id] ?? [] }
  }
  const { data: project, error } = await supabase.from('projects').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  if (error) throw error
  if (!project) return null
  const [imgs, ups] = await Promise.all([
    supabase.from('project_images').select('*').eq('project_id', project.id).order('display_order'),
    supabase.from('project_updates').select('*').eq('project_id', project.id).eq('published', true).order('created_at', { ascending: false }),
  ])
  if (imgs.error) throw imgs.error
  if (ups.error) throw ups.error
  return { project: project as Project, images: (imgs.data ?? []) as ProjectImage[], updates: (ups.data ?? []) as ProjectUpdate[] }
}

export async function getGallery(): Promise<GalleryItem[]> {
  const supabase = await db()
  if (!supabase) return localGallery()
  const { data, error } = await supabase.from('gallery').select('*').eq('published', true).order('display_order').order('created_at')
  if (error) throw error
  // If the gallery table has not been seeded yet, keep the curated local set visible.
  return data && data.length ? (data as GalleryItem[]) : localGallery()
}

const demoContent = () => import('@/data/demoContent')

export async function getPodcastEpisodes(): Promise<PodcastEpisode[]> {
  const supabase = await db()
  if (!supabase) return (await demoContent()).DEMO_PODCAST
  const { data, error } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('published', true)
    .order('published_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as PodcastEpisode[]
}

export async function getFaqs(): Promise<Faq[]> {
  const supabase = await db()
  if (!supabase) return (await import('@/data/faqs')).LOCAL_FAQS
  const { data, error } = await supabase.from('faqs').select('*').eq('published', true).order('display_order').order('created_at')
  if (error) throw error
  return (data ?? []) as Faq[]
}

export async function getSponsorshipPrograms(): Promise<SponsorshipProgram[]> {
  const supabase = await db()
  if (!supabase) return (await demoContent()).DEMO_SPONSORSHIP
  const { data, error } = await supabase.from('sponsorship_programs').select('*').eq('published', true).order('display_order').order('created_at')
  if (error) throw error
  return (data ?? []) as SponsorshipProgram[]
}

export const EMPTY_SETTINGS: SiteSettings = {
  email: null,
  phone: null,
  address: null,
  office_hours: null,
  socials: {},
  bank: null,
  mpesa_paybill: null,
  sda_logo_url: null,
  partnership_statement: null,
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await db()
  if (!supabase) return EMPTY_SETTINGS
  const { data, error } = await supabase.from('site_settings').select('value').eq('key', 'organisation').maybeSingle()
  if (error) throw error
  return { ...EMPTY_SETTINGS, ...((data?.value as Partial<SiteSettings>) ?? {}) }
}
