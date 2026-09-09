---
name: Clinical Precision System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e4850'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7881'
  outline-variant: '#bec8d2'
  surface-tint: '#006591'
  primary: '#006591'
  on-primary: '#ffffff'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#89ceff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#d88a00'
  on-tertiary-container: '#4a2c00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  max-width: 1440px
---

## Brand & Style

The design system is engineered for **DiagConnect**, a diagnostic platform where clarity saves lives. The brand personality is rooted in **Clinical Precision**—it is professional, trustworthy, and efficient, yet remains approachable to reduce patient anxiety.

The visual style follows a **Modern Corporate** aesthetic with a heavy emphasis on **Functional Minimalism**. Every element is designed to facilitate quick data scanning and reduce cognitive load. We use generous whitespace, a systematic grid, and subtle depth to guide the user through complex medical data without overwhelming them. The emotional response should be one of "calm confidence"—a feeling that the data is accurate, secure, and easily understood.

## Colors

The palette is anchored by **Vital Blue**, chosen for its associations with technology and medical trust. 

- **Vital Blue (Primary):** Used for primary actions, active states, and branding.
- **Health Green (Success):** Reserved specifically for "Normal" results, completed tests, and positive confirmations.
- **Alert Amber (Warning):** Denotes pending items, "Borderline" results, or actions requiring attention.
- **Critical Red (#ef4444):** Used sparingly for urgent findings or system errors.
- **Neutrals:** A range of cool grays (Slate) provides the structural framework, ensuring that the functional colors stand out against the high-clarity white surfaces.

## Typography

This design system utilizes a dual-font strategy to balance character with utility. 

**Plus Jakarta Sans** is used for headlines. Its slightly rounded, open apertures provide an approachable, modern feel to the platform’s structure. **Inter** is the workhorse for all body text, data tables, and labels. Its high x-height and exceptional legibility make it ideal for reading diagnostic values and technical reports.

For tabular data, ensure `font-variant-numeric: tabular-nums` is applied to Inter to keep medical values aligned and easy to compare.

## Layout & Spacing

The layout uses a **Fixed Grid** model on desktop to maintain information density and prevent line lengths from becoming unreadable.

- **Desktop (1440px):** 12-column grid, 24px gutters, 40px side margins.
- **Tablet (768px):** 8-column grid, 16px gutters, 24px side margins.
- **Mobile (375px):** 4-column grid, 16px gutters, 16px side margins.

We employ an 8pt spacing system for vertical rhythm. "Breathable" padding is applied to containers (24px - 32px) to ensure medical data does not feel cramped, which helps in maintaining a calm user experience.

## Elevation & Depth

To maintain a "clinical" look, this design system avoids heavy shadows. Instead, it uses **Tonal Layers** combined with **Low-Contrast Outlines**.

1.  **Level 0 (Background):** #f8fafc (Cool Gray-Blue) – Provides a soft contrast for white cards.
2.  **Level 1 (Default Surface):** White (#ffffff) with a 1px border of #e2e8f0.
3.  **Level 2 (Active/Floating):** White with a soft, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`. Used for cards containing primary patient data.
4.  **Level 3 (Overlays/Modals):** High-diffusion shadow with a subtle tint of the primary color to ground the element.

This approach creates a sense of "layered clarity" rather than physical weight.

## Shapes

The shape language is **Rounded**, reflecting the "approachable" aspect of the brand. 

- **Standard Elements:** 0.5rem (8px) radius for buttons, input fields, and small cards.
- **Large Containers:** 1rem (16px) radius for main content dashboards and modal windows.
- **Interactive Feedback:** Focus states should use a 2px offset ring in Vital Blue to ensure accessibility.

Rounded corners soften the technical nature of medical data, making the software feel more like a helpful tool and less like an intimidating institutional machine.

## Components

### Buttons
- **Primary:** Vital Blue background, White text. High-contrast, 8px corner radius.
- **Secondary:** White background, 1px Vital Blue border, Vital Blue text.
- **Ghost:** No border or background; Vital Blue text. Used for less frequent actions.

### Cards
Cards are the primary container for diagnostic results. They feature a white background, a light border (#e2e8f0), and 16px internal padding. For urgent results, a 4px colored "accent bar" is added to the left edge (e.g., Critical Red).

### Status Chips
Used for result status (Normal, Pending, Critical). Chips use a "Tinted" style: a 10% opacity background of the status color with 100% opacity text of the same color for high readability without visual noise.

### Input Fields
Strictly rectangular with 8px rounded corners. Labels are always positioned above the field in `label-md` (Inter SemiBold). Active states use a Vital Blue border.

### Data Tables
Tables are the heart of the platform. They use no vertical borders, only horizontal dividers (#f1f5f9). Rows have a hover state of #f8fafc. Critical values are highlighted with a bold weight and the appropriate status color.