import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PushSettings from '../../src/pages/PushSettings';

vi.mock('../../src/services/api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  subscribeToPushNotifications: vi.fn(),
  unsubscribeFromPushNotifications: vi.fn(),
}));

import api, { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '../../src/services/api';

const mockPushManager = {
  getSubscription: vi.fn(),
};

const mockRegistration = {
  pushManager: mockPushManager,
};

function renderPage() {
  localStorage.setItem('token', 'fake-token');
  return render(
    <MemoryRouter initialEntries={['/push-settings']}>
      <Routes>
        <Route path="/push-settings" element={<PushSettings />} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PushSettings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked((api as any).get).mockResolvedValue({
      data: { success: true, data: { publicKey: 'BMeZZJ0cA873iWSmR-k5Z9p3BxQi3PymBe9NsR1WNaM3UnhzeZ-J0v67a4oPcJpXzcXh_OcMHtgEGdSK9jNAido' } },
    });
    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: Promise.resolve(mockRegistration),
      },
    });
    vi.stubGlobal('PushManager', {});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('affiche la clé VAPID et permet l\'activation', async () => {
    mockPushManager.getSubscription.mockResolvedValue(null);
    vi.mocked(subscribeToPushNotifications).mockResolvedValue({
      endpoint: 'https://fcm.googleapis.com/fcm/send/test',
      toJSON: () => ({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: { p256dh: 'key256', auth: 'authKey' },
      }),
    } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Activer les notifications push/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Activer les notifications push/i }));

    await waitFor(() => {
      expect(subscribeToPushNotifications).toHaveBeenCalled();
      expect((api as any).post).toHaveBeenCalledWith('/push/subscribe', expect.any(Object));
    });
  });

  it('affiche le bouton de désactivation si déjà abonné', async () => {
    mockPushManager.getSubscription.mockResolvedValue({ endpoint: 'https://fcm...' } as any);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Désactiver les notifications push/i })).toBeInTheDocument();
    });
  });
});
