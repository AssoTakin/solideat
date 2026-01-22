import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { LoginDto } from '../types/auth';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(data as LoginDto);

      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.error || 'Erreur lors de la connexion');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Connexion</h1>

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
            Mot de passe *
            <input type="password" {...register('password')} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
          </label>
          {errors.password && <span style={{ color: 'red' }}>{errors.password.message}</span>}
        </div>

        <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <a href="/register">Pas encore de compte ? S'inscrire</a>
      </div>
    </div>
  );
}
