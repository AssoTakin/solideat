import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService, SubscriptionPlan } from '../services/subscription.service';
import api from '../services/api';
import { USE_MOCK_DATA, mockSubscriptionPlans, mockUsers } from '../data/mockData';
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

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        setPlans(mockSubscriptionPlans as any[]);
        setUser(mockUsers[0]); // Utilisateur gratuit par défaut
        setCurrentSubscription(null);
        setLoading(false);
        return;
      }

      // Charger les plans
      const plansResponse = await subscriptionService.getPlans();
      if (plansResponse.success && plansResponse.data) {
        setPlans(plansResponse.data);
      }

      // Charger l'abonnement actuel
      const subscriptionResponse = await subscriptionService.getCurrentSubscription();
      if (subscriptionResponse.success && subscriptionResponse.data) {
        setCurrentSubscription(subscriptionResponse.data);
      }

      // Charger les infos utilisateur
      const userResponse = await api.get('/users/me');
      if (userResponse.data.success) {
        setUser(userResponse.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      // TODO: Intégrer Stripe Elements pour le paiement
      // Pour l'instant, on simule la souscription
      const response = await subscriptionService.createSubscription({ planId });
      if (response.success) {
        alert('Abonnement créé avec succès !');
        navigate('/dashboard');
      } else {
        alert(response.error || 'Erreur lors de la souscription');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la souscription');
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Il restera actif jusqu\'à la fin de la période en cours.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await subscriptionService.cancelSubscription();
      if (response.success) {
        alert('Abonnement annulé avec succès. Il restera actif jusqu\'à la fin de la période en cours.');
        setShowCancelModal(false);
        loadData(); // Recharger les données
      } else {
        alert(response.error || 'Erreur lors de l\'annulation');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l\'annulation');
    } finally {
      setCancelling(false);
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

  const isPremium = USE_MOCK_DATA ? false : user?.subscriptionType && user.subscriptionType !== 'FREE';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.backgroundLight,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
          Plans d'abonnement
        </h1>
      </div>

      <main style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto', ...getMainContentStyle(false) }}>
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
              onClick={loadData}
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

        {isPremium && currentSubscription && (
          <div
            style={{
              backgroundColor: `${colors.success}20`,
              border: `2px solid ${colors.success}`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '8px' }}>
                  Votre abonnement actuel
                </h2>
                <p style={{ fontSize: '14px', color: colors.textPrimary, margin: '4px 0' }}>
                  <strong>Type:</strong> {currentSubscription.type}
                </p>
                {currentSubscription.endDate && (
                  <p style={{ fontSize: '14px', color: colors.textPrimary, margin: '4px 0' }}>
                    <strong>Expire le:</strong> {new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.error,
                  color: colors.backgroundWhite,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Modal d'annulation */}
        {showCancelModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '16px',
            }}
            onClick={() => !cancelling && setShowCancelModal(false)}
          >
            <div
              style={{
                backgroundColor: colors.backgroundWhite,
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '400px',
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '16px' }}>
                Annuler l'abonnement
              </h2>
              <p style={{ fontSize: '14px', color: colors.textPrimary, marginBottom: '24px' }}>
                Votre abonnement restera actif jusqu'à la fin de la période en cours ({currentSubscription?.endDate ? new Date(currentSubscription.endDate).toLocaleDateString('fr-FR') : 'fin de période'}).
                Vous serez rétrogradé en membre gratuit après cette date.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: colors.error,
                    color: colors.backgroundWhite,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: cancelling ? 'not-allowed' : 'pointer',
                    opacity: cancelling ? 0.6 : 1,
                  }}
                >
                  {cancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: colors.backgroundLight,
                    color: colors.textPrimary,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: cancelling ? 'not-allowed' : 'pointer',
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginTop: '24px',
          }}
        >
          {plans.map((plan) => {
            const isRecommended = plan.id === 'monthly';
            const isYearly = plan.id === 'yearly';

            return (
              <div
                key={plan.id}
                style={{
                  border: `2px solid ${isRecommended ? colors.primary : colors.backgroundLight}`,
                  borderRadius: '16px',
                  padding: '24px',
                  backgroundColor: colors.backgroundWhite,
                  position: 'relative',
                  boxShadow: isRecommended ? `0 4px 12px ${colors.primary}40` : '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {isRecommended && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: colors.primary,
                      color: colors.backgroundWhite,
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    Recommandé
                  </div>
                )}

                {isYearly && plan.savings && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      backgroundColor: colors.success,
                      color: colors.backgroundWhite,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    Économisez {plan.savings}€
                  </div>
                )}

                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, marginTop: isRecommended ? '8px' : 0, marginBottom: '16px' }}>
                  {plan.name}
                </h2>

                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: colors.primary }}>{plan.price}€</span>
                  <span style={{ color: colors.textSecondary, marginLeft: '8px', fontSize: '16px' }}>
                    /{plan.period === 'week' ? 'semaine' : plan.period === 'month' ? 'mois' : 'an'}
                  </span>
                </div>

                <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
                  {plan.pricePerMonth.toFixed(2)}€ par mois
                </p>

                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: colors.success, fontSize: '18px', flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: '14px', color: colors.textPrimary, lineHeight: '1.5' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isPremium}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: isPremium ? colors.textSecondary : isRecommended ? colors.primary : colors.success,
                    color: colors.backgroundWhite,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: isPremium ? 'not-allowed' : 'pointer',
                    opacity: isPremium ? 0.6 : 1,
                  }}
                >
                  {isPremium
                    ? 'Déjà abonné'
                    : `S'abonner - ${plan.price}€/${plan.period === 'week' ? 'semaine' : plan.period === 'month' ? 'mois' : 'an'}`}
                </button>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: colors.backgroundWhite,
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '12px' }}>
            Plan gratuit
          </h3>
          <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '16px' }}>
            Le plan gratuit vous permet de :
          </p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
            {['Réserver 1 repas par semaine', 'Proposer 1 repas par semaine', 'Accéder aux fonctionnalités de base'].map(
              (feature, index) => (
                <li key={index} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: colors.success, fontSize: '16px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: colors.textPrimary }}>{feature}</span>
                </li>
              )
            )}
          </ul>
          <p style={{ marginTop: '16px', fontStyle: 'italic', color: colors.textSecondary, fontSize: '14px' }}>
            Passez à Premium pour débloquer plus de fonctionnalités !
          </p>
        </div>
      </main>
    </div>
  );
}
