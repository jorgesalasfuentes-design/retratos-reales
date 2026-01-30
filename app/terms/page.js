'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTranslation, getStoredLanguage } from '../lib/translations'

export default function TermsPage() {
  const router = useRouter()
  const [lang, setLang] = useState('en')

  useEffect(() => {
    setLang(getStoredLanguage())
  }, [])

  const t = getTranslation(lang)

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="legal-page">
          <div className="legal-header">
            <button className="legal-back" onClick={() => router.back()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h1 className="legal-title">{t.termsTitle}</h1>
          </div>
          <div className="legal-content">
            <p>{t.termsContent}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
