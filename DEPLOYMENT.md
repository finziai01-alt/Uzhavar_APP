# Uzhavar Pay — Live System Deployment Guide

Connect all three apps (Admin Panel, Customer App, Rider App) to **one shared Supabase project** with live data.

## Overview

| App | Location | Framework | Connects to |
|-----|----------|-----------|-------------|
| Uzhavar Pay Admin Panel | `freshgrocer_admin_panel/` | HTML/CSS/JS | Supabase REST API |
| Uzhavar Customer App | `uzhvar/uzhavar_customer_app/` | Flutter | Supabase Flutter client |
| Uzhavar Rider App | `delivery app/swiftrider_rider_app/` | Flutter | Supabase Flutter client |

All three share the **same Supabase project**, **same `auth.users` table**, and **same database tables**.

---

## Phase 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note these values from **Settings → API**:
   - **Project URL** → `SUPABASE_URL`
   - **public anon key** → `SUPABASE_ANON_KEY` (safe for client code)
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (server-side ONLY, never in client code)
3. Enable **Email** provider in **Authentication → Sign In / Providers**
4. In **Authentication → URL Configuration → Redirect URLs**, add:
   ```
   http://localhost:4173
   https://your-admin-domain.com
   http://localhost:4173/reset-password.html
   https://your-admin-domain.com/reset-password.html
   in.uzhavar.customer://login-callback/
   ```

---

## Phase 2: Apply Database Schema

Run both SQL files in **Supabase SQL Editor**:

```sql
-- freshgrocer_admin_panel/supabase/migrations/20261116000000_unified_system.sql
-- freshgrocer_admin_panel/supabase/migrations/20261116000001_customer_app_rpcs.sql
```

This creates all shared tables plus RPC functions for the customer app.

---

## Phase 3: Configure Admin Panel

### 3a. Create `config.js`

```bash
cd freshgrocer_admin_panel
cp config.example.js config.js
```

Edit `config.js`:

```js
const config = {
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY',
  features: {
    demoMode: false,
  },
  demoMode: { enabled: false },
};
```

### 3b. Run locally

```bash
python3 -m http.server 4173 --bind 0.0.0.0
# Open http://localhost:4173
```

---

## Phase 4: Configure Customer App (Flutter)

```bash
cd uzhvar/uzhavar_customer_app
flutter run \
  --dart-define=SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

The customer app uses the same Supabase project. Products, orders, and coupons are synced with the admin panel.

---

## Phase 5: Configure Rider App (Flutter)

```bash
cd delivery app/swiftrider_rider_app
flutter run \
  --dart-define=SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

The rider app uses the same Supabase project. Rider profiles, shifts, and tasks are synced with the admin panel.

---

## Phase 6: Deploy Edge Functions

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set \
  RAZORPAY_MODE=test \
  RAZORPAY_KEY_ID='rzp_test_YOUR_TEST_KEY_ID' \
  RAZORPAY_KEY_SECRET='YOUR_TEST_SECRET' \
  RAZORPAY_WEBHOOK_SECRET='YOUR_WEBHOOK_SECRET'

supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook
supabase functions deploy finalize-order
```

---

## Phase 7: Create Admin User

1. Supabase Dashboard → **Authentication → Users** → Add user
2. **Table Editor → profiles** → Insert row:
   - `id`: the user's auth UUID
   - `role`: `admin`
   - `full_name`, `email`, `hub_name`, `hub_code`

3. Sign in at `http://localhost:4173`

---

## Phase 8: Add Products

**Table Editor → products** — insert your real catalogue items. Set `is_active = true` for items customers can see.

**No seeded data.** Only enter real products you intend to sell.

---

## Data Sync Across Apps

| Action in One App | Appears In |
|------------------|------------|
| Admin adds product | Customer app catalogue |
| Customer places order | Admin panel + Rider app |
| Admin assigns rider | Rider app delivery task |
| Rider updates delivery | Admin panel + Customer app |
| Admin updates inventory | All apps |

---

## Security Checklist

- `service_role` key never in client code ✅
- `config.js` gitignored ✅
- Razorpay secrets server-side only ✅
- RLS enabled on all tables ✅
- Demo mode optional, not default ✅
- No seeded marketplace data ✅
