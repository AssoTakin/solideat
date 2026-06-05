import { colors } from '../utils/theme';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { mealService, Meal } from '../services/meal.service';
import { bonusDonorService } from '../services/bonus-donor.service';
import Navigation from '../components/Navigation';
import { USE_MOCK_DATA, mockSaveThemMeals, mockUsers } from '../data/mockData';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';

// Design System Colors EXACTES depuis les maquettes HTML (code_improved.html)


export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
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
    if (isAuthenticated || isGuestMode) {
      loadSaveThemMeals();
      loadAvailableMeals();
    }
  }, [isAuthenticated, isGuestMode, filters]);

  const checkAuth = async () => {
    try {
      const guest = sessionStorage.getItem('isGuestMode') === 'true';
      setIsGuestMode(guest);

      if (USE_MOCK_DATA) {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        setIsAuthenticated(true);
        setIsGuestMode(false);
        sessionStorage.removeItem('isGuestMode');
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
            setIsGuestMode(false);
            sessionStorage.removeItem('isGuestMode');
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
        paddingBottom: (isAuthenticated || isGuestMode) ? getPagePaddingBottom(true, false) : '0', // Espace pour la bottom bar si authentifié ou invité
      }}
    >
      {(isAuthenticated || isGuestMode) ? (
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
        {(isAuthenticated || isGuestMode) ? (
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
                  to={isGuestMode ? '#' : '/meals/new'}
                  onClick={(e) => {
                    if (isGuestMode) {
                      e.preventDefault();
                      setShowAuthModal(true);
                    }
                  }}
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
                              onClick={(e) => {
                                if (isGuestMode) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setShowAuthModal(true);
                                }
                              }}
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
                  to={isGuestMode ? '#' : '/meals/new'}
                  onClick={(e) => {
                    if (isGuestMode) {
                      e.preventDefault();
                      setShowAuthModal(true);
                    }
                  }}
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
                  to={isGuestMode ? '#' : '/meals'}
                  onClick={(e) => {
                    if (isGuestMode) {
                      e.preventDefault();
                      setShowAuthModal(true);
                    }
                  }}
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
          /* Landing Page Premium pour non-authentifiés */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', padding: '24px 0' }}>
            
            {/* HERO SECTION */}
            <div 
              className="mesh-gradient-bg"
              style={{
                borderRadius: '24px',
                padding: '64px 32px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '48px',
                alignItems: 'center',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* Gauche : Textes & CTAs */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(255, 90, 31, 0.1)',
                    color: 'var(--color-primary)',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  🌱 Partage de repas & Éco-responsabilité
                </div>
                <h1
                  style={{
                    fontSize: 'clamp(32px, 5vw, 48px)',
                    fontWeight: 800,
                    lineHeight: '1.15',
                    margin: 0,
                    color: colors.textPrimary,
                  }}
                >
                  Cuisinez moins, <br/>
                  <span className="gradient-text">diversifiez vos saveurs</span>
                </h1>
                <p
                  style={{
                    fontSize: '18px',
                    color: colors.textSecondary,
                    lineHeight: '1.6',
                    margin: 0,
                    maxWidth: '520px',
                  }}
                >
                  Rejoignez SOLID'EAT, la première communauté de partage de repas faits maison entre voisins. Mangez équilibré, économisez du temps et réduisez le gaspillage alimentaire !
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
                  <button
                    onClick={() => {
                      sessionStorage.setItem('isGuestMode', 'true');
                      setIsGuestMode(true);
                    }}
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.backgroundWhite,
                      padding: '16px 32px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 10px 20px -5px rgba(255, 90, 31, 0.3)',
                    }}
                  >
                    🚀 Explorer la carte
                  </button>
                  <Link
                    to="/register"
                    style={{
                      textDecoration: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(8px)',
                      color: colors.textPrimary,
                      padding: '16px 32px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>

              {/* Droite : UI Mockup premium */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="ui-mockup" style={{ width: '100%', maxWidth: '380px', padding: '16px' }}>
                  {/* Header fictif du mockup */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-premium)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>S</div>
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>Chef Sophie L.</p>
                        <p style={{ margin: 0, fontSize: '11px', color: colors.textSecondary }}>⭐ 4.9 (28 avis) • Paris 11e</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-premium)', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                      Premium Cook
                    </span>
                  </div>
                  {/* Photo fictive du repas */}
                  <div style={{ height: '200px', borderRadius: '12px', backgroundColor: '#e2e8f0', backgroundImage: 'url("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', marginBottom: '16px' }}>
                    <span style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>
                      🥗 Cuisine Saine
                    </span>
                  </div>
                  {/* Titre & Description du repas */}
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Bowl Végétarien & Sauce Sésame</h3>
                  <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    Quinoa bio, avocado, patates douces rôties, pois chiches croustillants et vinaigrette maison.
                  </p>
                  {/* Footer du repas */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(15, 23, 42, 0.06)' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: colors.textSecondary }}>Portions</span>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>3 parts dispo.</p>
                    </div>
                    <button 
                      style={{ 
                        backgroundColor: colors.primary, 
                        color: colors.backgroundWhite, 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        fontSize: '13px', 
                        fontWeight: 'bold',
                        cursor: 'default'
                      }}
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURES GRID */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>Comment ça marche ?</h2>
                <p style={{ fontSize: '16px', color: colors.textSecondary }}>Une plateforme solidaire et conviviale pensée pour faciliter votre quotidien tout en agissant pour la planète.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
                {/* Feature 1 */}
                <div className="feature-card" style={{ padding: '32px 24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255, 90, 31, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    🍳
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Partagez vos Plats</h3>
                  <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.6', margin: 0 }}>
                    Vous cuisinez en trop grande quantité ? Proposez vos portions restantes à la communauté plutôt que de les jeter.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="feature-card" style={{ padding: '32px 24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    🥗
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Diversifiez vos Saveurs</h3>
                  <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.6', margin: 0 }}>
                    Découvrez des spécialités culinaires variées cuisinées avec amour par vos voisins, et gagnez du temps sur la cuisine.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="feature-card" style={{ padding: '32px 24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(5, 199, 183, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    🌍
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Zéro Gaspillage</h3>
                  <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.6', margin: 0 }}>
                    Réduisez le gaspillage alimentaire localement et contribuez directement à la préservation de l'environnement.
                  </p>
                </div>
              </div>
            </div>

            {/* STATISTICS BAND */}
            <div 
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.03)', 
                borderRadius: '20px', 
                padding: '40px 24px', 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '32px',
                textAlign: 'center'
              }}
            >
              <div>
                <p style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 4px 0' }}>320+</p>
                <p style={{ fontSize: '14px', color: colors.textSecondary, fontWeight: 500, margin: 0 }}>Repas partagés</p>
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-premium)', margin: '0 0 4px 0' }}>120+</p>
                <p style={{ fontSize: '14px', color: colors.textSecondary, fontWeight: 500, margin: 0 }}>Chefs inscrits</p>
              </div>
              <div>
                <p style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-sos-accent)', margin: '0 0 4px 0' }}>1.2 T</p>
                <p style={{ fontSize: '14px', color: colors.textSecondary, fontWeight: 500, margin: 0 }}>CO₂ économisés</p>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* AuthPromptModal pour le mode invité */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px',
          }}
          onClick={() => setShowAuthModal(false)}
        >
          <div
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '16px',
              padding: '32px 24px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>👋</span>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '12px' }}>
              Rejoignez SOLID'EAT !
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.6', marginBottom: '24px' }}>
              Pour proposer vos repas, échanger avec les autres membres ou réserver un plat, créez un compte gratuit en quelques secondes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                to="/register"
                style={{
                  textDecoration: 'none',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'block',
                }}
              >
                S'inscrire gratuitement
              </Link>
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
                  color: colors.primary,
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: `2px solid ${colors.primary}`,
                  display: 'block',
                }}
              >
                Se connecter
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textSecondary,
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  textDecoration: 'underline',
                  outline: 'none',
                }}
              >
                Continuer à découvrir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
