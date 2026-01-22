import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationService, Reservation } from '../services/reservation.service';

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadReservations();
  }, [filter]);

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reservationService.getMyReservations(
        filter !== 'all' ? { status: filter } : undefined
      );
      if (response.success && response.data) {
        setReservations(response.data);
      } else {
        setError(response.error || 'Erreur lors du chargement');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservation: Reservation) => {
    const reason = window.prompt('Motif d\'annulation (obligatoire, max 200 caractères):');
    if (!reason || reason.trim().length === 0) {
      alert('Le motif est obligatoire');
      return;
    }

    if (reason.length > 200) {
      alert('Le motif ne peut pas dépasser 200 caractères');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      const response = await reservationService.cancelReservation(reservation.id, reason);
      if (response.success) {
        alert('Réservation annulée avec succès');
        loadReservations();
      } else {
        alert(response.error || 'Erreur lors de l\'annulation');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l\'annulation');
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
        <button onClick={loadReservations}>Réessayer</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Mes réservations</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Filtrer par statut:
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.5rem' }}>
            <option value="all">Toutes</option>
            <option value="RESERVED">Réservées</option>
            <option value="SERVED">Servies</option>
            <option value="NOT_PICKED_UP">Non récupérées</option>
            <option value="EXPIRED">Expirées</option>
          </select>
        </label>
      </div>

      {reservations.length === 0 ? (
        <p>Aucune réservation trouvée</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reservations.map((reservation) => (
            <div key={reservation.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <img src={reservation.meal.photo} alt={reservation.meal.name} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                  <h3>{reservation.meal.name}</h3>
                  <p><strong>Cuisinier:</strong> <Link to={`/users/${reservation.meal.cook.id}`}>{reservation.meal.cook.username}</Link></p>
                  <p><strong>Date de service:</strong> {new Date(reservation.meal.serviceDate).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Heure de récupération:</strong> {formatPickupTime(reservation.meal.pickupTimeStart, reservation.meal.pickupTimeEnd)}</p>
                  <p><strong>Adresse:</strong> {reservation.meal.pickupAddress}</p>
                  <p><strong>Statut:</strong> {reservation.meal.status}</p>
                  <p><strong>Réservé le:</strong> {new Date(reservation.reservedAt).toLocaleString('fr-FR')}</p>
                  {reservation.cancelledAt && (
                    <p style={{ color: 'red' }}>
                      <strong>Annulé le:</strong> {new Date(reservation.cancelledAt).toLocaleString('fr-FR')}
                      {reservation.cancellationReason && <><br /><strong>Motif:</strong> {reservation.cancellationReason}</>}
                    </p>
                  )}
                  {reservation.pickedUpAt && (
                    <p style={{ color: 'green' }}>
                      <strong>Récupéré le:</strong> {new Date(reservation.pickedUpAt).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Link to={`/meals/${reservation.mealId}`} style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                  Voir le repas
                </Link>
                {reservation.meal.status === 'RESERVED' && !reservation.cancelledAt && (
                  <button onClick={() => handleCancel(reservation)} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Annuler
                  </button>
                )}
                {reservation.meal.status === 'SERVED' && reservation.pickedUpAt && !reservation.cancelledAt && (
                  <Link to={`/meals/${reservation.mealId}/review`} style={{ padding: '0.5rem 1rem', background: '#ffc107', color: 'black', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>
                    Noter ce repas
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
