# ANALYSE DU PROJET SOLID'EAT

**Date d'analyse** : 2026  
**Agent** : ANALYST  
**Statut** : Analyse complète - MVP défini avec fonctionnalités premium intégrées

---

## 1. VISION GLOBALE DU PROJET

### 1.1 Concept
SOLID'EAT est une plateforme de cuisine collaborative entre particuliers basée sur un système d'échange de repas. Le concept repose sur une économie de partage où les membres proposent et reçoivent des repas préparés par d'autres membres de la communauté.

### 1.2 Valeur ajoutée
- **Économie collaborative** : Création d'une communauté autour de la cuisine
- **Flexibilité** : Système de bonus donateur pour équilibrer les échanges
- **Gamification** : Système de badges et de notes pour encourager la qualité
- **Lutte contre le gaspillage** : Rubrique "Sauvez-les" pour repas expirant bientôt
- **Sécurité sanitaire** : Limitation à 72h pour garantir la fraîcheur des repas
- **Modèle freemium** : Accès gratuit avec possibilité d'upgrade premium

---

## 2. FONCTIONNALITÉS PRINCIPALES

### 2.1 Gestion des membres

#### 2.1.1 Inscription
- **Champs obligatoires** :
  - Nom, Prénom, Pseudo
  - Mot de passe
  - Email (vérification requise)
  - Adresse (avec intégration Google Maps)
  - Numéro de téléphone (vérification requise)
- **Validation** : Lecture et signature des CGU incluant une charte sanitaire
- **Confidentialité** : Seuls les pseudos sont visibles par les autres membres

#### 2.1.2 Profil membre
- **Informations affichées** :
  - Note globale (moyenne des notes reçues)
  - Date d'inscription ("Membre depuis...")
  - Statistiques : repas servis, repas en cours, repas expirés
  - Description personnelle et orientation culinaire
  - Liste des repas servis avec notes et avis
  - Badges (X, Y, Cordon bleu, Héros anti-gaspillage pour premium)
  - **Membres premium uniquement** : Compteur "X repas sauvés" (affichage public de l'impact dans "Sauvez-les")

#### 2.1.3 Tableau de bord
- Gestion du compte (mot de passe, photo)
- Récapitulatif d'activité (repas actuels et historique)
- Gestionnaire d'abonnement et facturation
- Récapitulatif des repas servis/reçus
- Description modifiable (profil et spécialités culinaires)
- Contact support (mail uniquement)
- **Espace messages** :
  - Messages système (notifications importantes)
  - Message obligatoire en cas d'atteinte du plafond d'annulations mensuelles
  - Message obligatoire en cas de repas non récupéré signalé
  - Indicateur de messages non lus
  - **Messagerie entre membres** : Voir section 2.7
- **Signalement repas non récupéré** : Possibilité pour le cuisinier de signaler un repas réservé non récupéré
- **Membres premium uniquement** : Statistiques d'impact environnemental
  - Nombre total de repas sauvés via "Sauvez-les"
  - Estimation CO2 évité
  - Impact environnemental mensuel/annuel
  - Graphiques et visualisations de l'impact

### 2.2 Système de repas

#### 2.2.1 Proposition de repas
- **Obligations minimales** :
  - 1 jour minimum par semaine où un repas est proposé
  - Pas d'obligation de choisir un repas en retour la même semaine
- **Fiche repas** :
  - Nom du repas
  - Jour de service proposé (obligatoire)
  - Photo (obligatoire, vraie photo du plat)
  - Heure de récupération (obligatoire)
  - Mode : Heure fixe (HH:MM) ou Plage horaire (De HH:MM à HH:MM)
  - Exemples : "14:15" ou "Entre 14:15 et 16:00"
- Adresse de récupération (obligatoire, géo-validée par Google Maps)
  - Différente de l'adresse du profil
  - Validation et géocodage automatique
  - Coordonnées GPS stockées pour calcul de distance
  - Description/mise en valeur (optionnel)
  - Date de préparation (obligatoire)
  - Date de mise à disposition sur la plateforme (date de post)
  - Date d'expiration automatique (calculée automatiquement, grisée, affichée)
  - Nombre de parts (par défaut 1, max 4)
  - Ingrédients (obligatoire)
  - Statut : disponible / réservé / servi / expiré / non-récupéré
  - **Bouton de contact** : Possibilité de contacter le cuisinier (tant que statut ≠ "servi")

#### 2.2.2 Réservation de repas
- Un membre peut choisir un repas proposé par un autre membre
- Annulation possible jusqu'à 7 heures avant le service
- **Limites d'annulation** :
  - Maximum 1 annulation de repas réservé par semaine
  - Maximum 4 annulations de repas réservés par mois
  - **Note** : Les repas non récupérés sont comptabilisés séparément avec des quotas plus stricts (voir section 2.2.2.1)
- **Système de sanctions en cas de dépassement mensuel** :
  - Si le plafond mensuel de 4 annulations + repas non récupérés est atteint :
    - Blocage des annulations pendant 2 semaines
    - Le quota mensuel passe à 2 annulations maximum pour le mois suivant (au lieu de 4)
    - Le quota mensuel revient à 4 annulations maximum le 2ème mois après le mois où la capacité maximale a été atteinte
- **Notifications d'annulation** :
  - Notification (mail + app) lors d'annulation
  - **Si capacité maximale mensuelle atteinte (4 annulations + repas non récupérés)** :
    - Message dans l'espace abonné (obligation de lecture)
    - Notification par mail expliquant la situation et insistant sur le risque de gaspillage alimentaire induit par les annulations
    - Notification via l'application invitant à lire le message dans l'espace abonné
- Motif obligatoire pour annulation
- **Repas annulé** : Si un repas réservé est annulé et qu'il reste du temps avant expiration, il peut être remis dans la rubrique "Sauvez-les"

#### 2.2.2.1 Gestion des repas réservés non récupérés
**Situation** : Un membre réserve un repas mais ne vient pas le récupérer sans avoir annulé. C'est un manque de respect manifeste envers le cuisinier qui a préparé le repas.

**Terminologie retenue** : **"Repas non récupéré"** - Terme simple et explicite

**Détection** :
- Le cuisinier peut signaler un repas non récupéré via la plateforme après l'heure de récupération
- Délai de signalement : jusqu'à 24h après l'heure de récupération (ou fin de plage horaire)
- Confirmation requise : Le système peut demander confirmation au membre qui n'est pas venu (notification)

**Conséquences pour le membre qui n'est pas venu** :
- **Comptabilisation séparée et plus sévère** : Les repas non récupérés sont comptabilisés séparément des annulations car ils représentent un manque de respect plus grave
  - Maximum 1 repas non récupéré par semaine (quota séparé de l'annulation)
  - Maximum 2 repas non récupérés par mois (quota plus strict que les annulations)
  - **Comptabilisation combinée** : Les annulations ET les repas non récupérés sont additionnés pour le plafond mensuel global
- **Sanctions plus sévères que les annulations** :
  - **Si 1 repas non récupéré** :
    - Message dans l'espace abonné (obligation de lecture)
    - Notification par mail insistant sur le manque de respect et le gaspillage alimentaire
    - Notification via l'application
    - Avertissement automatique
  - **Si 2 repas non récupérés dans le mois** :
    - Blocage immédiat des réservations pendant 2 semaines
    - Message obligatoire dans l'espace abonné
    - Notification par mail avec rappel des conséquences
    - Quota mensuel réduit à 1 repas non récupéré maximum pour le mois suivant
  - **Si plafond mensuel global atteint (4 annulations + repas non récupérés combinés)** :
    - Blocage des réservations pendant 2 semaines
    - Quota mensuel réduit à 2 pour le mois suivant (annulations + repas non récupérés)
    - Message obligatoire avec insistance sur le gaspillage et le manque de respect
- **Note du membre** : Impact négatif sur la note globale (à définir le coefficient)

**Conséquences pour le cuisinier** :
- **Notification** : Alerte immédiate quand le cuisinier signale le repas non récupéré
- **Gestion du repas** :
  - Si temps restant avant expiration > 0 : Repas automatiquement remis dans "Sauvez-les"
  - Si temps restant avant expiration = 0 : Repas passe au statut "expiré"
- **Compensation** : Aucune compensation financière (échange gratuit) mais impact sur la note du membre et sanctions appliquées

**Procédure** :
1. Fin de l'heure de récupération (ou fin de plage horaire)
2. Le cuisinier peut signaler un repas non récupéré (jusqu'à 24h après)
3. Notification au membre qui n'est pas venu (demande de confirmation ou d'explication)
4. Comptabilisation séparée (quota spécifique repas non récupérés)
5. Application des sanctions immédiates (plus sévères que pour annulation)
6. Remise automatique dans "Sauvez-les" si temps restant > 0
7. Message obligatoire et notifications au membre concerné (insistance sur manque de respect et gaspillage)

**Prévention** :
- Rappel automatique 2h avant l'heure de récupération (notification + mail)
  - Inclut l'adresse de récupération dans le rappel
- Possibilité pour le membre de confirmer sa présence
- Système de messagerie pour coordination entre cuisinier et membre

#### 2.2.3 Gestion de l'expiration des repas
- **Durée de vie maximale** : 72 heures à partir de la date de préparation
- **Calcul de l'expiration** :
  - Basé sur la date de préparation renseignée par l'utilisateur
  - Note : Les utilisateurs renseigneront généralement la même date pour la date de préparation et la date de post
  - Calculée automatiquement lors de la création du repas (date de préparation + 72h)
  - Affichée en grisé sur la fiche repas
  - Expiration automatique au-delà de 72 heures
- **Notifications d'expiration** :
  - 24 heures avant expiration : notification plateforme + mail à l'utilisateur qui a posté le repas
  - Pastille visuelle apparaît à côté du repas pour indiquer l'expiration imminente
- **Rubrique "Sauvez-les"** :
  - Section dédiée listant les repas qui vont expirer dans 24 heures
  - Allie gamification et lutte contre le gaspillage alimentaire
  - Push notifications optionnelles pour utilisateurs ayant activé les alertes sur ce type de repas
  - Repas annulés peuvent y être réintégrés s'il reste du temps avant expiration
  - **Limitation** : Respecte les quotas de réservation selon le statut membre
    - Membres gratuits : Maximum 1 repas "Sauvez-les" par semaine (limite globale de réservation)
    - Membres premium : Maximum 3 repas "Sauvez-les" par semaine (limite globale de réservation)
  - **Avantages membres premium** :
    - Notifications prioritaires : Alertes "Sauvez-les" reçues en premier (push premium)
    - Filtres avancés : Rayon de recherche étendu, historique des cuisiniers favoris, filtres par type de cuisine/nombre de parts/distance
    - Statistiques d'impact environnemental : Tableau de bord détaillé avec nombre total de repas sauvés, estimation CO2 évité, impact mensuel/annuel
    - Affichage public : Compteur "X repas sauvés" visible sur le profil membre
    - Badge spécial "Héros anti-gaspillage" : Obtenu après X repas sauvés, visible sur le profil
- **Impact** : Un repas expiré passe automatiquement au statut "expiré" et ne peut plus être réservé

#### 2.2.4 Commentaires et notation
- **Obligation** : Commentaire obligatoire dans les 48H après service
- **Rappels** :
  - 4H après passage à "Servi" : notification app + mail
  - 24H sans commentaire : restriction (peut proposer mais pas choisir)
  - 48H sans commentaire : compte restreint (connexion + commentaire uniquement)
  - 72H sans action : compte bloqué

### 2.3 Système de bonus donateur

#### 2.3.1 Acquisition
- **Condition** : Écart de +5 entre repas servis et repas reçus
- **Calcul** : Principe multiplicateur de cet écart
- **Validité** : 2 semaines
- **Rappels** : 3 jours avant expiration, puis la veille

#### 2.3.2 Utilisation
- Permet de choisir un repas sans en proposer un en retour
- Maximum 2 bonus donateur utilisables par semaine
- Transfert possible uniquement pour membres premium

### 2.4 Système de badges
- **Badges généraux** (tous membres) :
  - Badge X
  - Badge Y
  - Badge Cordon bleu (Le Top)
  - **Attribution** : Basée sur les notes et le nombre de repas servis
- **Badge spécial "Héros anti-gaspillage"** (membres premium uniquement) :
  - Obtenu après avoir sauvé X repas via la rubrique "Sauvez-les"
  - Visible sur le profil membre
  - Valorise l'engagement dans la lutte contre le gaspillage alimentaire

### 2.5 Géolocalisation et recherche
- Affichage des repas disponibles dans une zone géographique
- Filtres de recherche basés sur la fiche repas
- Intégration Google Maps pour :
  - Adresse du profil (inscription)
  - Adresse de récupération des repas (création de repas)
  - Géocodage et validation des adresses
  - Calcul de distance entre adresses
- Rubrique "Sauvez-les" : Filtre spécial pour repas expirant dans 24h
- **Filtres avancés premium dans "Sauvez-les"** :
  - Rayon de recherche étendu
  - Historique des cuisiniers favoris
  - Filtres par type de cuisine, nombre de parts, distance
  - Recherche plus précise et personnalisée

### 2.6 Messagerie entre membres

#### 2.6.1 Possibilité de contact
- **Contact du cuisinier** : Tout membre peut contacter le cuisinier qui a posté un repas
- **Conditions** :
  - Le repas doit être posté (statut : disponible, réservé)
  - Le contact est possible tant que le statut n'est pas passé à "servi" (livré)
  - Une fois le repas "servi", la messagerie reste accessible pour historique mais pas pour nouvelles questions
- **Objectifs du contact** :
  - Questions sur les allergènes
  - Questions sur les ingrédients
  - Coordination pour la livraison
  - Autres questions sur le repas

#### 2.6.2 Restrictions de la messagerie
- **Interdiction d'échange de numéros de téléphone** :
  - Impossible d'écrire un numéro de téléphone (détection automatique)
  - Impossible d'écrire un numéro en toutes lettres (ex: "zéro six", "zéro un", etc.)
  - Filtrage automatique des messages contenant des numéros
  - Message d'avertissement si tentative d'échange de numéro
- **Interdiction de pièces jointes** :
  - Pas d'envoi de fichiers
  - Pas d'envoi d'images via la messagerie (les photos de repas sont gérées ailleurs)
  - Sécurité et protection des données

#### 2.6.3 Visibilité des numéros de téléphone

**Règle générale** :
- Le numéro de téléphone n'est **jamais affiché automatiquement**
- Un **bouton "Afficher le numéro de téléphone"** est disponible sur la fiche du repas réservé
- Le bouton n'est visible qu'**après la réservation effective**
- Le numéro s'affiche uniquement après clic sur le bouton
- Le numéro n'est jamais visible dans la messagerie

**Membres gratuits (freemium)** :
- **Bouton "Afficher le numéro de téléphone"** activable **uniquement par un utilisateur qui a réservé leur repas**
- Pas de possibilité de masquer le bouton (toujours disponible pour celui qui a réservé)
- Le membre qui a réservé peut cliquer sur le bouton pour afficher et utiliser le numéro du cuisinier gratuit

**Membres premium** :
- **Option de masquage du bouton** :
  - Les membres premium peuvent **refuser de faire apparaître le bouton "Afficher le numéro de téléphone"**
  - Paramétrable dans les préférences du compte (section "Confidentialité" du tableau de bord premium)
  - Option : "Autoriser l'affichage de mon numéro de téléphone lors des réservations" (case à cocher)
  - Par défaut : Option activée (bouton visible)
  - Si désactivé : le bouton n'apparaît pas, le membre premium n'est joignable que par la messagerie de la plateforme
  - Si activé : le bouton est activable par les autres membres (premium ou freemium) dans le cadre d'une réservation de leur repas

**Affichage du numéro** :
- Bouton visible uniquement sur la fiche du repas réservé (pour le membre qui a réservé, selon les règles ci-dessus)
- Bouton visible dans le tableau de bord (section repas réservés)
- Clic sur le bouton → Affichage du numéro de téléphone
- Le numéro reste affiché sur la fiche tant que le repas n'est pas "servi"
- Masqué dans le profil public
- Masqué dans les messages

#### 2.6.4 Fonctionnalités de la messagerie
- Messages asynchrones (pas de chat en temps réel)
- Historique des conversations liées à un repas
- Notifications lors de nouveaux messages
- Indicateur de messages non lus
- Possibilité de marquer comme lu
- Modération automatique (détection numéros, pièces jointes)

### 2.7 Notifications et alertes
- **Notifications système** :
  - Expiration de repas (24h avant)
  - Annulation de réservation
  - Rappels de commentaires
  - Expiration de bonus donateur
  - **Rappel avant récupération** : 2h avant l'heure de récupération (confirmation de présence possible, inclut l'adresse)
  - **Repas non récupéré signalé** : Notification au membre qui n'est pas venu (demande de confirmation/explication)
  - **Atteinte du plafond d'annulations mensuelles** (annulations + repas non récupérés) :
    - Message dans l'espace abonné (obligation de lecture)
    - Notification par mail expliquant la situation et le risque de gaspillage
    - Notification via l'application invitant à lire le message
- **Push notifications** :
  - Optionnelles pour les repas "Sauvez-les"
  - Paramétrables dans les préférences utilisateur
  - **Membres premium** : Notifications prioritaires pour "Sauvez-les" (reçues en premier)
- **Notifications de messagerie** :
  - Nouveau message reçu
  - Réponse à une question sur un repas
  - Notification par mail optionnelle

---

## 3. MODÈLE D'ABONNEMENT

### 3.1 Membres gratuits (Freemium)

#### 3.1.1 Limitations
- 1 repas proposé et 1 repas choisi maximum par semaine
- Ne peuvent choisir que parmi les repas d'autres membres gratuits
- Changement d'adresse limité à 1 fois par an
- Pas de transfert de bonus donateur
- Pas de vente de repas
- Nombre de parts fixé à 1
- **Numéro de téléphone** : Bouton "Afficher le numéro de téléphone" activable uniquement par un utilisateur qui a réservé leur repas (pas de possibilité de masquer le bouton)

#### 3.1.2 Alerte premium
- Lors du changement d'adresse : proposition d'upgrade premium
- Si changement d'adresse déjà utilisé : redirection automatique vers page premium
- Affichage des services premium sans possibilité d'utilisation

### 3.2 Membres premium

#### 3.2.1 Avantages
- Changement d'adresse illimité
- Transfert de bonus donateur à d'autres utilisateurs
- Vente de repas autorisée
- Choix jusqu'à 3 repas par semaine (contre 3 repas proposés)
- Choix parmi tous les membres (premium et freemium)
- Proposition de repas à tous les membres
- Modification du nombre de parts (1 à 4)
- Choix de repas avec nombre de parts > 1
- **Gestion du numéro de téléphone** :
  - Option "Autoriser l'affichage de mon numéro de téléphone lors des réservations" (paramétrable dans les préférences du tableau de bord premium)
  - Si désactivé : le bouton "Afficher le numéro de téléphone" n'apparaît pas, joignable uniquement par messagerie plateforme
  - Si activé : le bouton est activable par les autres membres (premium ou freemium) dans le cadre d'une réservation de leur repas
- **Avantages dans "Sauvez-les"** :
  - Notifications prioritaires (alertes reçues en premier)
  - Filtres avancés (rayon étendu, historique cuisiniers, recherche précise)
  - Statistiques d'impact environnemental (tableau de bord détaillé)
  - Affichage public du compteur "X repas sauvés" sur le profil
  - Badge spécial "Héros anti-gaspillage" après X repas sauvés

#### 3.2.2 Tarification

**Abonnements premium** (sans engagement) :
- **Abonnement hebdomadaire** : 2,50€/semaine
  - Équivalent mensuel : ~10,83€/mois
  - Incitation : +11% par rapport à l'abonnement mensuel (pour encourager l'abonnement mensuel)
- **Abonnement mensuel** : 9€/mois (tarif de référence)
- **Abonnement annuel** : 90€/an (soit 7,50€/mois)
  - Économie : -17% par rapport à l'abonnement mensuel (soit 18€ économisés sur l'année)
  - Incitation forte à l'engagement annuel

**Tarification des repas vendus** :
- **Prix standard** : 5€ par repas
- **Frais de service** : 1€ (compris dans le prix)
- **Revenu utilisateur** : 4€ par repas vendu

---

## 4. ZONES GÉOGRAPHIQUES ET DÉPLOIEMENT

### 4.1 Zones démographiques cibles
- **Paris** : Zone de lancement prioritaire
- **Marseille** : Zone de lancement prioritaire
- **Lyon** : Zone de lancement prioritaire

### 4.2 Stratégie de déploiement
- Lancement simultané ou progressif sur les 3 métropoles
- Concentration des ressources sur des zones denses pour optimiser les échanges
- Géolocalisation activée pour faciliter les réservations de proximité
- Extension future vers d'autres métropoles selon les résultats

---

## 5. LOGISTIQUE DE LIVRAISON

### 5.1 Problématique identifiée
La livraison est un point critique à résoudre pour le fonctionnement de la plateforme. Plusieurs options sont possibles, chacune avec ses avantages et inconvénients.

### 5.2 Options de livraison possibles

#### 5.2.1 Option 1 : Livraison par les membres eux-mêmes
**Principe** : Le membre qui prépare le repas livre lui-même au membre qui l'a réservé.

**Avantages** :
- Pas de coût de livraison externe
- Contact humain renforcé (aspect communautaire)
- Flexibilité des horaires
- Contrôle total sur la chaîne de livraison

**Inconvénients** :
- Contrainte de temps pour le cuisinier
- Déplacements nécessaires (coût carburant, temps)
- Risque de retards ou d'absences
- Limitation géographique (rayon de livraison)
- Responsabilité du transport (température, hygiène)

**Recommandation** :
- **Pour le MVP** : Option la plus simple à mettre en place
- **Conditions** : Définir un rayon de livraison maximum (ex: 10-15 km)
- **Incitations** : Possibilité de proposer plusieurs repas le même jour pour optimiser les déplacements

#### 5.2.2 Option 2 : Service de livraison tiers (partenariat)
**Principe** : Partenariat avec des services de livraison (Deliveroo, Uber Eats, services locaux, livreurs indépendants).

**Avantages** :
- Professionnalisation de la livraison
- Pas de contrainte pour les cuisiniers
- Horaires flexibles
- Suivi de livraison possible
- Assurance livraison incluse (selon partenaire)

**Inconvénients** :
- Coût de livraison à intégrer (qui paie ?)
- Dépendance à un tiers
- Commission sur chaque livraison
- Complexité de gestion des partenariats
- Disponibilité géographique limitée

**Recommandation** :
- **Pour évolution** : À considérer après validation du concept
- **Modèle économique** : Coût supporté par le membre qui reçoit le repas ou inclus dans le prix
- **Partenaires possibles** : Services de livraison locaux, livreurs indépendants

#### 5.2.3 Option 3 : Points de dépôt/retrait
**Principe** : Points de rendez-vous fixes (commerces partenaires, points relais) où le cuisinier dépose et le membre récupère.

**Avantages** :
- Pas de contrainte de synchronisation
- Flexibilité horaire (dépôt/retrait sur créneaux)
- Pas de coût de livraison
- Réduction des déplacements

**Inconvénients** :
- Nécessite des partenariats avec des commerces
- Contrainte de localisation (proximité des points)
- Gestion de la température (repas chauds/froids)
- Moins de flexibilité pour l'utilisateur

**Recommandation** :
- **Pour évolution** : Complément intéressant à la livraison directe
- **Partenaires** : Commerces de proximité, boulangeries, cafés

#### 5.2.4 Option 4 : Modèle hybride
**Principe** : Combinaison de plusieurs options selon les préférences des membres.

**Avantages** :
- Flexibilité maximale
- Adaptation aux besoins locaux
- Évolution progressive

**Inconvénients** :
- Complexité de gestion
- Expérience utilisateur à clarifier

### 5.3 Recommandation pour le MVP

**Option retenue : Livraison par les membres eux-mêmes**

**Justification** :
- Simplicité de mise en œuvre
- Pas de coût supplémentaire
- Renforce l'aspect communautaire
- Permet de valider le concept rapidement

**Conditions d'application** :
- Rayon de livraison maximum à définir (suggestion : 10-15 km)
- Affichage de la distance sur la fiche repas
- Possibilité pour le cuisinier de définir ses zones de livraison
- Système de géolocalisation pour calculer les distances
- Recommandations de transport (contenants isothermes, etc.)

**Évolutions futures** :
- Intégration de services de livraison tiers
- Mise en place de points de dépôt/retrait
- Système de livraison groupée (optimisation)

### 5.4 Emballages de livraison

**Problématique** : Solution écologique et standardisée pour les emballages.

**Options** :
- **Emballages réutilisables** : Système de consigne (ex: boîtes réutilisables)
- **Emballages biodégradables** : À la charge du cuisinier ou fournis par la plateforme
- **Recommandations** : Guide des bonnes pratiques (contenants isothermes, etc.)

**Recommandation** :
- Guide de bonnes pratiques dans la charte sanitaire
- Possibilité de partenariats avec des fournisseurs d'emballages écologiques
- Incitation à utiliser des contenants réutilisables

---

## 6. ASPECTS LÉGAUX ET SANITAIRES

### 6.1 Positionnement : Plateforme de mise en relation

**Principe fondamental** : SOLID'EAT est une plateforme de mise en relation entre particuliers. La plateforme ne prépare pas, ne livre pas, et n'est pas responsable des repas échangés.

### 6.2 Responsabilité de la plateforme

#### 6.2.1 Limitation de responsabilité
- **Responsabilité limitée** : La plateforme agit uniquement comme intermédiaire
- **Pas de responsabilité directe** sur :
  - La qualité des repas préparés
  - La conformité sanitaire des préparations
  - Les incidents liés à la consommation (intoxications, allergies)
  - Les problèmes de livraison
  - Les litiges entre membres

#### 6.2.2 Responsabilités de la plateforme
- Mise en relation entre membres
- Gestion technique de la plateforme
- Modération des contenus (photos, descriptions)
- Respect des données personnelles (RGPD)
- Transparence sur les conditions d'utilisation

### 6.3 Responsabilité des membres

#### 6.3.1 Responsabilité du cuisinier
- **Responsabilité civile** : Le cuisinier est responsable de la qualité et de la sécurité sanitaire des repas qu'il prépare
- **Obligations** :
  - Respecter les règles d'hygiène alimentaire
  - Informer sur les allergènes
  - Respecter les dates de préparation et d'expiration
  - Utiliser des ingrédients frais et de qualité
  - Respecter la chaîne du froid/chaud

#### 6.3.2 Responsabilité du membre qui reçoit
- Vérifier l'état du repas à réception
- Consommer dans les délais recommandés
- Informer le cuisinier en cas de problème
- Respecter les règles de conservation

### 6.4 Assurance

#### 6.4.1 Assurance des membres
**Recommandation** : Inciter les membres à souscrire une assurance responsabilité civile couvrant les activités de préparation de repas.

**Options** :
- Partenariat avec un assureur pour proposer une assurance dédiée
- Vérification de l'assurance lors de l'inscription (optionnel ou obligatoire ?)
- Information claire sur la nécessité d'une assurance

#### 6.4.2 Assurance de la plateforme
- Assurance responsabilité civile professionnelle
- Assurance cyber (protection des données)
- Assurance générale d'exploitation

### 6.5 Conformité réglementaire

#### 6.5.1 Réglementation sanitaire
**Contexte** : En France, la vente de repas entre particuliers est encadrée par la réglementation sanitaire.

**Points à clarifier** :
- **Statut des membres** : Particuliers (pas de statut professionnel requis pour l'échange gratuit)
- **Vente de repas** : Pour les membres premium qui vendent, vérifier les obligations :
  - Déclaration d'activité ?
  - Formation HACCP ?
  - Contrôles sanitaires ?
  - Limites de chiffre d'affaires (micro-entreprise) ?

**Recommandation** :
- Consultation d'un avocat spécialisé en droit alimentaire
- Clarification du statut pour les échanges gratuits vs ventes
- Information claire dans les CGU sur les obligations légales

#### 6.5.2 Réglementation fiscale
**Pour les membres qui vendent** :
- Déclaration des revenus
- Statut micro-entreprise possible (selon seuils)
- TVA (selon seuils)

**Recommandation** :
- Information dans les CGU
- Possibilité de générer des attestations de revenus pour les membres

### 6.6 Charte sanitaire et CGU

#### 6.6.1 Charte sanitaire (à intégrer dans les CGU)
**Obligations pour les cuisiniers** :
- Respect des règles d'hygiène de base (lavage des mains, propreté de la cuisine)
- Utilisation d'ingrédients frais
- Respect de la chaîne du froid/chaud
- Information sur les allergènes
- Respect des dates de préparation
- Emballage approprié pour le transport

**Interdictions** :
- Préparation en cas de maladie
- Utilisation d'ingrédients périmés
- Non-respect des températures de conservation

#### 6.6.2 CGU (Conditions Générales d'Utilisation)
**Points essentiels à inclure** :
1. **Nature de la plateforme** : Mise en relation uniquement
2. **Limitation de responsabilité** : Plateforme non responsable des repas
3. **Responsabilité des membres** : Chaque membre est responsable de ses actes
4. **Assurance** : Recommandation/obligation d'assurance
5. **Réglementation** : Information sur les obligations légales
6. **Règles sanitaires** : Charte sanitaire intégrée
7. **Données personnelles** : Conformité RGPD
8. **Litiges** : Médiation, procédure de signalement
9. **Exclusion** : Conditions d'exclusion en cas de non-respect

#### 6.6.3 Système de signalement et modération
- **Signalement** : Possibilité pour les membres de signaler un problème
- **Signalement repas non récupéré** : Possibilité pour le cuisinier de signaler un repas réservé non récupéré (jusqu'à 24h après l'heure de récupération, fin de plage horaire)
- **Modération** : Équipe de modération pour traiter les signalements
- **Sanctions** : Avertissement, suspension, exclusion
- **Transparence** : Communication claire sur les sanctions

### 6.7 Gestion des incidents

#### 6.7.1 Procédure en cas d'incident
1. **Signalement** : Le membre signale l'incident via la plateforme
2. **Investigation** : Analyse du signalement par l'équipe de modération
3. **Contact** : Prise de contact avec les parties concernées
4. **Résolution** : Tentative de résolution amiable
5. **Sanction** : Si nécessaire, application de sanctions
6. **Documentation** : Traçabilité des incidents

#### 6.7.2 Limites d'intervention
- La plateforme ne peut pas résoudre les litiges financiers entre membres
- Pas de remboursement par la plateforme
- Orientation vers les autorités compétentes si nécessaire

### 6.8 Recommandations pour la mise en œuvre

1. **Consultation juridique** : Faire valider les CGU par un avocat spécialisé
2. **Consultation sanitaire** : Faire valider la charte sanitaire par un expert
3. **Assurance** : Souscrire une assurance responsabilité civile professionnelle
4. **Transparence** : Communication claire sur le statut de plateforme de mise en relation
5. **Formation** : Sensibilisation des membres aux règles sanitaires
6. **Suivi** : Mise en place d'un système de suivi et d'amélioration continue

---

## 7. PROBLÉMATIQUES IDENTIFIÉES

### 7.1 Logistique
- ~~**Emballages de livraison**~~ ✅ **ANALYSÉ** : Voir section 5.4 (recommandations écologiques)
- ~~**Organisation de la livraison à domicile**~~ ✅ **ANALYSÉ** : Voir section 5 (recommandation MVP : livraison par membres)

### 7.2 Questions à clarifier

#### 7.2.1 Fonctionnement du système
- Comment fonctionne exactement le "principe multiplicateur" pour les bonus donateurs ?
- Comment sont calculés les badges X, Y et Cordon bleu ? (seuils précis ?)
- ~~Que signifie "repas expirés" exactement ?~~ ✅ **CLARIFIÉ** : Repas expirant automatiquement après 72h à partir de la date de préparation
- ~~Repas annulés dans "Sauvez-les" ?~~ ✅ **CLARIFIÉ** : Oui, si temps restant avant expiration
- ~~Limitation "Sauvez-les" ?~~ ✅ **CLARIFIÉ** : Respecte les quotas de réservation selon statut
- ~~Avantages premium dans "Sauvez-les" ?~~ ✅ **CLARIFIÉ** : Intégrés au MVP (badge, statistiques, filtres avancés, notifications prioritaires, affichage public)
- ~~Calcul de l'expiration ?~~ ✅ **CLARIFIÉ** : Basé sur la date de préparation (généralement identique à la date de post)

#### 7.2.2 Aspects techniques
- Plateforme web uniquement ou application mobile ?
- Système de paiement pour les membres premium ?
- Gestion des allergies alimentaires ? (À intégrer dans la fiche repas et la charte sanitaire)
- ~~Système de signalement/modération ?~~ ✅ **ANALYSÉ** : Voir section 6.6.3 et 6.7

#### 7.2.3 Aspects légaux et sanitaires
- ~~Responsabilité en cas d'intoxication alimentaire ?~~ ✅ **ANALYSÉ** : Voir section 6 (plateforme de mise en relation, responsabilité limitée)
- ~~Assurance nécessaire ?~~ ✅ **ANALYSÉ** : Voir section 6.4 (recommandation assurance membres + assurance plateforme)
- ~~Conformité avec les réglementations sanitaires locales ?~~ ✅ **ANALYSÉ** : Voir section 6.5 (réglementation sanitaire et fiscale)
- ~~Statut fiscal des membres qui vendent des repas ?~~ ✅ **ANALYSÉ** : Voir section 6.5.2 (réglementation fiscale)

#### 7.2.4 Expérience utilisateur
- ~~Comment se déroule la livraison concrètement ?~~ ✅ **ANALYSÉ** : Voir section 5 (recommandation MVP : livraison par membres)
- ~~Système de messagerie entre membres ?~~ ✅ **DÉFINI** : Voir section 2.6 (messagerie avec restrictions, visibilité numéros selon statut)
- Gestion des retards/annulations de dernière minute ? (Règles d'annulation définies, retards à gérer)
- Système de remboursement ? (Pas de remboursement par la plateforme, voir section 6.7.2)

---

## 8. ACTEURS DU SYSTÈME

### 5.1 Membres gratuits
- Proposent et reçoivent des repas (limités)
- Changement d'adresse restreint
- Accès limité aux autres membres

### 5.2 Membres premium
- Proposent et reçoivent des repas (étendus)
- Peuvent vendre des repas
- Changement d'adresse illimité
- Accès à tous les membres

### 5.3 Plateforme SOLID'EAT
- Gestion des membres
- Gestion des transactions
- Modération et support
- Facturation des abonnements

---

## 9. FLUX PRINCIPAUX

### 9.1 Flux d'inscription
1. Consultation des CGU et charte sanitaire
2. Signature des CGU
3. Remplissage du formulaire d'inscription
4. Vérification email et téléphone
5. Validation de l'inscription
6. Accès au tableau de bord

### 9.2 Flux de proposition de repas
1. Création d'une fiche repas (date de préparation + date de post)
2. Calcul automatique de la date d'expiration (72h max)
3. Publication (statut : disponible)
4. Réservation par un membre (statut : réservé)
5. Notification 24h avant expiration si non réservé (pastille + notification)
6. Préparation et livraison
7. Passage à "servi"
8. Commentaire obligatoire dans les 48H
9. Expiration automatique si non réservé après 72h (statut : expiré)

### 9.3 Flux d'expiration et "Sauvez-les"
1. Repas disponible depuis X heures
2. Calcul automatique : 24h avant expiration
3. Notification à l'auteur du repas (plateforme + mail)
4. Pastille visuelle sur la fiche repas
5. Ajout automatique dans la rubrique "Sauvez-les"
6. Push notification (si activé par utilisateur)
7. Réservation possible (dans la limite des quotas selon statut)
8. Expiration automatique après 72h si non réservé
9. Passage au statut "expiré"

### 9.4 Flux d'annulation et réintégration "Sauvez-les"
1. Membre réserve un repas (statut : réservé)
2. Vérification des quotas d'annulation :
   - Maximum 1 annulation par semaine
   - Maximum 4 annulations par mois
3. Si quota respecté : Annulation possible jusqu'à 7h avant service
4. Si quota dépassé : Blocage de l'annulation avec message explicatif
5. Motif obligatoire pour annulation
6. Vérification du temps restant avant expiration
7. Si temps restant > 0 : Réintégration automatique dans "Sauvez-les"
8. Notification à l'auteur du repas (annulation)
9. Repas redevient réservable dans "Sauvez-les"
10. Mise à jour des compteurs d'annulation (hebdomadaire et mensuel)

### 9.5 Flux de sanction en cas de plafond d'annulations atteint
1. Membre atteint 4 annulations dans le mois
2. Système détecte le plafond atteint
3. Blocage automatique des annulations pendant 2 semaines
4. Message système créé dans l'espace abonné (obligation de lecture)
5. Notification par mail :
   - Explication de la situation
   - Insistance sur le risque de gaspillage alimentaire induit par les annulations
   - Information sur les sanctions appliquées (blocage 2 semaines, quota réduit)
6. Notification via l'application invitant à lire le message
7. Quota mensuel réduit à 2 annulations pour le mois suivant
8. Quota mensuel revient à 4 annulations le 2ème mois après l'infraction

### 9.6 Flux de réservation
1. Recherche de repas (filtres + géolocalisation)
2. Sélection d'un repas
3. Possibilité de contacter le cuisinier (questions allergènes, ingrédients, etc.)
4. Réservation
5. Confirmation
6. Bouton "Afficher le numéro de téléphone" visible (selon règles : toujours pour freemium, selon paramètres pour premium)
7. Rappel automatique 2h avant la plage horaire de service
8. Réception du repas
9. Commentaire et notation obligatoires

### 9.8 Flux de contact cuisinier
1. Consultation d'une fiche repas (statut : disponible ou réservé)
2. Clic sur "Contacter le cuisinier"
3. Ouverture de la messagerie (conversation liée au repas)
4. Envoi de message (questions allergènes, ingrédients, coordination, etc.)
5. Filtrage automatique (détection numéros de téléphone, pièces jointes)
6. Notification au cuisinier
7. Réponse possible tant que statut ≠ "servi"
8. Une fois "servi" : messagerie accessible en historique uniquement

### 9.7 Flux de gestion d'un repas non récupéré
1. Réservation d'un repas (statut : réservé)
2. Rappel automatique 2h avant la plage horaire de service
3. Fin de l'heure de récupération (ou fin de plage horaire)
4. Le membre n'est pas venu récupérer le repas
5. Le cuisinier signale le repas non récupéré (jusqu'à 24h après l'heure de récupération)
6. Notification au membre qui n'est pas venu (demande de confirmation/explication)
7. Comptabilisation séparée (quota spécifique repas non récupérés, plus strict que annulations)
8. Application des sanctions immédiates (plus sévères que pour annulation)
9. Vérification du temps restant avant expiration du repas
10. Si temps restant > 0 : Remise automatique dans "Sauvez-les"
11. Si temps restant = 0 : Passage au statut "expiré"
12. Message obligatoire et notifications au membre concerné (insistance sur manque de respect et gaspillage)

---

## 10. MÉTRIQUES ET INDICATEURS

### 10.1 Métriques membres
- Nombre de repas servis
- Nombre de repas reçus
- Nombre de repas "Sauvez-les" réservés
- Nombre d'annulations (hebdomadaire et mensuel)
- Nombre de repas non récupérés (quota séparé, plus strict)
- Total annulations + repas non récupérés (comptabilisés ensemble pour plafond global)
- Statut de sanction (blocage annulations, quota réduit)
- Note globale
- Nombre de bonus donateurs
- Date d'inscription
- Badges obtenus (X, Y, Cordon bleu, Héros anti-gaspillage pour premium)
- **Membres premium uniquement** :
  - Nombre total de repas sauvés
  - Estimation CO2 évité
  - Impact environnemental (mensuel/annuel)

### 10.2 Métriques repas
- Statut (disponible/réservé/servi/expiré/non-récupéré)
- Nombre de parts
- Date de préparation
- Date de mise à disposition (date de post)
- Date d'expiration (calculée automatiquement)
- Temps restant avant expiration
- Heure de récupération (fixe ou plage horaire)
- Adresse de récupération
- Indicateur d'expiration imminente (pastille 24h avant)

### 10.3 Métriques plateforme
- Nombre de membres (gratuits/premium)
- Taux de conversion freemium → premium
- Taux d'utilisation des bonus donateurs
- Taux de commentaires postés dans les délais
- Taux de repas expirés vs réservés
- Taux de "sauvetage" via la rubrique "Sauvez-les"
- Nombre de repas sauvés du gaspillage
- Taux de réintégration des repas annulés dans "Sauvez-les"
- Nombre de badges "Héros anti-gaspillage" attribués
- Impact environnemental global (CO2 évité, repas sauvés)
- **Métriques d'annulation et repas non récupérés** :
  - Taux d'annulation moyen (hebdomadaire/mensuel)
  - Taux de repas non récupérés (quota séparé, plus strict)
  - Taux combiné annulations + repas non récupérés
  - Nombre de membres ayant atteint le plafond mensuel
  - Nombre de sanctions appliquées (blocages, quotas réduits)
  - Impact des annulations et repas non récupérés sur le gaspillage alimentaire
  - Taux de repas remis dans "Sauvez-les" après non-récupération

---

## 11. RECOMMANDATIONS POUR LA SUITE

### 11.1 Priorités
1. ~~**Clarifier les problématiques logistiques**~~ ✅ **ANALYSÉ** : Voir section 5 (recommandation MVP : livraison par membres)
2. **Définir précisément les règles de calcul** (badges, bonus donateurs)
3. ~~**Élaborer les CGU et charte sanitaire**~~ ✅ **ANALYSÉ** : Voir section 6 (structure et recommandations définies)
4. ~~**Définir le modèle économique**~~ ✅ **TARIFICATION DÉFINIE** : 9€/mois avec incitations hebdo/annuel
5. ~~**Zones géographiques**~~ ✅ **DÉFINIES** : Paris, Marseille, Lyon

### 11.1.1 Stratégie tarifaire (définie)
- **Abonnement hebdomadaire** : 2,50€/semaine (+11% vs mensuel) → Incite à passer au mensuel
- **Abonnement mensuel** : 9€/mois → Tarif de référence
- **Abonnement annuel** : 90€/an (7,50€/mois, -17% de réduction) → Incite à l'engagement long terme
- **Objectif** : Maximiser les revenus récurrents tout en offrant de la flexibilité
- **Économies affichées** : Mettre en avant les économies réalisées avec l'abonnement annuel (18€/an)

### 11.2 Points d'attention
- **Sécurité alimentaire** : ✅ **RENFORCÉE** avec système d'expiration à 72h
- **Lutte contre le gaspillage** : ✅ **INTÉGRÉE** via rubrique "Sauvez-les"
- **Expérience utilisateur** : Simplifier au maximum les processus
- **Gamification** : S'assurer que le système de badges/bonus et "Sauvez-les" motive réellement
- **Scalabilité** : Anticiper la croissance de la plateforme
- **Notifications** : Gérer intelligemment les notifications pour éviter la surcharge

### 11.3 Fonctionnalités premium dans "Sauvez-les" (MVP)
Toutes les fonctionnalités suivantes sont intégrées au MVP :

- ✅ **Badge "Héros anti-gaspillage"** : Badge spécial pour membres premium ayant sauvé X repas
- ✅ **Statistiques d'impact environnemental** : Tableau de bord détaillé sur leur impact (repas sauvés, CO2 évité, impact mensuel/annuel)
- ✅ **Filtres avancés** : Recherche plus précise dans "Sauvez-les" (rayon étendu, historique des cuisiniers favoris, filtres par type de cuisine/nombre de parts/distance)
- ✅ **Notifications prioritaires** : Recevoir les alertes "Sauvez-les" en premier (push premium)
- ✅ **Affichage public de l'impact** : Compteur "X repas sauvés" visible sur le profil membre

**Objectifs** :
- Valoriser l'engagement premium dans la lutte contre le gaspillage
- Créer un argument de conversion freemium → premium
- Renforcer la gamification et l'engagement communautaire

### 11.4 Questions à poser au porteur de projet
1. ~~Comment envisagez-vous la livraison concrètement ?~~ ✅ **ANALYSÉ** : Voir section 5 (recommandation MVP : livraison par membres)
2. ~~Quel est le modèle économique cible (revenus plateforme) ?~~ ✅ **TARIFICATION DÉFINIE** : 9€/mois avec incitations
3. ~~Quelles sont les zones géographiques cibles au démarrage ?~~ ✅ **DÉFINIES** : Paris, Marseille, Lyon
4. ~~Y a-t-il des contraintes légales spécifiques à prendre en compte ?~~ ✅ **ANALYSÉ** : Voir section 6 (recommandation consultation juridique)
5. Quel est le budget disponible pour le développement ?
6. Quel est le calendrier visé pour le lancement ?
7. ~~Calcul de l'expiration : utiliser la date de préparation ou la date de post ?~~ ✅ **CLARIFIÉ** : Basé sur la date de préparation
8. Revenus plateforme : Commission sur les repas vendus ? Autres sources de revenus ?
9. Rayon de livraison maximum souhaité ? (recommandation : 10-15 km)
10. Système de messagerie entre membres pour coordination livraison ?

---

## 12. CONCLUSION

SOLID'EAT est un projet innovant qui combine économie collaborative, gamification et modèle freemium. Le concept est solide avec des fonctionnalités avancées intégrées dès le MVP :

### Points forts identifiés
- ✅ **Sécurité sanitaire renforcée** : Système d'expiration automatique à 72h (basé sur date de préparation)
- ✅ **Lutte contre le gaspillage** : Rubrique "Sauvez-les" avec gamification et fonctionnalités premium
- ✅ **Valeur premium claire** : Avantages différenciants dans "Sauvez-les" (badge, statistiques, filtres, notifications)
- ✅ **Engagement communautaire** : Système de badges et d'impact environnemental
- ✅ **Logistique définie** : Livraison par membres (MVP) avec rayon de livraison
- ✅ **Cadre légal structuré** : Positionnement clair comme plateforme de mise en relation avec responsabilité limitée
- ✅ **Zones cibles identifiées** : Paris, Marseille, Lyon pour le lancement

### Clarifications nécessaires
- ~~La logistique de livraison~~ ✅ **ANALYSÉ** : Voir section 5 (recommandation MVP : livraison par membres, rayon 10-15 km)
- Les règles de calcul précises (badges X/Y/Cordon bleu, bonus donateurs multiplicateur)
- ~~Les aspects légaux et sanitaires~~ ✅ **ANALYSÉ** : Voir section 6 (plateforme de mise en relation, responsabilité limitée, CGU structurées)
- ~~Le modèle économique détaillé~~ ✅ **TARIFICATION DÉFINIE** : 9€/mois (incitations hebdo/annuel)
- ~~Zones géographiques~~ ✅ **DÉFINIES** : Paris, Marseille, Lyon
- Revenus plateforme : Commission sur repas vendus ? Autres sources ?

**Prochaine étape recommandée** : Spécifications fonctionnelles détaillées (PM). La plupart des points critiques ont été analysés et documentés.

---

**Document créé par** : ANALYST  
**Prochaine étape** : PM (Spécifications fonctionnelles)
