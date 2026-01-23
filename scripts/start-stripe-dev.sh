#!/bin/bash

# Script pour démarrer l'environnement de développement avec Stripe CLI
# Usage: ./scripts/start-stripe-dev.sh

echo "🚀 Démarrage de l'environnement de développement Stripe"
echo ""

# Vérifier si Stripe CLI est installé
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI n'est pas installé"
    echo "   Exécutez d'abord: ./scripts/setup-stripe-cli.sh"
    exit 1
fi

# Vérifier si le backend tourne
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "⚠️  Le backend ne semble pas tourner sur http://localhost:3000"
    echo "   Démarrez le backend dans un autre terminal:"
    echo "   cd backend && npm run dev"
    echo ""
    read -p "Continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Backend détecté"
echo ""
echo "📡 Démarrage de Stripe CLI..."
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Copiez le Webhook Secret affiché (whsec_...)"
echo "   - Ajoutez-le dans backend/.env si ce n'est pas déjà fait"
echo "   - Appuyez sur Ctrl+C pour arrêter"
echo ""
echo "🔗 Les webhooks seront forwardés vers: http://localhost:3000/webhooks/stripe"
echo ""

# Démarrer Stripe CLI
stripe listen --forward-to localhost:3000/webhooks/stripe
