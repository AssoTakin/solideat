import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mealService, Meal } from '../services/meal.service';
import { reviewService } from '../services/review.service';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(20, 'Le commentaire doit contenir au moins 20 caractères').max(500, 'Le commentaire ne peut pas dépasser 500 caractères'),
  photos: z.array(z.string().url()).max(3).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function CreateReview() {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  const commentLength = watch('comment')?.length || 0;

  useEffect(() => {
    if (mealId) {
      loadMeal();
    }
  }, [mealId]);

  const loadMeal = async () => {
    if (!mealId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await mealService.getMealById(mealId);
      if (response.success && response.data) {
        setMeal(response.data);
      } else {
        setError(response.error || 'Repas non trouvé');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (!mealId) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await reviewService.createReview({
        mealId,
        rating: data.rating,
        comment: data.comment,
        photos: data.photos,
      });

      if (response.success) {
        alert('Avis créé avec succès !');
        navigate(`/meals/${mealId}`);
      } else {
        setError(response.error || 'Erreur lors de la création de l\'avis');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  if (error && !meal) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/reservations')}>Retour aux réservations</button>
      </div>
    );
  }

  if (!meal) {
    return <div style={{ padding: '2rem' }}>Repas non trouvé</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Noter : {meal.name}</h1>

      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label>
            Note (1 à 5 étoiles) *
            <div style={{ marginTop: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} style={{ marginRight: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value={star}
                    {...register('rating', { valueAsNumber: true })}
                    style={{ marginRight: '0.25rem' }}
                  />
                  {'⭐'.repeat(star)}
                </label>
              ))}
            </div>
          </label>
          {errors.rating && <span style={{ color: 'red', display: 'block' }}>{errors.rating.message}</span>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>
            Commentaire * (min 20, max 500 caractères)
            <textarea
              {...register('comment')}
              rows={6}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
          <div style={{ fontSize: '0.8rem', color: commentLength < 20 ? 'red' : '#666' }}>
            {commentLength}/500 caractères (minimum 20 requis)
          </div>
          {errors.comment && <span style={{ color: 'red', display: 'block' }}>{errors.comment.message}</span>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>
            Photos (optionnel, max 3)
            <input type="text" placeholder="URL de la photo" style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }} />
            <small style={{ display: 'block', color: '#666', marginTop: '0.25rem' }}>
              Note: Upload de photos à implémenter avec Cloudinary
            </small>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={submitting || commentLength < 20}
            style={{
              padding: '0.75rem 1.5rem',
              background: submitting || commentLength < 20 ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting || commentLength < 20 ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Envoi...' : 'Publier l\'avis'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/meals/${mealId}`)}
            style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
