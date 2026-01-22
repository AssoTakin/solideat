import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth.service';

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState<string | null>(location.state?.userId || null);
  const [emailToken, setEmailToken] = useState<string | null>(searchParams.get('token') || null);
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
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Vérification du compte</h1>

      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h2>Vérification email</h2>
        {emailVerified ? (
          <div style={{ background: '#efe', color: '#0a0', padding: '1rem', borderRadius: '4px' }}>
            ✅ Email vérifié
          </div>
        ) : emailToken ? (
          <div>
            <p>Vérification en cours...</p>
            {loading && <p>Chargement...</p>}
          </div>
        ) : (
          <div>
            <p>Vérifiez votre email en cliquant sur le lien reçu.</p>
            <button onClick={verifyEmail} disabled={loading}>
              Vérifier maintenant
            </button>
            <button onClick={resendEmail} style={{ marginLeft: '1rem' }}>
              Renvoyer l'email
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Vérification téléphone</h2>
        {phoneVerified ? (
          <div style={{ background: '#efe', color: '#0a0', padding: '1rem', borderRadius: '4px' }}>
            ✅ Téléphone vérifié
          </div>
        ) : (
          <div>
            <p>Entrez le code reçu par SMS :</p>
            <input
              type="text"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              placeholder="Code à 6 chiffres"
              maxLength={6}
              style={{ padding: '0.5rem', marginRight: '0.5rem' }}
            />
            <button onClick={verifyPhone} disabled={loading || !phoneCode}>
              Vérifier
            </button>
            <button onClick={resendSMS} disabled={loading} style={{ marginLeft: '1rem' }}>
              Renvoyer le SMS
            </button>
          </div>
        )}
      </div>

      {emailVerified && phoneVerified && (
        <div style={{ background: '#efe', color: '#0a0', padding: '1rem', borderRadius: '4px', marginTop: '2rem' }}>
          <p>✅ Votre compte est maintenant vérifié ! Redirection vers la connexion...</p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <a href="/login">Retour à la connexion</a>
      </div>
    </div>
  );
}
