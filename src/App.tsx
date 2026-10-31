import { useState, useMemo } from 'react';
import { Vehicle, SimulationParams } from './types/index.ts';
import { BENCHMARK_VEHICLES } from './data/vehicles.ts';
import { GRID_REGIONS } from './data/grids.ts';
import { calculateLifecycleBreakdown, computeBreakeven } from './models/lifecycleCalculator.ts';
import { Header } from './components/Header.tsx';
import { ScenarioPresets, PRESET_SCENARIOS, PresetScenario } from './components/ScenarioPresets.tsx';
import { GridAndCommuteControls } from './components/GridAndCommuteControls.tsx';
import { VehicleConfigurator } from './components/VehicleConfigurator.tsx';
import { CrossoverChart } from './components/CrossoverChart.tsx';
import { LifecycleWaterfall } from './components/LifecycleWaterfall.tsx';
import { TcoEconomics } from './components/TcoEconomics.tsx';
import { AuditMethodologyModal } from './components/AuditMethodologyModal.tsx';
import { Target, Layers, DollarSign, Leaf, Zap } from 'lucide-react';

export function App() {
  const defaultScenario = PRESET_SCENARIOS[0];
  const [activePresetId, setActivePresetId] = useState<string | null>(defaultScenario.id);

  const [incumbentVehicle, setIncumbentVehicle] = useState<Vehicle>(
    BENCHMARK_VEHICLES.find((v) => v.id === defaultScenario.incumbentId) || BENCHMARK_VEHICLES[0]
  );

  const [candidateVehicles, setCandidateVehicles] = useState<Vehicle[]>(
    defaultScenario.candidateIds
      .map((id) => BENCHMARK_VEHICLES.find((v) => v.id === id))
      .filter((v): v is Vehicle => v !== undefined)
  );

  const [selectedGridId, setSelectedGridId] = useState<string>(defaultScenario.gridId);

  const currentGrid = GRID_REGIONS.find((g) => g.id === selectedGridId) || GRID_REGIONS[0];

  const [params, setParams] = useState<SimulationParams>({
    annualMileage: defaultScenario.annualMileage,
    analysisYears: 10,
    gridCarbonIntensityGkwh: currentGrid.carbonIntensityGramsPerKwh,
    electricityCostPerKwh: currentGrid.electricityPriceCentsPerKwh / 100,
    gasolinePricePerGallon: defaultScenario.gasPrice,
    ambientClimateSeverity: defaultScenario.climate,
    taxCreditUsd: defaultScenario.taxCredit,
  });

  const [activeTab, setActiveTab] = useState<'crossover' | 'waterfall' | 'economics'>('crossover');
  const [isMetric, setIsMetric] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Pure Reactive Calculation (< 5ms)
  const incumbentBreakdown = useMemo(() => {
    return calculateLifecycleBreakdown(incumbentVehicle, params);
  }, [incumbentVehicle, params]);

  const candidateBreakdowns = useMemo(() => {
    return candidateVehicles.map((cand) => calculateLifecycleBreakdown(cand, params));
  }, [candidateVehicles, params]);

  const breakevenResults = useMemo(() => {
    return candidateBreakdowns.map((candBreakdown) =>
      computeBreakeven(incumbentBreakdown, candBreakdown, params.annualMileage)
    );
  }, [incumbentBreakdown, candidateBreakdowns, params.annualMileage]);

  // Handlers
  const handleSelectPreset = (preset: PresetScenario) => {
    setActivePresetId(preset.id);
    const inc = BENCHMARK_VEHICLES.find((v) => v.id === preset.incumbentId);
    if (inc) setIncumbentVehicle(inc);

    const cands = preset.candidateIds
      .map((id) => BENCHMARK_VEHICLES.find((v) => v.id === id))
      .filter((v): v is Vehicle => v !== undefined);
    setCandidateVehicles(cands);

    setSelectedGridId(preset.gridId);
    const grid = GRID_REGIONS.find((g) => g.id === preset.gridId) || GRID_REGIONS[0];

    setParams({
      annualMileage: preset.annualMileage,
      analysisYears: 10,
      gridCarbonIntensityGkwh: grid.carbonIntensityGramsPerKwh,
      electricityCostPerKwh: grid.electricityPriceCentsPerKwh / 100,
      gasolinePricePerGallon: preset.gasPrice,
      ambientClimateSeverity: preset.climate,
      taxCreditUsd: preset.taxCredit,
    });
  };

  const handleUpdateParams = (updated: Partial<SimulationParams>) => {
    setActivePresetId(null);
    setParams((prev) => ({ ...prev, ...updated }));
  };

  const handleAddCandidate = (vehicle: Vehicle) => {
    if (candidateVehicles.length < 3 && !candidateVehicles.some((c) => c.id === vehicle.id)) {
      setActivePresetId(null);
      setCandidateVehicles([...candidateVehicles, vehicle]);
    }
  };

  const handleRemoveCandidate = (vehicleId: string) => {
    if (candidateVehicles.length > 1) {
      setActivePresetId(null);
      setCandidateVehicles(candidateVehicles.filter((c) => c.id !== vehicleId));
    }
  };

  const handleResetDefaults = () => {
    handleSelectPreset(PRESET_SCENARIOS[0]);
  };

  const primaryResult = breakevenResults[0];

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onResetDefaults={handleResetDefaults}
        isMetric={isMetric}
        onToggleUnits={() => setIsMetric(!isMetric)}
        onPrintReport={() => window.print()}
      />

      {/* Preset Scenarios Strip */}
      <ScenarioPresets
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* KPI Banner / Quick Glancable Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono">
          {/* Card 1: Carbon Breakeven Horizon */}
          <div className="bg-surface border border-border-subtle rounded-card p-3 flex flex-col justify-between">
            <span className="text-[10px] text-text-muted flex items-center space-x-1.5 uppercase font-bold tracking-wider">
              <Target className="w-3.5 h-3.5 text-accent-green" />
              <span>Carbon Breakeven</span>
            </span>
            <div className="my-1">
              <span className="text-lg sm:text-2xl font-bold text-text-primary">
                {primaryResult?.hasCrossover
                  ? `Month ${primaryResult.crossoverMonths}`
                  : 'No Breakeven'}
              </span>
              <span className="text-[11px] text-text-muted block">
                {primaryResult?.hasCrossover && primaryResult.crossoverMiles
                  ? `${isMetric ? Math.round(primaryResult.crossoverMiles * 1.60934 / 1000) : (primaryResult.crossoverMiles / 1000).toFixed(1)}k ${isMetric ? 'km' : 'mi'}`
                  : 'Dirtier than current'}
              </span>
            </div>
            <span className="text-[10px] text-accent-green truncate">
              {primaryResult?.statusBadge === 'fast_payoff'
                ? '⚡ Fast climate payback'
                : primaryResult?.statusBadge === 'moderate_payoff'
                ? '⏱️ 2-5 yr payback'
                : '⚠️ Slower or zero return'}
            </span>
          </div>

          {/* Card 2: 10-Year Cumulative Carbon Savings */}
          <div className="bg-surface border border-border-subtle rounded-card p-3 flex flex-col justify-between">
            <span className="text-[10px] text-text-muted flex items-center space-x-1.5 uppercase font-bold tracking-wider">
              <Leaf className="w-3.5 h-3.5 text-accent-green" />
              <span>10-Yr Carbon Abatement</span>
            </span>
            <div className="my-1">
              <span className="text-lg sm:text-2xl font-bold text-accent-green">
                {primaryResult
                  ? `${(primaryResult.tenYearTotalCarbonSavingsKg / 1000).toFixed(1)} t CO₂e`
                  : '0 t'}
              </span>
              <span className="text-[11px] text-text-muted block">
                {primaryResult?.annualEmissionsReductionPct}% annual cut
              </span>
            </div>
            <span className="text-[10px] text-text-muted truncate">
              ~{Math.round((primaryResult?.tenYearTotalCarbonSavingsKg || 0) / 22)} mature tree-years
            </span>
          </div>

          {/* Card 3: 10-Year Financial Net ROI */}
          <div className="bg-surface border border-border-subtle rounded-card p-3 flex flex-col justify-between">
            <span className="text-[10px] text-text-muted flex items-center space-x-1.5 uppercase font-bold tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-debt-amber" />
              <span>10-Yr Net Financial ROI</span>
            </span>
            <div className="my-1">
              <span
                className={`text-lg sm:text-2xl font-bold ${
                  (primaryResult?.tenYearTotalCostSavingsUsd || 0) >= 0
                    ? 'text-accent-green'
                    : 'text-debt-amber'
                }`}
              >
                {(primaryResult?.tenYearTotalCostSavingsUsd || 0) >= 0
                  ? `+$${primaryResult?.tenYearTotalCostSavingsUsd.toLocaleString()}`
                  : `-$${Math.abs(primaryResult?.tenYearTotalCostSavingsUsd || 0).toLocaleString()}`}
              </span>
              <span className="text-[11px] text-text-muted block">
                Fuel + Maint vs Capital
              </span>
            </div>
            <span className="text-[10px] text-text-muted truncate">
              ${params.taxCreditUsd.toLocaleString()} clean tax credit
            </span>
          </div>

          {/* Card 4: Grid Carbon Intensity */}
          <div className="bg-surface border border-border-subtle rounded-card p-3 flex flex-col justify-between">
            <span className="text-[10px] text-text-muted flex items-center space-x-1.5 uppercase font-bold tracking-wider">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Grid Carbon Intensity</span>
            </span>
            <div className="my-1">
              <span className="text-lg sm:text-2xl font-bold text-text-primary">
                {params.gridCarbonIntensityGkwh} <span className="text-xs font-normal text-text-muted">g/kWh</span>
              </span>
              <span className="text-[11px] text-text-muted block truncate">
                {currentGrid.name}
              </span>
            </div>
            <span className="text-[10px] text-text-muted truncate">
              eGRID zone {currentGrid.code}
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Split Workbench */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* Left Column (5 cols): Parameter Controls & Vehicle Configurator */}
          <div className="xl:col-span-5 space-y-4">
            <VehicleConfigurator
              incumbentVehicle={incumbentVehicle}
              candidateVehicles={candidateVehicles}
              onSelectIncumbent={setIncumbentVehicle}
              onAddCandidate={handleAddCandidate}
              onRemoveCandidate={handleRemoveCandidate}
              isMetric={isMetric}
            />

            <GridAndCommuteControls
              params={params}
              onChangeParams={handleUpdateParams}
              selectedGridId={selectedGridId}
              onSelectGridId={setSelectedGridId}
              isMetric={isMetric}
            />
          </div>

          {/* Right Column (7 cols): Prominent Interactive Stage & Tabs */}
          <div className="xl:col-span-7 space-y-3">
            {/* View Switcher Tabs */}
            <div className="flex items-center space-x-2 border-b border-border-subtle pb-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('crossover')}
                className={`px-3 py-1.5 rounded-crisp transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'crossover'
                    ? 'bg-accent-green/20 text-accent-green border border-accent-green/40 font-bold shadow-sm'
                    : 'bg-surface hover:bg-surface-elevated text-text-muted hover:text-text-primary border border-border-subtle'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>1. Crossover Trajectory</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('waterfall')}
                className={`px-3 py-1.5 rounded-crisp transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'waterfall'
                    ? 'bg-accent-green/20 text-accent-green border border-accent-green/40 font-bold shadow-sm'
                    : 'bg-surface hover:bg-surface-elevated text-text-muted hover:text-text-primary border border-border-subtle'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. Lifecycle Waterfall</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('economics')}
                className={`px-3 py-1.5 rounded-crisp transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'economics'
                    ? 'bg-accent-green/20 text-accent-green border border-accent-green/40 font-bold shadow-sm'
                    : 'bg-surface hover:bg-surface-elevated text-text-muted hover:text-text-primary border border-border-subtle'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>3. TCO Economics</span>
              </button>
            </div>

            {/* Active Visual Component */}
            {activeTab === 'crossover' && (
              <CrossoverChart
                incumbentBreakdown={incumbentBreakdown}
                candidateBreakdowns={candidateBreakdowns}
                breakevenResults={breakevenResults}
                annualMileage={params.annualMileage}
                isMetric={isMetric}
              />
            )}

            {activeTab === 'waterfall' && (
              <LifecycleWaterfall
                incumbentBreakdown={incumbentBreakdown}
                candidateBreakdowns={candidateBreakdowns}
                annualMileage={params.annualMileage}
              />
            )}

            {activeTab === 'economics' && (
              <TcoEconomics
                incumbentBreakdown={incumbentBreakdown}
                candidateBreakdowns={candidateBreakdowns}
                breakevenResults={breakevenResults}
                annualMileage={params.annualMileage}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-surface/50 py-3 px-4 sm:px-6 text-xs text-text-muted font-mono mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-accent-green font-bold">CarboShift LCA</span>
            <span>· Built for Green Shift Hacks 2026</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>ANL GREET 2024 Engine</span>
            <span>EPA eGRID 2024 Verified</span>
            <span>Zero Sunk-Cost Whitewashing</span>
          </div>
        </div>
      </footer>

      {/* Scientific Audit & Methodology Modal */}
      <AuditMethodologyModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
}
