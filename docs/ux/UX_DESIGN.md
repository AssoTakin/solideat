# UX DESIGN - SOLID'EAT

**Date de création** : 2026  
**Agent** : UX  
**Statut** : Design UX complet - MVP  
**Basé sur** : 
- ANALYSE_PROJET_SOLIDEAT.md (Agent ANALYST)
- SPECIFICATIONS_FONCTIONNELLES.md (Agent PM)
- ARCHITECTURE_TECHNIQUE.md (Agent ARCHITECT)
- USER_STORIES.md (Agent STORY-CREATOR)

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Analyse des utilisateurs](#2-analyse-des-utilisateurs)
3. [User Journeys](#3-user-journeys)
4. [Architecture de l'information](#4-architecture-de-linformation)
5. [Wireframes et maquettes](#5-wireframes-et-maquettes)
6. [Design System](#6-design-system)
7. [Principes d'interaction](#7-principes-dinteraction)
8. [Accessibilité](#8-accessibilité)
9. [Responsive Design](#9-responsive-design)
10. [Micro-interactions](#10-micro-interactions)
11. [Tests utilisateurs](#11-tests-utilisateurs)
12. [Recommandations prioritaires](#12-recommandations-prioritaires)

---

## 1. VUE D'ENSEMBLE

### 1.1 Objectifs UX

**Vision** : Créer une expérience utilisateur intuitive, chaleureuse et engageante qui facilite l'échange de repas entre particuliers tout en luttant contre le gaspillage alimentaire.

**Principes directeurs** :
- **Simplicité** : Parcours utilisateur fluide, sans friction
- **Confiance** : Transparence et sécurité visibles à chaque étape
- **Communauté** : Mise en avant de l'aspect humain et collaboratif
- **Urgence positive** : Valorisation de l'action anti-gaspillage sans stress
- **Clarté** : Information claire sur les quotas, statuts, et règles

### 1.2 Contexte du projet

SOLID'EAT est une plateforme de cuisine collaborative entre particuliers avec :
- **Modèle freemium** : Membres gratuits et premium avec avantages différenciants
- **Système de quotas** : Limitations hebdomadaires/mensuelles selon le statut
- **Fonctionnalité "Sauvez-les"** : Lutte contre le gaspillage avec gamification
- **Système de notation** : Badges et avis pour encourager la qualité
- **Messagerie** : Communication entre membres avec restrictions

### 1.3 Contraintes UX identifiées

**Contraintes fonctionnelles** :
- Quotas complexes (hebdomadaires, mensuels, combinés)
- Règles d'annulation strictes (7h avant, limites)
- Expiration automatique des repas (72h)
- Système de sanctions progressif
- Restrictions de messagerie (pas de numéros, pas de fichiers)

**Contraintes techniques** :
- Application web (PWA) - pas d'app native au MVP
- Géolocalisation nécessaire (Google Maps)
- Notifications multiples (email, SMS, push)
- Upload de photos (repas, profils)

**Défis UX principaux** :
1. **Clarifier les quotas** : Rendre visibles et compréhensibles les limites
2. **Gérer l'urgence** : "Sauvez-les" sans créer de stress
3. **Expliquer les règles** : Sanctions et restrictions de manière pédagogique
4. **Créer la confiance** : Sécurité sanitaire et fiabilité des membres
5. **Valoriser l'engagement** : Badges et statistiques motivantes

---

## 2. ANALYSE DES UTILISATEURS

### 2.1 Personas

#### Persona 1 : Marie, 32 ans - Cuisinière passionnée (Membre Premium)

**Profil** :
- Cuisinière passionnée, aime partager ses créations
- Sensible à l'environnement, engagée contre le gaspillage
- Active sur les réseaux sociaux, aime la reconnaissance
- Revenus confortables, prête à payer pour plus de flexibilité

**Besoins** :
- Faciliter la proposition de repas (workflow simple)
- Voir l'impact de ses actions (statistiques environnementales)
- Recevoir des retours positifs (badges, notes)
- Gérer plusieurs repas par semaine
- Contrôler sa confidentialité (masquer numéro)

**Frustrations** :
- Peur que les repas ne soient pas récupérés
- Manque de visibilité sur les quotas
- Interface complexe pour créer un repas

**Objectifs** :
- Proposer 3 repas par semaine
- Sauver des repas via "Sauvez-les" (badge "Héros anti-gaspillage")
- Avoir une note élevée (badge "Cordon bleu")
- Voir son impact environnemental

#### Persona 2 : Thomas, 28 ans - Étudiant économe (Membre Gratuit)

**Profil** :
- Étudiant en fin d'études, budget serré
- Aime bien manger mais ne peut pas se permettre de manger au restaurant
- Préfère les repas faits maison
- Tech-savvy, utilise beaucoup son smartphone

**Besoins** :
- Accéder à des repas de qualité à moindre coût
- Comprendre rapidement les limitations gratuites
- Trouver des repas proches géographiquement
- Processus simple et rapide

**Frustrations** :
- Limitations du compte gratuit (1 repas/semaine)
- Ne peut réserver que chez d'autres membres gratuits
- Changement d'adresse limité (1 fois/an)
- Pas d'accès aux statistiques d'impact

**Objectifs** :
- Réserver 1 repas par semaine
- Découvrir de nouvelles cuisines
- Économiser sur l'alimentation
- Passer à premium si l'expérience est positive

#### Persona 3 : Sophie, 45 ans - Mère de famille engagée (Membre Premium)

**Profil** :
- Mère de 2 enfants, travaille à temps plein
- Sensibilisée à l'environnement et au gaspillage
- Aime cuisiner mais manque de temps
- Cherche des solutions pratiques pour la famille

**Besoins** :
- Repas pour plusieurs personnes (parts multiples)
- Planification à l'avance
- Sécurité sanitaire (charte, notes)
- Flexibilité (annulation si besoin)

**Frustrations** :
- Peur des allergies (enfants)
- Manque de transparence sur les ingrédients
- Processus de réservation trop long
- Difficulté à coordonner la livraison

**Objectifs** :
- Réserver des repas pour toute la famille (2-4 parts)
- S'assurer de la qualité et sécurité
- Contribuer à la lutte contre le gaspillage
- Gagner du temps sur la préparation des repas

### 2.2 Scénarios d'usage

#### Scénario 1 : Inscription et première réservation (Thomas)

1. **Découverte** : Thomas découvre SOLID'EAT via un ami
2. **Inscription** : Remplit le formulaire, accepte CGU et charte sanitaire
3. **Vérification** : Vérifie email et téléphone (codes reçus)
4. **Exploration** : Explore les repas disponibles près de chez lui
5. **Réservation** : Réserve son premier repas (quota: 1/semaine visible)
6. **Contact** : Contacte le cuisinier pour questions allergènes
7. **Récupération** : Récupère le repas, le consomme
8. **Notation** : Laisse un commentaire et une note (obligatoire)

**Points d'attention UX** :
- Onboarding clair et rassurant
- Affichage des quotas dès le début
- Processus de réservation en 3 clics maximum
- Rappels pour la notation (sans être intrusif)

#### Scénario 2 : Proposition de repas et gestion (Marie)

1. **Création** : Marie crée une fiche repas (photo, ingrédients, date)
2. **Publication** : Le repas est publié, visible par tous
3. **Réservation** : Un membre réserve son repas
4. **Notification** : Marie reçoit une notification
5. **Coordination** : Échange de messages pour coordonner la livraison
6. **Service** : Marie livre le repas, marque comme "servi"
7. **Retour** : Reçoit un avis positif, gagne des points
8. **Expiration** : Si non réservé, notification 24h avant, ajout dans "Sauvez-les"

**Points d'attention UX** :
- Formulaire de création de repas intuitif
- Prévisualisation avant publication
- Notifications claires et actionnables
- Feedback visuel sur les actions (badges, statistiques)

#### Scénario 3 : Utilisation de "Sauvez-les" (Sophie)

1. **Notification** : Sophie reçoit une notification "Sauvez-les" (premium)
2. **Exploration** : Consulte les repas qui expirent bientôt
3. **Filtrage** : Utilise les filtres avancés (cuisine, distance, parts)
4. **Réservation** : Réserve un repas pour 4 personnes
5. **Impact** : Voit son compteur "repas sauvés" augmenter
6. **Badge** : Débloque le badge "Héros anti-gaspillage" après X repas
7. **Statistiques** : Consulte son impact environnemental (CO2 évité)

**Points d'attention UX** :
- Urgence positive (pas de stress, valorisation)
- Filtres faciles à utiliser
- Feedback immédiat sur l'impact
- Gamification motivante

### 2.3 Besoins utilisateurs prioritaires

**Besoins fonctionnels** :
1. ✅ Comprendre rapidement les règles et quotas
2. ✅ Créer un repas en moins de 5 minutes
3. ✅ Réserver un repas en 3 clics
4. ✅ Voir clairement l'état de ses repas (disponible, réservé, servi)
5. ✅ Gérer les notifications sans être submergé

**Besoins émotionnels** :
1. ✅ Se sentir en sécurité (charte sanitaire, notes)
2. ✅ Faire partie d'une communauté bienveillante
3. ✅ Contribuer à une cause (anti-gaspillage)
4. ✅ Être reconnu pour ses efforts (badges, notes)
5. ✅ Avoir le contrôle (annulation, confidentialité)

**Besoins de confiance** :
1. ✅ Voir les profils des cuisiniers (notes, badges, historique)
2. ✅ Comprendre les règles sanitaires
3. ✅ Pouvoir contacter facilement en cas de problème
4. ✅ Transparence sur les quotas et limitations
5. ✅ Feedback clair sur les sanctions

---

## 3. USER JOURNEYS

### 3.1 Journey Map : Inscription → Première réservation

```
ÉTAPE          | ÉMOTION    | POINTS DE FRICTION          | OPPORTUNITÉS UX
---------------|------------|----------------------------|------------------
Découverte     | Curiosité  | Manque d'information       | Landing page claire
Inscription    | Hésitation | Formulaire long            | Progression visible
Vérification   | Impatience | Codes à saisir             | Auto-remplissage
Onboarding     | Confusion  | Beaucoup d'infos            | Tutoriel interactif
Exploration    | Intérêt    | Trop de choix              | Filtres intelligents
Réservation    | Anxiété   | Peur de mal faire          | Rassurance, quotas visibles
Contact        | Inquiétude | Coordonner livraison       | Messagerie simple
Récupération   | Satisfaction| Première expérience       | Feedback positif
Notation       | Obligation | Commentaire obligatoire    | Formulaire guidé
```

**Améliorations UX recommandées** :
- **Onboarding progressif** : Découvrir les fonctionnalités étape par étape
- **Rassurance** : Afficher les profils des cuisiniers (notes, badges) avant réservation
- **Guidage** : Tooltips et infobulles pour expliquer les quotas
- **Feedback** : Confirmation visuelle à chaque étape importante

### 3.2 Journey Map : Création de repas → Service

```
ÉTAPE          | ÉMOTION    | POINTS DE FRICTION          | OPPORTUNITÉS UX
---------------|------------|----------------------------|------------------
Intention      | Motivation | Se rappeler de proposer    | Rappel automatique
Création        | Enthousiasme| Formulaire complexe       | Formulaire intelligent
Photo           | Fierté     | Upload, compression        | Upload drag & drop
Publication    | Attente    | Visibilité du repas        | Confirmation + partage
Réservation    | Satisfaction| Notification              | Notification claire
Coordination   | Pragmatisme| Échanger infos             | Messagerie intégrée
Livraison      | Soulagement| Trouver l'adresse         | Carte intégrée
Service        | Accomplissement| Marquer comme servi    | Action simple
Avis reçu      | Fierté     | Voir la note              | Notification positive
```

**Améliorations UX recommandées** :
- **Formulaire intelligent** : Auto-complétion, suggestions
- **Prévisualisation** : Voir le repas tel qu'il apparaîtra
- **Géolocalisation** : Carte pour la livraison
- **Statistiques** : Dashboard avec impact visible

### 3.3 Journey Map : "Sauvez-les" (Anti-gaspillage)

```
ÉTAPE          | ÉMOTION    | POINTS DE FRICTION          | OPPORTUNITÉS UX
---------------|------------|----------------------------|------------------
Notification   | Urgence   | Peur de manquer            | Urgence positive
Exploration    | Intérêt    | Beaucoup de repas          | Filtres clairs
Sélection      | Décision   | Choix difficile            | Recommandations
Réservation    | Action     | Processus identique        | Badge "Sauveur"
Impact         | Fierté    | Voir l'impact              | Statistiques visuelles
Badge          | Accomplissement| Débloquer badge      | Animation, partage
```

**Améliorations UX recommandées** :
- **Urgence positive** : Compte à rebours visible mais rassurant
- **Gamification** : Badges, statistiques, classements (optionnel)
- **Impact visible** : "Vous avez sauvé X repas, Y kg CO2 évité"
- **Recommandations** : Repas adaptés aux préférences

---

## 4. ARCHITECTURE DE L'INFORMATION

### 4.1 Structure de navigation principale

```
SOLID'EAT
├── 🏠 Accueil
│   ├── Repas disponibles (carte/liste)
│   ├── "Sauvez-les" (rubrique dédiée)
│   └── Recherche et filtres
│
├── 👤 Mon Profil
│   ├── Tableau de bord
│   │   ├── Mes repas (proposés, réservés)
│   │   ├── Statistiques personnelles
│   │   ├── Badges obtenus
│   │   └── Impact environnemental (premium)
│   ├── Mes repas proposés
│   ├── Mes réservations
│   ├── Historique
│   └── Paramètres
│       ├── Profil
│       ├── Confidentialité (premium)
│       ├── Notifications
│       └── Abonnement
│
├── ➕ Proposer un repas
│   └── Formulaire de création
│
├── 💬 Messages
│   ├── Conversations
│   └── Messages système
│
├── 🔔 Notifications
│   └── Centre de notifications
│
└── ℹ️ Aide & Support
    ├── FAQ
    ├── CGU
    ├── Charte sanitaire
    └── Contact support
```

### 4.2 Hiérarchie de l'information

**Niveau 1 - Priorité absolue (toujours visible)** :
- Indicateur de quota (ex: "1/1 repas réservé cette semaine")
- Badge notifications (messages non lus)
- Statut de connexion
- Bouton "Proposer un repas" (si quota OK)

**Niveau 2 - Important (navigation principale)** :
- Accueil / Repas disponibles
- "Sauvez-les"
- Mon profil / Tableau de bord
- Messages

**Niveau 3 - Secondaire (menu ou footer)** :
- Paramètres
- Aide
- À propos
- Passer à Premium (si gratuit)

### 4.3 Organisation des écrans principaux

#### Écran 1 : Accueil / Liste des repas

**Contenu** :
- En-tête : Logo, recherche, filtres, notifications
- Filtres rapides : Distance, heure de récupération, type de cuisine
- Liste/Carte des repas disponibles
- Indicateur "Sauvez-les" (badge visuel)
- Footer : Navigation, liens utiles

**Priorités visuelles** :
1. Repas "Sauvez-les" (si présent, en haut avec badge)
2. Repas disponibles (triés par distance par défaut)
3. Filtres et recherche (accessibles mais non intrusifs)

#### Écran 2 : Fiche repas détaillée

**Sections** :
1. **Photo du repas** (grande, appétissante)
2. **Informations principales** :
   - Nom du repas
   - Cuisinier (pseudo, note, badges)
   - Date et heure de récupération (fixe ou plage horaire)
   - Adresse de récupération (géolocalisée)
   - Distance
   - Nombre de parts
3. **Détails** :
   - Ingrédients (avec allergènes visibles)
   - Description
   - Date de préparation
   - Date d'expiration (si < 24h, badge "Expire bientôt")
4. **Actions** :
   - Bouton "Réserver" (ou "Déjà réservé" si quota atteint)
   - Bouton "Contacter le cuisinier"
   - Bouton "Afficher le numéro" (si réservé et autorisé)
5. **Avis précédents** (si disponibles)

#### Écran 3 : Tableau de bord

**Sections** :
1. **Récapitulatif rapide** :
   - Note globale
   - Repas servis/reçus ce mois
   - Badges obtenus
   - Quotas (hebdomadaire/mensuel)
2. **Mes repas** :
   - En cours (proposés, réservés)
   - À venir (réservations)
   - En attente de commentaire
3. **Statistiques** (premium) :
   - Impact environnemental
   - Graphiques
   - Repas sauvés
4. **Actions rapides** :
   - Proposer un repas
   - Voir "Sauvez-les"
   - Gérer abonnement

---

## 5. WIREFRAMES ET MAQUETTES

### 5.1 Wireframe : Page d'accueil

```
┌─────────────────────────────────────────────────────────┐
│  [🖼️ Logo SOLID'EAT]    [🔍 Recherche]  [🔔 3]  [👤 Profil] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  📍 Distance: [10 km ▼]  🕐 [Heure ▼]          │   │
│  │  🍽️  [Type cuisine ▼]  👥 [Parts ▼]            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ⚠️  Votre quota: 1/1 repas réservé cette semaine      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  🆘 SAUVEZ-LES (3 repas)                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │ [Photo]  │  │ [Photo]  │  │ [Photo]  │      │   │
│  │  │ Lasagnes │  │ Curry    │  │ Tarte    │      │   │
│  │  │ ⏰ 5h    │  │ ⏰ 8h    │  │ ⏰ 12h   │      │   │
│  │  │ 2.5 km  │  │ 4.1 km  │  │ 1.8 km  │      │   │
│  │  └──────────┘  └──────────┘  └──────────┘      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  REPAS DISPONIBLES (12)                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ [Photo]  │  │ [Photo]  │  │ [Photo]  │              │
│  │ Pâtes    │  │ Salade   │  │ Pizza    │              │
│  │ ⭐ 4.5  │  │ ⭐ 4.8  │  │ ⭐ 4.2  │              │
│  │ 1.2 km  │  │ 3.5 km  │  │ 2.1 km  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  [➕ Proposer un repas]  [📊 Voir plus]                │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Wireframe : Fiche repas

```
┌─────────────────────────────────────────────────────────┐
│  [← Retour]                    [🔔] [👤]                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                   │   │
│  │            [PHOTO REPAS GRANDE]                   │   │
│  │                                                   │   │
│  │         ⚠️ Expire dans 8 heures                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Lasagnes aux légumes                                    │
│  👤 @MarieCuisine  ⭐ 4.7/5  🏆 Cordon bleu            │
│                                                          │
│  📅 Service: Aujourd'hui                                │
│  🕐 Récupération: Entre 14:15 et 16:00                  │
│  📍 Adresse: 123 Rue de la Paix, 75001 Paris            │
│  📍 Distance: 2.5 km                                   │
│  👥 Parts: 2 disponibles                                 │
│                                                          │
│  ────────────────────────────────────────────────────   │
│                                                          │
│  📋 INGRÉDIENTS                                         │
│  • Pâtes lasagnes                                       │
│  • Aubergines, courgettes                               │
│  • Fromage (lactose)                                    │
│  • Basilic, origan                                      │
│                                                          │
│  ⚠️ Allergènes: Lactose, Gluten                        │
│                                                          │
│  📝 DESCRIPTION                                         │
│  Lasagnes maison aux légumes de saison, préparées        │
│  avec amour ce matin.                                   │
│                                                          │
│  📅 Préparé le: 15/01/2026 à 10h00                     │
│  ⏰ Expire le: 18/01/2026 à 10h00                      │
│                                                          │
│  ────────────────────────────────────────────────────   │
│                                                          │
│  💬 AVIS (3)                                            │
│  ⭐ 5/5 - "Excellent !" - @Thomas                       │
│  ⭐ 4/5 - "Très bon" - @Sophie                        │
│                                                          │
│  ────────────────────────────────────────────────────   │
│                                                          │
│  [💬 Contacter le cuisinier]  [📞 Afficher numéro]    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [✅ RÉSERVER CE REPAS]                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Wireframe : Formulaire de création de repas

```
┌─────────────────────────────────────────────────────────┐
│  [← Retour]  Proposer un repas                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Étape 1/3 - Informations principales                   │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━○ │
│                                                          │
│  Nom du repas *                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Lasagnes aux légumes                             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Photo du repas *                                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [📷] Glisser-déposer ou cliquer pour upload    │   │
│  │  ou prendre une photo                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Description (optionnel)                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Lasagnes maison aux légumes de saison...        │   │
│  │ (max 500 caractères)                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ────────────────────────────────────────────────────   │
│                                                          │
│  Date de préparation *                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [📅] 15/01/2026  [🕐] 10:00                     │   │
│  └──────────────────────────────────────────────────┘   │
│  ℹ️ Généralement identique à la date de publication     │
│                                                          │
│  Jour de service *                                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [📅] 15/01/2026                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Heure de récupération *                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ○ Heure fixe    ● Plage horaire                  │   │
│  │                                                  │   │
│  │ [🕐] De: [14:15 ▼]  À: [16:00 ▼]                │   │
│  │                                                  │   │
│  │ ℹ️ Indiquez quand le repas peut être récupéré    │   │
│  │    Format: HH:MM (ex: 14:15, 19:30)             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Adresse de récupération *                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [📍] 123 Rue de la Paix, 75001 Paris            │   │
│  │      [Rechercher sur la carte...]                │   │
│  │                                                  │   │
│  │ [🗺️] Afficher sur la carte                      │   │
│  │                                                  │   │
│  │ ℹ️ L'adresse sera validée par Google Maps        │   │
│  │    pour garantir la précision                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Nombre de parts *                                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [1 ▼] (Gratuit: fixé à 1)                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ────────────────────────────────────────────────────   │
│                                                          │
│  ⏰ Expiration automatique: 18/01/2026 à 10:00          │
│  (72h après préparation)                                │
│                                                          │
│  [Suivant →]                                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.4 Wireframe : Tableau de bord

```
┌─────────────────────────────────────────────────────────┐
│  [🖼️ Logo SOLID'EAT]    [🔔 3]  [👤 Profil ▼]              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  👤 Bonjour @Thomas                                      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  RÉCAPITULATIF                                     │   │
│  │  ⭐ Note: 4.2/5  🍽️ Servis: 12  📥 Reçus: 8      │   │
│  │  🏆 Badges: X, Y                                   │   │
│  │                                                    │   │
│  │  📊 QUOTAS                                         │   │
│  │  Repas réservés: 1/1 cette semaine ✅              │   │
│  │  Repas proposés: 0/1 cette semaine ⚠️               │   │
│  │  Annulations: 0/1 cette semaine, 0/4 ce mois       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  MES REPAS EN COURS                                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  📤 PROPOSÉS (0)                                  │   │
│  │  [➕ Proposer un repas]                          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  📥 RÉSERVÉS (1)                                  │   │
│  │  ┌────────────────────────────────────────────┐   │   │
│  │  │ [Photo] Lasagnes - @MarieCuisine          │   │   │
│  │  │ 📅 Aujourd'hui 14:15-16:00 - 2.5 km       │   │   │
│  │  │ [💬 Contacter] [📞 Numéro] [❌ Annuler]   │   │   │
│  │  └────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ⏰ EN ATTENTE DE COMMENTAIRE (0)                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [🆘 Voir "Sauvez-les"]  [📊 Historique]               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 6. DESIGN SYSTEM

### 6.0 Identité visuelle et logo

**Logo SOLID'EAT** :
- **Fichier** : `Logo solideat sans slogan.png` (disponible dans `/docs/ux/`)
- **Format** : PNG avec transparence
- **Utilisation** :
  - En-tête de toutes les pages (navigation principale)
  - Page d'accueil (landing page)
  - Favicon de l'application
  - Emails de notification (en-tête)
  - Documents officiels (CGU, charte sanitaire)

**Règles d'utilisation** :
- **Taille minimale** : 120px de largeur (pour lisibilité)
- **Espacement** : Minimum 16px autour du logo
- **Fond** : Le logo peut être utilisé sur fond blanc ou clair (`#ECF0F1`)
- **Position** : En-tête gauche (desktop) ou centré (mobile)
- **Clic** : Le logo est cliquable et redirige vers la page d'accueil

**Variantes** :
- **Version principale** : Logo sans slogan (utilisée dans l'interface)
- **Version avec slogan** : Si disponible, à utiliser uniquement sur la landing page

**Intégration dans l'interface** :
- Le logo remplace le texte "[Logo] SOLID'EAT" dans tous les wireframes
- Hauteur du logo dans l'en-tête : 40-48px (responsive)
- Alignement vertical : Centré avec les éléments de navigation

### 6.1 Palette de couleurs

**Couleurs principales** :
- **Primaire** : `#FF6B35` (Orange chaleureux, appétissant)
  - Utilisation : Boutons principaux, liens, accents
  - Variantes : `#FF8C5A` (hover), `#E55A2B` (active)

- **Secondaire** : `#4ECDC4` (Turquoise, frais)
  - Utilisation : Actions secondaires, badges "Sauvez-les"
  - Variantes : `#6EDDD6` (hover), `#3BB5AE` (active)

- **Succès** : `#2ECC71` (Vert, positif)
  - Utilisation : Confirmations, statuts OK, badges

- **Avertissement** : `#F39C12` (Orange, attention)
  - Utilisation : Expiration imminente, quotas proches

- **Erreur** : `#E74C3C` (Rouge, urgence)
  - Utilisation : Erreurs, sanctions, quotas dépassés

- **Neutres** :
  - `#2C3E50` (Texte principal, sombre)
  - `#7F8C8D` (Texte secondaire)
  - `#ECF0F1` (Fond clair)
  - `#FFFFFF` (Fond blanc)

**Couleurs contextuelles** :
- **"Sauvez-les"** : `#FF6B35` avec badge "🆘" (urgence positive)
- **Premium** : `#9B59B6` (Violet, distinction)
- **Badges** : `#F1C40F` (Or, valorisation)

### 6.2 Typographie

**Hiérarchie** :
- **H1** : 32px, Bold, `#2C3E50` (Titres principaux)
- **H2** : 24px, Bold, `#2C3E50` (Sections)
- **H3** : 20px, Semi-bold, `#2C3E50` (Sous-sections)
- **Body** : 16px, Regular, `#2C3E50` (Texte principal)
- **Small** : 14px, Regular, `#7F8C8D` (Texte secondaire)
- **Caption** : 12px, Regular, `#7F8C8D` (Légendes)

**Police** :
- **Principale** : Inter ou System (sans-serif, moderne, lisible)
- **Alternative** : Roboto (si Inter indisponible)

### 6.3 Composants UI

#### Boutons

**Bouton primaire** :
- Fond : `#FF6B35`
- Texte : Blanc, 16px, Bold
- Padding : 12px 24px
- Border-radius : 8px
- Hover : `#FF8C5A`
- Disabled : Gris, opacité 50%

**Bouton secondaire** :
- Fond : Transparent
- Bordure : `#FF6B35`, 2px
- Texte : `#FF6B35`, 16px, Semi-bold
- Padding : 12px 24px
- Border-radius : 8px

**Bouton "Sauvez-les"** :
- Fond : `#4ECDC4`
- Texte : Blanc, 16px, Bold
- Badge "🆘" visible
- Animation : Pulse subtile

#### Cartes (Cards)

**Carte repas** :
- Fond : Blanc
- Ombre : `0 2px 8px rgba(0,0,0,0.1)`
- Border-radius : 12px
- Padding : 16px
- Hover : Ombre augmentée, légère élévation

**Carte "Sauvez-les"** :
- Bordure : `#FF6B35`, 2px
- Badge "Expire dans Xh" visible en haut
- Fond légèrement teinté orange

#### Badges et indicateurs

**Badge statut** :
- Disponible : Vert (`#2ECC71`)
- Réservé : Orange (`#F39C12`)
- Servi : Gris (`#7F8C8D`)
- Expiré : Rouge (`#E74C3C`)

**Badge quota** :
- OK : Vert (`#2ECC71`)
- Attention : Orange (`#F39C12`)
- Dépassé : Rouge (`#E74C3C`)

**Badge notification** :
- Fond : `#E74C3C`
- Texte : Blanc
- Taille : 20px
- Position : Coin supérieur droit

### 6.4 Icônes

**Bibliothèque** : Material Icons ou Heroicons

**Icônes principales** :
- 🏠 Accueil
- 👤 Profil
- ➕ Proposer
- 🔍 Recherche
- 🔔 Notifications
- 💬 Messages
- 🆘 Sauvez-les
- ⭐ Note
- 🏆 Badge
- 📍 Localisation
- ⏰ Temps
- 👥 Parts

### 6.5 Espacements

**Système 8px** :
- Petit : 8px
- Moyen : 16px
- Grand : 24px
- Très grand : 32px
- Énorme : 48px

**Marges** :
- Entre sections : 32px
- Entre éléments : 16px
- Padding conteneur : 24px

---

## 7. PRINCIPES D'INTERACTION

### 7.1 Feedback visuel

**Actions utilisateur** :
- **Clic** : Animation de press (scale 0.95)
- **Hover** : Changement de couleur, élévation
- **Chargement** : Skeleton screens (pas de spinners)
- **Succès** : Toast notification (3 secondes)
- **Erreur** : Message d'erreur contextuel (rouge)

**États** :
- **Loading** : Skeleton ou spinner discret
- **Empty** : Illustration + message encourageant
- **Error** : Message clair + action (réessayer)
- **Success** : Confirmation visuelle (checkmark)

### 7.2 Transitions et animations

**Principes** :
- **Durée** : 200-300ms (rapide, réactif)
- **Easing** : `ease-out` (naturel)
- **Réduction de mouvement** : Respecter `prefers-reduced-motion`

**Animations principales** :
- **Page transition** : Fade in (200ms)
- **Modal** : Slide up + fade (300ms)
- **Card hover** : Élévation (transform + shadow)
- **Badge débloqué** : Bounce + confetti (optionnel)
- **Notification** : Slide in depuis le haut (300ms)

### 7.3 Micro-interactions

**Interactions clés** :
1. **Réserver un repas** :
   - Clic → Animation de chargement → Confirmation avec checkmark
   - Toast : "Repas réservé ! Vous recevrez un rappel 2h avant."

2. **Débloquer un badge** :
   - Animation : Badge apparaît avec bounce
   - Modal : "Félicitations ! Vous avez débloqué le badge X"
   - Partage optionnel

3. **Quota atteint** :
   - Bouton désactivé avec tooltip
   - Message : "Quota atteint. Réessayez lundi prochain."

4. **Expiration imminente** :
   - Badge pulse doucement
   - Compte à rebours visible
   - Notification push (si activée)

### 7.4 Gestes (mobile)

**Gestes supportés** :
- **Swipe** : Navigation entre repas (carrousel)
- **Pull to refresh** : Actualiser la liste
- **Long press** : Actions rapides (partager, favoris)
- **Pinch to zoom** : Photo du repas

---

## 8. ACCESSIBILITÉ

### 8.1 Standards WCAG 2.1

**Niveau cible** : AA (minimum)

**Contraste** :
- Texte principal : Ratio 4.5:1 minimum
- Texte large : Ratio 3:1 minimum
- Boutons : Ratio 4.5:1 avec fond

**Navigation clavier** :
- Tous les éléments interactifs accessibles au clavier
- Ordre de tabulation logique
- Focus visible (outline 2px, couleur primaire)

**Lecteurs d'écran** :
- Labels ARIA pour tous les éléments
- Alt text pour toutes les images
- Landmarks (header, main, nav, footer)
- États annoncés (loading, error, success)

### 8.2 Améliorations spécifiques

**Formulaires** :
- Labels associés à tous les champs
- Messages d'erreur clairs et contextuels
- Validation en temps réel (sans être intrusive)
- Autocomplétion activée

**Images** :
- Alt text descriptif pour photos de repas
- Décoration : alt="" (vide)
- Images importantes : Description détaillée

**Couleurs** :
- Ne pas utiliser uniquement la couleur pour transmettre l'information
- Icônes + couleurs pour les statuts
- Patterns/textures pour graphiques (si nécessaire)

### 8.3 Responsive et adaptatif

**Breakpoints** :
- Mobile : < 768px
- Tablet : 768px - 1024px
- Desktop : > 1024px

**Adaptations** :
- Navigation : Menu hamburger sur mobile
- Tableaux : Scroll horizontal ou vue simplifiée
- Formulaires : Champs pleine largeur sur mobile
- Images : Responsive (srcset)

---

## 9. RESPONSIVE DESIGN

### 9.1 Mobile First

**Approche** : Design mobile d'abord, puis adaptation desktop

**Priorités mobile** :
1. Actions principales accessibles (réserver, proposer)
2. Navigation simplifiée (bottom bar)
3. Contenu essentiel visible (pas de scroll infini)
4. Formulaires optimisés (champs pleine largeur)

### 9.2 Adaptations par écran

#### Mobile (< 768px)

**Navigation** :
- Bottom bar : Accueil, Sauvez-les, Proposer, Messages, Profil
- Menu hamburger : Paramètres, Aide

**Liste repas** :
- 1 colonne
- Cards compactes
- Swipe pour actions rapides

**Fiche repas** :
- Photo pleine largeur
- Informations empilées
- Boutons pleine largeur

#### Tablet (768px - 1024px)

**Navigation** :
- Sidebar collapsible
- Bottom bar optionnelle

**Liste repas** :
- 2 colonnes
- Cards moyennes

#### Desktop (> 1024px)

**Navigation** :
- Sidebar fixe
- Top bar avec recherche

**Liste repas** :
- 3-4 colonnes
- Filtres sidebar
- Carte optionnelle (Google Maps)

---

## 10. MICRO-INTERACTIONS

### 10.1 Interactions clés

#### 10.1.1 Réservation de repas

**Flux** :
1. Clic sur "Réserver" → Animation de chargement (skeleton button)
2. Vérification quotas → Feedback immédiat
3. Confirmation → Modal avec détails
4. Validation → Animation de succès (checkmark)
5. Toast notification : "Repas réservé ! Rappel dans 2h."

**États** :
- **Hover** : Bouton légèrement agrandi, ombre augmentée
- **Loading** : Spinner discret dans le bouton
- **Success** : Checkmark animé, bouton devient "Réservé"
- **Error** : Shake animation, message d'erreur

#### 10.1.2 Création de repas

**Flux** :
1. Upload photo → Preview immédiate avec crop optionnel
2. Saisie nom → Auto-save (brouillon)
3. Sélection date → Calendrier animé
4. **Heure de récupération** :
   - Choix entre "Heure fixe" ou "Plage horaire"
   - Si heure fixe : Sélecteur d'heure (HH:MM)
   - Si plage horaire : Deux sélecteurs (De: HH:MM, À: HH:MM)
   - Validation : Vérifier que l'heure de fin > heure de début
   - Format affiché : "14:15" ou "Entre 14:15 et 16:00"
5. **Adresse de récupération** :
   - Champ de recherche avec autocomplétion Google Maps
   - Affichage d'une carte interactive pour sélectionner l'adresse
   - Validation automatique par Google Maps API
   - Affichage de l'adresse complète validée
   - Coordonnées GPS stockées pour calcul de distance
6. Validation → Progression visible (étapes)
7. Publication → Confirmation avec partage optionnel

**Feedback** :
- **Champs valides** : Bordure verte discrète
- **Champs invalides** : Bordure rouge + message
- **Auto-save** : Badge "Brouillon enregistré"
- **Adresse en validation** : Spinner pendant la géo-validation
- **Adresse validée** : Badge "✓ Adresse validée" + icône carte
- **Erreur adresse** : Message "Adresse introuvable, veuillez réessayer"

#### 10.1.3 "Sauvez-les"

**Flux** :
1. Notification → Badge pulse, son discret (optionnel)
2. Ouverture rubrique → Animation d'entrée (slide)
3. Filtres → Résultats mis à jour en temps réel
4. Réservation → Badge "Sauveur" apparaît
5. Impact → Compteur animé (increment)

**Animations** :
- **Badge expiration** : Pulse doux (2s loop)
- **Compte à rebours** : Mise à jour en temps réel
- **Réservation** : Confetti discret (optionnel)

### 10.2 Feedback temps réel

**Indicateurs** :
- **Quotas** : Barre de progression visuelle
- **Expiration** : Compte à rebours animé
- **Notifications** : Badge avec nombre, pulse si nouveau
- **Messages** : Indicateur "en train d'écrire" (si temps réel)

---

## 11. TESTS UTILISATEURS

### 11.1 Tests recommandés

#### Test 1 : Onboarding et première réservation

**Objectif** : Vérifier la compréhension du système et la facilité de première réservation

**Tâches** :
1. S'inscrire sur la plateforme
2. Comprendre les quotas (gratuit vs premium)
3. Réserver un premier repas
4. Contacter le cuisinier
5. Laisser un commentaire

**Métriques** :
- Temps de complétion
- Taux d'abandon
- Nombre d'erreurs
- Satisfaction (questionnaire)

#### Test 2 : Création de repas

**Objectif** : Vérifier la facilité de création d'un repas

**Tâches** :
1. Créer un repas (tous les champs)
2. Uploader une photo
3. Comprendre l'expiration (72h)
4. Publier le repas
5. Gérer une réservation

**Métriques** :
- Temps de création
- Taux d'erreur (validation)
- Compréhension des règles
- Satisfaction

#### Test 3 : "Sauvez-les"

**Objectif** : Vérifier l'efficacité de la fonctionnalité anti-gaspillage

**Tâches** :
1. Recevoir une notification "Sauvez-les"
2. Explorer les repas disponibles
3. Utiliser les filtres (premium)
4. Réserver un repas
5. Voir l'impact (statistiques)

**Métriques** :
- Taux de clic sur notification
- Taux de réservation
- Utilisation des filtres
- Compréhension de l'impact

### 11.2 Questions de recherche

**Questions principales** :
1. Les utilisateurs comprennent-ils les quotas ?
2. Le processus de réservation est-il fluide ?
3. La fonctionnalité "Sauvez-les" est-elle motivante ?
4. Les sanctions sont-elles clairement expliquées ?
5. L'interface inspire-t-elle confiance ?

### 11.3 Itérations recommandées

**Phase 1 - MVP** :
- Tests utilisateurs avec 5-8 participants
- Focus : Onboarding, réservation, création
- Itérations rapides (1-2 semaines)

**Phase 2 - Post-MVP** :
- Tests A/B sur fonctionnalités clés
- Analytics comportementales
- Feedback continu (NPS, enquêtes)

---

## 12. RECOMMANDATIONS PRIORITAIRES

### 12.1 Priorité P0 (Critique pour MVP)

#### 1. Clarification des quotas

**Problème** : Les quotas sont complexes (hebdomadaire, mensuel, combinés)

**Solutions UX** :
- **Indicateur visuel** : Barre de progression avec tooltip explicatif
- **Exemples concrets** : "Vous avez réservé 1/1 repas cette semaine. Prochain reset : lundi"
- **Alertes proactives** : Notification quand quota à 80%
- **Page dédiée** : "Comprendre les quotas" dans l'aide

**Implémentation** :
- Composant `QuotaIndicator` réutilisable
- Tooltips contextuels partout où quotas affichés
- Page FAQ avec exemples visuels

#### 2. Onboarding efficace

**Problème** : Beaucoup d'informations à assimiler (CGU, charte, quotas, règles)

**Solutions UX** :
- **Onboarding progressif** : 3-4 écrans max, avec possibilité de skip
- **Tutoriel interactif** : Première réservation guidée
- **Checklist** : "À faire" visible dans le tableau de bord
- **Vidéo courte** : Présentation du concept (optionnel)

**Implémentation** :
- Composant `Onboarding` avec étapes
- Tooltips contextuels lors de la première utilisation
- Badge "Nouveau" sur fonctionnalités importantes

#### 3. Feedback sur les actions

**Problème** : Manque de confirmation visuelle sur les actions importantes

**Solutions UX** :
- **Toast notifications** : Toutes les actions importantes
- **États visuels** : Loading, success, error clairs
- **Confirmations** : Pour actions critiques (annulation, signalement)
- **Historique** : Voir les actions récentes

**Implémentation** :
- Système de notifications toast
- États de chargement (skeleton screens)
- Modales de confirmation pour actions critiques

### 12.2 Priorité P1 (Important pour MVP)

#### 4. Gestion de l'urgence ("Sauvez-les")

**Problème** : Équilibre entre urgence et stress

**Solutions UX** :
- **Urgence positive** : "Sauvez ce repas !" au lieu de "Expire bientôt"
- **Compte à rebours visible** : Mais rassurant (heures, pas secondes)
- **Gamification** : Badges, statistiques, impact visible
- **Notifications intelligentes** : Pas de spam, seulement si intéressant

**Implémentation** :
- Badge "Sauvez-les" avec animation pulse douce
- Compte à rebours en heures (pas secondes)
- Statistiques d'impact visibles (premium)

#### 5. Transparence sur les sanctions

**Problème** : Sanctions perçues comme punitives sans explication

**Solutions UX** :
- **Messages pédagogiques** : Expliquer pourquoi (gaspillage, respect)
- **Prévention** : Alertes avant d'atteindre les limites
- **Transparence** : Afficher clairement les quotas et sanctions
- **Récupération** : Possibilité de comprendre et s'améliorer

**Implémentation** :
- Messages système obligatoires avec explication
- Alertes proactives (80% du quota)
- Page "Mes quotas" avec historique

#### 6. Confiance et sécurité

**Problème** : Manque de confiance dans la sécurité sanitaire

**Solutions UX** :
- **Charte sanitaire visible** : Lien dans chaque fiche repas
- **Profils détaillés** : Notes, badges, historique visibles
- **Transparence** : Ingrédients, allergènes clairement affichés
- **Support accessible** : Contact facile en cas de problème

**Implémentation** :
- Badge "Charte sanitaire acceptée" sur profils
- Section "Sécurité" dans chaque fiche repas
- Formulaire de contact accessible partout

### 12.3 Priorité P2 (Souhaitable pour MVP)

#### 7. Gamification avancée

**Solutions UX** :
- **Badges animés** : Animation lors du déblocage
- **Classements** : Top sauveurs (optionnel, avec consentement)
- **Défis** : "Sauvez 5 repas ce mois" (premium)
- **Partage** : Partager ses badges sur réseaux sociaux

#### 8. Personnalisation

**Solutions UX** :
- **Préférences** : Cuisines favorites, allergènes
- **Recommandations** : Repas adaptés aux préférences
- **Filtres sauvegardés** : Filtres fréquents mémorisés
- **Thème** : Mode sombre (optionnel)

#### 9. Accessibilité avancée

**Solutions UX** :
- **Lecteur d'écran optimisé** : Labels ARIA complets
- **Navigation clavier** : Tous les éléments accessibles
- **Contraste élevé** : Mode haute visibilité
- **Taille de police** : Réglable par l'utilisateur

---

## ANNEXES

### A. Checklist UX MVP

**Design** :
- [ ] Wireframes de tous les écrans principaux
- [ ] Design system complet (logo, couleurs, typo, composants)
- [ ] Maquettes haute fidélité des écrans critiques
- [ ] Prototype interactif (Figma, InVision)
- [ ] Logo intégré dans tous les wireframes et maquettes

**Accessibilité** :
- [ ] Contraste WCAG AA vérifié
- [ ] Navigation clavier testée
- [ ] Labels ARIA ajoutés
- [ ] Tests avec lecteur d'écran

**Responsive** :
- [ ] Design mobile validé
- [ ] Design tablet validé
- [ ] Design desktop validé
- [ ] Tests sur appareils réels

**Tests utilisateurs** :
- [ ] Scénarios de test définis
- [ ] Recrutement participants (5-8)
- [ ] Sessions de test planifiées
- [ ] Analyse des résultats
- [ ] Itérations basées sur feedback

### B. Ressources et outils

**Design** :
- **Figma** : Design et prototypage
- **Material-UI** : Composants React
- **Heroicons** : Bibliothèque d'icônes
- **Unsplash** : Photos de repas (placeholder)
- **Logo SOLID'EAT** : `Logo solideat sans slogan.png` (disponible dans `/docs/ux/`)

**Tests** :
- **Hotjar** : Heatmaps et enregistrements
- **Google Analytics** : Comportement utilisateur
- **UserTesting** : Tests utilisateurs à distance

**Accessibilité** :
- **axe DevTools** : Audit accessibilité
- **WAVE** : Vérification WCAG
- **Lighthouse** : Audit performance et accessibilité

### C. Métriques de succès UX

**Métriques quantitatives** :
- **Taux de complétion** : Inscription, première réservation
- **Temps de tâche** : Création repas, réservation
- **Taux d'erreur** : Erreurs de validation, actions ratées
- **Taux de rétention** : Utilisateurs actifs après 7 jours

**Métriques qualitatives** :
- **Satisfaction** : NPS, enquêtes utilisateurs
- **Compréhension** : Tests de compréhension des règles
- **Confiance** : Sentiment de sécurité et fiabilité
- **Engagement** : Utilisation de "Sauvez-les", badges

**Objectifs MVP** :
- Taux de complétion inscription : > 70%
- Temps première réservation : < 5 minutes
- Taux d'erreur création repas : < 10%
- NPS : > 50
- Taux d'utilisation "Sauvez-les" : > 30% des membres premium

---

**Document créé par** : UX  
**Basé sur** : ANALYSE_PROJET_SOLIDEAT.md, SPECIFICATIONS_FONCTIONNELLES.md, ARCHITECTURE_TECHNIQUE.md, USER_STORIES.md  
**Prochaine étape** : DEV (Développement avec guidelines UX) ou création de maquettes haute fidélité
