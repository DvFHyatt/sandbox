'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { authErrorMessage } from '@/lib/auth-errors';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash);
    const code = query.get('error_code') ?? query.get('error') ?? hash.get('error_code') ?? hash.get('error');
    const description = query.get('error_description') ?? hash.get('error_description') ?? undefined;
    if (code) setError(authErrorMessage(code, description));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push('/home');
  }

  return (
    <section className="card grid">
      <h2>Sign in</h2>
      <form onSubmit={handleSubmit} className="grid">
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="primary" type="submit">Login</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <a href="/forgot-password">Forgot password?</a>
    </section>
  );
}
