import axios from 'axios'
import { API_BASE_URL } from './config.js'

const TOKEN_STORAGE_KEY = 'mba-dashboard-token'

const client = axios.create({
  baseURL: API_BASE_URL
})
client.defaults.headers.post['Content-Type'] = 'application/json'
client.defaults.headers.put['Content-Type'] = 'application/json'

// Attach the saved auth token (if any) to every outgoing request.
client.interceptors.request.use((config) => {
  try {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // localStorage unavailable — request goes out unauthenticated and the
    // backend will correctly reject it with 401
  }
  return config
})

// If the backend says the session is missing/invalid/expired, broadcast an
// event so AuthContext can clear the stored token and show the password gate
// again — without api/client.js needing to import AuthContext directly.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('mba-auth-invalid'))
    }
    return Promise.reject(error)
  }
)

export const entriesApi = {
  list: (params = {}) => client.get('/entries', { params }).then((r) => r.data),
  getById: (id) => client.get(`/entries/${id}`).then((r) => r.data),
  create: (payload) => client.post('/entries', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/entries/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/entries/${id}`).then((r) => r.data),
  summary: (params = {}) => client.get('/entries/summary', { params }).then((r) => r.data)
}

export const expensesApi = {
  list: (params = {}) => client.get('/expenses', { params }).then((r) => r.data),
  getById: (id) => client.get(`/expenses/${id}`).then((r) => r.data),
  create: (payload) => client.post('/expenses', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/expenses/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/expenses/${id}`).then((r) => r.data)
}

export const duesApi = {
  list: (params = {}) => client.get('/dues', { params }).then((r) => r.data),
  getById: (id) => client.get(`/dues/${id}`).then((r) => r.data),
  create: (payload) => client.post('/dues', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/dues/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/dues/${id}`).then((r) => r.data)
}

const FARM2MEAT_API_BASE = 'https://farm2-meat-backend.vercel.app/api'

export const meatItemsApi = {
  getAll: (limit = 100) =>
    axios.get(`${FARM2MEAT_API_BASE}/meat-items`, { params: { limit } }).then((r) => r.data),
  getByCategory: () =>
    axios.get(`${FARM2MEAT_API_BASE}/meat-items/by-category`).then((r) => r.data)
}

export default client
