'use client'

export default function TemplateCard({ template, lang, onClick }) {
  const name = lang === 'es' ? (template.nameEs || template.name) : template.name
  const desc = lang === 'es' ? (template.descriptionEs || template.description) : template.description

  return (
    <button className="template-card" onClick={onClick}>
      <div className="template-card-emoji">{template.emoji}</div>
      <div className="template-card-info">
        <span className="template-card-name">{name}</span>
        <span className="template-card-desc">{desc}</span>
      </div>
      <div className="template-card-meta">
        {template.credits > 1 && (
          <span className="template-card-cost">{template.credits}x</span>
        )}
        <span className={`template-card-type template-card-type-${template.type}`}>
          {template.type === 'talking' ? '🗣️' : template.type === 'scene' ? '🎬' : '🎙️'}
        </span>
      </div>
    </button>
  )
}
