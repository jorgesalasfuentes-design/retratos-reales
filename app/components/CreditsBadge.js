'use client'

export default function CreditsBadge({ credits, onClick }) {
  const urgency = credits <= 0 ? 'credits-badge-empty' : credits <= 1 ? 'credits-badge-low' : ''

  return (
    <button className={`credits-badge ${urgency}`} onClick={onClick}>
      <span className="credits-badge-icon">&#x1F48E;</span>
      <span className="credits-badge-count">{credits}</span>
    </button>
  )
}
