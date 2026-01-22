# USER STORIES - SOLID'EAT

**Date de création** : 2026  
**Agent** : STORY-CREATOR  
**Statut** : User Stories complètes - MVP  
**Basé sur** : Architecture technique ARCHITECTURE_TECHNIQUE.md (Agent ARCHITECT) et Spécifications fonctionnelles SPECIFICATIONS_FONCTIONNELLES.md (Agent PM)

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Authentification et gestion des utilisateurs](#2-authentification-et-gestion-des-utilisateurs)
3. [Gestion des repas](#3-gestion-des-repas)
4. [Système de réservation](#4-système-de-réservation)
5. [Messagerie entre membres](#5-messagerie-entre-membres)
6. [Système "Sauvez-les"](#6-système-sauvez-les)
7. [Système de bonus donateur](#7-système-de-bonus-donateur)
8. [Système de notation et badges](#8-système-de-notation-et-badges)
9. [Gestion des abonnements](#9-gestion-des-abonnements)
10. [Notifications et alertes](#10-notifications-et-alertes)
11. [Géolocalisation et recherche](#11-géolocalisation-et-recherche)
12. [Tableau de bord](#12-tableau-de-bord)
13. [Gestion des sanctions](#13-gestion-des-sanctions)
14. [Tâches automatiques (Cron Jobs)](#14-tâches-automatiques-cron-jobs)

---

## 1. VUE D'ENSEMBLE

### 1.1 Format des User Stories

Chaque user story suit le format standard :
- **En tant que** [rôle]
- **Je veux** [action]
- **Afin de** [bénéfice]

Avec les critères d'acceptation détaillés et les tâches techniques associées.

### 1.2 Priorisation

Les user stories sont organisées par fonctionnalité et priorisées selon :
- **P0** : Critique pour le MVP (must have)
- **P1** : Important pour le MVP (should have)
- **P2** : Souhaitable pour le MVP (nice to have)

### 1.3 Estimation

Chaque story inclut une estimation en points (Fibonacci : 1, 2, 3, 5, 8, 13).

---

## 2. AUTHENTIFICATION ET GESTION DES UTILISATEURS

### US-001 : Inscription d'un nouveau membre

**En tant que** visiteur  
**Je veux** m'inscrire sur la plateforme  
**Afin de** accéder aux fonctionnalités de SOLID'EAT

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] Formulaire d'inscription avec tous les champs obligatoires
- [ ] Validation des champs (email unique, pseudo unique, téléphone unique)
- [ ] Géocodage de l'adresse via Google Maps API
- [ ] Affichage et acceptation obligatoire des CGU et charte sanitaire
- [ ] Enregistrement de la date/heure de signature des CGU
- [ ] Envoi automatique d'email de vérification
- [ ] Envoi automatique de SMS avec code de vérification
- [ ] Compte non activé tant que les deux vérifications ne sont pas effectuées
- [ ] Possibilité de renvoyer les codes de vérification
- [ ] Redirection vers le tableau de bord après activation

**Tâches techniques** :
- [ ] Créer endpoint `POST /auth/register`
- [ ] Implémenter validation Zod pour le formulaire d'inscription
- [ ] Intégrer Google Maps Geocoding API
- [ ] Implémenter service d'envoi d'email (SendGrid)
- [ ] Implémenter service d'envoi SMS (Twilio)
- [ ] Créer modèles Prisma User avec champs requis
- [ ] Implémenter hashage de mot de passe (bcrypt)
- [ ] Créer composant React d'inscription
- [ ] Gérer les états de vérification (email, téléphone)

---

### US-002 : Vérification de l'email

**En tant que** nouveau membre  
**Je veux** vérifier mon email  
**Afin de** activer mon compte

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Lien de vérification unique dans l'email
- [ ] Lien valide 24 heures
- [ ] Endpoint de vérification sécurisé
- [ ] Mise à jour du statut `emailVerified` à `true`
- [ ] Message de confirmation après vérification
- [ ] Possibilité de renvoyer l'email de vérification

**Tâches techniques** :
- [ ] Créer endpoint `POST /auth/verify-email`
- [ ] Générer token de vérification unique (JWT ou UUID)
- [ ] Créer template email de vérification
- [ ] Implémenter logique de vérification avec expiration
- [ ] Créer page React de vérification

---

### US-003 : Vérification du téléphone

**En tant que** nouveau membre  
**Je veux** vérifier mon numéro de téléphone  
**Afin de** activer mon compte

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Envoi automatique de SMS avec code à 6 chiffres
- [ ] Code valide 10 minutes
- [ ] Interface de saisie du code
- [ ] Mise à jour du statut `phoneVerified` à `true`
- [ ] Possibilité de renvoyer le code SMS
- [ ] Compte activé uniquement si email ET téléphone vérifiés

**Tâches techniques** :
- [ ] Créer endpoint `POST /auth/verify-phone`
- [ ] Générer code à 6 chiffres aléatoire
- [ ] Stocker code avec expiration (Redis ou DB)
- [ ] Intégrer Twilio pour envoi SMS
- [ ] Créer composant React de vérification téléphone

---

### US-004 : Connexion à la plateforme

**En tant que** membre  
**Je veux** me connecter avec mon email et mot de passe  
**Afin de** accéder à mon compte

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Formulaire de connexion (email + mot de passe)
- [ ] Validation des identifiants
- [ ] Génération de JWT token
- [ ] Stockage sécurisé du token (httpOnly cookie ou localStorage)
- [ ] Limitation des tentatives (5 max, blocage 30 min)
- [ ] Redirection vers le tableau de bord après connexion
- [ ] Gestion des erreurs (compte non vérifié, identifiants incorrects)

**Tâches techniques** :
- [ ] Créer endpoint `POST /auth/login`
- [ ] Implémenter validation des identifiants
- [ ] Générer JWT avec payload `{ userId, email, subscriptionType }`
- [ ] Implémenter rate limiting (Redis)
- [ ] Créer middleware d'authentification
- [ ] Créer composant React de connexion
- [ ] Gérer le stockage du token côté frontend

---

### US-005 : Déconnexion

**En tant que** membre connecté  
**Je veux** me déconnecter  
**Afin de** sécuriser ma session

**Priorité** : P0  
**Estimation** : 2 points

**Critères d'acceptation** :
- [ ] Bouton de déconnexion accessible
- [ ] Suppression du token côté client
- [ ] Invalidation du token côté serveur (optionnel, blacklist)
- [ ] Redirection vers la page d'accueil

**Tâches techniques** :
- [ ] Créer endpoint `POST /auth/logout`
- [ ] Implémenter suppression/invalidation du token
- [ ] Créer fonction de déconnexion côté frontend

---

### US-006 : Récupération de mot de passe

**En tant que** membre  
**Je veux** réinitialiser mon mot de passe oublié  
**Afin de** retrouver l'accès à mon compte

**Priorité** : P1  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Formulaire "Mot de passe oublié" avec email
- [ ] Envoi d'email avec lien de réinitialisation
- [ ] Lien valide 1 heure
- [ ] Formulaire de nouveau mot de passe
- [ ] Validation du nouveau mot de passe (même règles que l'inscription)
- [ ] Mise à jour du mot de passe en base

**Tâches techniques** :
- [ ] Créer endpoint `POST /auth/forgot-password`
- [ ] Créer endpoint `POST /auth/reset-password`
- [ ] Générer token de réinitialisation unique
- [ ] Créer template email de réinitialisation
- [ ] Créer composants React (formulaire oublié + réinitialisation)

---

### US-007 : Consultation du profil public

**En tant que** membre  
**Je veux** consulter le profil public d'un autre membre  
**Afin de** évaluer sa réputation avant de réserver

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Affichage du pseudo uniquement (pas de nom complet)
- [ ] Affichage de la note globale (format X.X/5)
- [ ] Affichage de la date d'inscription ("Membre depuis [mois année]")
- [ ] Statistiques publiques : repas servis, repas en cours, repas expirés
- [ ] Description personnelle et orientation culinaire (si renseignées)
- [ ] Liste des repas servis avec notes et avis
- [ ] Badges obtenus
- [ ] **Membres premium uniquement** : Compteur "X repas sauvés" (affichage public)

**Tâches techniques** :
- [ ] Créer endpoint `GET /users/:id`
- [ ] Filtrer les données sensibles (nom, email, téléphone, adresse)
- [ ] Calculer la note globale
- [ ] Récupérer les statistiques publiques
- [ ] Créer composant React de profil public

---

### US-008 : Modification du profil

**En tant que** membre  
**Je veux** modifier mes informations de profil  
**Afin de** mettre à jour mes données personnelles

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Modification de la photo de profil (upload, max 5MB, JPG/PNG)
- [ ] Modification du mot de passe (avec vérification ancien mot de passe)
- [ ] Modification de la description personnelle (max 500 caractères)
- [ ] Modification de l'orientation culinaire (max 200 caractères)
- [ ] Changement d'adresse (selon quotas : 1/an pour gratuit, illimité pour premium)
- [ ] **Membres premium uniquement** : Option de masquage du numéro de téléphone (section Confidentialité)
- [ ] Validation et sauvegarde des modifications

**Tâches techniques** :
- [ ] Créer endpoint `PUT /users/me`
- [ ] Créer endpoint `PUT /users/me/password`
- [ ] Créer endpoint `PUT /users/me/address`
- [ ] Implémenter upload de photo (Cloudinary)
- [ ] Vérifier les quotas de changement d'adresse
- [ ] Créer composants React de modification de profil

---

### US-009 : Gestion de la confidentialité (Premium)

**En tant que** membre premium  
**Je veux** gérer la visibilité de mon numéro de téléphone  
**Afin de** contrôler ma confidentialité

**Priorité** : P1  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Section "Confidentialité" dans le tableau de bord premium
- [ ] Option "Autoriser l'affichage de mon numéro de téléphone lors des réservations" (case à cocher)
- [ ] Par défaut : Option activée (bouton visible)
- [ ] Si désactivé : Le bouton "Afficher le numéro" n'apparaît pas pour les réservations
- [ ] Si activé : Comportement identique aux membres gratuits
- [ ] Application immédiate aux nouveaux repas réservés
- [ ] Les repas déjà réservés conservent l'état au moment de la réservation

**Tâches techniques** :
- [ ] Ajouter champ `hidePhoneNumber` dans modèle User (premium uniquement)
- [ ] Créer endpoint `PUT /users/me/privacy`
- [ ] Vérifier le statut premium avant modification
- [ ] Créer composant React de gestion de confidentialité
- [ ] Adapter l'affichage du bouton selon ce paramètre

---

## 3. GESTION DES REPAS

### US-010 : Création d'une fiche repas

**En tant que** membre  
**Je veux** créer une fiche repas  
**Afin de** proposer un repas à la communauté

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] Formulaire avec tous les champs obligatoires
- [ ] Upload de photo (max 5MB, JPG/PNG, obligatoire)
- [ ] Sélection du jour de service (calendrier)
- [ ] Sélection du mode de récupération : Heure fixe ou Plage horaire
- [ ] Si heure fixe : Saisie de l'heure au format HH:MM (ex: 14:15, 19:30)
- [ ] Si plage horaire : Saisie de l'heure de début et de fin (ex: 14:15 - 16:00)
- [ ] Validation : Heure de fin >= heure de début
- [ ] Affichage formaté : "14:15" ou "Entre 14:15 et 16:00"
- [ ] Saisie de l'adresse de récupération avec autocomplétion Google Maps
- [ ] Validation et géocodage de l'adresse via Google Maps API
- [ ] Affichage d'une carte interactive pour sélectionner l'adresse
- [ ] Stockage de l'adresse complète + coordonnées GPS (lat/lng)
- [ ] L'adresse de récupération peut être différente de l'adresse du profil
- [ ] Sélection de la date de préparation (ne peut pas être dans le futur, max 3 jours dans le passé)
- [ ] Saisie des ingrédients (min 3, avec allergènes)
- [ ] Description optionnelle (max 500 caractères)
- [ ] Nombre de parts (1 pour gratuit, 1-4 pour premium)
- [ ] Calcul automatique de la date d'expiration (date préparation + 72h)
- [ ] Affichage de la date d'expiration (grisée, non modifiable)
- [ ] Vérification du quota hebdomadaire (1 pour gratuit, 3 pour premium)
- [ ] Publication du repas (statut : `AVAILABLE`)

**Tâches techniques** :
- [ ] Créer endpoint `POST /meals`
- [ ] Implémenter validation Zod pour la fiche repas
- [ ] Implémenter upload de photo (Cloudinary)
- [ ] Calculer automatiquement `expirationDate` (preparationDate + 72h)
- [ ] Vérifier le quota hebdomadaire de repas proposés
- [ ] Créer modèle Prisma Meal
- [ ] Créer composant React de création de repas
- [ ] Intégrer calendrier pour sélection de dates

---

### US-011 : Consultation de la liste des repas disponibles

**En tant que** membre  
**Je veux** voir la liste des repas disponibles  
**Afin de** choisir un repas à réserver

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Affichage de tous les repas disponibles (statut `AVAILABLE`)
- [ ] Filtres : Distance, Date, Heure de récupération, Type de cuisine, Nombre de parts
- [ ] Tri par défaut : Distance (croissant)
- [ ] Options de tri : Distance, Date, Note du cuisinier, Temps restant avant expiration
- [ ] Pagination (20 résultats par page, max 100)
- [ ] Affichage des informations essentielles : Photo, Nom, Cuisinier, Distance, Date, Heure de récupération (formatée), Adresse de récupération
- [ ] Bouton "Voir les détails" pour chaque repas

**Tâches techniques** :
- [ ] Créer endpoint `GET /meals` avec filtres et pagination
- [ ] Implémenter calcul de distance (géolocalisation)
- [ ] Créer index sur `status` et `expirationDate` (optimisation)
- [ ] Implémenter cache Redis pour les requêtes fréquentes
- [ ] Créer composant React de liste des repas
- [ ] Créer composants de filtres et tri

---

### US-012 : Consultation des détails d'un repas

**En tant que** membre  
**Je veux** voir les détails complets d'un repas  
**Afin de** décider si je veux le réserver

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Affichage de toutes les informations du repas
- [ ] Photo du repas (grand format)
- [ ] Nom du repas
- [ ] Cuisinier (pseudo, note, lien vers profil)
- [ ] Date et heure de récupération (formatée : "14:15" ou "Entre 14:15 et 16:00")
- [ ] Adresse de récupération complète
- [ ] Date de préparation
- [ ] Date d'expiration (avec compte à rebours si < 24h)
- [ ] Liste des ingrédients avec allergènes
- [ ] Description
- [ ] Nombre de parts
- [ ] Distance depuis mon adresse (calculée automatiquement)
- [ ] Carte interactive optionnelle pour visualiser l'emplacement
- [ ] Bouton "Contacter le cuisinier" (si statut ≠ `SERVED`)
- [ ] Bouton "Réserver" (si disponible et quotas respectés)

**Tâches techniques** :
- [ ] Créer endpoint `GET /meals/:id`
- [ ] Inclure les relations (cook, reservation)
- [ ] Calculer la distance depuis l'utilisateur connecté
- [ ] Vérifier les quotas de réservation
- [ ] Créer composant React de détails de repas

---

### US-013 : Modification d'un repas

**En tant que** cuisinier  
**Je veux** modifier un repas que j'ai proposé  
**Afin de** corriger des informations ou mettre à jour les détails

**Priorité** : P1  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Modification possible uniquement si statut = `AVAILABLE`
- [ ] Modification autorisée : Description, Nombre de parts (premium uniquement), Jour de service (si >= date du jour), Heure de récupération, Adresse de récupération
- [ ] Si modification de l'adresse : Re-géocodage automatique
- [ ] Validation de la nouvelle heure de récupération
- [ ] Modifications interdites : Date de préparation, Photo, Ingrédients, Date d'expiration
- [ ] Validation et sauvegarde des modifications
- [ ] Notification si le repas était réservé (ne peut pas être modifié)

**Tâches techniques** :
- [ ] Créer endpoint `PUT /meals/:id`
- [ ] Vérifier que le repas appartient à l'utilisateur
- [ ] Vérifier que le statut est `AVAILABLE`
- [ ] Valider les champs modifiables
- [ ] Créer composant React de modification de repas

---

### US-014 : Annulation d'un repas

**En tant que** cuisinier  
**Je veux** annuler un repas que j'ai proposé  
**Afin de** retirer un repas qui ne peut plus être servi

**Priorité** : P1  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Annulation possible uniquement si statut = `AVAILABLE`
- [ ] Confirmation avant annulation
- [ ] Suppression de la fiche repas
- [ ] Notification aux membres qui avaient mis en favori (si fonctionnalité activée)
- [ ] Mise à jour des statistiques

**Tâches techniques** :
- [ ] Créer endpoint `DELETE /meals/:id`
- [ ] Vérifier que le repas appartient à l'utilisateur
- [ ] Vérifier que le statut est `AVAILABLE`
- [ ] Soft delete ou hard delete selon stratégie
- [ ] Créer composant React de confirmation d'annulation

---

## 4. SYSTÈME DE RÉSERVATION

### US-015 : Réservation d'un repas

**En tant que** membre  
**Je veux** réserver un repas disponible  
**Afin de** recevoir ce repas

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] Vérification que le repas est disponible (statut `AVAILABLE`)
- [ ] Vérification que la date d'expiration n'est pas atteinte
- [ ] Vérification des quotas hebdomadaires (1 pour gratuit, 3 pour premium)
- [ ] Vérification de la distance (rayon de livraison)
- [ ] Option "Utiliser un bonus donateur" (si disponible)
- [ ] Confirmation de réservation
- [ ] Passage au statut `RESERVED`
- [ ] Notification au cuisinier (email + app)
- [ ] Notification de confirmation au membre qui réserve
- [ ] Affichage du bouton "Afficher le numéro de téléphone" (selon règles de confidentialité)

**Tâches techniques** :
- [ ] Créer endpoint `POST /reservations`
- [ ] Implémenter service `ReservationService.createReservation()`
- [ ] Vérifier les quotas via `QuotaService.checkQuota()`
- [ ] Créer modèle Prisma Reservation
- [ ] Implémenter notifications (email + push)
- [ ] Gérer l'utilisation d'un bonus donateur si sélectionné
- [ ] Créer composant React de réservation

---

### US-016 : Consultation de mes réservations

**En tant que** membre  
**Je veux** voir la liste de mes réservations  
**Afin de** suivre les repas que j'ai réservés

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Affichage de toutes mes réservations (actuelles et passées)
- [ ] Filtres : Statut (réservé, servi, annulé), Date
- [ ] Tri par défaut : Date de service (décroissant)
- [ ] Informations affichées : Repas, Cuisinier, Date de service, Statut
- [ ] Actions possibles selon statut : Annuler, Contacter, Afficher numéro, Noter

**Tâches techniques** :
- [ ] Créer endpoint `GET /reservations`
- [ ] Filtrer par `userId` de l'utilisateur connecté
- [ ] Inclure les relations (meal, user)
- [ ] Créer composant React de liste des réservations

---

### US-017 : Annulation d'une réservation

**En tant que** membre qui a réservé  
**Je veux** annuler une réservation  
**Afin de** libérer un repas que je ne peux plus récupérer

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] Annulation possible jusqu'à 7 heures avant l'heure de récupération (ou début de plage horaire)
- [ ] Vérification des quotas d'annulation :
  - Maximum 1 annulation par semaine
  - Maximum 4 annulations par mois
  - Plafond global mensuel : 4 (annulations + repas non récupérés)
- [ ] Saisie du motif d'annulation (obligatoire, max 200 caractères)
- [ ] Confirmation avant annulation
- [ ] Passage au statut `AVAILABLE`
- [ ] Vérification du temps restant avant expiration
- [ ] Si temps restant > 0 : Ajout automatique dans "Sauvez-les"
- [ ] Notification au cuisinier (email + app)
- [ ] Mise à jour des compteurs d'annulation
- [ ] Application des sanctions si plafond mensuel atteint

**Tâches techniques** :
- [ ] Créer endpoint `DELETE /reservations/:id`
- [ ] Implémenter service `ReservationService.cancelReservation()`
- [ ] Vérifier le délai (7h avant service)
- [ ] Vérifier les quotas via `QuotaService.checkQuota()`
- [ ] Calculer le temps restant avant expiration
- [ ] Ajouter dans "Sauvez-les" si temps restant > 0
- [ ] Appliquer les sanctions si nécessaire
- [ ] Créer composant React d'annulation de réservation

---

### US-018 : Signalement d'un repas non récupéré

**En tant que** cuisinier  
**Je veux** signaler un repas réservé non récupéré  
**Afin de** informer la plateforme d'un manque de respect

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] Bouton "Signaler repas non récupéré" visible uniquement après l'heure de récupération (fin de plage horaire)
- [ ] Signalement possible jusqu'à 24 heures après l'heure de récupération (ou fin de plage horaire)
- [ ] Confirmation avant signalement
- [ ] Notification au membre qui n'est pas venu (demande de confirmation/explication)
- [ ] Comptabilisation séparée (quota spécifique repas non récupérés)
- [ ] Application des sanctions immédiates :
  - 1 repas non récupéré : Avertissement + message obligatoire
  - 2 repas non récupérés dans le mois : Blocage réservations 2 semaines + quota réduit
- [ ] Vérification du temps restant avant expiration
- [ ] Si temps restant > 0 : Remise automatique dans "Sauvez-les"
- [ ] Si temps restant = 0 : Passage au statut `EXPIRED`
- [ ] Passage au statut `NOT_PICKED_UP`
- [ ] Impact sur la note globale du membre

**Tâches techniques** :
- [ ] Créer endpoint `POST /reservations/:id/report-not-picked-up`
- [ ] Vérifier que le repas appartient au cuisinier
- [ ] Vérifier le délai (24h après fin de plage horaire)
- [ ] Comptabiliser dans le quota spécifique repas non récupérés
- [ ] Appliquer les sanctions via `SanctionService`
- [ ] Remettre dans "Sauvez-les" si temps restant > 0
- [ ] Créer composant React de signalement

---

### US-019 : Marquage d'un repas comme récupéré

**En tant que** cuisinier  
**Je veux** marquer un repas comme récupéré  
**Afin de** confirmer que la livraison s'est bien passée

**Priorité** : P1  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Bouton "Marquer comme récupéré" sur la fiche repas réservé
- [ ] Passage au statut `SERVED`
- [ ] Déclenchement du délai de 48h pour le commentaire obligatoire
- [ ] Notification au membre qui a réservé (confirmation de réception)

**Tâches techniques** :
- [ ] Créer endpoint `PUT /reservations/:id/pickup`
- [ ] Vérifier que le repas appartient au cuisinier
- [ ] Mettre à jour le statut du repas à `SERVED`
- [ ] Déclencher le job de rappel de commentaire (4h, 24h, 48h)
- [ ] Créer composant React de confirmation de récupération

---

## 5. MESSAGERIE ENTRE MEMBRES

### US-020 : Contacter un cuisinier

**En tant que** membre  
**Je veux** contacter le cuisinier qui a posté un repas  
**Afin de** poser des questions sur les allergènes, ingrédients ou coordonner la livraison

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Bouton "Contacter le cuisinier" visible sur la fiche repas
- [ ] Disponible tant que statut ≠ `SERVED`
- [ ] Ouverture d'une conversation liée au repas
- [ ] Historique des messages précédents (si conversation existante)
- [ ] Zone de saisie de message
- [ ] Envoi de message
- [ ] Notification au cuisinier (email + app)
- [ ] Une fois le repas `SERVED` : messagerie accessible en historique uniquement (pas de nouvelles questions)

**Tâches techniques** :
- [ ] Créer endpoint `POST /messages`
- [ ] Créer modèle Prisma Message avec relations (meal, sender, receiver)
- [ ] Vérifier que le repas n'est pas `SERVED` pour nouveaux messages
- [ ] Implémenter modération automatique (détection numéros, pièces jointes)
- [ ] Créer composant React de messagerie
- [ ] Créer composant React de conversation

---

### US-021 : Consultation de mes conversations

**En tant que** membre  
**Je veux** voir la liste de mes conversations  
**Afin de** suivre mes échanges avec les autres membres

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Liste de toutes les conversations (groupées par repas)
- [ ] Tri par date de dernier message (décroissant)
- [ ] Indicateur de messages non lus
- [ ] Affichage du dernier message
- [ ] Nom du repas associé
- [ ] Nom du correspondant
- [ ] Clic pour ouvrir la conversation

**Tâches techniques** :
- [ ] Créer endpoint `GET /messages` (liste des conversations)
- [ ] Grouper les messages par `mealId`
- [ ] Calculer le nombre de messages non lus par conversation
- [ ] Créer composant React de liste des conversations

---

### US-022 : Consultation d'une conversation

**En tant que** membre  
**Je veux** voir les messages d'une conversation  
**Afin de** lire l'historique et répondre

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Affichage chronologique des messages
- [ ] Distinction visuelle entre messages envoyés et reçus
- [ ] Indicateur de statut (envoyé, lu)
- [ ] Zone de saisie de nouveau message
- [ ] Bouton d'envoi
- [ ] Limite de 1000 caractères par message
- [ ] Marquage automatique comme lu lors de l'ouverture

**Tâches techniques** :
- [ ] Créer endpoint `GET /messages/conversation/:mealId`
- [ ] Filtrer les messages par `mealId` et `userId`
- [ ] Marquer les messages comme lus
- [ ] Créer composant React de conversation

---

### US-023 : Modération automatique des messages

**En tant que** système  
**Je veux** filtrer automatiquement les messages  
**Afin de** empêcher l'échange de numéros de téléphone et de pièces jointes

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Détection automatique des numéros de téléphone (formats : 06, 07, +33, etc.)
- [ ] Détection des numéros écrits en toutes lettres (ex: "zéro six", "zéro un")
- [ ] Blocage de l'envoi si numéro détecté
- [ ] Message d'avertissement : "L'échange de numéros de téléphone n'est pas autorisé dans la messagerie. Le numéro du cuisinier est visible sur la fiche repas si vous avez réservé."
- [ ] Blocage de l'upload de fichiers
- [ ] Message d'erreur si tentative d'envoi de fichier

**Tâches techniques** :
- [ ] Implémenter regex pour détection de numéros français
- [ ] Implémenter détection de numéros en toutes lettres
- [ ] Créer service `MessageService.detectPhoneNumber()`
- [ ] Créer service `MessageService.filterContent()`
- [ ] Valider le contenu avant envoi
- [ ] Afficher les messages d'avertissement côté frontend

---

## 6. SYSTÈME "SAUVEZ-LES"

### US-024 : Consultation de la rubrique "Sauvez-les"

**En tant que** membre  
**Je veux** voir la liste des repas "Sauvez-les"  
**Afin de** réserver des repas qui vont expirer bientôt

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Rubrique dédiée "Sauvez-les" accessible depuis le menu
- [ ] Liste des repas avec `inSaveThem = true` et temps restant <= 24h
- [ ] Tri par défaut : Temps restant avant expiration (croissant)
- [ ] Affichage du compte à rebours : "Expire dans X heures"
- [ ] Pastille visuelle "Expire bientôt" sur chaque fiche
- [ ] Filtres de base : Distance, Heure de récupération, Type de cuisine, Nombre de parts
- [ ] **Membres premium uniquement** : Filtres avancés (rayon étendu, historique cuisiniers, note minimale)

**Tâches techniques** :
- [ ] Créer endpoint `GET /meals/save-them`
- [ ] Filtrer les repas avec `inSaveThem = true` et `expirationDate - now <= 24h`
- [ ] Implémenter les filtres de base et avancés
- [ ] Créer composant React de rubrique "Sauvez-les"
- [ ] Créer composant React de fiche repas "Sauvez-les"

---

### US-025 : Réservation depuis "Sauvez-les"

**En tant que** membre  
**Je veux** réserver un repas depuis "Sauvez-les"  
**Afin de** sauver un repas du gaspillage

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Processus identique à une réservation normale
- [ ] Vérification des quotas (les repas "Sauvez-les" comptent dans le quota global)
- [ ] Confirmation et notifications identiques
- [ ] Comptabilisation dans les statistiques "repas sauvés"
- [ ] **Membres premium uniquement** : Mise à jour du compteur "X repas sauvés" (affichage public)

**Tâches techniques** :
- [ ] Réutiliser le service `ReservationService.createReservation()`
- [ ] Marquer le repas comme sauvé dans les statistiques
- [ ] Mettre à jour le compteur premium si applicable
- [ ] Vérifier l'éligibilité au badge "Héros anti-gaspillage"

---

### US-026 : Statistiques d'impact environnemental (Premium)

**En tant que** membre premium  
**Je veux** voir mes statistiques d'impact environnemental  
**Afin de** mesurer ma contribution à la lutte contre le gaspillage

**Priorité** : P1  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Section "Mon impact environnemental" dans le tableau de bord premium
- [ ] Nombre total de repas sauvés (historique)
- [ ] Estimation CO2 évité : `Nombre de repas sauvés × 2.5 kg CO2/repas`
- [ ] Impact mensuel : Nombre de repas sauvés dans le mois en cours
- [ ] Impact annuel : Nombre de repas sauvés dans l'année en cours
- [ ] Graphiques : Visualisation de l'impact (courbe mensuelle, comparaison année)
- [ ] Affichage public du compteur "X repas sauvés" sur le profil

**Tâches techniques** :
- [ ] Créer endpoint `GET /users/me/environmental-impact`
- [ ] Calculer les statistiques d'impact
- [ ] Créer composant React de statistiques environnementales
- [ ] Intégrer une librairie de graphiques (Chart.js, Recharts)
- [ ] Afficher le compteur sur le profil public

---

## 7. SYSTÈME DE BONUS DONATEUR

### US-027 : Acquisition d'un bonus donateur

**En tant que** système  
**Je veux** attribuer automatiquement un bonus donateur  
**Afin de** récompenser les membres qui donnent plus qu'ils ne reçoivent

**Priorité** : P1  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Calcul automatique de l'écart : `Repas servis - Repas reçus`
- [ ] Si écart >= 5 : Acquisition d'un bonus donateur
- [ ] Principe multiplicateur : `Nombre de bonus = ((Écart - 5) / 5) arrondi à l'entier inférieur + 1`
- [ ] Validité : 2 semaines à partir de la date d'acquisition
- [ ] Notification au membre (email + app)
- [ ] Affichage dans le tableau de bord

**Tâches techniques** :
- [ ] Créer service `BonusDonorService.calculateBonus()`
- [ ] Créer service `BonusDonorService.acquireBonus()`
- [ ] Créer modèle Prisma BonusDonor
- [ ] Déclencher le calcul après chaque repas servi/reçu
- [ ] Créer job de vérification quotidienne

---

### US-028 : Utilisation d'un bonus donateur

**En tant que** membre  
**Je veux** utiliser un bonus donateur lors d'une réservation  
**Afin de** réserver un repas sans en proposer un en retour

**Priorité** : P1  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Option "Utiliser un bonus donateur" lors de la réservation
- [ ] Vérification de la disponibilité d'un bonus donateur valide
- [ ] Maximum 2 bonus donateurs utilisables par semaine
- [ ] Utilisable pour tous les types de repas (normaux et "Sauvez-les")
- [ ] Décompte du bonus donateur utilisé
- [ ] Réservation effectuée sans obligation de proposer un repas en retour

**Tâches techniques** :
- [ ] Modifier `ReservationService.createReservation()` pour gérer les bonus
- [ ] Vérifier la disponibilité d'un bonus valide
- [ ] Vérifier le quota hebdomadaire (2 max)
- [ ] Marquer le bonus comme utilisé
- [ ] Adapter le composant React de réservation

---

### US-029 : Transfert d'un bonus donateur (Premium)

**En tant que** membre premium  
**Je veux** transférer un bonus donateur à un autre membre  
**Afin de** partager mes bonus avec la communauté

**Priorité** : P2  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Section "Mes bonus donateurs" dans le tableau de bord premium
- [ ] Sélection d'un bonus donateur disponible
- [ ] Saisie du pseudo du membre bénéficiaire
- [ ] Vérification de l'existence du membre bénéficiaire
- [ ] Confirmation du transfert
- [ ] Notification au membre bénéficiaire (email + app)
- [ ] Bonus donateur ajouté au compte du bénéficiaire (validité : 2 semaines à partir du transfert)
- [ ] Bonus marqué comme transféré

**Tâches techniques** :
- [ ] Créer endpoint `POST /bonus-donors/:id/transfer`
- [ ] Créer service `BonusDonorService.transferBonus()`
- [ ] Vérifier le statut premium
- [ ] Vérifier l'existence du membre bénéficiaire
- [ ] Créer un nouveau bonus pour le bénéficiaire
- [ ] Créer composant React de transfert de bonus

---

## 8. SYSTÈME DE NOTATION ET BADGES

### US-030 : Notation et commentaire obligatoires

**En tant que** membre qui a reçu un repas  
**Je veux** noter et commenter un repas  
**Afin de** donner mon avis sur le repas reçu

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] Commentaire et notation obligatoires dans les 48 heures après passage au statut `SERVED`
- [ ] Formulaire de notation :
  - Note : 1 à 5 étoiles (obligatoire)
  - Commentaire : Texte libre, min 20 caractères, max 500 caractères (obligatoire)
  - Photos : Optionnelles (max 3 photos, 5MB chacune)
- [ ] Rappels automatiques :
  - 4h après passage à "servi" : Notification (app + mail)
  - 24h sans commentaire : Restriction (peut proposer mais pas choisir)
  - 48h sans commentaire : Compte restreint (connexion + commentaire uniquement)
  - 72h sans action : Compte bloqué (nécessite contact support)
- [ ] Mise à jour de la note globale du cuisinier
- [ ] Attribution automatique de badges (si conditions remplies)

**Tâches techniques** :
- [ ] Créer endpoint `POST /reviews`
- [ ] Créer modèle Prisma Review
- [ ] Implémenter validation Zod pour le formulaire
- [ ] Implémenter upload de photos (Cloudinary)
- [ ] Créer service `ReviewService.createReview()`
- [ ] Créer service `ReviewService.calculateGlobalRating()`
- [ ] Créer job de rappels (4h, 24h, 48h)
- [ ] Créer composant React de notation

---

### US-031 : Calcul de la note globale

**En tant que** système  
**Je veux** calculer automatiquement la note globale d'un cuisinier  
**Afin de** afficher sa réputation

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Calcul : `Note globale = (Somme des notes reçues / Nombre de notes) - (Repas non récupérés × 0.5)`
- [ ] Note minimale : 0/5
- [ ] Arrondi à 1 décimale
- [ ] Mise à jour automatique après chaque nouvelle note
- [ ] Impact des repas non récupérés sur la note

**Tâches techniques** :
- [ ] Implémenter service `ReviewService.calculateGlobalRating()`
- [ ] Prendre en compte les repas non récupérés
- [ ] Mettre à jour le champ `globalRating` dans le modèle User
- [ ] Déclencher le calcul après chaque nouvelle note

---

### US-032 : Attribution automatique de badges

**En tant que** système  
**Je veux** attribuer automatiquement des badges  
**Afin de** récompenser les membres actifs et de qualité

**Priorité** : P1  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Badges généraux (tous membres) :
  - Badge X : 10 repas servis avec note moyenne >= 4.0
  - Badge Y : 25 repas servis avec note moyenne >= 4.2
  - Badge Cordon bleu : 50 repas servis avec note moyenne >= 4.5
- [ ] Badge spécial "Héros anti-gaspillage" (premium uniquement) :
  - Obtenu après avoir sauvé 10 repas via "Sauvez-les"
- [ ] Vérification lors de chaque nouvelle note reçue
- [ ] Attribution automatique si conditions remplies
- [ ] Notification au membre (email + app)
- [ ] Affichage sur le profil public

**Tâches techniques** :
- [ ] Créer modèles Prisma Badge et UserBadge
- [ ] Créer service `BadgeService.checkBadgeEligibility()`
- [ ] Implémenter les conditions d'attribution pour chaque badge
- [ ] Déclencher la vérification après chaque note/review
- [ ] Créer job de vérification quotidienne

---

## 9. GESTION DES ABONNEMENTS

### US-033 : Consultation des plans d'abonnement

**En tant que** membre gratuit  
**Je veux** voir les plans d'abonnement premium  
**Afin de** décider si je veux passer à premium

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Page "Passer à Premium" accessible
- [ ] Affichage des 3 types d'abonnements :
  - Hebdomadaire : 2,50€/semaine
  - Mensuel : 9€/mois
  - Annuel : 90€/an (7,50€/mois, -17% de réduction)
- [ ] Affichage des avantages premium
- [ ] Mise en avant des économies (abonnement annuel)
- [ ] Bouton "Souscrire" pour chaque plan

**Tâches techniques** :
- [ ] Créer endpoint `GET /subscriptions/plans`
- [ ] Créer composant React de page premium
- [ ] Intégrer Stripe Elements pour le paiement

---

### US-034 : Souscription à un abonnement premium

**En tant que** membre gratuit  
**Je veux** souscrire à un abonnement premium  
**Afin de** accéder aux fonctionnalités premium

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] Sélection du type d'abonnement (hebdomadaire/mensuel/annuel)
- [ ] Affichage des avantages
- [ ] Saisie des informations de paiement (carte bancaire)
- [ ] Validation du paiement via Stripe
- [ ] Activation immédiate de l'abonnement premium
- [ ] Mise à jour du statut `subscriptionType` dans le profil
- [ ] Notification de confirmation (email + app)
- [ ] Accès immédiat aux fonctionnalités premium

**Tâches techniques** :
- [ ] Créer endpoint `POST /subscriptions`
- [ ] Intégrer Stripe API pour créer la subscription
- [ ] Créer customer Stripe si nécessaire
- [ ] Mettre à jour le modèle User (subscriptionType, subscriptionStart, subscriptionEnd)
- [ ] Créer composant React de souscription avec Stripe Elements
- [ ] Gérer les webhooks Stripe

---

### US-035 : Consultation de mon abonnement

**En tant que** membre premium  
**Je veux** voir les détails de mon abonnement  
**Afin de** suivre mon abonnement et mes factures

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Section "Mon abonnement" dans le tableau de bord
- [ ] Affichage du type d'abonnement actuel
- [ ] Date de début
- [ ] Date de fin / prochain renouvellement
- [ ] Montant payé
- [ ] Historique des factures (téléchargement)
- [ ] Bouton "Gérer mon abonnement" (modifier/annuler)

**Tâches techniques** :
- [ ] Créer endpoint `GET /subscriptions/current`
- [ ] Créer endpoint `GET /subscriptions/invoices`
- [ ] Récupérer les factures depuis Stripe
- [ ] Créer composant React de gestion d'abonnement

---

### US-036 : Annulation d'un abonnement

**En tant que** membre premium  
**Je veux** annuler mon abonnement  
**Afin de** arrêter mon abonnement premium

**Priorité** : P1  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Possibilité d'annuler à tout moment
- [ ] Confirmation avant annulation
- [ ] Fin de l'abonnement à la fin de la période en cours (pas de remboursement)
- [ ] Rétrogradation automatique en membre gratuit
- [ ] Conservation des données et historique
- [ ] Notification de confirmation (email + app)

**Tâches techniques** :
- [ ] Créer endpoint `PUT /subscriptions/cancel`
- [ ] Annuler l'abonnement Stripe
- [ ] Mettre à jour le modèle User (subscriptionType = FREE)
- [ ] Créer composant React de confirmation d'annulation

---

## 10. NOTIFICATIONS ET ALERTES

### US-037 : Notifications email

**En tant que** système  
**Je veux** envoyer des notifications par email  
**Afin de** informer les membres des événements importants

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] Types de notifications email :
  - Vérification email (inscription)
  - Vérification téléphone (inscription)
  - Nouvelle réservation de repas
  - Annulation de réservation
  - Expiration de repas (24h avant)
  - Rappel commentaire (4h, 24h, 48h après service)
  - Expiration de bonus donateur (3 jours avant, veille)
  - Repas non récupéré signalé
  - Atteinte du plafond d'annulations mensuelles
  - Attribution de badge
  - Renouvellement d'abonnement (3 jours avant)
- [ ] Templates d'emails personnalisés
- [ ] Paramétrage activable/désactivable dans les préférences

**Tâches techniques** :
- [ ] Intégrer SendGrid
- [ ] Créer service `NotificationService.sendEmail()`
- [ ] Créer templates d'emails pour chaque type
- [ ] Configurer les variables d'environnement SendGrid
- [ ] Implémenter la queue d'envoi (Bull)

---

### US-038 : Notifications push (PWA)

**En tant que** système  
**Je veux** envoyer des notifications push  
**Afin de** informer les membres en temps réel

**Priorité** : P1  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Types de notifications push :
  - Nouvelle réservation
  - Annulation de réservation
  - Repas "Sauvez-les" disponible (optionnel, paramétrable)
  - Rappel avant récupération (2h avant l'heure de récupération, inclut l'adresse)
  - Expiration de bonus donateur
  - Nouveau message système
  - Attribution de badge
- [ ] **Membres premium uniquement** : Notifications prioritaires "Sauvez-les" (reçues en premier)
- [ ] Paramétrage activable/désactivable dans les préférences
- [ ] Demande de permission pour les notifications

**Tâches techniques** :
- [ ] Implémenter Service Worker
- [ ] Configurer les notifications push (Web Push API)
- [ ] Créer service `NotificationService.sendPushNotification()`
- [ ] Gérer les préférences de notifications
- [ ] Implémenter la priorité premium pour "Sauvez-les"

---

### US-039 : Notifications dans l'application

**En tant que** membre  
**Je veux** voir les notifications dans l'application  
**Afin de** être informé des événements importants

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Centre de notifications accessible depuis le menu
- [ ] Liste des notifications (triées par date, décroissant)
- [ ] Indicateur de notifications non lues (badge)
- [ ] Types de notifications :
  - Messages système
  - Messages obligatoires (obligation de lecture)
  - Notifications générales
- [ ] Possibilité de marquer comme lu
- [ ] Possibilité de tout marquer comme lu
- [ ] Liens de redirection vers les pages concernées

**Tâches techniques** :
- [ ] Créer modèle Prisma Notification
- [ ] Créer endpoint `GET /notifications`
- [ ] Créer endpoint `PUT /notifications/:id/read`
- [ ] Créer endpoint `PUT /notifications/read-all`
- [ ] Créer service `NotificationService.createNotification()`
- [ ] Créer composant React de centre de notifications

---

## 11. GÉOLOCALISATION ET RECHERCHE

### US-040 : Géocodage d'adresse

**En tant que** système  
**Je veux** géocoder les adresses des membres  
**Afin de** calculer les distances entre membres

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Géocodage lors de l'inscription (adresse du profil)
- [ ] Géocodage lors du changement d'adresse (adresse du profil)
- [ ] Géocodage lors de la création de repas (adresse de récupération)
- [ ] Géocodage lors de la modification de repas (si adresse de récupération modifiée)
- [ ] Validation de l'adresse via Google Maps Geocoding API
- [ ] Stockage des coordonnées GPS (lat/lng) pour toutes les adresses
- [ ] Cache des géocodages (éviter requêtes répétées)

**Tâches techniques** :
- [ ] Intégrer Google Maps Geocoding API
- [ ] Créer service `GeolocationService.geocodeAddress()`
- [ ] Implémenter cache Redis pour les géocodages
- [ ] Stocker les coordonnées dans le modèle User

---

### US-041 : Calcul de distance

**En tant que** système  
**Je veux** calculer la distance entre l'adresse d'un membre et l'adresse de récupération d'un repas  
**Afin de** afficher la distance sur les fiches repas

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Calcul de distance entre l'adresse du membre et l'adresse de récupération du repas
- [ ] Utilisation des coordonnées GPS stockées
- [ ] Calcul à vol d'oiseau (formule Haversine)
- [ ] Affichage en kilomètres (format : "X.X km")
- [ ] Arrondi à 1 décimale
- [ ] Calcul dynamique lors de l'affichage de la liste des repas
- [ ] Calcul dynamique lors de l'affichage des détails d'un repas
- [ ] Filtre par distance dans la recherche

**Tâches techniques** :
- [ ] Créer service `GeolocationService.calculateDistance()`
- [ ] Implémenter formule Haversine
- [ ] Calculer la distance lors de la récupération des repas
- [ ] Filtrer par rayon de recherche

---

### US-042 : Recherche de repas avec filtres

**En tant que** membre  
**Je veux** rechercher des repas avec des filtres  
**Afin de** trouver rapidement les repas qui m'intéressent

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Filtres de base (tous membres) :
  - Distance : Rayon de recherche (slider, max 15 km pour gratuits, 20 km pour premium)
  - Date : Sélection de date ou "Aujourd'hui" / "Cette semaine"
  - Plage horaire : Midi / Soir / Tous
  - Type de cuisine : Filtre par ingrédients principaux
  - Nombre de parts : 1 / 2 / 3 / 4
- [ ] Filtres avancés (premium uniquement) :
  - Rayon étendu : Jusqu'à 20 km
  - Historique des cuisiniers favoris
  - Note minimale du cuisinier
  - Type de cuisine détaillé
  - Date de préparation
- [ ] Options de tri : Distance, Date, Note du cuisinier, Temps restant avant expiration
- [ ] Application des filtres en temps réel

**Tâches techniques** :
- [ ] Modifier endpoint `GET /meals` pour gérer tous les filtres
- [ ] Implémenter filtres de base et avancés
- [ ] Vérifier le statut premium pour les filtres avancés
- [ ] Créer composants React de filtres
- [ ] Implémenter la recherche côté frontend avec debounce

---

## 12. TABLEAU DE BORD

### US-043 : Consultation du tableau de bord

**En tant que** membre  
**Je veux** voir mon tableau de bord  
**Afin de** suivre mon activité sur la plateforme

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] Récapitulatif d'activité :
  - Repas proposés (statut : disponible, réservé)
  - Repas réservés (statut : réservé, à venir)
  - Repas en attente de commentaire (statut : servi, commentaire manquant)
- [ ] Historique :
  - Repas servis (total)
  - Repas reçus (total)
  - Repas expirés (total)
  - Repas annulés (total)
- [ ] Statistiques personnelles :
  - Note globale
  - Nombre de repas servis
  - Nombre de repas reçus
  - Nombre de bonus donateurs disponibles
  - Badges obtenus
  - Date d'inscription
- [ ] **Membres premium uniquement** :
  - Nombre total de repas sauvés
  - Estimation CO2 évité
  - Impact environnemental (mensuel/annuel)
  - Graphiques de l'impact

**Tâches techniques** :
- [ ] Créer endpoint `GET /users/me/dashboard`
- [ ] Calculer toutes les statistiques
- [ ] Créer composant React de tableau de bord
- [ ] Créer sous-composants pour chaque section
- [ ] Intégrer graphiques pour l'impact environnemental (premium)

---

### US-044 : Gestion des messages système

**En tant que** membre  
**Je veux** voir mes messages système  
**Afin de** être informé des événements importants et obligatoires

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Section "Messages" dans le tableau de bord
- [ ] Types de messages :
  - Notifications importantes
  - Messages obligatoires (obligation de lecture)
  - Informations générales
- [ ] Messages obligatoires :
  - Atteinte du plafond d'annulations mensuelles
  - Repas non récupéré signalé
  - Sanctions appliquées
- [ ] Indicateur de messages non lus (badge)
- [ ] Messages non lus en gras
- [ ] Marquage "lu" après ouverture
- [ ] Impossible de fermer un message obligatoire sans le lire

**Tâches techniques** :
- [ ] Créer modèle Prisma Notification avec type `SYSTEM_MESSAGE`
- [ ] Créer endpoint `GET /notifications/system`
- [ ] Implémenter logique de messages obligatoires
- [ ] Créer composant React de messages système
- [ ] Gérer l'état de lecture

---

## 13. GESTION DES SANCTIONS

### US-045 : Application des sanctions pour annulations

**En tant que** système  
**Je veux** appliquer des sanctions en cas de plafond d'annulations atteint  
**Afin de** limiter le gaspillage alimentaire

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] Détection du plafond mensuel atteint : 4 (annulations + repas non récupérés combinés)
- [ ] Sanctions appliquées :
  1. Blocage des annulations : Pendant 2 semaines
  2. Quota mensuel réduit : Pour le mois suivant, quota réduit à 2 annulations maximum
  3. Retour à la normale : Le quota mensuel revient à 4 annulations maximum le 2ème mois après
- [ ] Message dans l'espace abonné (obligation de lecture)
- [ ] Email expliquant la situation et insistant sur le risque de gaspillage alimentaire
- [ ] Notification via l'application invitant à lire le message

**Tâches techniques** :
- [ ] Créer service `SanctionService.applySanction()`
- [ ] Créer modèle Prisma Sanction
- [ ] Implémenter la détection du plafond
- [ ] Créer les sanctions (blocage, quota réduit)
- [ ] Créer les messages obligatoires
- [ ] Créer job de vérification quotidienne

---

### US-046 : Application des sanctions pour repas non récupérés

**En tant que** système  
**Je veux** appliquer des sanctions en cas de repas non récupéré  
**Afin de** sanctionner le manque de respect

**Priorité** : P0  
**Estimation** : 8 points

**Critères d'acceptation** :
- [ ] **1 repas non récupéré** :
  - Avertissement automatique
  - Message dans l'espace abonné (obligation de lecture)
  - Email insistant sur le manque de respect et le gaspillage alimentaire
  - Notification via l'application
  - Impact sur la note : Coefficient négatif appliqué
- [ ] **2 repas non récupérés dans le mois** :
  - Blocage immédiat des réservations : Pendant 2 semaines
  - Message obligatoire dans l'espace abonné
  - Notification par mail avec rappel des conséquences
  - Quota mensuel réduit : Pour le mois suivant, quota réduit à 1 repas non récupéré maximum
  - Impact sur la note : Coefficient négatif appliqué

**Tâches techniques** :
- [ ] Modifier `SanctionService` pour gérer les repas non récupérés
- [ ] Implémenter les sanctions progressives
- [ ] Créer les messages obligatoires
- [ ] Appliquer l'impact sur la note globale
- [ ] Créer job de vérification quotidienne

---

### US-047 : Gestion des quotas réduits

**En tant que** système  
**Je veux** gérer les quotas réduits après sanctions  
**Afin de** appliquer progressivement les restrictions

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Les quotas réduits s'appliquent au mois suivant le mois où la sanction a été appliquée
- [ ] Retour progressif à la normale :
  - 1er mois après sanction : Quota réduit
  - 2ème mois après sanction : Retour au quota normal
- [ ] Affichage clair des quotas actuels dans le tableau de bord
- [ ] Indication si quota réduit (avec explication)
- [ ] Compteur d'annulations/repas non récupérés dans le mois
- [ ] Alerte si proche du plafond

**Tâches techniques** :
- [ ] Créer service `QuotaService.getQuotaStatus()`
- [ ] Implémenter la logique de quotas réduits
- [ ] Calculer les dates de retour à la normale
- [ ] Créer endpoint `GET /users/me/quotas`
- [ ] Afficher les quotas dans le tableau de bord

---

## 14. TÂCHES AUTOMATIQUES (CRON JOBS)

### US-048 : Expiration automatique des repas

**En tant que** système  
**Je veux** expirer automatiquement les repas après 72h  
**Afin de** garantir la sécurité sanitaire

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Job exécuté toutes les heures
- [ ] Vérification des repas avec `expirationDate <= now` ET statut = `AVAILABLE` ou `RESERVED`
- [ ] Passage au statut `EXPIRED`
- [ ] Retrait de la rubrique "Sauvez-les" (si présent)
- [ ] Notification à l'auteur du repas
- [ ] Suppression de la réservation (si réservé)
- [ ] Mise à jour des statistiques "repas expirés"

**Tâches techniques** :
- [ ] Créer job `checkExpiration` (node-cron)
- [ ] Implémenter service `MealService.checkExpiration()`
- [ ] Mettre à jour le statut des repas expirés
- [ ] Envoyer les notifications
- [ ] Logger les actions

---

### US-049 : Ajout automatique dans "Sauvez-les"

**En tant que** système  
**Je veux** ajouter automatiquement les repas dans "Sauvez-les" 24h avant expiration  
**Afin de** lutter contre le gaspillage alimentaire

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Job exécuté toutes les heures
- [ ] Vérification des repas avec `expirationDate - now <= 24h` ET `expirationDate - now > 0` ET statut = `AVAILABLE` ou `RESERVED`
- [ ] Mise à jour `inSaveThem = true`
- [ ] Pastille visuelle "Expire bientôt" sur la fiche repas
- [ ] Notification à l'auteur du repas (24h avant expiration)
- [ ] Push notification optionnelle pour les membres ayant activé les alertes

**Tâches techniques** :
- [ ] Créer job `addToSaveThem` (node-cron)
- [ ] Implémenter service `MealService.addToSaveThem()`
- [ ] Mettre à jour le champ `inSaveThem`
- [ ] Envoyer les notifications
- [ ] Logger les actions

---

### US-050 : Rappels de commentaires

**En tant que** système  
**Je veux** envoyer des rappels pour les commentaires manquants  
**Afin de** garantir la notation des repas

**Priorité** : P0  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Job exécuté toutes les heures
- [ ] Vérification des repas avec statut = `SERVED` et pas de commentaire
- [ ] Rappels automatiques :
  - 4h après passage à "servi" : Notification (app + mail)
  - 24h sans commentaire : Restriction (peut proposer mais pas choisir)
  - 48h sans commentaire : Compte restreint (connexion + commentaire uniquement)
  - 72h sans action : Compte bloqué (nécessite contact support)
- [ ] Application progressive des restrictions

**Tâches techniques** :
- [ ] Créer job `sendReviewReminders` (node-cron)
- [ ] Implémenter service `ReviewService.sendReviewReminders()`
- [ ] Calculer les délais depuis le passage à "servi"
- [ ] Appliquer les restrictions progressives
- [ ] Envoyer les notifications

---

### US-051 : Expiration des bonus donateurs

**En tant que** système  
**Je veux** vérifier les bonus donateurs expirant bientôt  
**Afin de** informer les membres avant expiration

**Priorité** : P1  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Job exécuté quotidiennement
- [ ] Vérification des bonus avec `expiresAt - now <= 3 jours` ET `expiresAt - now > 0`
- [ ] Notification (email + app) : "Votre bonus donateur expire dans X jours"
- [ ] Notification la veille de l'expiration

**Tâches techniques** :
- [ ] Créer job `checkExpiringBonuses` (node-cron)
- [ ] Implémenter service `BonusDonorService.checkExpiringBonuses()`
- [ ] Envoyer les notifications
- [ ] Logger les actions

---

### US-052 : Calcul des quotas hebdomadaires

**En tant que** système  
**Je veux** réinitialiser les quotas hebdomadaires chaque lundi  
**Afin de** gérer les limites hebdomadaires

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Job exécuté chaque lundi à 00:00
- [ ] Réinitialisation des compteurs hebdomadaires :
  - Repas proposés
  - Repas réservés
  - Annulations
  - Repas non récupérés
  - Bonus donateurs utilisés
- [ ] Conservation des quotas mensuels

**Tâches techniques** :
- [ ] Créer job `resetWeeklyQuotas` (node-cron)
- [ ] Implémenter service `QuotaService.resetWeeklyQuotas()`
- [ ] Réinitialiser les compteurs dans la base de données
- [ ] Logger les actions

---

### US-053 : Calcul des quotas mensuels

**En tant que** système  
**Je veux** vérifier et réinitialiser les quotas mensuels  
**Afin de** gérer les limites mensuelles

**Priorité** : P0  
**Estimation** : 3 points

**Critères d'acceptation** :
- [ ] Job exécuté le 1er de chaque mois à 00:00
- [ ] Vérification des quotas mensuels :
  - Annulations
  - Repas non récupérés
  - Plafond global (annulations + repas non récupérés)
- [ ] Application des sanctions si plafond atteint
- [ ] Réinitialisation des compteurs mensuels
- [ ] Retour progressif des quotas réduits à la normale

**Tâches techniques** :
- [ ] Créer job `resetMonthlyQuotas` (node-cron)
- [ ] Implémenter service `QuotaService.resetMonthlyQuotas()`
- [ ] Vérifier les plafonds et appliquer les sanctions
- [ ] Gérer le retour progressif des quotas réduits
- [ ] Logger les actions

---

### US-054 : Renouvellement d'abonnements

**En tant que** système  
**Je veux** vérifier les abonnements expirant bientôt  
**Afin de** informer les membres et renouveler automatiquement

**Priorité** : P1  
**Estimation** : 5 points

**Critères d'acceptation** :
- [ ] Job exécuté quotidiennement
- [ ] Vérification des abonnements expirant dans 3 jours
- [ ] Notification (email + app) : "Votre abonnement expire dans X jours"
- [ ] Renouvellement automatique si carte valide
- [ ] Rétrogradation en membre gratuit si renouvellement échoue

**Tâches techniques** :
- [ ] Créer job `checkExpiringSubscriptions` (node-cron)
- [ ] Implémenter service `SubscriptionService.checkExpiringSubscriptions()`
- [ ] Intégrer Stripe pour le renouvellement automatique
- [ ] Gérer les webhooks Stripe
- [ ] Envoyer les notifications

---

## ANNEXES

### A. Priorisation globale

**P0 (Critique - MVP)** :
- Authentification et gestion des utilisateurs (US-001 à US-009)
- Gestion des repas (US-010 à US-014)
- Système de réservation (US-015 à US-019)
- Messagerie entre membres (US-020 à US-023)
- Système "Sauvez-les" (US-024, US-025)
- Système de notation (US-030, US-031)
- Gestion des abonnements (US-033 à US-035)
- Notifications (US-037, US-039)
- Géolocalisation et recherche (US-040 à US-042)
- Tableau de bord (US-043, US-044)
- Gestion des sanctions (US-045 à US-047)
- Tâches automatiques (US-048 à US-050, US-052, US-053)

**P1 (Important - MVP)** :
- Récupération de mot de passe (US-006)
- Gestion de la confidentialité Premium (US-009)
- Statistiques d'impact environnemental (US-026)
- Système de bonus donateur (US-027, US-028)
- Attribution automatique de badges (US-032)
- Annulation d'abonnement (US-036)
- Notifications push (US-038)
- Expiration des bonus donateurs (US-051)
- Renouvellement d'abonnements (US-054)

**P2 (Souhaitable - MVP)** :
- Transfert de bonus donateur (US-029)

### B. Estimation totale

**Total estimé** : ~250 points (environ 25 sprints de 2 semaines avec vélocité de 10 points/sprint)

**Répartition** :
- P0 : ~200 points
- P1 : ~40 points
- P2 : ~10 points

### C. Dépendances entre stories

**Dépendances critiques** :
- US-001 (Inscription) → Toutes les autres stories utilisateur
- US-004 (Connexion) → Toutes les stories nécessitant authentification
- US-010 (Création repas) → US-011, US-012, US-015, US-024
- US-015 (Réservation) → US-017, US-018, US-019, US-020
- US-030 (Notation) → US-031, US-032
- US-033 (Plans abonnement) → US-034, US-035

### D. Notes techniques

**Services backend à créer** :
- `AuthService` : Authentification et gestion des utilisateurs
- `MealService` : Gestion des repas
- `ReservationService` : Gestion des réservations
- `QuotaService` : Gestion des quotas
- `ReviewService` : Gestion des notations
- `MessageService` : Gestion de la messagerie
- `NotificationService` : Gestion des notifications
- `BonusDonorService` : Gestion des bonus donateurs
- `BadgeService` : Gestion des badges
- `SubscriptionService` : Gestion des abonnements
- `GeolocationService` : Géolocalisation
- `SanctionService` : Gestion des sanctions

**Jobs à créer** :
- `checkExpiration` : Expiration automatique des repas (toutes les heures)
- `addToSaveThem` : Ajout dans "Sauvez-les" (toutes les heures)
- `sendReviewReminders` : Rappels de commentaires (toutes les heures)
- `checkExpiringBonuses` : Expiration des bonus donateurs (quotidien)
- `resetWeeklyQuotas` : Réinitialisation quotas hebdomadaires (chaque lundi)
- `resetMonthlyQuotas` : Réinitialisation quotas mensuels (1er du mois)
- `checkExpiringSubscriptions` : Renouvellement abonnements (quotidien)

---

**Document créé par** : STORY-CREATOR  
**Basé sur** : ARCHITECTURE_TECHNIQUE.md (Agent ARCHITECT) et SPECIFICATIONS_FONCTIONNELLES.md (Agent PM)  
**Prochaine étape** : DEV (Développement des fonctionnalités)
