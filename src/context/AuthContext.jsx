import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL, buildApiUrl } from '../api/config.js'

const STORAGE_KEY = 'mba-dashboard-token'

const AuthContext = createContext(null)

const getStoredToken = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || null
  } catch (e) {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  const isAuthenticated = Boolean(token)

  const login = async (password) => {
    setChecking(true)
    setError('')
    try {
      const res = await axios.post(buildApiUrl('/auth/login', API_BASE_URL), { password })
      const newToken = res.data?.token
      if (!newToken) throw new Error('No token returned by server')
      setToken(newToken)
      try {
        window.localStorage.setItem(STORAGE_KEY, newToken)
      } catch (e) {
        // localStorage unavailable — auth still works for this session via state
      }
      return true
    } catch (err) {
      const message = err.response?.data?.message || 'Could not verify password. Please try again.'
      setError(message)
      return false
    } finally {
      setChecking(false)
    }
  }

  const logout = () => {
    setToken(null)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      // ignore
    }
  }

  // api/client.js dispatches this event whenever a request comes back 401
  // (expired/invalid token) — log the user out so the password gate reappears.
  useEffect(() => {
    const handleInvalidSession = () => logout()
    window.addEventListener('mba-auth-invalid', handleInvalidSession)
    return () => window.removeEventListener('mba-auth-invalid', handleInvalidSession)
  }, [])

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, checking, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}
