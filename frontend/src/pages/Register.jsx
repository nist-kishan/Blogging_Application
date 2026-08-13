import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../validations/authSchema';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/Loader';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      setSuccessMsg(response.message || 'Registration successful. A verification email has been sent!');
      reset();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  const onSubmit = (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="glass max-w-md w-full p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

        <div className="text-center mb-8 relative">
          <h2 className="text-3xl font-extrabold text-glow text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-sm mt-2">Sign up to get access to write blog posts and leave comments</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-6 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex flex-col items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-xl text-xs mb-6 text-center animate-in fade-in duration-200">
            <CheckCircle2 className="w-8 h-8 mb-2" />
            <span className="font-semibold text-sm">Account Created!</span>
            <span>{successMsg}</span>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('fullName')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <User className="w-4.5 h-4.5 text-slate-500 absolute left-3 top-3" />
              </div>
              {errors.fullName && <span className="text-[11px] text-red-400">{errors.fullName.message}</span>}
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Username</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="johndoe"
                  {...register('username')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <User className="w-4.5 h-4.5 text-slate-500 absolute left-3 top-3" />
              </div>
              {errors.username && <span className="text-[11px] text-red-400">{errors.username.message}</span>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <Mail className="w-4.5 h-4.5 text-slate-500 absolute left-3 top-3" />
              </div>
              {errors.email && <span className="text-[11px] text-red-400">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <Lock className="w-4.5 h-4.5 text-slate-500 absolute left-3 top-3" />
              </div>
              {errors.password && <span className="text-[11px] text-red-400">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3 px-6 rounded-xl font-medium bg-primary-600 hover:bg-primary-500 active:scale-[0.98] transition shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 text-sm text-white mt-6"
            >
              {registerMutation.isPending ? <Spinner size="sm" /> : <UserPlus className="w-4 h-4" />}
              <span>Register</span>
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 mt-8 relative">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
