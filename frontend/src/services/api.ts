import axios, { AxiosRequestConfig } from 'axios';
import { USE_MOCK_DATA } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Variables pour gérer les redirections
let isRedirecting = false; // Flag pour éviter les redirections multiples
let redirectTimeout: NodeJS.Timeout | null = null; // Timeout pour réinitialiser le flag
const pendingRequests: Map<AbortController, AxiosRequestConfig> = new Map(); // Liste des requêtes en cours à annuler

// Fonction pour vérifier si une redirection est en cours (exportée pour les composants)
export function isRedirectingToLogin(): boolean {
  return isRedirecting;
}

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    // Si une redirection est en cours, annuler la requête
    if (isRedirecting) {
      const abortController = new AbortController();
      abortController.abort();
      config.signal = abortController.signal;
      return Promise.reject(new Error('Redirection en cours'));
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Créer un AbortController pour pouvoir annuler la requête si nécessaire
    if (!config.signal) {
      const abortController = new AbortController();
      config.signal = abortController.signal;
      pendingRequests.set(abortController, config);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Fonction pour annuler toutes les requêtes en cours
function cancelPendingRequests() {
  pendingRequests.forEach((_config, controller) => {
    try {
      controller.abort();
    } catch {
      // Ignorer les erreurs d'annulation
    }
  });
  pendingRequests.clear();
}

// Fonction pour gérer la redirection vers /login
function handleUnauthorizedRedirect() {
  const currentPath = window.location.pathname;
  const publicPages = ['/login', '/register', '/', '/verify', '/auth/forgot-password', '/auth/reset-password'];
  
  // Ne pas rediriger si on est sur une page publique
  if (publicPages.includes(currentPath)) {
    // Sur une page publique, juste supprimer le token sans rediriger
    localStorage.removeItem('token');
    return;
  }
  
  // Éviter les redirections multiples
  if (isRedirecting) {
    return;
  }
  
  isRedirecting = true;
  saveDiagnosticLog('[API] Redirection vers /login déclenchée');
  localStorage.removeItem('token');
  
  // Annuler toutes les requêtes en cours pour éviter les erreurs supplémentaires
  cancelPendingRequests();
  
  // Réinitialiser le flag après 5 secondes (au cas où la redirection échouerait)
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
  }
  redirectTimeout = setTimeout(() => {
    isRedirecting = false;
  }, 5000);
  
  // Utiliser window.location.href pour une redirection complète (évite les problèmes de navigation React)
  setTimeout(() => {
    window.location.href = '/login';
  }, 100);
}

api.interceptors.response.use(
  (response) => {
    // Retirer la requête de la liste des requêtes en cours
    if (response.config.signal) {
      pendingRequests.forEach((config, controller) => {
        if (config.signal === response.config.signal) {
          pendingRequests.delete(controller);
        }
      });
    }
    return response;
  },
  (error) => {
    // Retirer la requête de la liste des requêtes en cours
    if (error.config?.signal) {
      pendingRequests.forEach((config, controller) => {
        if (config.signal === error.config?.signal) {
          pendingRequests.delete(controller);
        }
      });
    }
    
    // Ignorer les erreurs d'annulation
    if (error.code === 'ERR_CANCELED' || error.message === 'Redirection en cours' || error.name === 'AbortError') {
      return Promise.reject(error);
    }
    
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
        errorResponse: error.response?.data,
      });
      
      // Gérer la redirection
      handleUnauthorizedRedirect();
    }
    return Promise.reject(error);
  }
);

export default api;
