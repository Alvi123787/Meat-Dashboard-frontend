import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  MdHandshake,
  MdAccountBalanceWallet,
  MdAddCircle,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdSearch,
  MdPhone,
  MdCheckCircle,
  MdPendingActions,
  MdCalendarToday,
  MdPayment,
  MdGridView,
  MdTableRows
} from 'react-icons/md'
import { FaHandHoldingUsd, FaUsers, FaMoneyBillWave } from 'react-icons/fa'
import { duesApi } from '../api/client'
import StatCard from '../components/StatCard'

const todayStr = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const emptyForm = {
  date: todayStr(),
  personName: '',
  amount: '',
  paidAmount: '',
  dueDate: '',
  phone: '',
  receivedVia: 'cash',
  notes: ''
}

const formatMoney = (n) => `Rs. ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const Dues = () => {
  const [dues, setDues] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Filters & display mode
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'table'

  // Quick Settle / Repayment Modal
  const [repayTarget, setRepayTarget] = useState(null)
  const [repayAmountInput, setRepayAmountInput] = useState('')
  const [repaySubmitting, setRepaySubmitting] = useState(false)

  const loadDues = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (search.trim()) params.search = search.trim()
      if (dateFrom) params.from = dateFrom
      if (dateTo) params.to = dateTo

      const res = await duesApi.list(params)
      setDues(res.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Could not load dues. Is the server running?')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, dateFrom, dateTo])

  useEffect(() => {
    loadDues()
  }, [loadDues])

  // Aggregate KPI metrics
  const stats = useMemo(() => {
    let totalBorrowed = 0
    let totalPaid = 0
    let remainingBalance = 0
    let unpaidCount = 0

    dues.forEach((d) => {
      const borrowed = Number(d.amount || 0)
      const paid = Number(d.paidAmount || 0)
      const remaining = Math.max(0, borrowed - paid)

      totalBorrowed += borrowed
      totalPaid += paid
      remainingBalance += remaining

      if (d.status !== 'paid' && remaining > 0) {
        unpaidCount += 1
      }
    })

    return {
      totalBorrowed,
      totalPaid,
      remainingBalance,
      unpaidCount
    }
  }, [dues])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditClick = (due) => {
    setEditId(due._id)
    setForm({
      date: due.date ? new Date(due.date).toISOString().slice(0, 10) : todayStr(),
      personName: due.personName || '',
      amount: due.amount ?? '',
      paidAmount: due.paidAmount ?? '',
      dueDate: due.dueDate ? new Date(due.dueDate).toISOString().slice(0, 10) : '',
      phone: due.phone || '',
      receivedVia: due.receivedVia || 'cash',
      notes: due.notes || ''
    })
    window.scrollTo({ top: 220, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditId(null)
    setForm(emptyForm)
  }

  const handleDeleteClick = async (due) => {
    const confirmed = window.confirm(
      `Delete due record for "${due.personName}" (Rs. ${Number(due.amount).toLocaleString()})?`
    )
    if (!confirmed) return

    try {
      await duesApi.remove(due._id)
      toast.success('Due record deleted')
      loadDues()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete due record')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.personName.trim()) {
      toast.error('Please enter the person / lender name')
      return
    }
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid borrowed amount')
      return
    }

    const paidAmt = form.paidAmount !== '' && !isNaN(Number(form.paidAmount)) ? Math.max(0, Number(form.paidAmount)) : 0

    setSubmitting(true)
    const payload = {
      date: form.date,
      personName: form.personName.trim(),
      amount: amt,
      paidAmount: paidAmt,
      dueDate: form.dueDate || null,
      phone: form.phone.trim(),
      receivedVia: form.receivedVia,
      notes: form.notes.trim()
    }

    try {
      if (editId) {
        await duesApi.update(editId, payload)
        toast.success('Due record updated')
        setEditId(null)
      } else {
        await duesApi.create(payload)
        toast.success('Due record added')
      }
      setForm(emptyForm)
      loadDues()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to save due record')
    } finally {
      setSubmitting(false)
    }
  }

  // Quick Repayment Handler
  const openRepayModal = (due) => {
    const remaining = Math.max(0, Number(due.amount || 0) - Number(due.paidAmount || 0))
    setRepayTarget(due)
    setRepayAmountInput(String(remaining))
  }

  const handleRepaySubmit = async (e) => {
    e.preventDefault()
    if (!repayTarget) return

    const addPayment = parseFloat(repayAmountInput)
    if (isNaN(addPayment) || addPayment <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    const currentPaid = Number(repayTarget.paidAmount || 0)
    const newPaid = currentPaid + addPayment

    setRepaySubmitting(true)
    try {
      await duesApi.update(repayTarget._id, {
        paidAmount: newPaid
      })
      toast.success(`Recorded Rs. ${addPayment.toLocaleString()} repayment for ${repayTarget.personName}`)
      setRepayTarget(null)
      setRepayAmountInput('')
      loadDues()
    } catch (err) {
      console.error(err)
      toast.error('Failed to record repayment')
    } finally {
      setRepaySubmitting(false)
    }
  }

  const renderStatusBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="due-badge due-badge--paid">
          <MdCheckCircle size={13} /> Paid / Settled
        </span>
      )
    }
    if (status === 'partially_paid') {
      return (
        <span className="due-badge due-badge--partial">
          <MdPendingActions size={13} /> Partially Paid
        </span>
      )
    }
    return (
      <span className="due-badge due-badge--unpaid">
        <MdPendingActions size={13} /> Unpaid / Pending
      </span>
    )
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dues & Borrowings (ادھار / واجبات)</h2>
          <p>
            Track money borrowed from individuals or parties. This page is completely isolated from daily profit,
            loss, and dashboard calculations.
          </p>
        </div>
      </div>

      {/* Top Summary KPI Cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total Borrowed"
          value={formatMoney(stats.totalBorrowed)}
          icon={<MdAccountBalanceWallet />}
          accent="gold"
          sub={`${dues.length} total borrowed record${dues.length === 1 ? '' : 's'}`}
        />
        <StatCard
          label="Remaining to Return"
          value={formatMoney(stats.remainingBalance)}
          icon={<FaHandHoldingUsd />}
          accent="red"
          sub={`${stats.unpaidCount} pending liability`}
        />
        <StatCard
          label="Total Repaid / Cleared"
          value={formatMoney(stats.totalPaid)}
          icon={<MdCheckCircle />}
          accent="green"
          sub="Amount returned so far"
        />
        <StatCard
          label="Active Borrowers"
          value={String(stats.unpaidCount)}
          icon={<FaUsers />}
          accent="blue"
          sub="People to return money to"
        />
      </div>

      {/* Dues Form Panel */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <MdAddCircle /> {editId ? 'Edit Due Record' : 'Record New Due / Borrowed Money'}
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
              <label className="form-label" htmlFor="due-date">
                Date Taken <span className="form-required">*</span>
              </label>
              <input
                id="due-date"
                type="date"
                name="date"
                className="form-input"
                value={form.date}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="due-personName">
                Person / Lender Name <span className="form-required">*</span>
              </label>
              <input
                id="due-personName"
                type="text"
                name="personName"
                className="form-input"
                placeholder="e.g. Tariq Sahab, Ali Bhai, Bank / Friend"
                value={form.personName}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="due-amount">
                Borrowed Amount (Rs.) <span className="form-required">*</span>
              </label>
              <input
                id="due-amount"
                type="number"
                min="0"
                step="any"
                name="amount"
                className="form-input"
                placeholder="e.g. 50000"
                value={form.amount}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="due-paidAmount">
                Amount Already Repaid (Rs.)
              </label>
              <input
                id="due-paidAmount"
                type="number"
                min="0"
                step="any"
                name="paidAmount"
                className="form-input"
                placeholder="0 if none returned yet"
                value={form.paidAmount}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="due-dueDate">
                Expected Return Date (Optional)
              </label>
              <input
                id="due-dueDate"
                type="date"
                name="dueDate"
                className="form-input"
                value={form.dueDate}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="due-phone">
                Phone / Contact (Optional)
              </label>
              <input
                id="due-phone"
                type="tel"
                name="phone"
                className="form-input"
                placeholder="e.g. 0300-1234567"
                value={form.phone}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="due-receivedVia">
                Received Via
              </label>
              <select
                id="due-receivedVia"
                name="receivedVia"
                className="form-input"
                value={form.receivedVia}
                onChange={handleFormChange}
              >
                <option value="cash">Cash in Hand</option>
                <option value="bank">Bank Transfer</option>
                <option value="online">Easypaisa / JazzCash</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group form-group--full">
              <label className="form-label" htmlFor="due-notes">
                Purpose / Notes (Optional)
              </label>
              <input
                id="due-notes"
                type="text"
                name="notes"
                className="form-input"
                placeholder="e.g. Taken for shop stock emergency, payable end of month"
                value={form.notes}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editId ? 'Update Due Record' : '+ Record Due'}
            </button>
            {editId && (
              <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Dues History Section */}
      <div className="panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>Borrowing Records & Cards</h3>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {dues.length} record{dues.length === 1 ? '' : 's'} recorded
            </span>
          </div>

          {/* Filter Bar & View Toggle */}
          <div className="filter-bar" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div className="search-input-wrap">
              <MdSearch className="search-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Search person, phone, note…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 34, minWidth: 200 }}
              />
            </div>

            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: 140 }}
            >
              <option value="all">All Statuses</option>
              <option value="unpaid">Unpaid / Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid / Settled</option>
            </select>

            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From date"
            />
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="To date"
            />

            {(search || statusFilter !== 'all' || dateFrom || dateTo) && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setDateFrom('')
                  setDateTo('')
                }}
              >
                Clear
              </button>
            )}

            {/* View Switcher */}
            <div className="view-mode-toggle" style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('cards')}
                title="Cards View"
              >
                <MdGridView size={16} /> Cards
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <MdTableRows size={16} /> Table
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading dues records…</div>
        ) : dues.length === 0 ? (
          <div className="empty-state">
            <MdHandshake size={48} style={{ color: 'var(--color-border)', marginBottom: 8 }} />
            <h4>No dues recorded</h4>
            <p>Use the form above to record money borrowed from someone.</p>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards View Grid */
          <div className="due-cards-grid">
            {dues.map((due) => {
              const borrowed = Number(due.amount || 0)
              const paid = Number(due.paidAmount || 0)
              const remaining = Math.max(0, borrowed - paid)
              const percentPaid = borrowed > 0 ? Math.min(100, Math.round((paid / borrowed) * 100)) : 0
              const isSettled = due.status === 'paid' || remaining === 0

              return (
                <div key={due._id} className={`due-card ${isSettled ? 'due-card--settled' : ''}`}>
                  <div className="due-card-header">
                    <div className="due-card-person">
                      <div className="due-person-avatar">
                        {due.personName.trim().charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="due-person-name">{due.personName}</h4>
                        <div className="due-person-meta">
                          <MdCalendarToday size={12} /> {format(new Date(due.date), 'MMM d, yyyy')}
                          {due.phone && (
                            <>
                              <span>•</span>
                              <a href={`tel:${due.phone}`} className="due-phone-link">
                                <MdPhone size={12} /> {due.phone}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {renderStatusBadge(due.status)}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="due-card-amounts">
                    <div className="due-amount-col">
                      <span className="due-amount-label">Borrowed</span>
                      <strong className="due-amount-val">{formatMoney(borrowed)}</strong>
                    </div>
                    <div className="due-amount-col">
                      <span className="due-amount-label">Repaid</span>
                      <strong className="due-amount-val" style={{ color: 'var(--color-profit)' }}>
                        {formatMoney(paid)}
                      </strong>
                    </div>
                    <div className="due-amount-col">
                      <span className="due-amount-label">Remaining Balance</span>
                      <strong
                        className="due-amount-val"
                        style={{ color: remaining > 0 ? 'var(--color-loss)' : 'var(--color-profit)' }}
                      >
                        {formatMoney(remaining)}
                      </strong>
                    </div>
                  </div>

                  {/* Repayment Progress Bar */}
                  <div className="due-progress-wrap">
                    <div className="due-progress-bar" style={{ width: `${percentPaid}%` }} />
                  </div>
                  <div className="due-progress-meta">
                    <span>{percentPaid}% Repaid</span>
                    {due.dueDate && (
                      <span>
                        Due by: <strong>{format(new Date(due.dueDate), 'MMM d, yyyy')}</strong>
                      </span>
                    )}
                  </div>

                  {/* Notes & payment mode */}
                  <div className="due-card-details">
                    <div className="due-pill-tag">
                      <MdPayment size={12} /> Received: <span style={{ textTransform: 'capitalize' }}>{due.receivedVia || 'Cash'}</span>
                    </div>
                    {due.notes && <p className="due-notes-text">{due.notes}</p>}
                  </div>

                  {/* Action Buttons */}
                  <div className="due-card-actions">
                    {!isSettled && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline due-repay-btn"
                        onClick={() => openRepayModal(due)}
                        title="Record repayment"
                      >
                        <FaMoneyBillWave size={14} /> Record Payment
                      </button>
                    )}

                    <div className="due-action-icons">
                      <button
                        type="button"
                        className="btn-icon-edit"
                        onClick={() => handleEditClick(due)}
                        aria-label="Edit due"
                        title="Edit due details"
                      >
                        <MdEdit />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-danger"
                        onClick={() => handleDeleteClick(due)}
                        aria-label="Delete due"
                        title="Delete due"
                      >
                        <MdDeleteOutline />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Table View */
          <div className="table-wrap">
            <table className="entries-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Person / Lender</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Received Via</th>
                  <th>Due Date</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Borrowed</th>
                  <th style={{ textAlign: 'right' }}>Repaid</th>
                  <th style={{ textAlign: 'right' }}>Remaining</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {dues.map((due) => {
                  const borrowed = Number(due.amount || 0)
                  const paid = Number(due.paidAmount || 0)
                  const remaining = Math.max(0, borrowed - paid)

                  return (
                    <tr key={due._id}>
                      <td>{format(new Date(due.date), 'MMM d, yyyy')}</td>
                      <td style={{ fontWeight: 600 }}>{due.personName}</td>
                      <td>
                        {due.phone ? (
                          <a href={`tel:${due.phone}`} className="due-phone-link">
                            {due.phone}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{renderStatusBadge(due.status)}</td>
                      <td style={{ textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>
                        {due.receivedVia || 'Cash'}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                        {due.dueDate ? format(new Date(due.dueDate), 'MMM d, yyyy') : '—'}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                        {due.notes || '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatMoney(borrowed)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-profit)' }}>
                        {formatMoney(paid)}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: remaining > 0 ? 'var(--color-loss)' : 'var(--color-profit)'
                        }}
                      >
                        {formatMoney(remaining)}
                      </td>
                      <td>
                        <div className="row-actions">
                          {remaining > 0 && (
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => openRepayModal(due)}
                              title="Record payment"
                              style={{ padding: '3px 8px', fontSize: 11 }}
                            >
                              Repay
                            </button>
                          )}
                          <button
                            className="btn-icon-edit"
                            onClick={() => handleEditClick(due)}
                            aria-label="Edit due"
                            title="Edit due"
                          >
                            <MdEdit />
                          </button>
                          <button
                            className="btn-icon-danger"
                            onClick={() => handleDeleteClick(due)}
                            aria-label="Delete due"
                            title="Delete due"
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

      {/* Quick Repayment Dialog Modal */}
      {repayTarget && (
        <div className="modal-backdrop" onClick={() => setRepayTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaMoneyBillWave style={{ color: 'var(--color-profit)' }} /> Record Repayment
              </h3>
              <button
                type="button"
                className="btn-icon-close"
                onClick={() => setRepayTarget(null)}
                aria-label="Close modal"
              >
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleRepaySubmit} style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--color-text-muted)' }}>
                Repaying money to <strong>{repayTarget.personName}</strong>.
                <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Borrowed: {formatMoney(repayTarget.amount)}</span>
                  <span>Already Paid: {formatMoney(repayTarget.paidAmount)}</span>
                </div>
                <div style={{ marginTop: 4, fontWeight: 600, color: 'var(--color-loss)' }}>
                  Remaining Balance:{' '}
                  {formatMoney(Math.max(0, Number(repayTarget.amount) - Number(repayTarget.paidAmount)))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="repay-amount-input">
                  Payment Amount to Return (Rs.) <span className="form-required">*</span>
                </label>
                <input
                  id="repay-amount-input"
                  type="number"
                  min="1"
                  step="any"
                  className="form-input"
                  value={repayAmountInput}
                  onChange={(e) => setRepayAmountInput(e.target.value)}
                  placeholder="Enter amount returned"
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    const rem = Math.max(0, Number(repayTarget.amount) - Number(repayTarget.paidAmount))
                    setRepayAmountInput(String(rem))
                  }}
                >
                  Pay Full Remaining
                </button>
              </div>

              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="submit" className="btn btn-primary" disabled={repaySubmitting} style={{ flex: 1 }}>
                  {repaySubmitting ? 'Saving…' : 'Confirm Payment'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setRepayTarget(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Dues
