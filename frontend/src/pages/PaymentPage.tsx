import { colors } from '../utils/theme';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { reservationService } from '../services/reservation.service';
import Navigation from '../components/Navigation';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';
import { ClockIcon, LockIcon } from '../components/Icons';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function loadStripeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-stripe-script]')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.setAttribute('data-stripe-script', 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Stripe.js'));
    document.head.appendChild(script);
  });
}

const inputLabelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 'bold',
  color: colors.textPrimary,
  marginBottom: '6px',
};

const stripeInputContainerStyle = {
  border: '2px solid #e0e0e0',
  borderRadius: '8px',
  padding: '12px',
  backgroundColor: colors.backgroundWhite,
};

function PaymentForm({ reservation, clientSecret, onSuccess }: { reservation: any; clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        '::placeholder': { color: '#aab7c4' },
        lineHeight: '24px',
      },
      invalid: { color: '#fa755a' },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    setError(null);

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      setError('Formulaire de carte non initialisé');
      setLoading(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumber,
        billing_details: {
          name: `${reservation.user?.firstName || 'Solideat'} ${reservation.user?.lastName || 'User'}`,
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Une erreur est survenue lors du paiement');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      setError("Le paiement n\'a pas pu être confirmé. Statut: " + (paymentIntent?.status || 'inconnu'));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={inputLabelStyle}>Numéro de carte</label>
        <div style={stripeInputContainerStyle}>
          <CardNumberElement options={elementOptions} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={inputLabelStyle}>Date d\'expiration</label>
          <div style={stripeInputContainerStyle}>
            <CardExpiryElement options={elementOptions} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={inputLabelStyle}>CVC</label>
          <div style={stripeInputContainerStyle}>
            <CardCvcElement options={elementOptions} />
          </div>
        </div>
      </div>

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
        disabled={!stripe || !elements || !clientSecret || loading}
        style={{
          width: '100%',
          padding: '14px 24px',
          backgroundColor: colors.primary,
          color: colors.backgroundWhite,
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading || !clientSecret ? 0.7 : 1,
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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    const initStripe = async () => {
      try {
        await loadStripeScript();
        const s = await stripePromise;
        setStripe(s);
        if (!s) {
          setError('Impossible de charger Stripe. Vérifiez votre connexion ou contactez le support.');
        }
      } catch (e: any) {
        setError('Erreur chargement Stripe: ' + e.message);
        setLoading(false);
      }
    };
    initStripe();

    const loadReservation = async () => {
      if (!reservationId) {
        setError('ID de réservation manquant');
        setLoading(false);
        return;
      }

      try {
        const response = await reservationService.getMyReservations();
        if (response.success && response.data) {
          const found = response.data.find((r) => r.id === reservationId);
          if (found) {
            setReservation(found);
            if (found.paymentStatus === 'PAID' || found.paymentStatus === 'PAYOUT_DONE') {
              setPaid(true);
            }
          } else {
            setError('Réservation non trouvée');
          }
        } else {
          setError(response.error || 'Erreur lors du chargement');
        }

        const payResponse = await reservationService.initiatePayment(reservationId);
        if (payResponse.success && payResponse.data) {
          setClientSecret(payResponse.data.clientSecret);
        } else {
          setError((prev) => prev || payResponse.error || 'Erreur lors de l\'initialisation du paiement');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [reservationId]);

  if (loading || (!stripe && !error)) {
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

  if (!reservation || !stripe) return null;

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
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    reservation={reservation}
                    clientSecret={clientSecret}
                    onSuccess={() => {
                      setPaid(true);
                      setTimeout(() => navigate('/reservations'), 2000);
                    }}
                  />
                </Elements>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: colors.textSecondary }}>
                  Chargement du paiement...
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
