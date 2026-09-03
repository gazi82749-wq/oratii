// Oratii Push Notification Service Worker
// Handles push events and notification clicks for the PWA

const CACHE_NAME = 'oratii-notifications-v1';

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
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'oratii-notification',
    renotify: true,
    requireInteraction: false,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Open Oratii' },
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

// Activate immediately — claim all open clients
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
