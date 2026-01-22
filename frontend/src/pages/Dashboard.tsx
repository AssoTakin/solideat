import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import api from '../services/api';
import { dashboardService, DashboardStats } from '../services/dashboard.service';
import { subscriptionService } from '../services/subscription.service';
import SystemMessages from '../components/SystemMessages';
import QuotaStatusComponent from '../components/QuotaStatus';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'quotas'>('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      // Charger les informations utilisateur
      const userResponse = await api.get('/users/me');
      if (userResponse.data.success) {
        setUser(userResponse.data.data);
      }

      // Charger les statistiques du dashboard
      const statsResponse = await dashboardService.getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setDashboardStats(statsResponse.data);
      }

      // Charger l'abonnement actuel
      const subscriptionResponse = await subscriptionService.getCurrentSubscription();
      if (subscriptionResponse.success && subscriptionResponse.data) {
        setCurrentSubscription(subscriptionResponse.data);
      }
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const handleMessageRead = () => {
    // Recharger les statistiques si nécessaire
    loadData();
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Tableau de bord</h1>
        <button onClick={handleLogout}>Déconnexion</button>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: activeTab === 'overview' ? '#007bff' : 'transparent',
            color: activeTab === 'overview' ? 'white' : '#333',
            cursor: 'pointer',
            borderBottom: activeTab === 'overview' ? '2px solid #007bff' : '2px solid transparent',
            marginBottom: '-2px',
          }}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: activeTab === 'messages' ? '#007bff' : 'transparent',
            color: activeTab === 'messages' ? 'white' : '#333',
            cursor: 'pointer',
            borderBottom: activeTab === 'messages' ? '2px solid #007bff' : '2px solid transparent',
            marginBottom: '-2px',
          }}
        >
          Messages système
        </button>
        <button
          onClick={() => setActiveTab('quotas')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: activeTab === 'quotas' ? '#007bff' : 'transparent',
            color: activeTab === 'quotas' ? 'white' : '#333',
            cursor: 'pointer',
            borderBottom: activeTab === 'quotas' ? '2px solid #007bff' : '2px solid transparent',
            marginBottom: '-2px',
          }}
        >
          Quotas
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div>
          {user && (
            <div style={{ marginBottom: '2rem' }}>
              <h2>Bienvenue, {user.username} !</h2>
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Email</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{user.email}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Ville</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{user.addressCity}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Note globale</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>
                    {dashboardStats?.personal.globalRating.toFixed(1) || 'N/A'} ⭐
                  </p>
                </div>
              </div>
            </div>
          )}

          {dashboardStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Activité */}
              <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Activité</h3>
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Repas proposés :</strong> {dashboardStats.activity.mealsProposed.available} disponibles, {dashboardStats.activity.mealsProposed.reserved} réservés</p>
                  <p><strong>Repas réservés :</strong> {dashboardStats.activity.mealsReserved.reserved} au total, {dashboardStats.activity.mealsReserved.upcoming} à venir</p>
                  <p><strong>En attente de commentaire :</strong> {dashboardStats.activity.mealsPendingReview}</p>
                </div>
              </div>

              {/* Historique */}
              <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Historique</h3>
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Repas servis :</strong> {dashboardStats.history.mealsServed}</p>
                  <p><strong>Repas reçus :</strong> {dashboardStats.history.mealsReceived}</p>
                  <p><strong>Repas expirés :</strong> {dashboardStats.history.mealsExpired}</p>
                  <p><strong>Repas annulés :</strong> {dashboardStats.history.mealsCancelled}</p>
                </div>
              </div>

              {/* Statistiques personnelles */}
              <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Statistiques</h3>
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Note globale :</strong> {dashboardStats.personal.globalRating.toFixed(1)} ⭐</p>
                  <p><strong>Badges :</strong> {dashboardStats.personal.badges.length}</p>
                  <p><strong>Bonus donateurs disponibles :</strong> {dashboardStats.personal.bonusDonorsAvailable}</p>
                  <p><strong>Membre depuis :</strong> {new Date(dashboardStats.personal.registrationDate).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Abonnement */}
              <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Abonnement</h3>
                <div style={{ marginTop: '1rem' }}>
                  {currentSubscription && currentSubscription.active ? (
                    <>
                      <p><strong>Type :</strong> {currentSubscription.type}</p>
                      {currentSubscription.endDate && (
                        <p><strong>Expire le :</strong> {new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')}</p>
                      )}
                      <Link to="/subscriptions/plans" style={{ color: '#007bff', textDecoration: 'none' }}>
                        Gérer mon abonnement →
                      </Link>
                    </>
                  ) : (
                    <>
                      <p><strong>Statut :</strong> Gratuit</p>
                      <Link to="/subscriptions/plans" style={{ color: '#007bff', textDecoration: 'none' }}>
                        Passer à Premium →
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Statistiques premium */}
              {dashboardStats.premium && (
                <div style={{ padding: '1.5rem', backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0 }}>Impact environnemental (Premium)</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <p><strong>Repas sauvés :</strong> {dashboardStats.premium.mealsSaved}</p>
                    <p><strong>CO₂ évité :</strong> {dashboardStats.premium.co2Avoided.toFixed(1)} kg</p>
                    <p><strong>Ce mois :</strong> {dashboardStats.premium.monthlyImpact.mealsSaved} repas, {dashboardStats.premium.monthlyImpact.co2Avoided.toFixed(1)} kg CO₂</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && <SystemMessages onMessageRead={handleMessageRead} />}

      {activeTab === 'quotas' && <QuotaStatusComponent />}
    </div>
  );
}
