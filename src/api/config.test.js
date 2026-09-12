import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeApiBaseUrl, buildApiUrl } from './config.js'

test('normalizeApiBaseUrl trims trailing slashes', () => {
  assert.equal(normalizeApiBaseUrl('https://example.com/api/'), 'https://example.com/api')
})

test('buildApiUrl joins paths without duplicate slashes', () => {
  assert.equal(buildApiUrl('/auth/login'), 'http://localhost:5050/api/auth/login')
})
