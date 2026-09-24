self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Solideat', message: event.data.text() };
  }

  const { title, message, icon, badge, link, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title || 'Solideat', {
      body: message || '',
      icon: icon || '/icon-192x192.png',
      badge: badge || '/icon-72x72.png',
      tag: link || 'solideat-notification',
      data: data || { link: link || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus sur une fenêtre existante ou ouverture d'un nouvel onglet
      for (const client of clients) {
        if (client.url === link && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(link);
      }
    })
  );
});
