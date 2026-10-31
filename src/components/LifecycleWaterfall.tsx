import React from 'react';
import { LifecycleBreakdown } from '../types/index.ts';
import { Layers, Factory, Battery, Zap, Flame } from 'lucide-react';

interface LifecycleWaterfallProps {
  incumbentBreakdown: LifecycleBreakdown;
  candidateBreakdowns: LifecycleBreakdown[];
  annualMileage: number;
}

export const LifecycleWaterfall: React.FC<LifecycleWaterfallProps> = ({
  incumbentBreakdown,
  candidateBreakdowns,
}) => {
  const allBreakdowns = [incumbentBreakdown, ...candidateBreakdowns];

  return (
    <div className="bg-surface border border-border-subtle rounded-card p-4 space-y-4">
      <div className="border-b border-border-subtle pb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-accent-green" />
          <h3 className="text-sm font-semibold tracking-wide text-text-primary uppercase font-mono">
            10-Year Lifecycle Waterfall Decomposition
          </h3>
        </div>
        <p className="text-xs text-text-muted mt-0.5">
          Step-by-step breakdown across Manufacturing, Battery Pack, Energy Supply Chain, and Tailpipe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBreakdowns.map((vehicle, idx) => {
          const isIncumbent = idx === 0;
          const gliderKg = vehicle.embodiedGliderKg;
          const batteryKg = vehicle.embodiedBatteryKg;
          const tenYearOperKg = vehicle.annualOperationalKg * 10;
          const totalTenYearKg = gliderKg + batteryKg + tenYearOperKg;

          return (
            <div
              key={vehicle.vehicleId}
              className={`p-3.5 rounded-crisp border ${
                isIncumbent
                  ? 'border-burn-red/40 bg-surface-elevated/40'
                  : 'border-border-subtle bg-surface-elevated/70'
              } flex flex-col justify-between text-xs font-mono`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isIncumbent
                        ? 'bg-burn-red/20 text-burn-red'
                        : 'bg-accent-green/20 text-accent-green'
                    }`}
                  >
                    {isIncumbent ? 'Baseline' : `Candidate ${idx}`}
                  </span>
                  <span className="text-text-primary font-bold text-sm">
                    {(totalTenYearKg / 1000).toFixed(1)} t CO₂e
                  </span>
                </div>

                <h4 className="font-bold text-text-primary line-clamp-1 mb-3">
                  {vehicle.vehicleName}
                </h4>

                {/* Stacked Percentage Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-base mb-3 border border-border-subtle">
                  {gliderKg > 0 && (
                    <div
                      style={{ width: `${(gliderKg / totalTenYearKg) * 100}%` }}
                      className="bg-slate-400 hover:opacity-90 transition-all"
                      title={`Glider Mfg: ${(gliderKg / 1000).toFixed(1)} t`}
                    />
                  )}
                  {batteryKg > 0 && (
                    <div
                      style={{ width: `${(batteryKg / totalTenYearKg) * 100}%` }}
                      className="bg-debt-amber hover:opacity-90 transition-all"
                      title={`Battery Pack Mfg: ${(batteryKg / 1000).toFixed(1)} t`}
                    />
                  )}
                  {tenYearOperKg > 0 && (
                    <div
                      style={{ width: `${(tenYearOperKg / totalTenYearKg) * 100}%` }}
                      className={isIncumbent ? 'bg-burn-red' : 'bg-accent-green'}
                      title={`10-Yr Operational: ${(tenYearOperKg / 1000).toFixed(1)} t`}
                    />
                  )}
                </div>

                {/* Granular Breakdown Tiles */}
                <div className="space-y-2 text-[11px] pt-1">
                  <div className="flex items-center justify-between text-text-muted">
                    <span className="flex items-center space-x-1.5">
                      <Factory className="w-3.5 h-3.5 text-slate-400" />
                      <span>Glider Manufacturing:</span>
                    </span>
                    <strong className="text-text-primary">
                      {gliderKg > 0 ? `${(gliderKg / 1000).toFixed(1)} t` : '0 t (Sunk)'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-text-muted">
                    <span className="flex items-center space-x-1.5">
                      <Battery className="w-3.5 h-3.5 text-debt-amber" />
                      <span>Battery Pack Embodied:</span>
                    </span>
                    <strong className="text-debt-amber">
                      {batteryKg > 0 ? `${(batteryKg / 1000).toFixed(1)} t` : '0 t (None)'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-text-muted">
                    <span className="flex items-center space-x-1.5">
                      {vehicle.powertrain === 'ICE' ? (
                        <Flame className="w-3.5 h-3.5 text-burn-red" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-accent-green" />
                      )}
                      <span>10-Yr Operational:</span>
                    </span>
                    <strong className={isIncumbent ? 'text-burn-red' : 'text-accent-green'}>
                      {(tenYearOperKg / 1000).toFixed(1)} t
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-text-muted pt-1 border-t border-border-subtle/40">
                    <span>Operational Intensity:</span>
                    <strong className="text-text-primary">
                      {vehicle.operationalPerMileGrams} g/mi
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-border-subtle/50 text-[10px] text-text-muted">
                {isIncumbent ? (
                  <span className="text-burn-red">Continuous tailpipe & refinery emissions accumulate every mile driven.</span>
                ) : batteryKg > 0 ? (
                  <span>Overcomes upfront battery debt in clean operational phases.</span>
                ) : (
                  <span>High-efficiency hybrid with minimal manufacturing debt.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
