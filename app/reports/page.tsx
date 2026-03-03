'use client';

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

type ReportKey = 'colleague' | 'property_summary' | 'property_detail' | 'group_summary' | 'leaderboard';

const reportDefinitions: { key: ReportKey; title: string; description: string }[] = [
  { key: 'colleague', title: 'Colleague', description: 'Date, duration, type, title, total duration, and OJT compliance for selected colleague.' },
  { key: 'property_summary', title: 'Property Summary', description: 'Division OJT compliance, non-OJT mix %, and top 10 colleagues by duration.' },
  { key: 'property_detail', title: 'Property Detail', description: 'Division compliance, type mix %, and colleagues per division with <90% OJT flags.' },
  { key: 'group_summary', title: 'Group Summary', description: 'Property comparison side-by-side by OJT % and non-OJT type mix.' },
  { key: 'leaderboard', title: 'Colleague Leaderboard', description: 'Top 10 colleagues across properties ranked by compliance and duration.' }
];

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const [selectedReport, setSelectedReport] = useState<ReportKey>('colleague');
  const [propertyCode, setPropertyCode] = useState('');
  const [division, setDivision] = useState('');
  const [colleague, setColleague] = useState('');
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(today);

  const exportRows = useMemo(() => ([{
    report: selectedReport,
    property_code: propertyCode,
    operational_division: division,
    colleague,
    start_date_inclusive: startDate,
    end_date_inclusive: endDate,
    generated_at_sast: new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })
  }]), [selectedReport, propertyCode, division, colleague, startDate, endDate]);

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `ldt-${selectedReport}-${startDate}-to-${endDate}.xlsx`);
  }

  function exportPdf() {
    const doc = new jsPDF();
    doc.text('Learning & Development Tracker', 14, 12);
    doc.text(`Report: ${selectedReport}`, 14, 22);
    doc.text(`Date range (inclusive): ${startDate} to ${endDate}`, 14, 30);
    doc.text(`Property: ${propertyCode || 'All'} | Division: ${division || 'All'} | Colleague: ${colleague || 'N/A'}`, 14, 38);
    doc.save(`ldt-${selectedReport}-${startDate}-to-${endDate}.pdf`);
  }

  return <section className="card grid">
    <h2>Reports</h2>
    <label>Date range start (inclusive)
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
    </label>
    <label>Date range end (inclusive)
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
    </label>
    <label>Property Code
      <input value={propertyCode} onChange={(e) => setPropertyCode(e.target.value.toUpperCase())} placeholder="e.g. JOHPJ" />
    </label>
    <label>Operational Division
      <input value={division} onChange={(e) => setDivision(e.target.value)} placeholder="e.g. Food and Beverage" />
    </label>
    <label>Colleague (for Colleague report)
      <input value={colleague} onChange={(e) => setColleague(e.target.value)} placeholder="Name or GID" />
    </label>

    <div className="grid">
      {reportDefinitions.map((r) => (
        <button key={r.key} onClick={() => setSelectedReport(r.key)} className={selectedReport === r.key ? 'primary' : ''}>
          <strong>{r.title}</strong><br />
          <span>{r.description}</span>
        </button>
      ))}
    </div>

    <p><strong>Selected report:</strong> {reportDefinitions.find((r) => r.key === selectedReport)?.title}</p>
    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={exportPdf}>Export PDF</button>
      <button onClick={exportExcel}>Export Excel</button>
    </div>
  </section>;
}
