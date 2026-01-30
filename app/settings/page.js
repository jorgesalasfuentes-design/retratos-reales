'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTranslation, getStoredLanguage, setStoredLanguage } from '../lib/translations'
import { useCredits } from '../lib/useCredits'
import { clearGallery, resetAll } from '../lib/storage'
import CreditsModal from '../components/CreditsModal'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

export default function SettingsPage() {
  const [lang, setLang] = useState('en')
  const { credits, showModal, setShowModal, addFree } = useCredits()
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setLang(getStoredLanguage())
  }, [])

  const t = getTranslation(lang)

  const handleLangChange = (newLang) => {
    setLang(newLang)
    setStoredLanguage(newLang)
    window.dispatchEvent(new Event('lang-change'))
  }

  const handleClearGallery = () => {
    clearGallery()
    setConfirmClear(false)
    setToast(t.cleared)
  }

  const handleResetAll = () => {
    resetAll()
    setConfirmReset(false)
    setToast(t.resetDone)
    setTimeout(() => window.location.reload(), 1000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t.appName, text: t.tellFriendsText })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(t.tellFriendsText)
        setToast(t.linkCopied)
      } catch {}
    }
  }

  const handleAddCredits = () => {
    addFree(3)
    setToast(t.freeCreditsAdded)
  }

  const ChevronRight = () => (
    <svg className="settings-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  )

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="settings-header">
          <h1 className="settings-title">{t.settings}</h1>
        </div>

        {/* Account / Credits */}
        <div className="settings-section">
          <p className="settings-section-title">{t.yourAccount}</p>
          <div className="settings-credits-row">
            <div className="settings-credits-info">
              <span className="settings-credits-count">{credits}</span>
              <span className="settings-credits-label">{t.creditsRemaining}</span>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
              {t.getMoreCredits}
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <p className="settings-section-title">{t.preferences}</p>
          <div className="settings-group">
            <div className="settings-row">
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <span>{t.language}</span>
              </div>
              <div className="lang-toggle">
                <button
                  className={`lang-option ${lang === 'en' ? 'lang-option-active' : ''}`}
                  onClick={() => handleLangChange('en')}
                >
                  {t.english}
                </button>
                <button
                  className={`lang-option ${lang === 'es' ? 'lang-option-active' : ''}`}
                  onClick={() => handleLangChange('es')}
                >
                  {t.spanish}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <p className="settings-section-title">{t.aboutApp}</p>
          <div className="settings-group">
            <div className="settings-row">
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <span>{t.version}</span>
              </div>
              <span className="settings-row-value">{t.madeWithLove}</span>
            </div>
            <button className="settings-row" onClick={() => setToast(t.comingSoon)}>
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <span>{t.rateUs}</span>
              </div>
              <ChevronRight />
            </button>
            <button className="settings-row" onClick={handleShare}>
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </div>
                <span>{t.tellFriends}</span>
              </div>
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* Help */}
        <div className="settings-section">
          <p className="settings-section-title">{t.help}</p>
          <div className="settings-group">
            <a className="settings-row" href="mailto:hola@retratosreales.com">
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <span>{t.contactUs}</span>
              </div>
              <ChevronRight />
            </a>
            <Link className="settings-row" href="/privacy">
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span>{t.privacyPolicy}</span>
              </div>
              <ChevronRight />
            </Link>
            <Link className="settings-row" href="/terms">
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <span>{t.terms}</span>
              </div>
              <ChevronRight />
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section">
          <p className="settings-section-title">{t.dangerZone}</p>
          <div className="settings-group">
            <button className="settings-row" onClick={() => setConfirmClear(true)}>
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </div>
                <span className="settings-row-danger">{t.clearGallery}</span>
              </div>
              <ChevronRight />
            </button>
            <button className="settings-row" onClick={() => setConfirmReset(true)}>
              <div className="settings-row-left">
                <div className="settings-row-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <span className="settings-row-danger">{t.resetEverything}</span>
              </div>
              <ChevronRight />
            </button>
          </div>
        </div>

        <p className="app-footer">Retratos Reales v2.0</p>
      </div>

      {/* Clear Gallery Confirm */}
      <Modal open={confirmClear} onClose={() => setConfirmClear(false)}>
        <div className="confirm-dialog">
          <p className="confirm-title">{t.clearGalleryConfirm}</p>
          <div className="confirm-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(false)}>{t.cancel}</button>
            <button className="btn btn-danger btn-sm" onClick={handleClearGallery}>{t.clearGallery}</button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirm */}
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)}>
        <div className="confirm-dialog">
          <p className="confirm-title">{t.resetConfirm}</p>
          <div className="confirm-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>{t.cancel}</button>
            <button className="btn btn-danger btn-sm" onClick={handleResetAll}>{t.resetEverything}</button>
          </div>
        </div>
      </Modal>

      {/* Credits Modal */}
      <CreditsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAddCredits={handleAddCredits}
        t={t}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
