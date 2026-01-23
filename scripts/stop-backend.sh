#!/bin/bash

# Script pour arrêter le backend qui tourne sur le port 3000
# Usage: ./scripts/stop-backend.sh

echo "🛑 Arrêt du backend sur le port 3000..."
echo ""

PORT=3000
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "✅ Aucun processus ne tourne sur le port $PORT"
    exit 0
fi

echo "📋 Processus trouvé : PID $PID"
ps -p $PID -o pid,comm,args | tail -1
echo ""

read -p "Voulez-vous arrêter ce processus ? (o/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo "🛑 Arrêt du processus $PID..."
    kill $PID
    
    # Attendre un peu
    sleep 2
    
    # Vérifier si le processus est toujours actif
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Le processus ne s'est pas arrêté, utilisation de kill -9..."
        kill -9 $PID
        sleep 1
    fi
    
    # Vérifier à nouveau
    if lsof -ti:$PORT > /dev/null 2>&1; then
        echo "❌ Le port $PORT est toujours utilisé"
    else
        echo "✅ Port $PORT libéré"
        echo ""
        echo "📋 Vous pouvez maintenant redémarrer le backend :"
        echo "   cd backend && npm run dev"
    fi
else
    echo "❌ Annulé"
fi
