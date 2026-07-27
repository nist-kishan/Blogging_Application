import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { Spinner } from '../components/Loader';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const verifyMutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: () => {
      setStatus('success');
    },
    onError: (err) => {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Verification failed. The token may be expired or invalid.');
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus('error');
      setErrorMsg('No verification token provided.');
    }
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass max-w-md w-full p-8 rounded-2xl border border-slate-800 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

        {status === 'verifying' && (
          <div className="space-y-6 relative">
            <Spinner size="lg" className="mx-auto" />
            <h2 className="text-xl font-bold text-white">Verifying your Email...</h2>
            <p className="text-slate-400 text-sm">Please hold on while we confirm your verification link.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 relative animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white text-glow">Verification Successful!</h2>
            <p className="text-slate-400 text-sm">
              Your email address has been verified. You can now access your full account privileges.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 px-6 rounded-xl font-medium bg-primary-600 hover:bg-primary-500 text-sm text-white transition shadow-lg shadow-primary-500/25"
            >
              Sign In
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 relative animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <Link
              to="/register"
              className="inline-block w-full py-3 px-6 rounded-xl font-medium bg-slate-900 hover:bg-slate-800 text-sm text-slate-300 border border-slate-800 transition"
            >
              Back to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
