import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ExternalLink, X } from 'lucide-react'
import {
  addProjectImage,
  deleteProjectImage,
  deleteProjectUpdate,
  getProject,
  listProjectImages,
  listProjectUpdates,
  saveProject,
  saveProjectUpdate,
  updateProjectImage,
} from '@/services/admin'
import { useAsync } from '@/hooks/useAsync'
import { PageLoader, ErrorState } from '@/components/common/PageLoader'
import { SelectField, TextArea, TextField } from '@/components/forms/Field'
import { Button } from '@/components/ui/Button'
import { errorMessage, formatDate, slugify, thumbOf } from '@/lib/utils'
import type { Project, ProjectUpdate } from '@/types'
import { Badge, ConfirmDelete, EmptyState, ImageUpload, PageHeader, Panel, SmallButton, useToast } from './ui'

const schema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(160),
  slug: z.string().trim().max(80).optional(),
  summary: z.string().trim().max(400).optional(),
  description: z.string().trim().min(10, 'Add a description (at least 10 characters)'),
  category: z.enum(['construction', 'renovation', 'community']),
  status: z.enum(['planned', 'ongoing', 'completed']),
  location: z.string().trim().max(160).optional(),
  start_date: z.string().optional(),
  completion_date: z.string().optional(),
  objectives: z.string().optional(),
  featured: z.boolean(),
  published: z.boolean(),
  is_demo: z.boolean(),
})
type Values = z.infer<typeof schema>

export default function ProjectEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const existing = useAsync(() => (id ? getProject(id) : Promise.resolve(null)), [id])
  const [cover, setCover] = useState<string | null>(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'construction', status: 'planned', featured: false, published: false, is_demo: false },
  })

  useEffect(() => {
    const p = existing.data
    if (!p) return
    reset({
      title: p.title,
      slug: p.slug,
      summary: p.summary ?? '',
      description: p.description,
      category: p.category,
      status: p.status,
      location: p.location ?? '',
      start_date: p.start_date ?? '',
      completion_date: p.completion_date ?? '',
      objectives: p.objectives.join('\n'),
      featured: p.featured,
      published: p.published,
      is_demo: p.is_demo,
    })
    setCover(p.cover_image)
  }, [existing.data, reset])

  const title = watch('title')
  const slug = watch('slug')

  const onSubmit = async (v: Values) => {
    try {
      const saved = await saveProject(
        {
          title: v.title,
          slug: v.slug || slugify(v.title),
          summary: v.summary || null,
          description: v.description,
          category: v.category,
          status: v.status,
          location: v.location || null,
          start_date: v.start_date || null,
          completion_date: v.completion_date || null,
          objectives: (v.objectives ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
          featured: v.featured,
          published: v.published,
          is_demo: v.is_demo,
          cover_image: cover,
        },
        id,
      )
      toast(id ? 'Project saved' : 'Project created — you can now add images and updates')
      if (!id) navigate(`/admin/projects/${saved.id}`, { replace: true })
      else existing.reload()
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  if (existing.loading) return <PageLoader />
  if (existing.error) return <ErrorState message={existing.error.message} onRetry={existing.reload} />

  return (
    <>
      <Link to="/admin/projects" className="eyebrow mb-6 inline-flex items-center gap-2 text-silver hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> All projects</Link>
      <PageHeader
        title={id ? existing.data?.title ?? 'Edit project' : 'New project'}
        actions={existing.data?.published ? <a href={`/projects/${existing.data.slug}`} target="_blank" rel="noreferrer" className="btn-dark !py-2.5"><span>View live</span><ExternalLink className="h-3.5 w-3.5" /></a> : undefined}
      />

      {existing.data?.is_demo && (
        <p className="mb-6 border border-dashed border-champagne/40 px-4 py-3 text-sm text-champagne">This is demonstration content. Replace the text and images with real project information, then untick “Demonstration content” — or delete this project.</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 xl:grid-cols-3">
        <Panel title="Project details" className="xl:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Title" required error={errors.title?.message} wrapClassName="sm:col-span-2" {...register('title')} />
            <TextField label="URL slug" hint={`/projects/${slug || slugify(title || '') || 'project-name'}`} {...register('slug')} onBlur={(e) => setValue('slug', slugify(e.target.value))} />
            <TextField label="Location" placeholder="e.g. Town, County" {...register('location')} />
            <SelectField label="Category" options={[{ value: 'construction', label: 'Church construction' }, { value: 'renovation', label: 'Church renovation' }, { value: 'community', label: 'Community initiative' }]} {...register('category')} />
            <SelectField label="Status" options={[{ value: 'planned', label: 'Planned' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }]} {...register('status')} />
            <TextField label="Start date" type="date" {...register('start_date')} />
            <TextField label="Completion date" type="date" {...register('completion_date')} />
            <TextArea label="Short summary" rows={2} hint="Shown on cards (max 400 characters)" wrapClassName="sm:col-span-2" {...register('summary')} />
            <TextArea label="Description" required rows={8} error={errors.description?.message} wrapClassName="sm:col-span-2" {...register('description')} />
            <TextArea label="Objectives" rows={4} hint="One objective per line" wrapClassName="sm:col-span-2" {...register('objectives')} />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Cover image">
            {cover ? (
              <div className="relative">
                <img src={thumbOf(cover)} alt="Cover" className="aspect-[4/3] w-full object-cover" />
                <button type="button" onClick={() => setCover(null)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center bg-black/70 text-white" aria-label="Remove cover"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center border border-dashed border-white/15 text-xs text-muted">No cover image</div>
            )}
            <div className="mt-4"><ImageUpload folder="projects" label={cover ? 'Replace cover' : 'Upload cover'} onUploaded={(r) => setCover(r.url)} /></div>
          </Panel>
          <Panel title="Visibility">
            <div className="space-y-3 text-sm text-silver-light">
              <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-[#d4af37]" {...register('published')} /> Published on website</label>
              <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-[#d4af37]" {...register('featured')} /> Featured on homepage</label>
              <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-[#d4af37]" {...register('is_demo')} /> Demonstration content</label>
            </div>
          </Panel>
          <Button type="submit" loading={isSubmitting} className="w-full justify-between">{id ? 'Save changes' : 'Create project'}</Button>
        </div>
      </form>

      {id && existing.data && (
        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          <ImagesManager project={existing.data} />
          <UpdatesManager project={existing.data} />
        </div>
      )}
    </>
  )
}

function ImagesManager({ project }: { project: Project }) {
  const { data, reload } = useAsync(() => listProjectImages(project.id), [project.id])
  const toast = useToast()
  const images = data ?? []
  return (
    <Panel title="Project gallery">
      <div className="mb-5"><ImageUpload folder="projects" multiple label="Add images" onUploaded={async (r) => { await addProjectImage(project.id, r.url, null, images.length); reload() }} /></div>
      {!images.length ? (
        <EmptyState>No images yet.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {images.map((img) => (
            <li key={img.id} className="flex items-center gap-3 border border-white/10 p-2">
              <img src={thumbOf(img.image_url)} alt="" className="h-16 w-20 shrink-0 object-cover" />
              <input
                defaultValue={img.caption ?? ''}
                placeholder="Caption"
                aria-label="Caption"
                className="field !py-2 text-sm"
                onBlur={async (e) => { if (e.target.value !== (img.caption ?? '')) { await updateProjectImage(img.id, { caption: e.target.value || null }); toast('Caption saved') } }}
              />
              <input
                type="number"
                defaultValue={img.display_order}
                aria-label="Order"
                className="field !w-20 !py-2 text-sm"
                onBlur={async (e) => { await updateProjectImage(img.id, { display_order: Number(e.target.value) }); reload() }}
              />
              <ConfirmDelete label="" onConfirm={async () => { await deleteProjectImage(img); reload() }} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

function UpdatesManager({ project }: { project: Project }) {
  const { data, reload } = useAsync(() => listProjectUpdates(project.id), [project.id])
  const toast = useToast()
  const [editing, setEditing] = useState<ProjectUpdate | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [published, setPublished] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = (u: ProjectUpdate | null) => {
    setEditing(u)
    setTitle(u?.title ?? '')
    setContent(u?.content ?? '')
    setImages(u?.images ?? [])
    setPublished(u?.published ?? true)
  }

  const save = async () => {
    if (title.trim().length < 2 || content.trim().length < 5) return toast('Add a title and some content', 'error')
    setBusy(true)
    try {
      await saveProjectUpdate({ project_id: project.id, title: title.trim(), content: content.trim(), images, published }, editing?.id)
      toast(editing ? 'Update saved' : 'Update published')
      load(null)
      reload()
    } catch (e) {
      toast(errorMessage(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel title="Project updates">
      <div className="space-y-4 border border-white/10 p-4">
        <p className="field-label">{editing ? 'Edit update' : 'New update'}</p>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextArea label="Content" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((src) => (
              <span key={src} className="relative">
                <img src={src} alt="" className="h-16 w-16 object-cover" />
                <button type="button" onClick={() => setImages(images.filter((i) => i !== src))} className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center bg-black text-white" aria-label="Remove image"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <ImageUpload folder="updates" multiple label="Attach images" onUploaded={(r) => setImages((x) => [...x, r.url])} />
          <label className="flex items-center gap-2 text-sm text-silver-light"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="accent-[#d4af37]" /> Published</label>
          <SmallButton tone="gold" loading={busy} onClick={save}>{editing ? 'Save update' : 'Publish update'}</SmallButton>
          {editing && <SmallButton onClick={() => load(null)}>Cancel</SmallButton>}
        </div>
      </div>
      <ul className="mt-5 space-y-3">
        {(data ?? []).map((u) => (
          <li key={u.id} className="border border-white/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-white">{u.title} {!u.published && <Badge>Draft</Badge>}</p>
                <p className="text-xs text-muted">{formatDate(u.created_at, { day: 'numeric', month: 'short', year: 'numeric' })} · {u.images.length} image(s)</p>
              </div>
              <span className="flex shrink-0 gap-2">
                <SmallButton onClick={() => load(u)}>Edit</SmallButton>
                <ConfirmDelete label="" onConfirm={async () => { await deleteProjectUpdate(u); reload() }} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
