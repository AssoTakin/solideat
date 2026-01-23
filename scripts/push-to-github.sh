#!/bin/bash

# Script pour pousser vers GitHub
# Usage: ./scripts/push-to-github.sh

echo "🚀 Push vers GitHub - AssoTakin/solideat"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.."

# Vérifier que nous sommes sur main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Vous n'êtes pas sur la branche main (actuellement: $CURRENT_BRANCH)"
    read -p "Voulez-vous basculer sur main ? (o/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        git checkout main
    else
        echo "❌ Annulé"
        exit 1
    fi
fi

echo "📋 Branche actuelle: $(git branch --show-current)"
echo ""

# Vérifier les commits à pousser
COMMITS_AHEAD=$(git rev-list --count origin/main..main 2>/dev/null || echo "0")
if [ "$COMMITS_AHEAD" = "0" ]; then
    echo "✅ Aucun commit à pousser"
    echo "   Tout est déjà à jour sur GitHub"
    exit 0
fi

echo "📦 Commits à pousser: $COMMITS_AHEAD"
echo ""
git log --oneline origin/main..main | head -5
echo ""

# Demander confirmation
read -p "Voulez-vous pousser ces commits vers GitHub ? (o/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

echo ""
echo "📤 Push en cours..."
echo ""

# Essayer le push
if git push -u origin main; then
    echo ""
    echo "✅ Push réussi !"
    echo ""
    echo "🔗 Repository: https://github.com/AssoTakin/solideat"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Vérifier sur GitHub: https://github.com/AssoTakin/solideat"
    echo "   2. Connecter Railway: New Project → Deploy from GitHub repo"
    echo "   3. Connecter Vercel: Add New → Project → Import Git Repository"
else
    echo ""
    echo "❌ Échec du push"
    echo ""
    echo "💡 Solutions possibles:"
    echo "   1. Vérifier votre authentification GitHub"
    echo "   2. Utiliser un Personal Access Token"
    echo "   3. Configurer SSH (voir docs/dev/GUIDE_CONNEXION_GITHUB.md)"
    exit 1
fi
