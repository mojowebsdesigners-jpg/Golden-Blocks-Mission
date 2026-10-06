import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { deleteProject, listProjects } from '@/services/admin'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { CATEGORY_LABEL, STATUS_LABEL } from '@/data/site'
import { errorMessage, formatDate, thumbOf } from '@/lib/utils'
import { Badge, ConfirmDelete, EmptyState, PageHeader, useToast } from './ui'

export default function ProjectsAdmin() {
  const { data, loading, error, reload } = useAsync(listProjects, [])
  const toast = useToast()
  if (loading) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader
        title="Projects"
        description="Create, edit and publish construction, renovation and community projects. Changes appear on the website immediately."
        actions={<Link to="/admin/projects/new" className="btn-gold !py-2.5"><Plus className="h-4 w-4" /> <span>New project</span></Link>}
      />
      {!data?.length ? (
        <EmptyState>No projects yet. Create your first project.</EmptyState>
      ) : (
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 bg-coal">
              <tr className="field-label">
                <th className="p-3 font-normal">Project</th>
                <th className="p-3 font-normal">Category</th>
                <th className="p-3 font-normal">Status</th>
                <th className="p-3 font-normal">Visibility</th>
                <th className="p-3 font-normal">Updated</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="p-3">
                    <Link to={`/admin/projects/${p.id}`} className="flex items-center gap-3">
                      <img src={thumbOf(p.cover_image)} alt="" className="h-12 w-16 object-cover" />
                      <span>
                        <span className="block text-white hover:text-gold-bright">{p.title}</span>
                        <span className="text-xs text-muted">/{p.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="p-3 text-silver-light">{CATEGORY_LABEL[p.category]}</td>
                  <td className="p-3"><Badge tone={p.status === 'ongoing' ? 'gold' : p.status === 'completed' ? 'silver' : 'neutral'}>{STATUS_LABEL[p.status]}</Badge></td>
                  <td className="space-x-1 p-3">
                    {p.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}
                    {p.featured && <Badge tone="gold">Featured</Badge>}
                    {p.is_demo && <Badge tone="red">Demo</Badge>}
                  </td>
                  <td className="p-3 text-xs text-muted">{formatDate(p.updated_at, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="space-x-2 whitespace-nowrap p-3 text-right">
                    <Link to={`/admin/projects/${p.id}`} className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-gold-bright hover:underline">Edit</Link>
                    <ConfirmDelete
                      onConfirm={async () => {
                        try {
                          await deleteProject(p)
                          toast('Project deleted')
                          reload()
                        } catch (e) {
                          toast(errorMessage(e), 'error')
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
