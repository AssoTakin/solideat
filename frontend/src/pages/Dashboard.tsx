import { colors } from '../utils/theme';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { dashboardService, DashboardStats } from '../services/dashboard.service';
import { mealService } from '../services/meal.service';
import { reservationService } from '../services/reservation.service';
import SystemMessages from '../components/SystemMessages';
import QuotaStatusComponent from '../components/QuotaStatus';
import Navigation from '../components/Navigation';
import EnvironmentalStats from '../components/EnvironmentalStats';
import BonusDonorList from '../components/BonusDonorList';
import { USE_MOCK_DATA, mockMeals, mockReservations, mockUsers, mockDashboardStats } from '../data/mockData';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';
import {
  SettingsIcon,
  StarIcon,
  ChefHatIcon,
  HeartIcon,
  ClockIcon,
  MessageCircleIcon,
  EyeIcon,
  CalendarIcon,
  LeafIcon,
  PlusIcon,
} from '../components/Icons';

// Design System Colors EXACTES depuis UX_DESIGN.md


export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'quotas'>('overview');
  const [proposedMeals, setProposedMeals] = useState<any[]>([]);
  const [reservedMeals, setReservedMeals] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      let currentUser: any = null;

      if (USE_MOCK_DATA) {
        currentUser = mockUsers[0];
        setUser(currentUser);
        setDashboardStats(mockDashboardStats);
        const userMeals = mockMeals.filter((m) => m.cook.id === mockUsers[0].id);
        setProposedMeals(userMeals.slice(0, 5));
        setReservedMeals(mockReservations.slice(0, 5));
      } else {
        // Charger les données en parallèle
        const [userResponse, statsResponse, proposedResponse, reservationsResponse] = await Promise.all([
          api.get('/users/me'),
          dashboardService.getDashboardStats(),
          mealService.getMeals({ status: 'AVAILABLE', limit: 5 }),
          reservationService.getMyReservations(),
        ]);

        if (userResponse.data.success) {
          currentUser = userResponse.data.data;
          setUser(currentUser);
          if (currentUser?.id) {
            localStorage.setItem('userId', currentUser.id);
          }
        }

        if (statsResponse.success && statsResponse.data) {
          setDashboardStats(statsResponse.data);
        }

        if (proposedResponse.success && proposedResponse.data && currentUser) {
          const userMeals = proposedResponse.data.meals.filter((m: any) => m.cook?.id === currentUser.id);
          setProposedMeals(userMeals);
        }

        if (reservationsResponse.success && reservationsResponse.data) {
          setReservedMeals(reservationsResponse.data.slice(0, 5));
        }
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMessageRead = () => {
    loadData();
  };

  const formatDate = (date: string): string => {
    const d = new Date(date);
    const today = new Date();
    const diffTime = d.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Demain';
    if (diffDays === -1) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatTime = (date: string): string => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
        <div style={{ textAlign: 'center', color: colors.primary }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <ClockIcon size={48} color={colors.primary} />
          </div>
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
        paddingBottom: getPagePaddingBottom(true, false), // Espace pour la bottom bar
      }}
    >
      <Navigation showBottomBar={true} />

      {/* Header avec profil */}
      <div
        style={{
          backgroundColor: colors.backgroundWhite,
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.backgroundLight}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.username}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: `2px solid ${colors.primary}`,
              }}
            />
          ) : (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.backgroundWhite,
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
              Hello @{user?.username || 'Utilisateur'}
            </h1>
            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '2px 0 0 0' }}>
              Membre vérifié depuis {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
            </p>
          </div>
        </div>
        <Link
          to="/profile/edit"
          style={{
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: colors.backgroundLight,
            color: colors.textPrimary,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
          title="Paramètres"
        >
          <SettingsIcon size={20} color={colors.textPrimary} />
        </Link>
      </div>

      {/* Onglets */}
      <div
        style={{
          backgroundColor: colors.backgroundWhite,
          display: 'flex',
          gap: '0',
          borderBottom: `2px solid ${colors.backgroundLight}`,
        }}
      >
        {[
          { id: 'overview', label: 'Vue d\'ensemble' },
          { id: 'messages', label: 'Messages système' },
          { id: 'quotas', label: 'Quotas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? colors.primary : colors.textSecondary,
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? `3px solid ${colors.primary}` : '3px solid transparent',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <main style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', ...getMainContentStyle(false) }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Carte Résumé */}
            <div
              className="glass-card"
              style={{
                overflow: 'hidden',
              }}
            >
              {/* Fond de profil uni minimaliste */}
              <div
                style={{
                  height: '100px',
                  background: '#f5ece7', // Oatmeal-light
                  position: 'relative',
                  borderBottom: '1px solid #e9e1dc',
                }}
              />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
                    Votre Activité
                  </h2>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(146, 67, 46, 0.08)',
                      padding: '6px 12px',
                      borderRadius: '9999px',
                    }}
                  >
                    <StarIcon size={14} color={colors.primary} fill={colors.primary} />
                    <span style={{ color: colors.primary, fontSize: '14px', fontWeight: 'bold' }}>
                      {dashboardStats?.personal.globalRating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 'bold', color: colors.textPrimary, margin: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <ChefHatIcon size={16} color={colors.primary} style={{ marginRight: '4px' }} /> {dashboardStats?.history.mealsServed || 0} Servis
                      <span style={{ color: 'rgba(30,27,24,0.15)', margin: '0 8px' }}>|</span>
                      <HeartIcon size={16} color={colors.primary} fill={colors.primary} style={{ marginRight: '4px' }} /> {dashboardStats?.history.mealsReceived || 0} Reçus
                    </p>
                  </div>
                  <Link
                    to={`/users/${user?.id}`}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: colors.primary,
                      color: colors.backgroundWhite,
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      
                    }}
                  >
                    Mon profil
                  </Link>
                </div>
              </div>
            </div>

            {/* Statistiques environnementales (Premium uniquement) */}
            {user?.subscriptionType !== 'FREE' && <EnvironmentalStats />}

            {/* Bonus donateurs */}
            <BonusDonorList />

            {/* Section Quotas (simplifiée) */}
            {dashboardStats && (
              <div
                className="glass-card"
                style={{
                  padding: '24px 20px',
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: colors.textPrimary, marginBottom: '20px', letterSpacing: '0.05em' }}>
                  ⚡ STATUT DE VOS QUOTAS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: colors.textSecondary }}>Repas réservés (hebdomadaire)</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: colors.textPrimary }}>
                        {dashboardStats.quotas.weekly.reservations.current} / {dashboardStats.quotas.weekly.reservations.limit}
                      </span>
                    </div>
                    <div
                      style={{
                        height: '10px',
                        backgroundColor: '#e9e1dc', // Oatmeal-light
                        borderRadius: '9999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: colors.primary, // Terracotta
                          width: `${Math.min(
                            (dashboardStats.quotas.weekly.reservations.current / dashboardStats.quotas.weekly.reservations.limit) * 100,
                            100
                          )}%`,
                          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: colors.textSecondary }}>Repas proposés (hebdomadaire)</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: colors.textPrimary }}>
                        {dashboardStats.quotas.weekly.proposals.current} / {dashboardStats.quotas.weekly.proposals.limit}
                      </span>
                    </div>
                    <div
                      style={{
                        height: '10px',
                        backgroundColor: '#e9e1dc', // Oatmeal-light
                        borderRadius: '9999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: colors.sosAccent, // Sage
                          width: `${Math.min(
                            (dashboardStats.quotas.weekly.proposals.current / dashboardStats.quotas.weekly.proposals.limit) * 100,
                            100
                          )}%`,
                          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Repas en cours */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '16px' }}>
                REPAS EN COURS
              </h3>

              {/* Repas proposés */}
              <div style={{ marginBottom: '16px' }}>
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  PROPOSÉS
                </p>
                {proposedMeals.length === 0 ? (
                  <div
                    style={{
                      border: `2px dashed ${colors.backgroundLight}`,
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      backgroundColor: `${colors.backgroundWhite}80`,
                    }}
                  >
                    <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '12px' }}>
                      Vous n'avez rien partagé aujourd'hui
                    </p>
                    <Link
                      to="/meals/new"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        backgroundColor: colors.primary,
                        color: colors.backgroundWhite,
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }}
                    >
                      <PlusIcon size={16} color={colors.backgroundWhite} /> Ajouter un repas
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {proposedMeals.map((meal) => (
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
                            display: 'flex',
                            gap: '12px',
                          }}
                        >
                          <img
                            src={meal.photo || '/placeholder-meal.jpg'}
                            alt={meal.name}
                            style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 4px 0' }}>
                              {meal.name}
                            </p>
                            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: 0 }}>
                              {formatDate(meal.serviceDate)} • {formatTime(meal.pickupTimeStart)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Repas réservés */}
              <div>
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  RÉSERVÉS
                </p>
                {reservedMeals.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: colors.backgroundWhite,
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <p style={{ fontSize: '14px', color: colors.textSecondary }}>Aucune réservation en cours</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reservedMeals.map((reservation: any) => (
                      <div
                        key={reservation.id}
                        style={{
                          backgroundColor: colors.backgroundWhite,
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <img
                            src={reservation.meal?.photo || '/placeholder-meal.jpg'}
                            alt={reservation.meal?.name}
                            style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 4px 0' }}>
                              {reservation.meal?.name}
                            </p>
                            <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '0 0 8px 0' }}>
                              Chef : {reservation.meal?.cook?.username} • {reservation.meal?.distance?.toFixed(1) || 'N/A'} km
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.primary }}>
                              <ClockIcon size={14} color={colors.primary} />
                              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                Récupération : {formatTime(reservation.meal?.pickupTimeStart)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <Link
                            to={`/messages/${reservation.mealId}`}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              padding: '8px',
                              backgroundColor: colors.backgroundLight,
                              color: colors.textPrimary,
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            <MessageCircleIcon size={14} color={colors.textPrimary} /> Message
                          </Link>
                          <Link
                            to={`/meals/${reservation.mealId}`}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              padding: '8px',
                              backgroundColor: colors.backgroundLight,
                              color: colors.textPrimary,
                              textDecoration: 'none',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            <EyeIcon size={14} color={colors.textPrimary} /> Voir
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                to="/reservations"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  border: `2px solid ${colors.primary}`,
                  color: colors.primary,
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                <CalendarIcon size={14} color={colors.primary} /> Voir l'historique
              </Link>
              <Link
                to="/anti-gaspi"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '16px',
                  backgroundColor: colors.sosAccent,
                  color: colors.backgroundWhite,
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 12px ${colors.sosAccent}40`,
                }}
              >
                <LeafIcon size={16} color={colors.backgroundWhite} /> ANTI-GASPI (FINIT BIENTÔT)
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'messages' && <SystemMessages onMessageRead={handleMessageRead} />}

        {activeTab === 'quotas' && <QuotaStatusComponent />}
      </main>
    </div>
  );
}
