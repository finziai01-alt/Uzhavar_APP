# Uzhavan Pay — Live System Deployment Guide

Connect all three apps (Admin Panel, Customer App, Rider App) to **one shared Supabase project** with live data.

## Overview

| App | Location | Framework | Connects to |
|-----|----------|-----------|-------------|
| FreshGrocer Admin Panel | `freshgrocer_admin_panel/` | HTML/CSS/JS | Supabase REST API |
| Uzhavar Customer App | `uzhvar/uzhavar_customer_app/` | Flutter | Supabase Flutter client |
| SwiftRider Rider App | `delivery app/swiftrider_rider_app/` | Flutter | Supabase Flutter client |

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

Run this SQL in **Supabase SQL Editor**:

```sql
-- Copy the entire contents of:
-- freshgrocer_admin_panel/supabase/migrations/20261116000000_unified_system.sql
-- and paste it into the SQL Editor, then click RUN.
```

This creates:
- `profiles` — shared user profiles with `role` column (customer, admin, manager, operator, viewer, rider)
- `products` / `product_variants` — catalog with pricing and stock
- `orders` / `order_items` — orders with payment status
- `coupons` — discount codes
- `inventory_log` — stock adjustments
- `rider_profiles` / `rider_shifts` / `rider_tasks` — delivery fleet
- `audit_log` — admin action trail

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
    demoMode: false,   // Must be false for live mode
  },
  demoMode: { enabled: false },
  // ...
};
```

### 3b. Create `reset-password.html`

Already included in the repo. Supabase will redirect password reset emails to this page.

### 3c. Run locally

```bash
python3 -m http.server 4173 --bind 0.0.0.0
# Open http://localhost:4173
```

---

## Phase 4: Configure Customer App (Flutter)

The customer app is at `uzhvar/uzhavar_customer_app/`.

### 4a. Update `lib/` to connect to shared Supabase

In your Flutter app, initialize Supabase with the **same** project URL and anon key:

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

await Supabase.initialize(
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_PUBLIC_ANON_KEY',
);
```

### 4b. Pass credentials via flutter run

```bash
cd uzhvar/uzhavar_customer_app
flutter run \
  --dart-define=SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

### 4c. Schema alignment

The customer app already has its own migration (`supabase/migrations/20261110000100_customer_marketplace.sql`). **Do not apply that migration to the shared project.** Instead, use the unified schema from Phase 2, which includes all customer tables (`profiles`, `products`, `orders`, `order_items`, `coupons`) plus admin and rider tables.

The customer app's RPC functions (`validate_coupon`, `prepare_customer_order`, `finalize_razorpay_payment`) should be recreated in the shared project using the Edge Functions in `freshgrocer_admin_panel/supabase/functions/`.

---

## Phase 5: Configure Rider App (Flutter)

The rider app is at `delivery app/swiftrider_rider_app/`.

### 5a. Initialize Supabase

Same project URL and anon key as the other two apps.

### 5b. Rider auth uses SMS OTP

The rider app's `config.toml` shows:
```
[functions.request-rider-otp]
verify_jwt = false

[functions.verify-rider-otp]
verify_jwt = false
```

These Edge Functions need to be deployed to the shared Supabase project. The unified schema includes `rider_profiles`, `rider_shifts`, and `rider_tasks`.

---

## Phase 6: Deploy Edge Functions (Server-Side Logic)

Install Supabase CLI and deploy the shared functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets (server-side only)
supabase secrets set \
  RAZORPAY_MODE=test \
  RAZORPAY_KEY_ID='rzp_test_YOUR_TEST_KEY_ID' \
  RAZORPAY_KEY_SECRET='YOUR_TEST_SECRET' \
  RAZORPAY_WEBHOOK_SECRET='YOUR_WEBHOOK_SECRET'

# Deploy functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook
supabase functions deploy finalize-order
```

**Never commit secrets.** They live only in Supabase Function Secrets.

---

## Phase 7: Configure Razorpay Test Mode

1. Create a Razorpay account and enable **Test Mode**
2. Get **Test Key ID** (must start with `rzp_test_`) and **Test Key Secret**
3. Set these as Supabase secrets (see Phase 6)
4. Configure webhook URL in Razorpay dashboard:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook
   ```
   Subscribe to: `payment.captured`, `order.paid`

---

## Phase 8: Create Admin User

1. In Supabase Dashboard → **Authentication → Users**, click **Add user**
2. Enter email and password (or invite via email)
3. In **Table Editor → profiles**, insert a row:
   - `id`: the new user's `auth.users.id`
   - `full_name`: "Ops Lead"
   - `email`: same as above
   - `role`: `admin`
   - `hub_name`: "Metro Hub #04"
   - `hub_code`: "MH-04"

4. Sign in to the admin panel at `http://localhost:4173` with those credentials

---

## Phase 9: Add Products (via Supabase Dashboard)

1. **Table Editor → products** — insert your real catalogue items
   - Set `is_active = true` for items customers can see
   - Set `cost_price`, `price`, `stock`, `reorder_threshold`
2. **Table Editor → coupons** — insert real promotions
   - Set `is_active = true`
   - Set `starts_at` and optionally `expires_at`

**No seeded/dummy data.** Only enter real products you intend to sell.

---

## Phase 10: Deploy to Production

### Admin Panel (static hosting)

Deploy `freshgrocer_admin_panel/` to any static host (Netlify, Vercel, GitHub Pages, etc.):

```bash
# Build is not needed — it's pure HTML/CSS/JS
# Upload the folder contents to your host
```

Set environment variables on your host:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Flutter Apps (mobile)

Build APKs/AABs with the Supabase credentials passed via `--dart-define` or your CI/CD pipeline.

---

## Security Checklist

| Item | Status |
|------|--------|
| `service_role` key never in client code | ✅ Required |
| `config.js` gitignored | ✅ `.gitignore` includes it |
| Razorpay secrets server-side only | ✅ Edge Functions + Supabase secrets |
| RLS enabled on all tables | ✅ Unified schema includes RLS |
| Password reset via email only | ✅ `reset-password.html` |
| Demo mode clearly labeled | ✅ Visible banner when enabled |
| No seeded marketplace data | ✅ Empty by default |
| Razorpay test mode only | ✅ `rzp_test_` key required |
| Server-side price calculation | ✅ Edge Functions validate from DB |
| Audit log for admin actions | ✅ `audit_log` table |

---

## Testing the Live Connection

1. Start the admin panel: `python3 -m http.server 4173`
2. Open `http://localhost:4173`
3. Sign in with the admin user you created in Phase 8
4. You should see real data from your Supabase project (products, orders, etc.)
5. Create an order through the customer app → it appears in the admin panel
6. Assign a rider through the admin panel → it appears in the rider app

---

## What Still Needs Manual Work

- **Flutter app code changes**: The customer and rider Flutter apps need their `lib/` code updated to point to the shared Supabase project and use the unified schema tables
- **Edge Function deployment**: Requires Supabase CLI and your project credentials
- **Razorpay webhook**: Must be configured in the Razorpay dashboard
- **SMTP/email**: Supabase's built-in email sender is rate-limited; configure custom SMTP for production
- **Mobile app store deployment**: Separate process for each Flutter app

---

## Rollback / Safety

- Never apply the separate customer migration (`20261110000100_customer_marketplace.sql`) to the shared project — it duplicates tables
- Never apply the separate rider migration to the shared project unless you've reviewed it against the unified schema
- Keep `demoMode.enabled = true` until you've verified the live connection works
- The `config.js` file is gitignored — recreate it locally on each deployment machine
