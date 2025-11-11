
import React, { useState } from 'react'

const defaultReport = {
  shipIMO: '1234567',
  year: 2025,
  ghgieTarget_g_per_MJ: 91.16, // example placeholder
  windRewardFactor: 1.0,
  fuels: [
    { fuelType:'VLSFO', mass_tonnes: 1000, lcv_MJ_per_tonne: 41000, wtt_gCO2e_per_MJ: 15, ttw_gCO2e_per_MJ: 74, isRFNBO:false },
    { fuelType:'e-methanol', mass_tonnes: 100, lcv_MJ_per_tonne: 20000, wtt_gCO2e_per_MJ: 12.95, ttw_gCO2e_per_MJ: 71.85, isRFNBO:true }
  ],
  shorePowers: [{ connectionId: 'OPS-1', energy_MJ: 500000 }]
};

export default function App(){
  const [report, setReport] = useState<any>(defaultReport);
  const [result, setResult] = useState<any>(null);
  const [endpoint, setEndpoint] = useState<string>('http://localhost:8080');

  async function compute(){
    const res = await fetch(`${endpoint}/api/compute/cb`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(report)});
    const data = await res.json();
    setResult(data);
  }

  return (
    <div style={{fontFamily:'system-ui, Arial', padding:24, maxWidth:1000, margin:'0 auto'}}>
      <h1>FuelEU Maritime — Compliance Dashboard</h1>
      <p>Enter ship energy data and compute GHG intensity, compliance balance, and penalty.</p>
      <label>Server URL: <input value={endpoint} onChange={e=>setEndpoint(e.target.value)} style={{width:320}}/></label>

      <pre style={{background:'#f6f8fa', padding:12, borderRadius:8, maxHeight:280, overflow:'auto'}}>
        {JSON.stringify(report,null,2)}
      </pre>

      <button onClick={compute} style={{padding:'8px 14px'}}>Compute Compliance</button>

      {result && (
        <div style={{marginTop:20, padding:16, border:'1px solid #ddd', borderRadius:8}}>
          <h3>Result</h3>
          <ul>
            <li>GHGIE_actual (gCO2e/MJ): {result.ghgie_actual_g_per_MJ.toFixed(4)}</li>
            <li>Energy in Scope (MJ): {Math.round(result.energyInScope_MJ).toLocaleString()}</li>
            <li>Compliance Balance (gCO2e): {Math.round(result.complianceBalance_gCO2e).toLocaleString()}</li>
            <li>Penalty (EUR): {Math.round(result.penalty_EUR).toLocaleString()}</li>
          </ul>
          {result.notes?.length > 0 && (
            <details>
              <summary>Notes</summary>
              <ul>{result.notes.map((n:string,i:number)=>(<li key={i}>{n}</li>))}</ul>
            </details>
          )}
        </div>
      )}
      <p style={{marginTop:24, fontSize:12, color:'#666'}}>This demo uses simplified formulas aligned with FuelEU Annex I & IV. For verification, integrate with THETIS MRV workflows.</p>
    </div>
  )
}
