#!/bin/bash

# Script pour résoudre les problèmes de connexion Stripe CLI
# Usage: ./scripts/resoudre-connexion-stripe.sh

echo "🔧 Résolution des problèmes de connexion Stripe CLI"
echo "===================================================="
echo ""

# Étape 1 : Vérifier Stripe CLI
echo "📋 ÉTAPE 1 : Vérification de Stripe CLI"
echo "----------------------------------------"

if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI n'est pas installé"
    echo ""
    echo "📥 Installation requise :"
    echo "   1. Aller sur : https://github.com/stripe/stripe-cli/releases/latest"
    echo "   2. Télécharger : stripe_X.X.X_macOS_arm64.tar.gz"
    echo "   3. Extraire : tar -xzf stripe_*.tar.gz"
    echo "   4. Installer : sudo mv stripe /usr/local/bin/"
    echo ""
    exit 1
fi

echo "✅ Stripe CLI installé"
stripe --version
echo ""

# Étape 2 : Nettoyer la configuration si nécessaire
echo "📋 ÉTAPE 2 : Vérification de la configuration"
echo "----------------------------------------------"

if [ -d ~/.config/stripe ]; then
    echo "📁 Configuration Stripe trouvée"
    
    # Vérifier si la connexion fonctionne
    if stripe config --list &> /dev/null 2>&1; then
        echo "✅ Déjà connecté à Stripe"
        stripe config --list | head -3
        echo ""
        echo "✅ Connexion Stripe OK !"
        exit 0
    else
        echo "⚠️  Configuration trouvée mais connexion invalide"
        echo ""
        read -p "Voulez-vous nettoyer la configuration et réessayer ? (o/N) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Oo]$ ]]; then
            echo "🧹 Nettoyage de la configuration..."
            rm -rf ~/.config/stripe
            echo "✅ Configuration nettoyée"
        fi
    fi
else
    echo "📁 Aucune configuration Stripe trouvée"
fi

echo ""

# Étape 3 : Réessayer la connexion
echo "📋 ÉTAPE 3 : Connexion à Stripe"
echo "--------------------------------"

echo "🔐 Connexion à Stripe..."
echo "   Cela va ouvrir votre navigateur pour vous authentifier"
echo ""
echo "⚠️  IMPORTANT :"
echo "   - Ne fermez pas ce terminal pendant l'authentification"
echo "   - Terminez l'authentification dans le navigateur"
echo "   - Si le navigateur ne s'ouvre pas, copiez l'URL affichée"
echo ""
read -p "Appuyez sur Entrée pour continuer... "

echo ""
echo "🔗 Démarrage de l'authentification..."
echo ""

stripe login

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Connexion réussie !"
    echo ""
    echo "📋 Vérification de la configuration..."
    stripe config --list | head -3
    echo ""
    echo "✅ Tout est prêt !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "   1. Vérifier que le backend tourne : curl http://localhost:3000/health"
    echo "   2. Démarrer Stripe CLI listen : stripe listen --forward-to localhost:3000/webhooks/stripe"
    echo "   3. Copier le webhook secret et mettre à jour backend/.env"
else
    echo ""
    echo "❌ Échec de la connexion"
    echo ""
    echo "🔧 Solutions possibles :"
    echo "   1. Vérifier votre connexion internet"
    echo "   2. Vérifier que vous pouvez accéder à https://dashboard.stripe.com"
    echo "   3. Réessayer : stripe login"
    echo "   4. Consulter : docs/dev/RESOLUTION_ERREUR_STRIPE.md"
    exit 1
fi
