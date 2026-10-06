import { createContext, lazy, Suspense, useContext, useEffect, useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { BarChart3, FolderKanban, HandCoins, Images, Inbox, LogOut, Menu, Settings, Users, X, Handshake, ExternalLink, Mic, CircleHelp, HeartHandshake } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { getMyProfile } from '@/services/admin'
import { Logo } from '@/components/common/Logo'
import { PageLoader } from '@/components/common/PageLoader'
import { Seo } from '@/components/common/Seo'
import { ToastProvider } from './ui'
import { AdminLogin, UpdatePassword } from './AdminLogin'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'

const Dashboard = lazy(() => import('./Dashboard'))
const ProjectsAdmin = lazy(() => import('./ProjectsAdmin'))
const ProjectEditor = lazy(() => import('./ProjectEditor'))
const GalleryAdmin = lazy(() => import('./GalleryAdmin'))
const PodcastAdmin = lazy(() => import('./PodcastAdmin'))
const FaqAdmin = lazy(() => import('./FaqAdmin'))
const SponsorshipAdmin = lazy(() => import('./SponsorshipAdmin'))
const DonationsAdmin = lazy(() => import('./DonationsAdmin'))
const InboxAdmin = lazy(() => import('./InboxAdmin'))
const SettingsAdmin = lazy(() => import('./SettingsAdmin'))
const TeamAdmin = lazy(() => import('./TeamAdmin'))

const AuthCtx = createContext<{ profile: Profile; isAdmin: boolean }>({ profile: {} as Profile, isAdmin: false })
// eslint-disable-next-line react-refresh/only-export-components
export const useAdmin = () => useContext(AuthCtx)

function SetupNotice() {
  return (
    <div className="grid min-h-dvh place-items-center bg-night p-6">
      <div className="max-w-lg border border-white/10 bg-coal p-8">
        <Logo />
        <h1 className="mt-8 font-serif text-3xl text-white">Connect Supabase to use the dashboard</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Set <code className="text-champagne">VITE_SUPABASE_URL</code> and <code className="text-champagne">VITE_SUPABASE_ANON_KEY</code> in your environment, run the SQL migrations, then reload this page. See <code className="text-champagne">docs/SETUP.md</code>.
        </p>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return setProfile(session === null ? null : undefined)
    getMyProfile().then(setProfile).catch(() => setProfile(null))
  }, [session])

  if (!isSupabaseConfigured) return <SetupNotice />
  if (session === undefined || (session && profile === undefined)) return <PageLoader label="Checking access" />
  if (recovery && session) return <UpdatePassword onDone={() => setRecovery(false)} />
  if (!session) return <AdminLogin />
  if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
    return (
      <div className="grid min-h-dvh place-items-center bg-night p-6 text-center">
        <Seo title="Admin" path="/admin" noindex />
        <div className="max-w-md">
          <Logo />
          <h1 className="mt-8 font-serif text-3xl text-white">Access not granted</h1>
          <p className="mt-4 text-sm text-muted">Your account ({session.user.email}) is signed in but has not been given an administrator or editor role. Ask an existing administrator to grant access.</p>
          <button onClick={() => supabase!.auth.signOut()} className="btn-dark mt-8">Sign out</button>
        </div>
      </div>
    )
  }

  return (
    <AuthCtx.Provider value={{ profile, isAdmin: profile.role === 'admin' }}>
      <ToastProvider>
        <Seo title="Admin" path="/admin" noindex />
        <AdminLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<ProjectsAdmin />} />
              <Route path="projects/new" element={<ProjectEditor />} />
              <Route path="projects/:id" element={<ProjectEditor />} />
              <Route path="gallery" element={<GalleryAdmin />} />
              <Route path="sponsorship" element={<SponsorshipAdmin />} />
              <Route path="podcast" element={<PodcastAdmin />} />
              <Route path="faqs" element={<FaqAdmin />} />
              <Route path="messages" element={<InboxAdmin kind="messages" />} />
              <Route path="enquiries" element={<InboxAdmin kind="enquiries" />} />
              {profile.role === 'admin' && (
                <>
                  <Route path="donations" element={<DonationsAdmin />} />
                  <Route path="settings" element={<SettingsAdmin />} />
                  <Route path="team" element={<TeamAdmin />} />
                </>
              )}
              <Route path="*" element={<p className="text-muted">Page not found.</p>} />
            </Routes>
          </Suspense>
        </AdminLayout>
      </ToastProvider>
    </AuthCtx.Provider>
  )
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, isAdmin } = useAdmin()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const links = [
    { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
    { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { to: '/admin/gallery', label: 'Gallery', icon: Images },
    { to: '/admin/sponsorship', label: 'Sponsorship', icon: HeartHandshake },
    { to: '/admin/podcast', label: 'Podcast', icon: Mic },
    { to: '/admin/faqs', label: 'FAQs', icon: CircleHelp },
    ...(isAdmin ? [{ to: '/admin/donations', label: 'Donations', icon: HandCoins }] : []),
    { to: '/admin/messages', label: 'Messages', icon: Inbox },
    { to: '/admin/enquiries', label: 'Partnerships', icon: Handshake },
    ...(isAdmin ? [{ to: '/admin/settings', label: 'Settings', icon: Settings }, { to: '/admin/team', label: 'Team', icon: Users }] : []),
  ]
  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 text-sm transition-colors', isActive ? 'bg-gold/10 text-gold-bright' : 'text-silver-light/80 hover:bg-white/5 hover:text-white')}
        >
          <l.icon className="h-4 w-4" strokeWidth={1.5} /> {l.label}
        </NavLink>
      ))}
    </nav>
  )
  return (
    <div className="min-h-dvh bg-night lg:grid lg:grid-cols-[250px_1fr]" data-lenis-prevent>
      <aside className="hidden border-r border-white/10 bg-ink p-5 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <Logo />
        <p className="mb-6 mt-2 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-silver/60">Dashboard</p>
        {nav}
        <div className="mt-auto space-y-3 border-t border-white/10 pt-4 text-xs text-muted">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><ExternalLink className="h-3.5 w-3.5" /> View website</a>
          <p className="truncate">{profile.email}</p>
          <p><span className="font-mono uppercase tracking-[0.15em] text-champagne">{profile.role}</span></p>
          <button onClick={async () => { await supabase!.auth.signOut(); navigate('/admin') }} className="flex items-center gap-2 hover:text-white"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
        </div>
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-ink/95 px-4 backdrop-blur lg:hidden">
        <Logo compact />
        <button onClick={() => setOpen(true)} aria-label="Open admin menu" className="p-2 text-white"><Menu className="h-5 w-5" /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink p-5 lg:hidden" role="dialog" aria-modal="true">
          <div className="mb-8 flex items-center justify-between"><Logo /><button onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5 text-white" /></button></div>
          {nav}
          <button onClick={() => supabase!.auth.signOut()} className="mt-8 flex items-center gap-2 px-3 text-sm text-muted"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      )}
      <main className="min-w-0 p-4 md:p-8 lg:p-10">{children}</main>
    </div>
  )
}
