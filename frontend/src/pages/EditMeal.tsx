import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navigation from '../components/Navigation';
import { mealService, Meal } from '../services/meal.service';
import { subscriptionService } from '../services/subscription.service';
import { addressService, AddressSuggestion } from '../services/address.service';
import { getPagePaddingBottom, getMainContentStyle } from '../utils/layout';
import { USE_MOCK_DATA, mockUsers } from '../data/mockData';

// Design System Colors
const colors = {
  primary: '#FF6B35',
  primaryHover: '#FF8C5A',
  primaryActive: '#E55A2B',
  success: '#2ECC71',
  error: '#E74C3C',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  backgroundLight: '#ECF0F1',
  backgroundWhite: '#FFFFFF',
  premium: '#9B59B6',
};

// Schéma de validation pour l'édition
const editMealSchema = z.object({
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional().or(z.literal('')),
  cuisine: z.string().min(1, 'Le type de cuisine est requis'),
  serviceDate: z.string().min(1, 'Le jour de service est requis'),
  pickupTimeType: z.enum(['fixed', 'range'], { required_error: 'Sélectionnez un type d\'heure' }),
  pickupTimeStart: z.string().min(1, 'L\'heure de début est requise'),
  pickupTimeEnd: z.string().optional(),
  portions: z.coerce.number().min(1, 'Le nombre de parts doit être au moins 1').max(4, 'Le nombre de parts ne peut pas dépasser 4'),
  pickupAddress: z.string().min(1, 'L\'adresse de récupération est requise'),
  pickupLatitude: z.number(),
  pickupLongitude: z.number(),
  sellMeal: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.pickupTimeType === 'range' && !data.pickupTimeEnd) {
      return false;
    }
    return true;
  },
  {
    message: 'L\'heure de fin est requise pour une plage horaire',
    path: ['pickupTimeEnd'],
  }
);

type EditMealFormData = z.infer<typeof editMealSchema>;

export default function EditMeal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [meal, setMeal] = useState<Meal | null>(null);

  // States pour l'autocomplétion d'adresses et la carte
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  const form = useForm<EditMealFormData>({
    resolver: zodResolver(editMealSchema),
    defaultValues: {
      pickupTimeType: 'fixed',
      portions: 1,
      sellMeal: false,
    },
  });

  const pickupTimeType = form.watch('pickupTimeType');
  const pickupAddress = form.watch('pickupAddress');

  const currentUserId = USE_MOCK_DATA ? mockUsers[0].id : localStorage.getItem('userId') || '';
  const isPremium = userSubscription?.active && (userSubscription?.type === 'PREMIUM' || userSubscription?.type?.startsWith('PREMIUM'));

  useEffect(() => {
    loadData();
  }, [id]);

  // Formateur d'heures de récupération au format HH:MM requis par les inputs
  const formatToTimeInput = (timeStr: string | undefined): string => {
    if (!timeStr) return '';
    // Format direct HH:MM
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
      return timeStr.substring(0, 5);
    }
    // Format Date ISO
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    } catch (e) {
      console.warn('Erreur lors du formatage de l\'heure :', e);
    }
    return timeStr;
  };

  // Debounce pour l'autocomplétion d'adresse
  useEffect(() => {
    if (!pickupAddress || pickupAddress.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Si l'adresse correspond exactement à celle déjà dans le formulaire, ne pas relancer
    const isExactMatch = suggestions.some((s) => s.label === pickupAddress) || (meal && meal.pickupAddress === pickupAddress);
    if (isExactMatch) return;

    const timer = setTimeout(async () => {
      setAddressLoading(true);
      try {
        const res = await addressService.searchAddresses(pickupAddress);
        setSuggestions(res);
        setShowSuggestions(res.length > 0);
      } catch (err) {
        console.error('Erreur lors de la recherche d\'adresse :', err);
      } finally {
        setAddressLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [pickupAddress, meal]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Charger l'abonnement
      const subResponse = await subscriptionService.getCurrentSubscription();
      if (subResponse.success && subResponse.data) {
        setUserSubscription(subResponse.data);
      }

      // 2. Charger le repas
      const mealResponse = await mealService.getMealById(id);
      if (mealResponse.success && mealResponse.data) {
        const mealData = mealResponse.data;
        
        // Vérifier les permissions
        if (mealData.cook.id !== currentUserId) {
          setError('Vous n\'êtes pas autorisé à modifier ce repas.');
          setLoading(false);
          return;
        }

        if (mealData.status !== 'AVAILABLE') {
          setError('Seuls les repas disponibles peuvent être modifiés.');
          setLoading(false);
          return;
        }

        setMeal(mealData);
        const lat = typeof mealData.pickupLatitude === 'number' ? mealData.pickupLatitude : 48.8566;
        const lng = typeof mealData.pickupLongitude === 'number' ? mealData.pickupLongitude : 2.3522;
        setMapCoords({ lat, lng });

        // Préremplir le formulaire
        // Formatage sécurisé de la date en YYYY-MM-DD
        let sDate = '';
        if (mealData.serviceDate) {
          try {
            const dateObj = new Date(mealData.serviceDate);
            if (!isNaN(dateObj.getTime())) {
              sDate = dateObj.toISOString().split('T')[0];
            } else if (typeof mealData.serviceDate === 'string') {
              sDate = mealData.serviceDate.split('T')[0] || '';
            }
          } catch (e) {
            if (typeof mealData.serviceDate === 'string') {
              sDate = mealData.serviceDate.split('T')[0] || '';
            }
          }
        }
        
        // Déterminer s'il s'agit d'une plage horaire ou d'une heure fixe
        const formattedStart = formatToTimeInput(mealData.pickupTimeStart);
        const formattedEnd = formatToTimeInput(mealData.pickupTimeEnd);
        const hasTimeEnd = formattedEnd && formattedEnd !== formattedStart;
        const timeType = hasTimeEnd ? 'range' : 'fixed';

        form.reset({
          description: mealData.description || '',
          cuisine: mealData.cuisine || '',
          serviceDate: sDate,
          pickupTimeType: timeType,
          pickupTimeStart: formattedStart,
          pickupTimeEnd: formattedEnd || '',
          portions: mealData.portions,
          pickupAddress: mealData.pickupAddress,
          pickupLatitude: lat,
          pickupLongitude: lng,
          sellMeal: mealData.price ? mealData.price > 0 : false,
        });

      } else {
        setError(mealResponse.error || 'Erreur lors du chargement du repas');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du chargement du repas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    form.setValue('pickupAddress', suggestion.label, { shouldValidate: true });
    form.setValue('pickupLatitude', suggestion.latitude, { shouldValidate: true });
    form.setValue('pickupLongitude', suggestion.longitude, { shouldValidate: true });
    setMapCoords({ lat: suggestion.latitude, lng: suggestion.longitude });
    setShowSuggestions(false);
  };

  const onSubmit = async (values: EditMealFormData) => {
    if (!id || !meal) return;
    setSaving(true);
    setError(null);

    // Si plage horaire mais heure de fin non spécifiée, retourner une erreur
    if (values.pickupTimeType === 'range' && !values.pickupTimeEnd) {
      form.setError('pickupTimeEnd', { type: 'manual', message: 'L\'heure de fin est requise' });
      setSaving(false);
      return;
    }

    try {
      // Gérer le prix : si premium et case "Vendre ce repas" cochée, prix fixe à 5€
      let priceValue: number | null = null;
      if (isPremium && values.sellMeal) {
        priceValue = 5;
      }

      // Préparation de l'objet de modification
      const updateData: any = {
        description: values.description,
        cuisine: values.cuisine,
        serviceDate: values.serviceDate,
        pickupTimeStart: values.pickupTimeStart,
        pickupTimeEnd: values.pickupTimeType === 'range' ? values.pickupTimeEnd : values.pickupTimeStart,
        pickupAddress: values.pickupAddress,
        pickupLatitude: values.pickupLatitude,
        pickupLongitude: values.pickupLongitude,
        portions: values.portions,
        price: priceValue,
      };

      const response = await mealService.updateMeal(id, updateData);
      if (response.success) {
        alert('Votre repas a été modifié avec succès !');
        navigate(`/meals/${id}`);
      } else {
        setError(response.error || 'Erreur lors de l\'enregistrement des modifications');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement des modifications');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: colors.backgroundLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: colors.textPrimary }}>Chargement du repas...</p>
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
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: getPagePaddingBottom(true, false),
      }}
    >
      <Navigation showBottomBar={true} />

      {/* Header */}
      <div
        style={{
          backgroundColor: colors.backgroundWhite,
          padding: '16px',
          borderBottom: `1px solid ${colors.backgroundLight}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={() => navigate(`/meals/${id}`)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: colors.textPrimary,
            padding: '8px',
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, margin: 0, flex: 1 }}>
          Modifier le repas
        </h1>
      </div>

      <main style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%', padding: '16px', ...getMainContentStyle(false) }}>
        {error && (
          <div
            style={{
              backgroundColor: '#FEE',
              color: colors.error,
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: `1px solid ${colors.error}`,
              fontWeight: 500,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {meal && (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            style={{
              backgroundColor: colors.backgroundWhite,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Visualisation rapide du plat non modifiable */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '16px', borderBottom: `1px solid ${colors.backgroundLight}` }}>
              <img
                src={meal.photo}
                alt={meal.name}
                style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: colors.textPrimary }}>{meal.name}</h3>
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>Plat non modifiable (photo et ingrédients verrouillés)</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Description du repas
              </label>
              <textarea
                {...form.register('description')}
                placeholder="Décrivez les détails de votre repas..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.backgroundLight}`,
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                }}
              />
              {form.formState.errors.description && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Style de cuisine */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Style culinaire *
              </label>
              <select
                {...form.register('cuisine')}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: colors.backgroundWhite,
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">Sélectionnez un style de cuisine</option>
                <option value="Française">Française</option>
                <option value="Italienne">Italienne</option>
                <option value="Asiatique">Asiatique</option>
                <option value="Africaine">Africaine</option>
                <option value="Autre">Autre</option>
              </select>
              {form.formState.errors.cuisine && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {form.formState.errors.cuisine.message}
                </p>
              )}
            </div>

            {/* Nombre de parts */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Nombre de parts proposées *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  {...form.register('portions', { valueAsNumber: true })}
                  disabled={!isPremium && meal.portions === 1} // Si non premium et portions déjà à 1, désactiver
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '16px',
                    backgroundColor: colors.backgroundWhite,
                    minWidth: '80px',
                    cursor: (!isPremium && meal.portions === 1) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value={1}>1 part</option>
                  {(isPremium || meal.portions >= 2) && <option value={2}>2 parts</option>}
                  {(isPremium || meal.portions >= 3) && <option value={3}>3 parts</option>}
                  {(isPremium || meal.portions >= 4) && <option value={4}>4 parts</option>}
                </select>

                {!isPremium && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: colors.premium,
                      backgroundColor: '#F5ECF7',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      flex: 1,
                      fontWeight: 500,
                    }}
                  >
                    👑 Passez à <span style={{ fontWeight: 'bold' }}>Premium</span> pour proposer jusqu'à 4 parts.
                  </div>
                )}
              </div>
              {form.formState.errors.portions && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {form.formState.errors.portions.message}
                </p>
              )}
            </div>

            {/* Option "Vendre ce repas" */}
            {(isPremium || (meal && meal.price !== undefined && meal.price !== null && meal.price > 0)) && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: `${colors.premium}10`,
                  borderRadius: '12px',
                  border: `2px solid ${colors.premium}30`,
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: colors.textPrimary,
                  }}
                >
                  <input
                    type="checkbox"
                    {...form.register('sellMeal')}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      marginTop: '2px',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span>💰 Vendre ce repas</span>
                      <span style={{ 
                        fontSize: '12px', 
                        padding: '2px 8px', 
                        backgroundColor: colors.premium, 
                        color: colors.backgroundWhite, 
                        borderRadius: '12px',
                        fontWeight: 'bold'
                      }}>
                        PREMIUM
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px', lineHeight: '1.5' }}>
                      Si cette option est cochée, votre repas sera vendu <strong>5€</strong> (frais de service inclus).
                      <br />
                      <strong>Vous recevrez 4€</strong> après la livraison du repas. La plateforme perçoit 1€ de frais de service.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Jour de service */}
            <div>
              <label 
                htmlFor="serviceDate"
                style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}
              >
                Date du service *
              </label>
              <input
                id="serviceDate"
                type="date"
                {...form.register('serviceDate')}
                min={new Date().toISOString().split('T')[0]} // Impossible de choisir une date passée
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: colors.backgroundWhite,
                }}
              />
              {form.formState.errors.serviceDate && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {form.formState.errors.serviceDate.message}
                </p>
              )}
            </div>

            {/* Créneau de récupération */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Créneau de récupération *
              </label>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="fixed"
                    {...form.register('pickupTimeType')}
                    style={{ accentColor: colors.primary }}
                  />
                  Heure fixe
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="range"
                    {...form.register('pickupTimeType')}
                    style={{ accentColor: colors.primary }}
                  />
                  Plage horaire
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="time"
                    {...form.register('pickupTimeStart')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.backgroundLight}`,
                      fontSize: '16px',
                      backgroundColor: colors.backgroundWhite,
                    }}
                  />
                </div>

                {pickupTimeType === 'range' && (
                  <>
                    <span style={{ color: colors.textSecondary }}>à</span>
                    <div style={{ flex: 1 }}>
                      <input
                        type="time"
                        {...form.register('pickupTimeEnd')}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: `1px solid ${colors.backgroundLight}`,
                          fontSize: '16px',
                          backgroundColor: colors.backgroundWhite,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
              {form.formState.errors.pickupTimeEnd && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {form.formState.errors.pickupTimeEnd.message}
                </p>
              )}
            </div>

            {/* Adresse de récupération avec autocomplétion */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Adresse de récupération *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...form.register('pickupAddress')}
                  placeholder="Tapez l'adresse de récupération..."
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '16px',
                    backgroundColor: colors.backgroundWhite,
                    paddingRight: addressLoading ? '40px' : '12px',
                  }}
                />
                {addressLoading && (
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>⏳</div>
                )}
              </div>
              <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                Saisissez l'adresse et choisissez-la dans la liste pour recalculer l'emplacement GPS.
              </p>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: colors.backgroundWhite,
                    border: `1px solid ${colors.backgroundLight}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    maxHeight: '180px',
                    overflowY: 'auto',
                    marginTop: '4px',
                  }}
                >
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: colors.textPrimary,
                        borderBottom: idx < suggestions.length - 1 ? `1px solid ${colors.backgroundLight}` : 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFF2EC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ fontWeight: 'bold' }}>{suggestion.label.split(',')[0]}</div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                        {suggestion.label.split(',').slice(1).join(',').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {form.formState.errors.pickupAddress && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {form.formState.errors.pickupAddress.message}
                </p>
              )}
            </div>

            {/* Carte de géolocalisation dynamique */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Aperçu géographique
              </label>
              {mapCoords && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: `1px solid ${colors.backgroundLight}` }}>
                  <iframe
                    title="Carte de récupération"
                    width="100%"
                    height="200"
                    style={{ border: 0, display: 'block' }}
                    src={`https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=16&output=embed`}
                    allowFullScreen
                  />
                  <div style={{ padding: '8px 12px', backgroundColor: '#F8F9FA', fontSize: '12px', color: colors.textSecondary, borderTop: `1px solid ${colors.backgroundLight}`, display: 'flex', justifyContent: 'space-between' }}>
                    <span>📍 Coordonnées : {typeof mapCoords.lat === 'number' ? mapCoords.lat.toFixed(5) : 'N/A'}, {typeof mapCoords.lng === 'number' ? mapCoords.lng.toFixed(5) : 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            <input type="hidden" {...form.register('pickupLatitude', { valueAsNumber: true })} />
            <input type="hidden" {...form.register('pickupLongitude', { valueAsNumber: true })} />

            {/* Boutons de soumission */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => navigate(`/meals/${id}`)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: '#FFF',
                  color: colors.textPrimary,
                  border: `1px solid ${colors.backgroundLight}`,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: colors.primary,
                  color: colors.backgroundWhite,
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {saving ? 'Enregistrement... ⏳' : '💾 Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
