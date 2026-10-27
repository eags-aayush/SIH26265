'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { Building2, CheckCircle2, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Completing Google authentication...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabase();
        if (!supabase) {
          // If supabase not configured, just redirect to home
          router.replace('/');
          return;
        }

        // Supabase browser client will automatically extract the access_token
        // from the window.location.hash and set the session in localStorage.
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback session error:', error);
          setErrorMsg(error.message);
          return;
        }

        if (data.session) {
          setStatus('Authentication successful! Loading your dashboard...');
          setTimeout(() => {
            router.replace('/');
          }, 800);
        } else {
          // Check onAuthStateChange for hash parsing event
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              setStatus('Authentication successful! Loading your dashboard...');
              authListener.subscription.unsubscribe();
              setTimeout(() => {
                router.replace('/');
              }, 800);
            }
          });

          // Fallback timeout
          setTimeout(() => {
            router.replace('/');
          }, 2000);
        }
      } catch (err: any) {
        console.error('Unexpected auth callback error:', err);
        router.replace('/');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20 text-white">
          <Building2 className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">AICTE Security Deposit Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Single Sign-On (Google &amp; Supabase)</p>
        </div>

        {errorMsg ? (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
            <div className="mt-3">
              <button
                onClick={() => router.replace('/')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Return to Portal
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
            <span className="text-xs text-slate-300 font-medium">{status}</span>
          </div>
        )}
      </div>
    </div>
  );
}
