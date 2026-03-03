'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('Set a password to complete your account setup.');
  const router = useRouter();

  useEffect(() => {
    async function ensureSession() {
      const { data } = await getSupabase().auth.getSession();
      if (!data.session) router.replace('/login?error_code=otp_expired');
    }
    void ensureSession();
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setStatus('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setStatus('Passwords do not match.');

    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) return setStatus(error.message);

    setStatus('Password set. Redirecting to home…');
    router.push('/home');
  }

  return (
    <section className="card grid">
      <h2>Set your password</h2>
      <form onSubmit={onSubmit} className="grid">
        <input
          placeholder="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          placeholder="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button className="primary" type="submit">Save password</button>
      </form>
      <p>{status}</p>
    </section>
  );
}
