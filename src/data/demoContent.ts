import type { PodcastEpisode, SponsorshipProgram } from '@/types'

/**
 * DEMONSTRATION CONTENT ONLY — same rules as demoProjects.ts.
 * Shown solely when the Supabase backend is not connected, so the layouts can be reviewed.
 * Every item is flagged `is_demo` and rendered with a visible "Demonstration" label.
 * No amounts, dates, guests or outcomes are claimed; real items are added in /admin.
 */
const stamp = { published: true, is_demo: true, created_at: '2026-10-05T00:00:00Z', updated_at: '2026-10-05T00:00:00Z' }

export const DEMO_SPONSORSHIP: SponsorshipProgram[] = [
  {
    ...stamp,
    id: 'demo-sp-1',
    title: 'Sponsor a Block',
    summary: 'Example programme.',
    description: '',
    amount_label: 'Amount to be confirmed',
    cover_image: '/images/gallery/construction-laying-blocks-sm.webp',
    display_order: 1,
  },
  {
    ...stamp,
    id: 'demo-sp-2',
    title: 'Sponsor a Roof',
    summary: 'Example programme.',
    description: '',
    amount_label: 'Amount to be confirmed',
    cover_image: '/images/gallery/construction-rising-frame-sm.webp',
    display_order: 2,
  },
  {
    ...stamp,
    id: 'demo-sp-3',
    title: 'Sponsor Outreach & Youth Ministry',
    summary: 'Example programme.',
    description: '',
    amount_label: 'Amount to be confirmed',
    cover_image: '/images/gallery/outreach-smiling-child-sm.webp',
    display_order: 3,
  },
]

export const DEMO_PODCAST: PodcastEpisode[] = [
  {
    ...stamp,
    id: 'demo-pod-1',
    title: 'Sample episode',
    description: '',
    media_url: '',
    cover_image: '/images/gallery/interiors-light-beam-sm.webp',
    episode_number: 1,
    duration_minutes: null,
    published_on: null,
  },
  {
    ...stamp,
    id: 'demo-pod-2',
    title: 'Sample episode two',
    description: '',
    media_url: '',
    cover_image: '/images/gallery/interiors-timber-cross-sm.webp',
    episode_number: 2,
    duration_minutes: null,
    published_on: null,
  },
]
