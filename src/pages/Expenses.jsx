import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  MdAttachMoney,
  MdCampaign,
  MdLocalShipping,
  MdReceipt,
  MdAddCircle,
  MdEdit,
  MdDeleteOutline,
  MdFilterList,
  MdClose
} from 'react-icons/md'
import { FaBoxOpen, FaBolt, FaUsers, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa'
import { expensesApi } from '../api/client'
import StatCard from '../components/StatCard'

const CATEGORY_OPTIONS = [
  { id: 'ads', label: 'Ads & Marketing', icon: MdCampaign, color: '#e84393' },
  { id: 'packaging', label: 'Packaging & Bags', icon: FaBoxOpen, color: '#f39c12' },
  { id: 'delivery', label: 'Delivery & Rider Fee', icon: MdLocalShipping, color: '#3498db' },
  { id: 'supplies', label: 'Supplies & Meat Stock', icon: MdReceipt, color: '#27ae60' },
  { id: 'utilities', label: 'Utilities & Electric Bills', icon: FaBolt, color: '#e67e22' },
  { id: 'salaries', label: 'Salaries & Staff', icon: FaUsers, color: '#9b59b6' },
  { id: 'other', label: 'Other Operational Expense', icon: MdAttachMoney, color: '#7f8c8d' }
]

const todayStr = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const emptyForm = {
  date: todayStr(),
  title: '',
  category: 'ads',
  amount: '',
  paymentMethod: 'bank',
  notes: ''
}

const formatMoney = (n) => `Rs. ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (dateFrom) params.from = dateFrom
      if (dateTo) params.to = dateTo
      if (categoryFilter !== 'all') params.category = categoryFilter

      const res = await expensesApi.list(params)
      setExpenses(res.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Could not load expenses. Is the server running?')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, categoryFilter])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  // Category & grand totals
  const stats = useMemo(() => {
    let total = 0
    let ads = 0
    let packaging = 0
    let other = 0

    expenses.forEach((e) => {
      const amt = Number(e.amount || 0)
      total += amt
      if (e.category === 'ads') ads += amt
      else if (e.category === 'packaging') packaging += amt
      else other += amt
    })

    return { total, ads, packaging, other }
  }, [expenses])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditClick = (exp) => {
    setEditId(exp._id)
    setForm({
      date: exp.date ? new Date(exp.date).toISOString().slice(0, 10) : todayStr(),
      title: exp.title || '',
      category: exp.category || 'other',
      amount: exp.amount ?? '',
      paymentMethod: exp.paymentMethod || 'cash',
      notes: exp.notes || ''
    })
    window.scrollTo({ top: 220, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditId(null)
    setForm(emptyForm)
  }

  const handleDeleteClick = async (exp) => {
    const confirmed = window.confirm(
      `Delete expense "${exp.title}" (Rs. ${Number(exp.amount).toLocaleString()})?`
    )
    if (!confirmed) return

    try {
      await expensesApi.remove(exp._id)
      toast.success('Expense deleted')
      loadExpenses()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete expense')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Please enter an expense title / description')
      return
    }
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setSubmitting(true)
    const payload = {
      date: form.date,
      title: form.title.trim(),
      category: form.category,
      amount: amt,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim()
    }

    try {
      if (editId) {
        await expensesApi.update(editId, payload)
        toast.success('Expense updated')
        setEditId(null)
      } else {
        await expensesApi.create(payload)
        toast.success('Expense recorded')
      }
      setForm(emptyForm)
      loadExpenses()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to save expense')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Business Expenses</h2>
          <p>Record periodic or bulk expenses (Ads fee deduction, Packaging replenishment, Bills) whenever they occur.</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total Expenses"
          value={formatMoney(stats.total)}
          icon={<MdAttachMoney />}
          accent="red"
          sub={`${expenses.length} expense record${expenses.length === 1 ? '' : 's'}`}
        />
        <StatCard
          label="Ads & Marketing"
          value={formatMoney(stats.ads)}
          icon={<MdCampaign />}
          accent="red"
          sub="Meta / Google Ad spend"
        />
        <StatCard
          label="Packaging & Boxes"
          value={formatMoney(stats.packaging)}
          icon={<FaBoxOpen />}
          accent="gold"
          sub="Bags, boxes & stickers"
        />
        <StatCard
          label="Other Operations"
          value={formatMoney(stats.other)}
          icon={<MdReceipt />}
          accent="green"
          sub="Delivery, utilities & supplies"
        />
      </div>

      {/* Expense Form Card */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <MdAddCircle /> {editId ? 'Edit Expense Record' : 'Record New Expense'}
          </h3>
          {editId && (
            <button type="button" className="btn btn-outline btn-sm" onClick={handleCancelEdit}>
              <MdClose /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="expense-date">
                Date <span className="form-required">*</span>
              </label>
              <input
                id="expense-date"
                type="date"
                name="date"
                className="form-input"
                value={form.date}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expense-category">
                Category <span className="form-required">*</span>
              </label>
              <select
                id="expense-category"
                name="category"
                className="form-input"
                value={form.category}
                onChange={handleFormChange}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expense-amount">
                Amount (Rs.) <span className="form-required">*</span>
              </label>
              <input
                id="expense-amount"
                type="number"
                min="0"
                step="any"
                name="amount"
                className="form-input"
                placeholder="e.g. 5000"
                value={form.amount}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expense-paymentMethod">
                Paid Via
              </label>
              <select
                id="expense-paymentMethod"
                name="paymentMethod"
                className="form-input"
                value={form.paymentMethod}
                onChange={handleFormChange}
              >
                <option value="bank">Bank Transfer / Online</option>
                <option value="card">Debit / Credit Card</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group form-group--full">
              <label className="form-label" htmlFor="expense-title">
                Title / Description <span className="form-required">*</span>
              </label>
              <input
                id="expense-title"
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. Meta Ads Threshold Billing, 1000 Poly Bags & Labels, Electric Bill"
                value={form.title}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group form-group--full">
              <label className="form-label" htmlFor="expense-notes">
                Notes (Optional)
              </label>
              <input
                id="expense-notes"
                type="text"
                name="notes"
                className="form-input"
                placeholder="Receipt / invoice reference, vendor name, etc."
                value={form.notes}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editId ? 'Update Expense' : '+ Record Expense'}
            </button>
            {editId && (
              <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter Bar & Expenses Table */}
      <div className="panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>Expense History</h3>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {expenses.length} record{expenses.length === 1 ? '' : 's'} found
            </span>
          </div>

          <div className="filter-bar">
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From date"
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>to</span>
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="To date"
            />
            <select
              className="form-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ minWidth: 140 }}
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            {(dateFrom || dateTo || categoryFilter !== 'all') && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setDateFrom('')
                  setDateTo('')
                  setCategoryFilter('all')
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading expenses…</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <MdAttachMoney size={42} style={{ color: 'var(--color-border)', marginBottom: 8 }} />
            <h4>No expenses recorded</h4>
            <p>Use the form above to add your first expense record.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="entries-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Payment Method</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => {
                  const catMeta = CATEGORY_OPTIONS.find((c) => c.id === exp.category) || {
                    label: exp.category,
                    color: '#7f8c8d'
                  }
                  return (
                    <tr key={exp._id}>
                      <td>{format(new Date(exp.date), 'MMM d, yyyy')}</td>
                      <td style={{ fontWeight: 600 }}>{exp.title}</td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            background: `color-mix(in srgb, ${catMeta.color} 15%, transparent)`,
                            color: catMeta.color,
                            border: `1px solid color-mix(in srgb, ${catMeta.color} 35%, transparent)`,
                            fontWeight: 600,
                            fontSize: 11.5
                          }}
                        >
                          {catMeta.label}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>
                        {exp.paymentMethod || 'Cash'}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                        {exp.notes || '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-loss)' }}>
                        Rs. {Number(exp.amount).toLocaleString()}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="btn-icon-edit"
                            onClick={() => handleEditClick(exp)}
                            aria-label="Edit expense"
                            title="Edit expense"
                          >
                            <MdEdit />
                          </button>
                          <button
                            className="btn-icon-danger"
                            onClick={() => handleDeleteClick(exp)}
                            aria-label="Delete expense"
                            title="Delete expense"
                          >
                            <MdDeleteOutline />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default Expenses
