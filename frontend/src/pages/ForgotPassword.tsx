import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';

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

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authService.forgotPassword(data.email);

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || 'Erreur lors de l\'envoi');
      }
    } catch (err: any) {
      // Même en cas d'erreur, on affiche le succès pour la sécurité
      setSuccess(true);
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
            Mot de passe oublié
          </h1>
          <p style={{ fontSize: '14px', color: colors.textSecondary }}>
            {success
              ? 'Un lien de réinitialisation a été envoyé à votre adresse email.'
              : 'Entrez votre adresse email pour recevoir un lien de réinitialisation.'}
          </p>
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

        {success ? (
          <div>
            <div
              style={{
                backgroundColor: '#E8F5E9',
                color: colors.success,
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              ✅ Si cet email existe, un lien de réinitialisation a été envoyé. Vérifiez votre boîte de réception.
            </div>
            <button
              onClick={() => navigate('/login')}
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
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '24px' }}>
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
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: colors.textSecondary }}>
            <Link
              to="/login"
              style={{
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
