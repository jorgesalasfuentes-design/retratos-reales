'use client'
import Modal from './Modal'

const PLANS = [
  { key: 'starter', credits: 10, price: '$4.99', per: '$0.50' },
  { key: 'popular', credits: 30, price: '$9.99', per: '$0.33', featured: true },
  { key: 'best', credits: 100, price: '$24.99', per: '$0.25' },
]

export default function CreditsModal({ open, onClose, onAddCredits, t }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="credits-modal">
        <div className="credits-modal-emoji">&#x1F48E;</div>
        <h2 className="credits-modal-title">{t.outOfCredits}</h2>
        <p className="credits-modal-subtitle">{t.getMoreToKeep}</p>

        <div className="pricing-grid">
          {PLANS.map(plan => (
            <button
              key={plan.key}
              className={`pricing-card ${plan.featured ? 'pricing-card-featured' : ''}`}
              onClick={onAddCredits}
            >
              {plan.featured && <span className="pricing-badge">{t.bestValue}</span>}
              <span className="pricing-name">{t[plan.key]}</span>
              <span className="pricing-credits">{plan.credits} {t.credits}</span>
              <span className="pricing-price">{plan.price}</span>
              <span className="pricing-per">{plan.per} {t.each}</span>
            </button>
          ))}
        </div>

        <button className="btn btn-ghost mt-md" onClick={onClose}>
          {t.maybeLater}
        </button>
      </div>
    </Modal>
  )
}
