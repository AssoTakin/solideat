# 🔑 VARIABLES D'ENVIRONNEMENT RAILWAY - SOLID'EAT

**Date** : 4 août 2026  
**Plateforme** : Railway (Backend Solideat)  
**Statut** : ✅ Configuration complète et synchronisée

---

## ✅ VARIABLES CONFIGURÉES

Toutes les variables sont injectées dans l'environnement **production** du service `solideat` sur Railway.

### Application
| Variable | Statut | Notes |
|---|---|---|
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | `3000` |
| `API_URL` | ✅ | `https://api.solid-eat.com` |
| `FRONTEND_URL` | ✅ | `https://solid-eat.com` |

### Base de données
| Variable | Statut | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL (Pooler IPv4/IPv6) |
| `DIRECT_URL` | ✅ | URL directe Supabase (migrations Prisma) |

### JWT
| Variable | Statut | Notes |
|---|---|---|
| `JWT_SECRET` | ✅ | Clé HS256 forte |
| `JWT_EXPIRES_IN` | ✅ | `7d` |

### Stripe (mode live en production)
| Variable | Statut | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | ✅ | `sk_live_...` (clé live production) |
| `STRIPE_PUBLISHABLE_KEY` | ✅ | `pk_live_...` (servi via `/api/users/stripe-config`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | `whsec_...` (secret du webhook `we_1U0eVc...`) |
| `STRIPE_PRICE_ID_WEEKLY` | ✅ | ID prix abonnement hebdomadaire |
| `STRIPE_PRICE_ID_MONTHLY` | ✅ | ID prix abonnement mensuel |
| `STRIPE_PRICE_ID_YEARLY` | ✅ | ID prix abonnement annuel |

### Services externes
| Variable | Statut | Notes |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | ✅ | Geocoding + Places |
| `RESEND_API_KEY` | ✅ | Envoi d'e-mails |
| `TWILIO_ACCOUNT_SID` | ✅ | SMS vérification téléphone |
| `TWILIO_AUTH_TOKEN` | ✅ | SMS vérification téléphone |
| `TWILIO_PHONE_NUMBER` | ✅ | Numéro d'envoi Twilio |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Upload images |
| `CLOUDINARY_API_KEY` | ✅ | Upload images |
| `CLOUDINARY_API_SECRET` | ✅ | Upload images |

### Cache / Queue
| Variable | Statut | Notes |
|---|---|---|
| `REDIS_URL` | ✅ | Upstash Redis |
| `UPSTASH_REDIS_REST_URL` | ✅ | Alternative REST Redis |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Token REST Redis |

### Optionnelles
| Variable | Statut | Notes |
|---|---|---|
| `ADMIN_SECRET` | ❌ | Supprimé (route admin temporaire retirée) |

---

## 🔧 MISE À JOUR DES VARIABLES

Les variables peuvent être mises à jour via :
1. **Railway Dashboard** → Projet `robust-integrity` → Service `solideat` → Onglet **Variables**
2. **Railway CLI** : `railway variables --json`
3. **API GraphQL Railway** (automatisation SolidProjectBot) : `variableUpsert`

⚠️ **Chaque modification de variable déclenche un redéploiement automatique** du service.

---

## 🛡️ SÉCURITÉ

- Les valeurs sensibles ne sont **jamais commitées** dans Git.
- Les secrets sont injectés au runtime par Railway.
- Seuls `STRIPE_PUBLISHABLE_KEY` est exposé publiquement (par design Stripe).
- `STRIPE_WEBHOOK_SECRET` est utilisé pour valider les signatures des webhooks Stripe entrants.

---

## 📋 CHECKLIST VARIABLES RAILWAY - PRODUCTION

- [x] `NODE_ENV=production`
- [x] `PORT=3000`
- [x] `API_URL=https://api.solid-eat.com`
- [x] `FRONTEND_URL=https://solid-eat.com`
- [x] `DATABASE_URL=...`
- [x] `DIRECT_URL=...`
- [x] `JWT_SECRET=...`
- [x] `JWT_EXPIRES_IN=7d`
- [x] `STRIPE_SECRET_KEY=sk_live_...`
- [x] `STRIPE_PUBLISHABLE_KEY=pk_live_...`
- [x] `STRIPE_WEBHOOK_SECRET=whsec_...`
- [x] `STRIPE_PRICE_ID_WEEKLY=price_...`
- [x] `STRIPE_PRICE_ID_MONTHLY=price_...`
- [x] `STRIPE_PRICE_ID_YEARLY=price_...`
- [x] `GOOGLE_MAPS_API_KEY=...`
- [x] `RESEND_API_KEY=...`
- [x] `TWILIO_ACCOUNT_SID=...`
- [x] `TWILIO_AUTH_TOKEN=...`
- [x] `TWILIO_PHONE_NUMBER=...`
- [x] `CLOUDINARY_CLOUD_NAME=...`
- [x] `CLOUDINARY_API_KEY=...`
- [x] `CLOUDINARY_API_SECRET=...`
- [x] `REDIS_URL=...`

---

## 🚀 VÉRIFICATION

```bash
curl https://api.solid-eat.com/health
# {"status":"ok","timestamp":"...","database":"connected"}

curl https://api.solid-eat.com/api/users/stripe-config
# {"success":true,"data":{"publishableKey":"pk_live_..."}}
```

---

**Document créé par** : DEV  
**Dernière mise à jour** : 4 août 2026  
**⚠️ Note** : Les vraies valeurs sensibles sont stockées uniquement dans Railway
