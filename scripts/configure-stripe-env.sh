#!/bin/bash

# Script pour configurer automatiquement les variables Stripe dans .env
# Usage: ./scripts/configure-stripe-env.sh

echo "🔧 Configuration des variables Stripe dans backend/.env"
echo ""

ENV_FILE="backend/.env"

# Vérifier si le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Le fichier $ENV_FILE n'existe pas"
    echo "   Création depuis .env.example..."
    cp backend/.env.example "$ENV_FILE"
fi

# Configuration Stripe
STRIPE_SECRET_KEY="sk_test_VOTRE_CLE_SECRETE_ICI"
STRIPE_PUBLISHABLE_KEY="pk_test_VOTRE_CLE_PUBLIQUE_ICI"
STRIPE_PRICE_ID_WEEKLY="price_1SskWJEKzPeYzUocyJFFovsz"
STRIPE_PRICE_ID_MONTHLY="price_1SskX7EKzPeYzUoc6e7K1qV3"
STRIPE_PRICE_ID_YEARLY="price_1SskZOEKzPeYzUocbtrhA6Ry"

echo "📝 Mise à jour des variables Stripe..."

# Fonction pour mettre à jour ou ajouter une variable
update_env_var() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" "$ENV_FILE"; then
        # Variable existe, la mettre à jour
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        else
            # Linux
            sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        fi
        echo "  ✅ ${key} mis à jour"
    else
        # Variable n'existe pas, l'ajouter
        echo "${key}=${value}" >> "$ENV_FILE"
        echo "  ✅ ${key} ajouté"
    fi
}

# Mettre à jour les variables Stripe
update_env_var "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
update_env_var "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY"
update_env_var "STRIPE_PRICE_ID_WEEKLY" "$STRIPE_PRICE_ID_WEEKLY"
update_env_var "STRIPE_PRICE_ID_MONTHLY" "$STRIPE_PRICE_ID_MONTHLY"
update_env_var "STRIPE_PRICE_ID_YEARLY" "$STRIPE_PRICE_ID_YEARLY"

echo ""
echo "✅ Configuration Stripe mise à jour dans $ENV_FILE"
echo ""
echo "⚠️  IMPORTANT :"
echo "   Le STRIPE_WEBHOOK_SECRET sera ajouté automatiquement"
echo "   quand vous démarrerez 'stripe listen'"
echo ""
echo "   Pour l'instant, vous pouvez laisser :"
echo "   STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER"
echo ""
echo "   Ou l'ajouter manuellement après avoir démarré Stripe CLI"
