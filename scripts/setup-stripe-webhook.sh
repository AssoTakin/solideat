#!/bin/bash

# Script pour configurer le webhook Stripe avec ngrok
# Usage: ./scripts/setup-stripe-webhook.sh

echo "🔧 Configuration du webhook Stripe avec ngrok"
echo ""

# Vérifier si ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok n'est pas installé"
    echo ""
    echo "Pour installer ngrok sur macOS:"
    echo "  brew install ngrok"
    echo ""
    echo "Ou télécharger depuis: https://ngrok.com/download"
    exit 1
fi

echo "✅ ngrok est installé"
echo ""

# Vérifier si le backend tourne
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "⚠️  Le backend ne semble pas tourner sur http://localhost:3000"
    echo "   Démarrez le backend avec: cd backend && npm run dev"
    echo ""
    read -p "Continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🚀 Démarrage de ngrok..."
echo ""
echo "📋 Instructions:"
echo "1. ngrok va démarrer et afficher une URL HTTPS"
echo "2. Copiez cette URL (ex: https://abc123.ngrok.io)"
echo "3. Dans Stripe Dashboard, créez un webhook avec cette URL:"
echo "   https://dashboard.stripe.com/acct_1L5u5cEKzPeYzUoc/test/webhooks"
echo "4. URL du webhook: https://VOTRE-URL-NGROK/webhooks/stripe"
echo "5. Sélectionnez les événements:"
echo "   - customer.subscription.created"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo "6. Récupérez le Webhook Secret et ajoutez-le dans backend/.env"
echo ""
echo "⚠️  Note: L'URL ngrok change à chaque redémarrage"
echo "   Vous devrez mettre à jour le webhook dans Stripe si vous redémarrez ngrok"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter ngrok"
echo ""

# Démarrer ngrok
ngrok http 3000
