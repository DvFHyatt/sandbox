'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [confirmInactive, setConfirmInactive] = useState(false);
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [status, setStatus] = useState('');

  return <section className="card grid">
    <h2>Admin tools</h2>
    <p>Roles: N=None, P=Property, G=Global, GA=Global Admin, GM=Dashboard view only.</p>

    <h3>Add new colleague</h3>
    <label>GID<input placeholder="Unique GID" /></label>
    <label>First name<input /></label>
    <label>Surname<input /></label>
    <label>Property code<input placeholder="Required" /></label>
    <label>Operational Division<input placeholder="Required" /></label>
    <label>Job title<input placeholder="Required" /></label>
    <label>ID number<input /></label>
    <label>Passport number<input /></label>
    <label><input type="checkbox" checked={confirmAdd} onChange={(e) => setConfirmAdd(e.target.checked)} /> I confirm all required fields are completed and either ID or Passport is captured.</label>
    <button className="primary" disabled={!confirmAdd} onClick={() => setStatus('Colleague add submitted (validation on backend).')}>Add colleague</button>

    <hr />
    <h3>Mark colleague inactive for property</h3>
    <label>Colleague GID<input placeholder="Required" /></label>
    <label>Property code<input placeholder="Required" /></label>
    <label><input type="checkbox" checked={confirmInactive} onChange={(e) => setConfirmInactive(e.target.checked)} /> I confirm the termination/inactive form has been completed.</label>
    <button disabled={!confirmInactive} onClick={() => setStatus('Inactive update submitted (property-scoped permissions apply).')}>Set inactive</button>

    <hr />
    <h3>Add training type (GA only)</h3>
    <label>Training type name<input placeholder="e.g. Coaching Session" /></label>
    <button>Add training type</button>

    {status && <p>{status}</p>}
  </section>;
}
