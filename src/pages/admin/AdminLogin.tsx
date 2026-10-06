import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Logo } from '@/components/common/Logo'
import { Seo } from '@/components/common/Seo'
import { Button } from '@/components/ui/Button'
import { FormStatus, TextField } from '@/components/forms/Field'

export function AdminLogin() {
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setState('idle')
    if (mode === 'login') {
      const { error } = await supabase!.auth.signInWithPassword({ email, password })
      if (error) {
        setMsg(error.message === 'Invalid login credentials' ? 'The email or password is incorrect.' : error.message)
        setState('error')
      }
    } else {
      const { error } = await supabase!.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin` })
      if (error) {
        setMsg(error.message)
        setState('error')
      } else {
        setMsg('If an account exists for this email, a reset link is on its way.')
        setState('success')
      }
    }
    setBusy(false)
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-night p-6">
      <Seo title="Admin sign in" path="/admin" noindex />
      <img src="/images/gallery/interiors-concrete-nave-sm.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
      <div className="relative w-full max-w-md border border-white/10 bg-ink/90 p-8 backdrop-blur md:p-10">
        <Logo />
        <h1 className="mt-10 font-serif text-3xl text-white">{mode === 'login' ? 'Dashboard sign in' : 'Reset your password'}</h1>
        <p className="mt-2 text-sm text-muted">Authorised Golden Blocks Mission staff only.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <TextField label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {mode === 'login' && <TextField label="Password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
          <Button type="submit" loading={busy} className="w-full justify-between">{mode === 'login' ? 'Sign in' : 'Send reset link'}</Button>
          <FormStatus state={state} success={msg ?? ''} error={msg} />
        </form>
        <button onClick={() => { setMode(mode === 'login' ? 'reset' : 'login'); setState('idle') }} className="mt-6 text-xs text-muted underline-offset-4 hover:text-white hover:underline">
          {mode === 'login' ? 'Forgot your password?' : 'Back to sign in'}
        </button>
      </div>
    </div>
  )
}

export function UpdatePassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 10) return setErr('Use at least 10 characters.')
    setBusy(true)
    const { error } = await supabase!.auth.updateUser({ password })
    setBusy(false)
    if (error) setErr(error.message)
    else onDone()
  }
  return (
    <div className="grid min-h-dvh place-items-center bg-night p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 border border-white/10 bg-ink p-8">
        <Logo />
        <h1 className="font-serif text-3xl text-white">Choose a new password</h1>
        <TextField label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={err ?? undefined} />
        <Button type="submit" loading={busy}>Update password</Button>
      </form>
    </div>
  )
}
