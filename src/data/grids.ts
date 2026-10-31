import type { GridRegion } from '../types/index.ts';

export const GRID_REGIONS: GridRegion[] = [
  {
    id: 'nwpp',
    name: 'US Pacific NW (Hydro / Clean)',
    code: 'NWPP',
    carbonIntensityGramsPerKwh: 112,
    electricityPriceCentsPerKwh: 12.8,
    description: 'Washington, Oregon, Idaho. Dominated by Columbia River hydroelectric generation.'
  },
  {
    id: 'camx',
    name: 'California (CAISO)',
    code: 'CAMX',
    carbonIntensityGramsPerKwh: 215,
    electricityPriceCentsPerKwh: 28.5,
    description: 'California ISO grid. High daytime solar curtailment, high evening natural gas ramp.'
  },
  {
    id: 'nyup',
    name: 'Upstate New York (NYUP)',
    code: 'NYUP',
    carbonIntensityGramsPerKwh: 98,
    electricityPriceCentsPerKwh: 16.5,
    description: 'Heavy Niagara hydro and upstate zero-emission nuclear generation.'
  },
  {
    id: 'newe',
    name: 'New England (ISO-NE)',
    code: 'NEWE',
    carbonIntensityGramsPerKwh: 235,
    electricityPriceCentsPerKwh: 26.2,
    description: 'Connecticut, Mass, Maine. Predominantly natural gas, nuclear, and offshore wind.'
  },
  {
    id: 'us_avg',
    name: 'US National Average (eGRID 2024)',
    code: 'US-AVG',
    carbonIntensityGramsPerKwh: 372,
    electricityPriceCentsPerKwh: 16.8,
    description: 'Weighted average of continental US generation mix (gas, coal, nuclear, renewables).'
  },
  {
    id: 'ercot',
    name: 'Texas (ERCOT)',
    code: 'ERCOT',
    carbonIntensityGramsPerKwh: 395,
    electricityPriceCentsPerKwh: 14.2,
    description: 'Rapidly growing solar and wind, backed by fast-ramping combined-cycle gas.'
  },
  {
    id: 'miso',
    name: 'Midwest MISO (Coal / Gas)',
    code: 'MISO',
    carbonIntensityGramsPerKwh: 560,
    electricityPriceCentsPerKwh: 15.5,
    description: 'Illinois, Michigan, Minnesota, Indiana. Significant baseload coal and natural gas.'
  },
  {
    id: 'rfcw',
    name: 'Ohio Valley / PJM West (Coal)',
    code: 'RFCW',
    carbonIntensityGramsPerKwh: 615,
    electricityPriceCentsPerKwh: 14.8,
    description: 'Ohio, West Virginia, western Pennsylvania. Heavy legacy coal dependency.'
  },
  {
    id: 'france',
    name: 'France (Nuclear / Low Carbon)',
    code: 'FR',
    carbonIntensityGramsPerKwh: 58,
    electricityPriceCentsPerKwh: 25.0,
    description: 'RTE grid powered 70%+ by nuclear fleet and hydro.'
  },
  {
    id: 'germany',
    name: 'Germany (Renewables + Coal)',
    code: 'DE',
    carbonIntensityGramsPerKwh: 385,
    electricityPriceCentsPerKwh: 38.0,
    description: 'Energiewende mix of onshore wind, solar, supplemented with lignite/hard coal and gas.'
  },
  {
    id: 'poland',
    name: 'Poland (Lignite / Hard Coal)',
    code: 'PL',
    carbonIntensityGramsPerKwh: 695,
    electricityPriceCentsPerKwh: 22.0,
    description: 'PSE grid relying heavily on domestic lignite and bituminous coal.'
  }
];
