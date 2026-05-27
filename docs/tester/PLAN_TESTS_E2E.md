# PLAN TESTS E2E — PLAYWRIGHT

**Date** : 24 mai 2026  
**Testeur** : Agent TESTER  
**Projet** : Solid'Eat 2026  
**Outil** : Playwright (`frontend/playwright.config.ts`)  
**État actuel** : Config présente, dossier `frontend/tests/e2e/` **vide** — `npm run test:e2e` → « No tests found »

---

## 1. OBJECTIF

Définir les scénarios E2E prioritaires alignés sur les **13 sprints** et les **US P0**, pour combler l'écart identifié dans le rapport de validation (`RAPPORT_VALIDATION_SPRINTS_2026-05-24.md`).

**Prérequis d'exécution** :

- Backend API accessible (`VITE_API_URL` ou proxy Vite)
- Base Supabase / PostgreSQL avec données de test
- Variables staging : auth, Stripe test mode, (optionnel) SendGrid/Twilio mockés
- Commande : `cd frontend && npm run test:e2e` (démarre `npm run dev` via `webServer` si configuré)

---

## 2. PRIORISATION

| Priorité | Signification | Nombre scénarios |
|----------|---------------|------------------|
| **P0** | Bloquant MVP / régression critique | 10 |
| **P1** | Important post-MVP court terme | 5 |
| **P2** | Confort / Premium avancé | 3 |

---

## 3. SCÉNARIOS P0 (À IMPLÉMENTER EN PREMIER)

### E2E-P0-01 — Parcours auth complet

| Champ | Valeur |
|-------|--------|
| **Sprint** | 1, 10 |
| **US** | US-001, US-002, US-004, US-043 |
| **Fichier suggéré** | `frontend/tests/e2e/auth-onboarding.spec.ts` |
| **Préconditions** | Email test unique ; API + BDD up |
| **Steps** | 1. `/register` — formulaire valide 2. Vérifier redirection/message post-inscription 3. Simuler lien vérif email (token test ou API) 4. `/login` 5. `/dashboard` — pas d'erreur 401, widgets visibles |
| **Résultat attendu** | Session stable ; dashboard charge données |
| **Risques connus** | US-003 téléphone non bloquant ; US-043 stabilisation 401 |

---

### E2E-P0-02 — Création et publication repas

| Champ | Valeur |
|-------|--------|
| **Sprint** | 2 |
| **US** | US-010, US-011, US-012 |
| **Fichier suggéré** | `frontend/tests/e2e/meal-create.spec.ts` |
| **Steps** | 1. Login cuisinier 2. `/meals/create` — remplir champs obligatoires 3. Soumettre 4. `/meals` — repas visible 5. Cliquer détail — infos cohérentes |
| **Résultat attendu** | Repas créé et listé |
| **Risques** | Upload photo TODO ; Maps autocomplétion partielle |

---

### E2E-P0-03 — Réservation standard

| Champ | Valeur |
|-------|--------|
| **Sprint** | 3 |
| **US** | US-015, US-016, US-017 |
| **Fichier suggéré** | `frontend/tests/e2e/reservation-flow.spec.ts` |
| **Steps** | 1. Login convive 2. Ouvrir repas disponible 3. Réserver 4. `/reservations` — réservation listée 5. Annuler — confirmation et mise à jour quotas |
| **Résultat attendu** | Cycle réserver → lister → annuler OK |

---

### E2E-P0-04 — Messagerie et modération

| Champ | Valeur |
|-------|--------|
| **Sprint** | 4 |
| **US** | US-020, US-022, US-023 |
| **Fichier suggéré** | `frontend/tests/e2e/messaging.spec.ts` |
| **Steps** | 1. Convive ouvre conversation depuis repas 2. Envoie message valide 3. Tente message avec numéro téléphone 4. Vérifie refus/modération |
| **Résultat attendu** | Message normal OK ; numéro bloqué |

---

### E2E-P0-05 — Sauvez-les

| Champ | Valeur |
|-------|--------|
| **Sprint** | 5 |
| **US** | US-024, US-025 |
| **Fichier suggéré** | `frontend/tests/e2e/save-them.spec.ts` |
| **Steps** | 1. `/save-them` — liste repas urgence 2. Vérifier compte à rebours visible 3. Réserver un repas Sauvez-les |
| **Résultat attendu** | Réservation comptabilisée (vérifier via Mes réservations) |

---

### E2E-P0-06 — Actions cuisinier (récupération / signalement)

| Champ | Valeur |
|-------|--------|
| **Sprint** | 3 |
| **US** | US-018, US-019 |
| **Fichier suggéré** | `frontend/tests/e2e/cook-reservation-actions.spec.ts` |
| **Steps** | 1. Cuisinier avec réservation confirmée 2. Marquer repas récupéré (UI à implémenter) 3. Scénario alternatif : signalement non récupéré |
| **Résultat attendu** | Statuts réservation mis à jour |
| **Statut** | **Bloqué implémentation** — boutons UI absents (Partial) ; test à activer quand DEV livre UI |

---

### E2E-P0-07 — Notation après repas

| Champ | Valeur |
|-------|--------|
| **Sprint** | 6 |
| **US** | US-030, US-031 |
| **Fichier suggéré** | `frontend/tests/e2e/review.spec.ts` |
| **Steps** | 1. Après repas servi/récupéré 2. Redirection ou accès `/reviews/create` 3. Soumettre note + commentaire (≥ 20 car.) 4. Vérifier note sur profil |
| **Résultat attendu** | Avis enregistré ; note globale recalculée |

---

### E2E-P0-08 — Abonnements (lecture + souscription staging)

| Champ | Valeur |
|-------|--------|
| **Sprint** | 9, 12 |
| **US** | US-033, US-034, US-035, US-036, US-054 |
| **Fichier suggéré** | `frontend/tests/e2e/subscription.spec.ts` |
| **Steps** | 1. `/subscriptions` — 3 plans 2. Initier souscription (Stripe test card si Elements implémenté) 3. Vérifier statut premium 4. Annuler abonnement — fin période |
| **Résultat attendu** | Flux monétisation staging OK |
| **Risques** | US-034 Stripe Elements TODO ; BUG-T-001 intégr. API |

---

### E2E-P0-09 — Sanctions et quotas dashboard

| Champ | Valeur |
|-------|--------|
| **Sprint** | 9 |
| **US** | US-045, US-047 |
| **Fichier suggéré** | `frontend/tests/e2e/sanctions-quotas.spec.ts` |
| **Steps** | 1. Utilisateur test avec historique annulations (seed) 2. Dashboard — affichage quotas réduits / blocage 3. Tenter action bloquée (réservation ou annulation) |
| **Résultat attendu** | Messages blocage cohérents avec règles métier |

---

### E2E-P0-10 — Notifications in-app

| Champ | Valeur |
|-------|--------|
| **Sprint** | 8 |
| **US** | US-039, US-044 |
| **Fichier suggéré** | `frontend/tests/e2e/notifications.spec.ts` |
| **Steps** | 1. Déclencher événement notif (réservation, message système) 2. `/notifications` — liste 3. Marquer comme lu |
| **Résultat attendu** | Compteur non lus décrémenté |

---

## 4. SCÉNARIOS P1

| ID | Titre | Sprint | US | Fichier suggéré |
|----|-------|--------|-----|-----------------|
| E2E-P1-01 | Profil public et badges | 1, 11 | US-007, US-032 | `profile-badges.spec.ts` |
| E2E-P1-02 | Bonus donateur | 11 | US-027, US-028 | `bonus-donor.spec.ts` |
| E2E-P1-03 | Transfert bonus Premium | 13 | US-029 | `bonus-transfer.spec.ts` |
| E2E-P1-04 | Impact environnemental Premium | 11 | US-026 | `environmental-stats.spec.ts` |
| E2E-P1-05 | Récupération mot de passe | 10 | US-006 | `password-reset.spec.ts` |

---

## 5. SCÉNARIOS P2 (POST-MVP)

| ID | Titre | Sprint | US | Note |
|----|-------|--------|-----|------|
| E2E-P2-01 | Notifications push PWA | 12 | US-038 | Requiert VAPID + web-push installé |
| E2E-P2-02 | Modification / annulation repas UI | 2 | US-013, US-014 | Après pages frontend |
| E2E-P2-03 | Filtres géoloc avancés + cache | 9 | US-040, US-042 | Valider cache Redis si ajouté |

---

## 6. STRUCTURE DE DOSSIERS RECOMMANDÉE

```
frontend/tests/e2e/
├── auth-onboarding.spec.ts      # P0-01
├── meal-create.spec.ts          # P0-02
├── reservation-flow.spec.ts   # P0-03
├── messaging.spec.ts            # P0-04
├── save-them.spec.ts            # P0-05
├── cook-reservation-actions.spec.ts  # P0-06 (skip jusqu'à UI)
├── review.spec.ts               # P0-07
├── subscription.spec.ts         # P0-08
├── sanctions-quotas.spec.ts     # P0-09
├── notifications.spec.ts        # P0-10
├── fixtures/
│   ├── auth.ts                  # helpers login/register
│   └── test-users.ts            # comptes seed
└── playwright.config.ts         # (existant)
```

---

## 7. FIXTURES ET DONNÉES DE TEST

| Fixture | Usage |
|---------|--------|
| `testCook` | Création repas, actions cuisinier |
| `testGuest` | Réservations, messagerie |
| `testPremium` | Abonnements, bonus, stats env. |
| `seedMealAvailable` | API ou Prisma seed avant test |
| `stripeTestCard` | `4242424242424242` (mode test) |

**Recommandation** : script `backend/prisma/seed-e2e.ts` idempotent + variables `.env.test`.

---

## 8. INTÉGRATION CI (CIBLE)

```yaml
# Exemple GitHub Actions (à ajouter)
- run: cd backend && npm test
- run: cd backend && npm run test:integration
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
- run: cd frontend && npm ci && npx playwright install --with-deps
- run: cd frontend && npm run test:e2e
  env:
    CI: true
```

`playwright.config.ts` : `reuseExistingServer: !process.env.CI` — en CI, laisser Playwright démarrer `webServer`.

---

## 9. MAPPING SPRINT → SPECS E2E

| Sprint | Specs E2E prioritaires |
|--------|------------------------|
| 1 | P0-01 |
| 2 | P0-02, P2-02 |
| 3 | P0-03, P0-06 |
| 4 | P0-04 |
| 5 | P0-05 |
| 6 | P0-07 |
| 7 | — (cron : tests API/job séparés, pas E2E UI) |
| 8 | P0-10 |
| 9 | P0-08, P0-09, P2-03 |
| 10 | P0-01 (auth étendu), P1-05 |
| 11 | P1-02, P1-03, P1-04 |
| 12 | P0-08, P2-01 |
| 13 | P1-03 |

---

## 10. CRITÈRES D'ACCEPTATION PLAN E2E

Le plan est considéré **exécuté** quand :

- [ ] Au moins **8/10** scénarios P0 implémentés et verts en CI
- [ ] P0-06 skip documenté ou vert après livraison UI DEV
- [ ] Fixtures seed reproductibles
- [ ] Rapport TESTER mis à jour avec compteurs Playwright réels

---

**Document produit par** : Agent TESTER  
**Référence** : `RAPPORT_VALIDATION_SPRINTS_2026-05-24.md`
