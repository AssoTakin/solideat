#!/bin/bash
# Script pour installer ngrok sur macOS

echo "🔧 Installation de ngrok..."

if command -v brew &> /dev/null; then
    echo "✅ Homebrew détecté, installation via brew..."
    brew install ngrok
else
    echo "⚠️  Homebrew non trouvé"
    echo ""
    echo "Option 1 : Installer Homebrew puis ngrok"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "  brew install ngrok"
    echo ""
    echo "Option 2 : Télécharger ngrok manuellement"
    echo "  1. Aller sur https://ngrok.com/download"
    echo "  2. Télécharger pour macOS"
    echo "  3. Extraire et déplacer dans /usr/local/bin/"
    exit 1
fi

echo ""
echo "✅ ngrok installé !"
echo ""
echo "Vérifier l'installation :"
echo "  ngrok version"
