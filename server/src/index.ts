
import express from 'express';
import cors from 'cors';
import { computeCompliance, borrowingCheck } from './calc.js';
import { ShipEnergyReport, PoolRequest, BankRequest, BorrowRequest } from '../../shared/types.js';

const app = express();
app.use(cors());
app.use(express.json());

/** Health */
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Compute compliance for a given ship/year
app.post('/api/compute/cb', (req, res) => {
  const report = req.body as ShipEnergyReport;
  const result = computeCompliance(report);
  res.json(result);
});

// Borrowing check (Article 20) - simplified
app.post('/api/borrow', (req, res) => {
  const body = req.body as BorrowRequest;
  const out = borrowingCheck(body.ghgieTarget_g_per_MJ, body.energyInScope_MJ, body.requestedACS_gCO2e);
  res.json({
    ...out,
    note: "If ACS > 0, pooling is not allowed within the same verification period (join next year)."
  });
});

// Banking (Article 20) - placeholder
app.post('/api/bank', (req, res) => {
  const body = req.body as BankRequest;
  if (body.verifiedComplianceBalance_gCO2e <= 0) {
    return res.status(400).json({ error: "Banking not allowed unless Verified Compliance Balance is positive." });
  }
  res.json({ status: "banked", companyId: body.companyId, year: body.year, amount_gCO2e: body.verifiedComplianceBalance_gCO2e });
});

// Pooling (Article 21) - simplified allocator
app.post('/api/pool', (req, res) => {
  const body = req.body as PoolRequest;
  const total = body.ships.reduce((s,x)=> s + x.adjustedComplianceBalance_gCO2e, 0);
  const allNonPositive = body.ships.every(s => s.adjustedComplianceBalance_gCO2e <= 0);
  if (allNonPositive) return res.status(400).json({ error: "Pooling requires at least one ship with surplus." });
  res.json({ poolId: body.poolId, total_gCO2e: total, message: "After pooling, no ship can exit with a higher deficit than it entered." });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`FuelEU server running on :${port}`));
