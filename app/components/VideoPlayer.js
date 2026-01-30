'use client'

import { useRef, useState } from 'react'

export default function VideoPlayer({ src, poster, watermark }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
      setEnded(false)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }

  const handleEnded = () => {
    setPlaying(false)
    setEnded(true)
  }

  return (
    <div className="video-player" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        onEnded={handleEnded}
        className="video-player-video"
      />
      {!playing && (
        <div className="video-player-overlay">
          <div className="video-player-play">
            {ended ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </div>
        </div>
      )}
      {watermark && (
        <div className="video-player-watermark">{watermark}</div>
      )}
    </div>
  )
}
