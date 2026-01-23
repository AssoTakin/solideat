import { useEffect, useState } from 'react';
import { environmentalService, EnvironmentalImpact } from '../services/environmental.service';

const colors = {
  primary: '#FF6B35',
  sosAccent: '#4ECDC4',
  success: '#2ECC71',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  backgroundWhite: '#FFFFFF',
  premium: '#9B59B6',
};

export default function EnvironmentalStats() {
  const [stats, setStats] = useState<EnvironmentalImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await environmentalService.getEnvironmentalImpact();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Erreur lors du chargement');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p style={{ color: colors.textSecondary }}>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px' }}>
        <p style={{ color: colors.textSecondary, fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: colors.backgroundWhite,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🌱 Mon impact environnemental
      </h2>

      {/* Statistiques totales */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: colors.sosAccent + '20',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.sosAccent, marginBottom: '4px' }}>
              {stats.total.mealsSaved}
            </div>
            <div style={{ fontSize: '12px', color: colors.textSecondary }}>Repas sauvés</div>
          </div>
          <div
            style={{
              backgroundColor: colors.success + '20',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.success, marginBottom: '4px' }}>
              {stats.total.co2Avoided.toFixed(1)} kg
            </div>
            <div style={{ fontSize: '12px', color: colors.textSecondary }}>CO₂ évité</div>
          </div>
        </div>
      </div>

      {/* Statistiques mensuelles et annuelles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ padding: '12px', backgroundColor: colors.backgroundWhite, borderRadius: '8px', border: `1px solid ${colors.sosAccent}40` }}>
          <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '4px' }}>Ce mois</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary }}>
            {stats.monthly.mealsSaved} repas
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary }}>
            {stats.monthly.co2Avoided.toFixed(1)} kg CO₂
          </div>
        </div>
        <div style={{ padding: '12px', backgroundColor: colors.backgroundWhite, borderRadius: '8px', border: `1px solid ${colors.success}40` }}>
          <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '4px' }}>Cette année</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary }}>
            {stats.yearly.mealsSaved} repas
          </div>
          <div style={{ fontSize: '12px', color: colors.textSecondary }}>
            {stats.yearly.co2Avoided.toFixed(1)} kg CO₂
          </div>
        </div>
      </div>

      {/* Graphique simple (barres horizontales) */}
      {stats.monthlyHistory.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '12px' }}>
            Évolution sur 12 mois
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.monthlyHistory.slice(-6).map((month, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                    {new Date(month.month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textPrimary }}>
                    {month.mealsSaved} repas
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    backgroundColor: colors.backgroundWhite,
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (month.mealsSaved / Math.max(...stats.monthlyHistory.map((m) => m.mealsSaved))) * 100)}%`,
                      backgroundColor: colors.sosAccent,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
