import { colors } from '../utils/theme';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { reservationService } from '../services/reservation.service';
import Navigation from '../components/Navigation';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';
import { ClockIcon, LockIcon } from '../components/Icons';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({ reservation }: { reservation: any }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [secretLoading, setSecretLoading] = useState(true);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const response = await reservationService.initiatePayment(reservation.id);
        if (response.success && response.data) {
          setClientSecret(response.data.clientSecret);
        } else {
          setError(response.error || "Erreur lors de l\'initialisation du paiement");
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Erreur lors de l\'initialisation du paiement");
      } finally {
        setSecretLoading(false);
      }
    };
    initPayment();
  }, [reservation.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-status?reservation=${reservation.id}`,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Une erreur est survenue lors du paiement');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      {secretLoading ? (
        <div style={{ textAlign: 'center', padding: '24px', color: colors.textSecondary }}>
          Chargement du formulaire de paiement...
        </div>
      ) : clientSecret ? (
        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: colors.backgroundWhite,
            marginBottom: '16px',
            minHeight: '120px',
          }}
        >
          <PaymentElement />
        </div>
      ) : null}

      {error && (
        <div
          style={{
            backgroundColor: '#FEE',
            color: colors.error,
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || !clientSecret || loading || secretLoading}
        style={{
          width: '100%',
          padding: '14px 24px',
          backgroundColor: colors.primary,
          color: colors.backgroundWhite,
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading || secretLoading ? 'not-allowed' : 'pointer',
          opacity: loading || !clientSecret || secretLoading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <LockIcon size={18} color={colors.backgroundWhite} />
        {loading ? 'Traitement...' : `Payer ${reservation.meal.price.toFixed(2).replace('.', ',')} €`}
      </button>

      <p
        style={{
          textAlign: 'center',
          color: colors.textSecondary,
          fontSize: '12px',
          marginTop: '12px',
        }}
      >
        🔒 Paiement sécurisé par Stripe
      </p>
    </form>
  );
}

export default function PaymentPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadReservation = async () => {
      if (!reservationId) {
        setError('ID de réservation manquant');
        setLoading(false);
        return;
      }

      try {
        const [resResponse, payResponse] = await Promise.all([
          reservationService.getMyReservations(),
          reservationService.initiatePayment(reservationId),
        ]);

        if (resResponse.success && resResponse.data) {
          const found = resResponse.data.find((r) => r.id === reservationId);
          if (found) {
            setReservation(found);
            if (found.paymentStatus === 'PAID' || found.paymentStatus === 'PAYOUT_DONE') {
              setPaid(true);
            }
          } else {
            setError('Réservation non trouvée');
          }
        } else {
          setError(resResponse.error || 'Erreur lors du chargement');
        }

        if (payResponse.success && payResponse.data) {
          setClientSecret(payResponse.data.clientSecret);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [reservationId]);

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
        <div style={{ textAlign: 'center', color: colors.primary }}>
          <ClockIcon size={48} color={colors.primary} />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.backgroundLight,
          padding: '20px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Navigation showBottomBar={true} />
        <main style={{ ...getMainContentStyle(false), padding: '16px' }}>
          <div
            style={{
              backgroundColor: '#FEE',
              color: colors.error,
              padding: '16px',
              borderRadius: '8px',
            }}
          >
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!reservation) return null;

  const elementsOptions: StripeElementsOptions = {
    clientSecret: clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: colors.primary,
      },
    },
  };

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
          padding: '16px',
          maxWidth: '600px',
          margin: '0 auto',
          ...getMainContentStyle(false),
        }}
      >
        <div
          style={{
            backgroundColor: colors.backgroundWhite,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 'bold',
              color: colors.textPrimary,
              margin: '0 0 8px 0',
            }}
          >
            Paiement Premium
          </h1>
          <p style={{ color: colors.textSecondary, marginBottom: '24px', fontSize: '14px' }}>
            Réservation du repas <strong>{reservation.meal.name}</strong> proposé par{' '}
            <strong>{reservation.meal.cook.username}</strong>
          </p>

          {paid ? (
            <div
              style={{
                backgroundColor: '#EFE',
                color: colors.success,
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0' }}>✅ Paiement déjà effectué</h3>
              <p style={{ margin: 0 }}>Votre réservation est confirmée.</p>
              <button
                onClick={() => navigate('/reservations')}
                style={{
                  marginTop: '16px',
                  padding: '10px 20px',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Voir mes réservations
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  backgroundColor: colors.backgroundLight,
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '24px',
                }}
              >
                <p style={{ color: colors.textSecondary, margin: '0 0 4px 0', fontSize: '14px' }}>
                  Montant total
                </p>
                <p
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: colors.primary,
                    margin: 0,
                  }}
                >
                  {reservation.meal.price.toFixed(2).replace('.', ',')} €
                </p>
              </div>

              {clientSecret ? (
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <PaymentForm reservation={reservation} />
                </Elements>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: colors.textSecondary }}>
                  Chargement de Stripe...
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
