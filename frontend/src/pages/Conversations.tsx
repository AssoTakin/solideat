import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messageService, Conversation } from '../services/message.service';
import { USE_MOCK_DATA, mockConversations } from '../data/mockData';
import Navigation from '../components/Navigation';

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

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        setConversations(mockConversations as any[]);
        setLoading(false);
        return;
      }
      const response = await messageService.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
      } else {
        setError(response.error || 'Erreur lors du chargement');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.backgroundLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: colors.textPrimary }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.backgroundLight,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: '100px',
      }}
    >
      <Navigation showBottomBar={true} />

      {/* Header */}
      <div
        style={{
          backgroundColor: colors.backgroundWhite,
          padding: '16px',
          borderBottom: `1px solid ${colors.backgroundLight}`,
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
          Mes conversations
        </h1>
      </div>

      <main style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
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
            <button
              onClick={loadConversations}
              style={{
                marginLeft: '12px',
                padding: '6px 12px',
                backgroundColor: colors.primary,
                color: colors.backgroundWhite,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {conversations.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>💬</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '8px' }}>
              Aucune conversation
            </p>
            <p style={{ fontSize: '14px', color: colors.textSecondary }}>
              Vous n'avez pas encore de messages. Commencez une conversation depuis une fiche repas !
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conversations.map((conversation) => (
              <Link
                key={conversation.mealId}
                to={`/messages/${conversation.mealId}`}
                style={{
                  display: 'block',
                  backgroundColor: colors.backgroundWhite,
                  borderRadius: '12px',
                  padding: '16px',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img
                    src={conversation.meal.photo}
                    alt={conversation.meal.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: colors.textPrimary,
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conversation.meal.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '0 0 8px 0' }}>
                      Avec: {conversation.otherUser.username}
                    </p>
                    <p
                      style={{
                        color: colors.textPrimary,
                        fontSize: '14px',
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conversation.lastMessage.content.substring(0, 80)}
                      {conversation.lastMessage.content.length > 80 ? '...' : ''}
                    </p>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
                      {new Date(conversation.lastMessage.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.backgroundWhite,
                        borderRadius: '50%',
                        minWidth: '24px',
                        height: '24px',
                        padding: '0 6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        flexShrink: 0,
                      }}
                    >
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
