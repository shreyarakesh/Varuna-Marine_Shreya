
import { FuelConsumed, ShorePowerUse, ShipEnergyReport, ComplianceResult } from '../../shared/types.js';

/**
 * Implements core FuelEU calculations aligned with Annex I & IV:
 *  - GHGIE_actual = f_wind * (WtT + TtW), where WtT and TtW are per-energy weighted sums
 *  - Compliance Balance = (GHGIE_target - GHGIE_actual) * (sum_i M_i * LCV_i + sum_k E_k)
 *  - Penalty = |ComplianceBalance| / GHGIE_actual * 41_000 * 2_400  [EUR]
 *
 * Notes:
 * - RFNBO reward: multiply WtW by 0.5 (RWD=2) when isRFNBO (per Annex I RFNBO reward factor)
 * - Energy in scope is simplified as sum(M_i * LCV_i) + sum(E_k).
 */
export function computeCompliance(report: ShipEnergyReport): ComplianceResult {
  const notes: string[] = [];
  const f_wind = report.windRewardFactor ?? 1.0;
  if (f_wind !== 1.0) notes.push(`Applied wind reward factor f_wind=${f_wind}`);

  // Sum energy from fuels (MJ)
  let energyFromFuels_MJ = 0;
  // Weighted WtW numerator (gCO2e)
  let wtwWeighted_g = 0;

  for (const f of report.fuels) {
    const energy_MJ = f.mass_tonnes * f.lcv_MJ_per_tonne;
    energyFromFuels_MJ += energy_MJ;

    const wtw_noReward = (f.wtt_gCO2e_per_MJ + f.ttw_gCO2e_per_MJ);
    const wtw = f.isRFNBO ? (wtw_noReward * 0.5) : wtw_noReward; // RWD=2 -> halves WtW
    wtwWeighted_g += wtw * energy_MJ;
    if (f.isRFNBO) notes.push(`RFNBO reward applied to ${f.fuelType}`);
  }

  const energyFromOPS_MJ = (report.shorePowers ?? []).reduce((s, e) => s + e.energy_MJ, 0);
  const energyInScope_MJ = energyFromFuels_MJ + energyFromOPS_MJ;

  const ghgie_actual = energyInScope_MJ > 0 ? f_wind * (wtwWeighted_g / energyInScope_MJ) : 0;

  const complianceBalance = (report.ghgieTarget_g_per_MJ - ghgie_actual) * energyInScope_MJ;

  // Penalty per Annex IV Part B (using constants 41,000 MJ/tfuel and 2,400 EUR/t)
  const penalty_EUR = ghgie_actual > 0 ? abs(complianceBalance) / ghgie_actual * 41000 * 2400 : 0;

  return {
    ghgie_actual_g_per_MJ: ghgie_actual,
    energyInScope_MJ,
    complianceBalance_gCO2e: complianceBalance,
    penalty_EUR,
    notes
  };
}

function abs(n:number){ return n < 0 ? -n : n; }

/**
 * Borrowing limit (ACS) = min(requested, 2% * GHGIE_target * EnergyInScope_MJ).
 * Returns aggravated ACS (1.1x) for carry-over deduction in Year N+1.
 */
export function borrowingCheck(ghgieTarget_g_per_MJ: number, energyInScope_MJ: number, requestedACS_gCO2e: number){
  const limit = 0.02 * ghgieTarget_g_per_MJ * energyInScope_MJ;
  const approvedACS = Math.min(Math.max(0, requestedACS_gCO2e), limit);
  const aggravated = 1.1 * approvedACS; // 10% aggravation
  return { limit_gCO2e: limit, approvedACS_gCO2e: approvedACS, aggravatedACS_gCO2e: aggravated };
}
