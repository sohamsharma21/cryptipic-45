// CryptiPic Service Worker - Defense Grade PWA
const CACHE_NAME = 'cryptipic-defense-v1.0.0';
const OFFLINE_CACHE = 'cryptipic-offline-v1.0.0';
const IMAGES_CACHE = 'cryptipic-images-v1.0.0';

// Core app files to cache for offline functionality
const CORE_FILES = [
  '/',
  '/hide',
  '/reveal',
  '/defense',
  '/about',
  '/auth',
  '/dashboard',
  '/settings',
  '/metadata',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Image processing libraries and dependencies
const CRITICAL_ASSETS = [
  '/lovable-uploads/390e3f59-0f90-4390-a0eb-d404f3b7abaf.png',
  '/lovable-uploads/6a7770e9-8262-4451-a248-72435e52e946.png'
];

// Security headers for all responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co;"
};

// Install event - cache core resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching core files');
        return cache.addAll(CORE_FILES);
      }),
      caches.open(IMAGES_CACHE).then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
    ]).then(() => {
      console.log('[SW] Core files cached successfully');
      self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== OFFLINE_CACHE && 
              cacheName !== IMAGES_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Handle images with cache-first strategy
  if (request.destination === 'image' || url.pathname.includes('/lovable-uploads/')) {
    event.respondWith(cacheFirstWithNetwork(request, IMAGES_CACHE));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(cacheFirstWithNetwork(request, CACHE_NAME));
});

// Network-first strategy for API calls
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    
    // Clone and cache successful responses
    if (response.ok) {
      const cache = await caches.open(OFFLINE_CACHE);
      cache.put(request, response.clone());
    }
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return addSecurityHeaders(cachedResponse);
    }
    
    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires internet connection',
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          ...SECURITY_HEADERS
        }
      }
    );
  }
}

// Cache-first strategy for static assets
async function cacheFirstWithNetwork(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    updateCacheInBackground(request, cacheName);
    return addSecurityHeaders(cachedResponse);
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.log('[SW] Failed to fetch:', request.url);
    
    // Return offline fallback page for navigation
    if (request.mode === 'navigate') {
      return getOfflinePage();
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Navigation handler with offline support
async function navigationHandler(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful navigation responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return addSecurityHeaders(response);
    }
  } catch (error) {
    console.log('[SW] Navigation network failed, trying cache');
  }
  
  // Try cache for navigation
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return addSecurityHeaders(cachedResponse);
  }
  
  // Try to serve the root page as fallback
  const rootResponse = await caches.match('/');
  if (rootResponse) {
    return addSecurityHeaders(rootResponse);
  }
  
  // Final fallback - offline page
  return getOfflinePage();
}

// Background cache update
function updateCacheInBackground(request, cacheName) {
  fetch(request).then((response) => {
    if (response.ok) {
      caches.open(cacheName).then((cache) => {
        cache.put(request, response);
      });
    }
  }).catch(() => {
    // Silently fail background updates
  });
}

// Add security headers to responses
function addSecurityHeaders(response) {
  const newHeaders = new Headers(response.headers);
  
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// Offline fallback page
function getOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CryptiPic - Offline</title>
      <style>
        body { 
          font-family: system-ui, -apple-system, sans-serif; 
          background: #0f172a; 
          color: #e2e8f0; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          margin: 0;
          text-align: center;
        }
        .offline-container {
          max-width: 400px;
          padding: 2rem;
          background: #1e293b;
          border-radius: 0.5rem;
          border: 1px solid #334155;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .offline-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #f1f5f9;
        }
        .offline-message {
          color: #94a3b8;
          margin-bottom: 2rem;
        }
        .retry-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
        }
        .retry-button:hover {
          background: #2563eb;
        }
        .security-notice {
          margin-top: 2rem;
          padding: 1rem;
          background: #7c2d12;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #fed7aa;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">🔒</div>
        <h1 class="offline-title">CryptiPic Offline</h1>
        <p class="offline-message">
          You're currently offline. Some features may be limited until connection is restored.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
          Retry Connection
        </button>
        <div class="security-notice">
          <strong>SECURITY NOTICE:</strong> Cached operations maintain defense-grade security standards even offline.
        </div>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      ...SECURITY_HEADERS
    }
  });
}

// Background sync for queued operations
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'audit-sync') {
    event.waitUntil(syncAuditLogs());
  } else if (event.tag === 'image-upload') {
    event.waitUntil(syncImageUploads());
  }
});

// Sync audit logs when online
async function syncAuditLogs() {
  try {
    const pendingLogs = await getStoredAuditLogs();
    if (pendingLogs.length > 0) {
      // Send to secure audit service when available
      console.log('[SW] Syncing', pendingLogs.length, 'audit logs');
      // Implementation would send to backend audit service
      clearStoredAuditLogs();
    }
  } catch (error) {
    console.error('[SW] Failed to sync audit logs:', error);
  }
}

// Sync queued image uploads
async function syncImageUploads() {
  try {
    const pendingUploads = await getStoredImageUploads();
    if (pendingUploads.length > 0) {
      console.log('[SW] Syncing', pendingUploads.length, 'image uploads');
      // Implementation would process queued uploads
      clearStoredImageUploads();
    }
  } catch (error) {
    console.error('[SW] Failed to sync image uploads:', error);
  }
}

// Utility functions for offline storage
function getStoredAuditLogs() {
  return new Promise((resolve) => {
    // Implementation would read from IndexedDB
    resolve([]);
  });
}

function clearStoredAuditLogs() {
  // Implementation would clear IndexedDB audit logs
}

function getStoredImageUploads() {
  return new Promise((resolve) => {
    // Implementation would read from IndexedDB
    resolve([]);
  });
}

function clearStoredImageUploads() {
  // Implementation would clear IndexedDB image uploads
}

// Push notifications for security alerts
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/lovable-uploads/390e3f59-0f90-4390-a0eb-d404f3b7abaf.png',
    badge: '/lovable-uploads/390e3f59-0f90-4390-a0eb-d404f3b7abaf.png',
    data: data.data,
    requireInteraction: data.priority === 'high',
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/lovable-uploads/390e3f59-0f90-4390-a0eb-d404f3b7abaf.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    tag: data.tag || 'security-alert'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/defense')
    );
  }
});

console.log('[SW] CryptiPic Defense Service Worker loaded successfully');