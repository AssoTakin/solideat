import { useEffect, useState } from 'react';
import api, { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '../services/api';
import Navigation from '../components/Navigation';
import { colors } from '../utils/theme';
import { BellIcon } from '../components/Icons';

export default function PushSettings() {
  const [vapidPublicKey, setVapidPublicKey] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [supportsPush, setSupportsPush] = useState(true);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupportsPush(false);
      return;
    }

    // Récupérer la clé publique VAPID
    api.get('/push/key')
      .then((res) => {
        if (res.data?.success) {
          setVapidPublicKey(res.data.data.publicKey);
        }
      })
      .catch(() => {
        setError('Impossible de récupérer la clé VAPID.');
      });

    // Vérifier si déjà abonné
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });
  }, []);

  const handleSubscribe = async () => {
    if (!vapidPublicKey) return;
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const subscription = await subscribeToPushNotifications(vapidPublicKey);
      if (!subscription) {
        setError('Votre navigateur ne supporte pas les notifications push.');
        return;
      }

      await api.post('/push/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys?.p256dh,
          auth: subscription.toJSON().keys?.auth,
        },
      });

      setIsSubscribed(true);
      setMessage('Notifications push activées ✅');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de l\'activation.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await api.post('/push/unsubscribe', { endpoint: existing.endpoint });
      }
      const unsubscribed = await unsubscribeFromPushNotifications();
      if (unsubscribed) {
        setIsSubscribed(false);
        setMessage('Notifications push désactivées.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la désactivation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.backgroundLight }}>
      <Navigation />
      <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <BellIcon size={28} color={colors.primary} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: colors.textPrimary }}>Notifications push</h1>
        </div>

        {!supportsPush && (
          <div style={{ padding: 16, backgroundColor: '#fff3cd', borderRadius: 8, color: '#856404' }}>
            Votre navigateur ne supporte pas les notifications push.
          </div>
        )}

        {error && <div style={{ color: colors.error, marginBottom: 12 }}>{error}</div>}
        {message && <div style={{ color: colors.success, marginBottom: 12 }}>{message}</div>}

        <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ color: colors.textPrimary, lineHeight: 1.6 }}>
            Recevez une alerte quand un repas est disponible près de chez vous, quand une réservation est confirmée ou quand votre abonnement est renouvelé.
          </p>

          {isSubscribed ? (
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '14px 20px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: colors.error,
                color: '#fff',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Désactivation...' : 'Désactiver les notifications push'}
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading || !vapidPublicKey}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '14px 20px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: colors.primary,
                color: '#fff',
                fontWeight: 600,
                cursor: loading || !vapidPublicKey ? 'not-allowed' : 'pointer',
                opacity: loading || !vapidPublicKey ? 0.7 : 1,
              }}
            >
              {loading ? 'Activation...' : 'Activer les notifications push'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
