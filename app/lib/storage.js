// ─── LocalStorage Helpers ───
const GALLERY_KEY = 'rr_gallery'
const CREDITS_KEY = 'rr_credits'
const INITIAL_CREDITS = 3
const MAX_GALLERY = 100

function safeGet(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const val = localStorage.getItem(key)
    return val !== null ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key, value) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable
  }
}

// ─── Credits ───
export function getCredits() {
  return safeGet(CREDITS_KEY, INITIAL_CREDITS)
}

export function setCredits(n) {
  safeSet(CREDITS_KEY, n)
}

export function deductCredit() {
  const current = getCredits()
  if (current <= 0) return false
  setCredits(current - 1)
  return true
}

export function addCredits(n) {
  setCredits(getCredits() + n)
}

// ─── Gallery ───
export function getGallery() {
  return safeGet(GALLERY_KEY, [])
}

export function addToGallery(portrait) {
  const gallery = getGallery()
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    imageUrl: portrait.imageUrl,
    style: portrait.style,
    variant: portrait.variant,
    createdAt: new Date().toISOString(),
  }
  gallery.unshift(entry)
  // Cap at MAX_GALLERY
  if (gallery.length > MAX_GALLERY) {
    gallery.length = MAX_GALLERY
  }
  safeSet(GALLERY_KEY, gallery)
  return entry
}

export function removeFromGallery(id) {
  const gallery = getGallery().filter(p => p.id !== id)
  safeSet(GALLERY_KEY, gallery)
}

export function clearGallery() {
  safeSet(GALLERY_KEY, [])
}

export function resetAll() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GALLERY_KEY)
  localStorage.removeItem(CREDITS_KEY)
  localStorage.removeItem('rr_language')
}
