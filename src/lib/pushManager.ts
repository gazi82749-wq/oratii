// src/lib/pushManager.ts
// Client-side Web Push subscription management for Oratii PWA

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const SW_PATH = '/sw.js';
const VISIT_COUNT_KEY = 'oratii_dashboard_visits';
const PUSH_DISMISSED_KEY = 'oratii_push_dismissed';

/**
 * Check if the browser supports Push API
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current notification permission status
 */
export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Check if user has already dismissed the push prompt
 */
export function isPromptDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(PUSH_DISMISSED_KEY) === 'true';
}

/**
 * Dismiss the push notification prompt (user clicked "Not Now")
 */
export function dismissPrompt(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PUSH_DISMISSED_KEY, 'true');
  }
}

/**
 * Track dashboard visits — returns true when it's time to show the prompt (2nd visit+)
 */
export function shouldShowPrompt(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isPushSupported()) return false;
  if (Notification.permission !== 'default') return false;
  if (isPromptDismissed()) return false;

  const visits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10) + 1;
  localStorage.setItem(VISIT_COUNT_KEY, String(visits));

  return visits >= 2;
}

/**
 * Convert a base64 VAPID key string to a Uint8Array for PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register the service worker if not already registered
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register(SW_PATH, {
    scope: '/',
  });
  // Wait for the service worker to be ready
  await navigator.serviceWorker.ready;
  return registration;
}

/**
 * Subscribe the browser to push notifications and save to server.
 * Returns true if subscription was successful.
 */
export async function subscribeToPush(authToken?: string): Promise<boolean> {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) {
    console.warn('[Push] Not supported or VAPID key missing');
    return false;
  }

  try {
    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[Push] Permission denied by user');
      return false;
    }

    // 2. Register service worker
    const registration = await registerServiceWorker();

    // 3. Subscribe to push via PushManager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    });

    // 4. Send subscription to our backend
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers,
      body: JSON.stringify(subscription.toJSON()),
    });

    if (!response.ok) {
      console.error('[Push] Failed to save subscription to server');
      return false;
    }

    console.log('[Push] Successfully subscribed to push notifications');
    return true;
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return false;
  }
}

/**
 * Check if the user is currently subscribed to push
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    await subscription.unsubscribe();
    return true;
  } catch (error) {
    console.error('[Push] Unsubscribe failed:', error);
    return false;
  }
}
