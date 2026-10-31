import React from 'react';
import { Layers } from 'lucide-react';

export interface PresetScenario {
  id: string;
  name: string;
  tagline: string;
  incumbentId: string;
  candidateIds: string[];
  gridId: string;
  annualMileage: number;
  climate: 'mild' | 'moderate' | 'harsh_winter';
  gasPrice: number;
  taxCredit: number;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'suburban_compact',
    name: '1. Suburban Commuter',
    tagline: '2016 Civic vs Model 3 RWD vs Used Leaf (CAISO 215 g/kWh)',
    incumbentId: 'incumbent_civic',
    candidateIds: ['new_tesla_m3_rwd', 'used_leaf_2018'],
    gridId: 'camx',
    annualMileage: 13500,
    climate: 'mild',
    gasPrice: 4.15,
    taxCredit: 7500,
  },
  {
    id: 'truck_replacement',
    name: '2. High-Carbon Truck Trade',
    tagline: '2014 F-150 V8 vs F-150 Lightning vs Used Bolt (US-AVG 372 g/kWh)',
    incumbentId: 'incumbent_f150',
    candidateIds: ['new_f150_lightning', 'used_leaf_2018'],
    gridId: 'us_avg',
    annualMileage: 15000,
    climate: 'moderate',
    gasPrice: 3.65,
    taxCredit: 7500,
  },
  {
    id: 'coal_grid_stress',
    name: '3. Coal Grid Stress Test',
    tagline: 'Midwest MISO (560 g/kWh): 57 MPG Prius HEV vs 77kWh Ioniq 5',
    incumbentId: 'incumbent_rav4_gas',
    candidateIds: ['new_prius_hybrid', 'new_ioniq5_awd'],
    gridId: 'miso',
    annualMileage: 11000,
    climate: 'harsh_winter',
    gasPrice: 3.40,
    taxCredit: 7500,
  },
  {
    id: 'clean_hydro_rapid',
    name: '4. Clean Hydro Super-Shift',
    tagline: 'Pacific Northwest (112 g/kWh): Rapid 14-month breakeven',
    incumbentId: 'incumbent_bmw3',
    candidateIds: ['new_chevy_bolt_ev', 'used_tesla_m3_2019'],
    gridId: 'nwpp',
    annualMileage: 12000,
    climate: 'moderate',
    gasPrice: 3.90,
    taxCredit: 7500,
  },
];

interface ScenarioPresetsProps {
  activePresetId: string | null;
  onSelectPreset: (preset: PresetScenario) => void;
}

export const ScenarioPresets: React.FC<ScenarioPresetsProps> = ({
  activePresetId,
  onSelectPreset,
}) => {
  return (
    <div className="bg-surface border-b border-border-subtle px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs font-mono text-text-muted shrink-0">
          <Layers className="w-3.5 h-3.5 text-accent-green" />
          <span className="uppercase tracking-wider font-semibold">Benchmark Scenarios:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {PRESET_SCENARIOS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`text-xs px-3 py-1.5 rounded-crisp font-mono text-left whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-accent-green/15 border-accent-green text-accent-green font-semibold shadow-sm'
                    : 'bg-surface-elevated/70 hover:bg-surface-elevated border-border-subtle text-text-muted hover:text-text-primary'
                }`}
                title={preset.tagline}
              >
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
