import React from 'react'
import { format } from 'date-fns'
import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import { MdReceiptLong } from 'react-icons/md'

const formatMoney = (n) => `Rs. ${Number(n || 0).toLocaleString()}`

const EntriesTable = ({ entries, onEdit, onDelete }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="empty-state">
        <MdReceiptLong size={36} style={{ marginBottom: 10, color: 'var(--color-accent)' }} />
        <h3>No daily sales entries yet</h3>
        <p>Add your first daily entry to start tracking orders and revenue.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="entries-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Orders</th>
            <th>Revenue</th>
            <th>Gross Profit</th>
            <th>Gross Margin %</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const rev = Number(e.revenue || 0)
            const gp = Number(e.grossProfit || 0)
            const margin = rev > 0 ? ((gp / rev) * 100).toFixed(1) : '0.0'

            return (
              <tr key={e._id}>
                <td style={{ fontWeight: 600 }}>{format(new Date(e.date), 'MMM d, yyyy')}</td>
                <td>{e.orders}</td>
                <td style={{ fontWeight: 600 }}>{formatMoney(e.revenue)}</td>
                <td style={{ color: gp >= 0 ? 'var(--color-profit)' : 'var(--color-loss)', fontWeight: 700 }}>
                  {formatMoney(e.grossProfit)}
                </td>
                <td>
                  <span className="pill pill--profit" style={{ fontSize: 11.5, padding: '3px 8px' }}>
                    {margin}%
                  </span>
                </td>
                <td style={{ maxWidth: 200, whiteSpace: 'normal', color: 'var(--color-text-muted)', fontSize: 12 }}>
                  {e.notes || '—'}
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn-icon-edit" onClick={() => onEdit(e)} aria-label="Edit entry" title="Edit entry">
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon-danger"
                      onClick={() => onDelete(e)}
                      aria-label="Delete entry"
                      title="Delete entry"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default EntriesTable
