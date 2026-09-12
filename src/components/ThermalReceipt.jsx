import React from 'react'
import { format } from 'date-fns'

const formatMoney = (n) => `Rs. ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const ThermalReceipt = ({ orderData }) => {
  if (!orderData) return null

  const {
    orderNumber = '001',
    createdAt = new Date(),
    customerName = '',
    customerPhone = '',
    customerAddress = '',
    items = [],
    deliveryFee = 0,
    discount = 0,
    paymentMethod = 'cod',
    notes = ''
  } = orderData

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0)
  const total = Math.max(0, subtotal + Number(deliveryFee || 0) - Number(discount || 0))

  const formattedDate = (() => {
    try {
      return format(new Date(createdAt), 'dd MMM yyyy, hh:mm a')
    } catch {
      return new Date().toLocaleString()
    }
  })()

  return (
    <div className="thermal-receipt" id="thermal-receipt-print">
      <div className="receipt-header">
        <h2 className="receipt-brand-title">MEATBYALVI</h2>
        <p className="receipt-tagline">Fresh • Halal • Premium Quality</p>
        <p className="receipt-phone">Order &amp; Delivery Service</p>
        <div className="receipt-divider" />
        <p className="receipt-type">ORDER DELIVERY SLIP</p>
      </div>

      <div className="receipt-meta">
        <div className="receipt-row">
          <span>Order #:</span>
          <strong>{orderNumber}</strong>
        </div>
        <div className="receipt-row">
          <span>Date:</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {(customerName || customerPhone || customerAddress) && (
        <>
          <div className="receipt-divider" />
          <div className="receipt-customer">
            <p className="receipt-section-label">CUSTOMER DETAILS:</p>
            {customerName && (
              <div className="receipt-row">
                <span>Name:</span>
                <strong>{customerName}</strong>
              </div>
            )}
            {customerPhone && (
              <div className="receipt-row">
                <span>Phone:</span>
                <strong>{customerPhone}</strong>
              </div>
            )}
            {customerAddress && (
              <div className="receipt-customer-address">
                <span>Address:</span>
                <p>{customerAddress}</p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="receipt-divider" />

      <table className="receipt-items-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Item</th>
            <th style={{ textAlign: 'center' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Rate</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const lineTotal = Number(item.price || 0) * Number(item.quantity || 1)
            return (
              <tr key={item._id || idx}>
                <td className="receipt-item-name">
                  {item.name}
                  {item.unit ? <span className="receipt-item-unit"> ({item.unit})</span> : ''}
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{Number(item.price || 0).toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>{lineTotal.toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="receipt-divider" />

      <div className="receipt-totals">
        <div className="receipt-row">
          <span>Subtotal:</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        {Number(deliveryFee) > 0 && (
          <div className="receipt-row">
            <span>Delivery Fee:</span>
            <span>+{formatMoney(deliveryFee)}</span>
          </div>
        )}
        {Number(discount) > 0 && (
          <div className="receipt-row">
            <span>Discount:</span>
            <span>-{formatMoney(discount)}</span>
          </div>
        )}
        <div className="receipt-divider-thick" />
        <div className="receipt-row receipt-grand-total">
          <span>NET PAYABLE:</span>
          <strong>{formatMoney(total)}</strong>
        </div>
      </div>

      <div className="receipt-payment-badge">
        {paymentMethod === 'cod' ? (
          <div className="receipt-badge-cod">
            CASH ON DELIVERY
            <br />
            <strong>COLLECT: {formatMoney(total)}</strong>
          </div>
        ) : paymentMethod === 'paid' ? (
          <div className="receipt-badge-paid">PAID IN FULL (ONLINE)</div>
        ) : (
          <div className="receipt-badge-other">{paymentMethod.toUpperCase()}</div>
        )}
      </div>

      {notes && (
        <div className="receipt-notes">
          <p className="receipt-notes-label">Special Note / Instructions:</p>
          <p className="receipt-notes-text">{notes}</p>
        </div>
      )}

      <div className="receipt-divider" />

      <div className="receipt-footer">
        <p>Thank you for your order!</p>
        <p>Your satisfaction is our priority.</p>
        <p className="receipt-footer-hash">*** MEATBYALVI FRESH ***</p>
      </div>
    </div>
  )
}

export default ThermalReceipt
