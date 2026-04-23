import { useEffect, useState } from 'react';
import { quotaService, QuotaStatus } from '../services/quota.service';
import { isRedirectingToLogin } from '../services/api';

export default function QuotaStatusComponent() {
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuotaStatus();
  }, []);

  const loadQuotaStatus = async () => {
    // Ne pas charger si une redirection est en cours
    if (isRedirectingToLogin()) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Vérifier que le token est présent
      const token = localStorage.getItem('token');
      if (!token) {
        // Pas de token, ne pas charger les données
        setLoading(false);
        return;
      }
      
      // Vérifier à nouveau si une redirection est en cours (double vérification)
      if (isRedirectingToLogin()) {
        setLoading(false);
        return;
      }

      const response = await quotaService.getQuotaStatus();
      if (response.success && response.data) {
        setQuotaStatus(response.data);
      } else {
        // Ne pas afficher d'erreur si c'est une erreur d'authentification (l'intercepteur gère)
        if (response.error && !response.error.includes('401') && !response.error.includes('Unauthorized')) {
          setError(response.error || 'Erreur lors du chargement');
        }
      }
    } catch (err: any) {
      // Si une redirection est en cours, ne pas afficher d'erreur
      if (isRedirectingToLogin()) {
        setLoading(false);
        return;
      }
      
      // Si erreur 401, ne pas afficher d'erreur car l'intercepteur API va rediriger
      if (err.response?.status === 401) {
        // L'intercepteur API gère la redirection, ne pas afficher d'erreur
        setLoading(false);
        return;
      }
      // Ne pas afficher d'erreur pour les erreurs réseau si on est en train de rediriger
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.message === 'Redirection en cours') {
        setLoading(false);
        return;
      }
      setError(err.response?.data?.error || 'Erreur lors du chargement des quotas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p>Chargement des quotas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem' }}>
        <div
          style={{
            backgroundColor: '#FEE',
            color: '#E74C3C',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '2px solid #E74C3C',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>Erreur de chargement</strong>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={loadQuotaStatus}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!quotaStatus) {
    return null;
  }

  const getProgressColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 100) return '#ff4444';
    if (percentage >= 80) return '#ffaa00';
    return '#00aa00';
  };

  const getProgressPercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Quotas et restrictions</h2>

      {/* Sanctions actives */}
      {quotaStatus.sanctions && (
        <div style={{ marginBottom: '1.5rem' }}>
          {quotaStatus.sanctions.reservationBlocked && (
            <div
              style={{
                backgroundColor: '#fff5f5',
                border: '1px solid #ff4444',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              <p style={{ margin: 0, color: '#ff4444', fontWeight: 'bold' }}>
                ⚠️ Vos réservations sont temporairement bloquées
              </p>
            </div>
          )}

          {quotaStatus.sanctions.cancellationBlocked && (
            <div
              style={{
                backgroundColor: '#fff5f5',
                border: '1px solid #ff4444',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              <p style={{ margin: 0, color: '#ff4444', fontWeight: 'bold' }}>
                ⚠️ Vos annulations sont temporairement bloquées
              </p>
            </div>
          )}

          {quotaStatus.sanctions.activeSanctions.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '0.5rem' }}>Sanctions actives :</h3>
              {quotaStatus.sanctions.activeSanctions.map((sanction) => (
                <div
                  key={sanction.id}
                  style={{
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                    {sanction.type === 'RESERVATION_BLOCK' && '🚫 Blocage des réservations'}
                    {sanction.type === 'CANCELLATION_BLOCK' && '🚫 Blocage des annulations'}
                    {sanction.type === 'QUOTA_REDUCTION' && '📉 Réduction de quota'}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#666' }}>
                    {sanction.reason}
                  </p>
                  {sanction.endDate && (
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#999' }}>
                      Jusqu'au {new Date(sanction.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quotas hebdomadaires */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '0.75rem' }}>Quotas hebdomadaires</h3>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '14px' }}>Réservations</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {quotaStatus.weekly.reservations.current} / {quotaStatus.weekly.reservations.limit}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${getProgressPercentage(
                  quotaStatus.weekly.reservations.current,
                  quotaStatus.weekly.reservations.limit
                )}%`,
                height: '100%',
                backgroundColor: getProgressColor(
                  quotaStatus.weekly.reservations.current,
                  quotaStatus.weekly.reservations.limit
                ),
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '14px' }}>Propositions</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {quotaStatus.weekly.proposals.current} / {quotaStatus.weekly.proposals.limit}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${getProgressPercentage(
                  quotaStatus.weekly.proposals.current,
                  quotaStatus.weekly.proposals.limit
                )}%`,
                height: '100%',
                backgroundColor: getProgressColor(
                  quotaStatus.weekly.proposals.current,
                  quotaStatus.weekly.proposals.limit
                ),
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      </div>

      {/* Quotas mensuels */}
      <div>
        <h3 style={{ fontSize: '16px', marginBottom: '0.75rem' }}>Quotas mensuels</h3>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '14px' }}>
              Annulations
              {quotaStatus.monthly.cancellations.isReduced && (
                <span style={{ color: '#ff4444', marginLeft: '0.5rem', fontSize: '12px' }}>⚠️ Réduit</span>
              )}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {quotaStatus.monthly.cancellations.current} / {quotaStatus.monthly.cancellations.limit}
            </span>
          </div>
          {quotaStatus.monthly.cancellations.explanation && (
            <p style={{ fontSize: '12px', color: '#ff4444', marginBottom: '0.25rem' }}>
              {quotaStatus.monthly.cancellations.explanation}
            </p>
          )}
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${getProgressPercentage(
                  quotaStatus.monthly.cancellations.current,
                  quotaStatus.monthly.cancellations.limit
                )}%`,
                height: '100%',
                backgroundColor: getProgressColor(
                  quotaStatus.monthly.cancellations.current,
                  quotaStatus.monthly.cancellations.limit
                ),
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '14px' }}>
              Repas non récupérés
              {quotaStatus.monthly.notPickedUp.isReduced && (
                <span style={{ color: '#ff4444', marginLeft: '0.5rem', fontSize: '12px' }}>⚠️ Réduit</span>
              )}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {quotaStatus.monthly.notPickedUp.current} / {quotaStatus.monthly.notPickedUp.limit}
            </span>
          </div>
          {quotaStatus.monthly.notPickedUp.explanation && (
            <p style={{ fontSize: '12px', color: '#ff4444', marginBottom: '0.25rem' }}>
              {quotaStatus.monthly.notPickedUp.explanation}
            </p>
          )}
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${getProgressPercentage(
                  quotaStatus.monthly.notPickedUp.current,
                  quotaStatus.monthly.notPickedUp.limit
                )}%`,
                height: '100%',
                backgroundColor: getProgressColor(
                  quotaStatus.monthly.notPickedUp.current,
                  quotaStatus.monthly.notPickedUp.limit
                ),
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
