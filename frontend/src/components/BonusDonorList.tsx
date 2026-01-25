import { useEffect, useState } from 'react';
import { bonusDonorService, BonusDonor } from '../services/bonus-donor.service';
import BonusDonorTransfer from './BonusDonorTransfer';
import api from '../services/api';
import { USE_MOCK_DATA, mockUsers } from '../data/mockData';

const colors = {
  primary: '#FF6B35',
  success: '#2ECC71',
  warning: '#F39C12',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  backgroundWhite: '#FFFFFF',
  premium: '#9B59B6',
};

export default function BonusDonorList() {
  const [bonuses, setBonuses] = useState<BonusDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadBonuses();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (USE_MOCK_DATA) {
        // Utiliser les données mock
        setUser(mockUsers[0]);
      } else {
        const response = await api.get('/users/me');
        if (response.data.success) {
          setUser(response.data.data);
        }
      }
    } catch (err) {
      // Erreur silencieuse
    }
  };

  const loadBonuses = async () => {
    try {
      const response = await bonusDonorService.getAvailableBonuses();
      if (response.success && response.data) {
        setBonuses(response.data);
      }
    } catch (err) {
      // Erreur silencieuse
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

  if (bonuses.length === 0) {
    return (
      <div
        style={{
          backgroundColor: colors.backgroundWhite,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <p style={{ color: colors.textSecondary, fontSize: '14px', margin: 0 }}>
          Vous n'avez pas de bonus donateur disponible.
          <br />
          <span style={{ fontSize: '12px' }}>
            Proposez plus de repas que vous n'en recevez pour obtenir des bonus !
          </span>
        </p>
      </div>
    );
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
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🎁 Mes bonus donateurs
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {bonuses.map((bonus) => {
          const expiresAt = new Date(bonus.expiresAt);
          const now = new Date();
          const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isExpiringSoon = daysLeft <= 3;

          return (
            <div
              key={bonus.id}
              style={{
                padding: '12px',
                backgroundColor: isExpiringSoon ? colors.warning + '20' : colors.success + '20',
                borderRadius: '8px',
                border: `1px solid ${isExpiringSoon ? colors.warning : colors.success}40`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '4px' }}>
                    Bonus donateur
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                    Expire le {expiresAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {isExpiringSoon && (
                      <span style={{ color: colors.warning, fontWeight: 'bold' }}> ({daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''})</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '24px' }}>🎁</div>
                  {user?.subscriptionType !== 'FREE' && (
                    <BonusDonorTransfer bonus={bonus} onTransferComplete={loadBonuses} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '12px', marginBottom: 0 }}>
        💡 Utilisez vos bonus lors d'une réservation pour réserver sans en proposer en retour (quota hebdomadaire : 2 max)
      </p>
    </div>
  );
}
