import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLifecycleBreakdown,
  computeBreakeven,
  GREET_FACTORS,
  CLIMATE_EFFICIENCY_MULTIPLIERS,
} from '../src/models/lifecycleCalculator.ts';
import { BENCHMARK_VEHICLES } from '../src/data/vehicles.ts';

test('Incumbent vehicle embodied manufacturing carbon is zero (sunk capital)', () => {
  const civic = BENCHMARK_VEHICLES.find((v) => v.id === 'incumbent_civic');
  assert.ok(civic, 'Civic vehicle must exist');

  const params = {
    annualMileage: 12000,
    analysisYears: 10,
    gridCarbonIntensityGkwh: 215,
    electricityCostPerKwh: 0.28,
    gasolinePricePerGallon: 4.0,
    ambientClimateSeverity: 'mild',
    taxCreditUsd: 7500,
  };

  const breakdown = calculateLifecycleBreakdown(civic, params);
  assert.equal(breakdown.embodiedGliderKg, 0, 'Glider must be 0 for incumbent');
  assert.equal(breakdown.embodiedBatteryKg, 0, 'Battery must be 0 for incumbent');
  assert.equal(breakdown.embodiedTotalKg, 0, 'Total embodied debt must be 0 for incumbent');
  assert.ok(breakdown.annualOperationalKg > 0, 'Operational emissions must be > 0');
});

test('New BEV computes exact battery and glider embodied manufacturing debt', () => {
  const model3 = BENCHMARK_VEHICLES.find((v) => v.id === 'new_tesla_m3_rwd');
  assert.ok(model3, 'Tesla Model 3 must exist');

  const params = {
    annualMileage: 12000,
    analysisYears: 10,
    gridCarbonIntensityGkwh: 215,
    electricityCostPerKwh: 0.28,
    gasolinePricePerGallon: 4.0,
    ambientClimateSeverity: 'mild',
    taxCreditUsd: 7500,
  };

  const breakdown = calculateLifecycleBreakdown(model3, params);
  // Battery: 60 kWh * 68 kg/kWh (LFP) = 4,080 kg
  assert.equal(breakdown.embodiedBatteryKg, 60 * 68);
  assert.ok(breakdown.embodiedGliderKg > 0, 'Glider manufacturing carbon must be positive');
  assert.equal(breakdown.embodiedTotalKg, breakdown.embodiedGliderKg + breakdown.embodiedBatteryKg);
});

test('Breakeven solver accurately computes crossover under California grid (CAMX)', () => {
  const civic = BENCHMARK_VEHICLES.find((v) => v.id === 'incumbent_civic');
  const model3 = BENCHMARK_VEHICLES.find((v) => v.id === 'new_tesla_m3_rwd');

  const params = {
    annualMileage: 13500,
    analysisYears: 10,
    gridCarbonIntensityGkwh: 215, // CAMX
    electricityCostPerKwh: 0.285,
    gasolinePricePerGallon: 4.15,
    ambientClimateSeverity: 'mild',
    taxCreditUsd: 7500,
  };

  const civicBreakdown = calculateLifecycleBreakdown(civic, params);
  const m3Breakdown = calculateLifecycleBreakdown(model3, params);
  const be = computeBreakeven(civicBreakdown, m3Breakdown, params.annualMileage);

  assert.equal(be.hasCrossover, true, 'Should reach crossover');
  assert.ok(be.crossoverMonths !== null && be.crossoverMonths > 0 && be.crossoverMonths < 60, 'Breakeven should be within 5 years');
  assert.ok(be.tenYearTotalCarbonSavingsKg > 15000, 'Should save >15 metric tons of CO2 over 10 years');
  assert.equal(be.statusBadge, 'moderate_payoff');
});

test('Used EV inherits lower embodied carbon and breaks even rapidly', () => {
  const civic = BENCHMARK_VEHICLES.find((v) => v.id === 'incumbent_civic');
  const leaf = BENCHMARK_VEHICLES.find((v) => v.id === 'used_leaf_2018');

  const params = {
    annualMileage: 12000,
    analysisYears: 10,
    gridCarbonIntensityGkwh: 215,
    electricityCostPerKwh: 0.28,
    gasolinePricePerGallon: 4.0,
    ambientClimateSeverity: 'mild',
    taxCreditUsd: 4000,
  };

  const civicBreakdown = calculateLifecycleBreakdown(civic, params);
  const leafBreakdown = calculateLifecycleBreakdown(leaf, params);
  const be = computeBreakeven(civicBreakdown, leafBreakdown, params.annualMileage);

  assert.equal(be.hasCrossover, true);
  assert.ok(be.crossoverMonths !== null && be.crossoverMonths <= 12, 'Used EV should break even in under a year due to amortized glider debt');
  assert.equal(be.statusBadge, 'fast_payoff');
});

test('Harsh winter climate increases BEV operational energy and emissions', () => {
  const model3 = BENCHMARK_VEHICLES.find((v) => v.id === 'new_tesla_m3_rwd');

  const mildParams = {
    annualMileage: 12000,
    analysisYears: 10,
    gridCarbonIntensityGkwh: 372,
    electricityCostPerKwh: 0.16,
    gasolinePricePerGallon: 3.5,
    ambientClimateSeverity: 'mild',
    taxCreditUsd: 7500,
  };

  const winterParams = {
    ...mildParams,
    ambientClimateSeverity: 'harsh_winter',
  };

  const mildBreakdown = calculateLifecycleBreakdown(model3, mildParams);
  const winterBreakdown = calculateLifecycleBreakdown(model3, winterParams);

  assert.ok(
    winterBreakdown.operationalPerMileGrams > mildBreakdown.operationalPerMileGrams,
    'Winter operational emissions must be higher than mild'
  );
  const ratio = winterBreakdown.operationalPerMileGrams / mildBreakdown.operationalPerMileGrams;
  assert.ok(ratio > 1.2, 'Winter penalty should be ~25% higher');
});
