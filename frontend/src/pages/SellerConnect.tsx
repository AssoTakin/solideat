import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navigation from '../components/Navigation';
import { colors } from '../utils/theme';
import { CheckCircleIcon, AlertCircleIcon, ExternalLinkIcon, ArrowLeftIcon, StoreIcon } from '../components/Icons';

interface ConnectStatus {
  accountId: string | null;
  onboardingComplete: boolean;
}

export default function SellerConnect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const urlStatus = searchParams.get('status');
  const isRefresh = urlStatus === 'refresh';
  const isSuccess = urlStatus === 'success';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadStatus();
  }, [navigate]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me/connect-status');
      if (res.data.success) {
        setStatus(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Impossible de récupérer le statut Stripe Connect.');
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await api.post('/users/me/connect-account');
      if (res.data.success && res.data.data?.url) {
        setOnboardingUrl(res.data.data.url);
        // Ouvrir dans un nouvel onglet
        window.open(res.data.data.url, '_blank');
      } else {
        setError('Lien d\'onboarding non reçu.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du lancement de l\'onboarding Stripe.');
    } finally {
      setActionLoading(false);
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
        <p style={{ color: colors.textPrimary }}>Chargement...</p>
      </div>
    );
  }

  const completed = status?.onboardingComplete || false;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.backgroundLight,
        fontFamily: 'Inter, sans-serif',
        paddingBottom: '100px',
      }}
    >
      <Navigation showBottomBar={true} />

      <main
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '24px 16px',
        }}
      >
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textSecondary,
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          <ArrowLeftIcon size={16} color={colors.textSecondary} />
          Retour au tableau de bord
        </Link>

        <div
          style={{
            backgroundColor: colors.backgroundWhite,
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: colors.primary + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StoreIcon size={24} color={colors.primary} />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 700,
                  color: colors.textPrimary,
                }}
              >
                Devenir vendeur
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: colors.textSecondary }}>
                Configure ton compte Stripe Connect pour vendre tes repas.
              </p>
            </div>
          </div>

          {isRefresh && (
            <div
              style={{
                backgroundColor: colors.warning + '15',
                color: colors.warning,
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircleIcon size={18} color={colors.warning} />
              La session d'onboarding a expiré. Tu peux la relancer ci-dessous.
            </div>
          )}

          {isSuccess && !completed && (
            <div
              style={{
                backgroundColor: colors.warning + '15',
                color: colors.warning,
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircleIcon size={18} color={colors.warning} />
              Retour de Stripe reçu. Le statut est en cours de synchronisation.
            </div>
          )}

          {completed ? (
            <div
              style={{
                backgroundColor: colors.success + '15',
                color: colors.success,
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <CheckCircleIcon size={24} color={colors.success} />
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>
                  Compte Stripe Connect activé
                </strong>
                <span style={{ fontSize: '14px' }}>
                  Tu peux maintenant proposer des repas payants. Les reversements se feront automatiquement sur ton compte.
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: colors.backgroundLight,
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  margin: '0 0 8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.textPrimary,
                }}
              >
                Pourquoi Stripe Connect ?
              </h2>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '14px',
                  color: colors.textSecondary,
                  lineHeight: 1.6,
                }}
              >
                <li>Vends tes repas premium à 5€</li>
                <li>Reçois automatiquement 4€ par repas vendu</li>
                <li>Paiement sécurisé et conforme</li>
              </ul>
            </div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: colors.error + '15',
                color: colors.error,
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!completed && (
              <button
                onClick={startOnboarding}
                disabled={actionLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <ExternalLinkIcon size={18} color={colors.backgroundWhite} />
                {actionLoading ? 'Chargement...' : status?.accountId ? 'Continuer l\'onboarding Stripe' : 'Devenir vendeur sur Stripe'}
              </button>
            )}

            {completed && (
              <Link
                to="/meals/new"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                Proposer un repas payant
              </Link>
            )}

            {onboardingUrl && !completed && (
              <a
                href={onboardingUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: `2px solid ${colors.primary}`,
                  color: colors.primary,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                Ouvrir le lien Stripe
              </a>
            )}
          </div>

          <p
            style={{
              marginTop: '16px',
              fontSize: '12px',
              color: colors.textSecondary,
              textAlign: 'center',
            }}
          >
            Stripe est un prestataire de paiement sécurisé. Aucune donnée bancaire n'est stockée sur nos serveurs.
          </p>
        </div>
      </main>
    </div>
  );
}
