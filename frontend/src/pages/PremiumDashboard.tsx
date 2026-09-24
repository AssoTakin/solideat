import { useEffect, useState } from 'react';
import api from '../services/api';
import Navigation from '../components/Navigation';
import { colors } from '../utils/theme';
import { TrophyIcon, GiftIcon, CrownIcon } from '../components/Icons';

interface Badge {
  id: string;
  earnedAt: string;
  badge: {
    name: string;
    description: string;
    icon: string;
    condition: string;
    premiumOnly: boolean;
  };
}

interface Bonus {
  id: string;
  amount: number;
  reason: string;
  expiresAt: string | null;
  isTransferred: boolean;
  createdAt: string;
}

export default function PremiumDashboard() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [badgesRes, bonusesRes] = await Promise.all([
          api.get('/badges'),
          api.get('/bonus-donors'),
        ]);
        if (badgesRes.data?.success) setBadges(badgesRes.data.data || []);
        if (bonusesRes.data?.success) setBonuses(bonusesRes.data.data || []);
      } catch {
        setError('Impossible de charger les données premium.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.backgroundLight }}>
      <Navigation />
      <div style={{ padding: '24px 16px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <CrownIcon size={28} color={colors.premium} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: colors.textPrimary }}>Espace Premium</h1>
        </div>

        {loading && <div style={{ color: colors.textSecondary }}>Chargement...</div>}
        {error && <div style={{ color: colors.error, marginBottom: 16 }}>{error}</div>}

        {!loading && (
          <>
            <section
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <TrophyIcon size={22} color={colors.primary} />
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: colors.textPrimary }}>Mes badges</h2>
              </div>

              {badges.length === 0 ? (
                <p style={{ color: colors.textSecondary }}>Aucun badge encore. Continue à servir des repas et collecter des avis !</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {badges.map((ub) => (
                    <div
                      key={ub.id}
                      style={{
                        flex: '1 1 200px',
                        border: `1px solid ${colors.backgroundLight}`,
                        borderRadius: 12,
                        padding: 16,
                        backgroundColor: colors.backgroundWhite,
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>{ub.badge.icon}</div>
                      <div style={{ fontWeight: 600, color: colors.textPrimary }}>{ub.badge.description}</div>
                      <div style={{ fontSize: '0.85rem', color: colors.textSecondary, marginTop: 4 }}>{ub.badge.condition}</div>
                      {ub.badge.premiumOnly && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: 8,
                            padding: '2px 8px',
                            borderRadius: 12,
                            backgroundColor: colors.premium,
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Premium
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <GiftIcon size={22} color={colors.success} />
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: colors.textPrimary }}>Mes bonus donateur</h2>
              </div>

              {bonuses.length === 0 ? (
                <p style={{ color: colors.textSecondary }}>Aucun bonus donateur actif.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {bonuses.map((bonus) => (
                    <div
                      key={bonus.id}
                      style={{
                        border: `1px solid ${colors.backgroundLight}`,
                        borderRadius: 12,
                        padding: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: colors.backgroundWhite,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: colors.textPrimary }}>
                          {bonus.amount.toFixed(2)} €
                        </div>
                        <div style={{ fontSize: '0.85rem', color: colors.textSecondary }}>{bonus.reason}</div>
                        {bonus.expiresAt && (
                          <div style={{ fontSize: '0.8rem', color: colors.warning, marginTop: 4 }}>
                            Expire le {new Date(bonus.expiresAt).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                      {!bonus.isTransferred && (
                        <button
                          style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: 'none',
                            backgroundColor: colors.primary,
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            // Transfert : implémentation future via modal
                            alert('Fonction transfert à compléter avec le flux de destination.');
                          }}
                        >
                          Transférer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
