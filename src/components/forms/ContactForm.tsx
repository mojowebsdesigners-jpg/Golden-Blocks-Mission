import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { FormStatus, Honeypot, TextArea, TextField } from './Field'
import { contactSchema, type ContactValues } from './schemas'
import { submitContactMessage } from '@/services/forms'
import { errorMessage } from '@/lib/utils'

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle')
  const [err, setErr] = useState<string | null>(null)
  const [params] = useSearchParams()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: params.get('subject') ?? '' },
  })

  const onSubmit = async (v: ContactValues) => {
    setState('idle')
    if (v.website) return setState('success') // honeypot: silently accept
    try {
      await submitContactMessage({ full_name: v.full_name, email: v.email, phone: v.phone || undefined, subject: v.subject, message: v.message })
      setState('success')
      reset()
    } catch (e) {
      setErr(errorMessage(e))
      setState('error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-6 sm:grid-cols-2" aria-label="Contact form">
      <Honeypot {...register('website')} />
      <TextField label="Full name" required autoComplete="name" error={errors.full_name?.message} {...register('full_name')} />
      <TextField label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
      <TextField label="Phone" type="tel" autoComplete="tel" hint="Optional" error={errors.phone?.message} {...register('phone')} />
      <TextField label="Subject" required error={errors.subject?.message} {...register('subject')} />
      <TextArea label="Message" required wrapClassName="sm:col-span-2" error={errors.message?.message} {...register('message')} />
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">We use your details only to respond to your message. See our <Link to="/privacy" className="underline underline-offset-2">privacy policy</Link>.</p>
        <Button type="submit" loading={isSubmitting}>{isSubmitting ? 'Sending' : 'Send message'}</Button>
      </div>
      <div className="sm:col-span-2">
        <FormStatus state={state} success="Thank you — your message has been received. We will be in touch soon." error={err} />
      </div>
    </form>
  )
}
