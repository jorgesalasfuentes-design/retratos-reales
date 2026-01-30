'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTranslation, getStoredLanguage } from '../../lib/translations'
import { PODCAST_QUESTIONS, NAOMI_CHARACTER } from '../../lib/videoTemplates'
import { useVideoCredits } from '../../lib/useVideoCredits'
import CreditsModal from '../../components/CreditsModal'
import Toast from '../../components/Toast'

export default function PodcastPage() {
  const [lang, setLang] = useState('en')
  const { credits, showModal, setShowModal, addFree } = useVideoCredits()
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setLang(getStoredLanguage())
    const handler = () => setLang(getStoredLanguage())
    window.addEventListener('lang-change', handler)
    return () => window.removeEventListener('lang-change', handler)
  }, [])

  const t = getTranslation(lang)

  const handleAddCredits = () => {
    addFree(2)
    setToast(t.freeVideoCreditsAdded)
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Podcast Hero */}
        <div className="podcast-hero">
          <img src={NAOMI_CHARACTER.image} alt="Naomi" className="podcast-hero-avatar" />
          <h1 className="podcast-hero-title">{t.podcastTitle}</h1>
          <p className="podcast-hero-subtitle">{t.podcastSubtitle}</p>
          <div className="podcast-hero-badge">
            <span>🎙️ {t.podcastCost}</span>
          </div>
        </div>

        {/* Description */}
        <div className="card mb-lg">
          <p className="podcast-description">{t.podcastDescription}</p>
        </div>

        {/* Questions */}
        <h2 className="section-title">{t.chooseQuestion}</h2>
        <div className="podcast-questions">
          {PODCAST_QUESTIONS.map(q => (
            <Link
              key={q.id}
              href={`/videos/podcast/create?question=${encodeURIComponent(q.question[lang] || q.question.en)}&qid=${q.id}`}
              className="podcast-question-card"
            >
              <span className="podcast-question-emoji">{q.emoji}</span>
              <span className="podcast-question-text">
                {q.question[lang] || q.question.en}
              </span>
              <svg className="settings-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          ))}
        </div>

        {/* Custom question */}
        <Link
          href="/videos/podcast/create?custom=true"
          className="btn btn-ghost mt-md"
        >
          ✏️ {t.orWriteYourOwn}
        </Link>

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
          freeCreditsAdded: t.freeVideoCreditsAdded,
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
