'use client'
import { useState, useEffect, useCallback } from 'react'
import { getVideoCredits, setVideoCredits as storeSet, deductVideoCredits, addVideoCredits as storeAdd } from './storage'

export function useVideoCredits() {
  const [credits, setCreditsState] = useState(2)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setCreditsState(getVideoCredits())
  }, [])

  const spend = useCallback((n = 1) => {
    const current = getVideoCredits()
    if (current < n) {
      setShowModal(true)
      return false
    }
    deductVideoCredits(n)
    setCreditsState(current - n)
    return true
  }, [])

  const addFree = useCallback((n = 2) => {
    storeAdd(n)
    setCreditsState(prev => prev + n)
    setShowModal(false)
  }, [])

  const refresh = useCallback(() => {
    setCreditsState(getVideoCredits())
  }, [])

  return {
    credits,
    showModal,
    setShowModal,
    spend,
    addFree,
    refresh,
  }
}
