'use client';

import { useEffect, useMemo, useState } from 'react';
import { queueCapture, listPending } from '@/lib/offline-queue';
import { syncPending } from '@/lib/sync';

export default function CapturePage() {
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(0);
  const [saved, setSaved] = useState('');
  const [form, setForm] = useState({
    property_id: '',
    division_id: '',
    training_type_id: 'OJT',
    training_date: '',
    start_time: '',
    end_time: '',
    title: '',
    description: '',
    facilitator_gid: '',
    facilitator_name: '',
    attendees: ''
  });

  const attendeeList = useMemo(() => {
    const unique = new Set(form.attendees.split(',').map((s) => s.trim()).filter(Boolean));
    if (form.facilitator_gid) unique.add(form.facilitator_gid.trim());
    return Array.from(unique);
  }, [form.attendees, form.facilitator_gid]);

  const duration = useMemo(() => {
    if (!form.start_time || !form.end_time) return '00:00';
    const s = new Date(`1970-01-01T${form.start_time}:00`);
    const e = new Date(`1970-01-01T${form.end_time}:00`);
    if (e <= s) return 'INVALID';
    const mins = Math.round((e.getTime() - s.getTime()) / 60000);
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  }, [form.start_time, form.end_time]);

  useEffect(() => { listPending().then((r) => setPending(r.length)); }, []);

  async function save() {
    if (duration === 'INVALID') return setSaved('Start time must be before end time.');
    if (!form.property_id || !form.division_id || !form.title || !form.training_date) return setSaved('Please complete required fields.');
    const payload = {
      id: crypto.randomUUID(),
      ...form,
      attendees: attendeeList,
      client_updated_at: new Date().toISOString()
    };
    await queueCapture(payload);
    const count = await listPending();
    setPending(count.length);
    setSaved('Saved offline');
  }

  return <section className="card grid">
    <h2>Capture Training</h2>
    <p>Step {step} of 4 · Pending sync: {pending}</p>

    {step === 1 && <div className="grid">
      <label>Property Code
        <input value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })} placeholder="Property from master list" />
      </label>
      <label>Operational Division
        <input value={form.division_id} onChange={e => setForm({ ...form, division_id: e.target.value })} placeholder="Division in selected property" />
      </label>
    </div>}

    {step === 2 && <div className="grid">
      <label>Training Type
        <input value={form.training_type_id} onChange={e => setForm({ ...form, training_type_id: e.target.value })} placeholder="Default OJT" />
      </label>
      <label>Training Title
        <input spellCheck maxLength={90} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      </label>
      <label>Training Description
        <textarea spellCheck maxLength={256} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </label>
    </div>}

    {step === 3 && <div className="grid">
      <label>Training Date<input type="date" value={form.training_date} onChange={e => setForm({ ...form, training_date: e.target.value })} /></label>
      <label>Start Time<input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} /></label>
      <label>End Time<input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} /></label>
      <p>Duration (HH:MM): {duration === 'INVALID' ? 'Invalid' : duration}</p>
    </div>}

    {step === 4 && <div className="grid">
      <label>Facilitator/Trainer<input value={form.facilitator_name} onChange={e => setForm({ ...form, facilitator_name: e.target.value })} /></label>
      <label>Facilitator GID (optional)<input value={form.facilitator_gid} onChange={e => setForm({ ...form, facilitator_gid: e.target.value })} /></label>
      <label>Colleague GIDs (comma-separated, Active only)
        <textarea value={form.attendees} onChange={e => setForm({ ...form, attendees: e.target.value })} placeholder="GID1, GID2, GID3" />
      </label>
      <p>Unique attendees to sync: {attendeeList.length}</p>
    </div>}

    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</button>
      {step < 4 ? <button className="primary" onClick={() => setStep((s) => s + 1)}>Next</button> : <button className="primary" onClick={save}>Save</button>}
      <button onClick={async () => { await syncPending(); const count = await listPending(); setPending(count.length); setSaved('Synced'); }}>Sync now</button>
    </div>
    {saved && <p>{saved}</p>}
  </section>;
}
