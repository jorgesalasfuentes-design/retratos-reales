'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { STYLES, SHOWCASE_EXAMPLES, STYLE_CATEGORIES } from './lib/styles'
import { getTranslation, getStoredLanguage } from './lib/translations'
import StyleCard from './components/StyleCard'

const CATEGORY_KEYS = {
  regal: { title: 'forTheRegalOnes', subtitle: 'yourPetDeservesThrone' },
  brave: { title: 'forTheBraveOnes', subtitle: 'heroesComeInAllSizes' },
  bold: { title: 'forTheBoldOnes', subtitle: 'futureLooksFluffy' },
  artsy: { title: 'forTheArtsyOnes', subtitle: 'hangInMuseum' },
  crazy: { title: 'feelingChaotic', subtitle: 'letAiSurpriseYou' },
}

export default function HomePage() {
  const [lang, setLang] = useState('en')
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    setLang(getStoredLanguage())
    const handler = () => setLang(getStoredLanguage())
    window.addEventListener('lang-change', handler)
    return () => window.removeEventListener('lang-change', handler)
  }, [])

  const t = getTranslation(lang)

  // Hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % SHOWCASE_EXAMPLES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-bg">
          {SHOWCASE_EXAMPLES.map((ex, i) => (
            <div key={ex.src} className={`hero-slide ${i === heroIndex ? 'hero-slide-active' : ''}`}>
              <img src={ex.src} alt={ex.name} />
            </div>
          ))}
        </div>
        <div className="hero-gradient" />
        <div className="hero-content">
          <div className="hero-logo">{t.appName}</div>
          <h1 className="hero-tagline">{t.heroTagline}</h1>
          <p className="hero-subtext">{t.heroSubtext}</p>
          <Link href="/create" className="hero-cta">
            {t.startCreating}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>
        <div className="hero-dots">
          {SHOWCASE_EXAMPLES.map((_, i) => (
            <div key={i} className={`hero-dot ${i === heroIndex ? 'hero-dot-active' : ''}`} />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="home-section">
        <h2 className="section-title mt-lg">{t.chooseAdventure}</h2>

        {STYLE_CATEGORIES.map(cat => {
          const keys = CATEGORY_KEYS[cat.key]
          const catStyles = cat.styles.map(id => STYLES.find(s => s.id === id)).filter(Boolean)
          return (
            <div key={cat.key} className="category-section">
              <div className="category-header">
                <h3 className="category-title">{t[keys.title]}</h3>
                <p className="category-subtitle">{t[keys.subtitle]}</p>
              </div>
              <div className="category-row">
                {catStyles.map(style => (
                  <Link key={style.id} href={`/create?style=${style.id}`} style={{ textDecoration: 'none' }}>
                    <StyleCard style={style} onClick={() => {}} lang={lang} />
                  </Link>
                ))}
              </div>
            </div>
          )
        })}

        <p className="app-footer">{t.madeWithLove}</p>
      </div>
    </>
  )
}
