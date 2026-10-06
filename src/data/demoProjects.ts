import type { Project, ProjectImage, ProjectUpdate } from '@/types'

/**
 * DEMONSTRATION CONTENT ONLY.
 * Shown solely when the Supabase backend is not yet connected, so the layout
 * can be reviewed. Every item is flagged `is_demo` and rendered with a visible
 * "Demonstration" label. Real projects are created in /admin and replace these.
 * No locations, dates, budgets or outcomes are claimed.
 */
const base = {
  published: true,
  is_demo: true,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
  start_date: null,
  completion_date: null,
  location: 'Location to be confirmed',
}

export const DEMO_PROJECTS: Project[] = [
  {
    ...base,
    id: 'demo-1',
    slug: 'demo-new-sanctuary',
    title: 'New Sanctuary Construction',
    summary: 'Sample layout for a ground-up church construction project.',
    description:
      'This is a demonstration entry that shows how a construction project will appear on the website. Once the organisation publishes a real project from the admin dashboard, its verified description, location, photographs and progress updates will replace this text.',
    category: 'construction',
    status: 'ongoing',
    cover_image: '/images/gallery/construction-rising-frame.webp',
    objectives: [
      'Example objective — complete foundation and structural frame',
      'Example objective — enclose the building and install roofing',
      'Example objective — finish interior and dedicate the sanctuary',
    ],
    featured: true,
  },
  {
    ...base,
    id: 'demo-2',
    slug: 'demo-sanctuary-renovation',
    title: 'Sanctuary Renovation',
    summary: 'Sample layout for restoring an existing church building.',
    description:
      'A demonstration renovation project. Real renovation projects will document the condition of the existing structure, the planned works and verified progress, all managed from the admin dashboard.',
    category: 'renovation',
    status: 'planned',
    cover_image: '/images/gallery/renovation-scaffold-arches.webp',
    objectives: ['Example objective — structural assessment', 'Example objective — roof and wall repairs', 'Example objective — interior refurbishment'],
    featured: true,
  },
  {
    ...base,
    id: 'demo-3',
    slug: 'demo-community-outreach-centre',
    title: 'Community Outreach Programme',
    summary: 'Sample layout for a church-led community initiative.',
    description:
      'A demonstration community initiative. This is where the organisation will describe real outreach programmes run through partner congregations once details are published.',
    category: 'community',
    status: 'planned',
    cover_image: '/images/gallery/outreach-shared-meal.webp',
    objectives: ['Example objective — identify community needs with the local church', 'Example objective — launch the programme'],
    featured: true,
  },
  {
    ...base,
    id: 'demo-4',
    slug: 'demo-completed-chapel',
    title: 'Chapel Completion',
    summary: 'Sample layout for a completed project.',
    description: 'A demonstration of how a completed project and its dedication will be presented.',
    category: 'construction',
    status: 'completed',
    cover_image: '/images/gallery/interiors-timber-cross.webp',
    objectives: ['Example objective — dedication service'],
    featured: false,
  },
]

export const DEMO_PROJECT_IMAGES: Record<string, ProjectImage[]> = {
  'demo-1': [
    'construction-laying-blocks', 'construction-blockwork', 'construction-mixing-mortar', 'construction-foundation',
  ].map((n, i) => ({ id: `d1-${i}`, project_id: 'demo-1', image_url: `/images/gallery/${n}.webp`, caption: 'Illustrative image', display_order: i, created_at: base.created_at })),
  'demo-2': ['renovation-scaffold-interior', 'renovation-brick-restoration', 'renovation-scaffold-wall'].map((n, i) => ({
    id: `d2-${i}`, project_id: 'demo-2', image_url: `/images/gallery/${n}.webp`, caption: 'Illustrative image', display_order: i, created_at: base.created_at,
  })),
}

export const DEMO_PROJECT_UPDATES: Record<string, ProjectUpdate[]> = {
  'demo-1': [
    {
      id: 'du-1',
      project_id: 'demo-1',
      title: 'Example update',
      content: 'Project updates published from the admin dashboard will appear here as a timeline, with optional photographs.',
      images: [],
      published: true,
      created_at: base.created_at,
    },
  ],
}
