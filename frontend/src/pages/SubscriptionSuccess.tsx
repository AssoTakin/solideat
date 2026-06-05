import { colors } from '../utils/theme';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { subscriptionService } from '../services/subscription.service';
import Navigation from '../components/Navigation';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';

// Design System Colors


export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const mockPlan = searchParams.get('mockPlan');

  useEffect(() => {
    const confirmSubscription = async () => {
      try {
        if (mockPlan) {
          // Mode Mock : créer l'abonnement simulé
          await subscriptionService.createSubscription({ planId: mockPlan });
        }
        // Attendre un court instant pour s'assurer que le webhook a été traité en mode réel
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (err: any) {
        setError("Erreur lors de la confirmation de votre abonnement.");
        setLoading(false);
      }
    };

    confirmSubscription();
  }, [sessionId, mockPlan]);

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

      <main
        style={{
          padding: '32px 16px',
          maxWidth: '500px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 150px)',
          ...getMainContentStyle(false),
        }}
      >
        <div
          style={{
            backgroundColor: colors.backgroundWhite,
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            width: '100%',
          }}
        >
          {loading ? (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>⏳</div>
              <h2 style={{ fontSize: '20px', color: colors.textPrimary, fontWeight: 'bold' }}>
                Confirmation de votre abonnement...
              </h2>
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginTop: '8px' }}>
                Nous finalisons votre activation Premium.
              </p>
            </div>
          ) : error ? (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h2 style={{ fontSize: '20px', color: colors.textPrimary, fontWeight: 'bold' }}>
                Une erreur est survenue
              </h2>
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginTop: '8px', marginBottom: '24px' }}>
                {error}
              </p>
              <Link
                to="/subscriptions/plans"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                Retour aux abonnements
              </Link>
            </div>
          ) : (
            <div>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: `${colors.success}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px auto',
                }}
              >
                <span style={{ fontSize: '40px', color: colors.success }}>✓</span>
              </div>
              
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '12px' }}>
                Félicitations !
              </h1>
              
              <p style={{ fontSize: '16px', color: colors.textPrimary, fontWeight: 500, marginBottom: '8px' }}>
                Votre abonnement **Premium** est activé ! 🎉
              </p>

              <div
                style={{
                  backgroundColor: `${colors.success}10`,
                  border: `1px dashed ${colors.success}`,
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  color: colors.textPrimary,
                  lineHeight: '1.5',
                }}
              >
                🎁 **Offre de Lancement appliquée** :  
                Votre abonnement est à **0 € pour les 3 prochains mois**.  
                Il s'arrêtera automatiquement à la fin de cette période (sans prélèvement).
              </div>

              <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '32px' }}>
                Vous bénéficiez maintenant de toutes les fonctionnalités premium : quotas étendus, filtres avancés, anonymisation et rubrique SOS prioritaire !
              </p>

              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Accéder à mon tableau de bord
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
