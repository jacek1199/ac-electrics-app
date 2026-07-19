/** Nuclear "just fix it" option: drop the service worker + all caches and
 *  hard-reload, so a device stuck on an old cached build (blank screen,
 *  missing feature, weird layout) gets back to a known-good state in one
 *  click instead of needing manual browser troubleshooting. */
export async function repairApp(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((r) => r.unregister()))
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } finally {
    window.location.reload()
  }
}
