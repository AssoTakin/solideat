# 🔑 CRÉER UN PERSONAL ACCESS TOKEN GITHUB

**Date** : 23 janvier 2026  
**Objectif** : Créer un token pour pousser vers GitHub

---

## 🎯 ÉTAPES POUR CRÉER UN TOKEN

### Étape 1 : Accéder aux paramètres

1. **Se connecter** à GitHub : https://github.com
2. **Cliquer sur** votre avatar (en haut à droite)
3. **Cliquer sur** : **"Settings"** (Paramètres)

### Étape 2 : Accéder aux Developer settings

1. **Dans le menu de gauche**, faire défiler vers le bas
2. **Cliquer sur** : **"Developer settings"** (en bas de la liste)

### Étape 3 : Accéder aux Personal access tokens

1. **Dans le menu de gauche**, cliquer sur :
   - **"Personal access tokens"** → **"Tokens (classic)"**
   
   **OU** (nouvelle interface) :
   - **"Personal access tokens"** → **"Fine-grained tokens"**

**Recommandation** : Utiliser **"Tokens (classic)"** (plus simple)

### Étape 4 : Générer un nouveau token

1. **Cliquer sur** : **"Generate new token"** → **"Generate new token (classic)"**

2. **Remplir le formulaire** :
   - **Note** : `Solid'Eat - Déploiement` (ou un nom de votre choix)
   - **Expiration** : Choisir une durée (ex: 90 jours, 1 an, ou "No expiration")
   - **Scopes** : Cocher les permissions nécessaires :
     - ✅ **`repo`** (toutes les permissions du repository)
       - Cela inclut : `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`

3. **Faire défiler vers le bas** et **cliquer sur** : **"Generate token"**

### Étape 5 : Copier le token

⚠️ **IMPORTANT** : Le token ne sera affiché **qu'une seule fois** !

1. **Copier immédiatement** le token affiché
2. **Le sauvegarder** dans un endroit sûr (gestionnaire de mots de passe)

**Format du token** : `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔐 UTILISATION DU TOKEN

### Pour le push Git

Quand Git demande le mot de passe :

1. **Username** : Votre nom d'utilisateur GitHub
2. **Password** : **Coller le token** (pas votre mot de passe GitHub)

### Exemple

```bash
git push -u origin main

# Quand demandé :
Username: AssoTakin
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔒 SÉCURITÉ

### Bonnes pratiques

- ✅ **Ne jamais commiter** le token dans le code
- ✅ **Ne jamais partager** le token publiquement
- ✅ **Utiliser un gestionnaire de mots de passe** pour le stocker
- ✅ **Révoquer le token** s'il est compromis
- ✅ **Utiliser une expiration** raisonnable

### Révoquer un token

Si vous perdez le token ou s'il est compromis :

1. **GitHub** → **Settings** → **Developer settings** → **Personal access tokens**
2. **Trouver le token** dans la liste
3. **Cliquer sur** : **"Revoke"** (Révoquer)

---

## 📋 ALTERNATIVE : GITHUB CLI

Si vous préférez, vous pouvez installer GitHub CLI :

```bash
# Installer GitHub CLI
brew install gh

# Se connecter
gh auth login

# Pousser (plus besoin de token)
git push -u origin main
```

---

## 🎯 RÉSUMÉ RAPIDE

1. **GitHub** → Avatar → **Settings**
2. **Menu gauche** → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. **Note** : Nom du token
6. **Scopes** : Cocher **`repo`**
7. **Generate token**
8. **Copier le token** (affiché une seule fois)
9. **Utiliser le token** comme mot de passe lors du push

---

## 🔗 LIENS DIRECTS

- **Settings** : https://github.com/settings/profile
- **Developer settings** : https://github.com/settings/apps
- **Personal access tokens** : https://github.com/settings/tokens
- **Generate new token** : https://github.com/settings/tokens/new

---

**Document créé par** : DEV  
**Dernière mise à jour** : 23 janvier 2026
