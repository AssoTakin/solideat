import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService, Message } from '../services/message.service';

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

  if (loading) {
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate('/messages')}>← Retour aux conversations</button>
      </div>

      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Aucun message</p>
        ) : (
          messages.map((message) => {
            const isSender = message.senderId === localStorage.getItem('userId'); // TODO: Récupérer depuis le store
            return (
              <div
                key={message.id}
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: isSender ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: isSender ? '#007bff' : '#f0f0f0',
                    color: isSender ? 'white' : 'black',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', marginBottom: '0.25rem', opacity: 0.8 }}>
                    {message.sender.username}
                  </div>
                  <div>{message.content}</div>
                  <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.7 }}>
                    {new Date(message.createdAt).toLocaleString('fr-FR')}
                    {message.read && isSender && ' ✓'}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          rows={3}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          maxLength={1000}
        />
        <button
          onClick={handleSend}
          disabled={sending || !newMessage.trim() || newMessage.length > 1000}
          style={{
            padding: '0.75rem 1.5rem',
            background: sending || !newMessage.trim() || newMessage.length > 1000 ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: sending || !newMessage.trim() || newMessage.length > 1000 ? 'not-allowed' : 'pointer',
          }}
        >
          {sending ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
      {newMessage.length > 0 && (
        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
          {newMessage.length}/1000 caractères
        </div>
      )}
    </div>
  );
}
