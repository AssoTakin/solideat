// Design System Theme (US-Theme-Switcher)

export const colors = {
  primary: 'var(--color-primary)',
  primaryHover: 'var(--color-primary-hover)',
  primaryActive: 'var(--color-primary-active)',
  sosAccent: 'var(--color-sos-accent)',
  sosAccentHover: 'var(--color-sos-accent-hover)',
  sosAccentActive: 'var(--color-sos-accent-active)',
  secondaryHover: 'var(--color-sos-accent-hover)',
  secondaryActive: 'var(--color-sos-accent-active)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  backgroundLight: 'var(--color-background-light)',
  backgroundWhite: 'var(--color-background-white)',
  premium: 'var(--color-premium)',
  badge: 'var(--color-badge)',
};

/**
 * Récupère la version actuelle du design
 */
export function getDesignVersion(): 'classic' | 'modern' {
  return (localStorage.getItem('design_version') as 'classic' | 'modern') || 'modern';
}

/**
 * Alterne entre les designs classique et moderne
 */
export function setDesignVersion(version: 'classic' | 'modern'): void {
  localStorage.setItem('design_version', version);
  document.documentElement.className = `design-${version}`;
}
