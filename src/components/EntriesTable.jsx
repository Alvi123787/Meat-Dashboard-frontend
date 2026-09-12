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
        <h3>No entries yet</h3>
        <p>Add your first daily entry to start seeing your profit/loss here.</p>
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
            <th>Total Delivery</th>
            <th>Total Packaging</th>
            <th>Ads</th>
            <th>Other</th>
            <th>Total Expenses</th>
            <th>Net Profit/Loss</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e._id}>
              <td>{format(new Date(e.date), 'MMM d, yyyy')}</td>
              <td>{e.orders}</td>
              <td>{formatMoney(e.revenue)}</td>
              <td>{formatMoney(e.grossProfit)}</td>
              <td>{formatMoney(e.totalDeliveryCost)}</td>
              <td>{formatMoney(e.totalPackagingCost)}</td>
              <td>{formatMoney(e.adsExpense)}</td>
              <td>{formatMoney(e.otherExpenses)}</td>
              <td>{formatMoney(e.totalExpenses)}</td>
              <td>
                <span className={`pill ${e.netProfitLoss >= 0 ? 'pill--profit' : 'pill--loss'}`}>
                  {e.netProfitLoss >= 0 ? '+' : ''}
                  {formatMoney(e.netProfitLoss)}
                </span>
              </td>
              <td style={{ maxWidth: 160, whiteSpace: 'normal', color: 'var(--color-text-muted)' }}>
                {e.notes || '—'}
              </td>
              <td>
                <div className="row-actions">
                  <button className="btn-icon-edit" onClick={() => onEdit(e)} aria-label="Edit entry">
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon-danger"
                    onClick={() => onDelete(e)}
                    aria-label="Delete entry"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EntriesTable
