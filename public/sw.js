// Oratii Push Notification & PWA Service Worker (v3)
// Handles installation, offline caching fallback, and push notifications
// CRITICAL: NEVER return HTML documents for scripts, styles, or API routes to prevent JS compile/syntax errors!

const CACHE_NAME = 'oratii-pwa-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico'
];

// Install event — precache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => console.warn('[SW] Cache pre-fill skipped:', err));
    })
  );
  self.skipWaiting();
});

// Activate event — claim clients & clear all old caches immediately (v1, v2, etc.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('[SW] Purging old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event — required for Google Chrome PWA installation compliance
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Bypass Service Worker entirely for external origins (Supabase, Razorpay, AI APIs, Google, etc.)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Bypass Service Worker for API endpoints, Next.js data fetches, and development/HMR
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/') ||
    url.pathname.includes('/_next/webpack-hmr') ||
    url.searchParams.has('_rsc')
  ) {
    return;
  }

  // 3. For Next.js static JS chunks, CSS, and media assets:
  // Stale-while-revalidate or Network-first.
  // CRITICAL: NEVER return HTML ('/') fallback for scripts or styles! Returning HTML causes
  // "SyntaxError: Unexpected token '<'" when the browser attempts to compile the script.
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font';

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version immediately and optionally update cache in background
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Not in cache: fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch((error) => {
            // Asset is not in cache and network failed.
            // Do NOT return HTML! Return 503 or rethrow so the browser/Next.js handles offline properly.
            return new Response('Network error loading static asset', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
    );
    return;
  }

  // 4. For HTML page navigation requests (event.request.mode === 'navigate')
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback ONLY for page navigations: serve cached page or cached '/'
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/').then((homeResponse) => {
              if (homeResponse) return homeResponse;
              return new Response(
                '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Oratii - Offline</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#1e293b;text-align:center;padding:20px;"><div><h1 style="font-size:24px;margin-bottom:8px;">You are currently offline</h1><p style="color:#64748b;margin-bottom:20px;">Please check your internet connection and refresh the page.</p><button onclick="window.location.reload()" style="padding:10px 20px;background:#1b2140;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:600;">Retry</button></div></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
          });
        })
    );
    return;
  }

  // 5. Default fallback for other requests: standard network fetch
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: 'Oratii',
      body: event.data.text(),
      url: '/',
    };
  }

  const options = {
    body: data.body || 'You have a new notification from Oratii.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'oratii-notification',
    renotify: true,
    requireInteraction: false,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Open Oratii App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Oratii', options)
  );
});

// Handle notification click — navigate to the target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
