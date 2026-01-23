#!/bin/bash

# Script pour démarrer complètement l'environnement Stripe
# Usage: ./scripts/start-stripe-complete.sh

echo "🚀 Démarrage complet de l'environnement Stripe"
echo ""

# Vérifier si Stripe CLI est installé
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI n'est pas installé"
    echo "   Installation en cours..."
    if command -v brew &> /dev/null; then
        brew install stripe/stripe-cli/stripe
    else
        echo "   ⚠️  Homebrew non trouvé. Installez Stripe CLI manuellement:"
        echo "   https://stripe.com/docs/stripe-cli"
        exit 1
    fi
fi

echo "✅ Stripe CLI installé"
echo ""

# Vérifier la connexion Stripe
if ! stripe config --list &> /dev/null 2>&1; then
    echo "🔐 Connexion à Stripe requise..."
    echo "   Cela va ouvrir votre navigateur pour vous authentifier"
    echo ""
    stripe login
    if [ $? -ne 0 ]; then
        echo "❌ Échec de la connexion à Stripe"
        exit 1
    fi
else
    echo "✅ Déjà connecté à Stripe"
fi

echo ""
echo "📋 Vérification du backend..."
echo ""

# Vérifier si le backend tourne
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "⚠️  Le backend ne tourne pas sur http://localhost:3000"
    echo ""
    echo "📝 Instructions:"
    echo "   1. Ouvrez un NOUVEAU terminal"
    echo "   2. Exécutez: cd backend && npm run dev"
    echo "   3. Attendez que le serveur démarre"
    echo "   4. Revenez ici et appuyez sur Entrée"
    echo ""
    read -p "Appuyez sur Entrée quand le backend est démarré... "
    
    # Vérifier à nouveau
    if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "❌ Le backend ne répond toujours pas"
        echo "   Vérifiez que le backend tourne sur http://localhost:3000"
        exit 1
    fi
fi

echo "✅ Backend détecté"
echo ""
echo "📡 Démarrage de Stripe CLI..."
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Un Webhook Secret va être affiché"
echo "   - Copiez-le (commence par whsec_...)"
echo "   - Appuyez sur Ctrl+C pour arrêter Stripe CLI"
echo ""
echo "🔗 Les webhooks seront forwardés vers: http://localhost:3000/webhooks/stripe"
echo ""
echo "💡 Astuce: Ouvrez un autre terminal pour voir les logs du backend"
echo ""

# Démarrer Stripe CLI
stripe listen --forward-to localhost:3000/webhooks/stripe
