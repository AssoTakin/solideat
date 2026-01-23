import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { USE_MOCK_DATA, mockNotifications, mockUsers } from '../data/mockData';

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

interface NavigationProps {
  showBottomBar?: boolean;
}

export default function Navigation({ showBottomBar = true }: NavigationProps) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, [location]);

  const checkAuth = async () => {
    try {
      if (USE_MOCK_DATA) {
        setIsAuthenticated(true);
        setUser(mockUsers[0]);
        const unread = mockNotifications.filter((n) => !n.read).length;
        setUnreadNotifications(unread);
        return;
      }
      const token = localStorage.getItem('token');
      if (token) {
        const userResponse = await api.get('/users/me');
        if (userResponse.data.success) {
          setIsAuthenticated(true);
          setUser(userResponse.data.data);
          loadNotifications();
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadNotifications = async () => {
    try {
      if (USE_MOCK_DATA) {
        const unread = mockNotifications.filter((n) => !n.read).length;
        setUnreadNotifications(unread);
        return;
      }
      const response = await api.get('/notifications?read=false');
      if (response.data.success && response.data.data) {
        setUnreadNotifications(response.data.data.length || 0);
      }
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Top Header */}
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
          zIndex: 100,
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
            to="/save-them"
            style={{
              textDecoration: 'none',
              color: colors.textPrimary,
              fontSize: '20px',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: isActive('/save-them') ? `${colors.sosAccent}20` : 'transparent',
            }}
            title="Sauvez-les"
          >
            🆘
          </Link>
          <Link
            to="/notifications"
            style={{
              textDecoration: 'none',
              color: colors.textPrimary,
              fontSize: '20px',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: isActive('/notifications') ? `${colors.primary}20` : 'transparent',
            }}
          >
            🔔
            {unreadNotifications > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  borderRadius: '50%',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  border: `2px solid ${colors.backgroundWhite}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Link>
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              color: colors.textPrimary,
              fontSize: '20px',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive('/dashboard') ? `${colors.primary}20` : 'transparent',
            }}
            title={user?.username || 'Profil'}
          >
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.username}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: `2px solid ${isActive('/dashboard') ? colors.primary : colors.backgroundLight}`,
                }}
              />
            ) : (
              '👤'
            )}
          </Link>
        </nav>
      </header>

      {/* Bottom Navigation Bar (Mobile) */}
      {showBottomBar && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: `${colors.backgroundWhite}E6`,
            backdropFilter: 'blur(12px)',
            borderTop: `1px solid ${colors.backgroundLight}`,
            padding: '8px 0',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 100,
            boxShadow: '0 -2px 12px rgba(0,0,0,0.1)',
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              borderRadius: '12px',
              color: isActive('/') ? colors.primary : colors.textSecondary,
              backgroundColor: isActive('/') ? `${colors.primary}10` : 'transparent',
            }}
          >
            <span style={{ fontSize: '24px' }}>🏠</span>
            <span style={{ fontSize: '10px', fontWeight: isActive('/') ? 'bold' : 'normal' }}>Accueil</span>
          </Link>
          <Link
            to="/save-them"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              borderRadius: '12px',
              color: isActive('/save-them') ? colors.sosAccent : colors.textSecondary,
              backgroundColor: isActive('/save-them') ? `${colors.sosAccent}10` : 'transparent',
            }}
          >
            <span style={{ fontSize: '24px' }}>🆘</span>
            <span style={{ fontSize: '10px', fontWeight: isActive('/save-them') ? 'bold' : 'normal' }}>Sauvez-les</span>
          </Link>
          <Link
            to="/meals/new"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              borderRadius: '12px',
              color: isActive('/meals/new') ? colors.primary : colors.textSecondary,
              backgroundColor: isActive('/meals/new') ? `${colors.primary}10` : 'transparent',
            }}
          >
            <span style={{ fontSize: '24px' }}>➕</span>
            <span style={{ fontSize: '10px', fontWeight: isActive('/meals/new') ? 'bold' : 'normal' }}>Proposer</span>
          </Link>
          <Link
            to="/messages"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              borderRadius: '12px',
              color: isActive('/messages') ? colors.primary : colors.textSecondary,
              backgroundColor: isActive('/messages') ? `${colors.primary}10` : 'transparent',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '24px' }}>💬</span>
            <span style={{ fontSize: '10px', fontWeight: isActive('/messages') ? 'bold' : 'normal' }}>Messages</span>
          </Link>
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              borderRadius: '12px',
              color: isActive('/dashboard') ? colors.primary : colors.textSecondary,
              backgroundColor: isActive('/dashboard') ? `${colors.primary}10` : 'transparent',
            }}
          >
            <span style={{ fontSize: '24px' }}>👤</span>
            <span style={{ fontSize: '10px', fontWeight: isActive('/dashboard') ? 'bold' : 'normal' }}>Profil</span>
          </Link>
        </nav>
      )}
    </>
  );
}
