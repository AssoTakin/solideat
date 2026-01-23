#!/bin/bash

# Script pour finaliser les étapes restantes après l'installation de Stripe CLI
# Usage: ./scripts/finaliser-stripe-etapes-restantes.sh

echo "🚀 Finalisation des étapes restantes - Configuration Stripe CLI"
echo "=============================================================="
echo ""

ENV_FILE="backend/.env"

# Étape 1 : Vérifier la connexion Stripe
echo "📋 ÉTAPE 1/3 : Vérification de la connexion Stripe"
echo "------------------------------------------------"

if stripe config --list &> /dev/null 2>&1; then
    echo "✅ Connecté à Stripe"
    stripe config --list | head -3
else
    echo "❌ Pas encore connecté à Stripe"
    echo ""
    echo "🔐 Pour vous connecter :"
    echo "   1. Exécutez: stripe login"
    echo "   2. Suivez les instructions dans votre navigateur"
    echo "   3. Revenez ici et relancez ce script"
    echo ""
    exit 1
fi

echo ""

# Étape 2 : Vérifier que le backend tourne
echo "📋 ÉTAPE 2/3 : Vérification du backend"
echo "--------------------------------------"

if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend détecté sur http://localhost:3000"
    curl -s http://localhost:3000/health | jq . 2>/dev/null || curl -s http://localhost:3000/health
else
    echo "⚠️  Le backend ne tourne pas sur http://localhost:3000"
    echo ""
    echo "📝 Instructions:"
    echo "   1. Ouvrez un NOUVEAU terminal"
    echo "   2. Exécutez: cd backend && npm run dev"
    echo "   3. Attendez que le serveur démarre"
    echo "   4. Revenez ici et relancez ce script"
    echo ""
    exit 1
fi

echo ""

# Étape 3 : Démarrer Stripe CLI et obtenir le webhook secret
echo "📋 ÉTAPE 3/3 : Obtention du Webhook Secret"
echo "------------------------------------------"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Stripe CLI va démarrer et afficher un Webhook Secret"
echo "   - Le secret commence par 'whsec_'"
echo "   - Copiez ce secret quand il apparaît"
echo "   - Appuyez sur Ctrl+C pour arrêter Stripe CLI après avoir copié le secret"
echo ""
echo "🔗 Les webhooks seront forwardés vers: http://localhost:3000/webhooks/stripe"
echo ""
read -p "Appuyez sur Entrée pour démarrer Stripe CLI... "

echo ""
echo "📡 Démarrage de Stripe CLI..."
echo "   (Appuyez sur Ctrl+C pour arrêter après avoir copié le secret)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Démarrer Stripe CLI
stripe listen --forward-to localhost:3000/webhooks/stripe 2>&1 | tee /tmp/stripe_listen_output.txt &
STRIPE_PID=$!

# Attendre un peu pour que Stripe CLI démarre
sleep 3

# Chercher le secret dans la sortie
WEBHOOK_SECRET=""
for i in {1..10}; do
    if [ -f /tmp/stripe_listen_output.txt ]; then
        WEBHOOK_SECRET=$(grep -o 'whsec_[a-zA-Z0-9_]*' /tmp/stripe_listen_output.txt | head -1)
        if [ ! -z "$WEBHOOK_SECRET" ]; then
            break
        fi
    fi
    sleep 1
done

# Arrêter Stripe CLI
kill $STRIPE_PID 2>/dev/null
wait $STRIPE_PID 2>/dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$WEBHOOK_SECRET" ]; then
    echo "⚠️  Webhook Secret non détecté automatiquement"
    echo ""
    echo "📝 Veuillez copier le Webhook Secret affiché ci-dessus"
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
else
    echo "✅ Webhook Secret détecté: $WEBHOOK_SECRET"
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
echo "   2. Démarrer Stripe CLI dans un terminal séparé :"
echo "      stripe listen --forward-to localhost:3000/webhooks/stripe"
echo "   3. Tester avec: stripe trigger customer.subscription.created"
echo ""
