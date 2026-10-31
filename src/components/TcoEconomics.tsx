import React from 'react';
import { LifecycleBreakdown, BreakevenResult } from '../types/index.ts';
import { DollarSign } from 'lucide-react';

interface TcoEconomicsProps {
  incumbentBreakdown: LifecycleBreakdown;
  candidateBreakdowns: LifecycleBreakdown[];
  breakevenResults: BreakevenResult[];
  annualMileage: number;
}

export const TcoEconomics: React.FC<TcoEconomicsProps> = ({
  incumbentBreakdown,
  candidateBreakdowns,
}) => {
  const allVehicles = [incumbentBreakdown, ...candidateBreakdowns];

  return (
    <div className="bg-surface border border-border-subtle rounded-card p-4 space-y-4">
      <div className="border-b border-border-subtle pb-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-accent-green" />
          <h3 className="text-sm font-semibold tracking-wide text-text-primary uppercase font-mono">
            Total Cost of Ownership (TCO) & Financial Breakeven
          </h3>
        </div>
        <p className="text-xs text-text-muted mt-0.5">
          Evaluating upfront capital investment, clean vehicle tax credits, annual fueling, and maintenance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allVehicles.map((vehicle, idx) => {
          const isIncumbent = idx === 0;
          const fiveYearTco = vehicle.cumulativeTcoByYear[5] || 0;
          const tenYearTco = vehicle.cumulativeTcoByYear[10] || 0;

          const incumbentTenYear = incumbentBreakdown.cumulativeTcoByYear[10] || 0;
          const netSavingsTenYear = incumbentTenYear - tenYearTco;

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
                    {isIncumbent ? 'Incumbent Baseline' : `Candidate ${idx}`}
                  </span>
                  <span className="text-text-primary font-bold text-sm">
                    ${tenYearTco.toLocaleString()}
                  </span>
                </div>

                <h4 className="font-bold text-text-primary line-clamp-1 mb-3">
                  {vehicle.vehicleName}
                </h4>

                <div className="space-y-2 text-[11px] pt-1">
                  <div className="flex justify-between text-text-muted">
                    <span>Net Upfront Cost:</span>
                    <strong className="text-text-primary">
                      ${vehicle.upfrontNetCostUsd.toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex justify-between text-text-muted">
                    <span>Annual Fuel/Power:</span>
                    <strong className={isIncumbent ? 'text-burn-red' : 'text-accent-green'}>
                      ${vehicle.annualFuelCostUsd.toLocaleString()}/yr
                    </strong>
                  </div>

                  <div className="flex justify-between text-text-muted">
                    <span>Annual Maintenance:</span>
                    <strong className="text-text-primary">
                      ${vehicle.annualMaintenanceCostUsd.toLocaleString()}/yr
                    </strong>
                  </div>

                  <div className="flex justify-between text-text-muted pt-1 border-t border-border-subtle/40">
                    <span>5-Year Cumulative TCO:</span>
                    <strong className="text-text-primary">${fiveYearTco.toLocaleString()}</strong>
                  </div>

                  <div className="flex justify-between text-text-muted">
                    <span>10-Year Cumulative TCO:</span>
                    <strong className="text-text-primary">${tenYearTco.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-border-subtle/50 text-[11px]">
                {isIncumbent ? (
                  <span className="text-text-muted">
                    $0 upfront capital, but incurs ${vehicle.annualFuelCostUsd.toLocaleString()}/yr in continuous fuel expense.
                  </span>
                ) : (
                  <div className="flex items-center justify-between font-bold">
                    <span>10-Yr Net Financial ROI:</span>
                    <span className={netSavingsTenYear >= 0 ? 'text-accent-green' : 'text-debt-amber'}>
                      {netSavingsTenYear >= 0
                        ? `+$${netSavingsTenYear.toLocaleString()} Saved`
                        : `-$${Math.abs(netSavingsTenYear).toLocaleString()} Premium`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
