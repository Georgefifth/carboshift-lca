export type PowertrainType = 'ICE' | 'BEV' | 'PHEV' | 'HEV';

export type VehicleCondition = 'incumbent' | 'new' | 'used';

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  powertrain: PowertrainType;
  condition: VehicleCondition;
  curbWeightKg: number;
  batteryKwh: number;
  batteryChemistry?: 'NMC' | 'LFP' | 'NCA';
  fuelEconomyMpg?: number; // for ICE / HEV / PHEV gas mode
  efficiencyMiPerKwh?: number; // for BEV / PHEV EV mode
  phevElectricRangeMiles?: number; // for PHEV
  purchasePriceUsd: number;
  maintenanceCostPerMileUsd: number;
  batteryStateOfHealthPct?: number; // for used EV (0 - 100)
  description?: string;
}

export interface GridRegion {
  id: string;
  name: string;
  code: string;
  carbonIntensityGramsPerKwh: number; // g CO2e / kWh
  electricityPriceCentsPerKwh: number;
  description: string;
}

export interface SimulationParams {
  annualMileage: number;
  analysisYears: number; // typically 10 years
  gridCarbonIntensityGkwh: number;
  electricityCostPerKwh: number;
  gasolinePricePerGallon: number;
  ambientClimateSeverity: 'mild' | 'moderate' | 'harsh_winter'; // affects HVAC draw
  taxCreditUsd: number; // IRA 30D / 25E ($7500 new, $4000 used)
}

export interface LifecycleBreakdown {
  vehicleId: string;
  vehicleName: string;
  powertrain: PowertrainType;
  condition: VehicleCondition;
  
  // Emissions in kg CO2e
  embodiedGliderKg: number;
  embodiedBatteryKg: number;
  embodiedTotalKg: number; // Initial Carbon Debt
  
  operationalPerMileGrams: number; // g CO2e / mile
  annualOperationalKg: number;
  
  cumulativeEmissionsByYear: number[]; // 0 to analysisYears
  cumulativeMilesByYear: number[];
  
  // Economics in USD
  upfrontNetCostUsd: number;
  annualFuelCostUsd: number;
  annualMaintenanceCostUsd: number;
  cumulativeTcoByYear: number[];
}

export interface BreakevenResult {
  candidateId: string;
  candidateName: string;
  hasCrossover: boolean;
  crossoverMiles: number | null;
  crossoverMonths: number | null;
  tenYearTotalCarbonSavingsKg: number;
  tenYearTotalCostSavingsUsd: number;
  annualEmissionsReductionPct: number;
  statusBadge: 'fast_payoff' | 'moderate_payoff' | 'slow_payoff' | 'no_payoff';
  statusExplanation: string;
}
