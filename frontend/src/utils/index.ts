// Utilitaires partagés

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('fr-FR');
};
