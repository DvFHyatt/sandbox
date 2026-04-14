'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { queueCapture, listPending } from '@/lib/offline-queue';
import { syncPending, type SyncFailure } from '@/lib/sync';
import { getSupabase } from '@/lib/supabase';
import { getDurationMinutes, isFutureDate, isOlderThanDays, MIN_CAPTURE_DURATION_MINUTES } from '@/lib/capture-validation';

type Property = { id: string; code: string; name: string };
type TrainingType = { id: string; code: string; name: string };
type Colleague = {
  id: string;
  surname: string | null;
  name: string | null;
  property_code: string | null;
  department: string | null;
  active_flag: string | null;
  role: string | null;
};

const MAX_CAPTURE_COLLEAGUES = 500;
const COLLEAGUE_PAGE_SIZE = 250;

async function fetchColleaguesForCapture(sb: ReturnType<typeof getSupabase>) {
  const allRows: Colleague[] = [];
  let from = 0;

  while (allRows.length < MAX_CAPTURE_COLLEAGUES) {
    const to = Math.min(from + COLLEAGUE_PAGE_SIZE - 1, MAX_CAPTURE_COLLEAGUES - 1);
    const { data, error } = await sb
      .from('colleagues')
      .select('id,surname,name,property_code,department,active_flag,role')
      .range(from, to);

    if (error) throw error;
    const pageRows = (data || []) as Colleague[];
    allRows.push(...pageRows);

    if (pageRows.length < COLLEAGUE_PAGE_SIZE) break;
    from += COLLEAGUE_PAGE_SIZE;
  }

  return allRows;
}

export default function CapturePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(0);
  const [saved, setSaved] = useState('');
  const [syncFailures, setSyncFailures] = useState<SyncFailure[]>([]);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [completionState, setCompletionState] = useState<'saved' | 'synced' | null>(null);

  const [properties, setProperties] = useState<Property[]>([]);
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
    facilitator_name: ''
  });

  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<'SU' | 'HR' | 'GM' | 'C' | ''>('');
  const [currentPropertyCode, setCurrentPropertyCode] = useState('');

  function navigateTo(path: '/home' | '/dashboard' | '/reports') {
    router.push(path);
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.location.pathname !== path) {
        window.location.assign(path);
      }
    }, 250);
  }

  const filteredColleagues = useMemo(
    () =>
      colleagues
        .filter(
          (c) =>
            c.active_flag === 'Y' &&
            c.property_code === form.property_code &&
            c.department === form.department
        )
        .sort((a, b) => {
          const surnameCompare = (a.surname || '').localeCompare(b.surname || '');
          if (surnameCompare !== 0) return surnameCompare;
          return (a.name || '').localeCompare(b.name || '');
        }),
    [colleagues, form.property_code, form.department]
  );

  const uniqueAttendeesForSync = useMemo(() => {
    const s = new Set(selectedAttendees);
    return Array.from(s);
  }, [selectedAttendees]);

  const departmentOptions = useMemo(
    () =>
      Array.from(
        new Set(
          colleagues
            .filter((c) => c.property_code === form.property_code && c.active_flag === 'Y')
            .map((c) => c.department)
            .filter((x): x is string => !!x)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [colleagues, form.property_code]
  );

  const duration = useMemo(() => {
    if (!form.start_time || !form.end_time) return '00:00';
    const mins = getDurationMinutes(form.start_time, form.end_time);
    if (mins === null) return 'INVALID';
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  }, [form.start_time, form.end_time]);

  useEffect(() => {
    (async () => {
      const sb = getSupabase();

      const [p, t, c, pendingRows] = await Promise.all([
        sb.from('properties').select('id,code,name').order('code'),
        sb.from('training_types').select('id,code,name,deleted_at').is('deleted_at', null),
        fetchColleaguesForCapture(sb),
        listPending()
      ]);

      const props = (p.data || []) as Property[];
      const types = (t.data || []) as TrainingType[];
      const cols = c as Colleague[];

      setProperties(props);
      setTrainingTypes(types);
      setColleagues(cols);
      setPending(pendingRows.length);

      const defaultProperty = props[0];
      const sortedTypes = [...types].sort((a, b) => {
        if (a.code === 'OJT') return -1;
        if (b.code === 'OJT') return 1;
        return a.name.localeCompare(b.name);
      });
      setTrainingTypes(sortedTypes);
      const defaultType = sortedTypes.find((x) => x.code === 'OJT') || sortedTypes[0];
      let scopedRole: 'SU' | 'HR' | 'GM' | 'C' | '' = '';
      let scopedPropertyCode = '';

      const authResponse = await sb.auth.getUser();
      const userId = authResponse.data.user?.id;
      if (userId) {
        const { data: profile } = await sb
          .from('user_profiles')
          .select('colleague_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (profile?.colleague_id) {
          const { data: colleague } = await sb
            .from('colleagues')
            .select('role,property_code')
            .eq('id', profile.colleague_id)
            .maybeSingle();
          scopedRole = (colleague?.role || '') as 'SU' | 'HR' | 'GM' | 'C' | '';
          scopedPropertyCode = colleague?.property_code || '';
          setCurrentRole(scopedRole);
          setCurrentPropertyCode(scopedPropertyCode);
        }
      }

      const propertyForScope =
        scopedRole && scopedRole !== 'SU'
          ? props.find((prop) => prop.code === scopedPropertyCode)
          : undefined;

      setForm((prev) => ({
        ...prev,
        property_id: prev.property_id || propertyForScope?.id || defaultProperty?.id || '',
        property_code: prev.property_code || propertyForScope?.code || defaultProperty?.code || '',
        department: prev.department || '',
        training_type_id: prev.training_type_id || defaultType?.id || ''
      }));
    })();
  }, []);

  function toggleAttendee(colleagueId: string) {
    setShowConfirmSave(false);
    setCompletionState(null);
    setSelectedAttendees((prev) =>
      prev.includes(colleagueId) ? prev.filter((x) => x !== colleagueId) : [...prev, colleagueId]
    );
  }

  function selectAllDepartmentAttendees() {
    setShowConfirmSave(false);
    setCompletionState(null);
    const allIds = filteredColleagues.map((c) => c.id);
    setSelectedAttendees(allIds);
  }

  function clearAllDepartmentAttendees() {
    setShowConfirmSave(false);
    setCompletionState(null);
    setSelectedAttendees([]);
  }

  function getSaveValidationError() {
    setSaved('');
    setSyncFailures([]);
    if (duration === 'INVALID') return 'Start time must be before end time.';
    const durationMinutes = getDurationMinutes(form.start_time, form.end_time);
    if (durationMinutes !== null && durationMinutes < MIN_CAPTURE_DURATION_MINUTES) {
      return `Session duration must be at least ${MIN_CAPTURE_DURATION_MINUTES} minutes.`;
    }
    if (isFutureDate(form.training_date)) {
      return 'Training date cannot be in the future.';
    }
    if (currentRole === 'HR' && isOlderThanDays(form.training_date, 7)) {
      return 'HR users can only backdate capture within the last 7 calendar days.';
    }
    if (!form.property_id || !form.department || !form.training_type_id || !form.title || !form.training_date) {
      return 'Please complete required fields.';
    }
    if (uniqueAttendeesForSync.length === 0) {
      return 'Please select at least one attendee.';
    }
    return '';
  }

  async function save() {
    const validationError = getSaveValidationError();
    if (validationError) {
      setSaved(validationError);
      return;
    }

    const payload: any = {
      id: crypto.randomUUID(),
      property_id: form.property_id,
      department: form.department,
      training_type_id: form.training_type_id,
      title: form.title,
      description: form.description,
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
    setShowConfirmSave(false);
    setCompletionState('saved');
  }

  return (
    <section className='card grid'>
      <h2>Capture Training</h2>
      <p>Step {step} of 4 · Pending sync: {pending}</p>
      {(currentRole === 'GM' || currentRole === 'C') && <p>Your role has dashboard/report viewing access only and cannot capture training.</p>}

      {step === 1 && (
        <div className='grid'>
          <label>
            Property Code
            <select
              value={form.property_id}
              disabled={currentRole !== 'SU' && currentPropertyCode.length > 0}
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
              <option value=''>Select department</option>
              {departmentOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
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
          <label>Attendees (select all that attended)</label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <button type='button' onClick={selectAllDepartmentAttendees} disabled={filteredColleagues.length === 0}>
              Select all in department
            </button>
            <button type='button' onClick={clearAllDepartmentAttendees} disabled={uniqueAttendeesForSync.length === 0}>
              Clear selection
            </button>
          </div>
          <div className='card' style={{ maxHeight: 220, overflow: 'auto', padding: 8 }}>
            {filteredColleagues.length === 0 ? (
              <p>No active colleagues for selected property + department.</p>
            ) : (
              filteredColleagues.map((c) => {
                const display = `${c.surname || ''}, ${c.name || ''}`.trim().replace(/^,/, '');
                return (
                  <label
                    key={c.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8,
                      minHeight: 36,
                      lineHeight: 1.25,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type='checkbox'
                      checked={selectedAttendees.includes(c.id)}
                      onChange={() => toggleAttendee(c.id)}
                      style={{
                        margin: 0,
                        width: 18,
                        height: 18,
                        alignSelf: 'center',
                        accentColor: '#2e3a2f'
                      }}
                    />
                    {display}
                  </label>
                );
              })
            )}
          </div>

          <p>Unique attendees to sync: {uniqueAttendeesForSync.length}</p>
          {!showConfirmSave ? (
            <button
              className='primary'
              onClick={() => {
                const validationError = getSaveValidationError();
                if (validationError) {
                  setSaved(validationError);
                  return;
                }
                setShowConfirmSave(true);
              }}
              disabled={currentRole === 'GM' || currentRole === 'C'}
            >
              Review before save
            </button>
          ) : (
            <div className='card'>
              <h3 style={{ marginTop: 0 }}>Confirm capture</h3>
              <p>Please review before committing this capture.</p>
              <ul style={{ marginTop: 0 }}>
                <li><strong>Property:</strong> {form.property_code || '—'}</li>
                <li><strong>Department:</strong> {form.department || '—'}</li>
                <li><strong>Training Type:</strong> {trainingTypes.find((t) => t.id === form.training_type_id)?.name || '—'}</li>
                <li><strong>Title:</strong> {form.title || '—'}</li>
                <li><strong>Date:</strong> {form.training_date || '—'}</li>
                <li><strong>Time:</strong> {form.start_time || '—'} to {form.end_time || '—'}</li>
                <li><strong>Attendee count:</strong> {uniqueAttendeesForSync.length}</li>
              </ul>
              <div style={{ maxHeight: 120, overflow: 'auto', marginBottom: 10 }}>
                <strong>Selected attendees:</strong>
                <ul style={{ marginTop: 6 }}>
                  {filteredColleagues
                    .filter((c) => uniqueAttendeesForSync.includes(c.id))
                    .map((c) => (
                      <li key={c.id}>{`${c.surname || ''}, ${c.name || ''}`.trim().replace(/^,/, '')}</li>
                    ))}
                </ul>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowConfirmSave(false)}>Edit selection</button>
                <button className='primary' onClick={save}>Confirm & Save</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</button>
        {step < 4 ? (
          <button className='primary' onClick={() => setStep((s) => s + 1)}>Next</button>
        ) : (
          <button className='primary' onClick={() => setShowConfirmSave((s) => !s)} disabled={currentRole === 'GM' || currentRole === 'C'}>
            {showConfirmSave ? 'Hide review' : 'Review before save'}
          </button>
        )}
        <button
          onClick={async () => {
            setSaved('');
            setSyncFailures([]);
            const result = await syncPending();
            const count = await listPending();
            setPending(count.length);
            if (result.failed > 0) {
              setSyncFailures(result.failures);
              const firstFailure = result.failures[0];
              const firstMessage = [
                firstFailure?.message,
                firstFailure?.details,
                firstFailure?.hint
              ].filter(Boolean).join(' | ');
              setSaved(`Sync completed with ${result.failed}/${result.attempted} failed: ${firstMessage || 'Unknown sync error'}`);
              return;
            }
            if (result.attempted === 0) {
              setSaved('Nothing to sync');
              return;
            }
            setSaved(`Synced ${result.synced} capture${result.synced === 1 ? '' : 's'}`);
            setCompletionState('synced');
          }}
        >
          Sync now
        </button>
        <button onClick={() => router.push('/home')}>Main menu</button>
        <button onClick={() => router.push('/dashboard')}>Dashboard</button>
        <button onClick={() => router.push('/reports')}>Reports</button>
      </div>
      {saved && <p>{saved}</p>}
      {syncFailures.length > 0 && (
        <div className='card' style={{ marginTop: 8 }}>
          <p><strong>Sync errors</strong></p>
          <ul>
            {syncFailures.map((failure) => (
              <li key={failure.id}>
                {failure.message}
                {failure.details ? ` | ${failure.details}` : ''}
                {failure.hint ? ` | ${failure.hint}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
      {completionState && (
        <div className='card' style={{ marginTop: 8 }}>
          <p style={{ marginTop: 0 }}>
            <strong>{completionState === 'synced' ? 'Capture synced successfully.' : 'Capture saved offline.'}</strong>
          </p>
          <p>What would you like to do next?</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                setCompletionState(null);
                setShowConfirmSave(false);
                setSaved('');
                setStep(1);
                setSelectedAttendees([]);
                setForm((prev) => ({
                  ...prev,
                  department: '',
                  training_date: '',
                  start_time: '',
                  end_time: '',
                  title: '',
                  description: '',
                  facilitator_name: ''
                }));
              }}
            >
              Capture another session
            </button>
            <button className='primary' onClick={() => navigateTo('/home')}>
              Return to main menu
            </button>
          </div>
        </div>
      )}
    </section>
  );
}