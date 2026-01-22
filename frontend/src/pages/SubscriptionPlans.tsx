import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService, SubscriptionPlan } from '../services/subscription.service';
import api from '../services/api';

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
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

  if (loading) {
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={loadData}>Réessayer</button>
      </div>
    );
  }

  const isPremium = user?.subscriptionType && user.subscriptionType !== 'FREE';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Plans d'abonnement</h1>

      {isPremium && currentSubscription && (
        <div
          style={{
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
          }}
        >
          <h2>Votre abonnement actuel</h2>
          <p>
            <strong>Type:</strong> {currentSubscription.type}
          </p>
          {currentSubscription.endDate && (
            <p>
              <strong>Expire le:</strong> {new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {plans.map((plan) => {
          const isRecommended = plan.id === 'monthly';
          const isYearly = plan.id === 'yearly';

          return (
            <div
              key={plan.id}
              style={{
                border: `2px solid ${isRecommended ? '#007bff' : '#ddd'}`,
                borderRadius: '12px',
                padding: '2rem',
                backgroundColor: '#fff',
                position: 'relative',
                boxShadow: isRecommended ? '0 4px 12px rgba(0,123,255,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {isRecommended && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '4px 16px',
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
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  Économisez {plan.savings}€
                </div>
              )}

              <h2 style={{ marginTop: isRecommended ? '1rem' : 0 }}>{plan.name}</h2>

              <div style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{plan.price}€</span>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                  /{plan.period === 'week' ? 'semaine' : plan.period === 'month' ? 'mois' : 'an'}
                </span>
              </div>

              <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '14px' }}>
                {plan.pricePerMonth.toFixed(2)}€ par mois
              </p>

              <ul style={{ listStyle: 'none', padding: 0, marginTop: '2rem' }}>
                {plan.features.map((feature, index) => (
                  <li key={index} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ color: '#28a745', marginRight: '0.5rem', fontSize: '18px' }}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isPremium}
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginTop: '2rem',
                  backgroundColor: isRecommended ? '#007bff' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isPremium ? 'not-allowed' : 'pointer',
                  opacity: isPremium ? 0.6 : 1,
                }}
              >
                {isPremium ? 'Déjà abonné' : `S'abonner - ${plan.price}€/${plan.period === 'week' ? 'semaine' : plan.period === 'month' ? 'mois' : 'an'}`}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Plan gratuit</h3>
        <p>Le plan gratuit vous permet de :</p>
        <ul>
          <li>Réserver 1 repas par semaine</li>
          <li>Proposer 1 repas par semaine</li>
          <li>Accéder aux fonctionnalités de base</li>
        </ul>
        <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#666' }}>
          Passez à Premium pour débloquer plus de fonctionnalités !
        </p>
      </div>
    </div>
  );
}
