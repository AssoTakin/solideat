import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService } from '../services/user.service';
import Navigation from '../components/Navigation';

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
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  culinaryStyle: z.string().max(200, 'L\'orientation culinaire ne peut pas dépasser 200 caractères').optional(),
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
  const [hidePhoneNumber, setHidePhoneNumber] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
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
        });
        addressForm.reset({
          addressStreet: response.data.addressStreet || '',
          addressZipCode: response.data.addressZipCode || '',
          addressCity: response.data.addressCity || '',
        });
        setHidePhoneNumber(response.data.hidePhoneNumber || false);
      }
    } catch (err: any) {
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
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

  const onPrivacyChange = async (value: boolean) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await userService.updatePrivacy(value);
      if (response.success) {
        setSuccess('Paramètres de confidentialité mis à jour');
        setHidePhoneNumber(value);
      } else {
        setError(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
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
    <div style={{ minHeight: '100vh', backgroundColor: colors.backgroundLight }}>
      <Navigation />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
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
          <div style={{ backgroundColor: colors.backgroundWhite, padding: '24px', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Confidentialité</h2>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!hidePhoneNumber}
                  onChange={(e) => onPrivacyChange(!e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <span>Autoriser l'affichage de mon numéro de téléphone lors des réservations</span>
              </label>
              <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '8px', marginLeft: '32px' }}>
                Par défaut, votre numéro de téléphone est visible pour les personnes qui réservent vos repas. Vous pouvez
                le masquer si vous préférez.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
