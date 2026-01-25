import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { LoginDto } from '../types/auth';
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
        // L'erreur reste visible - pas de timeout automatique
        // Scroll vers le haut pour voir l'erreur
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
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
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
            <img
              src="/logo.png"
              alt="SOLID'EAT"
              style={{
                height: '48px',
                width: 'auto',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  const span = document.createElement('span');
                  span.style.cssText = `font-size: 24px; font-weight: bold; color: ${colors.primary}`;
                  span.textContent = "SOLID'EAT";
                  parent.appendChild(span);
                }
              }}
            />
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, margin: '16px 0 8px 0' }}>
            Connexion
          </h1>
          <p style={{ fontSize: '14px', color: colors.textSecondary }}>Connectez-vous à votre compte</p>
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
            <span style={{ fontSize: '20px', flexShrink: 0 }}>❌</span>
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>Erreur de connexion</strong>
              <p style={{ margin: 0, lineHeight: '1.5' }}>{error}</p>
              {error.includes('pas encore vérifié') && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${colors.error}40` }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 500 }}>Que faire ?</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                    <li>Vérifiez votre boîte email et cliquez sur le lien de vérification</li>
                    <li>Vérifiez votre téléphone et entrez le code SMS reçu</li>
                    <li>Si vous n'avez pas reçu les codes, utilisez les boutons "Renvoyer" sur la page de vérification</li>
                  </ul>
                  <Link
                    to="/verify"
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
            💡 Mode développement : Utilisez n'importe quel email/mot de passe pour vous connecter
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
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
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.email.message}</p>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${errors.password ? colors.error : colors.backgroundLight}`,
                fontSize: '16px',
                backgroundColor: colors.backgroundWhite,
                outline: 'none',
              }}
            />
            {errors.password && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.password.message}</p>
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
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
