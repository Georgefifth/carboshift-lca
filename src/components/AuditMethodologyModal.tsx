import React from 'react';
import { X, ShieldCheck, ExternalLink, BookOpen, Calculator, Database } from 'lucide-react';

interface AuditMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditMethodologyModal: React.FC<AuditMethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface border border-border-subtle rounded-card w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-xs font-mono space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-crisp bg-accent-green/10 border border-accent-green/30 flex items-center justify-center text-accent-green">
              <ShieldCheck className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary tracking-tight">
                CarboShift Scientific Audit & Methodology
              </h2>
              <p className="text-xs text-text-muted">
                Mathematical formulations, system boundaries, and verified emission factors.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-crisp hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Cradle-to-Grave Boundary */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-accent-green font-bold text-sm">
            <Calculator className="w-4 h-4" />
            <h3>1. Cradle-to-Grave System Boundary & Formulas</h3>
          </div>
          <p className="text-text-muted leading-relaxed">
            Unlike simplistic calculators that examine only direct tailpipe emissions or purchase price, CarboShift LCA solves the full lifecycle energy and emissions balance over an amortized vehicle lifetime ($d$ miles):
          </p>
          <div className="p-3 rounded-crisp bg-surface-elevated border border-border-subtle text-text-primary space-y-2">
            <div className="font-bold text-accent-green">
              Cumulative Emissions: E(d) = M_glider + M_battery + d × [ e_fuel(grid, climate) + e_maint ]
            </div>
            <div className="text-[11px] text-text-muted space-y-1">
              <div>• <strong>M_glider</strong>: Vehicle body manufacturing (steel/aluminum) = GliderWeight × 5.6 kg CO₂e/kg. For incumbent vehicles already produced, M_glider = 0 (sunk capital).</div>
              <div>• <strong>M_battery</strong>: Pack manufacturing = Capacity (kWh) × BatteryFactor (NMC: 88 kg/kWh, LFP: 68 kg/kWh, NCA: 85 kg/kWh).</div>
              <div>• <strong>e_fuel (Gasoline)</strong>: Well-to-Pump refinery (2.38 kg/gal) + Pump-to-Wheel combustion (8.887 kg/gal) = 11.267 kg CO₂e / gal (11,267 g/gal).</div>
              <div>• <strong>e_fuel (Electricity)</strong>: [ GridIntensity (g/kWh) × 1.052 (T&D Loss) × ClimateFactor ] / Efficiency (mi/kWh).</div>
              <div>• <strong>e_maint</strong>: Non-exhaust tire wear, brake pad dust, fluids = 18 g/mi (ICE) vs. 8.5 g/mi (BEV with regen braking).</div>
            </div>
          </div>
        </div>

        {/* 2. Crossover Breakeven Solver */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-accent-green font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <h3>2. Carbon Breakeven Solver Formulation</h3>
          </div>
          <p className="text-text-muted leading-relaxed">
            The exact Carbon Crossover Mileage ($m^*$) where a cleaner candidate surpasses an incumbent vehicle:
          </p>
          <div className="p-3 rounded-crisp bg-surface-elevated border border-border-subtle text-text-primary space-y-1">
            <div className="font-bold text-accent-green">
              m* = (M_candidate,embodied - M_incumbent,embodied) / (e_incumbent,oper - e_candidate,oper)
            </div>
            <div className="text-[11px] text-text-muted">
              Crossover Time (Months) = [ m* / AnnualMiles ] × 12. If candidate operational emissions exceed the incumbent (e.g. charging a low-efficiency electric truck on an unmitigated coal grid), the denominator is negative and the system outputs "No Payoff".
            </div>
          </div>
        </div>

        {/* 3. Citations & References */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-accent-green font-bold text-sm">
            <Database className="w-4 h-4" />
            <h3>3. Public Scientific Data Sources</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <a
              href="https://greet.es.anl.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-crisp bg-surface-elevated border border-border-subtle hover:border-accent-green transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-text-primary block">Argonne National Laboratory GREET</strong>
                <span className="text-text-muted">Lifecycle Vehicle & Battery Cycle Model</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-accent-green shrink-0" />
            </a>

            <a
              href="https://www.epa.gov/egrid"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-crisp bg-surface-elevated border border-border-subtle hover:border-accent-green transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-text-primary block">US EPA eGRID 2024 Release</strong>
                <span className="text-text-muted">Subregional electricity carbon factors</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-accent-green shrink-0" />
            </a>

            <a
              href="https://www.fueleconomy.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-crisp bg-surface-elevated border border-border-subtle hover:border-accent-green transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-text-primary block">US DOE Fueleconomy.gov</strong>
                <span className="text-text-muted">Official EPA Fuel Economy and MPGe ratings</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-accent-green shrink-0" />
            </a>

            <a
              href="https://www.ipcc.ch/report/ar6/wg3/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-crisp bg-surface-elevated border border-border-subtle hover:border-accent-green transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-text-primary block">IPCC Sixth Assessment (AR6)</strong>
                <span className="text-text-muted">Mitigation of Climate Change: Transport</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-accent-green shrink-0" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-border-subtle flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-crisp bg-accent-green text-base font-bold hover:bg-accent-green/90 transition-colors"
          >
            Close Audit Spec
          </button>
        </div>
      </div>
    </div>
  );
};
