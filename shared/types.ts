
export type FuelType = 'HFO' | 'VLSFO' | 'MDO' | 'MGO' | 'LNG' | 'BioLNG' | 'e-methanol' | 'e-diesel' | 'e-H2' | 'e-NH3' | 'Other';

export interface FuelConsumed {
  fuelType: FuelType | string;   // allow custom strings
  mass_tonnes: number;           // tonnes
  lcv_MJ_per_tonne: number;      // MJ/t (e.g., 41_000 MJ/t for VLSFO)
  wtt_gCO2e_per_MJ: number;      // Well-to-Tank intensity
  ttw_gCO2e_per_MJ: number;      // Tank-to-Wake intensity
  isRFNBO?: boolean;             // RFNBO multiplier applies if true
}

export interface ShorePowerUse {
  connectionId: string;
  energy_MJ: number;
}

export interface VoyageInScope {
  id: string;
  scope: 'intra-EEA' | 'extra-EEA-inward' | 'extra-EEA-outward' | 'at-berth' | 'in-port';
  startPort: string;
  endPort: string;
  energyShare: number;   // 0..1 share of voyage energy in FuelEU scope (pre-calculated for demo)
}

export interface ShipEnergyReport {
  shipIMO: string;
  year: number;
  fuels: FuelConsumed[];
  shorePowers?: ShorePowerUse[];
  voyages?: VoyageInScope[];
  windRewardFactor?: number; // f_wind (>=0). 1.0 means no reward
  ghgieTarget_g_per_MJ: number; // GHGIE_target for the reporting year
}

export interface ComplianceResult {
  ghgie_actual_g_per_MJ: number;
  energyInScope_MJ: number;
  complianceBalance_gCO2e: number;
  penalty_EUR: number;
  notes: string[];
}

export interface PoolRequest {
  poolId: string;
  ships: Array<{ imo: string; adjustedComplianceBalance_gCO2e: number }>;
}

export interface BankRequest {
  companyId: string;
  year: number;
  verifiedComplianceBalance_gCO2e: number;
}

export interface BorrowRequest {
  companyId: string;
  yearN: number;
  energyInScope_MJ: number;
  ghgieTarget_g_per_MJ: number;
  requestedACS_gCO2e: number;
}
