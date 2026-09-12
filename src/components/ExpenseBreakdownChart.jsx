import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-accent)',
  'var(--color-chart-4)'
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0]
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '8px 14px',
        boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
        fontSize: 13,
        color: 'var(--color-text)'
      }}
    >
      <strong>{p.name}</strong>: Rs. {Number(p.value).toLocaleString()}
    </div>
  )
}

const ExpenseBreakdownChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
        No expenses recorded yet for this period.
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={95}
            paddingAngle={3}
            stroke="var(--color-surface)"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12.5, color: 'var(--color-text-muted)' }} />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{ fontSize: 10.5, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Total
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--color-text)' }}>
          Rs. {total.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export default ExpenseBreakdownChart
