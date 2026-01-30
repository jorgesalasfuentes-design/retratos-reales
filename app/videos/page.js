'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTranslation, getStoredLanguage } from '../lib/translations'
import { VIDEO_CATEGORIES, VIDEO_TEMPLATES, getFeaturedTemplates } from '../lib/videoTemplates'
import { useVideoCredits } from '../lib/useVideoCredits'
import TemplateCard from '../components/TemplateCard'
import CreditsBadge from '../components/CreditsBadge'
import CreditsModal from '../components/CreditsModal'
import Toast from '../components/Toast'

export default function VideosPage() {
  const [lang, setLang] = useState('en')
  const [activeCategory, setActiveCategory] = useState(null)
  const { credits, showModal, setShowModal, addFree } = useVideoCredits()
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setLang(getStoredLanguage())
    const handler = () => setLang(getStoredLanguage())
    window.addEventListener('lang-change', handler)
    return () => window.removeEventListener('lang-change', handler)
  }, [])

  const t = getTranslation(lang)
  const featured = getFeaturedTemplates()
  const categories = VIDEO_CATEGORIES.filter(c => c.key !== 'custom')

  const displayTemplates = activeCategory
    ? VIDEO_TEMPLATES.filter(t => t.category === activeCategory)
    : featured

  const handleAddCredits = () => {
    addFree(2)
    setToast(t.freeVideoCreditsAdded)
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div className="video-header">
          <div className="video-header-top">
            <div>
              <h1 className="video-title">{t.videoHome}</h1>
              <p className="video-subtitle">{t.videoHomeSubtitle}</p>
            </div>
            <button className="credits-badge" onClick={() => setShowModal(true)}>
              <span className="credits-badge-icon">🎬</span>
              <span className="credits-badge-count">{credits}</span>
            </button>
          </div>
        </div>

        {/* Podcast Banner */}
        <Link href="/videos/podcast" className="podcast-banner">
          <div className="podcast-banner-left">
            <img src="/naomi-host.jpg" alt="Naomi" className="podcast-banner-avatar" />
            <div className="podcast-banner-info">
              <span className="podcast-banner-title">{t.podcastTitle}</span>
              <span className="podcast-banner-desc">{t.podcastSubtitle}</span>
            </div>
          </div>
          <span className="podcast-banner-badge">NEW</span>
        </Link>

        {/* Category Pills */}
        <div className="category-pills">
          <button
            className={`category-pill ${!activeCategory ? 'category-pill-active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            {t.featured}
          </button>
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`category-pill ${activeCategory === cat.key ? 'category-pill-active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.emoji} {lang === 'es' ? cat.nameEs : cat.name}
            </button>
          ))}
          <button
            className={`category-pill ${activeCategory === 'custom' ? 'category-pill-active' : ''}`}
            onClick={() => setActiveCategory('custom')}
          >
            ✨ {lang === 'es' ? 'Personalizado' : 'Custom'}
          </button>
        </div>

        {/* Template List */}
        <div className="template-list">
          {displayTemplates.map(template => (
            <Link key={template.id} href={`/videos/create?template=${template.id}`} style={{ textDecoration: 'none' }}>
              <TemplateCard template={template} lang={lang} />
            </Link>
          ))}
        </div>

        {/* Show all categories when on featured */}
        {!activeCategory && (
          <>
            {categories.map(cat => {
              const catTemplates = VIDEO_TEMPLATES.filter(t => t.category === cat.key).slice(0, 4)
              return (
                <div key={cat.key} className="video-category-section">
                  <div className="video-category-header">
                    <h3 className="video-category-title">
                      {cat.emoji} {lang === 'es' ? cat.nameEs : cat.name}
                    </h3>
                    <button
                      className="video-category-see-all"
                      onClick={() => setActiveCategory(cat.key)}
                    >
                      {lang === 'es' ? 'Ver todos' : 'See all'}
                    </button>
                  </div>
                  <div className="template-row">
                    {catTemplates.map(template => (
                      <Link key={template.id} href={`/videos/create?template=${template.id}`} style={{ textDecoration: 'none' }}>
                        <div className="template-mini-card">
                          <span className="template-mini-emoji">{template.emoji}</span>
                          <span className="template-mini-name">
                            {lang === 'es' ? (template.nameEs || template.name) : template.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}

        <p className="app-footer">{t.madeWithLove}</p>
      </div>

      <CreditsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAddCredits={handleAddCredits}
        t={{
          ...t,
          outOfCredits: t.outOfVideoCredits,
          getMoreToKeep: t.getMoreVideoToKeep,
          starter: t.videoStarter,
          popular: t.videoPopular,
          best: t.videoBest,
          freeCreditsAdded: t.freeVideoCreditsAdded,
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
