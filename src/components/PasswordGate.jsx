import React, { useState } from 'react'
import { FaLock } from 'react-icons/fa'
import { GiKnifeFork } from 'react-icons/gi'
import { useAuth } from '../context/AuthContext'

const PasswordGate = () => {
  const { login, checking, error, setError } = useAuth()
  const [password, setPassword] = useState('')

  const handleChange = (e) => {
    setPassword(e.target.value)
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) {
      setError('Please enter the password')
      return
    }
    await login(password)
  }

  return (
    <div className="auth-gate">
      <div className="auth-gate-card">
        <div className="auth-gate-mark">
          <GiKnifeFork />
        </div>
        <h1 className="auth-gate-title">MeatbyAlvi</h1>
        <p className="auth-gate-subtitle">Business Tracker — enter the password to continue</p>

        <form onSubmit={handleSubmit} className="auth-gate-form">
          <label className="form-label" htmlFor="dashboard-password">
            <FaLock /> Password
          </label>
          <input
            id="dashboard-password"
            type="password"
            className={`form-input ${error ? 'form-input--error' : ''}`}
            placeholder="Enter dashboard password"
            value={password}
            onChange={handleChange}
            autoFocus
          />
          {error && <span className="form-error">{error}</span>}

          <button type="submit" className="btn btn-primary auth-gate-submit" disabled={checking}>
            {checking ? 'Checking…' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PasswordGate
