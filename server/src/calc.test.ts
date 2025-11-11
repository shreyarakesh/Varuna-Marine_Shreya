
import { describe, it, expect } from 'vitest'
import { computeCompliance, borrowingCheck } from './calc'
import type { ShipEnergyReport } from '../../shared/types'

describe('computeCompliance', () => {
  it('computes GHGIE, energy, CB and penalty', () => {
    const report: ShipEnergyReport = {
      shipIMO: '9876543',
      year: 2025,
      ghgieTarget_g_per_MJ: 91.16,
      windRewardFactor: 1.0,
      fuels: [
        { fuelType:'VLSFO', mass_tonnes: 800, lcv_MJ_per_tonne: 41000, wtt_gCO2e_per_MJ: 15, ttw_gCO2e_per_MJ: 74, isRFNBO:false },
        { fuelType:'e-diesel', mass_tonnes: 50, lcv_MJ_per_tonne: 43000, wtt_gCO2e_per_MJ: 13.17, ttw_gCO2e_per_MJ: 76.37, isRFNBO:true }
      ],
      shorePowers: [{ connectionId: 'OPS-KW-1', energy_MJ: 250000 }]
    };
    const res = computeCompliance(report);
    expect(res.energyInScope_MJ).toBeGreaterThan(0);
    expect(res.ghgie_actual_g_per_MJ).toBeGreaterThan(0);
    // Target is 91.16 g/MJ, with RFNBO reward we expect actual < target => positive CB
    expect(res.complianceBalance_gCO2e).toBeGreaterThan(0);
  });
});

describe('borrowingCheck', () => {
  it('caps ACS at 2% of target*energy and applies 10% aggravation', () => {
    const target = 91.16;
    const energy = 40_000_000; // MJ
    const request = 300_000_000; // gCO2e
    const out = borrowingCheck(target, energy, request);
    const limit = 0.02 * target * energy;
    expect(out.limit_gCO2e).toBeCloseTo(limit, 5);
    expect(out.approvedACS_gCO2e).toBeCloseTo(limit, 5);
    expect(out.aggravatedACS_gCO2e).toBeCloseTo(limit * 1.1, 5);
  });
});
