#!/bin/bash

# Script pour installer et configurer Stripe CLI
# Usage: ./scripts/setup-stripe-cli.sh

echo "🔧 Configuration de Stripe CLI pour Solid'Eat"
echo ""

# Vérifier si Stripe CLI est installé
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI n'est pas installé"
    echo ""
    echo "Installation..."
    
    if command -v brew &> /dev/null; then
        echo "✅ Installation via Homebrew..."
        brew install stripe/stripe-cli/stripe
    else
        echo "⚠️  Homebrew non trouvé"
        echo ""
        echo "Pour installer Stripe CLI:"
        echo "  1. Installer Homebrew:"
        echo "     /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo ""
        echo "  2. Installer Stripe CLI:"
        echo "     brew install stripe/stripe-cli/stripe"
        echo ""
        echo "Ou télécharger depuis: https://stripe.com/docs/stripe-cli"
        exit 1
    fi
fi

echo "✅ Stripe CLI est installé"
echo ""

# Vérifier si l'utilisateur est connecté
if ! stripe config --list &> /dev/null; then
    echo "🔐 Connexion à Stripe..."
    echo "   Cela va ouvrir votre navigateur pour vous authentifier"
    echo ""
    stripe login
else
    echo "✅ Déjà connecté à Stripe"
fi

echo ""
echo "📋 Instructions pour démarrer:"
echo ""
echo "1. Démarrer le backend (dans un terminal):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Démarrer Stripe CLI (dans un autre terminal):"
echo "   stripe listen --forward-to localhost:3000/webhooks/stripe"
echo ""
echo "3. Copier le Webhook Secret affiché (whsec_...)"
echo ""
echo "4. Ajouter dans backend/.env:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_xxxxx"
echo ""
echo "5. Redémarrer le backend"
echo ""
echo "6. Tester avec:"
echo "   stripe trigger customer.subscription.created"
echo ""
