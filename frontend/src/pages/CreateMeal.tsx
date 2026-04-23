import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mealService, CreateMealDto } from '../services/meal.service';
import api from '../services/api';
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

// Schéma de validation pour l'étape 1
const step1Schema = z.object({
  name: z.string().min(1, 'Le nom du repas est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  photo: z.string().min(1, 'Une photo du plat est obligatoire').refine(
    (val) => val.startsWith('data:') || val.startsWith('http://') || val.startsWith('https://'),
    { message: 'Format de photo invalide. Veuillez télécharger une vraie photo de votre plat cuisiné.' }
  ),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional().or(z.literal('')),
  preparationDate: z.string().min(1, 'La date de préparation est requise'),
  serviceDate: z.string().min(1, 'Le jour de service est requis'),
  pickupTimeType: z.enum(['fixed', 'range'], { required_error: 'Sélectionnez un type d\'heure' }),
  pickupTimeStart: z.string().min(1, 'L\'heure de début est requise'),
  pickupTimeEnd: z.string().optional(),
  portions: z.coerce.number().min(1, 'Le nombre de parts doit être au moins 1').max(4, 'Le nombre de parts ne peut pas dépasser 4'),
}).refine(
  (data) => {
    // Si plage horaire, l'heure de fin est requise
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

// Schéma de validation pour l'étape 2
const step2Schema = z.object({
  pickupAddress: z.string().min(1, 'L\'adresse de récupération est requise'),
  pickupLatitude: z.number(),
  pickupLongitude: z.number(),
});

// Schéma de validation pour l'étape 3
const step3Schema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string().min(1, 'Le nom de l\'ingrédient est requis'),
      allergens: z.array(z.string()).optional(),
    })
  )
  .refine(
    (ingredients) => {
      // Filtrer les ingrédients vides et vérifier qu'il en reste au moins 3
      const validIngredients = ingredients.filter(
        (ing) => ing.name && ing.name.trim().length > 0
      );
      return validIngredients.length >= 3;
    },
    {
      message: 'Au moins 3 ingrédients valides sont requis (remplissez les champs d\'ingrédients)',
    }
  ),
  sellMeal: z.boolean().optional(), // Case à cocher "Vendre ce repas" (premium uniquement)
  price: z.preprocess(
    (val) => {
      // Si la valeur est vide, null, undefined, ou NaN, retourner null
      if (val === '' || val === null || val === undefined || (typeof val === 'number' && isNaN(val))) {
        return null;
      }
      // Convertir en nombre
      const num: number =
        typeof val === 'string' ? parseFloat(val) : typeof val === 'number' ? val : NaN;
      return Number.isNaN(num) ? null : num;
    },
    z.number().optional().nullable()
  ),
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;
type Step3FormData = z.infer<typeof step3Schema>;

export default function CreateMeal() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Formulaires pour chaque étape
  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      pickupTimeType: 'fixed',
      portions: 1,
    },
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
  });

  const step3Form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      ingredients: [{ name: '', allergens: [] }],
      sellMeal: false,
      price: null,
    },
  });

  const pickupTimeType = step1Form.watch('pickupTimeType');
  const preparationDate = step1Form.watch('preparationDate');

  useEffect(() => {
    loadUserSubscription();
  }, []);

  const loadUserSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/current');
      if (response.data.success && response.data.data) {
        setUserSubscription(response.data.data);
        // Si premium, permettre jusqu'à 4 parts
        if (response.data.data.type === 'PREMIUM' && response.data.data.active) {
          step1Form.setValue('portions', 1);
        }
      }
    } catch (error) {
      // Utilisateur gratuit par défaut
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        step1Form.setValue('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateExpirationDate = (prepDate: string): string => {
    if (!prepDate) return '';
    const date = new Date(prepDate);
    date.setHours(date.getHours() + 72); // 72h après préparation
    return date.toISOString();
  };

  const handleNextStep = async () => {
    setError(null); // Effacer les erreurs précédentes

    if (currentStep === 1) {
      const isValid = await step1Form.trigger();

      if (isValid) {
        // Si heure fixe, copier l'heure de début dans l'heure de fin avant de passer à l'étape suivante
        const formValues = step1Form.getValues();
        if (formValues.pickupTimeType === 'fixed' && !formValues.pickupTimeEnd) {
          step1Form.setValue('pickupTimeEnd', formValues.pickupTimeStart, { shouldValidate: false });
        }
        setCurrentStep(2);
        // Scroll vers le haut pour voir le nouveau contenu
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Afficher un message d'erreur si la validation échoue
        const errors = step1Form.formState.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, error]) => {
            if (error?.message) {
              const fieldNames: { [key: string]: string } = {
                name: 'Nom du repas',
                photo: 'Photo',
                preparationDate: 'Date de préparation',
                serviceDate: 'Jour de service',
                pickupTimeType: 'Type d\'heure',
                pickupTimeStart: 'Heure de début',
                portions: 'Nombre de parts',
              };
              return `${fieldNames[field] || field}: ${error.message}`;
            }
            return null;
          })
          .filter(Boolean);
        
        if (errorMessages.length > 0) {
          const errorText = `Veuillez corriger les erreurs suivantes :\n${errorMessages.join('\n')}`;
          setError(errorText);
        } else {
          setError('Veuillez remplir tous les champs obligatoires avant de continuer.');
        }
        // Scroll vers le haut pour voir les erreurs
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (currentStep === 2) {
      const isValid = await step2Form.trigger();
      if (isValid) {
        setCurrentStep(3);
        // Scroll vers le haut pour voir le nouveau contenu
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Afficher un message d'erreur si la validation échoue
        const errors = step2Form.formState.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, error]) => {
            if (error?.message) {
              const fieldNames: { [key: string]: string } = {
                pickupAddress: 'Adresse de récupération',
                pickupLatitude: 'Coordonnées GPS',
                pickupLongitude: 'Coordonnées GPS',
              };
              return `${fieldNames[field] || field}: ${error.message}`;
            }
            return null;
          })
          .filter(Boolean);
        
        if (errorMessages.length > 0) {
          setError(`Veuillez corriger les erreurs suivantes :\n${errorMessages.join('\n')}`);
        } else {
          setError('Veuillez remplir tous les champs obligatoires avant de continuer.');
        }
        // Scroll vers le haut pour voir les erreurs
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleAddIngredient = () => {
    const currentIngredients = step3Form.getValues('ingredients') || [];
    step3Form.setValue('ingredients', [...currentIngredients, { name: '', allergens: [] }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const currentIngredients = step3Form.getValues('ingredients') || [];
    step3Form.setValue('ingredients', currentIngredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const isValid = await step3Form.trigger();
    
    if (!isValid) {
      const errors = step3Form.formState.errors;
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => {
          if (error?.message) {
            const fieldNames: { [key: string]: string } = {
              ingredients: 'Ingrédients',
              photo: 'Photo',
              price: 'Prix',
            };
            return `${fieldNames[field] || field}: ${error.message}`;
          }
          return null;
        })
        .filter(Boolean);
      
      if (errorMessages.length > 0) {
        setError(`Veuillez corriger les erreurs suivantes :\n${errorMessages.join('\n')}`);
      } else {
        setError('Veuillez remplir tous les champs obligatoires avant de publier.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Récupérer toutes les données des formulaires
      const step1Data = step1Form.getValues();
      const step2Data = step2Form.getValues();
      const step3Data = step3Form.getValues();

      // Construire les dates complètes avec heures
      const prepDate = new Date(step1Data.preparationDate);
      const serviceDate = new Date(step1Data.serviceDate);

      // Construire pickupTimeStart et pickupTimeEnd
      const [startHour, startMinute] = step1Data.pickupTimeStart.split(':');
      const pickupTimeStart = new Date(serviceDate);
      pickupTimeStart.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      let pickupTimeEnd: Date;
      if (step1Data.pickupTimeType === 'fixed' || !step1Data.pickupTimeEnd) {
        pickupTimeEnd = new Date(pickupTimeStart);
      } else {
        const [endHour, endMinute] = step1Data.pickupTimeEnd.split(':');
        pickupTimeEnd = new Date(serviceDate);
        pickupTimeEnd.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
      }

      // Upload photo si nécessaire
      let photoUrl = step1Data.photo || '';
      if (photoFile) {
        // TODO: Implémenter l'upload de photo vers un service (Cloudinary, S3, etc.)
        // Pour l'instant, on utilise l'URL de la preview
        photoUrl = photoPreview || '';
      }

      // Filtrer les ingrédients vides avant de créer le repas
      const validIngredients = step3Data.ingredients.filter(
        (ing) => ing.name && ing.name.trim().length > 0
      );
      
      if (validIngredients.length < 3) {
        setError('Au moins 3 ingrédients valides sont requis. Veuillez remplir les champs d\'ingrédients.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setLoading(false);
        return;
      }

      // Gérer le prix : si premium et case "Vendre ce repas" cochée, prix fixe à 5€
      let priceValue: number | null = null;
      if (isPremium && step3Data.sellMeal) {
        priceValue = 5; // Prix fixe selon spécifications : 5€ par repas
      }

      const mealData: CreateMealDto = {
        name: step1Data.name,
        photo: photoUrl,
        description: step1Data.description || undefined,
        preparationDate: prepDate.toISOString(),
        serviceDate: serviceDate.toISOString(),
        pickupTimeStart: pickupTimeStart.toISOString(),
        pickupTimeEnd: pickupTimeEnd.toISOString(),
        pickupAddress: step2Data.pickupAddress,
        pickupLatitude: step2Data.pickupLatitude,
        pickupLongitude: step2Data.pickupLongitude,
        ingredients: validIngredients,
        portions: step1Data.portions,
        price: priceValue,
      };

      const response = await mealService.createMeal(mealData);

      if (response.success) {
        navigate('/dashboard');
      } else {
        const errorMsg = response.error || 'Erreur lors de la création du repas';
        setError(errorMsg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Erreur lors de la création du repas';
      setError(errorMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const isPremium = userSubscription?.type === 'PREMIUM' && userSubscription?.active;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.backgroundLight,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: getPagePaddingBottom(false, true), // Pas de bottom nav mais footer avec boutons
      }}
    >
      <Navigation showBottomBar={false} />
      {/* Header */}
      <header
        style={{
          backgroundColor: colors.backgroundWhite,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: `1px solid ${colors.backgroundLight}`,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: colors.textPrimary,
          }}
        >
          ←
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, flex: 1, textAlign: 'center' }}>
          Proposer un repas
        </h2>
        <div style={{ width: '40px' }} /> {/* Spacer */}
      </header>

      {/* Progress Bar */}
      <div style={{ padding: '16px', backgroundColor: colors.backgroundWhite }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <p style={{ fontSize: '16px', fontWeight: 500, color: colors.textPrimary }}>
            {currentStep === 1 && 'Informations principales'}
            {currentStep === 2 && 'Adresse de récupération'}
            {currentStep === 3 && 'Ingrédients et prix'}
          </p>
          <p style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>
            Étape {currentStep}/3
          </p>
        </div>
        <div
          style={{
            height: '8px',
            backgroundColor: colors.backgroundLight,
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: colors.primary,
              width: `${(currentStep / 3) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', ...getMainContentStyle(true) }}>
        {error && (
          <div
            style={{
              backgroundColor: '#FEE',
              color: colors.error,
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: `2px solid ${colors.error}`,
              boxShadow: '0 2px 8px rgba(231, 76, 60, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>❌</span>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '8px', fontSize: '15px' }}>Erreur de validation</strong>
                <pre style={{ 
                  margin: 0, 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  fontFamily: 'inherit'
                }}>{error}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Étape 1: Informations principales */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Upload Photo */}
            <div
              style={{
                border: `2px dashed ${colors.primary}50`,
                borderRadius: '12px',
                padding: '40px 24px',
                backgroundColor: `${colors.primary}10`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {photoPreview ? (
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      maxHeight: '200px',
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFile(null);
                      step1Form.setValue('photo', '');
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: colors.error,
                      color: colors.backgroundWhite,
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '48px' }}>📷</div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '4px' }}>
                      Ajouter une photo <span style={{ color: colors.error }}>*</span>
                    </p>
                    <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '8px' }}>
                      Prenez une photo ou importez de la galerie
                    </p>
                    <p style={{ fontSize: '12px', color: colors.warning, fontStyle: 'italic', marginTop: '4px' }}>
                      📸 Veuillez ajouter une <strong>vraie photo de votre plat cuisiné</strong>. Les photos de stock ou d'illustration ne sont pas acceptées.
                    </p>
                  </div>
                  <label
                    style={{
                      padding: '10px 16px',
                      backgroundColor: colors.primary,
                      color: colors.backgroundWhite,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    Importer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </>
              )}
              {step1Form.formState.errors.photo && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                  {step1Form.formState.errors.photo.message}
                </p>
              )}
            </div>

            {/* Nom du repas */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Nom du repas *
              </label>
              <input
                {...step1Form.register('name')}
                placeholder="ex: Lasagnes aux légumes"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: colors.backgroundWhite,
                }}
              />
              {step1Form.formState.errors.name && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {step1Form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Description (optionnel)
              </label>
              <textarea
                {...step1Form.register('description')}
                placeholder="Décrivez les ingrédients, allergènes, ou l'histoire du plat..."
                rows={4}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: colors.backgroundWhite,
                  resize: 'vertical',
                }}
              />
              {step1Form.formState.errors.description && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {step1Form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                  Date de préparation *
                </label>
                <input
                  type="date"
                  {...step1Form.register('preparationDate')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '14px',
                    backgroundColor: colors.backgroundWhite,
                  }}
                />
                <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                  Généralement identique à la date de publication
                </p>
                {step1Form.formState.errors.preparationDate && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                    {step1Form.formState.errors.preparationDate.message}
                  </p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                  Jour de service *
                </label>
                <input
                  type="date"
                  {...step1Form.register('serviceDate')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.backgroundLight}`,
                    fontSize: '14px',
                    backgroundColor: colors.backgroundWhite,
                  }}
                />
                {step1Form.formState.errors.serviceDate && (
                  <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                    {step1Form.formState.errors.serviceDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Heure de récupération */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Heure de récupération *
              </label>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="fixed"
                      {...step1Form.register('pickupTimeType')}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px' }}>Heure fixe</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="range"
                      {...step1Form.register('pickupTimeType')}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px' }}>Plage horaire</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: colors.textSecondary }}>De:</label>
                  <input
                    type="time"
                    {...step1Form.register('pickupTimeStart')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.backgroundLight}`,
                      fontSize: '14px',
                      backgroundColor: colors.backgroundWhite,
                    }}
                  />
                </div>
                {pickupTimeType === 'range' && (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: colors.textSecondary }}>À:</label>
                    <input
                      type="time"
                      {...step1Form.register('pickupTimeEnd')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.backgroundLight}`,
                        fontSize: '14px',
                        backgroundColor: colors.backgroundWhite,
                      }}
                    />
                  </div>
                )}
              </div>
              <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                Indiquez quand le repas peut être récupéré (format: HH:MM)
              </p>
              {step1Form.formState.errors.pickupTimeStart && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {step1Form.formState.errors.pickupTimeStart.message}
                </p>
              )}
            </div>

            {/* Nombre de parts */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                  Nombre de parts *
                </label>
                <span style={{ fontSize: '12px', color: colors.textSecondary }} title="Les membres gratuits sont limités à 1 part">
                  ℹ️
                </span>
              </div>
              <select
                {...step1Form.register('portions', { 
                  valueAsNumber: true,
                  onChange: (e) => {
                    const value = parseInt(e.target.value, 10);
                    step1Form.setValue('portions', value, { shouldValidate: true });
                  }
                })}
                disabled={!isPremium}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: isPremium ? colors.backgroundWhite : colors.backgroundLight,
                  opacity: isPremium ? 1 : 0.8,
                  cursor: isPremium ? 'pointer' : 'not-allowed',
                }}
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num} part{num > 1 ? 's' : ''} {!isPremium && num > 1 ? '(Premium)' : ''}
                  </option>
                ))}
              </select>
              {step1Form.formState.errors.portions && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {step1Form.formState.errors.portions.message}
                </p>
              )}
              {!isPremium && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    backgroundColor: `${colors.primary}10`,
                    borderRadius: '8px',
                    border: `1px solid ${colors.primary}30`,
                  }}
                >
                  <p style={{ fontSize: '12px', color: colors.primary, fontWeight: 500 }}>
                    💡 <strong>Passez au Premium</strong> pour partager jusqu'à 4 parts par repas et accéder à plus de fonctionnalités !
                  </p>
                </div>
              )}
            </div>

            {/* Expiration automatique */}
            {preparationDate && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#E3F2FD',
                  borderRadius: '12px',
                  border: '1px solid #90CAF9',
                }}
              >
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1976D2', marginBottom: '4px' }}>
                  ⏰ Expiration automatique calculée
                </p>
                <p style={{ fontSize: '12px', color: '#1565C0' }}>
                  Ce repas expirera automatiquement le{' '}
                  <strong>{new Date(calculateExpirationDate(preparationDate)).toLocaleString('fr-FR')}</strong> (72h après la date de préparation) pour garantir la sécurité alimentaire.
                </p>
              </div>
            )}

            {/* Règle importante */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#FFF3E0',
                borderRadius: '12px',
                border: '1px solid #FFB74D',
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#E65100', marginBottom: '4px' }}>
                ⚠️ Règle importante
              </p>
              <p style={{ fontSize: '12px', color: '#E65100' }}>
                Si le repas n'est pas réservé avant l'expiration, il sera automatiquement retiré et ajouté dans la rubrique "Sauvez-les" 24h avant expiration.
              </p>
            </div>
          </div>
        )}

        {/* Étape 2: Adresse de récupération */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                Adresse de récupération *
              </label>
              <input
                {...step2Form.register('pickupAddress')}
                placeholder="123 Rue de la Paix, 75001 Paris"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.backgroundLight}`,
                  fontSize: '16px',
                  backgroundColor: colors.backgroundWhite,
                }}
              />
              <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                L'adresse sera validée par Google Maps pour garantir la précision
              </p>
              {step2Form.formState.errors.pickupAddress && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {step2Form.formState.errors.pickupAddress.message}
                </p>
              )}
            </div>

            {/* TODO: Intégrer Google Maps pour la sélection d'adresse et récupération des coordonnées */}
            <div
              style={{
                padding: '16px',
                backgroundColor: colors.backgroundLight,
                borderRadius: '8px',
                textAlign: 'center',
                color: colors.textSecondary,
              }}
            >
              🗺️ Carte Google Maps à intégrer (pour sélectionner l'adresse et obtenir les coordonnées GPS)
            </div>

            {/* Pour l'instant, on utilise des coordonnées par défaut (Paris) */}
            <input
              type="hidden"
              {...step2Form.register('pickupLatitude', { valueAsNumber: true, value: 48.8566 })}
            />
            <input
              type="hidden"
              {...step2Form.register('pickupLongitude', { valueAsNumber: true, value: 2.3522 })}
            />
          </div>
        )}

        {/* Étape 3: Ingrédients et prix */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                  Ingrédients * (minimum 3)
                </label>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: colors.primary,
                    color: colors.backgroundWhite,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  + Ajouter
                </button>
              </div>

              {step3Form.watch('ingredients')?.map((_, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <input
                      {...step3Form.register(`ingredients.${index}.name`)}
                      placeholder={`Ingrédient ${index + 1}`}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.backgroundLight}`,
                        fontSize: '14px',
                        backgroundColor: colors.backgroundWhite,
                      }}
                    />
                  </div>
                  {step3Form.watch('ingredients')!.length > 3 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      style={{
                        padding: '12px',
                        backgroundColor: colors.error,
                        color: colors.backgroundWhite,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {step3Form.formState.errors.ingredients && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  {step3Form.formState.errors.ingredients.message}
                </p>
              )}
            </div>

            {/* Option "Vendre ce repas" (Premium uniquement) */}
            {isPremium && (
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
                    {...step3Form.register('sellMeal')}
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
          </div>
        )}
      </main>

      {/* Footer avec boutons de navigation */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: `${colors.backgroundWhite}E6`,
          backdropFilter: 'blur(12px)',
          padding: '16px',
          borderTop: `1px solid ${colors.backgroundLight}`,
          display: 'flex',
          gap: '12px',
          zIndex: 150, // Au-dessus de la Navigation (qui a zIndex: 100)
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: colors.backgroundWhite,
              color: colors.textPrimary,
              border: `2px solid ${colors.primary}`,
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ← Précédent
          </button>
        )}
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNextStep();
            }}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: colors.primary,
              color: colors.backgroundWhite,
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit();
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: loading ? colors.textSecondary : colors.primary,
              color: colors.backgroundWhite,
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Publication...' : '✅ Publier le repas'}
          </button>
        )}
      </footer>
    </div>
  );
}
