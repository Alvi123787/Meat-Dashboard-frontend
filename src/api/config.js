const DEFAULT_API_BASE_URL = 'http://localhost:5050/api'

const getRuntimeEnv = () => {
  if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
    return import.meta.env
  }
  return {}
}

export const normalizeApiBaseUrl = (value = '') => {
  let trimmedValue = String(value || '').trim()
  if (!trimmedValue) return DEFAULT_API_BASE_URL

  // If multiple URLs were entered (e.g. comma-separated in env vars), pick the canonical/first valid one
  if (trimmedValue.includes(',')) {
    const parts = trimmedValue
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
    const preferred = parts.find((p) => p.includes('meat-dashboard-backend.vercel.app')) || parts[0]
    trimmedValue = preferred || DEFAULT_API_BASE_URL
  }

  let cleaned = trimmedValue.replace(/\/+$/, '')

  // Ensure base URL ends with /api for backend endpoint routing
  if (!cleaned.endsWith('/api') && !cleaned.includes('/api/')) {
    cleaned = `${cleaned}/api`
  }

  return cleaned
}

export const buildApiUrl = (path = '', baseUrl = DEFAULT_API_BASE_URL) => {
  const normalizedBaseUrl = normalizeApiBaseUrl(baseUrl)
  const normalizedPath = String(path || '').trim()

  if (!normalizedPath) return normalizedBaseUrl

  const sanitizedPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  return `${normalizedBaseUrl}${sanitizedPath}`
}

export const getApiBaseUrl = () => normalizeApiBaseUrl(getRuntimeEnv().VITE_API_BASE_URL || DEFAULT_API_BASE_URL)

export const API_BASE_URL = getApiBaseUrl()

