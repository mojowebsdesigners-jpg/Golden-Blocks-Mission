import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { SettingsProvider } from '@/components/common/SettingsProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmoothScroll>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </SmoothScroll>
  </StrictMode>,
)
