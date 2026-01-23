#!/bin/bash

# Script pour finaliser la configuration Stripe CLI
# Usage: ./scripts/finaliser-stripe.sh

echo "🚀 Finalisation de la configuration Stripe CLI"
echo ""

ENV_FILE="backend/.env"

# Étape 1 : Vérifier si Stripe CLI est installé
echo "📋 Étape 1 : Vérification de Stripe CLI..."
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI n'est pas installé"
    echo ""
    echo "📥 Téléchargement et installation en cours..."
    
    ARCH=$(uname -m)
    if [ "$ARCH" = "arm64" ]; then
        ARCH_TYPE="arm64"
    else
        ARCH_TYPE="x86_64"
    fi
    
    VERSION="1.34.0"
    URL="https://github.com/stripe/stripe-cli/releases/download/v${VERSION}/stripe_${VERSION}_macOS_${ARCH_TYPE}.tar.gz"
    
    cd /tmp
    curl -L "$URL" -o stripe.tar.gz
    
    if [ -f stripe.tar.gz ] && [ -s stripe.tar.gz ]; then
        tar -xzf stripe.tar.gz
        if [ -f stripe ]; then
            sudo mv stripe /usr/local/bin/stripe
            sudo chmod +x /usr/local/bin/stripe
            echo "✅ Stripe CLI installé"
        else
            echo "❌ Échec de l'extraction"
            exit 1
        fi
    else
        echo "❌ Échec du téléchargement"
        echo "   Téléchargez manuellement depuis: https://github.com/stripe/stripe-cli/releases/latest"
        exit 1
    fi
else
    echo "✅ Stripe CLI est installé"
    stripe --version
fi

echo ""

# Étape 2 : Vérifier la connexion Stripe
echo "📋 Étape 2 : Vérification de la connexion Stripe..."
if ! stripe config --list &> /dev/null 2>&1; then
    echo "🔐 Connexion à Stripe requise..."
    echo "   Cela va ouvrir votre navigateur pour vous authentifier"
    echo ""
    read -p "Appuyez sur Entrée pour continuer... "
    stripe login
    
    if [ $? -ne 0 ]; then
        echo "❌ Échec de la connexion à Stripe"
        exit 1
    fi
else
    echo "✅ Déjà connecté à Stripe"
    stripe config --list | head -3
fi

echo ""

# Étape 3 : Vérifier que le backend tourne
echo "📋 Étape 3 : Vérification du backend..."
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
    
    if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "❌ Le backend ne répond toujours pas"
        exit 1
    fi
fi

echo "✅ Backend détecté"
echo ""

# Étape 4 : Démarrer Stripe CLI et obtenir le webhook secret
echo "📋 Étape 4 : Démarrage de Stripe CLI..."
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Stripe CLI va démarrer et afficher un Webhook Secret"
echo "   - Copiez ce secret (commence par whsec_...)"
echo "   - Appuyez sur Ctrl+C pour arrêter Stripe CLI"
echo ""
echo "🔗 Les webhooks seront forwardés vers: http://localhost:3000/webhooks/stripe"
echo ""
read -p "Appuyez sur Entrée pour démarrer Stripe CLI... "

# Démarrer Stripe CLI en arrière-plan et capturer le secret
echo ""
echo "📡 Démarrage de Stripe CLI..."
echo ""

# Créer un script temporaire pour capturer le secret
cat > /tmp/capture_stripe_secret.sh << 'EOF'
#!/bin/bash
stripe listen --forward-to localhost:3000/webhooks/stripe 2>&1 | while IFS= read -r line; do
    echo "$line"
    if [[ "$line" == *"whsec_"* ]]; then
        SECRET=$(echo "$line" | grep -o 'whsec_[a-zA-Z0-9_]*' | head -1)
        if [ ! -z "$SECRET" ]; then
            echo "$SECRET" > /tmp/stripe_webhook_secret.txt
            echo ""
            echo "✅ Webhook Secret capturé: $SECRET"
            echo "   Vous pouvez maintenant arrêter Stripe CLI (Ctrl+C)"
        fi
    fi
done
EOF

chmod +x /tmp/capture_stripe_secret.sh

# Démarrer Stripe CLI
stripe listen --forward-to localhost:3000/webhooks/stripe

# Après avoir arrêté Stripe CLI, vérifier si le secret a été capturé
if [ -f /tmp/stripe_webhook_secret.txt ]; then
    WEBHOOK_SECRET=$(cat /tmp/stripe_webhook_secret.txt)
    echo ""
    echo "✅ Webhook Secret obtenu: $WEBHOOK_SECRET"
    echo ""
    
    # Étape 5 : Mettre à jour .env
    echo "📋 Étape 5 : Mise à jour de $ENV_FILE..."
    
    if [ -f "$ENV_FILE" ]; then
        if grep -q "^STRIPE_WEBHOOK_SECRET=" "$ENV_FILE"; then
            # Mettre à jour la ligne existante
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=${WEBHOOK_SECRET}|" "$ENV_FILE"
            else
                sed -i "s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=${WEBHOOK_SECRET}|" "$ENV_FILE"
            fi
            echo "✅ STRIPE_WEBHOOK_SECRET mis à jour dans $ENV_FILE"
        else
            # Ajouter la ligne
            echo "STRIPE_WEBHOOK_SECRET=${WEBHOOK_SECRET}" >> "$ENV_FILE"
            echo "✅ STRIPE_WEBHOOK_SECRET ajouté dans $ENV_FILE"
        fi
        
        echo ""
        echo "📝 Configuration mise à jour :"
        grep "^STRIPE_WEBHOOK_SECRET=" "$ENV_FILE"
        echo ""
        echo "✅ Configuration terminée !"
        echo ""
        echo "📋 Prochaines étapes :"
        echo "   1. Redémarrer le backend (Ctrl+C puis npm run dev)"
        echo "   2. Tester avec: stripe trigger customer.subscription.created"
    else
        echo "❌ Fichier $ENV_FILE non trouvé"
        echo "   Ajoutez manuellement dans $ENV_FILE :"
        echo "   STRIPE_WEBHOOK_SECRET=${WEBHOOK_SECRET}"
    fi
else
    echo ""
    echo "⚠️  Webhook Secret non capturé automatiquement"
    echo "   Copiez manuellement le secret affiché ci-dessus"
    echo "   Et ajoutez-le dans $ENV_FILE :"
    echo "   STRIPE_WEBHOOK_SECRET=whsec_xxxxx"
fi
