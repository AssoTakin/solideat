import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID utilisateur manquant');
      setLoading(false);
      return;
    }

    api
      .get(`/users/${id}`)
      .then((response) => {
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          setError(response.data.error || 'Erreur lors du chargement');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Erreur lors du chargement');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (!user) {
    return <div style={{ padding: '2rem' }}>Utilisateur non trouvé</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Profil de {user.username}</h1>

      <div style={{ marginTop: '2rem' }}>
        {user.profilePhoto && (
          <img src={user.profilePhoto} alt={user.username} style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '1rem' }} />
        )}

        <div>
          <p><strong>Ville :</strong> {user.addressCity}</p>
          {user.description && <p><strong>Description :</strong> {user.description}</p>}
          {user.culinaryStyle && <p><strong>Style culinaire :</strong> {user.culinaryStyle}</p>}
          {user.phone && <p><strong>Téléphone :</strong> {user.phone}</p>}
          <p><strong>Note globale :</strong> {user.globalRating ? user.globalRating.toFixed(1) : 'N/A'}</p>
          <p><strong>Repas servis :</strong> {user.mealsServed || 0}</p>
          <p><strong>Repas reçus :</strong> {user.mealsReceived || 0}</p>
          <p><strong>Membre depuis :</strong> {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
}
