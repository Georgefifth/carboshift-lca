import React from 'react';
import { SimulationParams } from '../types/index.ts';
import { GRID_REGIONS } from '../data/grids.ts';
import { Gauge, Snowflake, DollarSign, MapPin } from 'lucide-react';

interface GridAndCommuteControlsProps {
  params: SimulationParams;
  onChangeParams: (updated: Partial<SimulationParams>) => void;
  selectedGridId: string;
  onSelectGridId: (id: string) => void;
  isMetric: boolean;
}

export const GridAndCommuteControls: React.FC<GridAndCommuteControlsProps> = ({
  params,
  onChangeParams,
  selectedGridId,
  onSelectGridId,
  isMetric,
}) => {
  const currentGrid = GRID_REGIONS.find((g) => g.id === selectedGridId) || GRID_REGIONS[0];

  const handleGridChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    onSelectGridId(id);
    const found = GRID_REGIONS.find((g) => g.id === id);
    if (found) {
      onChangeParams({
        gridCarbonIntensityGkwh: found.carbonIntensityGramsPerKwh,
        electricityCostPerKwh: found.electricityPriceCentsPerKwh / 100,
      });
    }
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 500 && val <= 80000) {
      onChangeParams({ annualMileage: val });
    }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-card p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-accent-green" />
          <h2 className="text-sm font-semibold tracking-wide text-text-primary uppercase font-mono">
            Grid & Commute Parameters
          </h2>
        </div>
        <span className="text-[11px] font-mono text-text-muted">
          Active Grid: <strong className="text-accent-green">{currentGrid.code}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* 1. Regional Electric Grid */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-text-muted font-mono">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-accent-green" />
              <span>Electricity Grid Mix</span>
            </span>
            <span className="text-accent-green font-bold">{params.gridCarbonIntensityGkwh} g CO₂e/kWh</span>
          </label>
          <select
            value={selectedGridId}
            onChange={handleGridChange}
            className="w-full bg-surface-elevated border border-border-subtle rounded-crisp px-2.5 py-2 text-text-primary font-mono focus:outline-none focus:border-accent-green text-xs"
          >
            {GRID_REGIONS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.carbonIntensityGramsPerKwh} g/kWh)
              </option>
            ))}
          </select>
          <p className="text-[10px] text-text-muted truncate font-mono">
            {currentGrid.description}
          </p>
        </div>

        {/* 2. Annual Mileage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-text-muted font-mono">
            <span>Annual Driving Distance</span>
            <span className="text-text-primary font-bold">
              {isMetric
                ? `${Math.round(params.annualMileage * 1.60934).toLocaleString()} km/yr`
                : `${params.annualMileage.toLocaleString()} mi/yr`}
            </span>
          </div>
          <input
            type="range"
            min={3000}
            max={35000}
            step={500}
            value={params.annualMileage}
            onChange={handleMileageChange}
            className="w-full accent-accent-green cursor-pointer h-1.5 bg-surface-elevated rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-text-muted font-mono">
            <span>3,000 mi (Low)</span>
            <span>12,000 (Avg)</span>
            <span>30,000+ (Fleet)</span>
          </div>
        </div>

        {/* 3. Climate & Temperature Impact */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-text-muted font-mono">
            <span className="flex items-center space-x-1">
              <Snowflake className="w-3.5 h-3.5 text-blue-400" />
              <span>Climate & Winter Factor</span>
            </span>
            <span className="text-text-primary font-bold capitalize">
              {params.ambientClimateSeverity.replace('_', ' ')}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(['mild', 'moderate', 'harsh_winter'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChangeParams({ ambientClimateSeverity: level })}
                className={`py-1.5 rounded-crisp font-mono text-[11px] capitalize border transition-colors ${
                  params.ambientClimateSeverity === level
                    ? 'bg-accent-green/20 border-accent-green text-accent-green font-semibold'
                    : 'bg-surface-elevated border-border-subtle text-text-muted hover:text-text-primary'
                }`}
              >
                {level === 'harsh_winter' ? 'Harsh' : level}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-text-muted font-mono">
            {params.ambientClimateSeverity === 'harsh_winter'
              ? '+25% HVAC heat pump load & battery resistance'
              : params.ambientClimateSeverity === 'moderate'
              ? '+12% seasonal cabin cooling/heating'
              : 'Optimal ~70°F battery temperature range'}
          </p>
        </div>

        {/* 4. Energy Economics (Gas vs Power Rate) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-text-muted font-mono">
            <span className="flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5 text-debt-amber" />
              <span>Fuel & Electricity Rates</span>
            </span>
            <span className="text-text-primary font-bold">
              ${params.gasolinePricePerGallon.toFixed(2)}/gal | ${(params.electricityCostPerKwh * 100).toFixed(1)}¢/kWh
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-text-muted font-mono block">Gasoline ($/gal)</span>
              <input
                type="number"
                step="0.05"
                min="1.50"
                max="8.00"
                value={params.gasolinePricePerGallon}
                onChange={(e) => onChangeParams({ gasolinePricePerGallon: Math.max(1, Number(e.target.value)) })}
                className="w-full bg-surface-elevated border border-border-subtle rounded-crisp px-2 py-1 text-text-primary font-mono text-xs focus:outline-none focus:border-accent-green"
              />
            </div>
            <div>
              <span className="text-[10px] text-text-muted font-mono block">Electric ($/kWh)</span>
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="0.80"
                value={params.electricityCostPerKwh}
                onChange={(e) => onChangeParams({ electricityCostPerKwh: Math.max(0.01, Number(e.target.value)) })}
                className="w-full bg-surface-elevated border border-border-subtle rounded-crisp px-2 py-1 text-text-primary font-mono text-xs focus:outline-none focus:border-accent-green"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-text-muted font-mono">Clean Vehicle Tax Credit:</span>
            <button
              type="button"
              onClick={() => onChangeParams({ taxCreditUsd: params.taxCreditUsd > 0 ? 0 : 7500 })}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-crisp border ${
                params.taxCreditUsd > 0
                  ? 'bg-accent-green/20 border-accent-green text-accent-green font-semibold'
                  : 'bg-surface-elevated border-border-subtle text-text-muted'
              }`}
            >
              {params.taxCreditUsd > 0 ? 'IRA $7,500 Active' : 'No Credit ($0)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
