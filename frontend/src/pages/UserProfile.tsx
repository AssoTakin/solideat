import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { USE_MOCK_DATA, mockUsers, mockReviews } from '../data/mockData';
import { reviewService } from '../services/review.service';
import { badgeService, UserBadge } from '../services/badge.service';
import Navigation from '../components/Navigation';
import BadgeList from '../components/BadgeList';

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
  badge: '#F1C40F',
};

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID utilisateur manquant');
      setLoading(false);
      return;
    }

    if (USE_MOCK_DATA) {
      const foundUser = mockUsers.find((u) => u.id === id);
      if (foundUser) {
        setUser(foundUser);
        // Charger les avis du cuisinier
        const cookReviews = mockReviews.filter((r) => r.cookId === id);
        setReviews(cookReviews);
      } else {
        setError('Utilisateur non trouvé');
      }
      setLoading(false);
      return;
    }

    api
      .get(`/users/${id}`)
      .then((response) => {
        if (response.data.success) {
          setUser(response.data.data);
          // Charger les avis
          reviewService.getCookReviews(id).then((reviewResponse) => {
            if (reviewResponse.success && reviewResponse.data) {
              setReviews(reviewResponse.data.reviews || []);
            }
          });

          // Charger les badges
          badgeService.getMyBadges().then((badgeResponse) => {
            if (badgeResponse.success && badgeResponse.data) {
              setBadges(badgeResponse.data);
            }
          });
        } else {
          setError(response.data.error || 'Erreur lors du chargement');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Erreur lors du chargement');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

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

  if (error || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.backgroundLight,
          padding: '2rem',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Navigation showBottomBar={true} />
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '80px' }}>
          <p style={{ color: colors.error, fontSize: '18px', fontWeight: 'bold' }}>
            {error || 'Utilisateur non trouvé'}
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              marginTop: '16px',
              color: colors.primary,
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // Les badges sont maintenant chargés via badgeService

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
          padding: '24px 16px',
          textAlign: 'center',
          borderBottom: `1px solid ${colors.backgroundLight}`,
        }}
      >
        {user.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt={user.username}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: `4px solid ${colors.primary}`,
              marginBottom: '16px',
            }}
          />
        ) : (
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.backgroundWhite,
              fontSize: '48px',
              fontWeight: 'bold',
              margin: '0 auto 16px',
            }}
          >
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 8px 0' }}>
          @{user.username}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>⭐</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: colors.primary }}>
            {user.globalRating ? user.globalRating.toFixed(1) : 'N/A'}
          </span>
          <span style={{ fontSize: '14px', color: colors.textSecondary }}>
            ({reviews.length} avis)
          </span>
        </div>
        <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '8px 0 0 0' }}>
          📍 {user.addressCity}
        </p>
      </div>

      {/* Contenu */}
      <main style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Statistiques */}
        <div
          style={{
            backgroundColor: colors.backgroundWhite,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary, margin: 0 }}>
              {user.mealsServed || 0}
            </p>
            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
              Repas servis
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary, margin: 0 }}>
              {user.mealsReceived || 0}
            </p>
            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
              Repas reçus
            </p>
          </div>
        </div>

        {/* Badges */}
        <BadgeList badges={badges} />

        {/* Avis */}
        {reviews.length > 0 && (
          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '12px' }}>
              💬 Avis récents ({reviews.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    padding: '12px',
                    backgroundColor: colors.backgroundLight,
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {review.reviewer.profilePhoto ? (
                        <img
                          src={review.reviewer.profilePhoto}
                          alt={review.reviewer.username}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.backgroundWhite,
                            fontSize: '14px',
                            fontWeight: 'bold',
                          }}
                        >
                          {review.reviewer.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: colors.textPrimary }}>
                        {review.reviewer.username}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '16px',
                            color: i < review.rating ? colors.primary : colors.backgroundLight,
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, fontStyle: 'italic' }}>
                    "{review.comment}"
                  </p>
                  <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '8px 0 0 0' }}>
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations */}
        <div
          style={{
            backgroundColor: colors.backgroundWhite,
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '12px' }}>
            Informations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user.description && (
              <div>
                <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>Description</p>
                <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>{user.description}</p>
              </div>
            )}
            {user.culinaryStyle && (
              <div>
                <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>Style culinaire</p>
                <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>{user.culinaryStyle}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>Membre depuis</p>
              <p style={{ fontSize: '14px', color: colors.textPrimary, margin: 0 }}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
