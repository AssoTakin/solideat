# MISE À JOUR - MESSAGERIE ET CONTACT ENTRE MEMBRES

**Date** : 2026  
**Source** : ANALYST  
**Destinataire** : PM  
**Statut** : À intégrer dans les spécifications fonctionnelles

---

## NOUVELLES FONCTIONNALITÉS À INTÉGRER

### 1. Messagerie entre membres

#### 1.1 Possibilité de contact
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

#### 1.2 Restrictions de la messagerie
- **Interdiction d'échange de numéros de téléphone** :
  - Impossible d'écrire un numéro de téléphone (détection automatique)
  - Impossible d'écrire un numéro en toutes lettres (ex: "zéro six", "zéro un", etc.)
  - Filtrage automatique des messages contenant des numéros
  - Message d'avertissement si tentative d'échange de numéro
- **Interdiction de pièces jointes** :
  - Pas d'envoi de fichiers
  - Pas d'envoi d'images via la messagerie (les photos de repas sont gérées ailleurs)
  - Sécurité et protection des données

#### 1.3 Fonctionnalités de la messagerie
- Messages asynchrones (pas de chat en temps réel)
- Historique des conversations liées à un repas
- Notifications lors de nouveaux messages
- Indicateur de messages non lus
- Possibilité de marquer comme lu
- Modération automatique (détection numéros, pièces jointes)

### 2. Visibilité des numéros de téléphone

#### 2.1 Règle générale
- Seul l'utilisateur qui a réservé un repas peut voir le numéro de téléphone du cuisinier qui a proposé le repas
- Le numéro n'est visible qu'après la réservation effective

#### 2.2 Membres gratuits (freemium)
- **Numéro de téléphone visible obligatoirement** pour le membre qui a réservé
- Pas de possibilité de masquer le numéro
- Le membre qui a réservé peut voir et utiliser le numéro du cuisinier

#### 2.3 Membres premium
- **Option de masquage du numéro** :
  - Les membres premium peuvent refuser de faire apparaître leur numéro de téléphone
  - Paramétrable dans les préférences du compte
  - Si masqué : le membre premium n'est joignable que par la messagerie de la plateforme
  - Si non masqué : comportement identique aux membres gratuits (numéro visible pour celui qui a réservé)

#### 2.4 Affichage du numéro
- Visible uniquement sur la fiche du repas réservé
- Visible dans le tableau de bord (section repas réservés)
- Masqué dans le profil public
- Masqué dans les messages

### 3. Intégration dans la fiche repas

- **Bouton de contact** : Ajouter un bouton "Contacter le cuisinier" sur la fiche repas
- Visible tant que le statut n'est pas "servi"
- Une fois "servi", le bouton disparaît mais l'historique de conversation reste accessible

### 4. Flux à ajouter

#### 4.1 Flux de contact cuisinier
1. Consultation d'une fiche repas (statut : disponible ou réservé)
2. Clic sur "Contacter le cuisinier"
3. Ouverture de la messagerie (conversation liée au repas)
4. Envoi de message (questions allergènes, ingrédients, coordination, etc.)
5. Filtrage automatique (détection numéros de téléphone, pièces jointes)
6. Notification au cuisinier
7. Réponse possible tant que statut ≠ "servi"
8. Une fois "servi" : messagerie accessible en historique uniquement

#### 4.2 Flux de réservation (à mettre à jour)
Ajouter l'étape :
- Possibilité de contacter le cuisinier avant réservation
- Après réservation : affichage du numéro de téléphone (si non masqué pour premium)

---

## SECTIONS À METTRE À JOUR DANS LES SPÉCIFICATIONS

1. **Section 11.3 Espace messages** : Ajouter la messagerie entre membres
2. **Section 2.2.1 Fiche repas** : Ajouter le bouton de contact
3. **Section 2.1.2 Gestion de la confidentialité** : Mettre à jour les règles de visibilité des numéros
4. **Section 3.1 Membres gratuits** : Ajouter la règle sur le numéro visible obligatoirement
5. **Section 3.2 Membres premium** : Ajouter l'option de masquage du numéro
6. **Section 14.6 Flux de réservation** : Ajouter l'étape de contact
7. **Nouvelle section** : Flux de contact cuisinier (section 14.8)

---

## POINTS D'ATTENTION TECHNIQUES

1. **Filtrage automatique** :
   - Détection de numéros de téléphone (formats français : 06, 07, +33, etc.)
   - Détection de numéros écrits en toutes lettres
   - Blocage ou remplacement par des astérisques

2. **Modération** :
   - Système de détection automatique
   - Possibilité de signalement manuel
   - Traçabilité des tentatives

3. **Sécurité** :
   - Pas de stockage de pièces jointes
   - Validation côté serveur des messages
   - Protection contre les injections

---

**Action requise** : Intégrer ces éléments dans les spécifications fonctionnelles et mettre à jour les sections concernées.
