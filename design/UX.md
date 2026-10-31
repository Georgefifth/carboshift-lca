# UX Contract — CarboShift LCA (Truth-in-Lifecycle Vehicle Replacement & Breakeven Engine)

> Acceptance contract for the CarboShift LCA frontend. Implementation must strictly adhere to this contract.

## 1. Product

- **One-liner**: Audit-grade vehicle lifecycle carbon & financial breakeven engine comparing keeping your current car vs. buying a new EV, used EV, or hybrid across localized electric grids.
- **Primary user**: Car owners and prospective buyers evaluating whether trading in an existing gas car for an electric or hybrid vehicle genuinely reduces greenhouse gases given their local power grid, annual mileage, and regional climate.
- **Job to be done**: Calculate the exact cradle-to-grave lifecycle emissions (manufacturing debt + fuel cycle + tailpipe) and Total Cost of Ownership (TCO) to discover the precise "Carbon Breakeven Point" (in months and miles) where a replacement vehicle surpasses the incumbent car.
- **Core success action**: Select current vehicle vs. 1–3 target vehicles, adjust regional grid / zip code and driving sliders, and inspect the real-time Crossover Chart with an exportable scientific audit summary.
- **What the user should never have to guess**:
  1. *Does this include battery manufacturing emissions?* Yes, embodied battery & glider manufacturing emissions (in kg CO₂e) are explicitly itemized upfront as "Embodied Carbon Debt".
  2. *How clean is the electricity powering the EV?* Displayed in exact g CO₂/kWh with selectable regional grids (EPA eGRID 26 subregions, EU member states, or custom g/kWh).
  3. *At what exact month and mileage does the new car break even?* Explicitly pinned on the chart and highlighted in summary metrics (e.g., "Breakeven at Month 23 / 26,800 miles").
  4. *What about winter range loss and battery degradation?* Modeled with transparent climate sliders (ambient temperature & HVAC heat pump penalties) and used vehicle State of Health (SOH) inputs.

---

## 2. Core Flow

| # | Step | User Action | System Feedback | Next Step Obvious? |
|---|---|---|---|---|
| 1 | Baseline Vehicle | Pick incumbent car from presets (e.g., 2016 Honda Civic 32 MPG) or enter custom fuel economy & odometer. | Instant baseline footprint calculated: shows annual tailpipe + refinery emissions ($kg\ CO_2/yr$). | Yes, comparison slots highlighted on the right. |
| 2 | Add Candidates | Click to compare 1 to 3 alternatives: New EV (e.g., Tesla Model 3 / Chevy Bolt), Used EV (e.g., 2019 Leaf 75% SOH), or Hybrid (Prius). | Battery size (kWh), embodied manufacturing carbon ($kg\ CO_2e$), and efficiency ($mi/kWh$ or $MPG$) populated. | Yes, localized grid & commute panel unlocked. |
| 3 | Localize & Tune | Select region/grid (e.g., California CAISO 210 g/kWh vs. Midwest MISO 580 g/kWh vs. Pacific NW 110 g/kWh) and adjust annual miles (e.g., 12,000 mi). | Crossover chart animates; dynamic breakeven intersections compute in < 50ms. Lifecycle waterfall updates. | Yes, breakeven badges and audit breakdown clearly displayed. |
| 4 | Audit & Export | Toggle view tabs: "Crossover Trajectory", "Lifecycle Waterfall", "TCO Economics", or click "Export Audit Report". | Displays scientific breakdown (GREET & eGRID citation) and generates print/PDF audit sheet. | Yes, primary action complete. |

**Target**: ≤ 3 steps and ≤ 45 seconds from landing to the core crossover result.

---

## 3. Pages & Layout Architecture

CarboShift LCA is architected as a focused, high-productivity single-page engineering workbench with 4 primary interactive views:

| View Tab | Purpose | Primary Action | Secondary Actions |
|---|---|---|---|
| **Workbench (Core View)** | Side-by-side vehicle comparison, localized grid selection, and live Crossover Chart. | Adjust driving profile & vehicle selection | Reset to defaults, toggle metric/imperial units |
| **Lifecycle Waterfall** | Deconstructs cumulative emissions into 4 phases: Glider Mfg, Battery Pack, Fuel/Elec Supply, Operational Tailpipe. | Inspect phase carbon breakdown | Compare per-mile lifecycle intensity ($g/mi$) |
| **TCO Economics** | Total Cost of Ownership: upfront cost, fuel/electricity cost, tax credits, and maintenance savings. | Compare 5-year and 10-year financial ROI | Toggle gas price ($/gal) and electric rate ($/kWh) |
| **Audit Methodology** | Full scientific transparency with formulas (GREET, eGRID 2024, EPA), parameter dictionary, and PDF export. | Download / Print Audit Report | Inspect data sources and citations |

---

## 4. Required States

- [x] **Empty / First Visit**: Pre-loads a realistic default scenario (Current 2015 Gas Sedan vs. New Compact EV vs. Used EV) so the screen is immediately instructive and interactive on load.
- [x] **Loading**: Real-time reactive client-side recalculation with subtle pulse indicators on data badges; zero blocking spinners for local calculations.
- [x] **Success**: Dynamic "Carbon Breakeven" banner updates with badge color: Green (Clean Breakeven < 3 years), Amber (Delayed Breakeven 4–7 years), Red / Grey (Never Breaks Even under dirty coal grid / low mileage).
- [x] **Error**: Clear inline error messages if invalid custom inputs (e.g., negative fuel economy or > 200 kWh battery).
- [x] **Invalid Input**: Form fields validate with high-contrast red border, specific bounds notice (e.g., "Annual mileage must be between 500 and 100,000 miles"), and auto-correction.
- [x] **Mobile 390px Layout**: Vertical responsive stack with sticky summary bar at bottom, swipeable candidate cards, and pinch-to-zoom SVG crossover graph.

---

## 5. Design Tokens

- **Font Family**:
  - UI & Headings: `Inter`, `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Metrics, Data, Code, Formulas: `JetBrains Mono`, `ui-monospace, SFMono-Regular, monospace`
- **Typography Scale**:
  - Display: `24px` / `line-height: 1.2` / `font-weight: 700`
  - Section Headings: `16px` / `line-height: 1.3` / `font-weight: 600` / `letter-spacing: -0.01em`
  - Body: `13px` / `line-height: 1.5` / `font-weight: 400`
  - Caption / Data Readout: `11px` / `line-height: 1.4` / `font-weight: 500` / Monospace
- **Spacing Scale**: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`
- **Colors**:
  - Background Base: `#0B0F17` (Deep Obsidian Void)
  - Surface Card: `#131B2A` (Charcoal Slate Workbench)
  - Surface Elevated / Border: `#1F293D` (Precision Technical Stroke)
  - Text Primary: `#F8FAFC` (Pure Titanium White)
  - Text Secondary: `#94A3B8` (Muted Steel Slate)
  - Accent / Carbon Cleantech: `#10B981` (Kinetic Emerald — emission reductions & positive ROI)
  - Warning / Embodied Debt: `#F59E0B` (Amber Oxide — battery manufacturing carbon debt)
  - Tailpipe / Combustion: `#EF4444` (Combustion Crimson — direct ICE emissions)
  - Secondary Candidate: `#38BDF8` (Sky Cyan — candidate comparison trajectory)
- **Radius and Borders**:
  - Border radius: `6px` for cards, `4px` for buttons, inputs, and badges (crisp, precise, industrial feel; avoiding bubbly oversized rounded corners).
  - Borders: `1px solid #1E293B`
- **Touch Target**: All interactive controls, chips, and sliders have a minimum hit target of `44px` on mobile.
- **Icon Style**: Strict 1.5px stroke Lucide vector icons; zero decorative emojis.

---

## 6. References & Patterns

| Reference | What to Borrow | What NOT to Copy |
|---|---|---|
| **MIT Carboncounter** (`carboncounter.com`) | Cradle-to-grave lifecycle boundary model (embodied vehicle + battery + operational). | Outdated non-responsive UI, static pre-rendered dataset, inability to model used vehicles or localized hourly grids. |
| **Electricity Maps** (`electricitymaps.com`) | Clean visual hierarchy for carbon intensity (g CO₂/kWh), color-coded regional status. | Map-centric navigation; we focus on vehicle engineering and crossover breakeven curves. |
| **Argonne GREET Model** | Mathematical formulas for fuel cycle (Well-to-Pump) and vehicle cycle (Vehicle-Cycle). | Complex multi-tab legacy desktop software interface; we synthesize it into an instant consumer-grade web engine. |

---

## 7. Mobile Experience (390px Viewport)

- **Layout Structure**: Single vertical scroll. Top bar features a sticky quick-glance result pill: "Breakeven: Month 22 (24,100 mi) | -3.8 t CO₂e/yr".
- **Controls**: Tabbed switcher for [1. Vehicles] -> [2. Grid & Mileage] -> [3. Crossover Chart] -> [4. Economics].
- **Chart**: Responsive SVG/Canvas chart rendered with touch scrubbing; tooltips display exact coordinates on touch tap.
- **Inputs**: Number steppers and preset chips rather than microscopic numeric textboxes.

---

## 8. Visual Direction (Strict Anti-AI Cliché Enforcement)

- **Three Adjectives**: `Analytical`, `Grounded`, `High-Density`.
- **Product Archetype**: `Engineering Workbench / Scientific Audit Terminal`.
- **Palette Rationale**: Grounded in materials and emissions science: carbon black, industrial slate, combustion crimson, and kinetic emerald. Zero frivolous purple gradients, neon glowing blobs, or glassmorphic blur cards.
- **Type Pairing**: Inter for crystal-clear readability + JetBrains Mono for exact numerical units ($kg\ CO_2e$, $g/mi$, $kWh$, $MPG$).
- **Density**: High-density engineering workbench. Information is organized in clean, border-delimited data tiles with zero wasted whitespace.
- **Signature Visual Element**: **The "Carbon Debt & Crossover Intersection" Chart**:
  - Clearly starts EV trajectories at an elevated Y-intercept representing the **Embodied Manufacturing Carbon Debt** ($M_{battery} + M_{glider}$).
  - Shows the steeper slope of the ICE baseline (continuous combustion + refinery emissions) intersecting the EV trajectory at the exact **Breakeven Horizon**.
  - Includes a visual "Parity Pin" with an animated delta tag.
- **Motion Rules**: Strictly functional state transitions (<150ms). No floating particles, no bouncy hero animations.
- **Rejected Clichés**:
  - No purple/blue gradient backgrounds.
  - No glassmorphic blur cards.
  - No 3-card marketing heroes.
  - No generic KPI dashboards with arbitrary icons.
  - No emojis in UI buttons.
  - No fake marketing claims or buzzwords.

---

## 9. UX Acceptance Criteria

- [ ] A first-time user can grasp the product within 5 seconds from the clear headline, the baseline vs. candidate cards, and the interactive crossover graph.
- [ ] Adjusting any slider (annual miles, electricity grid carbon intensity, gas price) recalculates the breakeven point and updates the visualization in < 50ms with zero page reload.
- [ ] Presets allow 1-click loading of realistic real-world comparisons:
  - *Scenario A: Suburban Commuter* (Keep 2014 Ford F-150 vs. New F-150 Lightning vs. Used Chevy Bolt)
  - *Scenario B: City Compact* (Keep 2016 Honda Civic vs. New Tesla Model 3 vs. Used Nissan Leaf)
  - *Scenario C: Green Grid vs. Dirty Grid Stress Test* (Washington Hydro 65 g/kWh vs. Indiana Coal 720 g/kWh)
- [ ] Every calculation includes full audit transparency: hover/click any metric to see the underlying formula and citation (EPA eGRID, Argonne GREET 2023/2024).
- [ ] Responsive across desktop (1440px) and mobile (390px) without horizontal scrolling or broken elements.
