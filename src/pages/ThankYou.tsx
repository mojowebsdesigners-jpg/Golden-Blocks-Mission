import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'
import { Seo } from '@/components/common/Seo'
import { ButtonLink } from '@/components/ui/Button'
import { getDonationStatus, verifyCardPayment, type DonationStatusResponse } from '@/services/donations'
import { SITE } from '@/data/site'
import { errorMessage, formatMoney } from '@/lib/utils'

type View = { kind: 'loading' } | { kind: 'done'; s: DonationStatusResponse } | { kind: 'error'; message: string } | { kind: 'none' }

/**
 * Shows a confirmation ONLY when the server reports the payment as verified
 * (completed). Pending or failed payments are described honestly.
 */
export default function ThankYou() {
  const [params] = useSearchParams()
  const [view, setView] = useState<View>({ kind: 'loading' })
  const reference = params.get('reference') ?? params.get('trxref')
  const id = params.get('id')
  const token = params.get('token')

  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        if (reference) {
          const s = await verifyCardPayment(reference)
          if (alive) setView({ kind: 'done', s })
        } else if (id && token) {
          const s = await getDonationStatus(id, token)
          if (alive) setView({ kind: 'done', s })
        } else if (alive) setView({ kind: 'none' })
      } catch (e) {
        if (alive) setView({ kind: 'error', message: errorMessage(e) })
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [reference, id, token])

  const status = view.kind === 'done' ? view.s.status : null
  const confirmed = status === 'completed'

  return (
    <>
      <Seo title="Thank you" path="/donate/thank-you" noindex />
      <section className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-night px-4 py-32">
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
          <svg viewBox="0 0 800 800" className="h-[130vmin] w-[130vmin] opacity-60">
            {[90, 170, 260, 360].map((r, i) => (
              <motion.circle key={r} cx="400" cy="400" r={r} fill="none" stroke={i % 2 ? '#7c7f86' : '#d9a21b'} strokeOpacity="0.35" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.8, delay: i * 0.15 }} style={{ transformOrigin: '400px 400px' }} />
            ))}
          </svg>
        </div>
        <div className="relative max-w-2xl text-center" role="status" aria-live="polite">
          {view.kind === 'loading' && (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-gold-bright" />
              <h1 className="display-md mt-8">Confirming your gift…</h1>
              <p className="mt-4 text-muted">We are verifying your payment with the payment provider.</p>
            </>
          )}

          {view.kind === 'done' && confirmed && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-gold-bright" strokeWidth={1.2} />
              <p className="eyebrow mt-8 text-champagne">Payment verified</p>
              <h1 className="display-lg mt-4">Thank you for <span className="text-gold-metal italic">building with us.</span></h1>
              <p className="lede mx-auto mt-6 max-w-lg">
                Your gift of <strong className="text-white">{formatMoney(view.s.amount, view.s.currency)}</strong>
                {view.s.frequency === 'monthly' ? ' each month' : ''} has been received. A confirmation has been sent to your email.
              </p>
              {view.s.reference && <p className="mt-4 font-mono text-xs tracking-[0.15em] text-muted">Reference: {view.s.reference}</p>}
              <p className="mx-auto mt-10 max-w-md font-serif text-lg italic text-silver-light/85">“{SITE.founding_message}”</p>
            </>
          )}

          {view.kind === 'done' && (status === 'pending' || status === 'pledged') && (
            <>
              <Clock className="mx-auto h-12 w-12 text-champagne" strokeWidth={1.2} />
              <h1 className="display-md mt-8">Your payment is still being confirmed.</h1>
              <p className="lede mx-auto mt-6 max-w-lg">
                We have not yet received final confirmation from the payment provider. You will receive an email as soon as your gift is verified. If you were charged and do not hear from us, please contact us.
              </p>
            </>
          )}

          {view.kind === 'done' && (status === 'failed' || status === 'cancelled') && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-[#b4412f]" strokeWidth={1.2} />
              <h1 className="display-md mt-8">The payment was not completed.</h1>
              <p className="lede mx-auto mt-6 max-w-lg">No money has been recorded as received for this attempt. You are welcome to try again.</p>
            </>
          )}

          {view.kind === 'error' && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-[#b4412f]" strokeWidth={1.2} />
              <h1 className="display-md mt-8">We could not confirm this payment.</h1>
              <p className="lede mx-auto mt-6 max-w-lg">{view.message}</p>
            </>
          )}

          {view.kind === 'none' && (
            <>
              <h1 className="display-md">Thank you for your generosity.</h1>
              <p className="lede mx-auto mt-6 max-w-lg">There is no payment to confirm on this page. To make a gift, visit our donation page.</p>
            </>
          )}

          {view.kind !== 'loading' && (
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {confirmed ? <ButtonLink to="/projects" variant="dark">See our projects</ButtonLink> : <ButtonLink to="/donate">Return to donation page</ButtonLink>}
              <ButtonLink to="/contact" variant="dark">Contact us</ButtonLink>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
