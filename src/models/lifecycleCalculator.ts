import type { Vehicle, SimulationParams, LifecycleBreakdown, BreakevenResult } from '../types/index.ts';

// Constants based on Argonne National Laboratory GREET 2023/2024 and EPA standards
export const GREET_FACTORS = {
  // Gasoline Lifecycle
  GASOLINE_DIRECT_COMBUSTION_KG_PER_GAL: 8.887,
  GASOLINE_UPSTREAM_WTP_KG_PER_GAL: 2.380, // Well-to-Pump refinery & distribution
  GASOLINE_TOTAL_KG_PER_GAL: 11.267, // 11,267 grams CO2e per gallon

  // Grid T&D loss
  GRID_TRANSMISSION_LOSS_MULTIPLIER: 1.052, // 5.2% average grid losses

  // Glider manufacturing (vehicle body without battery)
  GLIDER_MFG_KG_PER_KG_WEIGHT: 5.6, // ~5.6 kg CO2e per kg of vehicle curb weight

  // Battery pack manufacturing embodied carbon by chemistry (cell + pack integration)
  BATTERY_MFG_NMC_KG_PER_KWH: 88,
  BATTERY_MFG_NCA_KG_PER_KWH: 85,
  BATTERY_MFG_LFP_KG_PER_KWH: 68,
  BATTERY_MFG_DEFAULT_KG_PER_KWH: 80,

  // Non-exhaust maintenance emissions (g CO2e / mile)
  MAINTENANCE_EMISSIONS_ICE_G_PER_MI: 18.0,
  MAINTENANCE_EMISSIONS_HEV_G_PER_MI: 14.0,
  MAINTENANCE_EMISSIONS_PHEV_G_PER_MI: 12.0,
  MAINTENANCE_EMISSIONS_BEV_G_PER_MI: 8.5, // Reduced brake wear from regen; no engine oil
};

export const CLIMATE_EFFICIENCY_MULTIPLIERS = {
  mild: 1.0,
  moderate: 1.12,
  harsh_winter: 1.25, // 25% extra consumption from cabin heat pump & battery resistance
};

/**
 * Calculates cradle-to-grave lifecycle emissions and economics for a vehicle under specified simulation parameters.
 */
export function calculateLifecycleBreakdown(
  vehicle: Vehicle,
  params: SimulationParams
): LifecycleBreakdown {
  const climateMult = CLIMATE_EFFICIENCY_MULTIPLIERS[params.ambientClimateSeverity] || 1.0;

  // 1. Calculate Embodied Manufacturing Carbon (kg CO2e)
  let embodiedGliderKg = 0;
  let embodiedBatteryKg = 0;

  if (vehicle.condition === 'incumbent') {
    // Sunk cost: car is already manufactured and paid for. Producing 0 new vehicle body emissions.
    embodiedGliderKg = 0;
    embodiedBatteryKg = 0;
  } else if (vehicle.condition === 'new') {
    // Brand new car: Full glider manufacturing burden
    const gliderWeightKg = Math.max(800, vehicle.curbWeightKg - (vehicle.batteryKwh * 5.5)); // estimate battery weight ~5.5kg/kWh
    embodiedGliderKg = gliderWeightKg * GREET_FACTORS.GLIDER_MFG_KG_PER_KG_WEIGHT;

    // Battery manufacturing burden
    if (vehicle.batteryKwh > 0) {
      let battFactor = GREET_FACTORS.BATTERY_MFG_DEFAULT_KG_PER_KWH;
      if (vehicle.batteryChemistry === 'LFP') battFactor = GREET_FACTORS.BATTERY_MFG_LFP_KG_PER_KWH;
      else if (vehicle.batteryChemistry === 'NMC') battFactor = GREET_FACTORS.BATTERY_MFG_NMC_KG_PER_KWH;
      else if (vehicle.batteryChemistry === 'NCA') battFactor = GREET_FACTORS.BATTERY_MFG_NCA_KG_PER_KWH;
      embodiedBatteryKg = vehicle.batteryKwh * battFactor;
    }
  } else if (vehicle.condition === 'used') {
    // Used EV: Glider carbon is amortized. The second buyer inherits ~25% of battery burden adjusted for SOH.
    embodiedGliderKg = 0; // Sunk glider
    if (vehicle.batteryKwh > 0) {
      const battFactor = vehicle.batteryChemistry === 'LFP' 
        ? GREET_FACTORS.BATTERY_MFG_LFP_KG_PER_KWH 
        : GREET_FACTORS.BATTERY_MFG_NMC_KG_PER_KWH;
      const originalPackKg = vehicle.batteryKwh * battFactor;
      // Allocated replacement responsibility ~25% of pack lifecycle
      embodiedBatteryKg = originalPackKg * 0.25;
    }
  }

  const embodiedTotalKg = embodiedGliderKg + embodiedBatteryKg;

  // 2. Calculate Operational Emissions (grams CO2e / mile)
  let operationalPerMileGrams = 0;

  if (vehicle.powertrain === 'ICE') {
    const mpg = vehicle.fuelEconomyMpg || 28;
    const gasGramsPerMile = (GREET_FACTORS.GASOLINE_TOTAL_KG_PER_GAL * 1000) / mpg;
    operationalPerMileGrams = gasGramsPerMile + GREET_FACTORS.MAINTENANCE_EMISSIONS_ICE_G_PER_MI;
  } else if (vehicle.powertrain === 'HEV') {
    const mpg = vehicle.fuelEconomyMpg || 50;
    const gasGramsPerMile = (GREET_FACTORS.GASOLINE_TOTAL_KG_PER_GAL * 1000) / mpg;
    operationalPerMileGrams = gasGramsPerMile + GREET_FACTORS.MAINTENANCE_EMISSIONS_HEV_G_PER_MI;
  } else if (vehicle.powertrain === 'BEV') {
    const efficiency = vehicle.efficiencyMiPerKwh || 3.5;
    // (g CO2e / kWh) * T&D loss * climate factor / (mi / kWh)
    const elecGramsPerMile = (params.gridCarbonIntensityGkwh * GREET_FACTORS.GRID_TRANSMISSION_LOSS_MULTIPLIER * climateMult) / efficiency;
    operationalPerMileGrams = elecGramsPerMile + GREET_FACTORS.MAINTENANCE_EMISSIONS_BEV_G_PER_MI;
  } else if (vehicle.powertrain === 'PHEV') {
    // Assume 65% electric miles, 35% gasoline miles for typical commuter PHEV
    const elecEfficiency = vehicle.efficiencyMiPerKwh || 2.8;
    const gasMpg = vehicle.fuelEconomyMpg || 36;

    const elecGramsPerMile = (params.gridCarbonIntensityGkwh * GREET_FACTORS.GRID_TRANSMISSION_LOSS_MULTIPLIER * climateMult) / elecEfficiency;
    const gasGramsPerMile = (GREET_FACTORS.GASOLINE_TOTAL_KG_PER_GAL * 1000) / gasMpg;

    operationalPerMileGrams = (0.65 * elecGramsPerMile) + (0.35 * gasGramsPerMile) + GREET_FACTORS.MAINTENANCE_EMISSIONS_PHEV_G_PER_MI;
  }

  const annualOperationalKg = (operationalPerMileGrams * params.annualMileage) / 1000;

  // 3. Build Cumulative Trajectory Year by Year (0 to analysisYears)
  const cumulativeEmissionsByYear: number[] = [];
  const cumulativeMilesByYear: number[] = [];
  const cumulativeTcoByYear: number[] = [];

  // Upfront financial costs: Purchase price minus tax incentives
  let upfrontNetCostUsd = vehicle.purchasePriceUsd;
  if (vehicle.condition === 'new' && (vehicle.powertrain === 'BEV' || vehicle.powertrain === 'PHEV')) {
    upfrontNetCostUsd = Math.max(0, vehicle.purchasePriceUsd - params.taxCreditUsd);
  } else if (vehicle.condition === 'used' && vehicle.powertrain === 'BEV') {
    // Used EV tax credit (IRA 25E up to $4,000 or 30% of sale price)
    const usedCredit = Math.min(4000, vehicle.purchasePriceUsd * 0.3);
    upfrontNetCostUsd = Math.max(0, vehicle.purchasePriceUsd - usedCredit);
  }

  // Annual Fuel / Electricity cost calculation
  let annualFuelCostUsd = 0;
  if (vehicle.powertrain === 'ICE' || vehicle.powertrain === 'HEV') {
    const mpg = vehicle.fuelEconomyMpg || 25;
    const gallonsUsed = params.annualMileage / mpg;
    annualFuelCostUsd = gallonsUsed * params.gasolinePricePerGallon;
  } else if (vehicle.powertrain === 'BEV') {
    const efficiency = vehicle.efficiencyMiPerKwh || 3.5;
    const kwhUsed = (params.annualMileage / efficiency) * climateMult;
    annualFuelCostUsd = kwhUsed * params.electricityCostPerKwh;
  } else if (vehicle.powertrain === 'PHEV') {
    const elecEfficiency = vehicle.efficiencyMiPerKwh || 2.8;
    const gasMpg = vehicle.fuelEconomyMpg || 36;
    const kwhUsed = ((params.annualMileage * 0.65) / elecEfficiency) * climateMult;
    const gallonsUsed = (params.annualMileage * 0.35) / gasMpg;
    annualFuelCostUsd = (kwhUsed * params.electricityCostPerKwh) + (gallonsUsed * params.gasolinePricePerGallon);
  }

  const annualMaintenanceCostUsd = vehicle.maintenanceCostPerMileUsd * params.annualMileage;
  const annualTotalOperatingCostUsd = annualFuelCostUsd + annualMaintenanceCostUsd;

  for (let year = 0; year <= params.analysisYears; year++) {
    const miles = year * params.annualMileage;
    cumulativeMilesByYear.push(miles);

    const emissions = embodiedTotalKg + (year * annualOperationalKg);
    cumulativeEmissionsByYear.push(Math.round(emissions));

    const tco = upfrontNetCostUsd + (year * annualTotalOperatingCostUsd);
    cumulativeTcoByYear.push(Math.round(tco));
  }

  return {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    powertrain: vehicle.powertrain,
    condition: vehicle.condition,
    embodiedGliderKg: Math.round(embodiedGliderKg),
    embodiedBatteryKg: Math.round(embodiedBatteryKg),
    embodiedTotalKg: Math.round(embodiedTotalKg),
    operationalPerMileGrams: Math.round(operationalPerMileGrams * 10) / 10,
    annualOperationalKg: Math.round(annualOperationalKg),
    cumulativeEmissionsByYear,
    cumulativeMilesByYear,
    upfrontNetCostUsd: Math.round(upfrontNetCostUsd),
    annualFuelCostUsd: Math.round(annualFuelCostUsd),
    annualMaintenanceCostUsd: Math.round(annualMaintenanceCostUsd),
    cumulativeTcoByYear,
  };
}

/**
 * Computes the exact Carbon and TCO breakeven metrics comparing an incumbent vehicle with a candidate replacement vehicle.
 */
export function computeBreakeven(
  incumbentBreakdown: LifecycleBreakdown,
  candidateBreakdown: LifecycleBreakdown,
  annualMileage: number
): BreakevenResult {
  const embodiedDebtKg = candidateBreakdown.embodiedTotalKg - incumbentBreakdown.embodiedTotalKg;
  const operationalDeltaGramsPerMile = incumbentBreakdown.operationalPerMileGrams - candidateBreakdown.operationalPerMileGrams;

  let hasCrossover = false;
  let crossoverMiles: number | null = null;
  let crossoverMonths: number | null = null;

  if (operationalDeltaGramsPerMile > 0 && embodiedDebtKg > 0) {
    // Solves: crossoverMiles * operationalDeltaGrams = embodiedDebtKg * 1000
    const rawMiles = (embodiedDebtKg * 1000) / operationalDeltaGramsPerMile;
    crossoverMiles = Math.round(rawMiles);
    crossoverMonths = Math.round((rawMiles / annualMileage) * 12);
    hasCrossover = true;
  } else if (embodiedDebtKg <= 0 && operationalDeltaGramsPerMile >= 0) {
    // Instant crossover: zero or lower embodied carbon and cleaner operation!
    hasCrossover = true;
    crossoverMiles = 0;
    crossoverMonths = 0;
  } else {
    // Operational emissions are dirtier than incumbent! Will NEVER break even under current grid/mileage.
    hasCrossover = false;
    crossoverMiles = null;
    crossoverMonths = null;
  }

  // 10-Year cumulative totals
  const tenYearIncumbentEmissions = incumbentBreakdown.cumulativeEmissionsByYear[10] || 0;
  const tenYearCandidateEmissions = candidateBreakdown.cumulativeEmissionsByYear[10] || 0;
  const tenYearTotalCarbonSavingsKg = Math.round(tenYearIncumbentEmissions - tenYearCandidateEmissions);

  const tenYearIncumbentTco = incumbentBreakdown.cumulativeTcoByYear[10] || 0;
  const tenYearCandidateTco = candidateBreakdown.cumulativeTcoByYear[10] || 0;
  const tenYearTotalCostSavingsUsd = Math.round(tenYearIncumbentTco - tenYearCandidateTco);

  const annualReductionPct = incumbentBreakdown.annualOperationalKg > 0
    ? Math.round(((incumbentBreakdown.annualOperationalKg - candidateBreakdown.annualOperationalKg) / incumbentBreakdown.annualOperationalKg) * 100)
    : 0;

  // Status Badge Evaluation
  let statusBadge: BreakevenResult['statusBadge'] = 'moderate_payoff';
  let statusExplanation = '';

  if (!hasCrossover) {
    statusBadge = 'no_payoff';
    statusExplanation = 'Candidate vehicle emits more operational carbon per mile than keeping your current car under this grid mix. Never breaks even.';
  } else if (crossoverMonths !== null && crossoverMonths <= 24) {
    statusBadge = 'fast_payoff';
    statusExplanation = `Exceptional Green Shift: Recovers manufacturing carbon debt in ${crossoverMonths} months (${crossoverMiles?.toLocaleString()} miles). Strong climate & financial ROI.`;
  } else if (crossoverMonths !== null && crossoverMonths <= 60) {
    statusBadge = 'moderate_payoff';
    statusExplanation = `Viable Green Shift: Reaches carbon breakeven in Year ${Math.ceil(crossoverMonths / 12)} (${crossoverMonths} months). Slower payoff due to initial battery debt.`;
  } else {
    statusBadge = 'slow_payoff';
    statusExplanation = `Delayed Carbon Payoff (${crossoverMonths} months / ${Math.round((crossoverMonths || 0) / 12)} years). High battery debt or low annual mileage delays environmental return.`;
  }

  return {
    candidateId: candidateBreakdown.vehicleId,
    candidateName: candidateBreakdown.vehicleName,
    hasCrossover,
    crossoverMiles,
    crossoverMonths,
    tenYearTotalCarbonSavingsKg,
    tenYearTotalCostSavingsUsd,
    annualEmissionsReductionPct: annualReductionPct,
    statusBadge,
    statusExplanation,
  };
}
