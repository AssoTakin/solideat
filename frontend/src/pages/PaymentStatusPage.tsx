import { colors } from '../utils/theme';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';
import { ClockIcon } from '../components/Icons';

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'success' | 'cancel' | 'processing' | 'error'>('processing');
  const [message, setMessage] = useState('Vérification du paiement...');

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status');

    if (!paymentIntent || !paymentIntentClientSecret) {
      setStatus('cancel');
      setMessage('Paiement annulé ou interrompu.');
      return;
    }

    if (redirectStatus === 'succeeded') {
      setStatus('success');
      setMessage('✅ Paiement confirmé avec succès !');
    } else if (redirectStatus === 'processing') {
      setStatus('processing');
      setMessage('⏳ Paiement en cours de traitement...');
    } else {
      setStatus('error');
      setMessage(`❌ Le paiement a échoué (${redirectStatus || 'inconnu'}).`);
    }

    // Redirect to reservations after 3 seconds
    const timer = setTimeout(() => {
      navigate('/reservations');
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <div
          style={{
            backgroundColor: colors.backgroundWhite,
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {status === 'processing' && <ClockIcon size={48} color={colors.primary} />}
          <h2 style={{ color: colors.textPrimary, margin: '16px 0 8px 0' }}>
            Statut du paiement
          </h2>
          <p style={{ color: colors.textSecondary, fontSize: '16px', margin: 0 }}>
            {message}
          </p>
          <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '24px' }}>
            Redirection vers vos réservations...
          </p>
        </div>
      </main>
    </div>
  );
}
