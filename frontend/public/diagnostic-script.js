/**
 * Script de diagnostic SOLID'EAT
 * À exécuter dans la console du navigateur (F12)
 */

(async function diagnostic() {
  console.log('%c🔍 DIAGNOSTIC SOLID\'EAT', 'font-size: 20px; font-weight: bold; color: #FF6B35;');
  console.log('='.repeat(50));

  const results = [];

  // Test 1: Variables d'environnement
  console.log('\n📋 Test 1: Variables d\'environnement');
  const apiUrl = import.meta?.env?.VITE_API_URL || window.__VITE_API_URL__;
  const stripeKey = import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY;
  const mapsKey = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY;

  console.log('  VITE_API_URL:', apiUrl || '❌ MANQUANTE');
  console.log('  VITE_STRIPE_PUBLISHABLE_KEY:', stripeKey ? '✅ Définie' : '❌ Manquante');
  console.log('  VITE_GOOGLE_MAPS_API_KEY:', mapsKey ? '✅ Définie' : '❌ Manquante');

  if (!apiUrl) {
    results.push({ test: 'Variables d\'environnement', status: '❌', error: 'VITE_API_URL non définie' });
    console.error('  ❌ ERREUR: VITE_API_URL non définie dans Vercel');
  } else {
    results.push({ test: 'Variables d\'environnement', status: '✅' });
  }

  // Test 2: Health Check
  console.log('\n🏥 Test 2: Health Check API');
  try {
    const healthResponse = await fetch(`${apiUrl}/health`);
    const healthData = await healthResponse.json();
    if (healthResponse.ok) {
      console.log('  ✅ Backend accessible');
      console.log('  Database:', healthData.database || 'unknown');
      results.push({ test: 'Health Check', status: '✅', data: healthData });
    } else {
      console.error('  ❌ Erreur:', healthResponse.status);
      results.push({ test: 'Health Check', status: '❌', error: `Status ${healthResponse.status}` });
    }
  } catch (error) {
    console.error('  ❌ Erreur de connexion:', error.message);
    results.push({ test: 'Health Check', status: '❌', error: error.message });
  }

  // Test 3: CORS
  console.log('\n🌐 Test 3: CORS');
  try {
    const corsResponse = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
      },
    });
    if (corsResponse.ok || corsResponse.status === 405) {
      console.log('  ✅ CORS configuré correctement');
      results.push({ test: 'CORS', status: '✅' });
    } else {
      console.error('  ❌ Erreur CORS:', corsResponse.status);
      results.push({ test: 'CORS', status: '❌', error: `Status ${corsResponse.status}` });
    }
  } catch (error) {
    console.error('  ❌ Erreur CORS:', error.message);
    results.push({ test: 'CORS', status: '❌', error: error.message });
  }

  // Test 4: Route d'inscription
  console.log('\n📝 Test 4: Route /api/auth/register');
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
    if (registerResponse.ok) {
      console.log('  ✅ Route accessible (inscription réussie)');
      results.push({ test: 'Route /api/auth/register', status: '✅' });
    } else if (registerResponse.status === 400) {
      console.log('  ✅ Route accessible (erreur de validation attendue)');
      console.log('  Message:', registerData.error || 'Validation failed');
      results.push({ test: 'Route /api/auth/register', status: '✅', note: 'Validation error (attendu)' });
    } else {
      console.error('  ❌ Erreur:', registerResponse.status);
      console.error('  Détails:', registerData);
      results.push({ test: 'Route /api/auth/register', status: '❌', error: registerData });
    }
  } catch (error) {
    console.error('  ❌ Erreur:', error.message);
    results.push({ test: 'Route /api/auth/register', status: '❌', error: error.message });
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log('%c📊 RÉSUMÉ', 'font-size: 16px; font-weight: bold;');
  console.table(results);

  const successCount = results.filter(r => r.status === '✅').length;
  const errorCount = results.filter(r => r.status === '❌').length;

  console.log(`\n✅ Réussis: ${successCount}/${results.length}`);
  console.log(`❌ Erreurs: ${errorCount}/${results.length}`);

  if (errorCount > 0) {
    console.log('\n%c⚠️ PROBLÈMES DÉTECTÉS', 'font-size: 14px; font-weight: bold; color: #F44336;');
    results.filter(r => r.status === '❌').forEach(r => {
      console.log(`  - ${r.test}: ${r.error || 'Erreur inconnue'}`);
    });
  } else {
    console.log('\n%c✅ TOUS LES TESTS SONT PASSÉS', 'font-size: 14px; font-weight: bold; color: #4CAF50;');
  }

  return results;
})();
