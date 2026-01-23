#!/bin/bash

# Script interactif pour finaliser la configuration Stripe CLI
# Usage: ./scripts/finaliser-stripe-interactif.sh

echo "🚀 Finalisation de la configuration Stripe CLI"
echo "=============================================="
echo ""

ENV_FILE="backend/.env"

# Étape 1 : Vérifier/Installer Stripe CLI
echo "📋 ÉTAPE 1/4 : Installation de Stripe CLI"
echo "----------------------------------------"

if command -v stripe &> /dev/null; then
    echo "✅ Stripe CLI est déjà installé"
    stripe --version
else
    echo "❌ Stripe CLI n'est pas installé"
    echo ""
    echo "📥 Installation manuelle requise :"
    echo ""
    echo "   1. Aller sur : https://github.com/stripe/stripe-cli/releases/latest"
    echo "   2. Télécharger : stripe_X.X.X_macOS_arm64.tar.gz (pour Apple Silicon)"
    echo "   3. Extraire : tar -xzf stripe_*.tar.gz"
    echo "   4. Installer : sudo mv stripe /usr/local/bin/"
    echo ""
    read -p "Appuyez sur Entrée une fois Stripe CLI installé... "
    
    if ! command -v stripe &> /dev/null; then
        echo "❌ Stripe CLI toujours non installé"
        echo "   Vérifiez l'installation et réessayez"
        exit 1
    fi
    
    echo "✅ Stripe CLI installé"
    stripe --version
fi

echo ""

# Étape 2 : Se connecter à Stripe
echo "📋 ÉTAPE 2/4 : Connexion à Stripe"
echo "----------------------------------"

if stripe config --list &> /dev/null 2>&1; then
    echo "✅ Déjà connecté à Stripe"
    stripe config --list | head -3
else
    echo "🔐 Connexion à Stripe requise..."
    echo "   Cela va ouvrir votre navigateur pour vous authentifier"
    echo ""
    read -p "Appuyez sur Entrée pour continuer... "
    
    stripe login
    
    if [ $? -ne 0 ]; then
        echo "❌ Échec de la connexion à Stripe"
        exit 1
    fi
    
    echo "✅ Connecté à Stripe"
fi

echo ""

# Étape 3 : Vérifier le backend
echo "📋 ÉTAPE 3/4 : Vérification du backend"
echo "--------------------------------------"

if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend détecté sur http://localhost:3000"
else
    echo "⚠️  Le backend ne tourne pas sur http://localhost:3000"
    echo ""
    echo "📝 Instructions:"
    echo "   1. Ouvrez un NOUVEAU terminal"
    echo "   2. Exécutez: cd backend && npm run dev"
    echo "   3. Attendez que le serveur démarre"
    echo "   4. Revenez ici et appuyez sur Entrée"
    echo ""
    read -p "Appuyez sur Entrée quand le backend est démarré... "
    
    if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "❌ Le backend ne répond toujours pas"
        echo "   Vérifiez que le backend tourne sur http://localhost:3000"
        exit 1
    fi
    
    echo "✅ Backend détecté"
fi

echo ""

# Étape 4 : Démarrer Stripe CLI et obtenir le secret
echo "📋 ÉTAPE 4/4 : Démarrage de Stripe CLI et obtention du Webhook Secret"
echo "----------------------------------------------------------------------"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Stripe CLI va démarrer et afficher un Webhook Secret"
echo "   - Le secret commence par 'whsec_'"
echo "   - Copiez ce secret"
echo "   - Appuyez sur Ctrl+C pour arrêter Stripe CLI"
echo ""
echo "🔗 Les webhooks seront forwardés vers: http://localhost:3000/webhooks/stripe"
echo ""
read -p "Appuyez sur Entrée pour démarrer Stripe CLI... "

echo ""
echo "📡 Démarrage de Stripe CLI..."
echo "   (Appuyez sur Ctrl+C pour arrêter après avoir copié le secret)"
echo ""

# Démarrer Stripe CLI
stripe listen --forward-to localhost:3000/webhooks/stripe

# Après avoir arrêté Stripe CLI
echo ""
echo ""
echo "📝 Maintenant, copiez le Webhook Secret affiché ci-dessus"
echo "   (Il commence par 'whsec_...')"
echo ""
read -p "Collez le Webhook Secret ici: " WEBHOOK_SECRET

if [ -z "$WEBHOOK_SECRET" ] || [[ ! "$WEBHOOK_SECRET" =~ ^whsec_ ]]; then
    echo "❌ Webhook Secret invalide (doit commencer par 'whsec_')"
    echo ""
    echo "Vous pouvez l'ajouter manuellement dans $ENV_FILE :"
    echo "STRIPE_WEBHOOK_SECRET=whsec_xxxxx"
    exit 1
fi

# Mettre à jour .env
echo ""
echo "📋 Mise à jour de $ENV_FILE..."

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Fichier $ENV_FILE non trouvé"
    exit 1
fi

if grep -q "^STRIPE_WEBHOOK_SECRET=" "$ENV_FILE"; then
    # Mettre à jour la ligne existante
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=${WEBHOOK_SECRET}|" "$ENV_FILE"
    else
        sed -i "s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=${WEBHOOK_SECRET}|" "$ENV_FILE"
    fi
    echo "✅ STRIPE_WEBHOOK_SECRET mis à jour"
else
    # Ajouter la ligne
    echo "STRIPE_WEBHOOK_SECRET=${WEBHOOK_SECRET}" >> "$ENV_FILE"
    echo "✅ STRIPE_WEBHOOK_SECRET ajouté"
fi

echo ""
echo "📝 Configuration mise à jour :"
grep "^STRIPE_WEBHOOK_SECRET=" "$ENV_FILE"
echo ""

echo "✅ Configuration terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Redémarrer le backend (dans le terminal du backend: Ctrl+C puis npm run dev)"
echo "   2. Redémarrer Stripe CLI (dans un terminal: stripe listen --forward-to localhost:3000/webhooks/stripe)"
echo "   3. Tester avec: stripe trigger customer.subscription.created"
echo ""
