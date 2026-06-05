import api from '../services/api';

// Utilitaires pour les notifications push (US-038)

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      // Erreur silencieuse - le service worker n'est pas obligatoire
      return null;
    }
  }
  return null;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    // Lecture de la clé publique depuis les variables d'environnement Vite
    let vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    
    // Si la clé n'est pas présente côté client, on la récupère du backend
    if (!vapidKey) {
      try {
        const response = await api.get('/push/key');
        if (response.data?.success && response.data?.data?.publicKey) {
          vapidKey = response.data.data.publicKey;
        }
      } catch (err) {
        // Échec silencieux
      }
    }

    if (!vapidKey) {
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    });

    // Envoyer la subscription au backend pour l'enregistrer en base
    await api.post('/push/subscribe', subscription);

    return subscription;
  } catch (error) {
    return null;
  }
}

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

// Initialiser les notifications push
export async function initializePushNotifications(): Promise<void> {
  const registration = await registerServiceWorker();
  if (!registration) {
    return;
  }

  const permission = await requestNotificationPermission();
  if (permission === 'granted') {
    await subscribeToPushNotifications(registration);
  }
}
