# Build Notes - Solideat

**Projet** : Solideat / solid-eat.com  
**Repo** : github.com/AssoTakin/solideat  
**Branche active** : `dev/local-work`  
**Branche production** : `main`  
**Dernière mise à jour** : 2026-08-20

---

## 🩺 Santé production

| Service | URL | Statut |
|---|---|---|
| Frontend | https://solid-eat.com | HTTP 200 |
| Backend | https://api.solid-eat.com | HTTP 200 |

---

## 🔀 Workflow Git

1. Toujours travailler sur `dev/local-work`.
2. Toujours faire `git pull --ff-only` avant de commencer.
3. Ne jamais push directement sur `main`.
4. Créer un tag de rollback avant toute opération non triviale.

### Commandes courantes

```bash
git checkout dev/local-work
git pull --ff-only origin dev/local-work
```

---

## 📈 Avancement global

| Indicateur | Valeur |
|---|---|
| Sprints terminés | 10/10 (P0 complété) |
| User stories | 44/54 (~81 %) |
| Points | ~212/250 (~85 %) |
| Tests unitaires | 38/40 (95 %) |
| Compilation | ✅ Backend + Frontend |

### Sprints terminés

- Sprint 1 : Authentification
- Sprint 2 : Gestion des repas
- Sprint 3 : Réservation
- Sprint 4 : Messagerie
- Sprint 5 : Sauvez-les
- Sprint 6 : Notation
- Sprint 7 : Tâches automatiques
- Sprint 8 : Notifications
- Sprint 9 : Abonnements, géolocalisation, dashboard, sanctions
- Sprint 10 : Finalisation MVP P0

### Reste à faire (P1)

- Impact environnemental (US-026)
- Bonus donateur (US-027, US-028)
- Badges (US-032)
- Annulation abonnement (US-036)
- Notifications push (US-038)
- Expiration bonus (US-051)
- Renouvellement abonnements (US-054)

---

## 💰 Flow premium (5 € / repas)

- Cuisinier Premium crée un repas à 5 €.
- Mangeur Premium réserve et paie via Stripe PaymentElement.
- Reversement automatique : 4 € au cuisinier, 1 € de frais plateforme.
- Webhook `payment_intent.succeeded` met à jour la réservation.
- Statut final : `PAYOUT_DONE`.

### Fichiers clés

- `backend/src/services/meal.service.ts`
- `backend/src/services/reservation.service.ts`
- `backend/src/services/stripe.service.ts`
- `backend/src/controllers/stripe.controller.ts`
- `frontend/src/pages/ReserveMeal.tsx`
- `frontend/src/pages/CreateMeal.tsx`

---

## 🛠 Commandes utiles

### Healthcheck

```bash
bash scripts/healthcheck.sh
```

### Développement local

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Prisma

```bash
cd backend
npx prisma migrate status
npx prisma studio
```

---

## 🚨 Points de vigilance

- Branche `dev/local-work` est la seule branche de travail.
- Rollback : utiliser le tag local `rollback-YYYYMMDD-HHMMSS` créé avant chaque intervention.
- Documentation source de vérité : `docs/dev/AVANCEMENT_GLOBAL.md` doit rester synchronisée.
- Scope fundraise : France uniquement, Bénin exclu.

---

## 📚 Références

- `docs/dev/AVANCEMENT_GLOBAL.md`
- `docs/dev/STATUS_APPLICATION.md`
- `docs/dev/POINT_SITUATION.md`
- `docs/PREMIUM_MEAL_SALE_AUDIT.md`

---

*Document maintenu par SolidProjectBot. Mettre à jour après chaque changement non trivial.*
