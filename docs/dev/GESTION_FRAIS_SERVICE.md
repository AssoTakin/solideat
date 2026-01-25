# GESTION DES FRAIS DE SERVICE - VENTE DE REPAS

**Date** : 25 janvier 2026  
**Agent** : DEV  
**Basé sur** : SPECIFICATIONS_FONCTIONNELLES.md (Agent PM)

---

## 📋 RÈGLES MÉTIER

### Prix de vente des repas

Selon les spécifications fonctionnelles (section 9.2.2) :

- **Prix affiché** : **5€ par repas** (prix fixe, non modifiable)
- **Frais de service** : **1€** (compris dans le prix de 5€)
- **Revenu utilisateur premium** : **4€ par repas vendu**
- **Revenu plateforme** : **1€ par repas vendu** (frais de service)

### Processus de vente

1. **Création du repas** (premium uniquement) :
   - Option "Vendre ce repas" disponible uniquement pour les membres premium
   - Si l'option est cochée, le prix est automatiquement fixé à **5€**
   - Le prix ne peut pas être modifié par l'utilisateur

2. **Réservation et paiement** :
   - Le membre qui réserve paie **5€** via la plateforme (Stripe)
   - Le paiement est traité immédiatement lors de la réservation

3. **Versement au cuisinier** :
   - Le cuisinier reçoit **4€** après que le repas soit marqué comme "servi"
   - Le versement peut être effectué via :
     - Stripe Connect (recommandé pour production)
     - Virement bancaire (à implémenter)
     - Portefeuille interne (à implémenter)

4. **Frais de service plateforme** :
   - La plateforme perçoit **1€** par repas vendu
   - Ce montant est déduit automatiquement du prix de 5€

---

## 💻 IMPLÉMENTATION TECHNIQUE

### Frontend

**Formulaire de création de repas** (`CreateMeal.tsx`) :

- Case à cocher "Vendre ce repas" visible uniquement pour les membres premium
- Si cochée, le prix est automatiquement fixé à 5€ dans le formulaire
- Message informatif affiché :
  - "Si cette option est cochée, votre repas sera vendu **5€** (frais de service inclus)."
  - "**Vous recevrez 4€** après la livraison du repas. La plateforme perçoit 1€ de frais de service."

### Backend

**Validation** (`meal.service.ts`) :

1. **Vérification du statut premium** :
   - Si `price > 0`, vérifier que l'utilisateur est premium
   - Si non premium, rejeter avec message d'erreur

2. **Validation du prix** :
   - Si prix défini, il doit être exactement **5€**
   - Si prix différent de 5€, rejeter avec message d'erreur

3. **Stockage** :
   - Le prix est stocké dans la base de données (champ `price` du modèle `Meal`)
   - `price = null` : Repas gratuit
   - `price = 5` : Repas vendu (premium uniquement)

### Base de données

**Modèle Meal** (`schema.prisma`) :

```prisma
model Meal {
  // ...
  price             Float?    // null = gratuit, 5 = vendu (premium uniquement)
  // ...
}
```

---

## 💰 GESTION FINANCIÈRE

### Flux de paiement (à implémenter)

1. **Réservation avec paiement** :
   ```
   Membre réserve → Paiement 5€ via Stripe → Paiement confirmé → Réservation créée
   ```

2. **Après service du repas** :
   ```
   Repas marqué "servi" → Versement 4€ au cuisinier → Frais 1€ à la plateforme
   ```

### Comptabilité

**Pour chaque repas vendu** :
- **Revenu total** : 5€
- **Revenu cuisinier** : 4€ (80%)
- **Revenu plateforme** : 1€ (20%)

**Exemple** :
- 10 repas vendus = 50€ de revenus totaux
- Cuisinier reçoit : 40€
- Plateforme perçoit : 10€

---

## 🔄 PROCHAINES ÉTAPES (À IMPLÉMENTER)

### Court terme

1. **Intégration Stripe pour paiement** :
   - Créer un PaymentIntent lors de la réservation d'un repas payant
   - Confirmer le paiement avant de créer la réservation
   - Stocker l'ID de paiement Stripe dans la réservation

2. **Webhook Stripe pour versement** :
   - Écouter les événements de paiement réussi
   - Créer un transfert Stripe Connect vers le cuisinier (4€)
   - Marquer le versement comme effectué

### Moyen terme

1. **Portefeuille utilisateur** :
   - Créer un système de portefeuille interne
   - Permettre aux cuisiniers de consulter leurs gains
   - Permettre le retrait vers un compte bancaire

2. **Historique financier** :
   - Afficher l'historique des ventes et versements
   - Générer des factures pour les cuisiniers
   - Statistiques de revenus

---

## ⚠️ POINTS D'ATTENTION

1. **Sécurité** :
   - Vérifier toujours le statut premium côté backend (ne pas faire confiance au frontend)
   - Valider le prix exactement à 5€ côté backend
   - Utiliser Stripe pour tous les paiements (ne pas stocker les informations bancaires)

2. **Conformité** :
   - Respecter les réglementations sur les paiements en ligne
   - Gérer les cas de remboursement (annulation, repas non récupéré)
   - Facturation et déclarations fiscales

3. **Gestion des erreurs** :
   - Que faire si le paiement échoue ?
   - Que faire si le versement au cuisinier échoue ?
   - Gérer les cas de litige

---

## 📝 RÉFÉRENCES

- **Spécifications fonctionnelles** : `/docs/pm/SPECIFICATIONS_FONCTIONNELLES.md` (section 9.2.2)
- **Architecture technique** : `/docs/archi/ARCHITECTURE_TECHNIQUE.md`
- **User Stories** : `/docs/story-creator/USER_STORIES.md` (US-033 à US-035 pour abonnements)

---

**Document créé par** : DEV  
**Date** : 25 janvier 2026  
**Dernière mise à jour** : 25 janvier 2026
