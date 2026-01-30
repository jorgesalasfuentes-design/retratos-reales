'use client'
import { useState, useEffect, useCallback } from 'react'
import { getCredits, setCredits as storeCredits, deductCredit, addCredits as storeAddCredits } from './storage'

export function useCredits() {
  const [credits, setCreditsState] = useState(3)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setCreditsState(getCredits())
  }, [])

  const spend = useCallback(() => {
    const current = getCredits()
    if (current <= 0) {
      setShowModal(true)
      return false
    }
    deductCredit()
    setCreditsState(current - 1)
    return true
  }, [])

  const addFree = useCallback((n = 3) => {
    storeAddCredits(n)
    setCreditsState(getCredits() + n)
    setShowModal(false)
  }, [])

  const refresh = useCallback(() => {
    setCreditsState(getCredits())
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
