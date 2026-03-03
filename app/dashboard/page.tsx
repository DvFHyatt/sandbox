'use client';
import { useState } from 'react';

export default function DashboardPage() {
  const now = new Date();
  const [from, setFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(now.toISOString().slice(0, 10));
  return <section className="grid">
    <div className="card grid">
      <h2>Dashboard</h2>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <label>From<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>To<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
      </div>
      <p>Drill-down path: Property → Operational Division → Job Title → Colleague</p>
    </div>
    <div className="card">
      <p>% compliant colleagues</p>
      <div className="kpi">--</div>
      <p>OJT day coverage vs expected</p>
      <div className="kpi">--</div>
    </div>
  </section>;
}
