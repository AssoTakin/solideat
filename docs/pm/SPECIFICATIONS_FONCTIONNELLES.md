# SPÉCIFICATIONS FONCTIONNELLES - SOLID'EAT

**Date de création** : 2026  
**Agent** : PM (Product Manager)  
**Statut** : Spécifications fonctionnelles détaillées - MVP  
**Basé sur** : Analyse ANALYST - ANALYSE_PROJET_SOLIDEAT.md

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Gestion des utilisateurs](#2-gestion-des-utilisateurs)
3. [Système de repas](#3-système-de-repas)
4. [Système de réservation](#4-système-de-réservation)
5. [Messagerie entre membres](#5-messagerie-entre-membres)
6. [Système "Sauvez-les"](#6-système-sauvez-les)
7. [Système de bonus donateur](#7-système-de-bonus-donateur)
8. [Système de badges et notation](#8-système-de-badges-et-notation)
9. [Gestion des abonnements](#9-gestion-des-abonnements)
10. [Notifications et alertes](#10-notifications-et-alertes)
11. [Géolocalisation et recherche](#11-géolocalisation-et-recherche)
12. [Tableau de bord](#12-tableau-de-bord)
13. [Gestion des sanctions](#13-gestion-des-sanctions)
14. [Règles métier](#14-règles-métier)
15. [Cas d'usage détaillés](#15-cas-dusage-détaillés)

---

## 1. VUE D'ENSEMBLE

### 1.1 Contexte
SOLID'EAT est une plateforme de cuisine collaborative entre particuliers permettant l'échange de repas préparés. Le système repose sur un modèle freemium avec des fonctionnalités premium différenciantes.

### 1.2 Objectifs du MVP
- Permettre l'inscription et la gestion de profils membres
- Gérer la proposition et la réservation de repas
- Implémenter le système "Sauvez-les" pour lutter contre le gaspillage
- Gérer les abonnements premium
- Assurer la traçabilité et la sécurité sanitaire (expiration 72h)
- Implémenter le système de notation et de badges
- Gérer les quotas et sanctions
- Mettre en place la messagerie entre membres (avec restrictions et gestion de la visibilité des numéros)

### 1.3 Acteurs principaux
- **Membre gratuit** : Utilisateur avec limitations
- **Membre premium** : Utilisateur avec avantages étendus
- **Système** : Automatisations et notifications

---

## 2. GESTION DES UTILISATEURS

### 2.1 Inscription

#### 2.1.1 Formulaire d'inscription

**Champs obligatoires** :
- **Nom** (texte, max 50 caractères)
- **Prénom** (texte, max 50 caractères)
- **Pseudo** (texte, unique, max 30 caractères, alphanumérique + underscore)
- **Email** (email, unique, validation format)
- **Mot de passe** (min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial)
- **Confirmation mot de passe** (doit correspondre)
- **Numéro de téléphone** (format français, validation)
- **Adresse complète** (intégration Google Maps API)
  - Rue
  - Code postal
  - Ville
  - Coordonnées GPS (lat/lng) via Google Maps

**Champs optionnels** :
- Photo de profil
- Description personnelle
- Orientation culinaire

**Validations** :
1. **CGU et charte sanitaire** :
   - Affichage obligatoire des CGU
   - Affichage obligatoire de la charte sanitaire
   - Case à cocher "J'ai lu et j'accepte les CGU et la charte sanitaire" (obligatoire)
   - Enregistrement de la date/heure de signature

2. **Vérification email** :
   - Envoi d'email de vérification après soumission
   - Lien de vérification unique (valide 24h)
   - Compte non activé tant que l'email n'est pas vérifié
   - Possibilité de renvoyer l'email de vérification

3. **Vérification téléphone** :
   - Envoi de SMS avec code de vérification (6 chiffres)
   - Code valide 10 minutes
   - Possibilité de renvoyer le code
   - Compte non activé tant que le téléphone n'est pas vérifié

**Règles métier** :
- Un email ne peut être utilisé qu'une seule fois
- Un numéro de téléphone ne peut être utilisé qu'une seule fois
- Un pseudo doit être unique
- L'adresse doit être géocodée via Google Maps (validation de l'existence)

**Flux d'inscription** :
1. Remplissage du formulaire
2. Lecture des CGU et charte sanitaire
3. Signature des CGU
4. Soumission du formulaire
5. Vérification email (envoi automatique)
6. Vérification téléphone (envoi SMS)
7. Activation du compte (une fois les deux vérifications effectuées)
8. Redirection vers le tableau de bord

#### 2.1.2 Gestion de la confidentialité

**Règles d'affichage** :
- **Public** : Pseudo uniquement
- **Membres de la plateforme** : Pseudo + note globale + badges + statistiques publiques
- **Profil complet** : Visible uniquement par le propriétaire du compte

**Données privées** (non visibles par les autres membres) :
- Nom complet
- Email
- Numéro de téléphone
- Adresse complète (seule la distance est affichée)
- Données de facturation

### 2.2 Profil membre

#### 2.2.1 Informations affichées publiquement

**Pour tous les membres** :
- Pseudo
- Note globale (moyenne des notes reçues, format X.X/5)
- Date d'inscription ("Membre depuis [mois année]")
- Statistiques :
  - Nombre de repas servis (total)
  - Nombre de repas en cours (proposés/réservés)
  - Nombre de repas expirés (total historique)
- Description personnelle (si renseignée)
- Orientation culinaire (si renseignée)
- Liste des repas servis (historique) avec :
  - Nom du repas
  - Date de service
  - Note reçue (si disponible)
  - Avis (si disponible)
- Badges obtenus :
  - Badge X
  - Badge Y
  - Badge Cordon bleu
  - Badge "Héros anti-gaspillage" (premium uniquement)

**Pour les membres premium uniquement** :
- Compteur "X repas sauvés" (affiché publiquement dans le profil)
- Statistiques d'impact environnemental (si partagées publiquement)

#### 2.2.2 Gestion du profil

**Modifications autorisées** :
- Photo de profil (upload, max 5MB, formats JPG/PNG)
- Mot de passe (changement avec vérification ancien mot de passe)
- Description personnelle (texte libre, max 500 caractères)
- Orientation culinaire (texte libre, max 200 caractères)
- **Membres premium uniquement** : Paramètre de masquage du numéro de téléphone (section "Confidentialité")

**Modifications restreintes** :
- **Membres gratuits** : Changement d'adresse limité à 1 fois par an
- **Membres premium** : Changement d'adresse illimité
- **Membres premium uniquement** : Option de masquer le numéro de téléphone (paramétrable dans les préférences)

**Règles de changement d'adresse** :
- Vérification via Google Maps (géocodage)
- Mise à jour des coordonnées GPS
- Recalcul des distances pour les repas disponibles
- **Membres gratuits** : Si quota annuel atteint → proposition d'upgrade premium
- **Membres gratuits** : Si tentative de changement après utilisation → redirection automatique vers page premium

### 2.3 Authentification

#### 2.3.1 Connexion

**Méthodes d'authentification** :
- Email + mot de passe
- (Évolution future : authentification sociale)

**Sécurité** :
- Limitation des tentatives de connexion (5 tentatives max, blocage 30 minutes)
- Mot de passe oublié (réinitialisation par email)
- Session avec expiration (30 jours d'inactivité)

#### 2.3.2 Déconnexion
- Déconnexion manuelle
- Déconnexion automatique après expiration de session

---

## 3. SYSTÈME DE REPAS

### 3.1 Proposition de repas

#### 3.1.1 Obligations minimales

**Règle principale** :
- Un membre doit proposer au minimum **1 repas par semaine**
- Pas d'obligation de choisir un repas en retour la même semaine

**Vérification** :
- Calcul hebdomadaire (lundi à dimanche)
- Alerte si aucun repas proposé dans la semaine en cours
- Rappel automatique si dimanche sans repas proposé

#### 3.1.2 Création d'une fiche repas

**Champs obligatoires** :
- **Nom du repas** (texte, max 100 caractères)
- **Photo** (upload, max 5MB, formats JPG/PNG, obligatoire, vraie photo du plat)
- **Jour de service proposé** (date, sélection calendrier, obligatoire)
- **Heure de récupération** (obligatoire)
  - Mode : "Heure fixe" ou "Plage horaire"
  - Si heure fixe : Format HH:MM (ex: 14:15, 19:30)
  - Si plage horaire : Format "De HH:MM à HH:MM" (ex: De 14:15 à 16:00)
  - Validation : Heure de fin > heure de début (si plage horaire)
  - Format d'affichage : "14:15" ou "Entre 14:15 et 16:00"
- **Adresse de récupération** (obligatoire)
  - Champ de recherche avec autocomplétion Google Maps
  - Validation via Google Maps Geocoding API
  - Affichage d'une carte interactive pour sélection
  - Stockage : Adresse complète + coordonnées GPS (lat/lng)
  - Différente de l'adresse du profil (peut être modifiée par repas)
- **Date de préparation** (date, sélection calendrier, obligatoire)
  - Note : Généralement identique à la date de post
  - Ne peut pas être dans le futur
  - Ne peut pas être antérieure à plus de 3 jours
- **Ingrédients** (liste, obligatoire, min 3 ingrédients)
  - Saisie libre ou sélection depuis une liste prédéfinie
  - Possibilité d'ajouter des ingrédients personnalisés
  - Affichage des allergènes majeurs (si applicable)

**Champs optionnels** :
- **Description/mise en valeur** (texte libre, max 500 caractères)
- **Nombre de parts** (entier, par défaut 1, max 4)
  - Membres gratuits : Fixé à 1 (non modifiable)
  - Membres premium : Modifiable (1 à 4)

**Champs calculés automatiquement** :
- **Date de mise à disposition** (date de post) : Date/heure de création de la fiche
- **Date d'expiration** : Date de préparation + 72 heures
  - Calcul automatique lors de la création
  - Affichée en grisé (non modifiable)
  - Format : "Expire le [date] à [heure]"

**Statuts possibles** :
- `disponible` : Repas proposé, non réservé
- `réservé` : Repas réservé par un membre
- `servi` : Repas livré/récupéré
- `expiré` : Repas non réservé après 72h
- `non-récupéré` : Repas réservé mais non récupéré

**Bouton de contact** :
- Bouton "Contacter le cuisinier" visible sur la fiche repas
- Disponible tant que le statut n'est pas passé à "servi"
- Une fois le repas "servi", la messagerie reste accessible pour historique mais pas pour nouvelles questions

**Bouton de contact** :
- Bouton "Contacter le cuisinier" visible sur la fiche repas
- Disponible tant que le statut n'est pas passé à "servi"
- Permet d'ouvrir la messagerie pour poser des questions (voir section 4.5)

#### 3.1.3 Validation de la fiche repas

**Règles de validation** :
- Date de préparation ne peut pas être dans le futur
- Date de préparation ne peut pas être antérieure à plus de 3 jours
- Jour de service doit être >= date de préparation
- Jour de service doit être <= date d'expiration (date de préparation + 72h)
- Photo doit être une vraie photo (détection automatique si possible)
- Ingrédients : minimum 3 ingrédients requis

**Modération** :
- Vérification manuelle de la photo (si système de modération activé)
- Vérification du contenu (description, nom) pour respect des règles

#### 3.1.4 Modification d'un repas

**Modifications autorisées** :
- Uniquement si statut = `disponible`
- Modification de la description
- Modification du nombre de parts (premium uniquement)
- Modification du jour de service (si >= date du jour)
- Modification de l'heure de récupération
- Modification de l'adresse de récupération

**Modifications interdites** :
- Date de préparation (une fois créée)
- Photo (une fois créée)
- Ingrédients (une fois créée)
- Date d'expiration (calculée automatiquement)

**Annulation d'un repas** :
- Possible uniquement si statut = `disponible`
- Notification aux membres qui avaient mis en favori
- Suppression de la fiche

### 3.2 Gestion de l'expiration des repas

#### 3.2.1 Calcul de l'expiration

**Règle principale** :
- Durée de vie maximale : **72 heures** à partir de la date de préparation
- Calcul : `Date d'expiration = Date de préparation + 72 heures`

**Exemple** :
- Date de préparation : 01/01/2026 10:00
- Date d'expiration : 04/01/2026 10:00

#### 3.2.2 Notifications d'expiration

**24 heures avant expiration** :
- Notification dans la plateforme (pastille visuelle sur la fiche repas)
- Email à l'auteur du repas
- Push notification (si activée par l'utilisateur)
- Message : "Votre repas [nom] expire dans 24h. Il sera automatiquement retiré s'il n'est pas réservé."

**Ajout automatique dans "Sauvez-les"** :
- 24h avant expiration → Ajout automatique dans la rubrique "Sauvez-les"
- Pastille visuelle "Expire bientôt" sur la fiche repas
- Visible par tous les membres (selon quotas)

#### 3.2.3 Expiration automatique

**Déclenchement** :
- Tâche automatique (cron job) vérifiant toutes les heures
- Si `Date actuelle >= Date d'expiration` ET statut = `disponible` ou `réservé` :
  - Passage au statut `expiré`
  - Retrait de la rubrique "Sauvez-les" (si présent)
  - Notification à l'auteur du repas
  - Suppression de la réservation (si réservé)

**Conséquences** :
- Repas non réservable
- Visible uniquement dans l'historique de l'auteur
- Comptabilisé dans les statistiques "repas expirés"

---

## 4. SYSTÈME DE RÉSERVATION

### 4.1 Réservation d'un repas

#### 4.1.1 Conditions de réservation

**Vérifications préalables** :
- Statut du repas = `disponible`
- Date d'expiration non atteinte
- Quotas du membre respectés (voir section 4.2)
- Distance respectée (rayon de livraison si applicable)

**Quotas selon statut membre** :

**Membres gratuits** :
- Maximum **1 repas réservé par semaine** (lundi à dimanche)
- Maximum **1 repas "Sauvez-les" par semaine** (compte dans le quota global)
- Ne peuvent réserver que parmi les repas d'autres membres gratuits

**Membres premium** :
- Maximum **3 repas réservés par semaine** (lundi à dimanche)
- Maximum **3 repas "Sauvez-les" par semaine** (compte dans le quota global)
- Peuvent réserver parmi tous les membres (gratuits et premium)

#### 4.1.2 Processus de réservation

**Flux de réservation** :
1. Sélection d'un repas disponible
2. Vérification des quotas (affichage si quota atteint)
3. Affichage des détails :
   - Nom du repas
   - Cuisinier (pseudo)
   - Date et heure de récupération (fixe ou plage horaire)
   - Adresse de récupération (complète, géolocalisée)
   - Distance depuis l'adresse du membre réservant (calculée)
4. Confirmation de réservation
5. Passage au statut `réservé`
6. Notification au cuisinier (email + app)
7. Notification au membre qui réserve (confirmation)

**Informations affichées lors de la réservation** :
- Date et heure de récupération (fixe ou plage horaire)
- Adresse de récupération (complète, géolocalisée)
- Distance depuis l'adresse du membre réservant
- Distance estimée
- Instructions de livraison (si renseignées par le cuisinier)
- **Bouton "Afficher le numéro de téléphone"** :
  - Visible uniquement sur la fiche du repas réservé et dans le tableau de bord (section repas réservés)
  - **Membres gratuits** : Bouton activable uniquement par un utilisateur qui a réservé leur repas
  - **Membres premium** : Bouton activable par les autres membres (premium ou freemium) dans le cadre d'une réservation de leur repas, mais seulement s'ils l'ont permis dans les paramètres de leur tableau de bord
  - Masqué dans le profil public et dans les messages
- **Numéro de téléphone du cuisinier** (affiché après réservation) :
  - **Membres gratuits** : Numéro visible obligatoirement (pas de possibilité de masquer)
  - **Membres premium** : Numéro visible si le cuisinier n'a pas masqué son numéro dans ses préférences
  - Si numéro masqué (premium uniquement) : Cuisinier joignable uniquement par messagerie plateforme

#### 4.1.3 Rappel avant service

**2 heures avant l'heure de récupération** :
- Notification push (si activée)
- Email de rappel
- Message : 
  - Si heure fixe : "Rappel : Vous devez récupérer [nom repas] aujourd'hui à [heure]"
  - Si plage horaire : "Rappel : Vous devez récupérer [nom repas] aujourd'hui entre [heure début] et [heure fin]"
- Inclure l'adresse de récupération dans le message
- Possibilité de confirmer sa présence (bouton dans la notification)

### 4.2 Annulation de réservation

#### 4.2.1 Conditions d'annulation

**Délai d'annulation** :
- Annulation possible jusqu'à **7 heures avant** l'heure de récupération (ou début de plage horaire)
- Après ce délai : Annulation impossible (sauf cas exceptionnel via support)

**Limites d'annulation** :

**Quotas hebdomadaires** :
- Maximum **1 annulation par semaine** (lundi à dimanche)
- Comptabilisation séparée des repas non récupérés

**Quotas mensuels** :
- Maximum **4 annulations par mois** (calendrier mensuel)
- Comptabilisation combinée : Annulations + Repas non récupérés
- Plafond global mensuel : **4** (annulations + repas non récupérés)

**Règles de comptabilisation** :
- Les annulations et les repas non récupérés sont comptabilisés **séparément** pour les quotas hebdomadaires
- Les annulations et les repas non récupérés sont **additionnés** pour le plafond mensuel global

#### 4.2.2 Processus d'annulation

**Flux d'annulation** :
1. Sélection du repas réservé
2. Vérification du délai (7h avant service)
3. Vérification des quotas (affichage si quota atteint)
4. Saisie du motif d'annulation (obligatoire, texte libre, max 200 caractères)
5. Confirmation d'annulation
6. Passage au statut `disponible`
7. Vérification du temps restant avant expiration
8. Si temps restant > 0 : Ajout automatique dans "Sauvez-les"
9. Notification au cuisinier (email + app)
10. Mise à jour des compteurs d'annulation

**Notifications d'annulation** :
- Email au cuisinier : "La réservation de [nom repas] a été annulée"
- Notification dans l'app au cuisinier
- Confirmation au membre qui annule

#### 4.2.3 Réintégration dans "Sauvez-les"

**Conditions** :
- Repas annulé avec temps restant avant expiration > 0
- Ajout automatique dans la rubrique "Sauvez-les"
- Visible par tous les membres (selon leurs quotas respectifs)

### 4.3 Gestion des repas non récupérés

#### 4.3.1 Signalement par le cuisinier

**Délai de signalement** :
- Possible jusqu'à **24 heures après** l'heure de récupération (ou fin de plage horaire)

**Processus de signalement** :
1. Fin de l'heure de récupération (ou fin de plage horaire)
2. Le cuisinier accède à la fiche repas réservé
3. Bouton "Signaler repas non récupéré" (visible uniquement après l'heure de récupération, fin de plage horaire)
4. Confirmation du signalement
5. Notification au membre qui n'est pas venu (demande de confirmation/explication)
6. Comptabilisation séparée (quota spécifique repas non récupérés)
7. Application des sanctions (voir section 12)

**Gestion du repas** :
- Si temps restant avant expiration > 0 : Remise automatique dans "Sauvez-les"
- Si temps restant avant expiration = 0 : Passage au statut `expiré`
- Passage au statut `non-récupéré`

#### 4.3.2 Quotas pour repas non récupérés

**Quotas hebdomadaires** :
- Maximum **1 repas non récupéré par semaine** (quota séparé de l'annulation)

**Quotas mensuels** :
- Maximum **2 repas non récupérés par mois** (quota plus strict que les annulations)
- Comptabilisation combinée avec annulations pour le plafond global mensuel

**Sanctions** (voir section 12 pour détails) :
- **1 repas non récupéré** : Avertissement + message obligatoire
- **2 repas non récupérés dans le mois** : Blocage réservations 2 semaines + quota réduit
- Impact sur la note globale du membre

### 4.4 Messagerie entre membres

#### 4.4.1 Possibilité de contact

**Contact du cuisinier** :
- Tout membre peut contacter le cuisinier qui a posté un repas
- Bouton "Contacter le cuisinier" visible sur la fiche repas

**Conditions d'accès** :
- Le repas doit être posté (statut : `disponible` ou `réservé`)
- Le contact est possible tant que le statut n'est pas passé à `servi` (livré)
- Une fois le repas `servi`, la messagerie reste accessible pour historique mais pas pour nouvelles questions

**Objectifs du contact** :
- Questions sur les allergènes
- Questions sur les ingrédients
- Coordination pour la livraison
- Autres questions sur le repas

#### 4.4.2 Restrictions de la messagerie

**Interdiction d'échange de numéros de téléphone** :
- Détection automatique des numéros de téléphone dans les messages
- Impossible d'écrire un numéro de téléphone (format standard : 06 12 34 56 78, +33, etc.)
- Impossible d'écrire un numéro en toutes lettres (ex: "zéro six", "zéro un", etc.)
- Filtrage automatique des messages contenant des numéros
- Message d'avertissement si tentative d'échange de numéro : "L'échange de numéros de téléphone n'est pas autorisé via la messagerie. Utilisez le numéro affiché sur la fiche repas si disponible."

**Interdiction de pièces jointes** :
- Pas d'envoi de fichiers
- Pas d'envoi d'images via la messagerie (les photos de repas sont gérées ailleurs)
- Sécurité et protection des données

#### 4.4.3 Visibilité des numéros de téléphone

**Règle générale** :
- Seul l'utilisateur qui a réservé un repas peut voir le numéro de téléphone du cuisinier qui a proposé le repas
- Le numéro n'est visible qu'**après la réservation effective**

**Membres gratuits (freemium)** :
- **Numéro de téléphone visible obligatoirement** pour le membre qui a réservé
- Pas de possibilité de masquer le numéro
- Le membre qui a réservé peut voir et utiliser le numéro du cuisinier

**Membres premium** :
- **Option de masquage du numéro** :
  - Les membres premium peuvent refuser de faire apparaître leur numéro de téléphone
  - Paramétrable dans les préférences du compte (section "Confidentialité")
  - Si masqué : le membre premium n'est joignable que par la messagerie de la plateforme
  - Si non masqué : comportement identique aux membres gratuits (numéro visible pour celui qui a réservé)

**Affichage du numéro** :
- Visible uniquement sur la fiche du repas réservé
- Visible dans le tableau de bord (section repas réservés)
- Masqué dans le profil public
- Masqué dans les messages

#### 4.4.4 Fonctionnalités de la messagerie

**Caractéristiques** :
- Messages asynchrones (pas de chat en temps réel)
- Historique des conversations liées à un repas
- Chaque conversation est liée à un repas spécifique
- Notifications lors de nouveaux messages (email + app)
- Indicateur de messages non lus
- Possibilité de marquer comme lu
- Modération automatique (détection numéros, pièces jointes)

**Interface** :
- Liste des conversations (groupées par repas)
- Affichage des messages dans une conversation
- Zone de saisie de message
- Bouton d'envoi
- Indicateur de statut (envoyé, lu)

**Limites** :
- Messages limités à 1000 caractères par message
- Pas de limitation du nombre de messages par conversation
- Conversation accessible tant que le repas n'est pas passé au statut `servi`

---

## 5. MESSAGERIE ENTRE MEMBRES

### 5.1 Principe

**Objectif** : Permettre la communication entre membres pour coordonner la livraison, poser des questions sur les repas (allergènes, ingrédients, etc.).

**Fonctionnement** :
- Messagerie asynchrone (pas de chat en temps réel)
- Conversations liées à un repas spécifique
- Accessible tant que le repas n'est pas "servi"
- Historique conservé après service

### 5.2 Possibilité de contact

#### 5.2.1 Contact du cuisinier

**Conditions d'accès** :
- Tout membre peut contacter le cuisinier qui a posté un repas
- Le repas doit être posté (statut : `disponible` ou `réservé`)
- Le contact est possible tant que le statut n'est pas passé à `servi` (livré)
- Une fois le repas `servi`, la messagerie reste accessible pour historique mais pas pour nouvelles questions

**Objectifs du contact** :
- Questions sur les allergènes
- Questions sur les ingrédients
- Coordination pour la livraison
- Autres questions sur le repas

**Accès** :
- Bouton "Contacter le cuisinier" sur la fiche repas
- Ouverture d'une conversation liée au repas
- Historique des messages précédents (si conversation existante)

#### 5.2.2 Fonctionnalités de la messagerie

**Caractéristiques** :
- Messages asynchrones (pas de chat en temps réel)
- Historique des conversations liées à un repas
- Notifications lors de nouveaux messages
- Indicateur de messages non lus
- Possibilité de marquer comme lu
- Modération automatique (détection numéros, pièces jointes)

**Interface** :
- Liste des conversations (triées par date de dernier message)
- Vue conversation (messages chronologiques)
- Indicateur visuel des messages non lus
- Badge avec nombre de messages non lus

### 5.3 Restrictions de la messagerie

#### 5.3.1 Interdiction d'échange de numéros de téléphone

**Règles strictes** :
- **Impossible d'écrire un numéro de téléphone** dans les messages
- Détection automatique des numéros (formats : 06 12 34 56 78, 0612345678, +33612345678, etc.)
- **Impossible d'écrire un numéro en toutes lettres** (ex: "zéro six", "zéro un", "06", etc.)
- Filtrage automatique des messages contenant des numéros
- Message d'avertissement si tentative d'échange de numéro : "L'échange de numéros de téléphone n'est pas autorisé dans la messagerie. Le numéro du cuisinier est visible sur la fiche repas si vous avez réservé."

**Modération** :
- Détection automatique des patterns de numéros
- Blocage du message avant envoi
- Avertissement affiché à l'utilisateur
- Possibilité de réessayer sans le numéro

#### 5.3.2 Interdiction de pièces jointes

**Règles** :
- **Pas d'envoi de fichiers** dans la messagerie
- **Pas d'envoi d'images** via la messagerie (les photos de repas sont gérées ailleurs)
- Sécurité et protection des données
- Message d'erreur si tentative d'envoi de fichier

**Justification** :
- Sécurité de la plateforme
- Protection des données personnelles
- Éviter les échanges de fichiers malveillants
- Maintenir la simplicité de la messagerie

### 5.4 Visibilité des numéros de téléphone

#### 5.4.1 Règle générale

**Principe** :
- Le numéro de téléphone n'est **jamais affiché automatiquement**
- Un **bouton "Afficher le numéro de téléphone"** est disponible sur la fiche du repas réservé
- Le bouton n'est visible qu'**après la réservation effective**
- Le numéro n'est jamais visible dans la messagerie
- Le numéro s'affiche uniquement après clic sur le bouton

#### 5.4.2 Membres gratuits (freemium)

**Règles** :
- **Bouton "Afficher le numéro de téléphone"** activable **uniquement par un utilisateur qui a réservé leur repas**
- Pas de possibilité de masquer le bouton (toujours disponible pour celui qui a réservé)
- Le membre qui a réservé peut cliquer sur le bouton pour afficher et utiliser le numéro du cuisinier gratuit
- Le bouton est visible uniquement sur la fiche du repas réservé et dans le tableau de bord (section repas réservés)

**Fonctionnement** :
- Bouton visible sur la fiche du repas réservé (pour le membre qui a réservé)
- Clic sur le bouton → Affichage du numéro de téléphone
- Le numéro reste affiché sur la fiche tant que le repas n'est pas "servi"
- Masqué dans le profil public
- Masqué dans les messages

#### 5.4.3 Membres premium

**Option de masquage du bouton** :
- Les membres premium peuvent **refuser de faire apparaître le bouton "Afficher le numéro de téléphone"**
- Paramétrable dans les préférences du compte (section "Confidentialité" du tableau de bord premium)
- Option : "Autoriser l'affichage de mon numéro de téléphone lors des réservations" (case à cocher)
- Si désactivé : le bouton n'apparaît pas, le membre premium n'est joignable que par la messagerie de la plateforme
- Si activé : le bouton est activable par les autres membres (premium ou freemium) dans le cadre d'une réservation de leur repas

**Fonctionnement** :
- Si option activée : Bouton "Afficher le numéro de téléphone" visible pour le membre qui a réservé
- Si option désactivée : Bouton non visible, uniquement messagerie disponible
- Clic sur le bouton → Affichage du numéro de téléphone
- Le numéro reste affiché sur la fiche tant que le repas n'est pas "servi"
- Visible uniquement sur la fiche du repas réservé (si option activée)
- Visible dans le tableau de bord (section repas réservés, si option activée)
- Masqué dans le profil public
- Masqué dans les messages

#### 5.4.4 Gestion des préférences

**Paramétrage** :
- Accès depuis le tableau de bord → "Paramètres" → "Confidentialité"
- Option "Autoriser l'affichage de mon numéro de téléphone lors des réservations" (premium uniquement, case à cocher)
- Par défaut : Option désactivée (bouton masqué, numéro masqué par défaut)
- Modification possible à tout moment
- Application immédiate aux nouveaux repas réservés
- Les repas déjà réservés conservent l'état au moment de la réservation (si le bouton était visible au moment de la réservation, il reste visible)

### 5.5 Notifications de messagerie

**Types de notifications** :
- **Nouveau message reçu** : Notification push (si activée) + email optionnel
- **Réponse à une question sur un repas** : Notification dans l'app
- **Indicateur de messages non lus** : Badge sur l'icône messagerie

**Paramétrage** :
- Activation/désactivation des notifications email (dans les préférences)
- Activation/désactivation des notifications push (dans les préférences)

---

## 6. SYSTÈME "SAUVEZ-LES"

### 5.1 Principe

**Objectif** : Lutter contre le gaspillage alimentaire en permettant de réserver des repas qui vont expirer dans les 24 heures.

**Fonctionnement** :
- Repas ajoutés automatiquement 24h avant expiration
- Rubrique dédiée "Sauvez-les" accessible depuis le menu principal
- Filtres et recherche spécifiques
- Avantages premium différenciants

### 6.2 Ajout automatique dans "Sauvez-les"

**Conditions d'ajout** :
- Repas avec statut `disponible` ou `réservé` (si annulé)
- Temps restant avant expiration <= 24 heures
- Temps restant avant expiration > 0

**Déclenchement** :
- Tâche automatique (cron job) vérifiant toutes les heures
- Calcul : `Temps restant = Date d'expiration - Date actuelle`
- Si `Temps restant <= 24h` ET `Temps restant > 0` : Ajout automatique

**Pastille visuelle** :
- Badge "Expire bientôt" sur la fiche repas
- Compte à rebours affiché : "Expire dans X heures"

### 6.3 Affichage dans "Sauvez-les"

#### 6.3.1 Liste des repas

**Tri par défaut** :
- Temps restant avant expiration (croissant) : Les repas qui expirent le plus tôt en premier

**Informations affichées** :
- Photo du repas
- Nom du repas
- Cuisinier (pseudo)
- Temps restant avant expiration (compte à rebours)
- Distance
- Plage horaire de service
- Nombre de parts
- Note du cuisinier

#### 6.3.2 Filtres de base (tous membres)

- **Distance** : Rayon de recherche (par défaut 10 km, max 15 km)
- **Heure de récupération** : Filtre par heure (ex: "Avant 12h", "12h-14h", "14h-18h", "Après 18h", "Tous")
- **Type de cuisine** : Filtre par ingrédients principaux
- **Nombre de parts** : 1 / 2 / 3 / 4

#### 6.3.3 Filtres avancés (membres premium uniquement)

**Avantages premium dans "Sauvez-les"** :
- **Rayon de recherche étendu** : Jusqu'à 20 km (vs 15 km pour gratuits)
- **Historique des cuisiniers favoris** : Filtre pour afficher uniquement les repas de cuisiniers déjà testés
- **Filtres avancés** :
  - Filtre par note minimale du cuisinier
  - Filtre par type de cuisine (plus détaillé)
  - Filtre par nombre de parts
  - Filtre par distance (plus précis)
  - Filtre par date de préparation

### 6.4 Notifications "Sauvez-les"

#### 6.4.1 Notifications standard (tous membres)

- Push notifications optionnelles (paramétrables dans les préférences)
- Email quotidien avec liste des repas "Sauvez-les" disponibles
- Fréquence : 1 fois par jour (matin, 9h)

#### 6.4.2 Notifications prioritaires (membres premium)

- **Notifications prioritaires** : Alertes "Sauvez-les" reçues en premier
- Push notifications instantanées dès qu'un repas est ajouté dans "Sauvez-les"
- Email avec mise en avant des repas prioritaires
- Fréquence : En temps réel (dès l'ajout dans "Sauvez-les")

### 6.5 Réservation depuis "Sauvez-les"

**Processus identique à une réservation normale** :
- Vérification des quotas (voir section 4.1.1)
- Les repas "Sauvez-les" comptent dans le quota global de réservation
- Confirmation et notifications identiques

**Comptabilisation** :
- Les repas réservés depuis "Sauvez-les" sont comptabilisés dans les statistiques "repas sauvés"
- **Membres premium uniquement** : Compteur "X repas sauvés" mis à jour et affiché publiquement

### 6.6 Statistiques d'impact environnemental (premium uniquement)

#### 6.6.1 Tableau de bord environnemental

**Métriques affichées** :
- **Nombre total de repas sauvés** : Compteur global (historique)
- **Estimation CO2 évité** : Calcul basé sur le nombre de repas sauvés
  - Formule : `CO2 évité = Nombre de repas sauvés × 2.5 kg CO2/repas` (valeur indicative)
- **Impact mensuel** : Nombre de repas sauvés dans le mois en cours
- **Impact annuel** : Nombre de repas sauvés dans l'année en cours
- **Graphiques** : Visualisation de l'impact (courbe mensuelle, comparaison année)

**Affichage** :
- Accessible depuis le tableau de bord premium
- Section dédiée "Mon impact environnemental"
- Graphiques interactifs (si librairie graphique disponible)

#### 6.6.2 Affichage public

**Compteur "X repas sauvés"** :
- Affiché publiquement sur le profil membre (premium uniquement)
- Format : "X repas sauvés du gaspillage"
- Mis à jour en temps réel

**Badge "Héros anti-gaspillage"** :
- Obtenu après avoir sauvé **X repas** (seuil à définir, suggestion : 10 repas)
- Visible sur le profil membre
- Badge spécial dans la liste des badges

---

## 7. SYSTÈME DE BONUS DONATEUR

### 7.1 Acquisition

#### 7.1.1 Condition d'acquisition

**Règle principale** :
- Un bonus donateur est acquis lorsque l'écart entre repas servis et repas reçus atteint **+5**

**Calcul** :
- `Écart = Nombre de repas servis - Nombre de repas reçus`
- Si `Écart >= 5` : Acquisition d'un bonus donateur
- **Principe multiplicateur** : Le nombre de bonus acquis = `(Écart - 5) / 5` (arrondi à l'entier inférieur) + 1
  - Exemple : Écart de 12 → (12-5)/5 = 1.4 → 1 + 1 = **2 bonus donateurs**

**Exemples** :
- 10 repas servis, 5 reçus → Écart = 5 → **1 bonus donateur**
- 15 repas servis, 5 reçus → Écart = 10 → **2 bonus donateurs**
- 20 repas servis, 5 reçus → Écart = 15 → **3 bonus donateurs**

#### 7.1.2 Validité

**Durée de validité** :
- **2 semaines** à partir de la date d'acquisition
- Calcul : Date d'acquisition + 14 jours

**Rappels** :
- **3 jours avant expiration** : Notification (email + app)
- **La veille de l'expiration** : Notification (email + app)
- Message : "Votre bonus donateur expire dans X jours. Utilisez-le pour réserver un repas sans en proposer un en retour !"

### 7.2 Utilisation

#### 7.2.1 Conditions d'utilisation

**Règles** :
- Permet de choisir un repas **sans en proposer un en retour**
- Maximum **2 bonus donateurs utilisables par semaine** (lundi à dimanche)
- Utilisable pour tous les types de repas (normaux et "Sauvez-les")

**Processus d'utilisation** :
1. Sélection d'un repas disponible
2. Vérification de la disponibilité d'un bonus donateur
3. Option "Utiliser un bonus donateur" (case à cocher)
4. Confirmation de réservation
5. Décompte du bonus donateur utilisé
6. Réservation effectuée (sans obligation de proposer un repas en retour)

#### 7.2.2 Transfert de bonus donateur (premium uniquement)

**Règle** :
- **Membres premium uniquement** : Possibilité de transférer un bonus donateur à un autre membre
- Transfert gratuit (pas de frais)

**Processus de transfert** :
1. Accès à la section "Mes bonus donateurs"
2. Sélection d'un bonus donateur disponible
3. Saisie du pseudo du membre bénéficiaire
4. Confirmation du transfert
5. Notification au membre bénéficiaire (email + app)
6. Bonus donateur ajouté au compte du bénéficiaire (validité : 2 semaines à partir du transfert)

---

## 8. SYSTÈME DE BADGES ET NOTATION

### 8.1 Système de notation

#### 8.1.1 Commentaire et notation obligatoires

**Obligation** :
- Commentaire et notation **obligatoires dans les 48 heures** après le passage au statut `servi`

**Processus** :
1. Repas livré/récupéré → Passage au statut `servi`
2. Déclenchement du délai de 48h
3. Rappels automatiques :
   - **4h après** passage à "servi" : Notification (app + mail)
   - **24h sans commentaire** : Restriction (peut proposer mais pas choisir)
   - **48h sans commentaire** : Compte restreint (connexion + commentaire uniquement)
   - **72h sans action** : Compte bloqué (nécessite contact support)

**Formulaire de notation** :
- **Note** : 1 à 5 étoiles (obligatoire)
- **Commentaire** : Texte libre, min 20 caractères, max 500 caractères (obligatoire)
- **Photos** : Optionnelles (max 3 photos, 5MB chacune)

#### 8.1.2 Calcul de la note globale

**Formule** :
- Note globale = Moyenne de toutes les notes reçues
- Calcul : `Somme des notes / Nombre de notes`
- Affichage : Format X.X/5 (ex: 4.5/5)
- Arrondi à 1 décimale

**Impact des repas non récupérés** :
- Coefficient négatif appliqué (à définir, suggestion : -0.5 par repas non récupéré)
- Formule ajustée : `Note globale = (Somme des notes / Nombre de notes) - (Repas non récupérés × 0.5)`
- Note minimale : 0/5

### 8.2 Système de badges

#### 8.2.1 Badges généraux (tous membres)

**Badge X** :
- Condition : À définir (suggestion : 10 repas servis avec note moyenne >= 4.0)
- Visible sur le profil

**Badge Y** :
- Condition : À définir (suggestion : 25 repas servis avec note moyenne >= 4.2)
- Visible sur le profil

**Badge Cordon bleu** :
- Condition : À définir (suggestion : 50 repas servis avec note moyenne >= 4.5)
- Visible sur le profil
- Badge "Le Top"

**Attribution automatique** :
- Vérification lors de chaque nouvelle note reçue
- Attribution automatique si conditions remplies
- Notification au membre (email + app)

#### 8.2.2 Badge spécial "Héros anti-gaspillage" (premium uniquement)

**Condition** :
- Obtenu après avoir sauvé **X repas** via "Sauvez-les" (seuil à définir, suggestion : 10 repas)
- Visible sur le profil
- Badge spécial valorisant l'engagement environnemental

**Attribution** :
- Vérification lors de chaque repas sauvé
- Attribution automatique si seuil atteint
- Notification au membre (email + app)

---

## 9. GESTION DES ABONNEMENTS

### 9.1 Modèle freemium

#### 9.1.1 Membres gratuits

**Limitations** :
- **1 repas proposé par semaine** maximum
- **1 repas choisi par semaine** maximum
- Ne peuvent choisir que parmi les repas d'autres membres gratuits
- Changement d'adresse limité à **1 fois par an**
- Pas de transfert de bonus donateur
- Pas de vente de repas
- Nombre de parts fixé à **1** (non modifiable)
- Pas d'accès aux filtres avancés dans "Sauvez-les"
- Pas de notifications prioritaires "Sauvez-les"
- Pas de statistiques d'impact environnemental
- Pas d'affichage public du compteur "repas sauvés"
- **Numéro de téléphone** : Bouton "Afficher le numéro de téléphone" activable uniquement par un utilisateur qui a réservé leur repas (pas de possibilité de masquer le bouton)

**Alerte premium** :
- Lors du changement d'adresse : Proposition d'upgrade premium
- Si changement d'adresse déjà utilisé : Redirection automatique vers page premium
- Affichage des services premium sans possibilité d'utilisation (incitation)

#### 9.1.2 Membres premium

**Avantages** :
- **3 repas proposés par semaine** maximum
- **3 repas choisis par semaine** maximum
- Choix parmi tous les membres (premium et freemium)
- Proposition de repas à tous les membres
- Changement d'adresse **illimité**
- Transfert de bonus donateur autorisé
- Vente de repas autorisée (5€ par repas, revenu utilisateur : 4€)
- Modification du nombre de parts (1 à 4)
- Choix de repas avec nombre de parts > 1
- **Avantages dans "Sauvez-les"** :
  - Notifications prioritaires (alertes reçues en premier)
  - Filtres avancés (rayon étendu, historique cuisiniers, recherche précise)
  - Statistiques d'impact environnemental (tableau de bord détaillé)
  - Affichage public du compteur "X repas sauvés" sur le profil
  - Badge spécial "Héros anti-gaspillage" après X repas sauvés
- **Gestion de la confidentialité et des contacts (Amélioration Future VoIP & Protection des Données)** :
  - **Numéro masqué par défaut** : Par souci de sécurité et pour maintenir les communications au sein de l'application, les numéros de téléphone des utilisateurs sont masqués par défaut pour tous les membres.
  - **Avantages Premium de Confidentialité (Actifs)** :
    - **Géolocalisation floutée (Floutage d'adresse)** : Flouter son adresse exacte sur la carte publique pour les repas proposés (affichage d'un rayon de 500m) tant que la réservation n'est pas confirmée.
    - **Mode Incognito (Navigation invisible)** : Visiter les profils et consulter les repas sans apparaître dans l'historique des membres.
    - **Profil d'activité masqué** : Masquer l'historique de ses repas partagés/reçus et de ses statistiques d'impact sur son profil public **uniquement pour les membres gratuits**. Les autres membres Premium continuent de voir ces informations, favorisant la transparence au sein de la communauté engagée.
  - **Perspective d'évolution future (V2)** : Une **fonctionnalité d'appel vocal VoIP sécurisé direct** (via WebRTC) intégrée à la messagerie sera proposée dans une version ultérieure (V2) afin de permettre aux utilisateurs de s'appeler de manière fluide sans divulguer leur numéro de téléphone physique et sans quitter l'écosystème de l'application.
  - **Chiffrement de bout en bout (E2EE - Évolution Future)** : Option pour chiffrer ses conversations privées de messagerie.

### 9.2 Tarification

#### 9.2.1 Abonnements premium

**Abonnement hebdomadaire** :
- Prix : **2,50€/semaine**
- Équivalent mensuel : ~10,83€/mois
- Incitation : +11% par rapport à l'abonnement mensuel

**Abonnement mensuel** :
- Prix : **9€/mois** (tarif de référence)
- Sans engagement
- Renouvellement automatique

**Abonnement annuel** :
- Prix : **90€/an** (soit 7,50€/mois)
- Économie : -17% par rapport à l'abonnement mensuel (18€ économisés sur l'année)
- Incitation forte à l'engagement annuel

#### 9.2.2 Tarification des repas vendus

**Prix standard** :
- **5€ par repas** (prix affiché)
- **Frais de service** : 1€ (compris dans le prix)
- **Revenu utilisateur** : 4€ par repas vendu
- **Revenu plateforme** : 1€ par repas vendu (frais de service)

**Processus de vente** :
- Option "Vendre ce repas" lors de la création (premium uniquement)
- Prix fixe : 5€ (non modifiable)
- Paiement via la plateforme (système de paiement à intégrer)
- Versement au cuisinier : 4€ (après service du repas)

### 9.3 Gestion des abonnements

#### 9.3.1 Souscription

**Processus** :
1. Accès à la page "Passer à Premium"
2. Sélection du type d'abonnement (hebdomadaire/mensuel/annuel)
3. Affichage des avantages
4. Saisie des informations de paiement
5. Validation du paiement
6. Activation immédiate de l'abonnement premium
7. Notification de confirmation (email + app)

**Méthodes de paiement** :
- Carte bancaire (obligatoire)
- (Évolution future : PayPal, virement)

#### 9.3.2 Renouvellement

**Renouvellement automatique** :
- Abonnement renouvelé automatiquement à la fin de la période
- Prélèvement automatique
- Notification 3 jours avant le renouvellement (email + app)

**Annulation** :
- Possibilité d'annuler à tout moment
- Fin de l'abonnement à la fin de la période en cours (pas de remboursement)
- Rétrogradation automatique en membre gratuit
- Conservation des données et historique

#### 9.3.3 Gestionnaire d'abonnement

**Accès** :
- Depuis le tableau de bord
- Section "Mon abonnement"

**Informations affichées** :
- Type d'abonnement actuel
- Date de début
- Date de fin / prochain renouvellement
- Montant payé
- Historique des factures
- Bouton "Gérer mon abonnement" (modifier/annuler)

**Facturation** :
- Génération automatique des factures
- Envoi par email
- Téléchargement depuis le tableau de bord
- Historique complet des factures

---

## 9. MESSAGERIE ENTRE MEMBRES

### 9.1 Vue d'ensemble

La messagerie permet aux membres de communiquer entre eux concernant les repas, notamment pour :
- Poser des questions sur les allergènes
- Demander des précisions sur les ingrédients
- Coordonner la livraison
- Autres questions sur le repas

### 9.2 Accès à la messagerie

**Depuis la fiche repas** :
- Bouton "Contacter le cuisinier" visible sur chaque fiche repas
- Disponible tant que statut ≠ `servi`
- Ouverture d'une nouvelle conversation ou accès à une conversation existante

**Depuis le tableau de bord** :
- Section "Messages" dans le menu
- Liste de toutes les conversations
- Indicateur de messages non lus

### 9.3 Gestion des conversations

**Création d'une conversation** :
- Automatique lors du premier message envoyé
- Liée à un repas spécifique
- Titre de la conversation : "Questions sur [Nom du repas]"

**Historique** :
- Tous les messages sont conservés
- Accessible même après passage au statut `servi` (lecture seule)
- Impossible d'envoyer de nouveaux messages une fois le repas `servi`

### 9.4 Modération automatique

**Détection des numéros de téléphone** :
- Regex pour détecter les formats français (06, 07, +33, etc.)
- Détection des numéros écrits en toutes lettres
- Blocage de l'envoi si numéro détecté
- Message d'avertissement affiché

**Détection des pièces jointes** :
- Blocage de l'upload de fichiers
- Message d'avertissement si tentative

**Filtrage des contenus** :
- Détection de contenus inappropriés (optionnel, selon système de modération)
- Signalement possible par les membres

---

## 10. NOTIFICATIONS ET ALERTES

### 10.1 Types de notifications

#### 10.1.1 Notifications système (plateforme)

**Types** :
- Messages système dans l'espace abonné
- Indicateur de messages non lus
- Messages obligatoires (obligation de lecture)

**Messages obligatoires** :
- Atteinte du plafond d'annulations mensuelles (annulations + repas non récupérés)
- Repas non récupéré signalé
- Sanctions appliquées (blocage, quota réduit)

#### 10.1.2 Notifications email

**Types de notifications email** :
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

**Fréquence** :
- En temps réel pour les actions importantes (réservation, annulation)
- Quotidienne pour les résumés (repas "Sauvez-les")
- Selon délais définis pour les rappels

#### 10.1.3 Push notifications (application)

**Types** :
- Nouvelle réservation
- Annulation de réservation
- Repas "Sauvez-les" disponible (optionnel, paramétrable)
- Rappel avant service (2h avant)
- Expiration de bonus donateur
- Nouveau message système
- Attribution de badge

**Paramétrage** :
- Activation/désactivation dans les préférences utilisateur
- Choix des types de notifications
- **Membres premium** : Notifications prioritaires "Sauvez-les" (reçues en premier)

### 10.2 Notifications spécifiques

#### 10.2.1 Rappel avant livraison

**Déclenchement** :
- **2 heures avant** l'heure de récupération

**Contenu** :
- Notification push (si activée)
- Email de rappel
- Message : 
  - Si heure fixe : "Rappel : Vous devez récupérer [nom repas] aujourd'hui à [heure]"
  - Si plage horaire : "Rappel : Vous devez récupérer [nom repas] aujourd'hui entre [heure début] et [heure fin]"
- Inclure l'adresse de récupération dans le message
- Possibilité de confirmer sa présence (bouton dans la notification)

#### 10.2.2 Expiration de repas

**24 heures avant expiration** :
- Notification plateforme (pastille visuelle)
- Email à l'auteur du repas
- Push notification (si activée)
- Message : "Votre repas [nom] expire dans 24h. Il sera automatiquement retiré s'il n'est pas réservé."

#### 10.2.3 Repas non récupéré

**Au membre qui n'est pas venu** :
- Notification immédiate (email + app)
- Message : "Un repas que vous aviez réservé n'a pas été récupéré. Veuillez confirmer ou expliquer la situation."
- Demande de confirmation/explication
- Message obligatoire dans l'espace abonné

**Au cuisinier** :
- Confirmation du signalement
- Notification : "Le repas non récupéré a été signalé. Il sera remis dans 'Sauvez-les' si du temps reste avant expiration."

**Notifications de messagerie** :
- Nouveau message reçu (push + email optionnel)
- Réponse à une question sur un repas
- Notification par email optionnelle (paramétrable dans les préférences)

---

## 11. GÉOLOCALISATION ET RECHERCHE

### 11.1 Géolocalisation

#### 11.1.1 Intégration Google Maps

**Fonctionnalités** :
- Géocodage des adresses lors de l'inscription (adresse du profil)
- Géocodage des adresses de récupération lors de la création de repas
- Calcul des distances entre membres et adresses de récupération
- Affichage des repas disponibles sur une carte (optionnel)
- Calcul du rayon de livraison

**API utilisée** :
- Google Maps Geocoding API (géocodage)
- Google Maps Distance Matrix API (calcul distances)
- (Optionnel) Google Maps JavaScript API (affichage carte)

#### 11.1.2 Calcul des distances

**Méthode** :
- Distance à vol d'oiseau (calculée via coordonnées GPS)
- Affichage en kilomètres (format : "X.X km")
- Arrondi à 1 décimale

**Rayon de livraison** :
- **Par défaut** : 10-15 km (suggestion)
- Affichage de la distance sur chaque fiche repas (depuis l'adresse du membre vers l'adresse de récupération)
- Filtre par distance dans la recherche

### 11.3 Adresse de récupération des repas

**Géocodage** :
- Utilisation de Google Maps Geocoding API
- Validation de l'adresse lors de la création
- Stockage des coordonnées GPS (lat/lng)
- Calcul de distance depuis l'adresse du membre réservant

**Affichage** :
- Adresse complète dans la fiche repas
- Carte interactive (optionnelle) pour visualiser l'emplacement
- Distance calculée et affichée dynamiquement

### 11.2 Recherche de repas

#### 11.2.1 Recherche de base

**Critères de recherche** :
- **Distance** : Rayon de recherche (slider, max 15 km pour gratuits, 20 km pour premium)
- **Date** : Sélection de date ou "Aujourd'hui" / "Cette semaine"
- **Heure de récupération** : Filtre par heure (ex: "Avant 12h", "12h-14h", "14h-18h", "Après 18h", "Tous")
- **Type de cuisine** : Filtre par ingrédients principaux
- **Nombre de parts** : 1 / 2 / 3 / 4

**Tri** :
- Par défaut : Distance (croissant)
- Options : Distance, Date, Note du cuisinier, Temps restant avant expiration

#### 11.2.2 Recherche avancée (premium uniquement)

**Filtres supplémentaires** :
- **Rayon étendu** : Jusqu'à 20 km
- **Historique des cuisiniers favoris** : Filtre pour afficher uniquement les repas de cuisiniers déjà testés
- **Note minimale du cuisinier** : Filtre par note (ex: >= 4.0)
- **Type de cuisine détaillé** : Filtres plus précis
- **Date de préparation** : Filtre par fraîcheur

#### 11.2.3 Recherche dans "Sauvez-les"

**Filtres spécifiques** :
- Tous les filtres de recherche de base
- Tri par défaut : Temps restant avant expiration (croissant)
- Filtres avancés premium (si membre premium)

---

## 12. TABLEAU DE BORD

### 12.1 Vue d'ensemble

#### 12.1.1 Récapitulatif d'activité

**Repas actuels** :
- Repas proposés (statut : disponible, réservé)
- Repas réservés (statut : réservé, à venir)
- Repas en attente de commentaire (statut : servi, commentaire manquant)

**Historique** :
- Repas servis (total)
- Repas reçus (total)
- Repas expirés (total)
- Repas annulés (total)

#### 12.1.2 Statistiques personnelles

**Métriques affichées** :
- Note globale
- Nombre de repas servis
- Nombre de repas reçus
- Nombre de bonus donateurs disponibles
- Badges obtenus
- Date d'inscription

**Membres premium uniquement** :
- Nombre total de repas sauvés
- Estimation CO2 évité
- Impact environnemental (mensuel/annuel)
- Graphiques de l'impact

### 12.2 Gestion du compte

#### 12.2.1 Modifications de profil

**Accessibles depuis le tableau de bord** :
- Modification photo de profil
- Modification mot de passe
- Modification description personnelle
- Modification orientation culinaire
- Changement d'adresse (selon quotas)

#### 12.2.2 Gestionnaire d'abonnement

**Section dédiée** :
- Type d'abonnement actuel
- Date de fin / prochain renouvellement
- Historique des factures
- Bouton "Gérer mon abonnement"

### 12.3 Espace messages

#### 12.3.1 Messages système

**Types de messages** :
- Notifications importantes
- Messages obligatoires (obligation de lecture)
- Informations générales

**Messages obligatoires** :
- Atteinte du plafond d'annulations mensuelles
- Repas non récupéré signalé
- Sanctions appliquées

**Indicateur** :
- Badge avec nombre de messages non lus
- Messages non lus en gras
- Marquage "lu" après ouverture

#### 12.3.2 Contact support

**Méthode** :
- Email uniquement (pas de chat en direct)
- Formulaire de contact depuis le tableau de bord
- Catégories : Problème technique, Question abonnement, Signalement, Autre
- Réponse sous 48h (objectif)

### 12.4 Récapitulatif des repas

#### 12.4.1 Repas servis

**Affichage** :
- Liste des repas servis (historique)
- Filtres : Date, Statut, Note reçue
- Détails : Nom, Date, Membre qui a réservé, Note, Avis

#### 12.4.2 Repas reçus

**Affichage** :
- Liste des repas reçus (historique)
- Filtres : Date, Statut, Note donnée
- Détails : Nom, Date, Cuisinier, Note donnée, Commentaire

---

## 13. GESTION DES SANCTIONS

### 13.1 Sanctions pour annulations

#### 13.1.1 Atteinte du plafond mensuel (4 annulations + repas non récupérés)

**Déclenchement** :
- Plafond global mensuel atteint : 4 (annulations + repas non récupérés combinés)

**Sanctions appliquées** :
1. **Blocage des annulations** : Pendant 2 semaines (impossible d'annuler un repas réservé)
2. **Quota mensuel réduit** : Pour le mois suivant, quota réduit à **2 annulations maximum** (au lieu de 4)
3. **Retour à la normale** : Le quota mensuel revient à 4 annulations maximum le **2ème mois** après le mois où la capacité maximale a été atteinte

**Notifications** :
- Message dans l'espace abonné (obligation de lecture)
- Email expliquant la situation et insistant sur le risque de gaspillage alimentaire
- Notification via l'application invitant à lire le message

### 13.2 Sanctions pour repas non récupérés

#### 13.2.1 1 repas non récupéré

**Sanctions** :
- **Avertissement automatique** :
  - Message dans l'espace abonné (obligation de lecture)
  - Email insistant sur le manque de respect et le gaspillage alimentaire
  - Notification via l'application
- **Impact sur la note** : Coefficient négatif appliqué (voir section 7.1.2)

#### 13.2.2 2 repas non récupérés dans le mois

**Sanctions** :
- **Blocage immédiat des réservations** : Pendant 2 semaines (impossible de réserver un repas)
- **Message obligatoire** : Dans l'espace abonné (obligation de lecture)
- **Notification par mail** : Avec rappel des conséquences
- **Quota mensuel réduit** : Pour le mois suivant, quota réduit à **1 repas non récupéré maximum** (au lieu de 2)
- **Impact sur la note** : Coefficient négatif appliqué

#### 13.2.3 Plafond mensuel global atteint (4 annulations + repas non récupérés)

**Sanctions** :
- **Blocage des réservations** : Pendant 2 semaines
- **Quota mensuel réduit** : Pour le mois suivant, quota réduit à **2** (annulations + repas non récupérés combinés)
- **Message obligatoire** : Avec insistance sur le gaspillage et le manque de respect
- **Impact sur la note** : Coefficient négatif appliqué

### 13.3 Gestion des quotas réduits

#### 13.3.1 Application des quotas réduits

**Règles** :
- Les quotas réduits s'appliquent au **mois suivant** le mois où la sanction a été appliquée
- Retour progressif à la normale :
  - **1er mois après sanction** : Quota réduit
  - **2ème mois après sanction** : Retour au quota normal

**Exemple** :
- Janvier : Plafond atteint → Sanction appliquée
- Février : Quota réduit à 2
- Mars : Retour au quota normal (4)

#### 13.3.2 Affichage des quotas

**Dans le tableau de bord** :
- Affichage clair des quotas actuels
- Indication si quota réduit (avec explication)
- Compteur d'annulations/repas non récupérés dans le mois
- Alerte si proche du plafond

---

## 14. RÈGLES MÉTIER

### 14.1 Calculs et formules

#### 14.1.1 Date d'expiration

```
Date d'expiration = Date de préparation + 72 heures
```

#### 14.1.2 Bonus donateur

```
Écart = Nombre de repas servis - Nombre de repas reçus
Si Écart >= 5 :
    Nombre de bonus = ((Écart - 5) / 5) arrondi à l'entier inférieur + 1
```

#### 14.1.3 Note globale

```
Note globale = (Somme des notes reçues / Nombre de notes) - (Repas non récupérés × 0.5)
Note minimale = 0/5
```

#### 14.1.4 Estimation CO2 évité

```
CO2 évité = Nombre de repas sauvés × 2.5 kg CO2/repas
```
(Formule indicative, à ajuster selon données réelles)

### 14.2 Quotas et limites

#### 14.2.1 Membres gratuits

- **Repas proposés** : 1 par semaine
- **Repas réservés** : 1 par semaine (dont max 1 "Sauvez-les")
- **Annulations** : 1 par semaine, 4 par mois
- **Repas non récupérés** : 1 par semaine, 2 par mois
- **Plafond global mensuel** : 4 (annulations + repas non récupérés)
- **Changement d'adresse** : 1 par an
- **Bonus donateurs utilisables** : 2 par semaine
- **Nombre de parts** : Fixé à 1

#### 14.2.2 Membres premium

- **Repas proposés** : 3 par semaine
- **Repas réservés** : 3 par semaine (dont max 3 "Sauvez-les")
- **Annulations** : 1 par semaine, 4 par mois
- **Repas non récupérés** : 1 par semaine, 2 par mois
- **Plafond global mensuel** : 4 (annulations + repas non récupérés)
- **Changement d'adresse** : Illimité
- **Bonus donateurs utilisables** : 2 par semaine
- **Transfert de bonus donateur** : Autorisé
- **Nombre de parts** : 1 à 4 (modifiable)
- **Vente de repas** : Autorisée (5€ par repas)

### 14.3 Délais et validités

- **Expiration repas** : 72 heures à partir de la date de préparation
- **Notification expiration** : 24 heures avant expiration
- **Commentaire obligatoire** : 48 heures après service
- **Rappels commentaire** : 4h, 24h, 48h après service
- **Annulation possible** : Jusqu'à 7 heures avant service
- **Signalement repas non récupéré** : Jusqu'à 24 heures après heure de récupération (ou fin de plage horaire)
- **Rappel avant service** : 2 heures avant heure de récupération
- **Bonus donateur validité** : 2 semaines
- **Rappels bonus donateur** : 3 jours avant, veille
- **Session utilisateur** : 30 jours d'inactivité

### 14.4 Périodes de calcul

- **Semaine** : Lundi à dimanche (calendrier)
- **Mois** : Calendrier mensuel (1er au dernier jour du mois)
- **Année** : Année civile (1er janvier au 31 décembre)

---

## 15. CAS D'USAGE DÉTAILLÉS

### 15.1 Inscription d'un nouveau membre

**Acteur** : Nouveau membre

**Préconditions** : Aucune

**Flux principal** :
1. Accès à la page d'inscription
2. Lecture des CGU et charte sanitaire
3. Signature des CGU (case à cocher)
4. Remplissage du formulaire :
   - Nom, Prénom, Pseudo
   - Email, Mot de passe
   - Numéro de téléphone
   - Adresse (avec Google Maps)
5. Soumission du formulaire
6. Vérification email (envoi automatique)
7. Vérification téléphone (envoi SMS)
8. Activation du compte (après vérifications)
9. Redirection vers le tableau de bord

**Flux alternatifs** :
- Email déjà utilisé → Message d'erreur
- Téléphone déjà utilisé → Message d'erreur
- Pseudo déjà utilisé → Message d'erreur
- Adresse invalide → Message d'erreur

**Postconditions** : Compte créé et activé

### 15.2 Proposition d'un repas

**Acteur** : Membre (gratuit ou premium)

**Préconditions** :
- Compte activé
- Quota de repas proposés non atteint (1 pour gratuit, 3 pour premium)

**Flux principal** :
1. Accès à "Proposer un repas"
2. Remplissage de la fiche repas :
   - Nom du repas
   - Upload photo
   - Jour de service
   - Heure de récupération (fixe ou plage horaire)
   - Adresse de récupération
   - Date de préparation
   - Ingrédients (min 3)
   - Description (optionnel)
   - Nombre de parts (1 pour gratuit, 1-4 pour premium)
3. Validation de la fiche
4. Calcul automatique de la date d'expiration (date préparation + 72h)
5. Publication (statut : disponible)
6. Notification de confirmation

**Flux alternatifs** :
- Quota atteint → Message d'erreur avec rappel des limites
- Date de préparation invalide → Message d'erreur
- Photo invalide → Message d'erreur

**Postconditions** : Repas créé et visible dans la liste des repas disponibles

### 15.3 Réservation d'un repas

**Acteur** : Membre (gratuit ou premium)

**Préconditions** :
- Compte activé
- Repas disponible
- Quota de réservation non atteint

**Flux principal** :
1. Recherche de repas (filtres optionnels)
2. Sélection d'un repas disponible
3. Vérification des quotas (affichage si quota atteint)
4. Option "Utiliser un bonus donateur" (si disponible)
5. Confirmation de réservation
6. Passage au statut `réservé`
7. Notification au cuisinier (email + app)
8. Notification de confirmation au membre qui réserve

**Flux alternatifs** :
- Quota atteint → Message d'erreur avec rappel des limites
- Repas déjà réservé → Message d'erreur
- Repas expiré → Message d'erreur

**Postconditions** : Repas réservé, notifications envoyées

### 15.4 Annulation d'une réservation

**Acteur** : Membre qui a réservé

**Préconditions** :
- Repas réservé
- Délai d'annulation respecté (7h avant service)
- Quota d'annulation non atteint

**Flux principal** :
1. Accès au repas réservé
2. Vérification du délai (7h avant service)
3. Vérification des quotas
4. Saisie du motif d'annulation (obligatoire)
5. Confirmation d'annulation
6. Passage au statut `disponible`
7. Vérification du temps restant avant expiration
8. Si temps restant > 0 : Ajout automatique dans "Sauvez-les"
9. Notification au cuisinier
10. Mise à jour des compteurs d'annulation

**Flux alternatifs** :
- Délai dépassé (moins de 7h) → Annulation impossible, message d'erreur
- Quota atteint → Annulation bloquée, message d'erreur avec sanctions

**Postconditions** : Repas disponible, compteurs mis à jour

### 15.5 Signalement d'un repas non récupéré

**Acteur** : Cuisinier

**Préconditions** :
- Repas réservé
- Fin de l'heure de récupération (ou fin de plage horaire)
- Délai de signalement respecté (24h après heure de récupération)

**Flux principal** :
1. Fin de l'heure de récupération (ou fin de plage horaire)
2. Accès à la fiche repas réservé
3. Bouton "Signaler repas non récupéré" (visible)
4. Confirmation du signalement
5. Notification au membre qui n'est pas venu (demande de confirmation/explication)
6. Comptabilisation séparée (quota spécifique)
7. Application des sanctions (selon nombre de repas non récupérés)
8. Vérification du temps restant avant expiration
9. Si temps restant > 0 : Remise automatique dans "Sauvez-les"
10. Si temps restant = 0 : Passage au statut `expiré`
11. Passage au statut `non-récupéré`

**Flux alternatifs** :
- Délai dépassé (plus de 24h) → Signalement impossible

**Postconditions** : Repas signalé, sanctions appliquées, notifications envoyées

### 15.6 Passage à Premium

**Acteur** : Membre gratuit

**Préconditions** :
- Compte membre gratuit activé

**Flux principal** :
1. Accès à "Passer à Premium" (depuis tableau de bord ou alerte)
2. Affichage des avantages premium
3. Sélection du type d'abonnement (hebdomadaire/mensuel/annuel)
4. Affichage du prix et des économies (si annuel)
5. Saisie des informations de paiement
6. Validation du paiement
7. Activation immédiate de l'abonnement premium
8. Notification de confirmation (email + app)
9. Accès immédiat aux fonctionnalités premium

**Flux alternatifs** :
- Paiement refusé → Message d'erreur, possibilité de réessayer
- Carte expirée → Message d'erreur

**Postconditions** : Abonnement premium activé, fonctionnalités premium accessibles

### 15.7 Commentaire et notation obligatoires

### 15.8 Contact d'un cuisinier via la messagerie

**Acteur** : Membre (gratuit ou premium)

**Préconditions** :
- Compte activé
- Repas disponible ou réservé (statut ≠ `servi`)

**Flux principal** :
1. Consultation d'une fiche repas (statut : `disponible` ou `réservé`)
2. Clic sur "Contacter le cuisinier"
3. Ouverture de la messagerie (conversation liée au repas)
4. Saisie d'un message (questions allergènes, ingrédients, coordination, etc.)
5. Vérification automatique (détection numéros de téléphone, pièces jointes)
6. Si contenu valide : Envoi du message
7. Notification au cuisinier (email + app)
8. Réponse possible tant que statut ≠ `servi`
9. Une fois `servi` : messagerie accessible en historique uniquement (lecture seule)

**Flux alternatifs** :
- Numéro de téléphone détecté dans le message → Blocage de l'envoi, message d'avertissement
- Pièce jointe détectée → Blocage de l'envoi, message d'avertissement
- Repas passé au statut `servi` → Impossible d'envoyer de nouveaux messages (lecture seule)

**Postconditions** : Message envoyé, conversation créée ou mise à jour, notifications envoyées

**Acteur** : Membre qui a reçu un repas

**Préconditions** :
- Repas au statut `servi`
- Délai de 48h non écoulé

**Flux principal** :
1. Repas livré/récupéré → Passage au statut `servi`
2. Déclenchement du délai de 48h
3. Rappel 4h après : Notification (app + mail)
4. Accès au formulaire de notation
5. Saisie de la note (1 à 5 étoiles, obligatoire)
6. Saisie du commentaire (min 20 caractères, obligatoire)
7. Upload photos (optionnel, max 3)
8. Soumission du commentaire
9. Mise à jour de la note globale du cuisinier
10. Attribution automatique de badges (si conditions remplies)

**Flux alternatifs** :
- 24h sans commentaire → Restriction (peut proposer mais pas choisir)
- 48h sans commentaire → Compte restreint (connexion + commentaire uniquement)
- 72h sans action → Compte bloqué (contact support)

**Postconditions** : Commentaire et notation enregistrés, note globale mise à jour

### 15.8 Contact du cuisinier via messagerie

**Acteur** : Membre (gratuit ou premium)

**Préconditions** :
- Compte activé
- Repas disponible ou réservé (statut : `disponible` ou `réservé`)
- Statut du repas ≠ `servi`

**Flux principal** :
1. Consultation d'une fiche repas (statut : disponible ou réservé)
2. Clic sur "Contacter le cuisinier"
3. Ouverture de la messagerie (conversation liée au repas)
4. Saisie du message (questions allergènes, ingrédients, coordination, etc.)
5. Tentative d'envoi
6. Filtrage automatique (détection numéros de téléphone, pièces jointes)
7. Si message valide : Envoi du message
8. Notification au cuisinier (email + app)
9. Réponse possible tant que statut ≠ "servi"
10. Une fois "servi" : messagerie accessible en historique uniquement (pas de nouvelles questions)

**Flux alternatifs** :
- Tentative d'écrire un numéro de téléphone → Blocage du message, message d'avertissement
- Tentative d'envoyer une pièce jointe → Blocage, message d'erreur
- Repas déjà "servi" → Messagerie accessible en historique uniquement, pas de nouvelles questions

**Postconditions** : Message envoyé, notification au cuisinier, conversation créée ou mise à jour

---

## ANNEXES

### A. Questions à clarifier avec le porteur de projet

1. **Règles de calcul précises** :
   - Seuils exacts pour les badges X, Y et Cordon bleu
   - Principe multiplicateur exact pour les bonus donateurs

2. **Système de messagerie** :
   - Messagerie entre membres pour coordination livraison ?
   - Chat en direct ou messages asynchrones ?

3. **Gestion des allergies** :
   - Intégration dans la fiche repas ?
   - Filtres par allergènes dans la recherche ?

4. **Revenus plateforme** :
   - Commission sur les repas vendus uniquement ?
   - Autres sources de revenus prévues ?

5. **Rayon de livraison** :
   - Rayon maximum souhaité ? (recommandation : 10-15 km)

6. **Plateforme technique** :
   - Application mobile native ou web app progressive ?
   - Stack technique préféré ?

### B. Évolutions futures (hors MVP)

- Intégration de services de livraison tiers
- Points de dépôt/retrait
- Système de messagerie entre membres
- Authentification sociale (Google, Facebook)
- Application mobile native
- Système de parrainage
- Événements communautaires
- Programme de fidélité

---

**Document créé par** : PM (Product Manager)  
**Basé sur** : ANALYSE_PROJET_SOLIDEAT.md (Agent ANALYST)  
**Prochaine étape** : ARCHITECT (Architecture technique)
