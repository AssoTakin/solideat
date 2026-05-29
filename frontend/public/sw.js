// Service Worker pour les notifications push (US-038)
const CACHE_NAME = 'solideat-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET, les requêtes d'API, ou hors-domaine (ex: extensions, CDN)
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Utiliser une stratégie Network-First pour index.html et les ressources locales
  // afin de s'assurer que les mises à jour de code ne soient pas bloquées dans le cache.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre à jour le cache uniquement si la réponse est valide
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Hors ligne : servir depuis le cache
        return caches.match(event.request);
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'SOLID\'EAT', body: event.data.text() };
    }
  }

  const options = {
    title: data.title || 'SOLID\'EAT',
    body: data.body || data.message || 'Nouvelle notification',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    data: data.data || {},
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      data: options.data,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
    })
  );
});

// Gestion du clic sur une notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  const urlToOpen = data?.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focus
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
