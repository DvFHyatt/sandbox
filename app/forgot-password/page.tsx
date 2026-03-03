'use client';
import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  async function handleReset() {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo });
    setStatus(error ? error.message : 'Reset email sent. Open the newest link right away.');
  }

  return <section className="card grid">
    <h2>Reset password</h2>
    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
    <button className="primary" onClick={handleReset}>Send reset link</button>
    <p>{status}</p>
  </section>;
}
