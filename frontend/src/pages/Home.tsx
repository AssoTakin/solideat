import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { mealService, Meal } from '../services/meal.service';
import { bonusDonorService } from '../services/bonus-donor.service';
import Navigation from '../components/Navigation';
import { USE_MOCK_DATA, mockSaveThemMeals, mockUsers } from '../data/mockData';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';

// Design System Colors EXACTES depuis les maquettes HTML (code_improved.html)
const colors = {
  primary: '#ff6933', // Orange chaleureux (utilisé dans toutes les maquettes HTML)
  primaryHover: '#ff8c5a',
  primaryActive: '#e55a2b',
  sosAccent: '#4ECDC4', // Turquoise pour "Sauvez-les" (selon AMELIORATIONS_UX.md)
  sosAccentHover: '#6EDDD6',
  sosAccentActive: '#3BB5AE',
  secondaryHover: '#6EDDD6',
  secondaryActive: '#3BB5AE',
  success: '#2ECC71', // Vert
  warning: '#F39C12', // Orange attention
  error: '#E74C3C', // Rouge
  textPrimary: '#181210', // Texte principal (utilisé dans les maquettes HTML)
  textSecondary: '#8d6a5e', // Texte secondaire (utilisé dans les maquettes HTML)
  backgroundLight: '#f8f6f5', // Fond clair (utilisé dans les maquettes HTML)
  backgroundWhite: '#FFFFFF', // Fond blanc
  premium: '#9B59B6', // Violet
  badge: '#F1C40F', // Or
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quotaStatus, setQuotaStatus] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasBonuses, setHasBonuses] = useState(false);
  const [isReservationBlocked, setIsReservationBlocked] = useState(false);
  const [saveThemMeals, setSaveThemMeals] = useState<Meal[]>([]);
  const [availableMeals, setAvailableMeals] = useState<Meal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    maxDistance: 10,
    hour: '',
    cuisine: '',
    portions: '',
  });
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSaveThemMeals();
      loadAvailableMeals();
    }
  }, [isAuthenticated, filters]);

  const checkAuth = async () => {
    try {
      if (USE_MOCK_DATA) {
        setIsAuthenticated(true);
        setCurrentUser(mockUsers[0]);
        setQuotaStatus({
          weeklyReservations: { used: 1, limit: 3 },
          weeklyProposals: { used: 0, limit: 3 },
        });
        setHasBonuses(true);
        setIsReservationBlocked(false);
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const [userResponse, quotaResponse, bonusResponse] = await Promise.all([
            api.get('/users/me').catch(() => null),
            api.get('/users/me/quotas').catch(() => null),
            bonusDonorService.getAvailableBonuses().catch(() => null),
          ]);

          if (userResponse && userResponse.data?.success) {
            setIsAuthenticated(true);
            const userData = userResponse.data.data;
            setCurrentUser(userData);
            if (userData?.id) {
              localStorage.setItem('userId', userData.id);
            }
            
            if (quotaResponse && quotaResponse.data?.success) {
              const apiData = quotaResponse.data.data;
              setQuotaStatus({
                weeklyReservations: {
                  used: apiData.weekly?.reservations?.current ?? 0,
                  limit: apiData.weekly?.reservations?.limit ?? 1,
                },
                weeklyProposals: {
                  used: apiData.weekly?.proposals?.current ?? 0,
                  limit: apiData.weekly?.proposals?.limit ?? 1,
                },
              });
              // Vérifier si les réservations sont bloquées par une sanction
              setIsReservationBlocked(apiData.sanctions?.reservationBlocked === true);
            }

            // Vérifier la disponibilité de bonus donateurs
            if (bonusResponse && bonusResponse.success && bonusResponse.data) {
              setHasBonuses(bonusResponse.data.length > 0);
            }
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            setIsAuthenticated(false);
          }
        } catch (error: any) {
          // Si erreur 403 (compte non vérifié) ou 401 (token invalide), déconnecter
          // Mais ne pas rediriger depuis la page Home (page publique)
          if (error.response?.status === 403 || error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            setIsAuthenticated(false);
            // Ne pas rediriger depuis Home, c'est une page publique
          } else {
            // Autre erreur, considérer comme non authentifié
            setIsAuthenticated(false);
          }
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSaveThemMeals = async () => {
    if (USE_MOCK_DATA) {
      setSaveThemMeals(mockSaveThemMeals.slice(0, 3) as any[]);
      return;
    }
    try {
      const response = await api.get('/meals/save-them?limit=3');
      if (response.data.success && response.data.data) {
        setSaveThemMeals(response.data.data.meals || []);
      }
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const loadAvailableMeals = async () => {
    try {
      const response = await mealService.getMeals({
        status: 'AVAILABLE',
        maxDistance: filters.maxDistance,
        hour: filters.hour || undefined,
        cuisine: filters.cuisine || undefined,
        portions: filters.portions ? parseInt(filters.portions) : undefined,
        limit: 12,
        sortBy: 'distance',
      });
      if (response.success && response.data) {
        setAvailableMeals(response.data.meals || []);
      }
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const calculateHoursRemaining = (expirationDate: string): number => {
    const now = new Date();
    const expiration = new Date(expirationDate);
    const diff = expiration.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: colors.textPrimary, fontFamily: 'Inter, sans-serif' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.backgroundLight,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: isAuthenticated ? getPagePaddingBottom(true, false) : '0', // Espace pour la bottom bar si authentifié
      }}
    >
      {isAuthenticated ? (
        <Navigation showBottomBar={true} />
      ) : (
        <header
          style={{
            backgroundColor: `${colors.backgroundWhite}E6`,
            backdropFilter: 'blur(12px)',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: `1px solid ${colors.backgroundLight}`,
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="SOLID'EAT"
              style={{
                height: '40px',
                width: 'auto',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  const span = document.createElement('span');
                  span.style.cssText = `font-size: 18px; font-weight: bold; color: ${colors.primary}`;
                  span.textContent = "SOLID'EAT";
                  parent.appendChild(span);
                }
              }}
            />
          </Link>
          <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                color: colors.textPrimary,
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              Connexion
            </Link>
            <Link
              to="/register"
              style={{
                textDecoration: 'none',
                backgroundColor: colors.primary,
                color: colors.backgroundWhite,
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              S'inscrire
            </Link>
          </nav>
        </header>
      )}

      {/* Main Content */}
      <main style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto', ...getMainContentStyle(false) }}>
        {isAuthenticated ? (
          <>
            {/* Search Bar - Conforme au wireframe */}
            <div style={{ marginBottom: '16px', padding: '0 4px' }}>
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 16px',
                    backgroundColor: colors.backgroundWhite,
                    color: colors.textSecondary,
                  }}
                >
                  🔍
                </div>
                <input
                  type="text"
                  placeholder="Chercher un repas ou un chef"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: 'none',
                    fontSize: '16px',
                    backgroundColor: colors.backgroundWhite,
                    color: colors.textPrimary,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Filters - Conforme au wireframe */}
            <div
              style={{
                backgroundColor: colors.backgroundWhite,
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: colors.textSecondary }}>
                  📍 Distance
                </label>
                <select
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '14px',
                    color: colors.textPrimary,
                    backgroundColor: colors.backgroundWhite,
                  }}
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: colors.textSecondary }}>
                  🕐 Heure
                </label>
                <select
                  value={filters.hour}
                  onChange={(e) => setFilters({ ...filters, hour: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '14px',
                    color: colors.textPrimary,
                    backgroundColor: colors.backgroundWhite,
                  }}
                >
                  <option value="">Toutes</option>
                  <option value="morning">Matin</option>
                  <option value="noon">Midi</option>
                  <option value="evening">Soir</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: colors.textSecondary }}>
                  🍽️ Type cuisine
                </label>
                <select
                  value={filters.cuisine}
                  onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '14px',
                    color: colors.textPrimary,
                    backgroundColor: colors.backgroundWhite,
                  }}
                >
                  <option value="">Tous</option>
                  <option value="française">Française</option>
                  <option value="italienne">Italienne</option>
                  <option value="asiatique">Asiatique</option>
                  <option value="africaine">Africaine</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: colors.textSecondary }}>
                  👥 Parts
                </label>
                <select
                  value={filters.portions}
                  onChange={(e) => setFilters({ ...filters, portions: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '14px',
                    color: colors.textPrimary,
                    backgroundColor: colors.backgroundWhite,
                  }}
                >
                  <option value="">Toutes</option>
                  <option value="1">1 part</option>
                  <option value="2">2 parts</option>
                  <option value="3">3+ parts</option>
                </select>
              </div>
            </div>

            {/* Quota Status - Conforme au wireframe */}
            {quotaStatus && (
              <div
                style={{
                  backgroundColor: colors.backgroundWhite,
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  borderLeft: `4px solid ${quotaStatus.weeklyReservations?.used === quotaStatus.weeklyReservations?.limit ? colors.error : colors.warning}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                      ⚠️ Votre quota: {quotaStatus.weeklyReservations?.used || 0}/{quotaStatus.weeklyReservations?.limit || 1} repas réservé cette semaine
                    </p>
                    <p style={{ fontSize: '14px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
                      Réinitialisé chaque lundi
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '4px 12px',
                      backgroundColor: quotaStatus.weeklyReservations?.used === quotaStatus.weeklyReservations?.limit ? colors.error : colors.success,
                      color: colors.backgroundWhite,
                      fontSize: '12px',
                      fontWeight: 'bold',
                      borderRadius: '9999px',
                    }}
                  >
                    {quotaStatus.weeklyReservations?.used || 0}/{quotaStatus.weeklyReservations?.limit || 1} ✅
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    backgroundColor: colors.backgroundLight,
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: quotaStatus.weeklyReservations?.used === quotaStatus.weeklyReservations?.limit ? colors.error : colors.success,
                      width: `${((quotaStatus.weeklyReservations?.used || 0) / (quotaStatus.weeklyReservations?.limit || 1)) * 100}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Sauvez-les Section - Conforme au wireframe avec #4ECDC4 (sos-accent) */}
            {saveThemMeals.length > 0 && (
              <section style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    backgroundColor: colors.backgroundWhite,
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: colors.sosAccent, // #4ECDC4 selon AMELIORATIONS_UX.md
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      🆘 SAUVEZ-LES ({saveThemMeals.length} repas)
                    </h2>
                    <Link
                      to="/save-them"
                      style={{
                        textDecoration: 'none',
                        color: colors.sosAccent,
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      Voir tout
                    </Link>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      overflowX: 'auto',
                      paddingBottom: '8px',
                    }}
                  >
                    {saveThemMeals.map((meal) => {
                      const hoursRemaining = calculateHoursRemaining(meal.expirationDate);
                      return (
                        <Link
                          key={meal.id}
                          to={`/meals/${meal.id}`}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            minWidth: '256px',
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: colors.backgroundWhite,
                              borderRadius: '12px',
                              overflow: 'hidden',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              borderBottom: `4px solid ${colors.sosAccent}`, // #4ECDC4
                              cursor: 'pointer',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                          >
                            <div style={{ position: 'relative', height: '176px', backgroundColor: colors.backgroundLight }}>
                              {meal.photo ? (
                                <img
                                  src={meal.photo}
                                  alt={meal.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: colors.textSecondary,
                                  }}
                                >
                                  [Photo]
                                </div>
                              )}
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  right: '8px',
                                  backgroundColor: colors.sosAccent, // #4ECDC4
                                  color: colors.backgroundWhite,
                                  padding: '4px 8px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                ⏰ Finit dans {hoursRemaining}h
                              </div>
                            </div>
                            <div style={{ padding: '12px' }}>
                              <p style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {meal.name}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: colors.textSecondary }}>
                                <span>📍</span>
                                <span>{meal.distance ? `${meal.distance.toFixed(1)} km` : 'Distance N/A'}</span>
                                <span>•</span>
                                <span>{meal.cook.username}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Available Meals Section */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: colors.textPrimary,
                  }}
                >
                  REPAS DISPONIBLES ({availableMeals.length})
                </h2>
                <Link
                  to="/meals/new"
                  style={{
                    textDecoration: 'none',
                    color: colors.primary,
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Filtres
                </Link>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {availableMeals.map((meal) => (
                  <Link
                    key={meal.id}
                    to={`/meals/${meal.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: colors.backgroundWhite,
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: `1px solid ${colors.backgroundLight}`,
                        display: 'flex',
                        gap: '16px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div
                        style={{
                          width: '96px',
                          height: '96px',
                          borderRadius: '8px',
                          backgroundColor: colors.backgroundLight,
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {meal.photo ? (
                          <img
                            src={meal.photo}
                            alt={meal.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: colors.textSecondary,
                              fontSize: '12px',
                            }}
                          >
                            [Photo]
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                            <p style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
                              {meal.name}
                            </p>
                            <span
                              style={{
                                color: meal.price ? colors.primary : colors.success,
                                fontSize: '14px',
                                fontWeight: 'bold',
                              }}
                            >
                              {meal.price ? `${meal.price}€` : 'Gratuit'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <span style={{ color: colors.badge, fontSize: '12px' }}>⭐</span>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: colors.textPrimary }}>
                              {meal.cook.globalRating ? meal.cook.globalRating.toFixed(1) : 'N/A'} ({meal.cook.username})
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📍 {meal.distance ? `${meal.distance.toFixed(1)} km` : 'Distance N/A'}
                          </span>
                          {/* Bouton contextuel selon le propriétaire et l'éligibilité */}
                          {currentUser && meal.cook.id === currentUser.id ? (
                            // Bouton "Consulter" pour ses propres repas
                            <button
                              style={{
                                backgroundColor: 'transparent',
                                color: colors.primary,
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                border: `2px solid ${colors.primary}`,
                                cursor: 'pointer',
                              }}
                            >
                              Consulter
                            </button>
                          ) : isReservationBlocked ? (
                            // Réservations bloquées par sanction
                            <button
                              disabled
                              style={{
                                backgroundColor: '#d3d3d3',
                                color: '#808080',
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: 'not-allowed',
                              }}
                            >
                              Bloqué
                            </button>
                          ) : quotaStatus?.weeklyReservations?.used >= quotaStatus?.weeklyReservations?.limit && !hasBonuses ? (
                            // Quota atteint et aucun bonus disponible
                            <button
                              disabled
                              style={{
                                backgroundColor: '#d3d3d3',
                                color: '#808080',
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: 'not-allowed',
                              }}
                            >
                              Quota atteint
                            </button>
                          ) : (
                            // Bouton "Réserver" pour les repas des autres
                            <button
                              style={{
                                backgroundColor: colors.primary,
                                color: colors.backgroundWhite,
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Réserver
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {availableMeals.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', color: colors.textSecondary }}>
                  <p>Aucun repas disponible pour le moment</p>
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Link
                  to="/meals/new"
                  style={{
                    textDecoration: 'none',
                    backgroundColor: colors.primary,
                    color: colors.backgroundWhite,
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  ➕ Proposer un repas
                </Link>
                <Link
                  to="/meals"
                  style={{
                    textDecoration: 'none',
                    color: colors.primary,
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: `2px solid ${colors.primary}`,
                    backgroundColor: 'transparent',
                  }}
                >
                  📊 Voir plus
                </Link>
              </div>
            </section>
          </>
        ) : (
          /* Landing Page pour non-authentifiés */
          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              padding: '48px 24px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: colors.textPrimary,
                marginBottom: '16px',
              }}
            >
              Partagez vos repas, réduisez le gaspillage
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: colors.textSecondary,
                maxWidth: '600px',
                margin: '0 auto 32px',
                lineHeight: '1.6',
              }}
            >
              SOLID'EAT connecte les cuisiniers amateurs qui ont préparé trop de repas avec des
              personnes qui souhaitent récupérer ces repas. Créons du lien social autour de la cuisine
              tout en luttant contre le gaspillage alimentaire.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                style={{
                  textDecoration: 'none',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                Commencer maintenant
              </Link>
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
                  color: colors.primary,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: `2px solid ${colors.primary}`,
                }}
              >
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
