import { createContext, useContext, type ReactNode } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { EMPTY_SETTINGS, getSiteSettings } from '@/services/content'
import type { SiteSettings } from '@/types'

const Ctx = createContext<{ settings: SiteSettings; reload: () => void }>({ settings: EMPTY_SETTINGS, reload: () => {} })

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, reload } = useAsync(getSiteSettings, [])
  return <Ctx.Provider value={{ settings: data ?? EMPTY_SETTINGS, reload }}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(Ctx)
