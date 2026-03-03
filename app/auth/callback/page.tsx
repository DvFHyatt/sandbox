'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { authErrorMessage } from '@/lib/auth-errors';

function parseHash(hash: string) {
  return new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Finalizing sign-in…');

  useEffect(() => {
    async function handleAuth() {
      const params = parseHash(window.location.hash);
      const query = new URLSearchParams(window.location.search);

      const errorCode = params.get('error_code') ?? params.get('error') ?? query.get('error_code') ?? query.get('error') ?? undefined;
      const errorDescription = params.get('error_description') ?? query.get('error_description') ?? undefined;

      if (errorCode) {
        const text = authErrorMessage(errorCode, errorDescription);
        setMessage(text);
        router.replace(`/login?error_code=${encodeURIComponent(errorCode)}${errorDescription ? `&error_description=${encodeURIComponent(errorDescription)}` : ''}`);
        return;
      }

      const code = query.get('code');
      if (code) {
        const { error } = await getSupabase().auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
      }

      const { data } = await getSupabase().auth.getSession();
      if (data.session) {
        router.replace('/set-password');
        return;
      }

      setMessage('No active session found. Please request a new email link.');
      router.replace('/login?error_code=otp_expired');
    }

    void handleAuth();
  }, [router]);

  return <section className="card"><p>{message}</p></section>;
}
