import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeApiBaseUrl, buildApiUrl } from './config.js'

test('normalizeApiBaseUrl trims trailing slashes', () => {
  assert.equal(normalizeApiBaseUrl('https://example.com/api/'), 'https://example.com/api')
})

test('normalizeApiBaseUrl handles comma-separated URLs by preferring canonical backend', () => {
  const multi = 'https://meatby-alvi-business-tracker-backend-qad10ikl4.vercel.app/api, https://meat-dashboard-backend.vercel.app/'
  assert.equal(normalizeApiBaseUrl(multi), 'https://meat-dashboard-backend.vercel.app/api')
})

test('normalizeApiBaseUrl appends /api if omitted', () => {
  assert.equal(normalizeApiBaseUrl('https://meat-dashboard-backend.vercel.app'), 'https://meat-dashboard-backend.vercel.app/api')
})

test('buildApiUrl joins paths without duplicate slashes', () => {
  assert.equal(buildApiUrl('/auth/login'), 'http://localhost:5050/api/auth/login')
})

