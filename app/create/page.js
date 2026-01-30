'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { STYLES, STYLE_VARIANTS, NEGATIVE_PROMPT, SHOWCASE_EXAMPLES, selectRandomVariant } from '../lib/styles'
import { getTranslation, getStoredLanguage } from '../lib/translations'
import { useCredits } from '../lib/useCredits'
import { useGallery } from '../lib/useGallery'
import Toast from '../components/Toast'
import Confetti from '../components/Confetti'
import CreditsBadge from '../components/CreditsBadge'
import CreditsModal from '../components/CreditsModal'

const GENERATING_MESSAGES_EN = [
  'Mixing the perfect colors...',
  'Adding some magic...',
  'Your pet is becoming a legend...',
  'Almost there, this is gonna be good...',
  'Putting on the finishing touches...',
]

const GENERATING_MESSAGES_ES = [
  'Mezclando los colores perfectos...',
  'Agregando algo de magia...',
  'Tu mascota se esta convirtiendo en leyenda...',
  'Casi listo, esto va a quedar increible...',
  'Dando los toques finales...',
]

export default function CreatePage() {
  const searchParams = useSearchParams()

  // Language
  const [lang, setLang] = useState('en')
  useEffect(() => {
    setLang(getStoredLanguage())
    const handler = () => setLang(getStoredLanguage())
    window.addEventListener('lang-change', handler)
    return () => window.removeEventListener('lang-change', handler)
  }, [])
  const t = getTranslation(lang)
  const genMessages = lang === 'es' ? GENERATING_MESSAGES_ES : GENERATING_MESSAGES_EN

  // Credits & Gallery
  const { credits, showModal, setShowModal, spend, addFree } = useCredits()
  const gallery = useGallery()

  // ─── State ───
  const [step, setStep] = useState('upload')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)

  const [dogAttributes, setDogAttributes] = useState(null)
  const [detectionError, setDetectionError] = useState(null)

  const [humanMode, setHumanMode] = useState('include_styled')
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [strictness, setStrictness] = useState('balanced')

  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const [isDragging, setIsDragging] = useState(false)
  const [showZoom, setShowZoom] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [toast, setToast] = useState(null)
  const [genMessage, setGenMessage] = useState(genMessages[0])

  const fileInputRef = useRef(null)

  // Showcase carousel
  const [showcaseIndex, setShowcaseIndex] = useState(0)
  const [showcaseProgress, setShowcaseProgress] = useState(0)

  // Pre-select style from URL params (from home page)
  useEffect(() => {
    const styleParam = searchParams.get('style')
    if (styleParam && STYLES.find(s => s.id === styleParam)) {
      setSelectedStyle(styleParam)
      setSelectedVariant(selectRandomVariant(styleParam))
    }
  }, [searchParams])

  // Rotating generating messages
  useEffect(() => {
    if (step !== 'generating') return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % genMessages.length
      setGenMessage(genMessages[i])
    }, 4000)
    return () => clearInterval(interval)
  }, [step, genMessages])

  // Confetti on result
  useEffect(() => {
    if (step === 'result') {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Showcase carousel
  useEffect(() => {
    if (step !== 'upload') return
    const raf = requestAnimationFrame(() => setShowcaseProgress(100))
    const interval = setInterval(() => {
      setShowcaseProgress(0)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setShowcaseProgress(100))
      })
      setShowcaseIndex(prev => (prev + 1) % SHOWCASE_EXAMPLES.length)
    }, 2000)
    return () => {
      clearInterval(interval)
      cancelAnimationFrame(raf)
    }
  }, [step])

  // ─── Core Functions (ALL LOGIC UNCHANGED) ───
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const processFile = (file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const maxSize = 1024
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize
            width = maxSize
          } else {
            width = (width / height) * maxSize
            height = maxSize
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const base64 = canvas.toDataURL('image/jpeg', 0.9)
        setImagePreview(base64)
        setImageBase64(base64.split(',')[1])
        setImage(file)

        runDetection(base64.split(',')[1])
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const runDetection = async (base64) => {
    setStep('detecting')
    setDetectionError(null)

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })

      const data = await response.json()

      if (data.error) {
        setDetectionError(data.error)
        setStep('upload')
        return
      }

      setDogAttributes(data)
      setStep('review')
    } catch (err) {
      setDetectionError('Detection failed. Please try again.')
      setStep('upload')
    }
  }

  const buildIdentityAnchor = () => {
    if (!dogAttributes || !dogAttributes.dogs || dogAttributes.dogs.length === 0) {
      return ''
    }

    const dog = dogAttributes.dogs[0]
    let parts = []

    parts.push(`a ${dog.size_build?.size || ''} ${dog.breed_guess || 'dog'}`)

    if (dog.coat_texture && dog.coat_length) {
      parts.push(`with ${dog.pattern_type?.replace('_', ' ') || ''} ${dog.coat_texture} ${dog.coat_length} coat`)
    }

    parts.push(`primarily ${dog.primary_fur_color || 'colored'}`)
    if (dog.secondary_fur_color) {
      parts.push(`with ${dog.secondary_fur_color} accents`)
    }

    if (dog.distinctive_markings && dog.distinctive_markings.length > 0) {
      const markings = dog.distinctive_markings.map(m =>
        `${m.type?.replace('_', ' ')} (${m.color})`
      ).join(', ')
      parts.push(`distinctive markings: ${markings}`)
    }

    if (dog.ears?.type) {
      parts.push(`${dog.ears.type.replace('_', ' ')} ears`)
    }
    if (dog.muzzle?.type) {
      let muzzleDesc = `${dog.muzzle.type} muzzle`
      if (dog.muzzle.beard) muzzleDesc += ' with beard'
      parts.push(muzzleDesc)
    }

    return `CRITICAL IDENTITY: This is ${parts.join('. ')}. Preserve ALL these traits exactly.`
  }

  const buildHumanBlock = () => {
    if (!dogAttributes?.humans_detected || humanMode === 'dog_only') {
      return ''
    }

    if (humanMode === 'remove') {
      return 'The dog is alone, no humans present.'
    }

    let humanParts = []
    dogAttributes.humans?.forEach((human, i) => {
      let desc = `Human ${i + 1}: `
      if (human.face_visible) {
        desc += 'face visible - preserve facial features, '
      } else {
        desc += 'face not fully visible - preserve silhouette/clothing style, '
      }
      desc += `apparent ${human.apparent_age_range || 'adult'}, `
      desc += `${human.pose?.replace('_', ' ') || 'standing'} pose`
      humanParts.push(desc)
    })

    return `HUMAN STYLING: Apply the same style to humans present. Preserve human identity (do not change gender, age, ethnicity, body type). ${humanParts.join('. ')}`
  }

  const buildFinalPrompt = () => {
    const identityAnchor = buildIdentityAnchor()
    const humanBlock = buildHumanBlock()

    let styleBlock = ''
    if (useCustomPrompt) {
      const strictnessInstructions = {
        strict: 'The dog MUST look exactly like the original photo. Same breed, same exact fur colors, same markings in same positions, same ear type, same muzzle shape. Only the scenario/clothing/setting can change.',
        balanced: 'The dog should be clearly recognizable as the same dog. Preserve breed, general coloring, and key distinctive features. Minor stylization of fur texture or proportions is acceptable for artistic effect.',
        wild: 'The dog should still be identifiable as the same dog to the owner. Keep the general breed appearance and most distinctive features, but creative interpretation of colors, proportions, and style is encouraged.',
      }

      styleBlock = `
User's creative vision: ${customPrompt}

STRICTNESS LEVEL: ${strictness.toUpperCase()}
${strictnessInstructions[strictness]}

Keep the image family-friendly. No gore, violence, explicit content, or offensive stereotypes.`
    } else {
      const style = STYLES.find(s => s.id === selectedStyle)
      styleBlock = `${style.skeleton}\n\n${selectedVariant.prompt}`
    }

    const qualityBlock = 'High quality, detailed, professional rendering. Sharp focus on the subject. Coherent composition. Appropriate lighting for the scene.'

    let finalPrompt = identityAnchor
    if (humanBlock) {
      finalPrompt += `\n\n${humanBlock}`
    }
    finalPrompt += `\n\nSCENE AND STYLE:\n${styleBlock}\n\nQUALITY:\n${qualityBlock}`

    return finalPrompt
  }

  const handleGenerate = async () => {
    // Check credits
    if (!spend()) return

    setStep('generating')
    setError(null)
    setProgress(0)

    const prompt = buildFinalPrompt()

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90))
    }, 2000)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          prompt: prompt,
          negative_prompt: NEGATIVE_PROMPT,
        }),
      })

      clearInterval(progressInterval)

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setStep('style')
        return
      }

      setProgress(100)
      setResult(data.image)

      // Save to gallery
      const styleName = selectedStyle || 'custom'
      const variantTitle = selectedVariant?.title || 'Custom'
      gallery.add({
        imageUrl: data.image,
        style: styleName,
        variant: variantTitle,
      })

      setToast(t.creditUsed)
      setStep('result')
    } catch (err) {
      clearInterval(progressInterval)
      setError('Generation failed. Please try again.')
      setStep('style')
    }
  }

  const handleStyleSelect = (styleId) => {
    setSelectedStyle(styleId)
    setSelectedVariant(selectRandomVariant(styleId))
    setUseCustomPrompt(false)
  }

  const handleRegenerate = () => {
    if (selectedStyle) {
      setSelectedVariant(selectRandomVariant(selectedStyle))
    }
    handleGenerate()
  }

  const handleReset = () => {
    setStep('upload')
    setImage(null)
    setImagePreview(null)
    setImageBase64(null)
    setDogAttributes(null)
    setSelectedStyle(null)
    setSelectedVariant(null)
    setUseCustomPrompt(false)
    setCustomPrompt('')
    setResult(null)
    setError(null)
  }

  // ─── Drag & Drop ───
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
  }, [])

  // ─── Share / Save ───
  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(result)
        const blob = await response.blob()
        const file = new File([blob], 'pet-portrait.jpg', { type: 'image/jpeg' })
        await navigator.share({
          title: 'My Pet Portrait',
          text: t.shareText,
          files: [file],
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          fallbackShare()
        }
      }
    } else {
      fallbackShare()
    }
  }

  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setToast(t.linkCopied)
    } catch {
      setToast(t.longPressToSave)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(result)
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

  const handleAddCredits = () => {
    addFree(3)
    setToast(t.freeCreditsAdded)
  }

  // ─── Detection Summary ───
  const renderDetectionSummary = () => {
    if (!dogAttributes) return null
    const dog = dogAttributes.dogs?.[0]
    if (!dog) return null

    return (
      <div className="detection-card">
        <h3 className="detection-title">{t.detectedTraits}</h3>
        <div className="trait-grid">
          <div className="trait-item">
            <span className="trait-label">{t.breed}</span>
            <span className="trait-value">{dog.breed_guess || 'Unknown'}</span>
            {dog.breed_confidence && (
              <div className="trait-confidence">
                <div
                  className="trait-confidence-fill"
                  style={{ width: `${Math.round(dog.breed_confidence * 100)}%` }}
                />
              </div>
            )}
          </div>
          <div className="trait-item">
            <span className="trait-label">{t.furColor}</span>
            <span className="trait-value">
              {dog.primary_fur_color}{dog.secondary_fur_color ? ` & ${dog.secondary_fur_color}` : ''}
            </span>
          </div>
          <div className="trait-item">
            <span className="trait-label">{t.coatType}</span>
            <span className="trait-value">{dog.coat_length} {dog.coat_texture}</span>
          </div>
          <div className="trait-item">
            <span className="trait-label">{t.pattern}</span>
            <span className="trait-value">{dog.pattern_type?.replace('_', ' ') || 'solid'}</span>
          </div>
          {dog.distinctive_markings?.length > 0 && (
            <div className="trait-item">
              <span className="trait-label">{t.markings}</span>
              <span className="trait-value">
                {dog.distinctive_markings.map(m => m.type?.replace('_', ' ')).join(', ')}
              </span>
            </div>
          )}
        </div>
        {dogAttributes.humans_detected && (
          <div className="human-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {dogAttributes.num_humans} human{dogAttributes.num_humans > 1 ? 's' : ''} detected
          </div>
        )}
      </div>
    )
  }

  // ─── SVG Icons ───
  const CameraIcon = () => (
    <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )

  const PaletteIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill="#f472b6" stroke="#f472b6" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="#10b981" stroke="#10b981" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="#fbbf24" stroke="#fbbf24" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="#06b6d4" stroke="#06b6d4" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  )

  // Localized style name
  const getStyleName = (style) => {
    return lang === 'es' ? (style.nameEs || style.name) : style.name
  }

  const getStyleDesc = (style) => {
    return lang === 'es' ? (style.descriptionEs || style.description) : style.description
  }

  // ─── Render ───
  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <header className="create-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="create-title">{t.appName}</h1>
              <p className="create-subtitle">{t.letsMakeMagic}</p>
            </div>
            <CreditsBadge credits={credits} onClick={() => setShowModal(true)} />
          </div>
        </header>

        {/* SHOWCASE */}
        {step === 'upload' && (
          <div className="showcase" key="showcase">
            <div className="showcase-viewport">
              <div className="showcase-glow" />
              <div
                className={`showcase-progress ${showcaseProgress > 0 ? 'showcase-progress-animate' : ''}`}
                style={{ width: `${showcaseProgress}%` }}
              />
              <div className="showcase-track">
                {SHOWCASE_EXAMPLES.map((ex, i) => (
                  <div
                    key={ex.src}
                    className={`showcase-slide ${i === showcaseIndex ? 'showcase-slide-active' : ''}`}
                  >
                    <img src={ex.src} alt={lang === 'es' ? (ex.nameEs || ex.name) : ex.name} />
                  </div>
                ))}
              </div>
              <div className="showcase-label">
                <span className="showcase-style-name">
                  {SHOWCASE_EXAMPLES[showcaseIndex].emoji}{' '}
                  {lang === 'es'
                    ? (SHOWCASE_EXAMPLES[showcaseIndex].nameEs || SHOWCASE_EXAMPLES[showcaseIndex].name)
                    : SHOWCASE_EXAMPLES[showcaseIndex].name
                  }
                </span>
                <div className="showcase-dots">
                  {SHOWCASE_EXAMPLES.map((_, i) => (
                    <div
                      key={i}
                      className={`showcase-dot ${i === showcaseIndex ? 'showcase-dot-active' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD */}
        {step === 'upload' && (
          <div className="card step-enter" key="upload">
            <div
              className={`upload-zone ${isDragging ? 'upload-zone-dragging' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CameraIcon />
              <p className="upload-text">{t.dropFavoritePhoto}</p>
              <p className="upload-hint">{t.orTapToBrowse}</p>
              <div className="upload-tips">
                <div className="upload-tip">
                  <div className="upload-tip-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07-2.83 2.83M9.76 14.24l-2.83 2.83m12.14 0-2.83-2.83M9.76 9.76 6.93 6.93"/></svg>
                  </div>
                  <span className="upload-tip-label">{t.goodLighting}</span>
                </div>
                <div className="upload-tip">
                  <div className="upload-tip-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
                  </div>
                  <span className="upload-tip-label">{t.clearFace}</span>
                </div>
                <div className="upload-tip">
                  <div className="upload-tip-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  </div>
                  <span className="upload-tip-label">{t.closeUpWorksBest}</span>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {detectionError && (
              <div className="error-message">{detectionError}</div>
            )}
          </div>
        )}

        {/* DETECTING */}
        {step === 'detecting' && (
          <div className="card step-enter" key="detecting">
            <div className="preview-wrapper preview-image-detecting">
              <img src={imagePreview} alt="Uploaded" className="preview-image" />
            </div>
            <div className="loading-dots">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
            <p className="loading-text">{t.meetingYourPet}</p>
            <p className="loading-subtext">{t.analyzingFeatures}</p>
            <div className="skeleton-grid">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          </div>
        )}

        {/* REVIEW */}
        {step === 'review' && (
          <div className="card step-enter" key="review">
            <div className="preview-wrapper">
              <img src={imagePreview} alt="Your pet" className="preview-image" />
            </div>
            {renderDetectionSummary()}

            {dogAttributes?.humans_detected && (
              <div className="human-options">
                <p className="option-label">{t.weSpottedHuman}</p>
                <div className="option-grid">
                  <button
                    className={`option-btn ${humanMode === 'include_styled' ? 'option-btn-selected' : ''}`}
                    onClick={() => setHumanMode('include_styled')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {t.styleThemTogether}
                  </button>
                  <button
                    className={`option-btn ${humanMode === 'remove' ? 'option-btn-selected' : ''}`}
                    onClick={() => setHumanMode('remove')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/></svg>
                    {t.justThePet}
                  </button>
                </div>
              </div>
            )}

            <button className="btn btn-primary" onClick={() => setStep('style')}>
              {t.continueToStyles}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button className="btn btn-ghost" onClick={handleReset}>
              {t.uploadDifferent}
            </button>
          </div>
        )}

        {/* STYLE SELECTION */}
        {step === 'style' && (
          <div className="card step-enter" key="style">
            <h2 className="section-title">{t.pickYourVibe}</h2>
            <div className="style-grid">
              {STYLES.map(style => (
                <button
                  key={style.id}
                  className={`style-card ${selectedStyle === style.id ? 'style-card-selected' : ''}`}
                  onClick={() => handleStyleSelect(style.id)}
                >
                  <span className="style-emoji">{style.emoji}</span>
                  <span className="style-name">{getStyleName(style)}</span>
                  <span className="style-desc">{getStyleDesc(style)}</span>
                </button>
              ))}
            </div>

            <button
              className="custom-card"
              onClick={() => {
                setUseCustomPrompt(true)
                setStep('custom')
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              {t.writeCustomPrompt}
            </button>

            {selectedStyle && (
              <>
                <div className="variant-preview">
                  <div className="variant-info">
                    <span className="variant-label">{t.selected}</span>
                    <span className="variant-title">{selectedVariant?.title}</span>
                  </div>
                  <button
                    className="shuffle-btn"
                    onClick={() => setSelectedVariant(selectRandomVariant(selectedStyle))}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
                  </button>
                </div>
                <button className="btn btn-success" onClick={handleGenerate}>
                  {t.generatePortrait}
                </button>
              </>
            )}

            <button className="btn btn-ghost" onClick={() => setStep('review')}>
              {t.backToReview}
            </button>
          </div>
        )}

        {/* CUSTOM PROMPT */}
        {step === 'custom' && (
          <div className="card step-enter" key="custom">
            <h2 className="section-title">{t.customPrompt}</h2>
            <p className="custom-hint">{t.describeYourVision}</p>
            <textarea
              className="custom-textarea"
              placeholder={t.customPlaceholder}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />

            <div className="strictness-section">
              <p className="strictness-label">{t.identityPreservation}</p>
              <div className="segmented-control">
                {['strict', 'balanced', 'wild'].map(level => (
                  <button
                    key={level}
                    className={`segment ${strictness === level ? 'segment-selected' : ''}`}
                    onClick={() => setStrictness(level)}
                  >
                    {level === 'strict' && (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> {t.strict}</>
                    )}
                    {level === 'balanced' && (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> {t.balanced}</>
                    )}
                    {level === 'wild' && (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> {t.wild}</>
                    )}
                  </button>
                ))}
              </div>
              <p className="strictness-hint">
                {strictness === 'strict' && t.strictHint}
                {strictness === 'balanced' && t.balancedHint}
                {strictness === 'wild' && t.wildHint}
              </p>
            </div>

            <button
              className="btn btn-success"
              onClick={handleGenerate}
              disabled={!customPrompt.trim()}
            >
              {t.generatePortrait}
            </button>

            <button className="btn btn-ghost" onClick={() => {
              setUseCustomPrompt(false)
              setStep('style')
            }}>
              {t.backToStyles}
            </button>
          </div>
        )}

        {/* GENERATING */}
        {step === 'generating' && (
          <div className="card step-enter" key="generating">
            <div className="generating-center">
              <img src={imagePreview} alt="Your pet" className="generating-thumb" />
              <div className="generating-icon">
                <PaletteIcon />
              </div>
              <p className="generating-text">{t.creatingYourPortrait}</p>
              {selectedVariant && !useCustomPrompt && (
                <p className="generating-variant">"{selectedVariant.title}"</p>
              )}
              <p className="generating-message">{genMessage}</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="progress-time">{t.usuallyTakes}</p>
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === 'result' && (
          <div className="card step-enter" key="result">
            <div className="result-hero" onClick={() => setShowZoom(true)}>
              <img
                src={result}
                alt="Generated portrait"
                className="result-image result-image-zoomable"
              />
            </div>

            {selectedVariant && !useCustomPrompt && (
              <p className="result-title">
                {STYLES.find(s => s.id === selectedStyle)?.emoji}{' '}
                {selectedVariant.title}
              </p>
            )}

            <div className="btn-row">
              <button className="btn btn-success" onClick={handleSave}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {t.save}
              </button>
              <button className="btn btn-primary" onClick={handleShare}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                {t.share}
              </button>
            </div>

            <button className="btn btn-pink" onClick={handleRegenerate}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
              {t.newVersion}
            </button>

            <button className="btn btn-secondary" onClick={() => setStep('style')}>
              {t.differentStyle}
            </button>

            <button className="btn btn-ghost" onClick={handleReset}>
              {t.done}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-message">{error}</div>
        )}
      </div>

      {/* Zoom Modal */}
      {showZoom && (
        <div className="zoom-overlay" onClick={() => setShowZoom(false)}>
          <img src={result} alt="Zoomed portrait" className="zoom-image" />
          <button className="zoom-close" onClick={() => setShowZoom(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Confetti */}
      <Confetti trigger={showConfetti} />

      {/* Credits Modal */}
      <CreditsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAddCredits={handleAddCredits}
        t={t}
      />

      {/* Toast */}
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
