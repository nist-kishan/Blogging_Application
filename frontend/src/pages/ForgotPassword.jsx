import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../validations/authSchema';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/Loader';
import { Mail, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (response) => {
      setSuccessMsg(response.message || 'If that email exists, we have sent instructions to reset your password.');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Request failed. Please check your inputs.');
    },
  });

  const onSubmit = (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    forgotMutation.mutate(data);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="glass max-w-md w-full p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

        <div className="text-center mb-8 relative">
          <div className="w-12 h-12 bg-primary-500/15 border border-primary-500/30 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Forgot Password?</h2>
          <p className="text-slate-400 text-sm mt-2">Enter your email and we'll send you a password reset link.</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="space-y-6 text-center animate-in fade-in duration-300 relative">
            <div className="flex flex-col items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-xl text-xs">
              <CheckCircle className="w-8 h-8 mb-2 text-emerald-400" />
              <span className="font-semibold text-sm">Reset Link Sent</span>
              <span>{successMsg}</span>
            </div>
            <Link
              to="/login"
              className="inline-block w-full py-3 px-6 rounded-xl font-medium bg-primary-600 hover:bg-primary-500 text-sm text-white transition shadow-lg shadow-primary-500/25"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <Mail className="w-4.5 h-4.5 text-slate-500 absolute left-3 top-3.5" />
              </div>
              {errors.email && <span className="text-[11px] text-red-400">{errors.email.message}</span>}
            </div>

            <button
              type="submit"
              disabled={forgotMutation.isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-medium bg-primary-600 hover:bg-primary-500 active:scale-[0.98] transition shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 text-sm text-white mt-6"
            >
              {forgotMutation.isLoading ? <Spinner size="sm" /> : null}
              <span>Send Reset Link</span>
            </button>
          </form>
        )}

        {!successMsg && (
          <p className="text-center text-xs text-slate-500 mt-8 relative">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-400 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
