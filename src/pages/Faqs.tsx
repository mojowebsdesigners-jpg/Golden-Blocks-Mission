import { useId, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/sections/common/PageHero'
import { Reveal } from '@/animations/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { ErrorState, PageLoader } from '@/components/common/PageLoader'
import { useAsync } from '@/hooks/useAsync'
import { getFaqs } from '@/services/content'
import { cn } from '@/lib/utils'
import type { Faq } from '@/types'

const EASE = [0.16, 1, 0.3, 1] as const

function Item({ faq, open, onToggle }: { faq: Faq; open: boolean; onToggle: () => void }) {
  const id = useId()
  return (
    <li className="border-b border-white/12">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-a`}
          id={`${id}-q`}
          onClick={onToggle}
          className="group flex w-full items-start justify-between gap-6 py-6 text-left"
        >
          <span className={cn('font-serif text-[1.2rem] leading-snug transition-colors md:text-[1.35rem]', open ? 'text-gold' : 'text-white group-hover:text-gold')}>{faq.question}</span>
          <span className={cn('mt-1 grid h-8 w-8 shrink-0 place-items-center border transition-all duration-500', open ? 'rotate-45 border-gold-bright bg-gold-bright text-[#2b2e33]' : 'border-white/25 text-silver')} aria-hidden>
            <Plus className="h-4 w-4" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-a`}
            role="region"
            aria-labelledby={`${id}-q`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="max-w-3xl whitespace-pre-line pb-7 pr-12 leading-relaxed text-silver-light">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

export default function Faqs() {
  const { data, loading, error, reload } = useAsync(getFaqs, [])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = (data ?? []).filter((f) => !q || `${f.question} ${f.answer} ${f.category}`.toLowerCase().includes(q))
    const map = new Map<string, Faq[]>()
    for (const f of list) map.set(f.category, [...(map.get(f.category) ?? []), f])
    return [...map.entries()]
  }, [data, query])

  // FAQPage structured data so search engines can show answers directly.
  const jsonLd = data?.length
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      })
    : null

  return (
    <>
      <Seo title="FAQs" path="/faqs" description="Answers to common questions about Golden Blocks Mission — giving, sponsorship, partnerships, projects and how to get involved." />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      <PageHero
        eyebrow="FAQs"
        title="Questions, answered."
        goldFrom={1}
        image="/images/gallery/details-open-bible.webp"
        compact
        lede="Giving, sponsorship, partnership and projects."
      />

      <section className="bg-night py-20 md:py-28" aria-label="Frequently asked questions">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <label htmlFor="faq-search" className="field-label">Search the questions</label>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                <input id="faq-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. M-Pesa, monthly, volunteer" className="field !pl-11" />
              </div>
              {groups.length > 1 && (
                <nav aria-label="FAQ categories" className="mt-8 hidden lg:block">
                  <ul className="space-y-2">
                    {groups.map(([cat, list]) => (
                      <li key={cat}>
                        <a href={`#faq-${cat.toLowerCase().replace(/\W+/g, '-')}`} className="link-underline text-silver-light hover:text-white">
                          {cat} <span className="text-muted">({list.length})</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <div className="mt-10 border border-white/12 bg-card p-6">
                <p className="font-serif text-xl text-white">Still have a question?</p>
                
                <ButtonLink to="/contact" className="mt-5">Contact us</ButtonLink>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            {loading ? (
              <PageLoader />
            ) : error ? (
              <ErrorState message="We could not load the questions." onRetry={reload} />
            ) : !groups.length ? (
              <p className="py-10 text-muted">{query ? `No questions match “${query}”.` : 'Questions will be published here soon.'}</p>
            ) : (
              groups.map(([cat, list]) => (
                <Reveal key={cat} className="mb-14 scroll-mt-28" as="section">
                  <h2 id={`faq-${cat.toLowerCase().replace(/\W+/g, '-')}`} className="eyebrow mb-2 scroll-mt-28 text-champagne">{cat}</h2>
                  <ul className="border-t border-white/12">
                    {list.map((f) => (
                      <Item key={f.id} faq={f} open={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)} />
                    ))}
                  </ul>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  )
}
