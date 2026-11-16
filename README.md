# FreshGrocer Ops Core — admin panel

A responsive, offline-ready admin UI implemented from the supplied Stitch design package. The five detailed reference screens are preserved under `design-reference/`; their images, fonts, and icons are bundled locally so the preview does not depend on a CDN.

## Screens implemented

- Executive operations and sales dashboard
- Vegetable catalog and variant manager
- Live orders and dispatch pipeline
- Stock, cold-chain, replenishment, and wastage
- Rider fleet and shift management

The navigation also includes Customer Directory, Promotions & Banners, Payments & P&L, and Store & Admin Settings. Those modules are clearly marked as sample/preview content where the supplied Stitch ZIP did not include a detailed screen.

## Authentication

The panel supports Supabase email/password authentication with role-based access control (admin, manager, operator, viewer). In demo mode, any email and password will sign in as a demo admin.

### Demo mode (default)

When no `config.js` is provided or `demoMode.enabled` is `true`, the app auto-signs in a demo user. A visible "DEMO · Local sample data" label appears in the header. No credentials are required — any email/password combination works.

### Live mode (Supabase)

1. Copy `config.example.js` to `config.js`:
   ```bash
   cp config.example.js config.js
   ```
2. Fill in your Supabase project URL and public anon key:
   ```js
   supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
   supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY',
   ```
3. Set `demoMode.enabled` to `false` in `config.js`.
4. Never commit `config.js` with real secrets. Never put a Supabase service-role key in browser code.

### Roles and permissions

| Role | Capabilities |
|------|-------------|
| admin | Full access: catalog, orders, inventory, riders, customers, promotions, finance, settings |
| manager | Catalog, orders, inventory, promotions, finance; read riders/customers; no settings write |
| operator | Read catalog/inventory/riders/customers/finance; write orders; adjust inventory |
| viewer | Read-only access to all modules |

Role permissions are enforced in the UI and must also be enforced server-side before enabling live writes.

## Run locally

No package installation is needed. From this folder, run:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open `http://localhost:4173` in a browser. In a hosted preview, use the preview URL provided by the environment.

## Configuration (`config.js`)

Create `config.js` from `config.example.js`. Allowed keys:

| Key | Type | Description |
|-----|------|-------------|
| `supabaseUrl` | string | Supabase project URL (live mode only) |
| `supabaseAnonKey` | string | Supabase public anon key (live mode only, browser-safe) |
| `appName` | string | Application display name |
| `appVersion` | string | Application version |
| `features.demoMode` | boolean | Show demo mode banner and allow demo sign-in |
| `features.enableRefunds` | boolean | Requires secure payment service before enabling |
| `features.enableLiveLocation` | boolean | Requires rider GPS integration |
| `features.enableEmailNotifications` | boolean | Requires SMTP/email provider |

## Demo data and integration boundary

This is a local UI prototype, not a production-connected admin system. Product, order, inventory, rider, and campaign records are sample data stored in this browser's `localStorage`. A visible demo label is present in the header. The panel has no authentication, Supabase connection, customer messaging, SMS, GPS, supplier PO transmission, payment/refund integration, or live sensor feed unless `config.js` connects to Supabase. UI actions that would contact an external system are intentionally simulated or disabled with an explanation.

Before production, connect a server-side API with authenticated operator sessions and role-based authorization. Enforce authorization and validation in the backend/database; never expose a service-role key in browser code. Review the data model and operational permissions before enabling catalog, dispatch, finance, customer, or rider writes.

## Security boundaries

- **No privileged credentials in browser code**: Only Supabase URL and anon key belong in `config.js`. Never include service-role keys, Razorpay secrets, or payment secrets.
- **Demo mode is clearly labeled**: Fixture metrics, customers, payments, rider locations, or sensor readings are never presented as live.
- **No seeded marketplace data**: All records are local demo samples.
- **Razorpay test mode only**: If payment integration is added, reject non-test config server-side; key ID must begin `rzp_test_`; secrets server-side only.
- **Order prices and coupon eligibility recalculated server-side**: Never trust client totals.
- **Courier/rider tracking disabled**: Until a real fulfilment data source is connected.
- **Draft customer receipts only**: No GST/tax invoice claims; no invented seller/tax details.

## Verification

```bash
node --check app.js      # Syntax check
node tests/smoke.js      # Smoke tests (routes, modals, inventory, orders)
```

## Design source

The original per-screen Stitch `code.html`, `screen.png`, and `DESIGN.md` files are retained in `design-reference/`. The app uses bundled Inter, Plus Jakarta Sans, and JetBrains Mono font files and the supplied public Stitch image assets.
