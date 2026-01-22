import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mealService, Meal } from '../services/meal.service';

export default function MealDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleDelete = async () => {
    if (!id || !window.confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
      return;
    }

    try {
      const response = await mealService.deleteMeal(id);
      if (response.success) {
        navigate('/meals');
      } else {
        alert(response.error || 'Erreur lors de la suppression');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Chargement...</div>;
  }

  if (error || !meal) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error || 'Repas non trouvé'}</p>
        <Link to="/meals">Retour à la liste</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/meals">← Retour à la liste</Link>
      </div>

      <img src={meal.photo} alt={meal.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }} />

      <h1>{meal.name}</h1>

      <div style={{ marginTop: '1.5rem' }}>
        <p><strong>Cuisinier:</strong> <Link to={`/users/${meal.cook.id}`}>{meal.cook.username}</Link></p>
        <p><strong>Note:</strong> {meal.cook.globalRating ? meal.cook.globalRating.toFixed(1) : 'N/A'}</p>
        {meal.distance && <p><strong>Distance:</strong> {meal.distance.toFixed(1)} km</p>}
        <p><strong>Date de service:</strong> {new Date(meal.serviceDate).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure de récupération:</strong> {formatPickupTime(meal.pickupTimeStart, meal.pickupTimeEnd)}</p>
        <p><strong>Adresse:</strong> {meal.pickupAddress}</p>
        <p><strong>Date de préparation:</strong> {new Date(meal.preparationDate).toLocaleDateString('fr-FR')}</p>
        <p><strong>Expire le:</strong> {new Date(meal.expirationDate).toLocaleDateString('fr-FR')} à {new Date(meal.expirationDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        {meal.description && <p><strong>Description:</strong> {meal.description}</p>}
        <p><strong>Nombre de parts:</strong> {meal.portions}</p>
        {meal.price && <p><strong>Prix:</strong> {meal.price}€</p>}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3>Ingrédients</h3>
        <ul>
          {meal.ingredients.map((ingredient, index) => (
            <li key={index}>
              {ingredient.name}
              {ingredient.allergens && ingredient.allergens.length > 0 && (
                <span style={{ color: 'orange' }}> (Allergènes: {ingredient.allergens.join(', ')})</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        {meal.status === 'AVAILABLE' && (
          <>
            <button onClick={() => navigate(`/meals/${meal.id}/reserve`)} style={{ padding: '0.75rem 1.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Réserver
            </button>
            <button onClick={() => navigate(`/meals/${meal.id}/edit`)} style={{ padding: '0.75rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Modifier
            </button>
            <button onClick={handleDelete} style={{ padding: '0.75rem 1.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Supprimer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
