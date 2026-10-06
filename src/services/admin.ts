import { MEDIA_BUCKET, requireSupabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type {
  ContactMessage,
  Donation,
  DonationStatus,
  EnquiryStatus,
  Faq,
  GalleryItem,
  PartnershipEnquiry,
  PodcastEpisode,
  Profile,
  Project,
  ProjectImage,
  ProjectUpdate,
  SiteSettings,
  SponsorshipProgram,
} from '@/types'

/**
 * Admin data access. Every call runs with the signed-in user's JWT; the
 * database's RLS policies decide what is permitted — hiding UI is never
 * the security boundary.
 */

const sb = () => requireSupabase()
function check<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message)
  return r.data as T
}

// ── Auth ───────────────────────────────────────────────────────────────
export async function getMyProfile(): Promise<Profile | null> {
  const { data: u } = await sb().auth.getUser()
  if (!u.user) return null
  return check(await sb().from('profiles').select('*').eq('id', u.user.id).maybeSingle()) as Profile | null
}

// ── Dashboard ──────────────────────────────────────────────────────────
export interface DashboardStats {
  projects: number
  projects_published: number
  gallery: number
  messages_new: number
  enquiries_new: number
  donations: { completed_count: number; pending_count: number; totals: Record<string, number> } | null
}
export async function getDashboardStats(): Promise<DashboardStats> {
  return check(await sb().rpc('admin_dashboard_stats')) as DashboardStats
}

// ── Storage ────────────────────────────────────────────────────────────
/** Downscale + re-encode large images in the browser before upload (keeps originals crisp up to 2400px). */
async function optimise(file: File, max = 2400): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  if (scale === 1 && file.size < 1_500_000) return file
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), 'image/webp', 0.86))
}

export type MediaFolder = 'projects' | 'gallery' | 'updates' | 'brand' | 'podcast' | 'sponsorship'

export async function uploadImage(file: File, folder: MediaFolder): Promise<{ url: string; width: number; height: number }> {
  if (file.size > 25 * 1024 * 1024) throw new Error('Images must be smaller than 25 MB.')
  const blob = await optimise(file)
  const bmp = await createImageBitmap(blob)
  const ext = blob.type === 'image/webp' ? 'webp' : file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${slugify(file.name.replace(/\.[^.]+$/, '')) || 'image'}.${ext}`
  const { error } = await sb().storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: blob.type || file.type, cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message)
  const { data } = sb().storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, width: bmp.width, height: bmp.height }
}

/** Remove a file we previously uploaded (ignored for bundled /images assets). */
export async function deleteStoredImage(url: string | null | undefined) {
  if (!url) return
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`
  const i = url.indexOf(marker)
  if (i === -1) return
  await sb().storage.from(MEDIA_BUCKET).remove([decodeURIComponent(url.slice(i + marker.length))])
}

// ── Projects ───────────────────────────────────────────────────────────
export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>

export async function listProjects(): Promise<Project[]> {
  return check(await sb().from('projects').select('*').order('created_at', { ascending: false })) as Project[]
}
export async function getProject(id: string): Promise<Project> {
  return check(await sb().from('projects').select('*').eq('id', id).single()) as Project
}
export async function saveProject(input: ProjectInput, id?: string): Promise<Project> {
  const payload = { ...input, slug: slugify(input.slug || input.title) }
  const q = id ? sb().from('projects').update(payload).eq('id', id) : sb().from('projects').insert(payload)
  const r = await q.select('*').single()
  if (r.error?.code === '23505') throw new Error('Another project already uses this URL slug. Please choose a different one.')
  return check(r) as Project
}
export async function deleteProject(p: Project) {
  const imgs = await listProjectImages(p.id)
  check(await sb().from('projects').delete().eq('id', p.id))
  await Promise.all([deleteStoredImage(p.cover_image), ...imgs.map((i) => deleteStoredImage(i.image_url))])
}

export async function listProjectImages(projectId: string): Promise<ProjectImage[]> {
  return check(await sb().from('project_images').select('*').eq('project_id', projectId).order('display_order')) as ProjectImage[]
}
export async function addProjectImage(projectId: string, image_url: string, caption: string | null, display_order: number) {
  return check(await sb().from('project_images').insert({ project_id: projectId, image_url, caption, display_order }).select('*').single()) as ProjectImage
}
export async function updateProjectImage(id: string, patch: Partial<Pick<ProjectImage, 'caption' | 'display_order'>>) {
  check(await sb().from('project_images').update(patch).eq('id', id))
}
export async function deleteProjectImage(img: ProjectImage) {
  check(await sb().from('project_images').delete().eq('id', img.id))
  await deleteStoredImage(img.image_url)
}

export async function listProjectUpdates(projectId: string): Promise<ProjectUpdate[]> {
  return check(await sb().from('project_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false })) as ProjectUpdate[]
}
export async function saveProjectUpdate(input: Pick<ProjectUpdate, 'project_id' | 'title' | 'content' | 'images' | 'published'>, id?: string) {
  const q = id ? sb().from('project_updates').update(input).eq('id', id) : sb().from('project_updates').insert(input)
  return check(await q.select('*').single()) as ProjectUpdate
}
export async function deleteProjectUpdate(u: ProjectUpdate) {
  check(await sb().from('project_updates').delete().eq('id', u.id))
  await Promise.all(u.images.map(deleteStoredImage))
}

// ── Gallery ────────────────────────────────────────────────────────────
export async function listGallery(): Promise<GalleryItem[]> {
  return check(await sb().from('gallery').select('*').order('display_order').order('created_at')) as GalleryItem[]
}
export async function saveGalleryItem(input: Partial<GalleryItem>, id?: string) {
  const q = id ? sb().from('gallery').update(input).eq('id', id) : sb().from('gallery').insert(input)
  return check(await q.select('*').single()) as GalleryItem
}
export async function deleteGalleryItem(g: GalleryItem) {
  check(await sb().from('gallery').delete().eq('id', g.id))
  await deleteStoredImage(g.image_url)
}

// ── Podcast, FAQs, sponsorship (same pattern as the gallery) ───────────
type Row = { id: string }
function crud<T extends Row>(table: string, order: [string, boolean][], imageField?: keyof T) {
  return {
    list: async (): Promise<T[]> => {
      let q = sb().from(table).select('*')
      for (const [col, ascending] of order) q = q.order(col, { ascending, nullsFirst: false })
      return check(await q) as T[]
    },
    save: async (input: Partial<T>, id?: string): Promise<T> => {
      const row = input as Record<string, unknown>
      const q = id ? sb().from(table).update(row).eq('id', id) : sb().from(table).insert(row)
      return check(await q.select('*').single()) as T
    },
    remove: async (row: T) => {
      check(await sb().from(table).delete().eq('id', row.id))
      if (imageField) await deleteStoredImage(row[imageField] as string | null)
    },
  }
}
export const podcastAdmin = crud<PodcastEpisode>('podcast_episodes', [['published_on', false], ['created_at', false]], 'cover_image')
export const faqAdmin = crud<Faq>('faqs', [['display_order', true], ['created_at', true]])
export const sponsorshipAdmin = crud<SponsorshipProgram>('sponsorship_programs', [['display_order', true], ['created_at', true]], 'cover_image')

// ── Donations ──────────────────────────────────────────────────────────
export async function listDonations(status?: DonationStatus | 'all'): Promise<Donation[]> {
  let q = sb().from('donations').select('*').order('created_at', { ascending: false }).limit(1000)
  if (status && status !== 'all') q = q.eq('payment_status', status)
  return check(await q) as Donation[]
}
/** Used to confirm bank-transfer pledges once funds are seen, or to annotate failures. */
export async function setDonationStatus(id: string, status: DonationStatus) {
  check(await sb().from('donations').update({ payment_status: status, verified_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', id))
}

// ── Enquiries ──────────────────────────────────────────────────────────
export async function listMessages(): Promise<ContactMessage[]> {
  return check(await sb().from('contact_messages').select('*').order('created_at', { ascending: false }).limit(1000)) as ContactMessage[]
}
export async function listEnquiries(): Promise<PartnershipEnquiry[]> {
  return check(await sb().from('partnership_enquiries').select('*').order('created_at', { ascending: false }).limit(1000)) as PartnershipEnquiry[]
}
export async function setEnquiryStatus(table: 'contact_messages' | 'partnership_enquiries', id: string, status: EnquiryStatus) {
  check(await sb().from(table).update({ status }).eq('id', id))
}
export async function deleteEnquiry(table: 'contact_messages' | 'partnership_enquiries', id: string) {
  check(await sb().from(table).delete().eq('id', id))
}

// ── Settings & team ────────────────────────────────────────────────────
export async function saveSettings(value: SiteSettings) {
  const { data: u } = await sb().auth.getUser()
  check(await sb().from('site_settings').upsert({ key: 'organisation', value, updated_by: u.user?.id ?? null }))
}
export async function listTeam(): Promise<Profile[]> {
  return check(await sb().from('profiles').select('*').in('role', ['admin', 'editor']).order('created_at')) as Profile[]
}
export async function setRole(email: string, role: Profile['role']) {
  check(await sb().rpc('admin_set_role', { target_email: email, new_role: role }))
}
