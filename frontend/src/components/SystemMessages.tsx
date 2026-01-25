import { useEffect, useState } from 'react';
import { notificationService, SystemMessage } from '../services/notification.service';

interface SystemMessagesProps {
  onMessageRead?: () => void;
}

export default function SystemMessages({ onMessageRead }: SystemMessagesProps) {
  const [unreadMessages, setUnreadMessages] = useState<SystemMessage[]>([]);
  const [readMessages, setReadMessages] = useState<SystemMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      // Vérifier que le token est présent
      const token = localStorage.getItem('token');
      if (!token) {
        // Pas de token, l'intercepteur API gérera la redirection
        setLoading(false);
        return;
      }

      const response = await notificationService.getSystemMessages();
      if (response.success && response.data) {
        setUnreadMessages(response.data.unread || []);
        setReadMessages(response.data.read || []);
      } else {
        setError(response.error || 'Erreur lors du chargement');
      }
    } catch (err: any) {
      // Si erreur 401, ne pas afficher d'erreur car l'intercepteur API va rediriger
      if (err.response?.status === 401) {
        // L'intercepteur API gère la redirection, ne pas afficher d'erreur
        setLoading(false);
        return;
      }
      setError(err.response?.data?.error || 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await notificationService.markSystemMessageAsRead(messageId);
      if (response.success) {
        // Recharger les messages
        await loadMessages();
        if (onMessageRead) {
          onMessageRead();
        }
      }
    } catch (err: any) {
      // Erreur silencieuse
    }
  };

  const handleToggleMessage = (messageId: string) => {
    if (expandedMessageId === messageId) {
      setExpandedMessageId(null);
    } else {
      setExpandedMessageId(messageId);
      // Marquer comme lu si non lu
      const message = [...unreadMessages, ...readMessages].find((m) => m.id === messageId);
      if (message && !message.read) {
        handleMarkAsRead(messageId);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p>Chargement des messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem' }}>
        <div
          style={{
            backgroundColor: '#FEE',
            color: '#E74C3C',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '2px solid #E74C3C',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>Erreur de chargement</strong>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={loadMessages}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  const allMessages = [...unreadMessages, ...readMessages];
  const hasMessages = allMessages.length > 0;

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Messages système</h2>
        {unreadMessages.length > 0 && (
          <span
            style={{
              backgroundColor: '#ff4444',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {unreadMessages.length}
          </span>
        )}
      </div>

      {!hasMessages ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>Aucun message système</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {allMessages.map((message) => {
            const isUnread = !message.read;
            const isExpanded = expandedMessageId === message.id;

            return (
              <div
                key={message.id}
                style={{
                  border: `1px solid ${isUnread ? '#ff4444' : '#ddd'}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: isUnread ? '#fff5f5' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleToggleMessage(message.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontWeight: isUnread ? 'bold' : 'normal', color: isUnread ? '#ff4444' : '#333' }}>
                        {message.title}
                      </h3>
                      {isUnread && (
                        <span
                          style={{
                            backgroundColor: '#ff4444',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                          }}
                        >
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                      {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span style={{ fontSize: '20px', color: '#999' }}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #eee',
                      whiteSpace: 'pre-wrap',
                      color: '#333',
                    }}
                  >
                    {message.message}
                    {message.link && (
                      <div style={{ marginTop: '1rem' }}>
                        <a
                          href={message.link}
                          style={{ color: '#007bff', textDecoration: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Voir plus →
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
