# Uzhavar Pay — Admin Panel

Live admin panel connected to Supabase. All data (products, orders, inventory, riders, coupons) is stored in a shared Supabase database that syncs across the admin panel, customer app, and rider app.

## Architecture

All three apps connect to **one shared Supabase project**:

| App | Location | Data Source |
|-----|----------|-------------|
| Uzhavar Pay Admin Panel | `freshgrocer_admin_panel/` | Supabase REST API |
| Uzhavar Customer App | `uzhvar/uzhavar_customer_app/` | Supabase Flutter client |
| Uzhavar Rider App | `delivery app/swiftrider_rider_app/` | Supabase Flutter client |

Changes in any app are reflected in all others through the shared Supabase database.

## Authentication

Supabase email/password authentication with role-based access control (admin, manager, operator, viewer).

### Live Mode (default)

When `config.js` is provided with Supabase credentials and `demoMode.enabled` is `false`, the app connects to live Supabase Auth.

### Demo Mode (optional)

Set `demoMode.enabled` to `true` in `config.js` for offline testing without Supabase.

## Configuration

Copy `config.example.js` to `config.js`:

```bash
cp config.example.js config.js
```

Fill in your Supabase credentials:

```js
const config = {
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY',
  features: {
    demoMode: false,   // Set to false for live mode
  },
  demoMode: { enabled: false },
  // ...
};
```

**Never commit `config.js`** — it is gitignored. Only `config.example.js` is committed.

## Run locally

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Open `http://localhost:4173`. Sign in with your Supabase admin credentials.

## Database Schema

Apply the unified schema to your Supabase project:

```sql
-- Run in Supabase SQL Editor
supabase/migrations/20261116000000_unified_system.sql
supabase/migrations/20261116000001_customer_app_rpcs.sql
```

This creates shared tables: `profiles`, `products`, `orders`, `order_items`, `coupons`, `inventory_log`, `rider_profiles`, `rider_shifts`, `rider_tasks`, `audit_log`.

## Edge Functions

Deploy Razorpay payment functions:

```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook
supabase functions deploy finalize-order
```

Set secrets (server-side only):

```bash
supabase secrets set \
  RAZORPAY_KEY_ID='rzp_test_YOUR_KEY' \
  RAZORPAY_KEY_SECRET='YOUR_SECRET' \
  RAZORPAY_WEBHOOK_SECRET='YOUR_SECRET'
```

## Verification

```bash
node --check app.js
node --check auth.js
node tests/smoke.js
node tests/auth_crud.js
```

All tests pass with empty initial state — no demo data is hardcoded.

## Security

- No `service_role` key in browser code
- `config.js` is gitignored
- Razorpay secrets server-side only
- Row Level Security on all tables
- Server-side price and coupon validation
