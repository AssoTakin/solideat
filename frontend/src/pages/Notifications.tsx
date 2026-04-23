import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import api from '../services/api';
import { notificationService } from '../services/notification.service';
import { USE_MOCK_DATA, mockNotifications } from '../data/mockData';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';

// Design System Colors
const colors = {
  primary: '#FF6B35',
  primaryHover: '#FF8C5A',
  primaryActive: '#E55A2B',
  sosAccent: '#4ECDC4',
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  backgroundLight: '#ECF0F1',
  backgroundWhite: '#FFFFFF',
  premium: '#9B59B6',
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  mealId?: string;
  reservationId?: string;
  userId?: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        let notifications = [...mockNotifications];
        if (filter === 'unread') {
          notifications = notifications.filter((n) => !n.read);
        }
        setNotifications(notifications);
        setLoading(false);
        return;
      }
      
      // Vérifier que le token est présent
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await api.get(`/notifications?read=${filter === 'unread' ? 'false' : 'all'}`);
      if (response.data.success && response.data.data) {
        setNotifications(response.data.data);
      } else {
        setError('Erreur lors du chargement');
      }
    } catch (err: any) {
      // Si erreur 401, l'intercepteur API gère la redirection
      if (err.response?.status === 401) {
        setLoading(false);
        return;
      }
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'RESERVATION':
        return '✅';
      case 'CANCELLATION':
        return '❌';
      case 'REVIEW':
        return '⭐';
      case 'SAVE_THEM':
        return '🆘';
      case 'MEAL_EXPIRING':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.mealId) {
      navigate(`/meals/${notification.mealId}`);
    } else if (notification.reservationId) {
      navigate('/reservations');
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: colors.textPrimary, fontFamily: 'Inter, sans-serif' }}>
        Chargement...
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.backgroundLight,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: getPagePaddingBottom(true, false), // Espace pour la bottom bar
      }}
    >
      <Navigation showBottomBar={true} />
      {/* Header */}
      <header
        style={{
          backgroundColor: colors.backgroundWhite,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: `1px solid ${colors.backgroundLight}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: colors.textPrimary,
            }}
          >
            ←
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
            Notifications
          </h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              padding: '6px 12px',
              backgroundColor: colors.primary,
              color: colors.backgroundWhite,
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Tout marquer lu
          </button>
        )}
      </header>

      {/* Filtres */}
      <div
        style={{
          padding: '16px',
          backgroundColor: colors.backgroundWhite,
          display: 'flex',
          gap: '8px',
          borderBottom: `1px solid ${colors.backgroundLight}`,
        }}
      >
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === 'all' ? colors.primary : colors.backgroundLight,
            color: filter === 'all' ? colors.backgroundWhite : colors.textPrimary,
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          style={{
            padding: '8px 16px',
            backgroundColor: filter === 'unread' ? colors.primary : colors.backgroundLight,
            color: filter === 'unread' ? colors.backgroundWhite : colors.textPrimary,
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Non lues ({unreadCount})
        </button>
      </div>

      {/* Liste des notifications */}
      <main style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', ...getMainContentStyle(false) }}>
        {error && (
          <div
            style={{
              backgroundColor: '#FEE',
              color: colors.error,
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: colors.textSecondary }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '8px' }}>
              Aucune notification
            </p>
            <p style={{ fontSize: '14px' }}>
              {filter === 'unread'
                ? "Vous n'avez pas de notifications non lues"
                : "Vous n'avez pas encore de notifications"}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  backgroundColor: notification.read ? colors.backgroundWhite : `${colors.primary}10`,
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  border: notification.read ? `1px solid ${colors.backgroundLight}` : `2px solid ${colors.primary}`,
                  boxShadow: notification.read ? '0 2px 8px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = notification.read
                    ? '0 2px 8px rgba(0,0,0,0.1)'
                    : '0 4px 12px rgba(0,0,0,0.15)';
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      fontSize: '32px',
                      flexShrink: 0,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: colors.textPrimary,
                          margin: 0,
                        }}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: colors.primary,
                            flexShrink: 0,
                            marginTop: '6px',
                          }}
                        />
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '14px',
                        color: colors.textSecondary,
                        margin: '4px 0 0 0',
                        lineHeight: '1.5',
                      }}
                    >
                      {notification.message}
                    </p>
                    <p
                      style={{
                        fontSize: '12px',
                        color: colors.textSecondary,
                        margin: '8px 0 0 0',
                      }}
                    >
                      {new Date(notification.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
