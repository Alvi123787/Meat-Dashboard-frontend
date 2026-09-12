import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  MdAttachMoney,
  MdTrendingUp,
  MdTrendingDown,
  MdShoppingBag,
  MdLocalShipping,
  MdCampaign
} from 'react-icons/md'
import { entriesApi } from '../api/client'
import StatCard from '../components/StatCard'
import TrendChart from '../components/TrendChart'
import ExpenseBreakdownChart from '../components/ExpenseBreakdownChart'
import EntriesTable from '../components/EntriesTable'

const formatMoney = (n) => `Rs. ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const Dashboard = () => {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (dateFrom) params.from = dateFrom
      if (dateTo) params.to = dateTo

      const [summaryRes, entriesRes] = await Promise.all([
        entriesApi.summary(params),
        entriesApi.list(params)
      ])
      setSummary(summaryRes.data)
      setEntries(entriesRes.data)
    } catch (err) {
      console.error(err)
      toast.error('Could not load dashboard data. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEdit = (entry) => {
    navigate(`/add-entry?id=${entry._id}`)
  }

  const handleDelete = async (entry) => {
    const confirmed = window.confirm(
      `Delete the entry for ${new Date(entry.date).toLocaleDateString()}? This cannot be undone.`
    )
    if (!confirmed) return

    try {
      await entriesApi.remove(entry._id)
      toast.success('Entry deleted')
      loadData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete entry')
    }
  }

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
  }

  const handleExportCsv = () => {
    if (!entries.length) {
      toast.error('No entries available to export')
      return
    }

    const headers = [
      'Date',
      'Orders',
      'Revenue',
      'Gross Profit',
      'Total Delivery Cost',
      'Total Packaging Cost',
      'Ads Expense',
      'Other Expenses',
      'Total Expenses',
      'Net Profit/Loss',
      'Notes'
    ]

    const escapeCsvValue = (value) => {
      const normalized = value ?? ''
      const stringValue = String(normalized).replace(/"/g, '""')
      return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue
    }

    const rows = entries.map((entry) => {
      const dateValue = new Date(entry.date)
      const formattedDate = Number.isNaN(dateValue.getTime()) ? '' : dateValue.toLocaleDateString('en-CA')

      return [
        escapeCsvValue(formattedDate),
        escapeCsvValue(entry.orders ?? 0),
        escapeCsvValue(entry.revenue ?? 0),
        escapeCsvValue(entry.grossProfit ?? 0),
        escapeCsvValue(entry.totalDeliveryCost ?? 0),
        escapeCsvValue(entry.totalPackagingCost ?? 0),
        escapeCsvValue(entry.adsExpense ?? 0),
        escapeCsvValue(entry.otherExpenses ?? 0),
        escapeCsvValue(entry.totalExpenses ?? 0),
        escapeCsvValue(entry.netProfitLoss ?? 0),
        escapeCsvValue(entry.notes ?? '')
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `daily-entries-${dateFrom || 'all'}-${dateTo || 'all'}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    toast.success('CSV export started')
  }

  const netIsProfit = summary && summary.netProfitLoss >= 0

  return (
    <>
      <div className="hero-banner">
        <div className="hero-banner-inner">
          <div>
            <p className="hero-banner-eyebrow">Welcome back</p>
            <h2>Business Dashboard</h2>
            <p>A day-by-day view of your revenue, expenses, and real profit.</p>
          </div>
          <div className="hero-banner-stats">
            <div className="hero-banner-stat">
              <span>Total Revenue</span>
              <span>{formatMoney(summary?.totalRevenue)}</span>
            </div>
            <div className="hero-banner-stat">
              <span>Net Profit/Loss</span>
              <span>
                {netIsProfit ? '+' : ''}
                {formatMoney(summary?.netProfitLoss)}
              </span>
            </div>
            <div className="hero-banner-stat">
              <span>Orders</span>
              <span>{summary?.totalOrders || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <h3 style={{ fontSize: 18, margin: 0 }}>Filters &amp; Entries</h3>
          <p style={{ margin: '4px 0 0', fontSize: 12.5 }}>
            Narrow the view by date, export, or add today's numbers.
          </p>
        </div>
        <div className="page-header-actions">
          <div className="filter-bar">
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>to</span>
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            {(dateFrom || dateTo) && (
              <button className="btn btn-outline" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>
          <button className="btn btn-outline" onClick={handleExportCsv}>
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/add-entry')}>
            + Add Daily Entry
          </button>
        </div>
      </div>

      {loading && !summary ? (
        <div className="empty-state">Loading dashboard…</div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard
              label="Total Revenue"
              value={formatMoney(summary?.totalRevenue)}
              icon={<MdAttachMoney />}
              accent="green"
              sub={`${summary?.totalOrders || 0} orders · ${summary?.daysCount || 0} days tracked`}
            />
            <StatCard
              label="Gross Profit"
              value={formatMoney(summary?.grossProfit)}
              icon={<MdTrendingUp />}
              accent="gold"
              sub="Before delivery, packaging & ads"
            />
            <StatCard
              label="Total Expenses"
              value={formatMoney(summary?.totalExpenses)}
              icon={<MdLocalShipping />}
              accent="red"
              sub="Delivery + Packaging + Ads + Other"
            />
            <StatCard
              label="Net Profit / Loss"
              value={`${netIsProfit ? '+' : ''}${formatMoney(summary?.netProfitLoss)}`}
              icon={netIsProfit ? <MdTrendingUp /> : <MdTrendingDown />}
              accent={netIsProfit ? 'green' : 'red'}
              valueTone={netIsProfit ? 'profit' : 'loss'}
              sub={`${summary?.profitableDays || 0} profitable days · ${summary?.lossDays || 0} loss days`}
            />
          </div>

          <div className="stat-grid">
            <StatCard
              label="Total Orders"
              value={summary?.totalOrders || 0}
              icon={<MdShoppingBag />}
              accent="green"
            />
            <StatCard
              label="Avg. Order Value"
              value={formatMoney(summary?.avgOrderValue)}
              icon={<MdAttachMoney />}
              accent="gold"
            />
            <StatCard
              label="Avg. Daily Profit"
              value={`${(summary?.avgDailyProfit ?? 0) >= 0 ? '+' : ''}${formatMoney(summary?.avgDailyProfit)}`}
              icon={<MdTrendingUp />}
              accent="green"
              valueTone={(summary?.avgDailyProfit ?? 0) >= 0 ? 'profit' : 'loss'}
            />
            <StatCard
              label="Total Ads Spend"
              value={formatMoney(summary?.totalAdsExpense)}
              icon={<MdCampaign />}
              accent="red"
            />
          </div>

          <div className="chart-grid">
            <div className="panel">
              <div className="panel-header">
                <h3>Revenue vs. Net Profit/Loss</h3>
                <span>Day by day</span>
              </div>
              <TrendChart data={summary?.series || []} />
            </div>
            <div className="panel">
              <div className="panel-header">
                <h3>Expense Breakdown</h3>
                <span>By category</span>
              </div>
              <ExpenseBreakdownChart data={summary?.expenseBreakdown || []} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Daily Entries</h3>
              <span>{entries.length} record{entries.length === 1 ? '' : 's'}</span>
            </div>
            <EntriesTable entries={entries} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </>
      )}
    </>
  )
}

export default Dashboard
