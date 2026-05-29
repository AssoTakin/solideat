import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService } from '../services/user.service';
import Navigation from '../components/Navigation';
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

const profileSchema = z.object({
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional().or(z.literal('')),
  culinaryStyle: z.string().max(200, 'L\'orientation culinaire ne peut pas dépasser 200 caractères').optional().or(z.literal('')),
  profilePhoto: z.string().optional().nullable().or(z.literal('')),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'L\'ancien mot de passe est requis'),
    newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(8, 'La confirmation est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

const addressSchema = z.object({
  addressStreet: z.string().min(1, 'La rue est requise'),
  addressZipCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  addressCity: z.string().min(1, 'La ville est requise'),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

export default function EditProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'address' | 'privacy'>('profile');
  const [hidePhoneNumber, setHidePhoneNumber] = useState(true);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [blurAddress, setBlurAddress] = useState(false);
  const [hideActivityHistory, setHideActivityHistory] = useState(false);
  const [privacySaving, setPrivacySaving] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      description: '',
      culinaryStyle: '',
      profilePhoto: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await userService.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        profileForm.reset({
          description: response.data.description || '',
          culinaryStyle: response.data.culinaryStyle || '',
          profilePhoto: response.data.profilePhoto || '',
        });
        setPhotoPreview(response.data.profilePhoto || null);
        addressForm.reset({
          addressStreet: response.data.addressStreet || '',
          addressZipCode: response.data.addressZipCode || '',
          addressCity: response.data.addressCity || '',
        });
        setHidePhoneNumber(response.data.hidePhoneNumber !== undefined ? response.data.hidePhoneNumber : true);
        setIncognitoMode(response.data.incognitoMode ?? false);
        setBlurAddress(response.data.blurAddress ?? false);
        setHideActivityHistory(response.data.hideActivityHistory ?? false);
      }
    } catch (err: any) {
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        profileForm.setValue('profilePhoto', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await userService.updateProfile(data);
      if (response.success) {
        setSuccess('Profil mis à jour avec succès');
        setUser(response.data);
      } else {
        setError(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await userService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      if (response.success) {
        setSuccess('Mot de passe modifié avec succès');
        passwordForm.reset();
      } else {
        setError(response.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
    }
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await userService.changeAddress(data);
      if (response.success) {
        setSuccess('Adresse mise à jour avec succès');
        setUser(response.data);
      } else {
        setError(response.error || 'Erreur lors du changement d\'adresse');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du changement d\'adresse');
    }
  };

  const onPrivacyChange = async (
    key: 'hidePhoneNumber' | 'incognitoMode' | 'blurAddress' | 'hideActivityHistory',
    value: boolean
  ) => {
    setError(null);
    setSuccess(null);
    setPrivacySaving(key);

    try {
      const response = await userService.updatePrivacy({ [key]: value });
      if (response.success) {
        if (key === 'hidePhoneNumber') setHidePhoneNumber(value);
        if (key === 'incognitoMode') setIncognitoMode(value);
        if (key === 'blurAddress') setBlurAddress(value);
        if (key === 'hideActivityHistory') setHideActivityHistory(value);
        setSuccess('Paramètre mis à jour ✓');
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setPrivacySaving(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.backgroundLight }}>
        <Navigation />
        <div style={{ padding: '32px', textAlign: 'center' }}>Chargement...</div>
      </div>
    );
  }

  const isPremium = user?.subscriptionType && user.subscriptionType !== 'FREE';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.backgroundLight,
        paddingBottom: getPagePaddingBottom(true, false),
      }}
    >
      <Navigation showBottomBar={true} />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px', ...getMainContentStyle(false) }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '24px' }}>
          Modifier mon profil
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: `2px solid ${colors.backgroundLight}` }}>
          {['profile', 'password', 'address', ...(isPremium ? ['privacy'] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                color: activeTab === tab ? colors.backgroundWhite : colors.textPrimary,
                border: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
              }}
            >
              {tab === 'profile' && 'Profil'}
              {tab === 'password' && 'Mot de passe'}
              {tab === 'address' && 'Adresse'}
              {tab === 'privacy' && 'Confidentialité'}
            </button>
          ))}
        </div>

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
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: '#E8F5E9',
              color: colors.success,
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {success}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <div style={{ backgroundColor: colors.backgroundWhite, padding: '24px', borderRadius: '8px' }}>
              {/* Photo de profil */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', borderBottom: `1px solid ${colors.backgroundLight}`, paddingBottom: '24px' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${colors.primary}30`, backgroundColor: colors.backgroundLight, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Aperçu avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: colors.textSecondary }}>
                      👤
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <label
                    style={{
                      padding: '8px 16px',
                      backgroundColor: colors.primary,
                      color: colors.backgroundWhite,
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: `0 2px 8px ${colors.primary}30`,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    Choisir une photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        profileForm.setValue('profilePhoto', '', { shouldValidate: true });
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        color: colors.error,
                        border: `1px solid ${colors.error}`,
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <input type="hidden" {...profileForm.register('profilePhoto')} />
                {profileForm.formState.errors.profilePhoto && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '8px' }}>
                    {profileForm.formState.errors.profilePhoto.message}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Description personnelle (max 500 caractères)
                </label>
                <textarea
                  {...profileForm.register('description')}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '14px',
                  }}
                />
                {profileForm.formState.errors.description && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                    {profileForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Orientation culinaire (max 200 caractères)
                </label>
                <input
                  type="text"
                  {...profileForm.register('culinaryStyle')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '14px',
                  }}
                />
                {profileForm.formState.errors.culinaryStyle && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                    {profileForm.formState.errors.culinaryStyle.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Enregistrer
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <div style={{ backgroundColor: colors.backgroundWhite, padding: '24px', borderRadius: '8px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Ancien mot de passe</label>
                <input
                  type="password"
                  {...passwordForm.register('oldPassword')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                  }}
                />
                {passwordForm.formState.errors.oldPassword && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                    {passwordForm.formState.errors.oldPassword.message}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nouveau mot de passe</label>
                <input
                  type="password"
                  {...passwordForm.register('newPassword')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                  }}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  {...passwordForm.register('confirmPassword')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                  }}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Changer le mot de passe
              </button>
            </div>
          </form>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <form onSubmit={addressForm.handleSubmit(onAddressSubmit)}>
            <div style={{ backgroundColor: colors.backgroundWhite, padding: '24px', borderRadius: '8px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Rue</label>
                <input
                  type="text"
                  {...addressForm.register('addressStreet')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                  }}
                />
                {addressForm.formState.errors.addressStreet && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                    {addressForm.formState.errors.addressStreet.message}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Code postal</label>
                <input
                  type="text"
                  {...addressForm.register('addressZipCode')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                  }}
                />
                {addressForm.formState.errors.addressZipCode && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                    {addressForm.formState.errors.addressZipCode.message}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Ville</label>
                <input
                  type="text"
                  {...addressForm.register('addressCity')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                  }}
                />
                {addressForm.formState.errors.addressCity && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                    {addressForm.formState.errors.addressCity.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Changer l'adresse
              </button>
            </div>
          </form>
        )}

        {/* Privacy Tab (Premium only) */}
        {activeTab === 'privacy' && isPremium && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: `linear-gradient(135deg, ${colors.premium}15, ${colors.primary}08)`,
              borderRadius: '12px',
              padding: '16px 20px',
              border: `1px solid ${colors.premium}30`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🛡️</span>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
                  Confidentialité Premium
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '8px 0 0 0' }}>
                Contrôlez finement votre visibilité et protégez votre vie privée sur la plateforme.
              </p>
            </div>

            {/* Toggle Card: Numéro de téléphone */}
            {[{
              key: 'hidePhoneNumber' as const,
              icon: '📱',
              title: 'Numéro de téléphone masqué',
              description: 'Votre numéro est masqué par défaut. Désactivez pour l\'afficher lors des réservations. La messagerie intégrée reste disponible.',
              checked: hidePhoneNumber,
            }, {
              key: 'incognitoMode' as const,
              icon: '🕵️',
              title: 'Mode Incognito',
              description: 'Naviguez anonymement : vos visites sur les profils et les repas ne seront pas enregistrées ni visibles par les autres membres.',
              checked: incognitoMode,
            }, {
              key: 'blurAddress' as const,
              icon: '📍',
              title: 'Floutage d\'adresse',
              description: 'Votre adresse exacte est remplacée par un rayon approximatif (~500m) tant que la réservation n\'est pas confirmée.',
              checked: blurAddress,
            }, {
              key: 'hideActivityHistory' as const,
              icon: '👤',
              title: 'Profil d\'activité masqué',
              description: 'Masquez votre historique public (repas servis, reçus, badges) aux membres gratuits uniquement. Les autres membres Premium continueront de voir votre activité.',
              checked: hideActivityHistory,
            }].map((item) => (
              <div
                key={item.key}
                style={{
                  backgroundColor: colors.backgroundWhite,
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${item.checked ? colors.premium + '40' : '#E8E8E8'}`,
                  transition: 'all 0.25s ease',
                  boxShadow: item.checked ? `0 2px 12px ${colors.premium}15` : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span style={{
                      fontSize: '24px',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      backgroundColor: item.checked ? colors.premium + '15' : colors.backgroundLight,
                      transition: 'background-color 0.25s ease',
                      flexShrink: 0,
                    }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: colors.textPrimary }}>
                        {item.title}
                      </div>
                      <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '4px 0 0 0', lineHeight: '1.4' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => onPrivacyChange(item.key, !item.checked)}
                    disabled={privacySaving === item.key}
                    aria-label={`Activer/désactiver ${item.title}`}
                    style={{
                      width: '52px',
                      height: '28px',
                      borderRadius: '14px',
                      border: 'none',
                      cursor: privacySaving === item.key ? 'wait' : 'pointer',
                      backgroundColor: item.checked ? colors.premium : '#D1D5DB',
                      position: 'relative',
                      transition: 'background-color 0.3s ease',
                      flexShrink: 0,
                      marginLeft: '16px',
                      opacity: privacySaving === item.key ? 0.6 : 1,
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: item.checked ? '26px' : '2px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'left 0.3s ease',
                    }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
