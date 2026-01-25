/**
 * Utilitaires pour la gestion du layout et des espacements
 * Solution centralisée pour éviter que le footer de navigation masque le contenu
 */

// Hauteur du footer de navigation en bas (bottom bar)
// Calculée : padding vertical (8px * 2) + icône (24px) + texte (10px) + gap (4px) + padding items (8px * 2)
// Total approximatif : ~70px, arrondi à 100px pour une marge de sécurité confortable
export const BOTTOM_NAV_HEIGHT = 100;

// Hauteur supplémentaire pour les pages avec des footers/boutons en bas
// Ex: CreateMeal a un footer avec boutons (padding 16px * 2 + hauteur bouton ~50px + marge)
export const FOOTER_BUTTONS_HEIGHT = 100;

/**
 * Calcule le padding-bottom nécessaire selon le contexte
 * @param hasBottomNav - Si la page a la bottom navigation bar
 * @param hasFooterButtons - Si la page a des boutons en bas (footer)
 * @returns Padding-bottom en pixels
 */
export function getPagePaddingBottom(hasBottomNav: boolean = true, hasFooterButtons: boolean = false): string {
  if (hasFooterButtons) {
    // Si la page a des boutons en bas, il faut de l'espace pour bottom nav + footer
    return `${BOTTOM_NAV_HEIGHT + FOOTER_BUTTONS_HEIGHT}px`;
  }
  if (hasBottomNav) {
    return `${BOTTOM_NAV_HEIGHT}px`;
  }
  return '0';
}

/**
 * Style object pour le conteneur principal d'une page
 */
export function getPageContainerStyle(hasBottomNav: boolean = true, hasFooterButtons: boolean = false) {
  return {
    minHeight: '100vh',
    paddingBottom: getPagePaddingBottom(hasBottomNav, hasFooterButtons),
  };
}

/**
 * Style object pour le main content d'une page
 * Utilisé pour s'assurer que le contenu n'est jamais masqué
 */
export function getMainContentStyle(hasFooterButtons: boolean = false) {
  return {
    paddingBottom: hasFooterButtons ? '20px' : '32px', // Marge supplémentaire pour le scroll
  };
}
