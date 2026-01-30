'use client'
import { useState, useEffect, useCallback } from 'react'
import { getGallery, addToGallery, removeFromGallery, clearGallery as storageClearGallery } from './storage'

export function useGallery() {
  const [portraits, setPortraits] = useState([])

  useEffect(() => {
    setPortraits(getGallery())
  }, [])

  const add = useCallback((portrait) => {
    const entry = addToGallery(portrait)
    setPortraits(getGallery())
    return entry
  }, [])

  const remove = useCallback((id) => {
    removeFromGallery(id)
    setPortraits(getGallery())
  }, [])

  const clear = useCallback(() => {
    storageClearGallery()
    setPortraits([])
  }, [])

  const refresh = useCallback(() => {
    setPortraits(getGallery())
  }, [])

  return { portraits, add, remove, clear, refresh }
}
