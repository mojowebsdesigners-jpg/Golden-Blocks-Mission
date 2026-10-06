import { Seo } from '@/components/common/Seo'
import { ButtonLink } from '@/components/ui/Button'
import { SCRIPTURE } from '@/data/site'

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" path="/404" noindex />
      <section className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-night px-4 text-center">
        <p className="text-gold-metal pointer-events-none absolute select-none font-serif text-[40vw] leading-none opacity-[0.07]" aria-hidden>404</p>
        <div className="relative">
          <p className="eyebrow text-champagne">Page not found</p>
          <h1 className="display-lg mx-auto mt-6 max-w-[14ch]">This stone has not been laid yet.</h1>
          <p className="mx-auto mt-6 max-w-md text-muted">The page you are looking for does not exist or has moved.</p>
          <p className="mx-auto mt-8 max-w-md font-serif italic text-silver-light/80">“{SCRIPTURE.psalm.text}” — {SCRIPTURE.psalm.ref}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/">Return home</ButtonLink>
            <ButtonLink to="/contact" variant="dark">Contact us</ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
