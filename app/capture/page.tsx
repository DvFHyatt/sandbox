'use client';

import { useEffect, useMemo, useState } from 'react';
import { queueCapture, listPending } from '@/lib/offline-queue';
import { syncPending } from '@/lib/sync';
import { getSupabase } from '@/lib/supabase';

type Property = { id: string; code: string; name: string };
type TrainingType = { id: string; code: string; name: string };
type Department = { name: string };
type Colleague = {
  gid: string;
  surname: string | null;
  name: string | null;
  property_code: string | null;
  department: string | null;
  active_flag: string | null;
};

export default function CapturePage() {
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(0);
  const [saved, setSaved] = useState('');

  const [properties, setProperties] = useState<Property[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [colleagues, setColleagues] = useState<Colleague[]>([]);

  const [form, setForm] = useState({
    property_id: '',
    property_code: '',
    department: '',
    training_type_id: '',
    training_date: '',
    start_time: '',
    end_time: '',
    title: '',
    description: '',
    facilitator_gid: '',
    facilitator_name: ''
  });

  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  const filteredColleagues = useMemo(
    () =>
      colleagues.filter(
        (c) =>
          c.active_flag === 'Y' &&
          c.property_code === form.property_code &&
          c.department === form.department
      ),
    [colleagues, form.property_code, form.department]
  );

  const uniqueAttendeesForSync = useMemo(() => {
    const s = new Set(selectedAttendees);
    if (form.facilitator_gid?.trim()) s.add(form.facilitator_gid.trim());
    return Array.from(s);
  }, [selectedAttendees, form.facilitator_gid]);

  const duration = useMemo(() => {
    if (!form.start_time || !form.end_time) return '00:00';
    const s = new Date(`1970-01-01T${form.start_time}:00`);
    const e = new Date(`1970-01-01T${form.end_time}:00`);
    if (e <= s) return 'INVALID';
    const mins = Math.round((e.getTime() - s.getTime()) / 60000);
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  }, [form.start_time, form.end_time]);

  useEffect(() => {
    (async () => {
      const sb = getSupabase();

      const [p, d, t, c, pendingRows] = await Promise.all([
        sb.from('properties').select('id,code,name').order('code'),
        sb.from('departments').select('name').order('name'),
        sb.from('training_types').select('id,code,name,deleted_at').is('deleted_at', null).order('code'),
        sb.from('colleagues').select('gid,surname,name,property_code,department,active_flag'),
        listPending()
      ]);

      const props = (p.data || []) as Property[];
      const deps = (d.data || []) as Department[];
      const types = (t.data || []) as TrainingType[];
      const cols = (c.data || []) as Colleague[];

      setProperties(props);
      setDepartments(deps);
      setTrainingTypes(types);
      setColleagues(cols);
      setPending(pendingRows.length);

      const defaultProperty = props[0];
      const defaultType = types.find((x) => x.code === 'OJT') || types[0];

      setForm((prev) => ({
        ...prev,
        property_id: prev.property_id || defaultProperty?.id || '',
        property_code: prev.property_code || defaultProperty?.code || '',
        department: prev.department || deps[0]?.name || '',
        training_type_id: prev.training_type_id || defaultType?.id || ''
      }));
    })();
  }, []);

  function toggleAttendee(gid: string) {
    setSelectedAttendees((prev) =>
      prev.includes(gid) ? prev.filter((x) => x !== gid) : [...prev, gid]
    );
  }

  async function save() {
    setSaved('');
    if (duration === 'INVALID') return setSaved('Start time must be before end time.');
    if (!form.property_id || !form.department || !form.training_type_id || !form.title || !form.training_date) {
      return setSaved('Please complete required fields.');
    }
    if (uniqueAttendeesForSync.length === 0) {
      return setSaved('Please select at least one attendee.');
    }

    const payload: any = {
      id: crypto.randomUUID(),
      property_id: form.property_id,
      division_id: '', // intentionally blank (department-only)
      department: form.department,
      training_type_id: form.training_type_id,
      title: form.title,
      description: form.description,
      facilitator_gid: form.facilitator_gid,
      facilitator_name: form.facilitator_name,
      training_date: form.training_date,
      start_time: form.start_time,
      end_time: form.end_time,
      attendees: uniqueAttendeesForSync,
      client_updated_at: new Date().toISOString()
    };

    await queueCapture(payload);
    const count = await listPending();
    setPending(count.length);
    setSaved('Saved offline');
  }

  return (
    <section className='card grid'>
      <h2>Capture Training</h2>
      <p>Step {step} of 4 · Pending sync: {pending}</p>

      {step === 1 && (
        <div className='grid'>
          <label>
            Property Code
            <select
              value={form.property_id}
              onChange={(e) => {
                const p = properties.find((x) => x.id === e.target.value);
                setForm({ ...form, property_id: e.target.value, property_code: p?.code || '' });
                setSelectedAttendees([]);
              }}
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code}
                </option>
              ))}
            </select>
          </label>

          <label>
            Department
            <select
              value={form.department}
              onChange={(e) => {
                setForm({ ...form, department: e.target.value });
                setSelectedAttendees([]);
              }}
            >
              {departments.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className='grid'>
          <label>
            Training Type
            <select
              value={form.training_type_id}
              onChange={(e) => setForm({ ...form, training_type_id: e.target.value })}
            >
              {trainingTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code} — {t.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Training Title
            <input maxLength={90} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>

          <label>
            Training Description
            <textarea maxLength={256} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
        </div>
      )}

      {step === 3 && (
        <div className='grid'>
          <label>Training Date<input type='date' value={form.training_date} onChange={(e) => setForm({ ...form, training_date: e.target.value })} /></label>
          <label>Start Time<input type='time' value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></label>
          <label>End Time<input type='time' value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></label>
          <p>Duration (HH:MM): {duration === 'INVALID' ? 'Invalid' : duration}</p>
        </div>
      )}

      {step === 4 && (
        <div className='grid'>
          <label>Facilitator/Trainer<input value={form.facilitator_name} onChange={(e) => setForm({ ...form, facilitator_name: e.target.value })} /></label>
          <label>Facilitator GID (optional)<input value={form.facilitator_gid} onChange={(e) => setForm({ ...form, facilitator_gid: e.target.value })} /></label>

          <label>Attendees (select all that attended)</label>
          <div className='card' style={{ maxHeight: 220, overflow: 'auto', padding: 8 }}>
            {filteredColleagues.length === 0 ? (
              <p>No active colleagues for selected property + department.</p>
            ) : (
              filteredColleagues.map((c) => {
                const display = `${c.surname || ''}, ${c.name || ''}`.trim().replace(/^,/, '') || c.gid;
                return (
                  <label key={c.gid} style={{ display: 'block', marginBottom: 6 }}>
                    <input
                      type='checkbox'
                      checked={selectedAttendees.includes(c.gid)}
                      onChange={() => toggleAttendee(c.gid)}
                    />{' '}
                    {display} ({c.gid})
                  </label>
                );
              })
            )}
          </div>

          <p>Unique attendees to sync: {uniqueAttendeesForSync.length}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</button>
        {step < 4 ? (
          <button className='primary' onClick={() => setStep((s) => s + 1)}>Next</button>
        ) : (
          <button className='primary' onClick={save}>Save</button>
        )}
        <button
          onClick={async () => {
            await syncPending();
            const count = await listPending();
            setPending(count.length);
            setSaved('Synced');
          }}
        >
          Sync now
        </button>
      </div>
      {saved && <p>{saved}</p>}
    </section>
  );
}

