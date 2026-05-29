import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { RegisterDto } from '../types/auth';
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

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  phone: z.string().regex(/^\+33[1-9]\d{8}$/, 'Numéro de téléphone invalide (format: +33XXXXXXXXX)'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  username: z.string().min(3, 'Le pseudo doit contenir au moins 3 caractères').max(20, 'Le pseudo ne peut pas dépasser 20 caractères'),
  addressStreet: z.string().min(1, 'L\'adresse est requise'),
  addressZipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  addressCity: z.string().min(1, 'La ville est requise'),
  cguAccepted: z.boolean().refine((val) => val === true, 'Vous devez accepter les CGU'),
  sanitaryCharterAccepted: z.boolean().refine((val) => val === true, 'Vous devez accepter la charte sanitaire'),
  description: z.string().optional(),
  culinaryStyle: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [phoneCode, setPhoneCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // En mode mock, simuler une inscription réussie
        setTimeout(() => {
          setSuccess(true);
          setUserId('mock-user-' + Date.now());
          setPhoneCode('123456');
        }, 500);
        setLoading(false);
        return;
      }

      const response = await authService.register(data as RegisterDto);

      if (response.success && response.data) {
        setSuccess(true);
        setUserId(response.data.user.id);
        setUserEmail(response.data.user.email);
        if (response.data.phoneCode) {
          setPhoneCode(response.data.phoneCode);
        }
      } else {
        setError(response.error || 'Erreur lors de l\'inscription');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success && userId) {
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
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '16px' }}>
            Inscription réussie !
          </h1>
          <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '24px' }}>
            Veuillez vérifier votre email et votre téléphone pour activer votre compte.
          </p>
          {phoneCode && (
            <div
              style={{
                backgroundColor: colors.backgroundLight,
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '8px' }}>
                Code de vérification téléphone (développement)
              </p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary, fontFamily: 'monospace' }}>
                {phoneCode}
              </p>
            </div>
          )}
          <button
            onClick={() => navigate('/verify', { state: { userId, userEmail } })}
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
            Vérifier mon compte
          </button>
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
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: colors.backgroundWhite,
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
            <img
              src="/logo.png"
              alt="SOLID'EAT"
              style={{
                height: '80px',
                width: 'auto',
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, margin: '16px 0 8px 0' }}>
            Inscription
          </h1>
          <p style={{ fontSize: '14px', color: colors.textSecondary }}>Rejoignez la communauté SOLID'EAT</p>
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
            💡 Mode développement : L'inscription sera simulée, vous pourrez vous connecter immédiatement
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Prénom *
              </label>
              <input
                type="text"
                {...register('firstName')}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.firstName ? colors.error : colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: colors.backgroundWhite,
                  outline: 'none',
                }}
              />
              {errors.firstName && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Nom *
              </label>
              <input
                type="text"
                {...register('lastName')}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.lastName ? colors.error : colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: colors.backgroundWhite,
                  outline: 'none',
                }}
              />
              {errors.lastName && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
              Mot de passe * (min 8 caractères)
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

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
              Téléphone * (format: +33XXXXXXXXX)
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="+33123456789"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${errors.phone ? colors.error : colors.backgroundLight}`,
                fontSize: '16px',
                backgroundColor: colors.backgroundWhite,
                outline: 'none',
              }}
            />
            {errors.phone && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
              Pseudo * (3-20 caractères)
            </label>
            <input
              type="text"
              {...register('username')}
              placeholder="Votre pseudo"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${errors.username ? colors.error : colors.backgroundLight}`,
                fontSize: '16px',
                backgroundColor: colors.backgroundWhite,
                outline: 'none',
              }}
            />
            {errors.username && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.username.message}</p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
              Rue *
            </label>
            <input
              type="text"
              {...register('addressStreet')}
              placeholder="123 Rue de la Paix"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${errors.addressStreet ? colors.error : colors.backgroundLight}`,
                fontSize: '16px',
                backgroundColor: colors.backgroundWhite,
                outline: 'none',
              }}
            />
            {errors.addressStreet && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.addressStreet.message}</p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Code postal *
              </label>
              <input
                type="text"
                {...register('addressZipCode')}
                placeholder="75001"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.addressZipCode ? colors.error : colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: colors.backgroundWhite,
                  outline: 'none',
                }}
              />
              {errors.addressZipCode && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.addressZipCode.message}</p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Ville *
              </label>
              <input
                type="text"
                {...register('addressCity')}
                placeholder="Paris"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.addressCity ? colors.error : colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: colors.backgroundWhite,
                  outline: 'none',
                }}
              />
              {errors.addressCity && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.addressCity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
              Description (optionnel)
            </label>
            <textarea
              {...register('description')}
              placeholder="Parlez-nous de vous..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.backgroundLight}`,
                fontSize: '16px',
                backgroundColor: colors.backgroundWhite,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
              Style culinaire (optionnel)
            </label>
            <input
              type="text"
              {...register('culinaryStyle')}
              placeholder="Cuisine française, italienne..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${colors.backgroundLight}`,
                fontSize: '16px',
                backgroundColor: colors.backgroundWhite,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ padding: '16px', backgroundColor: colors.backgroundLight, borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                {...register('cguAccepted')}
                style={{ marginTop: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: colors.textPrimary }}>
                J'accepte les{' '}
                <Link to="/help" style={{ color: colors.primary, textDecoration: 'none', fontWeight: 'bold' }}>
                  Conditions Générales d'Utilisation
                </Link>{' '}
                *
              </span>
            </label>
            {errors.cguAccepted && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px', marginLeft: '28px' }}>
                {errors.cguAccepted.message}
              </p>
            )}
          </div>

          <div style={{ padding: '16px', backgroundColor: colors.backgroundLight, borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                {...register('sanitaryCharterAccepted')}
                style={{ marginTop: '4px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: colors.textPrimary }}>
                J'accepte la{' '}
                <Link to="/help" style={{ color: colors.primary, textDecoration: 'none', fontWeight: 'bold' }}>
                  Charte sanitaire
                </Link>{' '}
                *
              </span>
            </label>
            {errors.sanitaryCharterAccepted && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px', marginLeft: '28px' }}>
                {errors.sanitaryCharterAccepted.message}
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
            }}
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: colors.textSecondary }}>
            Déjà un compte ?{' '}
            <Link
              to="/login"
              style={{
                color: colors.primary,
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
