const CACHE_NAME = 'meatbyalvi-pwa-v1'
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg'
]

// Install: Cache initial shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('PWA Precache warning:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate: Clean up old caches if any
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch: Network-first for dynamic data with cache fallback for navigation
self.addEventListener('fetch', (event) => {
  // Only handle GET requests from the same origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip API calls from caching to avoid stale financial data
  if (event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {})
          })
        }
        return networkResponse
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request)
        if (cachedResponse) {
          return cachedResponse
        }
        // If navigation request fails, return cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/')
        }
      })
  )
})
