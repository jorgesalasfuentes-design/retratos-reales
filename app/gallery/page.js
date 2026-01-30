'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useGallery } from '../lib/useGallery'
import { getTranslation, getStoredLanguage } from '../lib/translations'
import { STYLES } from '../lib/styles'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

export default function GalleryPage() {
  const [lang, setLang] = useState('en')
  const { portraits, remove, refresh } = useGallery()
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setLang(getStoredLanguage())
    refresh()
    const handler = () => setLang(getStoredLanguage())
    window.addEventListener('lang-change', handler)
    return () => window.removeEventListener('lang-change', handler)
  }, [])

  const t = getTranslation(lang)

  const handleDelete = (id) => {
    remove(id)
    setSelected(null)
    setConfirmDelete(null)
    setToast(t.cleared)
  }

  const handleShare = async (imageUrl) => {
    if (navigator.share) {
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const file = new File([blob], 'pet-portrait.jpg', { type: 'image/jpeg' })
        await navigator.share({ title: 'Pet Portrait', text: t.shareText, files: [file] })
      } catch (err) {
        if (err.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(imageUrl)
            setToast(t.linkCopied)
          } catch {
            setToast(t.longPressToSave)
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(imageUrl)
        setToast(t.linkCopied)
      } catch {
        setToast(t.longPressToSave)
      }
    }
  }

  const handleSave = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pet-portrait.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setToast(t.portraitSaved)
    } catch {
      setToast(t.longPressToSave)
    }
  }

  const getStyleName = (styleId) => {
    const style = STYLES.find(s => s.id === styleId)
    if (!style) return styleId
    return lang === 'es' ? (style.nameEs || style.name) : style.name
  }

  const getStyleEmoji = (styleId) => {
    const style = STYLES.find(s => s.id === styleId)
    return style?.emoji || ''
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="gallery-header">
          <h1 className="gallery-title">{t.yourMasterpieces}</h1>
          {portraits.length > 0 && (
            <span className="gallery-count">{portraits.length} {t.portraitsCreated}</span>
          )}
        </div>

        {portraits.length === 0 ? (
          <div className="gallery-empty">
            <div className="gallery-empty-emoji">&#x1F3A8;</div>
            <h2 className="gallery-empty-title">{t.noPortraitsYet}</h2>
            <p className="gallery-empty-text">{t.galleryWaiting}</p>
            <Link href="/create" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '14px 32px' }}>
              {t.createYourFirst}
            </Link>
          </div>
        ) : (
          <div className="gallery-grid">
            {portraits.map((p, i) => (
              <button
                key={p.id}
                className="gallery-item"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setSelected(p)}
              >
                <img src={p.imageUrl} alt={p.style} loading="lazy" />
                <div className="gallery-item-overlay">
                  <span className="gallery-item-style">
                    {getStyleEmoji(p.style)} {getStyleName(p.style)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setConfirmDelete(null) }}>
        {selected && (
          <div className="gallery-detail">
            <img src={selected.imageUrl} alt={selected.style} className="gallery-detail-img" />
            <h3 className="gallery-detail-style">
              {getStyleEmoji(selected.style)} {getStyleName(selected.style)}
            </h3>
            {selected.variant && (
              <p className="gallery-detail-variant">{selected.variant}</p>
            )}
            <p className="gallery-detail-date">
              {t.created} {new Date(selected.createdAt).toLocaleDateString()}
            </p>

            <div className="btn-row">
              <button className="btn btn-success btn-sm" onClick={() => handleSave(selected.imageUrl)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {t.save}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleShare(selected.imageUrl)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                {t.share}
              </button>
            </div>

            {confirmDelete === selected.id ? (
              <div className="confirm-dialog mt-md">
                <p className="confirm-title">{t.deleteConfirm}</p>
                <div className="confirm-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(null)}>
                    {t.cancel}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>
                    {t.delete}
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm mt-md" onClick={() => setConfirmDelete(selected.id)}>
                {t.delete}
              </button>
            )}
          </div>
        )}
      </Modal>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
