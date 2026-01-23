import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationService, Reservation } from '../services/reservation.service';
import { USE_MOCK_DATA, mockReservations } from '../data/mockData';
import Navigation from '../components/Navigation';

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
      if (USE_MOCK_DATA) {
        let reservations = [...mockReservations];
        if (filter !== 'all') {
          reservations = reservations.filter((r: any) => r.meal.status === filter);
        }
        setReservations(reservations as any[]);
        setLoading(false);
        return;
      }
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
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 16px 0' }}>
          Mes réservations
        </h1>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {[
            { value: 'all', label: 'Toutes' },
            { value: 'RESERVED', label: 'Réservées' },
            { value: 'SERVED', label: 'Servies' },
            { value: 'NOT_PICKED_UP', label: 'Non récupérées' },
            { value: 'EXPIRED', label: 'Expirées' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === option.value ? colors.primary : colors.backgroundLight,
                color: filter === option.value ? colors.backgroundWhite : colors.textPrimary,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: filter === option.value ? 'bold' : 'normal',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
        {error && (
          <div
            style={{
              backgroundColor: '#FEE',
              color: colors.error,
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {error}
            <button
              onClick={loadReservations}
              style={{
                marginLeft: '12px',
                padding: '6px 12px',
                backgroundColor: colors.primary,
                color: colors.backgroundWhite,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {reservations.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📋</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '8px' }}>
              Aucune réservation
            </p>
            <p style={{ fontSize: '14px', color: colors.textSecondary }}>
              {filter === 'all'
                ? "Vous n'avez pas encore de réservations. Explorez les repas disponibles !"
                : `Aucune réservation avec le statut "${filter}"`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reservations.map((reservation: any) => (
              <div
                key={reservation.id}
                style={{
                  backgroundColor: colors.backgroundWhite,
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <img
                    src={reservation.meal.photo || '/placeholder-meal.jpg'}
                    alt={reservation.meal.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: colors.textPrimary,
                        margin: '0 0 8px 0',
                      }}
                    >
                      {reservation.meal.name}
                    </h3>
                    <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 4px 0' }}>
                      <strong>Cuisinier:</strong>{' '}
                      <Link
                        to={`/users/${reservation.meal.cook.id}`}
                        style={{ color: colors.primary, textDecoration: 'none', fontWeight: 500 }}
                      >
                        {reservation.meal.cook.username}
                      </Link>
                    </p>
                    <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 4px 0' }}>
                      📅 {new Date(reservation.meal.serviceDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 4px 0' }}>
                      🕐 {formatPickupTime(reservation.meal.pickupTimeStart, reservation.meal.pickupTimeEnd)}
                    </p>
                    <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '0 0 4px 0' }}>
                      📍 {reservation.meal.pickupAddress}
                    </p>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor:
                          reservation.meal.status === 'SERVED'
                            ? colors.success
                            : reservation.meal.status === 'RESERVED'
                            ? colors.warning
                            : colors.error,
                        color: colors.backgroundWhite,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginTop: '8px',
                      }}
                    >
                      {reservation.meal.status === 'SERVED'
                        ? '✅ Servi'
                        : reservation.meal.status === 'RESERVED'
                        ? '⏳ Réservé'
                        : reservation.meal.status}
                    </div>
                    {reservation.cancelledAt && (
                      <p style={{ color: colors.error, fontSize: '12px', margin: '8px 0 0 0' }}>
                        ❌ Annulé le {new Date(reservation.cancelledAt).toLocaleDateString('fr-FR')}
                        {reservation.cancellationReason && (
                          <>
                            <br />
                            <strong>Motif:</strong> {reservation.cancellationReason}
                          </>
                        )}
                      </p>
                    )}
                    {reservation.pickedUpAt && (
                      <p style={{ color: colors.success, fontSize: '12px', margin: '8px 0 0 0' }}>
                        ✅ Récupéré le {new Date(reservation.pickedUpAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link
                    to={`/meals/${reservation.mealId}`}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: colors.primary,
                      color: colors.backgroundWhite,
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    👁️ Voir le repas
                  </Link>
                  {reservation.meal.status === 'RESERVED' && !reservation.cancelledAt && (
                    <button
                      onClick={() => handleCancel(reservation)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: colors.error,
                        color: colors.backgroundWhite,
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      ❌ Annuler
                    </button>
                  )}
                  {reservation.meal.status === 'SERVED' && reservation.pickedUpAt && !reservation.cancelledAt && (
                    <Link
                      to={`/meals/${reservation.mealId}/review`}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: colors.warning,
                        color: colors.textPrimary,
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }}
                    >
                      ⭐ Noter ce repas
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
