---
name: Fresh Harvest Ops
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  metric-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.02em
  metric-mono-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  metric-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system delivers a high-density, mission-critical operational workspace engineered specifically for fresh produce supply chains, cold-storage logistics, and high-velocity B2B fulfillment. The personality is crisp, methodical, and vibrantly biological—balancing the vitality of fresh agricultural commerce with the precision of an enterprise logistics operating system.

### Style Archetype: Precision Modernist SaaS
The visual direction fuses airy modern utility with structured, dense data display:
- **Atmosphere:** Clean, sunlit cold-chain facilities. Ultra-crisp whites, subtle cool slate structural dividers, and saturated chlorophyll greens paired with technical logistics blues.
- **Tone & Mood:** Decisive, hyper-accurate, low-latency, and hygienic. Every pixel conveys freshness, traceability, and operational agility.
- **Visual Weight:** Ultra-thin border definitions, gentle light diffusion, and generous contrast for high readability under diverse operational conditions (warehouse floor tablets, dispatch hubs, and buyer desktop suites).

## Colors

The palette leverages high-contrast functional color assignments designed to minimize cognitive load across complex SKU picking, batch tracking, and delivery timelines.

### Functional Palette Structure
- **Primary (Vibrant Emerald / #059669 - #10B981):** Represents inventory vitality, active harvest batches, validated fulfillments, and primary conversion states.
- **Secondary (Logistics Sapphire / #2563EB - #1D4ED8):** Anchors operational routing, dispatch assignments, analytics, and fleet telemetry.
- **Status & Triage Accents:**
  - *Warning / Perishable Risk (Harvest Amber / #F59E0B):* Used for threshold expiry, low-stock warnings, and pending cross-dock verifications.
  - *Critical / Spoilage (Crimson / #EF4444):* Flags cold-chain temperature breaches, expired produce, cancelled routes, and zero-inventory exceptions.
- **Neutrals & Canvas:**
  - *Canvas Background:* Clean Cool Slate (`#F8FAFC`).
  - *Surface Containers:* Pure Pristine White (`#FFFFFF`).
  - *Dividers & Borders:* Crisp Slate (`#E2E8F0`).
  - *Text & Glyphs:* High-contrast Deep Charcoal (`#0F172A`) for primary hierarchy and Slate Slate (`#334155`) for secondary metadata.

## Typography

The typographic hierarchy is split intentionally into three distinct functional tools:
- **Plus Jakarta Sans** introduces warmth, crisp geometric confidence, and legibility to major views, page headers, modal titles, and system modules.
- **Inter** acts as the high-efficiency workhorse for deep data grids, complex order manifests, dense input fields, and multi-layered logistics instructions.
- **JetBrains Mono** is strictly reserved for quantitative metrics: SKU IDs, lot tracking numbers, temperature sensors (`+3.4°C`), tare weights (`kg`), and currency sums. This ensures rapid scanning and zero horizontal layout drift when metric values fluctuate in real-time streams.

## Layout & Spacing

This design system uses a fluid 12-column grid layout paired with responsive edge margins and component density controls to accommodate data-heavy warehouse dispatching and procurement matrices.

### Responsive Breakpoints & Margin Architecture
- **Desktop (≥ 1280px):** 12 columns, 1.5rem (`gutter-lg`) gutters, and 2rem (`margin-lg`) canvas margins. Max layout viewport width is capped at 1680px for wide screens to avoid scan fatigue across tabular rows.
- **Tablet / Rugged Floor Terminals (768px – 1279px):** 8 columns, 1rem (`gutter`) gutters, 1.5rem (`margin-md`) screen boundaries. Tables switch to sticky column horizontal panning.
- **Handheld Dispatch (≤ 767px):** 4 columns, 0.75rem gutters, and 1rem (`margin`) canvas margins. Multi-column metric cards stack into unified vertical list modules.

### Internal Spacing Rhythm
- Compact internal cell padding uses `space-xs` and `space-sm` for dense tables.
- Card interiors and modular control surfaces maintain a strict `space-md` or `space-lg` boundary to preserve airiness and distinct compartmentalization.

## Elevation & Depth

Visual hierarchy does not rely on heavy drop shadows; instead, it utilizes a combination of pristine white surface elevation, low-contrast slate outlines, and subtle ambient diffusion to maintain clean enterprise clarity.

### Depth Tiers
- **Tier 0 (Canvas Base):** Background wash (`#F8FAFC`). Completely flat, absorbing negative space.
- **Tier 1 (Surface Cards & Grids):** Pure white container (`#FFFFFF`) with a 1px uniform perimeter border of `#E2E8F0`. Features a faint ambient elevation: `0 1px 3px 0 rgba(15, 23, 42, 0.04)`.
- **Tier 2 (Popovers, Dropdowns, Hovered Items):** Elevated modules feature `#FFFFFF` fill, 1px border of `#CBD5E1`, and a crisp elevation: `0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`.
- **Tier 3 (Modals, Overlays, Urgent Alerts):** Floating high-priority overlays supported by a 30% tinted slate back-scrim (`rgba(15, 23, 42, 0.4)` with 4px backdrop blur) and a structured shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 10px 10px -5px rgba(15, 23, 42, 0.04)`.

## Shapes

The design system establishes a controlled curvature standard:
- **Base Components (Inputs, Buttons, Cells, Table Rows):** Standard 0.5rem (`roundedness: 2`) border radius provides approachable ergonomics without wasting horizontal real estate.
- **Primary Structural Containers (Cards, Dashboards, Summary Bins):** Apply `rounded-xl` (1rem to 1.5rem) to soften broad perimeter lines and create organized modular islands.
- **Status Pills, Badges, & Toggles:** Fully curved pill geometries (`9999px`) provide contrast against rectangular cards and tabular data blocks.

## Components

### Buttons
- **Primary Action (Emerald):** Solid `#059669` background with `#FFFFFF` text. Hover transitions to `#047857`. Focus ring: 2px offset with `#10B981`.
- **Secondary Logistics (Sapphire):** Solid `#2563EB` background with `#FFFFFF` text. Ideal for batch dispatches, manifest exports, and route optimizers.
- **Tertiary / Ghost:** Border of 1px `#E2E8F0` on `#FFFFFF`, text `#334155`. Hover transitions to `#F1F5F9`.
- **Destructive:** Light crimson fill `#FEF2F2` with `#DC2626` text and 1px border of `#FCA5A5` for non-critical confirmations; full `#EF4444` fill for irreversible purge actions.

### Badges & Status Chips
- Rendered in pill shape (`rounded-full`) with compact padding (`2px 8px`). Text is `label-md` uppercase or bold tracking.
- **Fresh / In-Stock:** Background `#ECFDF5`, text `#065F46`, left-aligned 6px dot `#10B981`.
- **Dispatching / Active Route:** Background `#EFF6FF`, text `#1E40AF`, left-aligned 6px dot `#3B82F6`.
- **Perishable Warning / Low Reserve:** Background `#FFFBEB`, text `#92400E`, left-aligned 6px dot `#F59E0B`.
- **Spoilage / Out-of-Stock:** Background `#FEF2F2`, text `#991B1B`, left-aligned 6px dot `#EF4444`.

### Data Grids & Lists
- Table headers use uppercase `label-md` on `#F8FAFC` background with a crisp bottom border of 1px `#E2E8F0`.
- Cells are padded with `space-sm` vertically for high information density. 
- Alternating row zebra banding is omitted in favor of a hover highlight (`#F8FAFC`) across the entire row.
- SKU identifiers and batch numbers utilize `metric-mono-sm` for instant scanability.

### Input Fields & Controls
- **Form Controls:** Background `#FFFFFF`, 1px border `#E2E8F0`, inner padding `0.5rem 0.75rem`. Placeholder text is `#94A3B8`.
- **Active / Focused:** Border transitions to `#059669` with a subtle box-shadow ring (`0 0 0 3px rgba(16, 185, 129, 0.15)`).
- **Checkboxes & Radios:** Emerald check states (`#059669`) with high-contrast white ticks. Rounded-sm (4px) for checkboxes, circular for radios.

### Cards & Metric Panels
- Base card: White background, 1px border `#E2E8F0`, rounded-xl (`1rem`).
- Internal layout: Top section houses clear category labeling with an optional quick-action menu; middle section displays high-contrast `metric-mono-lg` counts (e.g., total crates, active refrigerated trucks); footer includes delta tracking indicators with green/crimson delta chevrons.

### Domain-Specific Components
- **Produce Freshness Indicator:** Multi-segmented micro-bar showing cold-chain shelf-life estimation (Green -> Amber -> Red).
- **Lot & SKU Traceability Tag:** Monospace badge pairing a QR scan trigger with harvest batch metadata (`JetBrains Mono`, bordered slate tag).