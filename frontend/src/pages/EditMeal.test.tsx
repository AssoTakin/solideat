import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store';
import EditMeal from './EditMeal';
import { mealService } from '../services/meal.service';
import { subscriptionService } from '../services/subscription.service';
import { userService } from '../services/user.service';

// Mocker les services
vi.mock('../services/meal.service', () => ({
  mealService: {
    getMealById: vi.fn(),
    updateMeal: vi.fn(),
  },
}));

vi.mock('../services/subscription.service', () => ({
  subscriptionService: {
    getCurrentSubscription: vi.fn(),
  },
}));

vi.mock('../services/user.service', () => ({
  userService: {
    getMe: vi.fn(),
  },
}));

function renderEditMeal() {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/meals/meal-123/edit']}>
        <Routes>
          <Route path="/meals/:id/edit" element={<EditMeal />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('EditMeal - Diagnostic asynchrone', () => {
  it('affiche le formulaire après chargement des données', async () => {
    // Configurer les mocks
    vi.mocked(subscriptionService.getCurrentSubscription).mockResolvedValue({
      success: true,
      data: { active: true, type: 'PREMIUM_MONTHLY' },
    });

    vi.mocked(userService.getMe).mockResolvedValue({
      success: true,
      data: { id: '1', username: 'MarieCuisine' },
    });

    vi.mocked(mealService.getMealById).mockResolvedValue({
      success: true,
      data: {
        id: 'meal-123',
        name: 'Plat Test',
        photo: 'https://example.com/photo.jpg',
        description: 'Super bon',
        cuisine: 'Française',
        preparationDate: '2026-05-27T00:00:00.000Z',
        serviceDate: '2026-05-28T00:00:00.000Z',
        pickupTimeStart: '14:00',
        pickupTimeEnd: '16:00',
        pickupAddress: '123 Rue de la Paix, 75001 Paris',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        portions: 2,
        status: 'AVAILABLE',
        cook: { id: '1', username: 'MarieCuisine', globalRating: 5, addressCity: 'Paris' },
        ingredients: [],
        expirationDate: '2026-05-30T00:00:00.000Z',
      },
    });

    renderEditMeal();

    // Attendre la fin du chargement (le loader doit disparaître)
    await waitFor(() => {
      expect(screen.queryByText('Chargement du repas...')).not.toBeInTheDocument();
    });

    // Vérifier que le formulaire s'affiche sans crash
    expect(screen.getByText('Description du repas')).toBeInTheDocument();
    expect(screen.getByLabelText(/Date du service/i)).toBeInTheDocument();
  });
});

