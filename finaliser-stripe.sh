#!/bin/bash

# Script pour finaliser Stripe CLI
# À exécuter depuis la racine du projet

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Finalisation de Stripe CLI"
echo "=============================="
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "scripts" ]; then
    echo "❌ Erreur : Ce script doit être exécuté depuis la racine du projet"
    echo "   Répertoire actuel : $(pwd)"
    exit 1
fi

# Exécuter le script dans scripts/
if [ -f "scripts/installer-et-finaliser-stripe.sh" ]; then
    bash "scripts/installer-et-finaliser-stripe.sh"
else
    echo "❌ Script non trouvé : scripts/installer-et-finaliser-stripe.sh"
    exit 1
fi
