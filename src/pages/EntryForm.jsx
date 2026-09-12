import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FaCalendarAlt,
  FaShoppingBag,
  FaMoneyBillWave,
  FaStickyNote,
  FaPercentage
} from 'react-icons/fa'
import { entriesApi } from '../api/client'

const todayStr = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const emptyForm = {
  date: todayStr(),
  orders: '',
  revenue: '',
  grossProfit: '',
  notes: ''
}

const parseNumericValue = (value) => {
  if (value === '' || value === null || value === undefined) return 0
  const normalizedValue = typeof value === 'string' ? value.trim() : value
  const numericValue = Number(normalizedValue)
  return Number.isNaN(numericValue) ? 0 : numericValue
}

const EntryForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')
  const isEditMode = Boolean(editId)

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  useEffect(() => {
    if (!isEditMode) return

    const loadEntry = async () => {
      try {
        const res = await entriesApi.getById(editId)
        const e = res.data
        setForm({
          date: e.date ? e.date.slice(0, 10) : todayStr(),
          orders: e.orders ?? '',
          revenue: e.revenue ?? '',
          grossProfit: e.grossProfit ?? '',
          notes: e.notes ?? ''
        })
      } catch (err) {
        console.error(err)
        toast.error('Could not load this entry')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    loadEntry()
  }, [editId, isEditMode, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.date) newErrors.date = 'Date is required'
    if (form.orders === '' || parseNumericValue(form.orders) < 0) newErrors.orders = 'Enter a valid number of orders'
    if (form.revenue === '' || parseNumericValue(form.revenue) < 0) newErrors.revenue = 'Enter valid revenue'
    if (form.grossProfit === '') newErrors.grossProfit = "Enter today's gross profit"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Live-computed metrics ──
  const preview = useMemo(() => {
    const revenue = parseNumericValue(form.revenue)
    const grossProfit = parseNumericValue(form.grossProfit)
    const orders = parseNumericValue(form.orders)
    const marginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0
    const aov = orders > 0 ? revenue / orders : 0
    return { revenue, grossProfit, marginPct, aov }
  }, [form])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return
    if (!validate()) return

    submittingRef.current = true
    setSubmitting(true)

    const payload = {
      date: form.date,
      orders: parseNumericValue(form.orders),
      revenue: parseNumericValue(form.revenue),
      grossProfit: parseNumericValue(form.grossProfit),
      notes: form.notes || ''
    }

    try {
      if (isEditMode) {
        await entriesApi.update(editId, payload)
        toast.success('Entry updated')
      } else {
        await entriesApi.create(payload)
        toast.success('Daily entry saved')
      }
      navigate('/')
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.message || 'Could not save entry'
      toast.error(message)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="empty-state">Loading entry…</div>
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{isEditMode ? 'Edit Daily Entry' : 'Add Daily Entry'}</h2>
          <p>Record today's orders and sales figures. Bulk expenses (Ads, Packaging, etc.) can be recorded in the Expenses section.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <p className="form-section-title">Today's Sales &amp; Orders Activity</p>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="date">
              <FaCalendarAlt /> Date <span className="form-required">*</span>
            </label>
            <input
              id="date"
              type="date"
              name="date"
              className={`form-input ${errors.date ? 'form-input--error' : ''}`}
              value={form.date}
              onChange={handleChange}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="orders">
              <FaShoppingBag /> Total Orders <span className="form-required">*</span>
            </label>
            <input
              id="orders"
              type="number"
              min="0"
              step="any"
              name="orders"
              className={`form-input ${errors.orders ? 'form-input--error' : ''}`}
              placeholder="e.g. 5"
              value={form.orders}
              onChange={handleChange}
            />
            {errors.orders && <span className="form-error">{errors.orders}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="revenue">
              <FaMoneyBillWave /> Total Revenue (Rs.) <span className="form-required">*</span>
            </label>
            <input
              id="revenue"
              type="number"
              min="0"
              step="any"
              name="revenue"
              className={`form-input ${errors.revenue ? 'form-input--error' : ''}`}
              placeholder="e.g. 15200"
              value={form.revenue}
              onChange={handleChange}
            />
            {errors.revenue && <span className="form-error">{errors.revenue}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="grossProfit">
              <FaMoneyBillWave /> Today's Orders Profit (Gross Rs.) <span className="form-required">*</span>
            </label>
            <input
              id="grossProfit"
              type="number"
              step="any"
              name="grossProfit"
              className={`form-input ${errors.grossProfit ? 'form-input--error' : ''}`}
              placeholder="e.g. 3800"
              value={form.grossProfit}
              onChange={handleChange}
            />
            {errors.grossProfit && <span className="form-error">{errors.grossProfit}</span>}
            <span className="form-hint">Revenue minus cost of goods sold (meat wholesale cost).</span>
          </div>

          <div className="form-group form-group--full">
            <label className="form-label" htmlFor="notes">
              <FaStickyNote /> Notes
            </label>
            <input
              id="notes"
              type="text"
              name="notes"
              className="form-input"
              placeholder="Optional notes about today (e.g., weekend rush, rain delay)"
              value={form.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="live-preview">
          <h4>Performance Preview</h4>
          <div className="live-preview-grid">
            <div className="live-preview-item">
              <span>Total Revenue</span>
              <span>Rs. {preview.revenue.toLocaleString()}</span>
            </div>
            <div className="live-preview-item">
              <span>Gross Profit</span>
              <span style={{ color: preview.grossProfit >= 0 ? 'var(--color-profit)' : 'var(--color-loss)' }}>
                Rs. {preview.grossProfit.toLocaleString()}
              </span>
            </div>
            <div className="live-preview-item">
              <span>Gross Margin %</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaPercentage size={11} /> {preview.marginPct.toFixed(1)}%
              </span>
            </div>
            <div className="live-preview-item">
              <span>Avg Order Value</span>
              <span>Rs. {Math.round(preview.aov).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : isEditMode ? 'Update Entry' : 'Save Daily Entry'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}

export default EntryForm
