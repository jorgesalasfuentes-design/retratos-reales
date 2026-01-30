'use client'
import { useEffect } from 'react'

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, 2500)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  if (!message) return null

  return <div className="toast">{message}</div>
}
