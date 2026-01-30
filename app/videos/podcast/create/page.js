'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getTranslation, getStoredLanguage } from '../../../lib/translations'
import { NAOMI_CHARACTER } from '../../../lib/videoTemplates'
import { useVideoCredits } from '../../../lib/useVideoCredits'
import { addToVideoGallery } from '../../../lib/storage'
import VideoPlayer from '../../../components/VideoPlayer'
import CreditsModal from '../../../components/CreditsModal'
import Toast from '../../../components/Toast'
import Confetti from '../../../components/Confetti'

function PodcastCreateContent() {
  const searchParams = useSearchParams()
  const presetQuestion = searchParams.get('question') || ''
  const isCustom = searchParams.get('custom') === 'true'

  const [lang, setLang] = useState('en')
  const [step, setStep] = useState('setup') // setup | generating | result
  const [question, setQuestion] = useState(presetQuestion)
  const [guestImage, setGuestImage] = useState(null)
  const [guestImageBase64, setGuestImageBase64] = useState(null)
  const [naomiAnswer, setNaomiAnswer] = useState('')
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

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setGuestImage(url)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      setGuestImageBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!guestImageBase64 || !question.trim()) return

    if (!spend(3)) return

    setStep('generating')
    setProgress(0)
    setError(null)

    const messages = [
      t.generatingEpisode,
      t.naomiThinking,
      t.videoMixingAudio,
      t.videoAnimating,
      t.videoAlmostDone,
    ]

    let msgIndex = 0
    setGenMessage(messages[0])
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length
      setGenMessage(messages[msgIndex])
    }, 8000)

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1.5, 90))
    }, 2000)

    try {
      // Helper to safely parse JSON responses
      const safeJson = async (res, label) => {
        const text = await res.text()
        try {
          return JSON.parse(text)
        } catch {
          console.error(`[podcast-create] ${label} non-JSON (${res.status}):`, text.slice(0, 200))
          throw new Error(`${label} failed: ${text.slice(0, 80)}`)
        }
      }

      const pollVideoStatus = async (requestId, statusUrl, onProgress) => {
        const maxAttempts = 120
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise(r => setTimeout(r, 5000))
          const pct = Math.min(55 + Math.floor((i / maxAttempts) * 40), 95)
          onProgress(pct)

          const res = await fetch('/api/video/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId, statusUrl }),
          })
          const data = await safeJson(res, 'Video status')
          if (!res.ok) throw new Error(data.error || 'Status check failed')

          if (data.status === 'completed') return data.videoUrl
          if (data.status === 'failed') throw new Error(data.error || 'Video generation failed')
        }
        throw new Error('Video generation timed out')
      }

      // Step 1: Get Naomi's answer via Claude
      setProgress(10)
      const answerRes = await fetch('/api/podcast/naomi-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang }),
      })

      const answerData = await safeJson(answerRes, 'Naomi answer')
      if (!answerRes.ok) throw new Error(answerData.error || 'Failed to get Naomi answer')

      setNaomiAnswer(answerData.answer)
      setProgress(25)

      // Step 2: Generate TTS for Naomi's answer
      const fullScript = `${question} ... ${answerData.answer}`
      const ttsRes = await fetch('/api/video/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullScript }),
      })

      const ttsData = await safeJson(ttsRes, 'TTS')
      if (!ttsRes.ok) throw new Error(ttsData.error || 'TTS failed')

      setProgress(50)

      // Step 3: Generate podcast video with split-screen prompt
      const podcastPrompt = `Professional podcast studio setup with warm lighting and slight bokeh background. Two dogs side by side behind large professional studio microphones. Split-screen podcast format, left side (45%) shows the guest pet being interviewed, right side (55%) shows a white Miniature Schnauzer with a pink floral bandana (Naomi, the host). "El Podcast de Naomi" text overlay at top. 24K Mic Talk TikTok podcast style. Both dogs positioned behind/next to large studio microphones. 9:16 vertical video format.`

      const videoRes = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: guestImageBase64,
          type: 'podcast',
          script: fullScript,
          scenePrompt: podcastPrompt,
          duration: 5,
          audioUrl: ttsData.audioUrl,
        }),
      })

      const videoData = await safeJson(videoRes, 'Video generate')
      if (!videoRes.ok) throw new Error(videoData.error || 'Video generation failed')

      let finalVideoUrl = videoData.videoUrl

      if (videoData.status === 'queued' && videoData.requestId) {
        setProgress(55)
        finalVideoUrl = await pollVideoStatus(videoData.requestId, videoData.statusUrl, (p) => setProgress(p))
      }

      clearInterval(progressInterval)
      setProgress(100)
      setVideoUrl(finalVideoUrl)

      addToVideoGallery({
        videoUrl: finalVideoUrl,
        thumbnailUrl: guestImage,
        templateId: 'podcast',
        templateName: 'El Podcast de Naomi',
        type: 'podcast',
      })

      setStep('result')
      setShowConfetti(true)
      setToast(t.episodeReady)
    } catch (err) {
      console.error('Podcast generation error:', err)
      setError(err.message)
      setStep('setup')
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
        const file = new File([blob], 'podcast-naomi.mp4', { type: 'video/mp4' })
        await navigator.share({ title: t.podcastTitle, text: t.shareText, files: [file] })
      } catch (err) {
        if (err.name !== 'AbortError') {
          try { await navigator.clipboard.writeText(videoUrl); setToast(t.linkCopied) } catch {}
        }
      }
    } else {
      try { await navigator.clipboard.writeText(videoUrl); setToast(t.linkCopied) } catch {}
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
      a.download = 'podcast-naomi.mp4'
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
        <div className="podcast-create-header">
          <img src={NAOMI_CHARACTER.image} alt="Naomi" className="podcast-create-avatar" />
          <h1 className="create-title">{t.podcastTitle}</h1>
          <p className="create-subtitle">{t.podcastDescription}</p>
        </div>

        {/* SETUP STEP */}
        {step === 'setup' && (
          <div className="step-enter">
            {/* Question */}
            <div className="card mb-md">
              <p className="strictness-label">{t.chooseQuestion}</p>
              {isCustom || !presetQuestion ? (
                <textarea
                  className="custom-textarea"
                  placeholder={t.customQuestionPlaceholder}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                />
              ) : (
                <div className="podcast-selected-question">
                  <p className="podcast-question-display">&quot;{question}&quot;</p>
                  <Link href="/videos/podcast" className="text-sm text-secondary">
                    {t.changeStyle}
                  </Link>
                </div>
              )}
            </div>

            {/* Guest Photo */}
            <div className="card mb-md">
              <p className="strictness-label">{t.guestPhoto}</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {guestImage ? (
                <div className="podcast-guest-preview">
                  <img src={guestImage} alt="Guest" className="podcast-guest-img" />
                  <button className="btn btn-ghost btn-sm" onClick={() => { setGuestImage(null); setGuestImageBase64(null) }}>
                    {t.uploadDifferent}
                  </button>
                </div>
              ) : (
                <button className="upload-zone" onClick={() => fileRef.current?.click()} style={{ padding: '32px 24px' }}>
                  <div className="upload-icon" style={{ marginBottom: 12 }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className="upload-text" style={{ fontSize: 15 }}>{t.uploadGuestPhoto}</p>
                </button>
              )}
            </div>

            {/* Cost info */}
            <div className="video-meta-row mb-md">
              <div className="video-meta-item">
                <span className="video-meta-label">{lang === 'es' ? 'Tipo' : 'Type'}</span>
                <span className="video-meta-value">🎙️ {t.podcastVideo}</span>
              </div>
              <div className="video-meta-item">
                <span className="video-meta-label">{lang === 'es' ? 'Duracion' : 'Duration'}</span>
                <span className="video-meta-value">{t.duration5s}</span>
              </div>
              <div className="video-meta-item">
                <span className="video-meta-label">{t.videoCost}</span>
                <span className="video-meta-value">3 {t.credits}</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={!guestImageBase64 || !question.trim()}
            >
              🎙️ {t.startEpisode}
            </button>

            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {/* GENERATING STEP */}
        {step === 'generating' && (
          <div className="card step-enter">
            <div className="generating-center">
              <div className="podcast-generating-avatars">
                {guestImage && (
                  <img src={guestImage} alt="Guest" className="podcast-gen-avatar podcast-gen-guest" />
                )}
                <img src={NAOMI_CHARACTER.image} alt="Naomi" className="podcast-gen-avatar podcast-gen-naomi" />
              </div>
              <p className="generating-text">{t.generatingEpisode}</p>
              {naomiAnswer && (
                <p className="podcast-naomi-preview">&quot;{naomiAnswer.slice(0, 100)}...&quot;</p>
              )}
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
              poster={guestImage}
              watermark={t.watermarkText}
            />

            <h3 className="result-title mt-md">🎙️ {t.podcastTitle}</h3>

            {naomiAnswer && (
              <div className="podcast-answer-card mb-md">
                <div className="podcast-answer-header">
                  <img src={NAOMI_CHARACTER.image} alt="Naomi" className="podcast-answer-avatar" />
                  <span className="podcast-answer-name">Naomi</span>
                </div>
                <p className="podcast-answer-text">&quot;{naomiAnswer}&quot;</p>
              </div>
            )}

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

            <Link href="/videos/podcast" className="btn btn-ghost mt-md">
              🎙️ {lang === 'es' ? 'Nuevo Episodio' : 'New Episode'}
            </Link>
            <Link href="/videos" className="btn btn-ghost">
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

export default function PodcastCreatePage() {
  return (
    <Suspense fallback={<div className="page-container"><div className="page-content"><div className="loading-dots"><div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" /></div></div></div>}>
      <PodcastCreateContent />
    </Suspense>
  )
}
