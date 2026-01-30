'use client'

import './globals.css'
import { useState, useEffect } from 'react'
import BottomNav from './components/BottomNav'
import { getTranslation, getStoredLanguage } from './lib/translations'

export default function RootLayout({ children }) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    setLang(getStoredLanguage())
    // Listen for language changes from settings
    const handler = () => setLang(getStoredLanguage())
    window.addEventListener('lang-change', handler)
    return () => window.removeEventListener('lang-change', handler)
  }, [])

  const t = getTranslation(lang)

  return (
    <html lang={lang}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#07070a" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Retratos Reales" />
        <meta name="description" content="Transform your pet photos into stunning AI-generated artwork" />
        <title>Retratos Reales - AI Pet Portraits</title>
      </head>
      <body>
        <div className="app-shell">
          {children}
        </div>
        <BottomNav t={t} />
      </body>
    </html>
  )
}
