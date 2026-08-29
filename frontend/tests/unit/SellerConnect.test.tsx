import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SellerConnect from '../../src/pages/SellerConnect';
vi.mock('../../src/services/api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from '../../src/services/api';

function renderPage(initialEntries = ['/connect-vendeur']) {
  // Simuler un utilisateur authentifié
  localStorage.setItem('token', 'fake-token');

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/connect-vendeur" element={<SellerConnect />} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SellerConnect Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });
  it('affiche le statut Connect non configuré et un CTA onboarding', async () => {
    vi.mocked((api as any).get).mockResolvedValueOnce({
      data: { success: true, data: { accountId: null, onboardingComplete: false } },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Devenir vendeur sur Stripe/i)).toBeInTheDocument();
    });
  });

  it('affiche le statut Connect activé et propose de créer un repas', async () => {
    vi.mocked((api as any).get).mockResolvedValueOnce({
      data: { success: true, data: { accountId: 'acct_123', onboardingComplete: true } },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Compte Stripe Connect activé/i)).toBeInTheDocument();
      expect(screen.getByText(/Proposer un repas payant/i)).toBeInTheDocument();
    });
  });

  it('lance l\'onboarding Stripe lors du clic', async () => {
    vi.mocked((api as any).get).mockResolvedValueOnce({
      data: { success: true, data: { accountId: null, onboardingComplete: false } },
    });
    vi.mocked((api as any).post).mockResolvedValueOnce({
      data: {
        success: true,
        data: { url: 'https://connect.stripe.com/setup/s/test', accountId: 'acct_123', onboardingComplete: false },
      },
    });

    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Devenir vendeur sur Stripe/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Devenir vendeur sur Stripe/i));

    await waitFor(() => {
      expect((api as any).post).toHaveBeenCalledWith('/users/me/connect-account');
      expect(windowOpen).toHaveBeenCalledWith('https://connect.stripe.com/setup/s/test', '_blank');
    });
  });
});
