import { useLocation } from 'react-router-dom'
import { Seo } from '@/components/common/Seo'
import { useSettings } from '@/components/common/SettingsProvider'
import { Placeholder } from '@/components/common/Placeholder'

const UPDATED = '1 October 2026'

/**
 * Template legal copy. It describes how this website actually handles data,
 * but must be reviewed by the organisation (and, ideally, legal counsel)
 * against the Kenya Data Protection Act 2019 before launch.
 */
export default function Legal() {
  const { pathname } = useLocation()
  const { settings } = useSettings()
  const privacy = pathname.startsWith('/privacy')
  const contact = settings.email ? <a className="underline underline-offset-2" href={`mailto:${settings.email}`}>{settings.email}</a> : <Placeholder label="Contact email" />

  return (
    <>
      <Seo title={privacy ? 'Privacy Policy' : 'Terms and Conditions'} path={pathname} />
      <section className="bg-night pb-28 pt-40">
        <div className="container-x max-w-3xl">
          <p className="eyebrow text-champagne">Legal</p>
          <h1 className="display-lg mt-4">{privacy ? 'Privacy Policy' : 'Terms and Conditions'}</h1>
          <p className="mt-4 text-sm text-muted">Last updated {UPDATED}</p>
          <div className="mt-6 border border-dashed border-champagne/40 px-4 py-3 text-sm text-champagne/90">
            Template text — to be reviewed and approved by Golden Blocks Mission before publication.
          </div>

          <div className="mt-12 space-y-10 leading-relaxed text-silver-light/85 [&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
            {privacy ? (
              <>
                <div><h2>Who we are</h2><p>Golden Blocks Mission (“we”, “us”) is a nonprofit Christian organisation. This policy explains how we collect and use personal information through this website.</p></div>
                <div><h2>Information we collect</h2><ul>
                  <li>Contact and partnership enquiries: your name, email, phone number (optional), organisation (optional) and message.</li>
                  <li>Donations: your name, email, phone number (for M-Pesa), gift amount, currency, designation and payment status. Card details are entered on Paystack’s secure page and never reach our systems.</li>
                  <li>Administrative accounts: email address and name for authorised staff.</li>
                </ul></div>
                <div><h2>How we use it</h2><ul>
                  <li>To respond to your enquiries and coordinate partnerships.</li>
                  <li>To process, verify and acknowledge donations and keep accurate financial records.</li>
                  <li>To send confirmations of verified gifts. We will not send marketing messages without your consent.</li>
                </ul></div>
                <div><h2>Processors</h2><p>We use Supabase (database and storage), Vercel (hosting), Safaricom M-Pesa and Paystack (payments) and an email delivery provider. Each processes data only to provide its service.</p></div>
                <div><h2>Security & retention</h2><p>Personal data is protected by access controls that limit it to authorised administrators. We keep donation records as long as required for financial and legal obligations, and enquiries only as long as needed to respond.</p></div>
                <div><h2>Your rights</h2><p>You may request access to, correction of or deletion of your personal data, or object to its processing, by contacting {contact}.</p></div>
              </>
            ) : (
              <>
                <div><h2>Use of this website</h2><p>By using this website you agree to these terms. Content is provided to inform supporters about the work of Golden Blocks Mission and may be updated at any time.</p></div>
                <div><h2>Donations</h2><ul>
                  <li>Donations are voluntary gifts to support the charitable purposes of Golden Blocks Mission.</li>
                  <li>A gift is recorded as received only after the payment provider confirms it.</li>
                  <li>We honour your chosen designation wherever possible. Where a project is fully funded or cannot proceed, gifts may be applied to the area of greatest need consistent with our mission.</li>
                  <li>Monthly card gifts can be cancelled at any time by contacting {contact}.</li>
                  <li>If you believe a payment was made in error, contact us promptly so we can review it.</li>
                </ul></div>
                <div><h2>Intellectual property</h2><p>Text, branding and design belong to Golden Blocks Mission unless stated otherwise. Photographs are used under their respective licences, listed on the image credits page.</p></div>
                <div><h2>Relationship with the Seventh-day Adventist Church</h2><p>Golden Blocks Mission works closely with the Seventh-day Adventist Church but is not an official entity or department of the worldwide Seventh-day Adventist Church.</p></div>
                <div><h2>Contact</h2><p>Questions about these terms can be sent to {contact}.</p></div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
