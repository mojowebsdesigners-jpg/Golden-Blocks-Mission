import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { FormStatus, Honeypot, SelectField, TextArea, TextField } from './Field'
import { partnershipSchema, type PartnershipValues } from './schemas'
import { submitPartnershipEnquiry } from '@/services/forms'
import { PARTNERSHIP_TYPES } from '@/data/site'
import { errorMessage } from '@/lib/utils'

export function PartnershipForm({ defaultType, defaultMessage }: { defaultType?: string; defaultMessage?: string }) {
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle')
  const [err, setErr] = useState<string | null>(null)
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<PartnershipValues>({
    resolver: zodResolver(partnershipSchema),
    defaultValues: { partnership_type: defaultType ?? '', message: defaultMessage ?? '' },
  })

  useEffect(() => {
    if (defaultType) setValue('partnership_type', defaultType, { shouldValidate: false })
  }, [defaultType, setValue])

  useEffect(() => {
    if (defaultMessage) setValue('message', defaultMessage, { shouldValidate: false })
  }, [defaultMessage, setValue])

  const onSubmit = async (v: PartnershipValues) => {
    setState('idle')
    if (v.website) return setState('success')
    try {
      await submitPartnershipEnquiry({
        organisation_name: v.organisation_name || undefined,
        contact_person: v.contact_person,
        email: v.email,
        phone: v.phone || undefined,
        partnership_type: v.partnership_type,
        message: v.message,
      })
      setState('success')
      reset({ partnership_type: '' })
    } catch (e) {
      setErr(errorMessage(e))
      setState('error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-6 sm:grid-cols-2" aria-label="Partnership enquiry form">
      <Honeypot {...register('website')} />
      <TextField label="Your name" required autoComplete="name" error={errors.contact_person?.message} {...register('contact_person')} />
      <TextField label="Church / organisation" hint="Optional" autoComplete="organization" error={errors.organisation_name?.message} {...register('organisation_name')} />
      <TextField label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
      <TextField label="Phone" type="tel" autoComplete="tel" hint="Optional" error={errors.phone?.message} {...register('phone')} />
      <SelectField
        label="How would you like to be involved?"
        required
        wrapClassName="sm:col-span-2"
        placeholder="Select an option"
        options={PARTNERSHIP_TYPES}
        error={errors.partnership_type?.message}
        {...register('partnership_type')}
      />
      <TextArea label="Tell us more" required wrapClassName="sm:col-span-2" error={errors.message?.message} {...register('message')} />
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">A member of our team will respond personally.</p>
        <Button type="submit" loading={isSubmitting}>{isSubmitting ? 'Submitting' : 'Submit enquiry'}</Button>
      </div>
      <div className="sm:col-span-2">
        <FormStatus state={state} success="Thank you for your heart to partner with us. We have received your enquiry and will respond soon." error={err} />
      </div>
    </form>
  )
}
