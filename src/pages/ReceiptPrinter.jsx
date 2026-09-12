import React, { useState, useEffect, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  MdPrint,
  MdSearch,
  MdDeleteOutline,
  MdAdd,
  MdRemove,
  MdShoppingBag,
  MdRefresh,
  MdLocalShipping,
  MdPayment,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdOutlineReceiptLong,
  MdClear
} from 'react-icons/md'
import { GiMeatCleaver, GiRoastChicken, GiCow } from 'react-icons/gi'
import { FaFish } from 'react-icons/fa'
import { meatItemsApi } from '../api/client'
import ThermalReceipt from '../components/ThermalReceipt'

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'beef', label: 'Beef', icon: GiCow },
  { id: 'chicken', label: 'Chicken', icon: GiRoastChicken },
  { id: 'mutton', label: 'Mutton', icon: GiMeatCleaver },
  { id: 'fish', label: 'Fish', icon: FaFish }
]

const formatMoney = (n) => `Rs. ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const generateOrderId = () => {
  const now = new Date()
  const datePart = `${now.getDate()}${now.getMonth() + 1}`
  const randPart = Math.floor(100 + Math.random() * 900)
  return `MBA-${datePart}-${randPart}`
}

const ReceiptPrinter = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Order Details State
  const [orderNumber, setOrderNumber] = useState(generateOrderId)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [deliveryFee, setDeliveryFee] = useState('')
  const [discount, setDiscount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [notes, setNotes] = useState('')
  const [cart, setCart] = useState([])

  // Fetch items from the live API
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await meatItemsApi.getAll(100)
      if (res && res.data) {
        setItems(res.data)
      } else if (Array.isArray(res)) {
        setItems(res)
      }
    } catch (err) {
      console.error('Failed to load meat items:', err)
      toast.error('Could not fetch items from Farm2Meat API. Please retry.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Filter items by category and search term
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase())

      const matchesSearch =
        !searchQuery.trim() ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesCategory && matchesSearch
    })
  }, [items, selectedCategory, searchQuery])

  // Cart operations
  const addToCart = (item, qtyToAdd = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((ci) => ci._id === item._id)
      if (existingIndex > -1) {
        const updated = [...prevCart]
        const currentQty = Number(updated[existingIndex].quantity) || 1
        const newQty = Math.round((currentQty + qtyToAdd) * 100) / 100
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        }
        return updated
      }
      return [
        ...prevCart,
        {
          _id: item._id,
          name: item.name,
          category: item.category,
          price: Number(item.price) || 0,
          unit: item.unit || 'kg',
          quantity: qtyToAdd
        }
      ]
    })
    toast.success(`Added ${item.name}`, { duration: 1200 })
  }

  const updateQuantity = (itemId, newQty) => {
    const numericQty = parseFloat(newQty)
    if (isNaN(numericQty) || numericQty <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((ci) => (ci._id === itemId ? { ...ci, quantity: numericQty } : ci))
    )
  }

  const stepQuantity = (itemId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((ci) => {
          if (ci._id !== itemId) return ci
          const cur = Number(ci.quantity) || 1
          const nextVal = Math.round((cur + delta) * 100) / 100
          return nextVal > 0 ? { ...ci, quantity: nextVal } : null
        })
        .filter(Boolean)
    )
  }

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((ci) => ci._id !== itemId))
  }

  const handleClearOrder = () => {
    if (cart.length > 0 && !window.confirm('Clear current order and start a new one?')) {
      return
    }
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    setCustomerAddress('')
    setDeliveryFee('')
    setDiscount('')
    setNotes('')
    setPaymentMethod('cod')
    setOrderNumber(generateOrderId())
    toast.success('Order cleared')
  }

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0)
  }, [cart])

  const grandTotal = useMemo(() => {
    const fee = parseFloat(deliveryFee) || 0
    const disc = parseFloat(discount) || 0
    return Math.max(0, subtotal + fee - disc)
  }, [subtotal, deliveryFee, discount])

  // Print Handler
  const handlePrint = () => {
    if (cart.length === 0) {
      toast.error('Please add at least one item before printing the receipt.')
      return
    }
    window.print()
  }

  const orderData = {
    orderNumber,
    createdAt: new Date(),
    customerName,
    customerPhone,
    customerAddress,
    items: cart,
    deliveryFee: parseFloat(deliveryFee) || 0,
    discount: parseFloat(discount) || 0,
    paymentMethod,
    notes
  }

  return (
    <div className="receipt-page-container">
      {/* ── Screen UI (Hidden during print) ── */}
      <div className="receipt-screen-content no-print">
        <div className="page-header">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdOutlineReceiptLong /> Order Receipt &amp; POS Printer
            </h2>
            <p>Select products from the catalog, specify quantities, and print a thermal delivery receipt.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-outline" onClick={fetchProducts} disabled={loading} title="Reload products from Farm2Meat">
              <MdRefresh /> Reload Products
            </button>
            <button className="btn btn-primary" onClick={handlePrint} disabled={cart.length === 0}>
              <MdPrint /> Print Receipt ({formatMoney(grandTotal)})
            </button>
          </div>
        </div>

        <div className="pos-layout">
          {/* Left Column: Products Catalog */}
          <div className="pos-catalog-panel">
            {/* Search & Category Filter */}
            <div className="pos-search-bar">
              <div className="pos-search-input-wrap">
                <MdSearch className="pos-search-icon" />
                <input
                  type="text"
                  className="form-input pos-search-input"
                  placeholder="Search meat items (e.g. Qeema, Paya, Boneless)…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="pos-search-clear" onClick={() => setSearchQuery('')}>
                    <MdClear />
                  </button>
                )}
              </div>
            </div>

            <div className="pos-category-tabs">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`pos-category-tab ${isActive ? 'pos-category-tab--active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {IconComponent && <IconComponent className="pos-category-icon" />}
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="empty-state">Loading meat products from Farm2Meat…</div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">
                <p>No products found matching your search.</p>
                <button className="btn btn-outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="pos-product-grid">
                {filteredItems.map((item) => {
                  const inCartItem = cart.find((ci) => ci._id === item._id)
                  const isUnitKg = !item.unit || item.unit.toLowerCase() === 'kg'

                  return (
                    <div key={item._id} className={`pos-product-card ${inCartItem ? 'pos-product-card--selected' : ''}`}>
                      <div className="pos-card-img-wrap">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="pos-card-img" loading="lazy" />
                        ) : (
                          <div className="pos-card-img-fallback">
                            <GiMeatCleaver size={32} />
                          </div>
                        )}
                        {item.badge && <span className="pos-card-badge">{item.badge}</span>}
                        {inCartItem && (
                          <span className="pos-card-cart-qty">
                            {inCartItem.quantity} {item.unit || 'kg'}
                          </span>
                        )}
                      </div>

                      <div className="pos-card-body">
                        <span className="pos-card-category">{item.category || 'Meat'}</span>
                        <h4 className="pos-card-title">{item.name}</h4>
                        <div className="pos-card-price-row">
                          <span className="pos-card-price">
                            Rs. {Number(item.price || 0).toLocaleString()}
                            <small> / {item.unit || 'kg'}</small>
                          </span>
                        </div>

                        {/* Quick Add Buttons */}
                        <div className="pos-card-actions">
                          {isUnitKg ? (
                            <>
                              <button
                                type="button"
                                className="pos-quick-add-btn"
                                onClick={() => addToCart(item, 0.5)}
                                title="Add 0.5 kg"
                              >
                                +0.5 kg
                              </button>
                              <button
                                type="button"
                                className="pos-quick-add-btn pos-quick-add-btn--primary"
                                onClick={() => addToCart(item, 1)}
                                title="Add 1 kg"
                              >
                                +1 kg
                              </button>
                              <button
                                type="button"
                                className="pos-quick-add-btn"
                                onClick={() => addToCart(item, 2)}
                                title="Add 2 kg"
                              >
                                +2 kg
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="pos-quick-add-btn pos-quick-add-btn--primary pos-quick-add-btn--full"
                              onClick={() => addToCart(item, 1)}
                            >
                              + Add {item.unit || 'Item'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column: Order Builder & Receipt Preview */}
          <div className="pos-order-panel">
            <div className="panel pos-order-card">
              <div className="panel-header pos-order-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Current Order</h3>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {cart.length} item{cart.length === 1 ? '' : 's'} selected
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleClearOrder}
                  disabled={cart.length === 0}
                  title="Clear order"
                >
                  Clear
                </button>
              </div>

              {/* Customer Info Section */}
              <div className="pos-customer-form">
                <div className="pos-form-row">
                  <div className="form-group pos-form-group">
                    <label className="pos-form-label">
                      <MdOutlineReceiptLong /> Order #
                    </label>
                    <input
                      type="text"
                      className="form-input form-input-sm"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="MBA-XXXX"
                    />
                  </div>
                  <div className="form-group pos-form-group">
                    <label className="pos-form-label">
                      <MdPerson /> Customer Name
                    </label>
                    <input
                      type="text"
                      className="form-input form-input-sm"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rebal Alvi"
                    />
                  </div>
                </div>

                <div className="pos-form-row">
                  <div className="form-group pos-form-group">
                    <label className="pos-form-label">
                      <MdPhone /> Phone Number
                    </label>
                    <input
                      type="text"
                      className="form-input form-input-sm"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>
                  <div className="form-group pos-form-group">
                    <label className="pos-form-label">
                      <MdLocationOn /> Delivery Address
                    </label>
                    <input
                      type="text"
                      className="form-input form-input-sm"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="House #, Street, Area"
                    />
                  </div>
                </div>
              </div>

              {/* Cart Items Table */}
              <div className="pos-cart-section">
                {cart.length === 0 ? (
                  <div className="pos-cart-empty">
                    <MdShoppingBag size={40} style={{ color: 'var(--color-border)', marginBottom: 8 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>Receipt is empty</p>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      Click on any product from the catalog to add it here.
                    </span>
                  </div>
                ) : (
                  <div className="pos-cart-list">
                    {cart.map((ci) => {
                      const lineTotal = Number(ci.price || 0) * Number(ci.quantity || 1)
                      return (
                        <div key={ci._id} className="pos-cart-row">
                          <div className="pos-cart-item-info">
                            <span className="pos-cart-item-name">{ci.name}</span>
                            <span className="pos-cart-item-rate">
                              Rs. {ci.price.toLocaleString()} / {ci.unit || 'kg'}
                            </span>
                          </div>

                          <div className="pos-cart-qty-stepper">
                            <button
                              type="button"
                              className="pos-stepper-btn"
                              onClick={() => stepQuantity(ci._id, -0.5)}
                              title="Decrease 0.5"
                            >
                              <MdRemove size={14} />
                            </button>
                            <input
                              type="number"
                              step="any"
                              min="0.1"
                              className="pos-stepper-input"
                              value={ci.quantity}
                              onChange={(e) => updateQuantity(ci._id, e.target.value)}
                            />
                            <button
                              type="button"
                              className="pos-stepper-btn"
                              onClick={() => stepQuantity(ci._id, 0.5)}
                              title="Increase 0.5"
                            >
                              <MdAdd size={14} />
                            </button>
                          </div>

                          <div className="pos-cart-item-total">
                            Rs. {lineTotal.toLocaleString()}
                          </div>

                          <button
                            type="button"
                            className="btn-icon-danger pos-cart-del-btn"
                            onClick={() => removeFromCart(ci._id)}
                            title="Remove item"
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Additional Details: Delivery, Discount, Payment */}
              <div className="pos-extra-details">
                <div className="pos-form-row">
                  <div className="form-group pos-form-group">
                    <label className="pos-form-label">
                      <MdLocalShipping /> Delivery Fee (Rs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-input form-input-sm"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      placeholder="e.g. 200"
                    />
                  </div>
                  <div className="form-group pos-form-group">
                    <label className="pos-form-label">Discount (Rs.)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input form-input-sm"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="e.g. 100"
                    />
                  </div>
                </div>

                <div className="pos-form-row">
                  <div className="form-group pos-form-group">
                    <label className="pos-form-label">
                      <MdPayment /> Payment Method
                    </label>
                    <select
                      className="form-input form-input-sm"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="paid">Paid (Online / Bank Transfer)</option>
                      <option value="unpaid">Unpaid / Credit</option>
                    </select>
                  </div>
                  <div className="form-group pos-form-group">
                    <label className="pos-form-label">Notes / Instructions</label>
                    <input
                      type="text"
                      className="form-input form-input-sm"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Call before delivery"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="pos-summary-box">
                <div className="pos-summary-row">
                  <span>Subtotal:</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                {parseFloat(deliveryFee) > 0 && (
                  <div className="pos-summary-row">
                    <span>Delivery Fee:</span>
                    <span>+{formatMoney(deliveryFee)}</span>
                  </div>
                )}
                {parseFloat(discount) > 0 && (
                  <div className="pos-summary-row" style={{ color: 'var(--color-loss)' }}>
                    <span>Discount:</span>
                    <span>-{formatMoney(discount)}</span>
                  </div>
                )}
                <div className="pos-summary-divider" />
                <div className="pos-summary-row pos-summary-total">
                  <span>Total Amount:</span>
                  <span>{formatMoney(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pos-actions-bar">
                <button
                  type="button"
                  className="btn btn-primary pos-print-main-btn"
                  onClick={handlePrint}
                  disabled={cart.length === 0}
                >
                  <MdPrint size={18} /> Print Thermal Slip (80mm)
                </button>
              </div>

              {/* On-screen Preview Accordion/Card */}
              {cart.length > 0 && (
                <div className="pos-preview-toggle">
                  <p className="pos-preview-title">Thermal Slip Preview (Exact layout to be printed):</p>
                  <div className="pos-screen-slip-wrapper">
                    <ThermalReceipt orderData={orderData} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PRINT-ONLY CONTAINER (Rendered only on paper/PDF print) ── */}
      <div className="print-only">
        <ThermalReceipt orderData={orderData} />
      </div>
    </div>
  )
}

export default ReceiptPrinter
