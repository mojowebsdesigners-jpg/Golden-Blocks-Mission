import { Link } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'
import { Placeholder } from '@/components/common/Placeholder'
import { SocialIcons } from '@/components/common/SocialIcons'
import { useSettings } from '@/components/common/SettingsProvider'
import { ButtonLink } from '@/components/ui/Button'
import { MISSION_AREAS, NAV_LINKS, SITE } from '@/data/site'

export function Footer() {
  const { settings } = useSettings()
  const year = new Date().getFullYear()

  return (
    <footer className="theme-dark relative overflow-hidden border-t border-white/10 bg-ink" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      {/* gold/silver hairline treatment */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 top-[3px] h-px bg-gradient-to-r from-transparent via-silver/25 to-transparent" aria-hidden />

      <div className="container-x relative pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-muted">
              {SITE.field}. Building not only structures, but hope, dignity and better lives.
            </p>
            <ButtonLink to="/donate" className="mt-8">Support the Mission</ButtonLink>
          </div>

          <nav className="lg:col-span-2" aria-label="Footer navigation">
            <p className="eyebrow mb-5 text-champagne/80">Explore</p>
            <ul className="space-y-3 text-[0.95rem]">
              {[...NAV_LINKS, { to: '/donate', label: 'Donate' }].map((l) => (
                <li key={l.to}><Link className="link-underline text-silver-light/85 hover:text-white" to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="eyebrow mb-5 text-champagne/80">Mission Areas</p>
            <ul className="space-y-3 text-[0.95rem]">
              {MISSION_AREAS.map((m) => (
                <li key={m.slug}><Link className="link-underline text-silver-light/85 hover:text-white" to={m.to}>{m.title}</Link></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="eyebrow mb-5 text-champagne/80">Contact</p>
            <ul className="space-y-3 text-[0.95rem] text-silver-light/85">
              <li>{settings.email ? <a className="link-underline" href={`mailto:${settings.email}`}>{settings.email}</a> : <Placeholder label="Email address" />}</li>
              <li>{settings.phone ? <a className="link-underline" href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a> : <Placeholder label="Phone number" />}</li>
              <li>{settings.address ? <span className="whitespace-pre-line">{settings.address}</span> : <Placeholder label="Physical address" />}</li>
            </ul>
            <div className="mt-6">
              <SocialIcons socials={settings.socials} />
            </div>
          </div>
        </div>

        {/* Monumental wordmark */}
        <div className="pointer-events-none mt-20 select-none overflow-hidden" aria-hidden>
          <p className="text-gold-metal whitespace-nowrap font-serif text-[clamp(3.2rem,13.5vw,13rem)] leading-[0.85] tracking-[-0.045em] opacity-90">
            Golden Blocks
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>© {year} {SITE.name} — {SITE.field}. {SITE.closing}</p>
          <p className="max-w-xl md:text-center">Working closely with the Seventh-day Adventist Church. Not an official entity of the worldwide Seventh-day Adventist Church.</p>
          <ul className="flex gap-5">
            <li><Link className="link-underline hover:text-white" to="/privacy">Privacy Policy</Link></li>
            <li><Link className="link-underline hover:text-white" to="/terms">Terms</Link></li>
            <li><Link className="link-underline hover:text-white" to="/credits">Image Credits</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
