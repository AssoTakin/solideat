import axios from 'axios';
import { USE_MOCK_DATA } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
let isRedirecting = false; // Flag pour éviter les redirections multiples

// Fonction pour sauvegarder les logs de diagnostic
function saveDiagnosticLog(message: string, data?: any) {
  const logs = JSON.parse(localStorage.getItem('diagnostic_logs') || '[]');
  logs.push({
    timestamp: new Date().toISOString(),
    message,
    data,
  });
  // Garder seulement les 20 derniers logs
  if (logs.length > 20) logs.shift();
  localStorage.setItem('diagnostic_logs', JSON.stringify(logs));
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // En mode mock, ne pas rediriger automatiquement
    if (USE_MOCK_DATA) {
      // En mode mock, on accepte les erreurs 401 car on utilise des tokens mock
      // Ne pas rediriger, juste logger l'erreur
      if (error.response?.status === 401) {
        // En mode mock, les erreurs 401 sont normales
      }
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url || 'unknown';
      const token = localStorage.getItem('token');
      
      // Sauvegarder les logs avant redirection
      saveDiagnosticLog('[API] Erreur 401 détectée', {
        path: currentPath,
        url: requestUrl,
        isRedirecting,
        tokenPresent: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : null,
        errorResponse: error.response?.data,
      });
      
      
      // Ne pas rediriger si on est sur une page publique
      const publicPages = ['/login', '/register', '/', '/verify', '/auth/forgot-password', '/auth/reset-password'];
      
      // Éviter les redirections multiples
      if (!isRedirecting && !publicPages.includes(currentPath)) {
        isRedirecting = true;
        saveDiagnosticLog('[API] Redirection vers /login déclenchée');
        localStorage.removeItem('token');
        // Utiliser window.location.href pour une redirection complète (évite les problèmes de navigation React)
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      } else if (publicPages.includes(currentPath)) {
        // Sur une page publique, juste supprimer le token sans rediriger
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
