import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { format } from 'date-fns'

const formatDateTick = (d) => {
  try {
    return format(new Date(d), 'MMM d')
  } catch {
    return d
  }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
        fontSize: 13
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text)' }}>
        {formatDateTick(label)}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: Rs. {Number(p.value).toLocaleString()}
        </div>
      ))}
    </div>
  )
}

const TrendChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick}
          tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
          width={70}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }} />
        <Legend wrapperStyle={{ fontSize: 13, color: 'var(--color-text-muted)' }} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="var(--color-secondary)"
          strokeWidth={2.5}
          fill="url(#revenueGradient)"
        />
        <Area
          type="monotone"
          dataKey="netProfitLoss"
          name="Net Profit/Loss"
          stroke="var(--color-accent)"
          strokeWidth={2.5}
          fill="url(#profitGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default TrendChart
