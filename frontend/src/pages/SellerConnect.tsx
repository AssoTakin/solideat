import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navigation from '../components/Navigation';
import { colors } from '../utils/theme';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  ArrowLeftIcon,
  StoreIcon,
  GiftIcon,
} from '../components/Icons';

interface ConnectStatus {
  accountId: string | null;
  onboardingComplete: boolean;
}

interface SellerConnectProps {
  __forceStatus?: ConnectStatus | null;
}

export default function SellerConnect({ __forceStatus }: SellerConnectProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConnectStatus | null>(__forceStatus ?? null);
  const [loading, setLoading] = useState(!__forceStatus);
  const [error, setError] = useState<string | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const urlStatus = searchParams.get('status');
  const isRefresh = urlStatus === 'refresh';
  const isSuccess = urlStatus === 'success';

  useEffect(() => {
    if (__forceStatus) return;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadStatus();
  }, [navigate, __forceStatus]);

  // Au retour de Stripe (?status=success), forcer une resync avec un délai
  // car Stripe peut mettre quelques secondes à propager le statut active.
  useEffect(() => {
    if (!isSuccess || __forceStatus) return;

    let attempts = 0;
    const maxAttempts = 6;
    const interval = setInterval(() => {
      attempts += 1;
      loadStatus();
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isSuccess, __forceStatus]);

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
  const accountCreated = !!status?.accountId;
  const step = completed ? 'active' : accountCreated ? 'pending' : 'not_started';

  const statusConfig = {
    not_started: {
      icon: <AlertCircleIcon size={24} color={colors.warning} />,
      title: 'Compte vendeur non configuré',
      message: 'Active Stripe Connect pour pouvoir vendre tes repas à 5€.',
      color: colors.warning,
    },
    pending: {
      icon: <AlertCircleIcon size={24} color={colors.warning} />,
      title: 'Onboarding en cours',
      message: 'Ton compte Stripe est créé. Finalise les informations demandées par Stripe pour activer les reversements.',
      color: colors.warning,
    },
    active: {
      icon: <CheckCircleIcon size={24} color={colors.success} />,
      title: 'Compte Stripe Connect activé',
      message: 'Tu peux vendre tes repas. Les reversements se feront automatiquement sur ton compte bancaire une fois les paiements effectués.',
      color: colors.success,
    },
  };

  const currentStatus = statusConfig[step];

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

          <div
            style={{
              backgroundColor: currentStatus.color + '15',
              color: currentStatus.color,
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {currentStatus.icon}
            <div>
              <strong style={{ display: 'block', marginBottom: '4px', fontSize: '16px' }}>
                {currentStatus.title}
              </strong>
              <span style={{ fontSize: '14px', lineHeight: 1.5 }}>{currentStatus.message}</span>
            </div>
          </div>

          {step !== 'active' && (
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
                  margin: '0 0 12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.textPrimary,
                }}
              >
                Ce que tu peux faire en attendant
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
                <li>Proposer des repas gratuits pour tester la plateforme (aucun Stripe Connect requis).</li>
                <li>
                  Vendre tes repas premium à 5€ dès maintenant : les acheteurs paient normalement. Les reversements vers ton
                  compte bancaire commencent dès que Stripe valide ton KYC.
                </li>
                <li>
                  Les reversements sont automatiques une fois ton KYC Stripe finalisé. Si ton compte n'est pas activé au moment de la vente, le paiement reste sécurisé chez Stripe et le transfert vers ton compte est effectué dès la validation.
                </li>
              </ul>
            </div>
          )}

          {step === 'active' && (
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
                  margin: '0 0 12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.textPrimary,
                }}
              >
                Récapitulatif vendeur
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
                <li>Prix de vente fixé à 5€ par repas premium.</li>
                <li>Tu perçois environ 3,67€ par repas vendu (5€ - 1€ de service Solideat - frais Stripe).</li>
                <li>Les reversements sont automatiques sur le compte bancaire rattaché à Stripe Connect.</li>
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
            {step !== 'active' && (
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
                {actionLoading
                  ? 'Chargement...'
                  : accountCreated
                    ? 'Continuer l\'onboarding Stripe'
                    : 'Devenir vendeur sur Stripe'}
              </button>
            )}

            {step === 'active' && (
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

            {step !== 'active' && (
              <Link
                to="/meals/new"
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <GiftIcon size={18} color={colors.primary} />
                Proposer un repas gratuit
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
