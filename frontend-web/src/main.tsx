import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import ToastProvider from './components/Toast/ToastProvider'
import { Footer } from './components/Footer/Footer' // ← добавили
import faviconUrl from './assets/favicon.png'
import './styles/_index.scss'

const faviconLink = document.createElement('link')
faviconLink.rel = 'icon'
faviconLink.type = 'image/png'
faviconLink.href = faviconUrl
document.head.appendChild(faviconLink)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ToastProvider>
        <App />
        <Footer /> {/* ← футер на всех страницах */}
      </ToastProvider>
    </HelmetProvider>
  </StrictMode>,
)