import React, { useState } from 'react';
import { Vehicle } from '../types/index.ts';
import { BENCHMARK_VEHICLES } from '../data/vehicles.ts';
import { Plus, Trash2, Fuel, Weight, Sparkles } from 'lucide-react';

interface VehicleConfiguratorProps {
  incumbentVehicle: Vehicle;
  candidateVehicles: Vehicle[];
  onSelectIncumbent: (vehicle: Vehicle) => void;
  onAddCandidate: (vehicle: Vehicle) => void;
  onRemoveCandidate: (vehicleId: string) => void;
  isMetric: boolean;
}

export const VehicleConfigurator: React.FC<VehicleConfiguratorProps> = ({
  incumbentVehicle,
  candidateVehicles,
  onSelectIncumbent,
  onAddCandidate,
  onRemoveCandidate,
  isMetric,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const availableCandidates = BENCHMARK_VEHICLES.filter(
    (v) => v.id !== incumbentVehicle.id && !candidateVehicles.some((c) => c.id === v.id)
  );

  return (
    <div className="space-y-3">
      {/* --- Incumbent Baseline Vehicle --- */}
      <div className="bg-surface border border-burn-red/30 rounded-card p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-burn-red"></span>
              <h3 className="text-xs font-semibold tracking-wide text-text-primary uppercase font-mono">
                Incumbent Baseline (Current Car)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-burn-red/10 text-burn-red border border-burn-red/20 font-semibold">
              Sunk Embodied Debt: 0 kg
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <select
                value={incumbentVehicle.id}
                onChange={(e) => {
                  const found = BENCHMARK_VEHICLES.find((v) => v.id === e.target.value);
                  if (found) onSelectIncumbent(found);
                }}
                className="w-full bg-surface-elevated border border-border-subtle rounded-crisp px-2.5 py-1.5 text-text-primary font-mono text-xs focus:outline-none focus:border-burn-red"
              >
                {BENCHMARK_VEHICLES.filter((v) => v.condition === 'incumbent' || v.powertrain === 'ICE').map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Specs Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-surface-elevated/70 border border-border-subtle p-1.5 rounded-crisp">
                <span className="text-[10px] text-text-muted flex items-center space-x-1">
                  <Fuel className="w-3 h-3 text-burn-red" />
                  <span>Fuel Economy</span>
                </span>
                <span className="text-text-primary font-bold text-xs block mt-0.5">
                  {isMetric
                    ? `${(235.215 / (incumbentVehicle.fuelEconomyMpg || 25)).toFixed(1)} L/100km`
                    : `${incumbentVehicle.fuelEconomyMpg} MPG`}
                </span>
              </div>

              <div className="bg-surface-elevated/70 border border-border-subtle p-1.5 rounded-crisp">
                <span className="text-[10px] text-text-muted flex items-center space-x-1">
                  <Weight className="w-3 h-3 text-text-muted" />
                  <span>Curb Weight</span>
                </span>
                <span className="text-text-primary font-bold text-xs block mt-0.5">
                  {isMetric
                    ? `${incumbentVehicle.curbWeightKg.toLocaleString()} kg`
                    : `${Math.round(incumbentVehicle.curbWeightKg * 2.20462).toLocaleString()} lbs`}
                </span>
              </div>

              <div className="bg-surface-elevated/70 border border-border-subtle p-1.5 rounded-crisp">
                <span className="text-[10px] text-text-muted block">Tailpipe Intensity</span>
                <span className="text-burn-red font-bold text-xs block mt-0.5">
                  {Math.round((11267 / (incumbentVehicle.fuelEconomyMpg || 25)) + 18)} g/mi
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-border-subtle/50 text-[10px] font-mono text-text-muted">
          💡 Keeping an existing car has 0 new manufacturing emissions. Replacement only breaks even if the candidate's operational slope is much cleaner.
        </div>
      </div>

      {/* --- Comparison Candidates --- */}
      <div className="bg-surface border border-border-subtle rounded-card p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-green"></span>
              <h3 className="text-xs font-semibold tracking-wide text-text-primary uppercase font-mono">
                Replacement Candidates ({candidateVehicles.length} / 3)
              </h3>
            </div>
            {candidateVehicles.length < 3 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="px-2 py-0.5 rounded-crisp bg-accent-green/15 hover:bg-accent-green/25 border border-accent-green/40 text-accent-green font-mono text-xs transition-colors flex items-center space-x-1 font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Comparison</span>
                </button>

                {showAddMenu && (
                  <div className="absolute right-0 mt-1 w-72 bg-surface-elevated border border-border-subtle rounded-card shadow-xl z-20 p-2 space-y-1 text-xs font-mono">
                    <span className="text-[10px] text-text-muted uppercase px-2 py-1 block border-b border-border-subtle">
                      Select Vehicle to Compare
                    </span>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {availableCandidates.map((candidate) => (
                        <button
                          key={candidate.id}
                          type="button"
                          onClick={() => {
                            onAddCandidate(candidate);
                            setShowAddMenu(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-crisp hover:bg-surface text-text-primary transition-colors flex flex-col"
                        >
                          <span className="font-semibold text-xs">{candidate.name}</span>
                          <span className="text-[10px] text-text-muted">
                            {candidate.powertrain} · {candidate.batteryKwh > 0 ? `${candidate.batteryKwh}kWh` : ''} · ${candidate.purchasePriceUsd.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cards for active comparison candidates */}
          <div className="space-y-2.5">
            {candidateVehicles.map((cand, idx) => {
              const isEV = cand.powertrain === 'BEV';
              const isUsed = cand.condition === 'used';
              const isPHEV = cand.powertrain === 'PHEV';
              const borderColor = idx === 0 ? 'border-accent-green/40' : 'border-candidate-cyan/40';

              return (
                <div
                  key={cand.id}
                  className={`bg-surface-elevated/80 border ${borderColor} rounded-crisp p-2.5 flex flex-col justify-between relative group`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          isEV ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' :
                          isPHEV ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {cand.powertrain} {isUsed ? '• Used' : '• New'}
                        </span>
                        <h4 className="text-xs font-bold text-text-primary font-mono truncate">
                          {cand.name}
                        </h4>
                      </div>
                      {candidateVehicles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveCandidate(cand.id)}
                          className="text-text-muted hover:text-burn-red transition-colors p-0.5"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono my-1.5 pt-1.5 border-t border-border-subtle/50 text-text-muted">
                      <div>
                        <span className="text-[10px] block text-text-muted/70">Efficiency</span>
                        <span className="text-text-primary font-bold">
                          {cand.efficiencyMiPerKwh ? `${cand.efficiencyMiPerKwh} mi/kWh` : `${cand.fuelEconomyMpg} MPG`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] block text-text-muted/70">Battery Pack</span>
                        <span className="text-text-primary font-bold">
                          {cand.batteryKwh > 0 ? `${cand.batteryKwh} kWh` : 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] block text-text-muted/70">{isUsed ? 'Battery SOH' : 'MSRP Cost'}</span>
                        <span className={isUsed ? 'text-debt-amber font-bold' : 'text-text-primary font-bold'}>
                          {isUsed && cand.batteryStateOfHealthPct ? `${cand.batteryStateOfHealthPct}% SOH` : `$${cand.purchasePriceUsd.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-border-subtle/50 text-[10px] font-mono text-text-muted flex justify-between items-center">
                    <span>
                      {isUsed
                        ? '♻️ Glider carbon amortized'
                        : isEV
                        ? `⚡ ~${Math.round(cand.batteryKwh * 80 + (cand.curbWeightKg - cand.batteryKwh * 5.5) * 5.6).toLocaleString()} kg embodied debt`
                        : '⛽ Minimal battery debt'}
                    </span>
                    <span className="text-text-muted font-bold">${cand.purchasePriceUsd.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-border-subtle/60 flex items-center justify-between text-xs font-mono text-text-muted">
          <span>Comparing {candidateVehicles.length} option{candidateVehicles.length > 1 ? 's' : ''} against baseline</span>
          <span className="text-accent-green flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Crossover Active</span>
          </span>
        </div>
      </div>
    </div>
  );
};
