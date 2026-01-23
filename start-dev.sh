#!/bin/bash

# Script de démarrage rapide pour SOLID'EAT
# Usage: ./start-dev.sh

echo "🚀 Démarrage de SOLID'EAT en mode développement..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier Node.js
echo "📦 Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"

# Vérifier PostgreSQL
echo ""
echo "🐘 Vérification de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL n'est pas installé ou pas dans le PATH${NC}"
else
    PSQL_VERSION=$(psql --version | head -n1)
    echo -e "${GREEN}✅ $PSQL_VERSION${NC}"
fi

# Vérifier Redis
echo ""
echo "🔴 Vérification de Redis..."
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis n'est pas installé ou pas dans le PATH${NC}"
    echo -e "${YELLOW}   Certaines fonctionnalités ne fonctionneront pas${NC}"
else
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis est en cours d'exécution${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis n'est pas en cours d'exécution${NC}"
        echo -e "${YELLOW}   Démarrez Redis avec: redis-server${NC}"
    fi
fi

# Vérifier les dépendances
echo ""
echo "📚 Vérification des dépendances..."

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installation des dépendances backend...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installation des dépendances frontend...${NC}"
    cd frontend && npm install && cd ..
fi

echo -e "${GREEN}✅ Dépendances installées${NC}"

# Vérifier la base de données
echo ""
echo "🗄️  Vérification de la base de données..."
cd backend

# Vérifier si Prisma est configuré
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Fichier schema.prisma introuvable${NC}"
    exit 1
fi

# Vérifier les migrations
echo -e "${YELLOW}ℹ️  Vérification des migrations...${NC}"
npx prisma migrate status &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Les migrations doivent être appliquées${NC}"
    echo -e "${YELLOW}   Exécutez: cd backend && npx prisma migrate dev${NC}"
fi

cd ..

# Démarrer les services
echo ""
echo "🎯 Démarrage des services..."
echo ""
echo -e "${GREEN}✅ Backend: http://localhost:3000${NC}"
echo -e "${GREEN}✅ Frontend: http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}⚠️  Ouvrez deux terminaux:${NC}"
echo -e "${YELLOW}   Terminal 1: cd backend && npm run dev${NC}"
echo -e "${YELLOW}   Terminal 2: cd frontend && npm run dev${NC}"
echo ""
echo -e "${GREEN}🌐 Ouvrez http://localhost:5173 dans votre navigateur${NC}"
