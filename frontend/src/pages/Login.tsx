import { colors } from '../utils/theme';
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { LoginDto } from '../types/auth';
import { USE_MOCK_DATA } from '../data/mockData';
import { resetRedirectState } from '../services/api';
import { XIcon, InfoIcon } from '../components/Icons';

// Design System Colors

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [diagnosticLogs, setDiagnosticLogs] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // Charger les logs de diagnostic au montage et réinitialiser l'état de redirection
  useEffect(() => {
    resetRedirectState();
    const logs = JSON.parse(localStorage.getItem('diagnostic_logs') || '[]');
    if (logs.length > 0) {
      setDiagnosticLogs(logs);
      // Nettoyer les logs après affichage
      setTimeout(() => {
        localStorage.removeItem('diagnostic_logs');
      }, 10000);
    }
  }, []);

  // Afficher le message de succès si l'utilisateur vient de la page de vérification
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Effacer le message après 15 secondes (plus long pour être sûr qu'il soit lu)
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 15000);
      return () => clearTimeout(timer);
    }
    // Nettoyer l'état de navigation pour éviter de réafficher le message si on revient sur la page
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    // Ne pas effacer l'erreur immédiatement pour qu'elle reste visible
    // setError(null);

    try {
      if (USE_MOCK_DATA) {
        // En mode mock, simuler une connexion réussie
        localStorage.setItem('token', 'mock-token-' + Date.now());
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
        return;
      }

      const response = await authService.login(data as LoginDto);

      if (response.success) {
        // Si le téléphone n'est pas vérifié, rediriger vers la page de vérification
        const user = response.data?.user;
        if (user && user.emailVerified && !user.phoneVerified) {
          setTimeout(() => {
            navigate('/verify', { state: { userId: user.id, userEmail: user.email } });
          }, 500);
          return;
        }

        // Effacer les messages avant la redirection
        setError(null);
        setSuccessMessage(null);
        // Rediriger vers le dashboard
        navigate('/dashboard');
      } else {
        const errorMessage = response.error || 'Erreur lors de la connexion';
        setError(errorMessage);
        // Effacer le message de succès si on a une erreur
        setSuccessMessage(null);
        // Gestion centralisée de l'erreur PHONE_NOT_VERIFIED en réponse 200/403
        if (errorMessage === 'PHONE_NOT_VERIFIED') {
          setTimeout(() => {
            navigate('/verify', {
              state: {
                userId: response.data?.user?.id || localStorage.getItem('userId'),
                userEmail: response.data?.user?.email || data.email,
              },
            });
          }, 500);
          return;
        }
        // L'erreur reste visible - pas de timeout automatique
        // Scroll vers le haut pour voir l'erreur
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data || {};
      const serverError = data.error;

      // Gestion centralisée de l'erreur PHONE_NOT_VERIFIED
      if (status === 403 && serverError === 'PHONE_NOT_VERIFIED') {
        const user = data.data?.user || {};
        // On nettoie le token si le backend en a émis un mais que le téléphone n'est pas vérifié
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setTimeout(() => {
          navigate('/verify', {
            state: {
              userId: user.id || localStorage.getItem('userId'),
              userEmail: data.email || user.email,
            },
          });
        }, 500);
        return;
      }

      const errorMessage = err.response?.data?.error || 'Erreur lors de la connexion';
      setError(errorMessage);
      // Effacer le message de succès si on a une erreur
      setSuccessMessage(null);
      // L'erreur reste visible - pas de timeout automatique
      // Scroll vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mesh-gradient-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '40px 32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '20px',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img
              src="/logo.png"
              alt="SOLID'EAT"
              style={{
                height: '100px',
                width: 'auto',
                filter: 'drop-shadow(0px 4px 10px rgba(146, 67, 46, 0.25))',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  const span = document.createElement('span');
                  span.style.cssText = `font-size: 28px; font-weight: bold; color: ${colors.primary}`;
                  span.textContent = "SOLID'EAT";
                  parent.appendChild(span);
                }
              }}
            />
          </Link>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: colors.textPrimary,
              margin: '16px 0 8px 0',
            }}
          >
            Connexion
          </h1>
          <p style={{ fontSize: '14px', color: colors.textSecondary }}>
            Connectez-vous à votre compte
          </p>
        </div>

        {successMessage && (
          <div
            style={{
              backgroundColor: `${colors.success}20`,
              color: colors.success,
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ✅ {successMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: '#FEE',
              color: colors.error,
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              border: `2px solid ${colors.error}`,
              boxShadow: '0 2px 8px rgba(231, 76, 60, 0.2)',
            }}
          >
            <XIcon size={20} color={colors.error} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>
                Erreur de connexion
              </strong>
              <p style={{ margin: 0, lineHeight: '1.5' }}>{error}</p>
              {error.includes('pas encore vérifié') && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: `1px solid ${colors.error}40`,
                  }}
                >
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 500 }}>
                    Que faire ?
                  </p>
                  <ul
                    style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}
                  >
                    <li>Vérifiez votre boîte email et cliquez sur le lien de vérification</li>
                    <li>Vérifiez votre téléphone et entrez le code SMS reçu</li>
                    <li>
                      Si vous n&apos;avez pas reçu les codes, utilisez les boutons
                      &quot;Renvoyer&quot; sur la page de vérification
                    </li>
                  </ul>
                  <Link
                    to="/verify"
                    state={{ userEmail: getValues('email') }}
                    style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      padding: '8px 16px',
                      backgroundColor: colors.primary,
                      color: colors.backgroundWhite,
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Aller à la page de vérification →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {import.meta.env.DEV && diagnosticLogs.length > 0 && (
          <div
            style={{
              backgroundColor: '#FFF3CD',
              color: '#856404',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '12px',
              border: '1px solid #FFC107',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '8px' }}>
              🔍 Logs de diagnostic :
            </strong>
            <div style={{ maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace' }}>
              {diagnosticLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {new Date(log.timestamp).toLocaleTimeString()} - {log.message}
                  </div>
                  {log.data && (
                    <pre
                      style={{
                        margin: 0,
                        fontSize: '10px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}
                    >
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <InfoIcon size={14} color="#1976D2" style={{ flexShrink: 0 }} />
            <span>
              Mode développement : Utilisez n&apos;importe quel email/mot de passe pour vous
              connecter
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: colors.textPrimary,
              }}
            >
              Email *
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="votre@email.com"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${errors.email ? colors.error : colors.backgroundLight}`,
                fontSize: '16px',
                backgroundColor: colors.backgroundWhite,
                outline: 'none',
              }}
            />
            {errors.email && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Mot de passe *
              </label>
              <Link
                to="/auth/forgot-password"
                style={{
                  fontSize: '12px',
                  color: colors.primary,
                  textDecoration: 'none',
                }}
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 48px 12px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.password ? colors.error : colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: colors.backgroundWhite,
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.textSecondary,
                  outline: 'none',
                  lineHeight: 1,
                  height: '24px',
                  width: '24px',
                }}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      style={{ width: '20px', height: '20px', display: 'block' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      style={{ width: '20px', height: '20px', display: 'block' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </div>
              </button>
            </div>
            {errors.password && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? colors.textSecondary : colors.primary,
              color: colors.backgroundWhite,
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: colors.textSecondary }}>
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              style={{
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
