import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mealService, Meal } from '../services/meal.service';
import MealFiltersComponent, { MealFilters } from '../components/MealFilters';
import Navigation from '../components/Navigation';
import { USE_MOCK_DATA, mockMeals } from '../data/mockData';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';

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

export default function MealList() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<MealFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMeals();
  }, [page, filters]);

  // Debounce pour la recherche
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (page === 1) {
        loadMeals();
      } else {
        setPage(1);
      }
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [searchQuery]);

  const loadMeals = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        let filteredMeals = [...mockMeals];
        
        // Appliquer les filtres (filtrer seulement les repas disponibles)
        filteredMeals = filteredMeals.filter((m) => m.status === 'AVAILABLE');
        if (filters.maxDistance !== undefined) {
          filteredMeals = filteredMeals.filter((m) => (m.distance || 0) <= filters.maxDistance!);
        }
        if (filters.portions !== undefined) {
          filteredMeals = filteredMeals.filter((m) => m.portions >= filters.portions!);
        }
        
        // Recherche textuelle
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredMeals = filteredMeals.filter(
            (meal) =>
              meal.name.toLowerCase().includes(query) ||
              meal.description?.toLowerCase().includes(query) ||
              meal.cook.username.toLowerCase().includes(query) ||
              meal.cook.addressCity.toLowerCase().includes(query)
          );
        }
        
        const skip = (page - 1) * 20;
        setMeals(filteredMeals.slice(skip, skip + 20));
        setTotal(filteredMeals.length);
        setLoading(false);
        return;
      }

      const response = await mealService.getMeals({
        ...filters,
        page,
        limit: 20,
      });
      if (response.success && response.data) {
        // Filtrer par recherche textuelle si nécessaire
        let filteredMeals = response.data.meals;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredMeals = filteredMeals.filter(
            (meal) =>
              meal.name.toLowerCase().includes(query) ||
              meal.description?.toLowerCase().includes(query) ||
              meal.cook.username.toLowerCase().includes(query) ||
              meal.cook.addressCity.toLowerCase().includes(query)
          );
        }
        setMeals(filteredMeals);
        setTotal(response.data.total);
      } else {
        setError('Erreur lors du chargement des repas');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement des repas');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = useCallback((newFilters: MealFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset à la première page lors du changement de filtres
  }, []);

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
        paddingBottom: getPagePaddingBottom(true, false),
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
          Repas disponibles
        </h1>

        {/* Barre de recherche */}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un repas, un cuisinier, une ville..."
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

      <main style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto', ...getMainContentStyle(false) }}>
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
              onClick={loadMeals}
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

        {/* Filtres */}
        <MealFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />

        {meals.length === 0 && !loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: colors.backgroundWhite,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginTop: '24px',
            }}
          >
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '8px' }}>
              Aucun repas disponible
            </p>
            <p style={{ fontSize: '14px', color: colors.textSecondary }}>
              Essayez de modifier vos filtres ou votre recherche.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
                marginTop: '24px',
              }}
            >
              {meals.map((meal) => (
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
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
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
                    <div style={{ position: 'relative', height: '200px', backgroundColor: colors.backgroundLight }}>
                      <img
                        src={meal.photo}
                        alt={meal.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: colors.textPrimary,
                          margin: '0 0 8px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {meal.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: colors.primary }}>⭐</span>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                          {meal.cook.globalRating?.toFixed(1) || 'N/A'}
                        </span>
                        <span style={{ fontSize: '14px', color: colors.textSecondary }}>•</span>
                        <span style={{ fontSize: '14px', color: colors.textSecondary }}>{meal.cook.username}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📍 {meal.distance ? `${meal.distance.toFixed(1)} km` : 'N/A'}
                        </span>
                        <span style={{ fontSize: '12px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          👥 {meal.portions} part{meal.portions > 1 ? 's' : ''}
                        </span>
                        <span style={{ fontSize: '12px', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          🕐 {formatPickupTime(meal.pickupTimeStart, meal.pickupTimeEnd)}
                        </span>
                      </div>
                      <div
                        style={{
                          padding: '10px',
                          backgroundColor: colors.primary,
                          color: colors.backgroundWhite,
                          borderRadius: '8px',
                          textAlign: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                      >
                        Voir les détails
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {total > 20 && (
              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: page === 1 ? colors.backgroundLight : colors.primary,
                    color: page === 1 ? colors.textSecondary : colors.backgroundWhite,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ← Précédent
                </button>
                <span style={{ fontSize: '14px', color: colors.textPrimary, fontWeight: 500 }}>
                  Page {page} sur {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: page >= Math.ceil(total / 20) ? colors.backgroundLight : colors.primary,
                    color: page >= Math.ceil(total / 20) ? colors.textSecondary : colors.backgroundWhite,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: page >= Math.ceil(total / 20) ? 'not-allowed' : 'pointer',
                  }}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
