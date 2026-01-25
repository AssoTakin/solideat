import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Help() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'faq' | 'cgu' | 'charte' | 'contact'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqItems = [
    {
      id: '1',
      question: 'Comment fonctionnent les quotas ?',
      answer: 'Les membres gratuits peuvent réserver 1 repas par semaine et proposer 1 repas par semaine. Les membres premium ont des quotas plus élevés. Les quotas sont réinitialisés chaque lundi.',
    },
    {
      id: '2',
      question: 'Puis-je annuler une réservation ?',
      answer: 'Oui, vous pouvez annuler une réservation jusqu\'à 7 heures avant la date de service. Les annulations tardives comptent dans votre quota mensuel d\'annulations.',
    },
    {
      id: '3',
      question: 'Qu\'est-ce que "Sauvez-les" ?',
      answer: '"Sauvez-les" est une fonctionnalité premium qui vous permet de réserver des repas qui vont expirer dans moins de 24h. Cela aide à réduire le gaspillage alimentaire et vous permet de gagner des badges.',
    },
    {
      id: '4',
      question: 'Comment fonctionne le système de notation ?',
      answer: 'Après avoir récupéré un repas, vous devez obligatoirement laisser un avis et une note (1 à 5 étoiles). Cette notation permet de maintenir la qualité de la communauté.',
    },
    {
      id: '5',
      question: 'Quelles sont les différences entre gratuit et premium ?',
      answer: 'Les membres premium bénéficient de quotas plus élevés, accès aux filtres avancés, statistiques d\'impact environnemental, et peuvent proposer jusqu\'à 4 parts par repas.',
    },
    {
      id: '6',
      question: 'Comment contacter un cuisinier ?',
      answer: 'Vous pouvez utiliser la messagerie intégrée pour contacter le cuisinier d\'un repas que vous avez réservé. Les numéros de téléphone ne sont pas partagés dans les messages.',
    },
  ];

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.textPrimary, margin: 0 }}>
            Aide & Support
          </h1>
        </div>
      </header>

      {/* Navigation des sections */}
      <div
        style={{
          backgroundColor: colors.backgroundWhite,
          padding: '12px 16px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: `1px solid ${colors.backgroundLight}`,
        }}
      >
        {[
          { id: 'faq', label: 'FAQ' },
          { id: 'cgu', label: 'CGU' },
          { id: 'charte', label: 'Charte sanitaire' },
          { id: 'contact', label: 'Contact' },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeSection === section.id ? colors.primary : colors.backgroundLight,
              color: activeSection === section.id ? colors.backgroundWhite : colors.textPrimary,
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <main style={{ padding: '16px', maxWidth: '800px', margin: '0 auto', ...getMainContentStyle(false) }}>
        {activeSection === 'faq' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '24px' }}>
              Questions fréquentes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: colors.backgroundWhite,
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: colors.textPrimary,
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {item.question}
                    </h3>
                    <span style={{ fontSize: '20px', color: colors.primary, marginLeft: '12px' }}>
                      {expandedFaq === item.id ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFaq === item.id && (
                    <p
                      style={{
                        fontSize: '14px',
                        color: colors.textSecondary,
                        marginTop: '12px',
                        lineHeight: '1.6',
                      }}
                    >
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'cgu' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '24px' }}>
              Conditions Générales d'Utilisation
            </h2>
            <div
              style={{
                backgroundColor: colors.backgroundWhite,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8', marginBottom: '16px' }}>
                <strong style={{ color: colors.textPrimary }}>1. Acceptation des CGU</strong>
                <br />
                En utilisant SOLID'EAT, vous acceptez les présentes Conditions Générales d'Utilisation.
              </p>
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8', marginBottom: '16px' }}>
                <strong style={{ color: colors.textPrimary }}>2. Utilisation de la plateforme</strong>
                <br />
                SOLID'EAT est une plateforme de partage de repas entre particuliers. Vous vous engagez à respecter les règles sanitaires et à fournir des informations exactes.
              </p>
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8', marginBottom: '16px' }}>
                <strong style={{ color: colors.textPrimary }}>3. Quotas et limitations</strong>
                <br />
                Les quotas sont définis selon votre type d'abonnement (gratuit ou premium) et sont réinitialisés chaque lundi pour les quotas hebdomadaires.
              </p>
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8', marginBottom: '16px' }}>
                <strong style={{ color: colors.textPrimary }}>4. Responsabilité</strong>
                <br />
                SOLID'EAT agit en tant qu'intermédiaire. La responsabilité des repas proposés incombe aux cuisiniers.
              </p>
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8' }}>
                <strong style={{ color: colors.textPrimary }}>5. Sanctions</strong>
                <br />
                Le non-respect des règles peut entraîner des sanctions progressives, allant jusqu'à la suspension du compte.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'charte' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '24px' }}>
              Charte Sanitaire
            </h2>
            <div
              style={{
                backgroundColor: colors.backgroundWhite,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8', marginBottom: '16px' }}>
                <strong style={{ color: colors.textPrimary }}>1. Hygiène</strong>
                <br />
                Les repas doivent être préparés dans un environnement propre, avec des ustensiles et surfaces désinfectés.
              </p>
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8', marginBottom: '16px' }}>
                <strong style={{ color: colors.textPrimary }}>2. Conservation</strong>
                <br />
                Les repas doivent être conservés à une température appropriée (réfrigération si nécessaire) et ne doivent pas dépasser 72h après préparation.
              </p>
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8', marginBottom: '16px' }}>
                <strong style={{ color: colors.textPrimary }}>3. Allergènes</strong>
                <br />
                Tous les allergènes doivent être clairement indiqués dans la liste des ingrédients. Les cuisiniers doivent être transparents sur la composition des repas.
              </p>
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8', marginBottom: '16px' }}>
                <strong style={{ color: colors.textPrimary }}>4. Traçabilité</strong>
                <br />
                La date de préparation doit être indiquée et respectée. Les repas expirés sont automatiquement retirés de la plateforme.
              </p>
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8' }}>
                <strong style={{ color: colors.textPrimary }}>5. Signalement</strong>
                <br />
                En cas de problème sanitaire, contactez immédiatement le support et signalez l'incident.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'contact' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '24px' }}>
              Contact Support
            </h2>
            <div
              style={{
                backgroundColor: colors.backgroundWhite,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <p style={{ fontSize: '16px', color: colors.textPrimary, marginBottom: '16px', fontWeight: 'bold' }}>
                Besoin d'aide ?
              </p>
              <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.8', marginBottom: '24px' }}>
                Notre équipe est là pour vous aider. Contactez-nous par email ou via le formulaire ci-dessous.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.backgroundLight}`,
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                    Sujet
                  </label>
                  <input
                    type="text"
                    placeholder="Sujet de votre demande"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.backgroundLight}`,
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: colors.textPrimary }}>
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Décrivez votre problème ou votre question..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.backgroundLight}`,
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                </div>
                <button
                  style={{
                    padding: '12px 24px',
                    backgroundColor: colors.primary,
                    color: colors.backgroundWhite,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Envoyer
                </button>
              </div>
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: colors.backgroundLight, borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: colors.textPrimary, fontWeight: 'bold', marginBottom: '8px' }}>
                  Email direct
                </p>
                <p style={{ fontSize: '14px', color: colors.primary }}>
                  support@solideat.fr
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
