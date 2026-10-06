import { useState } from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { PageHero } from '@/sections/common/PageHero'
import { ContactForm } from '@/components/forms/ContactForm'
import { PartnershipForm } from '@/components/forms/PartnershipForm'
import { useSettings } from '@/components/common/SettingsProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { SocialIcons } from '@/components/common/SocialIcons'
import { cn } from '@/lib/utils'

export default function Contact() {
  const { settings } = useSettings()
  const [tab, setTab] = useState<'contact' | 'partner'>('contact')

  const rows = [
    { icon: Mail, label: 'Email', value: settings.email ? <a className="link-underline" href={`mailto:${settings.email}`}>{settings.email}</a> : <Placeholder label="Email address" /> },
    { icon: Phone, label: 'Phone', value: settings.phone ? <a className="link-underline" href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a> : <Placeholder label="Phone number" /> },
    { icon: MapPin, label: 'Address', value: settings.address ? <span className="whitespace-pre-line">{settings.address}</span> : <Placeholder label="Physical address" /> },
    { icon: Clock, label: 'Office hours', value: settings.office_hours ?? <Placeholder label="Office hours" /> },
  ]

  return (
    <>
      <Seo title="Contact" path="/contact" description="Contact Golden Blocks Mission — general enquiries, partnership enquiries and ways to reach our team." />
      <PageHero
        eyebrow="Contact"
        title="We would love to hear from you."
        goldFrom={4}
        image="/images/gallery/interiors-timber-cross.webp"
        compact
        lede="Our team reads every message."
      />

      <section className="bg-night py-24 md:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <aside className="lg:col-span-4" aria-labelledby="details-title">
            <h2 id="details-title" className="eyebrow mb-8 text-champagne">Contact details</h2>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {rows.map(({ icon: Icon, label, value }) => (
                <li key={label} className="grid grid-cols-[2.5rem_1fr] gap-3 py-6">
                  <Icon className="mt-0.5 h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden />
                  <div>
                    <p className="field-label">{label}</p>
                    <p className="mt-2 text-silver-light">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <p className="field-label mb-4">Follow</p>
              <SocialIcons socials={settings.socials} />
            </div>
          </aside>

          <div className="lg:col-span-7 lg:col-start-6">
            <div role="tablist" aria-label="Choose enquiry type" className="mb-10 grid grid-cols-2 border border-white/12">
              {(
                [
                  ['contact', 'General enquiry'],
                  ['partner', 'Partnership enquiry'],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  role="tab"
                  id={`tab-${k}`}
                  aria-selected={tab === k}
                  aria-controls={`panel-${k}`}
                  onClick={() => setTab(k)}
                  className={cn('py-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] transition-colors', tab === k ? 'bg-gold text-black' : 'text-silver-light/80 hover:text-white')}
                >
                  {l}
                </button>
              ))}
            </div>
            <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
              <h2 className="display-sm mb-8">{tab === 'contact' ? 'Send us a message' : 'Explore a partnership'}</h2>
              {tab === 'contact' ? <ContactForm /> : <PartnershipForm />}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
