import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mealService, Meal } from '../services/meal.service';
import { reservationService } from '../services/reservation.service';
import { bonusDonorService } from '../services/bonus-donor.service';
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

export default function ReserveMeal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBonusDonor, setUseBonusDonor] = useState(false);
  const [availableBonuses, setAvailableBonuses] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadMeal();
      loadAvailableBonuses();
    }
  }, [id]);

  const loadMeal = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await mealService.getMealById(id);
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

  const loadAvailableBonuses = async () => {
    if (USE_MOCK_DATA) return;

    try {
      const response = await bonusDonorService.getAvailableBonuses();
      if (response.success && response.data) {
        setAvailableBonuses(response.data);
      }
    } catch (err) {
      // Erreur silencieuse
    }
  };

  const handleReserve = async () => {
    if (!id) return;

    setReserving(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // Simuler la réservation
        setTimeout(() => {
          navigate('/reservations');
        }, 500);
        return;
      }

      const response = await reservationService.createReservation({
        mealId: id,
        useBonusDonor,
      });

      if (response.success) {
        navigate('/reservations');
      } else {
        setError(response.error || 'Erreur lors de la réservation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setReserving(false);
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
            onClick={() => navigate('/meals')}
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
            Retour à la liste
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
          Réserver : {meal.name}
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
          }}
        >
          <img
            src={meal.photo || '/placeholder-meal.jpg'}
            alt={meal.name}
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>
              <strong>Cuisinier:</strong> {meal.cook.username}
            </p>
            <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>
              <strong>Date:</strong> {new Date(meal.serviceDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>
              <strong>Adresse:</strong> {meal.pickupAddress}
            </p>
            {meal.distance && (
              <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>
                <strong>Distance:</strong> {meal.distance.toFixed(1)} km
              </p>
            )}
          </div>
        </div>

        {/* Options - Bonus donateur */}
        {availableBonuses.length > 0 && (
          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 8px 0' }}>
                Bonus donateur disponible
              </h3>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
                Vous avez {availableBonuses.length} bonus donateur{availableBonuses.length > 1 ? 's' : ''} disponible{availableBonuses.length > 1 ? 's' : ''}.
                {availableBonuses[0] && (
                  <span>
                    {' '}
                    Expire le {new Date(availableBonuses[0].expiresAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                )}
              </p>
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: colors.textPrimary,
              }}
            >
              <input
                type="checkbox"
                checked={useBonusDonor}
                onChange={(e) => setUseBonusDonor(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>
                <strong>Utiliser un bonus donateur</strong>
                <br />
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                  Réservez sans en proposer un en retour (quota hebdomadaire : 2 max)
                </span>
              </span>
            </label>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleReserve}
            disabled={reserving || meal.status !== 'AVAILABLE'}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: meal.status === 'AVAILABLE' && !reserving ? colors.success : colors.textSecondary,
              color: colors.backgroundWhite,
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: meal.status === 'AVAILABLE' && !reserving ? 'pointer' : 'not-allowed',
            }}
          >
            {reserving ? 'Réservation...' : '✅ Confirmer la réservation'}
          </button>
          <button
            onClick={() => navigate(`/meals/${id}`)}
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
      </main>
    </div>
  );
}
