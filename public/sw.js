// Oratii Push Notification & PWA Service Worker
// Handles installation, offline caching fallback, and push notifications

const CACHE_NAME = 'oratii-pwa-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event — claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event — required for Google Chrome PWA installation compliance
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
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
      // If Oratii is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise, open a new window
      return clients.openWindow(targetUrl);
    })
  );
});
