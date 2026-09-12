import React from 'react'

/**
 * Professional stat/summary card.
 *
 * props:
 *  - label: string
 *  - value: string (already formatted, e.g. "Rs. 15,200")
 *  - icon: React node
 *  - accent: 'red' | 'green' | 'gold'
 *  - valueTone: 'profit' | 'loss' | undefined
 *  - sub: string (small helper text under the value)
 */
const StatCard = ({ label, value, icon, accent = 'gold', valueTone, sub }) => {
  return (
    <div className={`stat-card stat-card--accent-${accent}`}>
      <div className="stat-card-top">
        <div>
          <p className="stat-card-label">{label}</p>
          <p className={`stat-card-value ${valueTone ? `stat-card-value--${valueTone}` : ''}`}>
            {value}
          </p>
        </div>
        {icon && <div className={`stat-card-icon stat-card-icon--${accent}`}>{icon}</div>}
      </div>
      {sub && <p className="stat-card-sub">{sub}</p>}
    </div>
  )
}

export default StatCard
