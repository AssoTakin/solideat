import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Récupérer les informations de l'utilisateur
    api
      .get('/users/me')
      .then((response) => {
        if (response.data.success) {
          setUser(response.data.data);
        }
      })
      .catch(() => {
        navigate('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Tableau de bord</h1>
        <button onClick={handleLogout}>Déconnexion</button>
      </div>

      {user && (
        <div>
          <h2>Bienvenue, {user.username} !</h2>
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Email :</strong> {user.email}</p>
            <p><strong>Prénom :</strong> {user.firstName}</p>
            <p><strong>Nom :</strong> {user.lastName}</p>
            <p><strong>Ville :</strong> {user.addressCity}</p>
            <p><strong>Email vérifié :</strong> {user.emailVerified ? '✅' : '❌'}</p>
            <p><strong>Téléphone vérifié :</strong> {user.phoneVerified ? '✅' : '❌'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
