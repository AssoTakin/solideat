import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Meal } from '../services/meal.service';
import api from '../services/api';

interface SaveThemMeal extends Meal {
  hoursRemaining?: number;
}

export default function SaveThem() {
  const [meals, setMeals] = useState<SaveThemMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadMeals();
  }, [page]);

  const loadMeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/meals/save-them?page=${page}&limit=20`);
      if (response.data.success && response.data.data) {
        setMeals(response.data.data.meals);
        setTotal(response.data.data.total);
      } else {
        setError('Erreur lors du chargement');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const formatPickupTime = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startTime = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (startTime === endTime) {
      return startTime;
    }
    return `Entre ${startTime} et ${endTime}`;
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={loadMeals}>Réessayer</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🍽️ Sauvez-les !</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Des repas vont expirer bientôt. Aidez à réduire le gaspillage alimentaire !
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {meals.map((meal) => (
          <div key={meal.id} style={{ border: '2px solid #ff6b6b', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
            {meal.hoursRemaining !== undefined && meal.hoursRemaining <= 24 && (
              <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ff6b6b', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ⚠️ Expire dans {meal.hoursRemaining}h
              </div>
            )}
            <img src={meal.photo} alt={meal.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '1rem' }}>
              <h3>{meal.name}</h3>
              <p><strong>Cuisinier:</strong> {meal.cook.username}</p>
              <p><strong>Note:</strong> {meal.cook.globalRating ? meal.cook.globalRating.toFixed(1) : 'N/A'}</p>
              {meal.distance && <p><strong>Distance:</strong> {meal.distance.toFixed(1)} km</p>}
              <p><strong>Date:</strong> {new Date(meal.serviceDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>Heure:</strong> {formatPickupTime(meal.pickupTimeStart, meal.pickupTimeEnd)}</p>
              <p><strong>Parts:</strong> {meal.portions}</p>
              {meal.hoursRemaining !== undefined && (
                <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  ⏰ Expire dans {meal.hoursRemaining} heure{meal.hoursRemaining > 1 ? 's' : ''}
                </p>
              )}
              <Link
                to={`/meals/${meal.id}`}
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#ff6b6b',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                }}
              >
                Sauver ce repas
              </Link>
            </div>
          </div>
        ))}
      </div>

      {meals.length === 0 && !loading && (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Aucun repas à sauver pour le moment</p>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
          Précédent
        </button>
        <span>Page {page} sur {Math.ceil(total / 20)}</span>
        <button onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / 20)}>
          Suivant
        </button>
      </div>
    </div>
  );
}
