import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messageService, Conversation } from '../services/message.service';

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
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={loadConversations}>Réessayer</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Mes conversations</h1>

      {conversations.length === 0 ? (
        <p>Aucune conversation</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          {conversations.map((conversation) => (
            <Link
              key={conversation.mealId}
              to={`/messages/${conversation.mealId}`}
              style={{
                display: 'block',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={conversation.meal.photo}
                  alt={conversation.meal.name}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <h3>{conversation.meal.name}</h3>
                  <p><strong>Avec:</strong> {conversation.otherUser.username}</p>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    {conversation.lastMessage.content.substring(0, 100)}
                    {conversation.lastMessage.content.length > 100 ? '...' : ''}
                  </p>
                  <p style={{ color: '#999', fontSize: '0.8rem' }}>
                    {new Date(conversation.lastMessage.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <div
                    style={{
                      background: '#007bff',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
