import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(8, 'La confirmation est requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token manquant. Veuillez utiliser le lien reçu par email.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token manquant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword(token, data.password);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.error || 'Erreur lors de la réinitialisation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: '#E8F5E9',
              color: colors.success,
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
            }}
          >
            ✅ Mot de passe réinitialisé avec succès ! Redirection vers la connexion...
          </div>
          <Link
            to="/login"
            style={{
              color: colors.primary,
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Se connecter maintenant
          </Link>
        </div>
      </div>
    );
  }

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
            Réinitialiser le mot de passe
          </h1>
          <p style={{ fontSize: '14px', color: colors.textSecondary }}>Entrez votre nouveau mot de passe</p>
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
              Nouveau mot de passe *
            </label>
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${errors.confirmPassword ? colors.error : colors.backgroundLight}`,
                fontSize: '16px',
                backgroundColor: colors.backgroundWhite,
                outline: 'none',
              }}
            />
            {errors.confirmPassword && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading || !token ? colors.textSecondary : colors.primary,
              color: colors.backgroundWhite,
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading || !token ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>

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
