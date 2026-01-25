import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService, Message } from '../services/message.service';
import { USE_MOCK_DATA, mockMessages, mockUsers } from '../data/mockData';
import Navigation from '../components/Navigation';
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

export default function Conversation() {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mealId) {
      loadMessages();
    }
  }, [mealId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!mealId) return;

    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        // Filtrer les messages pour cette conversation
        const conversationMessages = mockMessages.filter((m) => m.conversationId === '1');
        setMessages(conversationMessages as any[]);
        setLoading(false);
        return;
      }
      const response = await messageService.getConversationMessages(mealId);
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        setError(response.error || 'Erreur lors du chargement');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!mealId || !newMessage.trim()) return;

    // Vérifier la longueur
    if (newMessage.length > 1000) {
      setError('Le message ne peut pas dépasser 1000 caractères');
      return;
    }

    setSending(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // Simuler l'envoi d'un message
        const newMsg = {
          id: `msg-${Date.now()}`,
          conversationId: '1',
          senderId: mockUsers[3].id, // Utilisateur actuel
          content: newMessage.trim(),
          createdAt: new Date().toISOString(),
          sender: mockUsers[3],
          read: false,
        };
        setMessages([...messages, newMsg as any]);
        setNewMessage('');
        setSending(false);
        return;
      }

      const response = await messageService.sendMessage({
        mealId,
        content: newMessage.trim(),
      });

      if (response.success && response.data) {
        setMessages([...messages, response.data]);
        setNewMessage('');
      } else {
        setError(response.error || 'Erreur lors de l\'envoi');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  // En mode mock, l'utilisateur actuel est le 4ème utilisateur (Thomas)
  const currentUserId = USE_MOCK_DATA ? mockUsers[3].id : localStorage.getItem('userId') || '';

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
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: getPagePaddingBottom(true, false),
      }}
    >
      <Navigation showBottomBar={true} />

      {/* Header */}
      <div
        style={{
          backgroundColor: colors.backgroundWhite,
          padding: '16px',
          borderBottom: `1px solid ${colors.backgroundLight}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={() => navigate('/messages')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: colors.textPrimary,
            padding: '8px',
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, margin: 0, flex: 1 }}>
          Conversation
        </h1>
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '600px', margin: '0 auto', width: '100%', padding: '16px', ...getMainContentStyle(false) }}>
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

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: colors.backgroundWhite,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: colors.textSecondary }}>
              <p style={{ fontSize: '48px', marginBottom: '16px' }}>💬</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '8px' }}>
                Aucun message
              </p>
              <p style={{ fontSize: '14px' }}>Commencez la conversation !</p>
            </div>
          ) : (
            messages.map((message) => {
              const isSender = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: isSender ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  {!isSender && message.sender.profilePhoto && (
                    <img
                      src={message.sender.profilePhoto}
                      alt={message.sender.username}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: isSender ? colors.primary : colors.backgroundLight,
                      color: isSender ? colors.backgroundWhite : colors.textPrimary,
                    }}
                  >
                    {!isSender && (
                      <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.8, fontWeight: 'bold' }}>
                        {message.sender.username}
                      </div>
                    )}
                    <div style={{ fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word' }}>
                      {message.content}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        marginTop: '4px',
                        opacity: 0.7,
                        textAlign: isSender ? 'right' : 'left',
                      }}
                    >
                      {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {message.read && isSender && ' ✓'}
                    </div>
                  </div>
                  {isSender && message.sender.profilePhoto && (
                    <img
                      src={message.sender.profilePhoto}
                      alt={message.sender.username}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            backgroundColor: colors.backgroundWhite,
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                if (e.target.value.length > 1000) {
                  setError('Le message ne peut pas dépasser 1000 caractères');
                } else {
                  setError(null);
                }
              }}
              placeholder="Tapez votre message..."
              rows={2}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.backgroundLight}`,
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
              }}
              maxLength={1000}
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim() || newMessage.length > 1000}
              style={{
                padding: '12px 20px',
                backgroundColor:
                  sending || !newMessage.trim() || newMessage.length > 1000 ? colors.textSecondary : colors.primary,
                color: colors.backgroundWhite,
                border: 'none',
                borderRadius: '8px',
                cursor: sending || !newMessage.trim() || newMessage.length > 1000 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                height: 'fit-content',
              }}
            >
              {sending ? '⏳' : '📤'}
            </button>
          </div>
          {newMessage.length > 0 && (
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '8px', textAlign: 'right' }}>
              {newMessage.length}/1000 caractères
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
