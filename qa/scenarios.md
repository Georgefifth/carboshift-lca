# QA Test Scenarios — CarboShift LCA

## Test Matrix

| ID | Priority | Scenario | Description |
|---|:---:|---|---|
| `smoke` | **P0** | Landing Page Usability | Page loads with title, renders header, benchmark presets, KPI cards, and SVG chart without horizontal overflow. |
| `core-flow` | **P0** | End-to-End Vehicle Comparison & Breakeven | User modifies incumbent baseline, adds candidate EV/Hybrid, adjusts annual mileage & grid, and asserts reactive breakeven update. |
| `scenario-presets` | **P0** | Benchmark Presets Navigation | User cycles through all 4 presets (Suburban Commuter, Truck Trade, Coal Grid Stress, Clean Hydro) and verifies accurate state transition. |
| `tabs-deepdive` | **P1** | Multi-View Waterfall & Economics | User switches across View 1 (Crossover Trajectory), View 2 (10-Yr Lifecycle Waterfall), and View 3 (TCO Economics). |
| `scientific-audit` | **P1** | Scientific Audit & Citations Modal | User opens the scientific audit modal, verifies ANL GREET / EPA eGRID formulas and links, and closes modal. |
| `units-toggle` | **P1** | Imperial vs. Metric System | Toggles between Imperial (`mi / MPG / $ / gal`) and Metric (`km / L/100km / € / L`), asserting unit conversions. |
| `parameter-tuning` | **P1** | Dynamic Parameter Tuning | Adjusts gas price, electricity rate, winter climate factor, and verifies immediate recalculation. |
| `responsive-mobile` | **P0** | Mobile 390px Usability | Verifies that all touch targets, selectors, and charts fit within 390px viewport without clipping. |
