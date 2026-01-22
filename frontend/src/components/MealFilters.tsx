import { useState, useEffect } from 'react';
import api from '../services/api';

export interface MealFilters {
  maxDistance?: number;
  date?: string;
  hour?: string;
  cuisine?: string;
  portions?: number;
  // Filtres avancés (premium)
  minRating?: number;
  preparationDate?: string;
  // Tri
  sortBy?: 'distance' | 'date' | 'rating' | 'expiration';
  sortOrder?: 'asc' | 'desc';
}

interface MealFiltersProps {
  filters: MealFilters;
  onFiltersChange: (filters: MealFilters) => void;
}

export default function MealFiltersComponent({ filters, onFiltersChange }: MealFiltersProps) {
  const [localFilters, setLocalFilters] = useState<MealFilters>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Charger les infos utilisateur pour vérifier si premium
    api
      .get('/users/me')
      .then((response) => {
        if (response.data.success) {
          setUser(response.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof MealFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: MealFilters = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const isUserPremium = user?.subscriptionType && user.subscriptionType !== 'FREE';

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Filtres de recherche</h3>
        <button
          onClick={handleReset}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Réinitialiser
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Distance maximale */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>
            Distance max (km)
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={localFilters.maxDistance || ''}
            onChange={(e) => handleFilterChange('maxDistance', e.target.value ? Number(e.target.value) : undefined)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="50"
          />
        </div>

        {/* Date */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>
            Date
          </label>
          <input
            type="date"
            value={localFilters.date || ''}
            onChange={(e) => handleFilterChange('date', e.target.value || undefined)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        {/* Heure */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>
            Heure
          </label>
          <input
            type="time"
            value={localFilters.hour || ''}
            onChange={(e) => handleFilterChange('hour', e.target.value || undefined)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        {/* Cuisine */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>
            Style culinaire
          </label>
          <input
            type="text"
            value={localFilters.cuisine || ''}
            onChange={(e) => handleFilterChange('cuisine', e.target.value || undefined)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Français, Italien..."
          />
        </div>

        {/* Parts */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>
            Nombre de parts
          </label>
          <input
            type="number"
            min="1"
            value={localFilters.portions || ''}
            onChange={(e) => handleFilterChange('portions', e.target.value ? Number(e.target.value) : undefined)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="1"
          />
        </div>

        {/* Tri */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>
            Trier par
          </label>
          <select
            value={localFilters.sortBy || 'distance'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="distance">Distance</option>
            <option value="date">Date</option>
            <option value="rating">Note</option>
            <option value="expiration">Expiration</option>
          </select>
        </div>

        {/* Ordre de tri */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>
            Ordre
          </label>
          <select
            value={localFilters.sortOrder || 'asc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value as any)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </div>
      </div>

      {/* Filtres avancés (premium) */}
      {isUserPremium && (
        <div style={{ marginTop: '1.5rem' }}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {showAdvanced ? 'Masquer' : 'Afficher'} les filtres avancés (Premium)
          </button>

          {showAdvanced && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {/* Note minimale */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>
                  Note minimale
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={localFilters.minRating || ''}
                  onChange={(e) => handleFilterChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="0"
                />
              </div>

              {/* Date de préparation */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'bold' }}>
                  Date de préparation
                </label>
                <input
                  type="date"
                  value={localFilters.preparationDate || ''}
                  onChange={(e) => handleFilterChange('preparationDate', e.target.value || undefined)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {!isUserPremium && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            💎 Passez à <strong>Premium</strong> pour accéder aux filtres avancés (note minimale, date de préparation)
          </p>
        </div>
      )}
    </div>
  );
}
