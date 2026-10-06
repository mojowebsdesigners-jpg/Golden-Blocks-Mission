import { SITE } from '@/data/site'

/**
 * Page-level metadata. React 19 hoists <title>/<meta>/<link> rendered
 * anywhere in the tree into <head>.
 */
export function Seo({ title, description, path = '/', image = '/images/og/og-default.jpg', noindex = false }: {
  title: string
  description?: string
  path?: string
  image?: string
  noindex?: boolean
}) {
  const fullTitle = title === SITE.name ? `${SITE.name} — ${SITE.tagline}` : `${title} — ${SITE.name}`
  const desc = description ?? SITE.description
  const url = `${SITE.url}${path}`
  const img = image.startsWith('http') ? image : `${SITE.url}${image}`
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </>
  )
}
