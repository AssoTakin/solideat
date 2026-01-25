import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { mealService, Meal } from '../services/meal.service';
import { reviewService, Review } from '../services/review.service';
import api from '../services/api';
import { USE_MOCK_DATA } from '../data/mockData';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';

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
  badge: '#F1C40F',
};

export default function MealDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quotaStatus, setQuotaStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (id) {
      checkAuth();
      loadMeal();
    }
  }, [id]);

  const checkAuth = async () => {
    try {
      if (USE_MOCK_DATA) {
        setIsAuthenticated(true);
        setQuotaStatus({
          weeklyReservations: { used: 1, limit: 1 },
          weeklyProposals: { used: 0, limit: 1 },
        });
        return;
      }
      const token = localStorage.getItem('token');
      if (token) {
        const userResponse = await api.get('/users/me');
        if (userResponse.data.success) {
          setIsAuthenticated(true);
          loadQuotaStatus();
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadQuotaStatus = async () => {
    try {
      const quotaResponse = await api.get('/users/me/quotas');
      if (quotaResponse.data.success) {
        setQuotaStatus(quotaResponse.data.data);
      }
    } catch (error) {
      // Quotas non disponibles
    }
  };

  const loadMeal = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await mealService.getMealById(id);
      if (response.success && response.data) {
        setMeal(response.data);
        // Charger les avis du cuisinier
        if (response.data.cook?.id) {
          loadReviews(response.data.cook.id);
        }
      } else {
        setError(response.error || 'Repas non trouvé');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (cookId: string) => {
    try {
      const response = await reviewService.getCookReviews(cookId, 1, 3);
      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      // Erreur silencieuse
    }
  };


  const calculateHoursRemaining = (expirationDate: string): number => {
    const now = new Date();
    const expiration = new Date(expirationDate);
    const diff = expiration.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  };

  const getServiceDateLabel = (serviceDate: string): string => {
    if (!serviceDate) return 'N/A';
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour la comparaison
      const service = new Date(serviceDate);
      service.setHours(0, 0, 0, 0);
      const diffTime = service.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Aujourd'hui";
      if (diffDays === 1) return 'Demain';
      if (diffDays === -1) return 'Hier';
      return service.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch (error) {
      return 'N/A';
    }
  };

  const getTimeOfDay = (start: string, end?: string): string => {
    if (!start) return 'N/A';
    
    try {
      const startDate = new Date(start);
      const hour = startDate.getHours();
      
      // Si c'est une plage horaire, afficher la plage
      if (end && end !== start) {
        const endDate = new Date(end);
        const startHour = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const endHour = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `${startHour} - ${endHour}`;
      }
      
      // Sinon, afficher la période de la journée
      if (hour < 12) return 'Matin';
      if (hour < 18) return 'Midi';
      return 'Soir';
    } catch (error) {
      return 'N/A';
    }
  };

  const getAllergens = (): string[] => {
    if (!meal) return [];
    const allergens: string[] = [];
    meal.ingredients.forEach((ing) => {
      if (ing.allergens) {
        allergens.push(...ing.allergens);
      }
    });
    return [...new Set(allergens)];
  };

  const isQuotaReached = quotaStatus?.weeklyReservations?.used >= quotaStatus?.weeklyReservations?.limit;
  const hoursRemaining = meal ? calculateHoursRemaining(meal.expirationDate) : 0;
  const isSaveThem = hoursRemaining > 0 && hoursRemaining <= 24;

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: colors.textPrimary, fontFamily: 'Inter, sans-serif' }}>
        Chargement...
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: colors.error }}>{error || 'Repas non trouvé'}</p>
        <Link to="/" style={{ color: colors.primary, textDecoration: 'none' }}>
          ← Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.backgroundLight,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: getPagePaddingBottom(true, isAuthenticated), // Espace pour bottom bar + footer si authentifié
      }}
    >
      <Navigation showBottomBar={true} />
      {/* Header avec bouton retour et actions */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(12px)',
            border: 'none',
            color: colors.backgroundWhite,
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ←
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(12px)',
              border: 'none',
              color: colors.backgroundWhite,
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ♡
          </button>
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(12px)',
              border: 'none',
              color: colors.backgroundWhite,
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ↗
          </button>
        </div>
      </header>

      {/* Photo principale */}
      <div style={{ position: 'relative', width: '100%', height: '320px', marginTop: '0' }}>
        <img
          src={meal.photo || '/placeholder-meal.jpg'}
          alt={meal.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
          }}
        />
        {isSaveThem && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              backgroundColor: colors.primary,
              color: colors.backgroundWhite,
              padding: '6px 12px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            ⏰ EXPIRE DANS {hoursRemaining}H
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <main style={{ padding: '16px', ...getMainContentStyle(isAuthenticated), maxWidth: '600px', margin: '0 auto' }}>
        {/* Titre et badges */}
        <div style={{ marginBottom: '16px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: colors.textPrimary,
              marginBottom: '8px',
              lineHeight: '1.2',
            }}
          >
            {meal.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {isSaveThem && (
              <span
                style={{
                  backgroundColor: `${colors.sosAccent}20`,
                  color: colors.sosAccent,
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                Sauvez-les
              </span>
            )}
            <span style={{ fontSize: '14px', color: colors.textSecondary }}>
              Fait maison avec amour
            </span>
          </div>
        </div>

        {/* Carte cuisinier */}
        <div
          style={{
            backgroundColor: colors.backgroundWhite,
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: colors.backgroundLight,
              backgroundImage: meal.cook.profilePhoto ? `url(${meal.cook.profilePhoto})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
                {meal.cook.username}
              </p>
              <span style={{ color: '#3B82F6', fontSize: '14px' }}>✓</span>
            </div>
            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '2px 0 0 0', textTransform: 'uppercase' }}>
              Chef Cordon Bleu • <span style={{ color: colors.primary }}>{meal.cook.globalRating?.toFixed(1) || 'N/A'} ÉTOILES</span>
            </p>
          </div>
          <button
            onClick={() => navigate(`/messages/${meal.id}`)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: `${colors.primary}10`,
              color: colors.primary,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            💬
          </button>
        </div>

        {/* Grille d'informations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ fontSize: '24px', color: colors.primary, marginBottom: '4px' }}>📅</span>
            <span style={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>
              DATE
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, textAlign: 'center' }}>
              {getServiceDateLabel(meal.serviceDate)}
            </span>
          </div>
          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ fontSize: '24px', color: colors.primary, marginBottom: '4px' }}>🕐</span>
            <span style={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>
              PLAGE HORAIRE
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, textAlign: 'center' }}>
              {getTimeOfDay(meal.pickupTimeStart, meal.pickupTimeEnd)}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ fontSize: '24px', color: colors.primary, marginBottom: '4px' }}>📍</span>
            <span style={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>
              DISTANCE
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>
              {meal.distance ? `${meal.distance.toFixed(1)} km` : 'N/A'}
            </span>
          </div>
          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ fontSize: '24px', color: colors.primary, marginBottom: '4px' }}>🍽️</span>
            <span style={{ fontSize: '10px', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>
              PARTS RESTANTES
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>
              {meal.status === 'RESERVED' ? '0 restante' : `${meal.portions} restant${meal.portions > 1 ? 'es' : 'e'}`}
            </span>
          </div>
        </div>

        {/* Description */}
        {meal.description && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '8px' }}>
              Description
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.6' }}>
              {meal.description}
            </p>
          </div>
        )}

        {/* Ingrédients */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '12px' }}>
            Ingrédients
          </h3>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {meal.ingredients.slice(0, 8).map((ingredient, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: colors.backgroundLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px',
                    fontSize: '24px',
                  }}
                >
                  🥘
                </div>
                <span style={{ fontSize: '11px', color: colors.textPrimary, textAlign: 'center' }}>
                  {ingredient.name}
                </span>
              </div>
            ))}
          </div>

          {/* Alerte allergènes */}
          {getAllergens().length > 0 && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#FEE',
                borderRadius: '8px',
                border: '1px solid #FCC',
                display: 'flex',
                alignItems: 'start',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px', color: colors.error }}>⚠️</span>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: colors.error, textTransform: 'uppercase', marginBottom: '4px' }}>
                  ALERTE ALLERGÈNES
                </p>
                <p style={{ fontSize: '12px', color: colors.error }}>
                  Contient: {getAllergens().join(', ')}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Avis récents */}
        {reviews.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary }}>
                Avis récents
              </h3>
              <Link
                to={`/users/${meal.cook.id}`}
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: colors.primary,
                  textDecoration: 'none',
                }}
              >
                Voir tout
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: colors.backgroundLight,
                      backgroundImage: review.reviewer.profilePhoto ? `url(${review.reviewer.profilePhoto})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: colors.textPrimary }}>
                        {review.reviewer.username}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '12px',
                              color: i < review.rating ? colors.primary : colors.backgroundLight,
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: colors.textSecondary, fontStyle: 'italic', margin: 0 }}>
                      "{review.comment}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quota de réservation (si authentifié) */}
        {isAuthenticated && quotaStatus && (
          <div
            style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#FFF3E0',
              borderRadius: '12px',
              border: '1px solid #FFB74D',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#E65100', margin: 0 }}>
                  📊 Votre quota de réservation
                </p>
                <span style={{ fontSize: '12px', color: '#E65100' }} title="Les quotas sont réinitialisés chaque lundi">
                  ℹ️
                </span>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  backgroundColor: isQuotaReached ? '#FCC' : '#CFC',
                  color: isQuotaReached ? colors.error : colors.success,
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: '9999px',
                }}
              >
                {quotaStatus.weeklyReservations?.used || 0}/{quotaStatus.weeklyReservations?.limit || 1} {isQuotaReached ? '❌' : '✅'}
              </span>
            </div>
            <div
              style={{
                height: '8px',
                backgroundColor: colors.backgroundLight,
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: isQuotaReached ? colors.error : colors.success,
                  width: `${((quotaStatus.weeklyReservations?.used || 0) / (quotaStatus.weeklyReservations?.limit || 1)) * 100}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            {isQuotaReached ? (
              <p style={{ fontSize: '12px', color: '#E65100', margin: '4px 0 0 0' }}>
                ⚠️ <strong>Quota atteint.</strong> Vous pourrez réserver à nouveau <strong>lundi prochain</strong> (réinitialisation hebdomadaire).
              </p>
            ) : (
              <p style={{ fontSize: '12px', color: '#E65100', margin: '4px 0 0 0' }}>
                💡 Vous pouvez toujours proposer des repas même si votre quota de réservation est atteint.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Footer avec actions */}
      {isAuthenticated && (
        <footer
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            backgroundColor: `${colors.backgroundWhite}CC`,
            backdropFilter: 'blur(12px)',
            borderTop: `1px solid ${colors.backgroundLight}`,
            paddingBottom: '32px',
            zIndex: 150, // Au-dessus de la Navigation (qui a zIndex: 100)
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
            <button
              onClick={() => navigate(`/messages/${meal.id}`)}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                border: `2px solid ${colors.primary}50`,
                backgroundColor: 'transparent',
                color: colors.primary,
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✉️
            </button>
            {meal.status === 'AVAILABLE' ? (
              <button
                onClick={() => (isQuotaReached ? null : navigate(`/meals/${meal.id}/reserve`))}
                disabled={isQuotaReached}
                style={{
                  flex: 1,
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: isQuotaReached ? colors.backgroundLight : colors.primary,
                  color: isQuotaReached ? colors.textSecondary : colors.backgroundWhite,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: isQuotaReached ? 'not-allowed' : 'pointer',
                }}
              >
                {isQuotaReached ? 'QUOTA ATTEINT' : '✅ RÉSERVER CE REPAS'}
              </button>
            ) : (
              <div
                style={{
                  flex: 1,
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: colors.backgroundLight,
                  color: colors.textSecondary,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {meal.status === 'RESERVED' ? 'DÉJÀ RÉSERVÉ' : meal.status === 'SERVED' ? 'SERVI' : 'EXPIRÉ'}
              </div>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
