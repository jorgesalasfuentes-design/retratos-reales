'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getTranslation, getStoredLanguage } from '../../lib/translations'
import { getTemplateById } from '../../lib/videoTemplates'
import { useVideoCredits } from '../../lib/useVideoCredits'
import { addToVideoGallery } from '../../lib/storage'
import VideoPlayer from '../../components/VideoPlayer'
import CreditsModal from '../../components/CreditsModal'
import Toast from '../../components/Toast'
import Confetti from '../../components/Confetti'

function VideoCreateContent() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const template = templateId ? getTemplateById(templateId) : null

  const [lang, setLang] = useState('en')
  const [step, setStep] = useState('upload') // upload | customize | generating | result
  const [petImage, setPetImage] = useState(null)
  const [petImageBase64, setPetImageBase64] = useState(null)
  const [customScript, setCustomScript] = useState('')
  const [videoUrl, setVideoUrl] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [genMessage, setGenMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const { credits, showModal, setShowModal, spend, addFree } = useVideoCredits()
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    setLang(getStoredLanguage())
    const handler = () => setLang(getStoredLanguage())
    window.addEventListener('lang-change', handler)
    return () => window.removeEventListener('lang-change', handler)
  }, [])

  const t = getTranslation(lang)

  const templateName = template
    ? (lang === 'es' ? (template.nameEs || template.name) : template.name)
    : ''

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPetImage(url)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      setPetImageBase64(base64)
    }
    reader.readAsDataURL(file)

    // Skip to customize if template has custom script
    if (template?.isCustom) {
      setStep('customize')
    } else {
      setStep('customize')
    }
  }, [template])

  const getScript = () => {
    if (template?.isCustom) return customScript
    if (template?.script) return template.script[lang] || template.script.en
    return customScript
  }

  const handleGenerate = async () => {
    if (!petImageBase64) return

    const cost = template?.credits || 1
    if (!spend(cost)) return

    setStep('generating')
    setProgress(0)
    setError(null)

    const messages = lang === 'es'
      ? [t.generatingVideo, t.videoMixingAudio, t.videoAnimating, t.videoAlmostDone]
      : [t.generatingVideo, t.videoMixingAudio, t.videoAnimating, t.videoAlmostDone]

    let msgIndex = 0
    setGenMessage(messages[0])
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length
      setGenMessage(messages[msgIndex])
    }, 8000)

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 90))
    }, 1500)

    try {
      let audioUrl = null

      // Step 1: Generate TTS if talking type
      if (template?.type === 'talking' || template?.type === 'podcast' || !template?.type || template?.type !== 'scene') {
        const script = getScript()
        if (!script) {
          setError('Please enter a script')
          setStep('customize')
          clearInterval(msgInterval)
          clearInterval(progressInterval)
          return
        }

        const ttsRes = await fetch('/api/video/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: script }),
        })

        if (!ttsRes.ok) {
          const err = await ttsRes.json()
          throw new Error(err.error || 'TTS failed')
        }

        const ttsData = await ttsRes.json()
        audioUrl = ttsData.audioUrl
        setProgress(40)
      }

      // Step 2: Generate video
      const videoRes = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: petImageBase64,
          type: template?.type || 'talking',
          script: getScript(),
          scenePrompt: template?.scenePrompt,
          duration: template?.duration || 5,
          audioUrl,
        }),
      })

      clearInterval(progressInterval)
      setProgress(95)

      if (!videoRes.ok) {
        const err = await videoRes.json()
        throw new Error(err.error || 'Video generation failed')
      }

      const videoData = await videoRes.json()
      setVideoUrl(videoData.videoUrl)
      setProgress(100)

      // Save to gallery
      addToVideoGallery({
        videoUrl: videoData.videoUrl,
        thumbnailUrl: petImage,
        templateId: template?.id || 'custom',
        templateName: templateName || 'Custom Video',
        type: template?.type || 'talking',
      })

      setStep('result')
      setShowConfetti(true)
      setToast(t.videoSaved)
    } catch (err) {
      console.error('Video generation error:', err)
      setError(err.message)
      setStep('customize')
    } finally {
      clearInterval(msgInterval)
      clearInterval(progressInterval)
    }
  }

  const handleShare = async () => {
    if (!videoUrl) return
    if (navigator.share) {
      try {
        const response = await fetch(videoUrl)
        const blob = await response.blob()
        const file = new File([blob], 'pet-video.mp4', { type: 'video/mp4' })
        await navigator.share({ title: 'Pet Video', text: t.shareText, files: [file] })
      } catch (err) {
        if (err.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(videoUrl)
            setToast(t.linkCopied)
          } catch {
            setToast(t.linkCopied)
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(videoUrl)
        setToast(t.linkCopied)
      } catch {}
    }
  }

  const handleSave = async () => {
    if (!videoUrl) return
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pet-video.mp4'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setToast(t.videoSaved)
    } catch {
      setToast(t.linkCopied)
    }
  }

  const handleAddCredits = () => {
    addFree(2)
    setToast(t.freeVideoCreditsAdded)
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div className="create-header">
          <h1 className="create-title">
            {template ? `${template.emoji} ${templateName}` : t.newVideo}
          </h1>
          {template && !template.isCustom && (
            <p className="create-subtitle">
              {lang === 'es' ? (template.descriptionEs || template.description) : template.description}
            </p>
          )}
        </div>

        {/* UPLOAD STEP */}
        {step === 'upload' && (
          <div className="card step-enter">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button className="upload-zone" onClick={() => fileRef.current?.click()}>
              <div className="upload-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p className="upload-text">{t.uploadPetPhoto}</p>
              <p className="upload-hint">{t.uploadForVideo}</p>
            </button>

            {template && !template.isCustom && template.script && (
              <div className="video-script-preview mt-md">
                <p className="video-script-label">{lang === 'es' ? 'Guion:' : 'Script:'}</p>
                <p className="video-script-text">
                  &quot;{template.script[lang] || template.script.en}&quot;
                </p>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMIZE STEP */}
        {step === 'customize' && (
          <div className="card step-enter">
            {petImage && (
              <div className="preview-wrapper">
                <img src={petImage} alt="Pet" className="preview-image" />
              </div>
            )}

            {(template?.isCustom || !template) && (
              <div className="mb-md">
                <p className="strictness-label">{t.customScript}</p>
                <textarea
                  className="custom-textarea"
                  placeholder={template?.type === 'scene' ? t.customScenePlaceholder : t.customScriptPlaceholder}
                  value={customScript}
                  onChange={(e) => setCustomScript(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {template && !template.isCustom && template.script && (
              <div className="video-script-preview mb-md">
                <p className="video-script-label">{lang === 'es' ? 'Guion:' : 'Script:'}</p>
                <p className="video-script-text">
                  &quot;{template.script[lang] || template.script.en}&quot;
                </p>
              </div>
            )}

            <div className="video-meta-row mb-md">
              <div className="video-meta-item">
                <span className="video-meta-label">{lang === 'es' ? 'Tipo' : 'Type'}</span>
                <span className="video-meta-value">
                  {template?.type === 'scene' ? t.sceneVideo : t.talkingVideo}
                </span>
              </div>
              <div className="video-meta-item">
                <span className="video-meta-label">{lang === 'es' ? 'Duracion' : 'Duration'}</span>
                <span className="video-meta-value">
                  {(template?.duration || 5) === 5 ? t.duration5s : t.duration10s}
                </span>
              </div>
              <div className="video-meta-item">
                <span className="video-meta-label">{t.videoCost}</span>
                <span className="video-meta-value">
                  {template?.credits || 1} {t.videoCredit}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={template?.isCustom && !customScript.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              {t.generateVideo}
            </button>

            <button className="btn btn-ghost mt-sm" onClick={() => { setStep('upload'); setPetImage(null); setPetImageBase64(null) }}>
              {t.uploadDifferent}
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {/* GENERATING STEP */}
        {step === 'generating' && (
          <div className="card step-enter">
            <div className="generating-center">
              {petImage && (
                <img src={petImage} alt="Pet" className="generating-thumb" />
              )}
              <div className="generating-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <p className="generating-text">{t.generatingVideo}</p>
              <p className="generating-message">{genMessage}</p>
              <div className="progress-track" style={{ maxWidth: 280 }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="progress-time">{t.usuallyTakes}</p>
            </div>
          </div>
        )}

        {/* RESULT STEP */}
        {step === 'result' && videoUrl && (
          <div className="card step-enter">
            <VideoPlayer
              src={videoUrl}
              poster={petImage}
              watermark={t.watermarkText}
            />

            <h3 className="result-title mt-md">
              {template?.emoji} {templateName || t.videoReady}
            </h3>

            <div className="btn-row">
              <button className="btn btn-success btn-sm" onClick={handleSave}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t.saveVideo}
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleShare}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {t.shareVideo}
              </button>
            </div>

            <Link href="/videos" className="btn btn-ghost mt-md">
              {t.tryAnotherTemplate}
            </Link>
          </div>
        )}
      </div>

      <Confetti trigger={showConfetti} />

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

export default function VideoCreatePage() {
  return (
    <Suspense fallback={<div className="page-container"><div className="page-content"><div className="loading-dots"><div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" /></div></div></div>}>
      <VideoCreateContent />
    </Suspense>
  )
}
