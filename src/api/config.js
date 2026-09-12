const DEFAULT_API_BASE_URL = 'http://localhost:5050/api'

const getRuntimeEnv = () => {
  if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
    return import.meta.env
  }
  return {}
}

export const normalizeApiBaseUrl = (value = '') => {
  const trimmedValue = String(value || '').trim()
  if (!trimmedValue) return DEFAULT_API_BASE_URL
  return trimmedValue.replace(/\/+$/, '')
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
