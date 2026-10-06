/**
 * Static editorial content. Organisation-specific facts (contact details,
 * bank details, projects, gallery) are NOT hard-coded here — they come from
 * Supabase and are editable in the admin dashboard.
 */

export const SITE = {
  name: 'Golden Blocks Mission',
  field: 'North East Kenya Field',
  tagline: 'Building His House. Advancing His Mission.',
  description:
    'Golden Blocks Mission, North East Kenya Field: the projects accomplished, underway and planned — building churches, hope, dignity and better lives, working closely with the Seventh-day Adventist Church.',
  url: (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://goldenblocksmission.org',
  founding_message: 'Bring your gold to the Father, so that together we may build places of worship that bring no shame to His name.',
  closing: 'To God be the glory.',
}

/** The organisation's welcome message, condensed for the homepage. */
export const WELCOME = {
  title: 'Welcome to Golden Blocks Mission — North East Kenya Field.',
  lede: 'Visibility, transparency and information about the work God has entrusted to us.',
  pillars: [
    { k: 'Accomplished', t: 'See what has been built.', to: '/projects?filter=completed' },
    { k: 'Underway', t: 'Follow the progress and the needs.', to: '/projects?filter=ongoing' },
    { k: 'Planned', t: 'Discover what comes next.', to: '/projects?filter=planned' },
  ],
  invitation: 'Not simply donors — partners in a mission of service, compassion and faith.',
}

/** Every public page — used by the full-screen menu and the footer. */
export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/mission', label: 'Our Mission' },
  { to: '/projects', label: 'Projects' },
  { to: '/featured-projects', label: 'Projects in Focus' },
  { to: '/sponsorship', label: 'Sponsorship' },
  { to: '/podcast', label: 'Podcast' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/get-involved', label: 'Get Involved' },
  { to: '/faqs', label: 'FAQs' },
  { to: '/acknowledgments', label: 'Acknowledgments' },
  { to: '/contact', label: 'Contact' },
] as const

/** The shorter set shown inline in the desktop header (the rest live in the menu). */
export const PRIMARY_NAV = [
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/sponsorship', label: 'Sponsorship' },
  { to: '/podcast', label: 'Podcast' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/acknowledgments', label: 'Shoutouts' },
  { to: '/contact', label: 'Contact' },
] as const

/**
 * Acknowledgments ("shoutouts"). Names are added only with the person's or
 * organisation's permission — none are invented here.
 */
export const ACKNOWLEDGMENT_GROUPS: { title: string; text: string; names: string[] }[] = [
  { title: 'Donors & Sponsors', text: 'Every gift, large or small.', names: [] },
  { title: 'Partner Churches', text: 'Congregations building alongside us.', names: [] },
  { title: 'Organisations & Businesses', text: 'Partners who sponsor and supply.', names: [] },
  { title: 'Volunteers', text: 'Hands on site and in the community.', names: [] },
  { title: 'Professionals', text: 'Skills given freely to the work.', names: [] },
  { title: 'Prayer Partners', text: 'Those who carry the work in prayer.', names: [] },
]

export const MISSION_AREAS = [
  {
    slug: 'construction',
    index: '01',
    title: 'Church Construction',
    short: 'New houses of worship, built to last.',
    image: '/images/gallery/construction-laying-blocks.webp',
    to: '/mission#construction',
  },
  {
    slug: 'renovation',
    index: '02',
    title: 'Church Renovation',
    short: 'Ageing churches, made safe and welcoming.',
    image: '/images/gallery/renovation-scaffold-interior.webp',
    to: '/mission#renovation',
  },
  {
    slug: 'evangelism',
    index: '03',
    title: 'Evangelism & Mission',
    short: 'Every building, a living centre of faith.',
    image: '/images/gallery/community-choir.webp',
    to: '/mission#evangelism',
  },
  {
    slug: 'outreach',
    index: '04',
    title: 'Community Outreach',
    short: 'Compassion beyond the church walls.',
    image: '/images/gallery/outreach-shared-meal.webp',
    to: '/mission#outreach',
  },
  {
    slug: 'youth',
    index: '05',
    title: "Youth & Children's Development",
    short: 'Mentoring the next generation.',
    image: '/images/gallery/outreach-classroom.webp',
    to: '/mission#youth',
  },
  {
    slug: 'congregations',
    index: '06',
    title: 'Supporting Local Congregations',
    short: 'Walking alongside local churches.',
    image: '/images/gallery/community-congregation.webp',
    to: '/mission#partnership',
  },
] as const

export const VALUES = [
  { name: 'Faith', text: 'Every work begins in prayer.' },
  { name: 'Stewardship', text: 'Every gift handled with care.' },
  { name: 'Integrity', text: 'Open in what we promise and spend.' },
  { name: 'Generosity', text: 'Freely received, freely given.' },
  { name: 'Excellence', text: 'His house deserves our best.' },
  { name: 'Service', text: 'We build so others are served.' },
  { name: 'Unity', text: 'Together, more than any alone.' },
  { name: 'Compassion', text: 'People before projects.' },
] as const

/** Scripture quotations are from the King James Version (public domain). */
export const SCRIPTURE = {
  haggai: { text: 'The silver is mine, and the gold is mine, saith the LORD of hosts.', ref: 'Haggai 2:8' },
  exodus: { text: 'And let them make me a sanctuary; that I may dwell among them.', ref: 'Exodus 25:8' },
  chronicles: {
    text: 'Now I have prepared with all my might for the house of my God the gold for things to be made of gold, and the silver for things of silver.',
    ref: '1 Chronicles 29:2',
  },
  psalm: { text: 'Except the LORD build the house, they labour in vain that build it.', ref: 'Psalm 127:1' },
  matthew: { text: 'Go ye therefore, and teach all nations.', ref: 'Matthew 28:19' },
  philippians: { text: 'I thank my God upon every remembrance of you.', ref: 'Philippians 1:3' },
  peter: { text: 'Ye also, as lively stones, are built up a spiritual house.', ref: '1 Peter 2:5' },
  corinthians: { text: 'Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.', ref: '2 Corinthians 9:7' },
}

export const INVOLVEMENT = [
  { key: 'individual_donation', title: 'Individual Giving', text: 'Give once or monthly.', cta: 'Give now', href: '/donate', icon: 'HandCoins' },
  { key: 'church_partnership', title: 'Church Partnerships', text: 'Congregation helping congregation.', cta: 'Partner as a church', icon: 'Church' },
  { key: 'corporate_partnership', title: 'Corporate Partnerships', text: 'Sponsor a project or match giving.', cta: 'Partner as a business', icon: 'Building2' },
  { key: 'family_friends', title: 'Family & Friends', text: 'Build something together.', cta: 'Start a circle', icon: 'Users' },
  { key: 'material_donation', title: 'Building Materials', text: 'Cement, steel, roofing, timber.', cta: 'Offer materials', icon: 'BrickWall' },
  { key: 'volunteer', title: 'Volunteer', text: 'Work days, outreach, support.', cta: 'Volunteer with us', icon: 'HardHat' },
  { key: 'fundraising', title: 'Fundraising Initiatives', text: 'A walk, a concert, a harambee.', cta: 'Plan a fundraiser', icon: 'Sparkles' },
  { key: 'professional_support', title: 'Professional & Technical', text: 'Offer your professional skills.', cta: 'Offer your expertise', icon: 'Ruler' },
  { key: 'prayer', title: 'Prayer Support', text: 'Uphold the work in prayer.', cta: 'Join in prayer', icon: 'HeartHandshake' },
] as const

export const PARTNERSHIP_TYPES = [...INVOLVEMENT.map((i) => ({ value: i.key as string, label: i.title as string })), { value: 'sponsorship', label: 'Sponsorship programme' }]

export const DONATION_DESIGNATIONS = [
  { value: 'general', label: 'Where it is needed most' },
  { value: 'construction', label: 'Church construction' },
  { value: 'renovation', label: 'Church renovation' },
  { value: 'evangelism', label: 'Evangelism & mission' },
  { value: 'outreach', label: 'Community outreach' },
  { value: 'youth', label: "Youth & children's ministry" },
  { value: 'project', label: 'A specific project' },
] as const

export const GALLERY_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'interiors', label: 'Interiors' },
  { value: 'construction', label: 'Construction' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'details', label: 'Details' },
  { value: 'community', label: 'Community' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'volunteers', label: 'Volunteers' },
] as const

export const PROJECT_FILTERS = [
  { value: 'all', label: 'All Projects' },
  { value: 'construction', label: 'Church Construction' },
  { value: 'renovation', label: 'Church Renovation' },
  { value: 'community', label: 'Community Initiatives' },
  { value: 'completed', label: 'Completed' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'planned', label: 'Planned' },
] as const

export const CATEGORY_LABEL: Record<string, string> = {
  construction: 'Church Construction',
  renovation: 'Church Renovation',
  community: 'Community Initiative',
}
export const STATUS_LABEL: Record<string, string> = {
  planned: 'Planned',
  ongoing: 'Ongoing',
  completed: 'Completed',
}
