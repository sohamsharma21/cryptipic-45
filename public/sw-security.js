// Security-enhanced Service Worker for CryptiPic
const CACHE_NAME = 'cryptipic-v1';
const PROTECTED_CACHE = 'cryptipic-protected-v1';
const PUBLIC_CACHE = 'cryptipic-public-v1';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/hide',
  '/reveal',
  '/metadata',
  '/defense',
  '/settings',
  '/dashboard'
];

// API endpoints that require authentication
const PROTECTED_API_ENDPOINTS = [
  '/api/encrypt',
  '/api/decrypt',
  '/api/metadata',
  '/api/defense'
];

let authenticationStatus = {
  authenticated: false,
  sessionToken: null,
  sessionExpiry: null
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing with security features');
  event.waitUntil(
    caches.open(PUBLIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/about',
        // Add only public assets here
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== PROTECTED_CACHE && cacheName !== PUBLIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Message handler for authentication updates
self.addEventListener('message', (event) => {
  const { type, authenticated, sessionToken, sessionExpiry } = event.data;
  
  switch (type) {
    case 'AUTH_STATUS_UPDATE':
      authenticationStatus = {
        authenticated,
        sessionToken,
        sessionExpiry
      };
      console.log('Authentication status updated:', authenticated);
      break;
      
    case 'CLEAR_PROTECTED_CACHE':
      clearProtectedCache();
      event.ports[0]?.postMessage({ type: 'CACHE_CLEARED' });
      break;
  }
});

// Fetch event with security controls
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (isProtectedRoute(url.pathname) || isProtectedAPI(url.pathname)) {
    event.respondWith(handleProtectedRequest(request));
  } else if (isPublicRoute(url.pathname)) {
    event.respondWith(handlePublicRequest(request));
  } else {
    event.respondWith(handleGeneralRequest(request));
  }
});

// Check if route requires authentication
function isProtectedRoute(pathname) {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

// Check if API endpoint requires authentication
function isProtectedAPI(pathname) {
  return PROTECTED_API_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint));
}

// Check if route is public
function isPublicRoute(pathname) {
  const publicRoutes = ['/', '/about', '/auth'];
  return publicRoutes.includes(pathname) || pathname.startsWith('/static/');
}

// Handle protected requests (require authentication)
async function handleProtectedRequest(request) {
  // Check authentication status
  if (!authenticationStatus.authenticated) {
    console.log('Blocked access to protected route - not authenticated');
    return new Response(
      JSON.stringify({ 
        error: 'Authentication required',
        requiresAuth: true 
      }), 
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Check session expiry
  if (authenticationStatus.sessionExpiry) {
    const expiry = new Date(authenticationStatus.sessionExpiry);
    if (expiry <= new Date()) {
      console.log('Blocked access to protected route - session expired');
      // Clear authentication status
      authenticationStatus.authenticated = false;
      authenticationStatus.sessionToken = null;
      
      return new Response(
        JSON.stringify({ 
          error: 'Session expired',
          requiresAuth: true 
        }), 
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // Try to serve from protected cache first
  try {
    const cachedResponse = await caches.match(request, { cacheName: PROTECTED_CACHE });
    if (cachedResponse) {
      console.log('Serving protected content from cache');
      return cachedResponse;
    }
  } catch (error) {
    console.error('Error accessing protected cache:', error);
  }
  
  // Fetch from network with authentication headers
  try {
    const headers = new Headers(request.headers);
    if (authenticationStatus.sessionToken) {
      headers.set('Authorization', `Bearer ${authenticationStatus.sessionToken}`);
      headers.set('X-Session-Token', authenticationStatus.sessionToken);
    }
    
    const authenticatedRequest = new Request(request, { headers });
    const response = await fetch(authenticatedRequest);
    
    // Cache successful responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(PROTECTED_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Network error for protected request:', error);
    return new Response(
      JSON.stringify({ error: 'Network error' }), 
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle public requests
async function handlePublicRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request, { cacheName: PUBLIC_CACHE });
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(PUBLIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Error handling public request:', error);
    return new Response('Service unavailable', { status: 503 });
  }
}

// Handle general requests
async function handleGeneralRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network
    const response = await fetch(request);
    
    // Cache successful GET requests for static assets
    if (response.ok && request.method === 'GET' && 
        (request.url.includes('.js') || request.url.includes('.css') || 
         request.url.includes('.png') || request.url.includes('.jpg'))) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Error handling general request:', error);
    return new Response('Service unavailable', { status: 503 });
  }
}

// Clear protected cache
async function clearProtectedCache() {
  try {
    await caches.delete(PROTECTED_CACHE);
    console.log('Protected cache cleared');
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'CACHE_CLEARED' });
    });
  } catch (error) {
    console.error('Error clearing protected cache:', error);
  }
}

// Periodic cleanup of expired sessions
setInterval(() => {
  if (authenticationStatus.sessionExpiry) {
    const expiry = new Date(authenticationStatus.sessionExpiry);
    if (expiry <= new Date()) {
      console.log('Session expired - clearing authentication status');
      authenticationStatus.authenticated = false;
      authenticationStatus.sessionToken = null;
      authenticationStatus.sessionExpiry = null;
      clearProtectedCache();
    }
  }
}, 60000); // Check every minute