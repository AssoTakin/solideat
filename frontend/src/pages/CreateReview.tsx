import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mealService, Meal } from '../services/meal.service';
import { reviewService } from '../services/review.service';
import Navigation from '../components/Navigation';
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
      if (USE_MOCK_DATA) {
        // Simuler la création d'un avis
        setTimeout(() => {
          navigate(`/meals/${mealId}`);
        }, 500);
        return;
      }

      const response = await reviewService.createReview({
        mealId,
        rating: data.rating,
        comment: data.comment,
        photos: data.photos,
      });

      if (response.success) {
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
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.backgroundLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: colors.textPrimary }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !meal) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.backgroundLight,
          padding: '2rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Navigation showBottomBar={true} />
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '80px' }}>
          <p style={{ color: colors.error, fontSize: '18px', fontWeight: 'bold' }}>{error}</p>
          <button
            onClick={() => navigate('/reservations')}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: colors.primary,
              color: colors.backgroundWhite,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Retour aux réservations
          </button>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.backgroundLight,
          padding: '2rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Navigation showBottomBar={true} />
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '80px', textAlign: 'center' }}>
          <p style={{ color: colors.textPrimary, fontSize: '18px' }}>Repas non trouvé</p>
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
        paddingBottom: '100px',
      }}
    >
      <Navigation showBottomBar={true} />

      {/* Header */}
      <div
        style={{
          backgroundColor: colors.backgroundWhite,
          padding: '16px',
          borderBottom: `1px solid ${colors.backgroundLight}`,
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
          Noter : {meal.name}
        </h1>
      </div>

      <main style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>

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

        {/* Aperçu du repas */}
        <div
          style={{
            backgroundColor: colors.backgroundWhite,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '16px',
          }}
        >
          <img
            src={meal.photo || '/placeholder-meal.jpg'}
            alt={meal.name}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '8px',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 8px 0' }}>
              {meal.name}
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
              Par {meal.cook.username}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary }}>
              Note (1 à 5 étoiles) *
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <label
                  key={star}
                  style={{
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: colors.backgroundLight,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.backgroundLight;
                  }}
                >
                  <input
                    type="radio"
                    value={star}
                    {...register('rating', { valueAsNumber: true })}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '32px' }}>⭐</span>
                </label>
              ))}
            </div>
            {errors.rating && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.rating.message}</p>
            )}
          </div>

          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary }}>
              Commentaire * (min 20, max 500 caractères)
            </label>
            <textarea
              {...register('comment')}
              rows={6}
              placeholder="Décrivez votre expérience avec ce repas..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${errors.comment ? colors.error : colors.backgroundLight}`,
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <div
              style={{
                fontSize: '12px',
                color: commentLength < 20 ? colors.error : colors.textSecondary,
                marginTop: '8px',
                textAlign: 'right',
              }}
            >
              {commentLength}/500 caractères (minimum 20 requis)
            </div>
            {errors.comment && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>{errors.comment.message}</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting || commentLength < 20}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: submitting || commentLength < 20 ? colors.textSecondary : colors.success,
                color: colors.backgroundWhite,
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: submitting || commentLength < 20 ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Envoi...' : '⭐ Publier l\'avis'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/meals/${mealId}`)}
              style={{
                padding: '14px 24px',
                backgroundColor: colors.backgroundLight,
                color: colors.textPrimary,
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
