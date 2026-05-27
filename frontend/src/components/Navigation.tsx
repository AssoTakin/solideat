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
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      if (USE_MOCK_DATA) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        window.location.href = '/login';
        return;
      }
      const { authService } = await import('../services/auth.service');
      await authService.logout();
      window.location.href = '/login';
    } catch (err) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

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
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: showDropdown || isActive('/dashboard') ? `${colors.primary}20` : 'transparent',
                outline: 'none',
              }}
              title={user?.username || 'Menu Profil'}
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
                <span style={{ fontSize: '20px' }}>👤</span>
              )}
            </button>

            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  backgroundColor: colors.backgroundWhite,
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: `1px solid ${colors.backgroundLight}`,
                  padding: '8px 0',
                  minWidth: '220px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Infos utilisateur */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.backgroundLight}`, marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: colors.textPrimary, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @{user?.username || 'Utilisateur'}
                  </p>
                  <p style={{ margin: '2px 0 0 0', color: colors.textSecondary, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        color: colors.textSecondary,
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {`🤝 Membre depuis ${user?.createdAt ? new Date(user.createdAt).getFullYear() : '2025'}`}
                    </span>
                  </div>
                </div>

                {/* Liens du menu */}
                <Link
                  to="/dashboard"
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    color: colors.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.backgroundLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  📊 Tableau de bord
                </Link>
                <Link
                  to={`/users/${user?.id || 'me'}`}
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    color: colors.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.backgroundLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  👤 Mon profil public
                </Link>
                <Link
                  to="/profile/edit"
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    color: colors.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.backgroundLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  ⚙️ Modifier mon profil
                </Link>
                <Link
                  to="/subscriptions/plans"
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    color: colors.premium,
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.backgroundLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  👑 Formules & Abonnements
                </Link>
                <Link
                  to="/help"
                  onClick={() => setShowDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    color: colors.textPrimary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.backgroundLight)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  ❓ Aide & FAQ
                </Link>
                <div style={{ height: '1px', backgroundColor: colors.backgroundLight, margin: '4px 0' }} />
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    color: colors.error,
                    border: 'none',
                    backgroundColor: 'transparent',
                    width: '100%',
                    textAlign: 'left',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  🚪 Se déconnecter
                </button>
              </div>
            )}
          </div>
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
