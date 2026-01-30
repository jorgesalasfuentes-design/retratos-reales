'use client'

const STYLE_GRADIENTS = {
  royal: 'linear-gradient(135deg, #b8860b 0%, #8b0000 100%)',
  popart: 'linear-gradient(135deg, #ff1493 0%, #ffd700 50%, #00ffff 100%)',
  astronaut: 'linear-gradient(135deg, #0a1628 0%, #1a237e 50%, #283593 100%)',
  renaissance: null, // has image
  fantasy: null,     // has image
  noir: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 40%, #f5f5f5 100%)',
  japanese: null,    // has image
  cyberpunk: null,   // has image
  go_crazy: null,    // animated rainbow
}

export default function StyleCard({ style, onClick, lang }) {
  const name = lang === 'es' ? (style.nameEs || style.name) : style.name
  const hasImage = !!style.image
  const isCrazy = style.id === 'go_crazy'

  return (
    <button
      className={`style-card-v2 ${isCrazy ? 'style-card-crazy' : ''}`}
      onClick={() => onClick(style.id)}
    >
      <div className="style-card-bg">
        {hasImage ? (
          <img src={style.image} alt={name} className="style-card-img" loading="lazy" />
        ) : isCrazy ? (
          <div className="style-card-rainbow" />
        ) : (
          <div className="style-card-gradient" style={{ background: STYLE_GRADIENTS[style.id] }}>
            {style.id === 'astronaut' && (
              <div className="style-stars" />
            )}
          </div>
        )}
        <div className="style-card-overlay" />
      </div>
      <div className="style-card-label">
        <span className="style-card-emoji">{style.emoji}</span>
        <span className="style-card-name">{name}</span>
      </div>
    </button>
  )
}
