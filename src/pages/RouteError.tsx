import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { LogoMark } from '@/components/common/Logo'

export function RouteError() {
  const err = useRouteError()
  // A stale chunk after a deployment: reload once to fetch the new build.
  const msg = err instanceof Error ? err.message : ''
  if (/dynamically imported module|Importing a module script failed/i.test(msg) && !sessionStorage.getItem('gbm-reloaded')) {
    sessionStorage.setItem('gbm-reloaded', '1')
    window.location.reload()
    return null
  }
  const title = isRouteErrorResponse(err) ? `${err.status} — ${err.statusText}` : 'Something went wrong'
  return (
    <div className="grid min-h-dvh place-items-center bg-night px-6 text-center">
      <div>
        <LogoMark className="mx-auto h-12 w-12" />
        <h1 className="display-md mt-8">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">An unexpected error interrupted this page. Please return home and try again.</p>
        <Link to="/" className="btn-gold mt-8">Return home</Link>
      </div>
    </div>
  )
}
