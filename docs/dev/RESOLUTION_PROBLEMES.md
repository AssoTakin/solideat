# RÉSOLUTION DES PROBLÈMES - DÉMARRAGE LOCAL

**Date** : 2026  
**Agent** : DEV

---

## 🐛 PROBLÈMES COURANTS

### 1. Erreur : "User was denied access on the database"

**Symptôme** :
```
Error: P1010: User `postgres` was denied access on the database `solideat.public`
```

**Solutions** :

#### Option A : Créer la base de données
```bash
# Se connecter à PostgreSQL en tant qu'utilisateur avec droits
psql -U postgres

# Créer la base de données
CREATE DATABASE solideat;

# Donner les droits à l'utilisateur
GRANT ALL PRIVILEGES ON DATABASE solideat TO postgres;

# Quitter
\q
```

#### Option B : Utiliser un autre utilisateur
Modifier `backend/.env` :
```env
DATABASE_URL=postgresql://votre_utilisateur:votre_mot_de_passe@localhost:5432/solideat
```

#### Option C : Utiliser Supabase (cloud)
1. Créer un compte sur [Supabase](https://supabase.com/)
2. Créer un nouveau projet
3. Copier la connection string
4. Modifier `backend/.env` :
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

---

### 2. Redis non disponible

**Symptôme** :
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions** :

#### Option A : Installer Redis (macOS)
```bash
brew install redis
brew services start redis
```

#### Option B : Utiliser Upstash (cloud, gratuit)
1. Créer un compte sur [Upstash](https://upstash.com/)
2. Créer un nouveau database Redis
3. Copier la connection string
4. Modifier `backend/.env` :
```env
REDIS_URL=redis://default:[PASSWORD]@[HOST]:[PORT]
```

#### Option C : Désactiver temporairement Redis
L'application fonctionnera mais certaines fonctionnalités (cache, queues) ne marcheront pas.

---

### 3. Port déjà utilisé

**Symptôme** :
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions** :

#### Option A : Trouver et arrêter le processus
```bash
# Trouver le processus
lsof -ti:3000

# Arrêter le processus
kill -9 $(lsof -ti:3000)
```

#### Option B : Changer le port
Modifier `backend/.env` :
```env
PORT=3001
```

Et `frontend/.env` :
```env
VITE_API_URL=http://localhost:3001
```

---

### 4. Migrations Prisma non appliquées

**Symptôme** :
```
Error: Migration engine failed to connect to database
```

**Solutions** :

```bash
cd backend

# Réinitialiser les migrations (⚠️ supprime les données)
npx prisma migrate reset

# Ou appliquer les migrations
npx prisma migrate dev

# Générer le client Prisma
npx prisma generate
```

---

## 🚀 DÉMARRAGE RAPIDE SANS BASE DE DONNÉES

Pour voir uniquement le frontend (interface utilisateur) :

### 1. Démarrer le frontend uniquement

```bash
cd frontend
npm run dev
```

Ouvrir http://localhost:5173

⚠️ **Note** : Sans backend, seules les pages statiques s'afficheront. Les fonctionnalités nécessitant l'API ne fonctionneront pas.

### 2. Utiliser un backend mock (optionnel)

Pour tester le frontend avec des données fictives, vous pouvez utiliser [JSON Server](https://github.com/typicode/json-server) :

```bash
# Installer JSON Server
npm install -g json-server

# Créer un fichier db.json avec des données mock
# (exemple dans docs/dev/db.json.example)

# Démarrer JSON Server
json-server --watch db.json --port 3000
```

---

## ✅ CHECKLIST DE VÉRIFICATION

Avant de lancer l'application complète :

- [ ] PostgreSQL installé et en cours d'exécution
- [ ] Base de données `solideat` créée
- [ ] Utilisateur PostgreSQL a les droits sur la base
- [ ] Redis installé et en cours d'exécution (ou service cloud)
- [ ] Variables d'environnement configurées (`.env`)
- [ ] Migrations Prisma appliquées
- [ ] Dépendances installées (`npm install`)

---

## 🔧 COMMANDES UTILES

### Vérifier l'état de PostgreSQL
```bash
# Vérifier si PostgreSQL est en cours d'exécution
pg_isready

# Se connecter à PostgreSQL
psql -U postgres

# Lister les bases de données
\l

# Se connecter à une base de données
\c solideat
```

### Vérifier l'état de Redis
```bash
# Vérifier si Redis est en cours d'exécution
redis-cli ping

# Se connecter à Redis
redis-cli

# Tester une commande
PING
```

### Prisma
```bash
cd backend

# Voir l'état des migrations
npx prisma migrate status

# Appliquer les migrations
npx prisma migrate dev

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio

# Générer le client Prisma
npx prisma generate
```

---

## 📞 AIDE SUPPLÉMENTAIRE

Si les problèmes persistent :

1. Vérifier les logs du backend : `cd backend && npm run dev`
2. Vérifier les logs du frontend : `cd frontend && npm run dev`
3. Vérifier la console du navigateur (F12)
4. Consulter la documentation Prisma : https://www.prisma.io/docs
5. Consulter la documentation Redis : https://redis.io/docs

---

**Document créé par** : DEV  
**Dernière mise à jour** : 2026
