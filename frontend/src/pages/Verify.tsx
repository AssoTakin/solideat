import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { USE_MOCK_DATA } from '../data/mockData';

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

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [userId] = useState<string | null>(location.state?.userId || null);
  const [emailToken] = useState<string | null>(searchParams.get('token') || null);
  const [phoneCode, setPhoneCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  useEffect(() => {
    // Si un token email est présent dans l'URL, vérifier automatiquement
    if (emailToken) {
      verifyEmail();
    }
  }, [emailToken]);

  const verifyEmail = async () => {
    if (!emailToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authService.verifyEmail(emailToken);
      if (response.success) {
        setEmailVerified(true);
      } else {
        setError(response.error || 'Erreur lors de la vérification email');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la vérification email');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async () => {
    if (!userId || !phoneCode) {
      setError('Code de vérification requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // En mode mock, accepter n'importe quel code
        setPhoneVerified(true);
        if (emailVerified) {
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
        setLoading(false);
        return;
      }

      const response = await authService.verifyPhone(userId, phoneCode);
      if (response.success) {
        setPhoneVerified(true);
        // Si les deux sont vérifiés, rediriger vers le dashboard
        if (emailVerified) {
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        setError(response.error || 'Code invalide ou expiré');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la vérification téléphone');
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    // Nécessite l'email, on ne peut pas le faire ici sans le récupérer
    setError('Fonctionnalité à implémenter');
  };

  const resendSMS = async () => {
    if (!userId) {
      setError('userId requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.resendVerificationSMS(userId);
      if (response.success) {
        alert(`SMS renvoyé${response.code ? ` (Code: ${response.code})` : ''}`);
      } else {
        setError(response.error || 'Erreur lors de l\'envoi du SMS');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi du SMS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.backgroundLight,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: colors.backgroundWhite,
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '24px' }}>
          Vérification du compte
        </h1>

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

        {USE_MOCK_DATA && (
          <div
            style={{
              backgroundColor: '#E3F2FD',
              color: '#1976D2',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '12px',
            }}
          >
            💡 Mode développement : La vérification est automatique, utilisez n'importe quel code
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '12px' }}>
            Vérification email
          </h2>
          {emailVerified ? (
            <div
              style={{
                backgroundColor: `${colors.success}20`,
                color: colors.success,
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
              }}
            >
              ✅ Email vérifié
            </div>
          ) : emailToken ? (
            <div>
              <p style={{ fontSize: '14px', color: colors.textSecondary }}>Vérification en cours...</p>
              {loading && <p style={{ fontSize: '14px', color: colors.textSecondary }}>Chargement...</p>}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '12px' }}>
                Vérifiez votre email en cliquant sur le lien reçu.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={verifyEmail}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: colors.primary,
                    color: colors.backgroundWhite,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Vérifier maintenant
                </button>
                <button
                  onClick={resendEmail}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: colors.backgroundLight,
                    color: colors.textPrimary,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Renvoyer l'email
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '12px' }}>
            Vérification téléphone
          </h2>
          {phoneVerified ? (
            <div
              style={{
                backgroundColor: `${colors.success}20`,
                color: colors.success,
                padding: '12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
              }}
            >
              ✅ Téléphone vérifié
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '12px' }}>
                Entrez le code reçu par SMS :
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '20px',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    width: '150px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={verifyPhone}
                  disabled={loading || !phoneCode || phoneCode.length !== 6}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: phoneCode.length === 6 ? colors.primary : colors.textSecondary,
                    color: colors.backgroundWhite,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: loading || !phoneCode || phoneCode.length !== 6 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Vérifier
                </button>
              </div>
              <button
                onClick={resendSMS}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.backgroundLight,
                  color: colors.textPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                Renvoyer le SMS
              </button>
            </div>
          )}
        </div>

        {emailVerified && phoneVerified && (
          <div
            style={{
              backgroundColor: `${colors.success}20`,
              color: colors.success,
              padding: '16px',
              borderRadius: '8px',
              marginTop: '24px',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            ✅ Votre compte est maintenant vérifié ! Redirection vers la connexion...
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              color: colors.primary,
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
