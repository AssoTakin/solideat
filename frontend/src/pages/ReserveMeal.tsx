import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mealService, Meal } from '../services/meal.service';
import { reservationService } from '../services/reservation.service';

export default function ReserveMeal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBonusDonor, setUseBonusDonor] = useState(false);

  useEffect(() => {
    if (id) {
      loadMeal();
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

  const handleReserve = async () => {
    if (!id) return;

    if (!window.confirm('Confirmer la réservation de ce repas ?')) {
      return;
    }

    setReserving(true);
    setError(null);

    try {
      const response = await reservationService.createReservation({
        mealId: id,
        useBonusDonor,
      });

      if (response.success) {
        alert('Réservation créée avec succès !');
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
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  if (error && !meal) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/meals')}>Retour à la liste</button>
      </div>
    );
  }

  if (!meal) {
    return <div style={{ padding: '2rem' }}>Repas non trouvé</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Réserver : {meal.name}</h1>

      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <img src={meal.photo} alt={meal.name} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />

        <p><strong>Cuisinier:</strong> {meal.cook.username}</p>
        <p><strong>Date:</strong> {new Date(meal.serviceDate).toLocaleDateString('fr-FR')}</p>
        <p><strong>Adresse:</strong> {meal.pickupAddress}</p>
        {meal.distance && <p><strong>Distance:</strong> {meal.distance.toFixed(1)} km</p>}

        <div style={{ marginTop: '1.5rem' }}>
          <label>
            <input
              type="checkbox"
              checked={useBonusDonor}
              onChange={(e) => setUseBonusDonor(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Utiliser un bonus donateur (si disponible)
          </label>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleReserve}
            disabled={reserving || meal.status !== 'AVAILABLE'}
            style={{
              padding: '0.75rem 1.5rem',
              background: meal.status === 'AVAILABLE' ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: meal.status === 'AVAILABLE' && !reserving ? 'pointer' : 'not-allowed',
            }}
          >
            {reserving ? 'Réservation...' : 'Confirmer la réservation'}
          </button>
          <button onClick={() => navigate(`/meals/${id}`)} style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
