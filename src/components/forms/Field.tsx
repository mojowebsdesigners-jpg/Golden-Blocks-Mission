import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Wrap {
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: (id: string, describedBy: string | undefined) => ReactNode
}

function FieldWrap({ label, error, hint, required, className, children }: Wrap) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errId = error ? `${id}-err` : undefined
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-gold" aria-hidden>*</span>}
      </label>
      {children(id, describedBy)}
      {hint && !error && <p id={hintId} className="text-xs text-muted">{hint}</p>}
      {error && <p id={errId} role="alert" className="text-xs text-[#b4412f]">{error}</p>}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; wrapClassName?: string }
export const TextField = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, required, wrapClassName, className, ...rest }, ref) => (
  <FieldWrap label={label} error={error} hint={hint} required={required} className={wrapClassName}>
    {(id, d) => <input ref={ref} id={id} aria-invalid={!!error} aria-describedby={d} aria-required={required} className={cn('field', className)} {...rest} />}
  </FieldWrap>
))
TextField.displayName = 'TextField'

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: string; wrapClassName?: string }
export const TextArea = forwardRef<HTMLTextAreaElement, AreaProps>(({ label, error, hint, required, wrapClassName, className, ...rest }, ref) => (
  <FieldWrap label={label} error={error} hint={hint} required={required} className={wrapClassName}>
    {(id, d) => <textarea ref={ref} id={id} rows={5} aria-invalid={!!error} aria-describedby={d} aria-required={required} className={cn('field resize-y', className)} {...rest} />}
  </FieldWrap>
))
TextArea.displayName = 'TextArea'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: string; wrapClassName?: string; options: { value: string; label: string }[]; placeholder?: string }
export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, hint, required, wrapClassName, className, options, placeholder, ...rest }, ref) => (
  <FieldWrap label={label} error={error} hint={hint} required={required} className={wrapClassName}>
    {(id, d) => (
      <select ref={ref} id={id} aria-invalid={!!error} aria-describedby={d} aria-required={required} className={cn('field', className)} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    )}
  </FieldWrap>
))
SelectField.displayName = 'SelectField'

/** Invisible to people, tempting to bots. Submissions with a value are dropped. */
export const Honeypot = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
    <label>Leave this field empty<input ref={ref} tabIndex={-1} autoComplete="off" {...props} /></label>
  </div>
))
Honeypot.displayName = 'Honeypot'

export function FormStatus({ state, success, error }: { state: 'idle' | 'success' | 'error'; success: string; error?: string | null }) {
  if (state === 'idle') return null
  return (
    <div role="status" aria-live="polite" className={cn('flex items-start gap-3 border p-4 text-sm', state === 'success' ? 'border-gold/40 bg-gold/[0.06] text-champagne' : 'border-[#d0705f]/40 bg-[#d0705f]/[0.06] text-[#f0b2a6]')}>
      {state === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <p>{state === 'success' ? success : error}</p>
    </div>
  )
}
