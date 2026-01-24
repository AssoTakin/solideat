import { useState, useEffect } from 'react';
import api from '../services/api';

interface DiagnosticResult {
  name: string;
  status: 'checking' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function Diagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    const newResults: DiagnosticResult[] = [];

    // Test 1: Variables d'environnement
    newResults.push({
      name: 'Variables d\'environnement',
      status: 'checking',
      message: 'Vérification...',
    });
    setResults([...newResults]);

    const apiUrl = import.meta.env.VITE_API_URL;
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    newResults[0] = {
      name: 'Variables d\'environnement',
      status: apiUrl ? 'success' : 'error',
      message: apiUrl
        ? `API URL: ${apiUrl}`
        : 'VITE_API_URL non définie',
      details: {
        VITE_API_URL: apiUrl || '❌ Manquante',
        VITE_STRIPE_PUBLISHABLE_KEY: stripeKey ? '✅ Définie' : '❌ Manquante',
        VITE_GOOGLE_MAPS_API_KEY: mapsKey ? '✅ Définie' : '❌ Manquante',
      },
    };
    setResults([...newResults]);

    // Test 2: Connexion API - Health Check
    newResults.push({
      name: 'Health Check API',
      status: 'checking',
      message: 'Test en cours...',
    });
    setResults([...newResults]);

    try {
      const healthResponse = await fetch(`${apiUrl}/health`);
      const healthData = await healthResponse.json();
      newResults[1] = {
        name: 'Health Check API',
        status: healthResponse.ok ? 'success' : 'error',
        message: healthResponse.ok
          ? `Backend accessible - Database: ${healthData.database || 'unknown'}`
          : `Erreur ${healthResponse.status}`,
        details: healthData,
      };
    } catch (error: any) {
      newResults[1] = {
        name: 'Health Check API',
        status: 'error',
        message: `Erreur de connexion: ${error.message}`,
        details: { error: error.toString() },
      };
    }
    setResults([...newResults]);

    // Test 3: CORS
    newResults.push({
      name: 'Test CORS',
      status: 'checking',
      message: 'Test en cours...',
    });
    setResults([...newResults]);

    try {
      const corsResponse = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
        },
      });
      newResults[2] = {
        name: 'Test CORS',
        status: corsResponse.ok || corsResponse.status === 405 ? 'success' : 'error',
        message: corsResponse.ok || corsResponse.status === 405
          ? 'CORS configuré correctement'
          : `Erreur CORS: ${corsResponse.status}`,
        details: {
          status: corsResponse.status,
          headers: Object.fromEntries(corsResponse.headers.entries()),
        },
      };
    } catch (error: any) {
      newResults[2] = {
        name: 'Test CORS',
        status: 'error',
        message: `Erreur CORS: ${error.message}`,
        details: { error: error.toString() },
      };
    }
    setResults([...newResults]);

    // Test 4: Route d'inscription (sans données valides)
    newResults.push({
      name: 'Route /api/auth/register',
      status: 'checking',
      message: 'Test en cours...',
    });
    setResults([...newResults]);

    try {
      const registerResponse = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test1234',
          phone: '+33123456789',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser',
          addressStreet: '123 Rue Test',
          addressZipCode: '75001',
          addressCity: 'Paris',
          cguAccepted: true,
          sanitaryCharterAccepted: true,
        }),
      });

      const registerData = await registerResponse.json();
      newResults[3] = {
        name: 'Route /api/auth/register',
        status: registerResponse.ok || registerResponse.status === 400 ? 'success' : 'error',
        message: registerResponse.ok
          ? 'Route accessible (inscription réussie)'
          : registerResponse.status === 400
          ? `Route accessible (erreur de validation attendue): ${registerData.error || 'Validation failed'}`
          : `Erreur ${registerResponse.status}`,
        details: registerData,
      };
    } catch (error: any) {
      newResults[3] = {
        name: 'Route /api/auth/register',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: { error: error.toString() },
      };
    }
    setResults([...newResults]);

    // Test 5: Configuration axios
    newResults.push({
      name: 'Configuration Axios',
      status: 'checking',
      message: 'Vérification...',
    });
    setResults([...newResults]);

    try {
      const axiosBaseURL = (api as any).defaults?.baseURL;
      newResults[4] = {
        name: 'Configuration Axios',
        status: axiosBaseURL ? 'success' : 'error',
        message: axiosBaseURL
          ? `Base URL: ${axiosBaseURL}`
          : 'Base URL non configurée',
        details: {
          baseURL: axiosBaseURL || '❌ Non définie',
        },
      };
    } catch (error: any) {
      newResults[4] = {
        name: 'Configuration Axios',
        status: 'error',
        message: `Erreur: ${error.message}`,
      };
    }
    setResults([...newResults]);

    setRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ECF0F1',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '8px' }}>
          🔍 Diagnostic SOLID'EAT
        </h1>
        <p style={{ fontSize: '14px', color: '#7F8C8D', marginBottom: '24px' }}>
          Tests automatiques de configuration et connexion
        </p>

        <button
          onClick={runDiagnostics}
          disabled={running}
          style={{
            padding: '12px 24px',
            backgroundColor: running ? '#7F8C8D' : '#FF6B35',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: running ? 'not-allowed' : 'pointer',
            marginBottom: '24px',
          }}
        >
          {running ? 'Tests en cours...' : '🔄 Relancer les tests'}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor:
                  result.status === 'success'
                    ? '#E8F5E9'
                    : result.status === 'error'
                    ? '#FFEBEE'
                    : '#E3F2FD',
                border: `2px solid ${
                  result.status === 'success'
                    ? '#4CAF50'
                    : result.status === 'error'
                    ? '#F44336'
                    : '#2196F3'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>
                  {result.status === 'checking' && '⏳'}
                  {result.status === 'success' && '✅'}
                  {result.status === 'error' && '❌'}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2C3E50', margin: 0 }}>
                  {result.name}
                </h3>
              </div>
              <p style={{ fontSize: '14px', color: '#2C3E50', margin: '4px 0' }}>{result.message}</p>
              {result.details && (
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#7F8C8D' }}>
                    Détails techniques
                  </summary>
                  <pre
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      backgroundColor: '#F5F5F5',
                      borderRadius: '4px',
                      fontSize: '12px',
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#7F8C8D' }}>
            <p>Cliquez sur "Relancer les tests" pour démarrer le diagnostic</p>
          </div>
        )}
      </div>
    </div>
  );
}
