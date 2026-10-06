import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { PageLoader } from '@/components/common/PageLoader'
import { RouteError } from '@/pages/RouteError'

// Each page is its own chunk so heavy 3D only loads where it is used.
const page = (loader: () => Promise<{ default: ComponentType }>) => {
  const C = lazy(loader)
  return <C />
}

const Home = () => import('@/pages/Home')
const About = () => import('@/pages/About')
const Mission = () => import('@/pages/Mission')
const Projects = () => import('@/pages/Projects')
const FeaturedProjects = () => import('@/pages/FeaturedProjects')
const Sponsorship = () => import('@/pages/Sponsorship')
const Podcast = () => import('@/pages/Podcast')
const Faqs = () => import('@/pages/Faqs')
const ProjectDetail = () => import('@/pages/ProjectDetail')
const Gallery = () => import('@/pages/Gallery')
const GetInvolved = () => import('@/pages/GetInvolved')
const Donate = () => import('@/pages/Donate')
const ThankYou = () => import('@/pages/ThankYou')
const Contact = () => import('@/pages/Contact')
const Legal = () => import('@/pages/Legal')
const Credits = () => import('@/pages/Credits')
const Acknowledgments = () => import('@/pages/Acknowledgments')
const NotFound = () => import('@/pages/NotFound')

const AdminApp = lazy(() => import('@/pages/admin/AdminApp'))

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: page(Home) },
      { path: '/about', element: page(About) },
      { path: '/mission', element: page(Mission) },
      { path: '/projects', element: page(Projects) },
      { path: '/projects/:slug', element: page(ProjectDetail) },
      { path: '/featured-projects', element: page(FeaturedProjects) },
      { path: '/sponsorship', element: page(Sponsorship) },
      { path: '/podcast', element: page(Podcast) },
      { path: '/faqs', element: page(Faqs) },
      { path: '/gallery', element: page(Gallery) },
      { path: '/get-involved', element: page(GetInvolved) },
      { path: '/donate', element: page(Donate) },
      { path: '/donate/thank-you', element: page(ThankYou) },
      { path: '/contact', element: page(Contact) },
      { path: '/privacy', element: page(Legal) },
      { path: '/terms', element: page(Legal) },
      { path: '/acknowledgments', element: page(Acknowledgments) },
      { path: '/credits', element: page(Credits) },
      { path: '*', element: page(NotFound) },
    ],
  },
  {
    path: '/admin/*',
    errorElement: <RouteError />,
    element: (
      // The dashboard keeps the dark grey scheme it was designed in.
      <div className="theme-dark min-h-dvh bg-night">
        <Suspense fallback={<PageLoader label="Loading dashboard" />}>
          <AdminApp />
        </Suspense>
      </div>
    ),
  },
])
