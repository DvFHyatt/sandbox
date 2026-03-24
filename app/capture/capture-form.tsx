'use client';

import { useMemo, useState } from 'react';

type PropertyOption = { propertyCode: string; propertyName: string };
type ColleagueOption = { id: string; surname: string; fullNames: string; propertyCode: string; department: string };
type TrainingTypeOption = { code: string; name: string };

type Props = {
  properties: PropertyOption[];
  colleagues: ColleagueOption[];
  trainingTypes: TrainingTypeOption[];
  isSu: boolean;
};

export function CaptureForm({ properties, colleagues, trainingTypes, isSu }: Props) {
  const [propertyCode, setPropertyCode] = useState(properties[0]?.propertyCode ?? '');
  const [department, setDepartment] = useState('');

  const departmentOptions = useMemo(() => {
    const unique = new Set(
      colleagues
        .filter((c) => c.propertyCode === propertyCode)
        .map((c) => c.department)
        .filter(Boolean)
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [colleagues, propertyCode]);

  const attendeeOptions = useMemo(
    () =>
      colleagues.filter((c) => c.propertyCode === propertyCode && c.department === department),
    [colleagues, propertyCode, department]
  );

  return (
    <form action='/api/capture' method='post' className='card space-y-2'>
      <h2 className='text-xl font-semibold'>Capture Training</h2>

      <label className='block text-sm font-medium'>
        Property
        {isSu ? (
          <select
            name='propertyCode'
            value={propertyCode}
            onChange={(e) => {
              setPropertyCode(e.target.value);
              setDepartment('');
            }}
            className='border p-2 rounded w-full mt-1'
            required
          >
            {properties.map((p) => (
              <option key={p.propertyCode} value={p.propertyCode}>
                {p.propertyCode} — {p.propertyName}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input type='hidden' name='propertyCode' value={propertyCode} />
            <input
              value={`${propertyCode} — ${properties[0]?.propertyName ?? propertyCode}`}
              className='border p-2 rounded w-full mt-1 bg-gray-50'
              disabled
            />
          </>
        )}
      </label>

      <label className='block text-sm font-medium'>
        Department
        <select
          name='department'
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className='border p-2 rounded w-full mt-1'
          required
        >
          <option value='' disabled>
            Select department
          </option>
          {departmentOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <input name='trainingDate' type='date' className='border p-2 rounded w-full' required />
      <div className='grid grid-cols-2 gap-2'>
        <input name='startTime' type='time' className='border p-2 rounded w-full' required />
        <input name='endTime' type='time' className='border p-2 rounded w-full' required />
      </div>

      <label className='block text-sm font-medium'>
        Training Type
        <select name='trainingTypeCode' className='border p-2 rounded w-full mt-1'>
          {trainingTypes.map((t) => (
            <option key={t.code} value={t.code}>
              {t.code} — {t.name}
            </option>
          ))}
        </select>
      </label>

      <input name='trainingTitle' maxLength={90} className='border p-2 rounded w-full' placeholder='Training title' required />
      <input name='trainingDescription' maxLength={256} className='border p-2 rounded w-full' placeholder='Description' required />
      <input name='facilitatorName' className='border p-2 rounded w-full' placeholder='Facilitator name' required />
      <input name='facilitatorGid' className='border p-2 rounded w-full' placeholder='Facilitator GID (optional)' />

      <div className='border rounded p-2'>
        <p className='text-sm font-medium mb-2'>Attendees</p>
        <div className='max-h-48 overflow-auto space-y-1'>
          {attendeeOptions.length === 0 ? (
            <p className='text-sm text-brand-muted'>Select property and department to load attendees.</p>
          ) : (
            attendeeOptions.map((c) => (
              <label key={c.id} className='block text-sm'>
                <input type='checkbox' name='attendeeIds' value={c.id} /> {c.surname}, {c.fullNames}
              </label>
            ))
          )}
        </div>
      </div>

      <button className='bg-brand-accent text-white rounded p-2'>Review & Confirm</button>
    </form>
  );
}
