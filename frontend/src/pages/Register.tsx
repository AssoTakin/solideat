import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { RegisterDto } from '../types/auth';

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
      const response = await authService.register(data as RegisterDto);

      if (response.success && response.data) {
        setSuccess(true);
        setUserId(response.data.user.id);
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
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Inscription réussie !</h1>
        <p>Veuillez vérifier votre email et votre téléphone pour activer votre compte.</p>
        {phoneCode && (
          <div style={{ background: '#f0f0f0', padding: '1rem', marginTop: '1rem', borderRadius: '4px' }}>
            <p><strong>Code de vérification téléphone (développement) :</strong> {phoneCode}</p>
          </div>
        )}
        <div style={{ marginTop: '2rem' }}>
          <button onClick={() => navigate('/verify', { state: { userId } })}>
            Vérifier mon compte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Inscription</h1>

      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Email *
            <input type="email" {...register('email')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
          {errors.email && <span style={{ color: 'red' }}>{errors.email.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Mot de passe * (min 8 caractères)
            <input type="password" {...register('password')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
          {errors.password && <span style={{ color: 'red' }}>{errors.password.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Téléphone * (format: +33XXXXXXXXX)
            <input type="tel" {...register('phone')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
          {errors.phone && <span style={{ color: 'red' }}>{errors.phone.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Prénom *
            <input type="text" {...register('firstName')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
          {errors.firstName && <span style={{ color: 'red' }}>{errors.firstName.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Nom *
            <input type="text" {...register('lastName')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
          {errors.lastName && <span style={{ color: 'red' }}>{errors.lastName.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Pseudo * (3-20 caractères)
            <input type="text" {...register('username')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
          {errors.username && <span style={{ color: 'red' }}>{errors.username.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Rue *
            <input type="text" {...register('addressStreet')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
          {errors.addressStreet && <span style={{ color: 'red' }}>{errors.addressStreet.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Code postal * (5 chiffres)
            <input type="text" {...register('addressZipCode')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
          {errors.addressZipCode && <span style={{ color: 'red' }}>{errors.addressZipCode.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Ville *
            <input type="text" {...register('addressCity')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
          {errors.addressCity && <span style={{ color: 'red' }}>{errors.addressCity.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Description (optionnel)
            <textarea {...register('description')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Style culinaire (optionnel)
            <input type="text" {...register('culinaryStyle')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input type="checkbox" {...register('cguAccepted')} />
            J'accepte les CGU *
          </label>
          {errors.cguAccepted && <span style={{ color: 'red', display: 'block' }}>{errors.cguAccepted.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            <input type="checkbox" {...register('sanitaryCharterAccepted')} />
            J'accepte la charte sanitaire *
          </label>
          {errors.sanitaryCharterAccepted && <span style={{ color: 'red', display: 'block' }}>{errors.sanitaryCharterAccepted.message}</span>}
        </div>

        <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <a href="/login">Déjà un compte ? Se connecter</a>
      </div>
    </div>
  );
}
