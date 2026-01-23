import { useEffect, useState } from 'react';
import { badgeService, UserBadge } from '../services/badge.service';

const colors = {
  badge: '#F1C40F',
  premium: '#9B59B6',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  backgroundWhite: '#FFFFFF',
};

interface BadgeListProps {
  userId?: string; // Si fourni, charge les badges de cet utilisateur (profil public)
  badges?: UserBadge[]; // Si fourni, affiche directement ces badges
}

export default function BadgeList({ userId, badges: providedBadges }: BadgeListProps) {
  const [badges, setBadges] = useState<UserBadge[]>(providedBadges || []);
  const [loading, setLoading] = useState(!providedBadges);

  useEffect(() => {
    // Si on est sur notre propre profil, charger nos badges
    if (!providedBadges && !userId) {
      loadMyBadges();
    } else if (userId) {
      // Pour un profil public, on pourrait charger les badges de cet utilisateur
      // Pour l'instant, on n'affiche que si les badges sont fournis
      setLoading(false);
    }
  }, [userId, providedBadges]);

  const loadMyBadges = async () => {
    try {
      const response = await badgeService.getMyBadges();
      if (response.success && response.data) {
        setBadges(response.data);
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
        <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Chargement des badges...</p>
      </div>
    );
  }

  if (badges.length === 0) {
    return null; // Ne rien afficher si pas de badges
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
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        🏆 Badges obtenus
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px',
        }}
      >
        {badges.map((userBadge) => (
          <div
            key={userBadge.id}
            style={{
              padding: '12px',
              backgroundColor: userBadge.badge.premiumOnly ? colors.premium + '20' : colors.badge + '20',
              borderRadius: '8px',
              textAlign: 'center',
              border: `1px solid ${userBadge.badge.premiumOnly ? colors.premium : colors.badge}40`,
            }}
            title={userBadge.badge.condition}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{userBadge.badge.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '4px' }}>
              {userBadge.badge.description}
            </div>
            {userBadge.badge.premiumOnly && (
              <div
                style={{
                  fontSize: '10px',
                  color: colors.premium,
                  fontWeight: 'bold',
                  marginTop: '4px',
                }}
              >
                PREMIUM
              </div>
            )}
            <div style={{ fontSize: '10px', color: colors.textSecondary, marginTop: '4px' }}>
              {new Date(userBadge.earnedAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
