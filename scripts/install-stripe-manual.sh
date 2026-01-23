#!/bin/bash

# Script pour installer Stripe CLI manuellement (sans Homebrew)
# Usage: ./scripts/install-stripe-manual.sh

echo "🔧 Installation manuelle de Stripe CLI"
echo ""

ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    ARCH_TYPE="arm64"
    echo "✅ Architecture détectée: Apple Silicon (arm64)"
else
    ARCH_TYPE="x86_64"
    echo "✅ Architecture détectée: Intel (x86_64)"
fi

VERSION="1.34.0"
URL="https://github.com/stripe/stripe-cli/releases/download/v${VERSION}/stripe_${VERSION}_macOS_${ARCH_TYPE}.tar.gz"

echo "📥 Téléchargement de Stripe CLI v${VERSION}..."
cd /tmp

curl -L "$URL" -o stripe.tar.gz

if [ ! -f stripe.tar.gz ] || [ ! -s stripe.tar.gz ]; then
    echo "❌ Échec du téléchargement"
    echo ""
    echo "📝 Installation manuelle:"
    echo "   1. Aller sur: https://github.com/stripe/stripe-cli/releases/latest"
    echo "   2. Télécharger: stripe_${VERSION}_macOS_${ARCH_TYPE}.tar.gz"
    echo "   3. Extraire: tar -xzf stripe_${VERSION}_macOS_${ARCH_TYPE}.tar.gz"
    echo "   4. Installer: sudo mv stripe /usr/local/bin/"
    exit 1
fi

echo "✅ Téléchargement réussi"
echo "📦 Extraction..."

tar -xzf stripe.tar.gz

if [ ! -f stripe ]; then
    echo "❌ Échec de l'extraction"
    exit 1
fi

echo "✅ Extraction réussie"
echo ""
echo "🔐 Installation dans /usr/local/bin/ (nécessite sudo)..."
echo ""

sudo mv stripe /usr/local/bin/stripe
sudo chmod +x /usr/local/bin/stripe

if command -v stripe &> /dev/null; then
    echo "✅ Stripe CLI installé avec succès !"
    echo ""
    stripe --version
    echo ""
    echo "🎉 Vous pouvez maintenant utiliser: stripe login"
else
    echo "❌ Échec de l'installation"
    exit 1
fi
