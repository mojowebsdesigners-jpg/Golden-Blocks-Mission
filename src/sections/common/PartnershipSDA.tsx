import { Reveal } from '@/animations/Reveal'
import { useSettings } from '@/components/common/SettingsProvider'

const DEFAULT_STATEMENT = 'Supporting local Seventh-day Adventist congregations as they build, renew and minister.'

/** Respectful partnership presentation. The official logo is shown only once uploaded in Admin → Settings (after usage permission is confirmed). */
export function PartnershipSDA({ index = '06' }: { index?: string }) {
  const { settings } = useSettings()
  return (
    <section id="partnership" aria-labelledby="partnership-title" className="relative bg-coal py-28 md:py-36">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="relative grid aspect-[5/4] place-items-center border border-white/10 bg-card p-10">
            <span className="absolute left-4 top-4 text-[10px] text-silver/50" aria-hidden>✦</span>
            <span className="absolute bottom-4 right-4 text-[10px] text-silver/50" aria-hidden>✦</span>
            {settings.sda_logo_url ? (
              <img src={settings.sda_logo_url} alt="Seventh-day Adventist Church logo" className="max-h-40 w-auto object-contain" loading="lazy" />
            ) : (
              <div className="text-center">
                <p className="eyebrow text-silver/70">In fellowship with</p>
                <p className="text-silver-metal mt-5 font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-tight">Seventh-day Adventist Church</p>
                <div className="mx-auto mt-6 h-px w-16 bg-gold/60" />
              </div>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
          <span className="chip chip-silver mb-8">{index} — Our partnership</span>
          <h2 id="partnership-title" className="display-md">
            Rooted in the church. <span className="text-silver-metal italic">Serving its mission.</span>
          </h2>
          <p className="lede mt-8">{settings.partnership_statement || DEFAULT_STATEMENT}</p>
        </Reveal>
      </div>
    </section>
  )
}
