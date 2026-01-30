'use client'
import { useEffect, useState } from 'react'

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f472b6', '#fbbf24', '#6366f1', '#ec4899', '#059669']

export default function Confetti({ trigger }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 3500)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  if (!show) return null

  return (
    <div className="confetti-container">
      {Array.from({ length: 35 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: COLORS[i % COLORS.length],
            animationDuration: `${2 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 0.6}s`,
            width: `${5 + Math.random() * 7}px`,
            height: `${5 + Math.random() * 7}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}
