import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PremiumDashboard from '../../src/pages/PremiumDashboard';

vi.mock('../../src/services/api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
  },
}));

import api from '../../src/services/api';

function renderPage() {
  localStorage.setItem('token', 'fake-token');
  return render(
    <MemoryRouter initialEntries={['/premium']}>
      <Routes>
        <Route path="/premium" element={<PremiumDashboard />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PremiumDashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('affiche les badges et les bonus', async () => {
    vi.mocked((api as any).get).mockImplementation((url: string) => {
      if (url === '/badges') {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: 'ub-1',
                earnedAt: new Date().toISOString(),
                badge: {
                  name: 'badge-x',
                  description: 'Badge X',
                  icon: '⭐',
                  condition: '10 repas servis',
                  premiumOnly: false,
                },
              },
            ],
          },
        });
      }
      if (url === '/bonus-donors') {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 'b-1', amount: 5, reason: 'Donateur actif', expiresAt: null, isTransferred: false, createdAt: new Date().toISOString() },
            ],
          },
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Badge X')).toBeInTheDocument();
    });
    expect(screen.getByText('5.00 €')).toBeInTheDocument();
  });

  it('affiche un message si aucune donnée premium', async () => {
    vi.mocked((api as any).get).mockResolvedValue({ data: { success: true, data: [] } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Aucun badge encore/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Aucun bonus donateur actif/i)).toBeInTheDocument();
  });
});
