import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../validations/authSchema';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Spinner } from '../components/Loader';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      dispatch(loginSuccess(response.data));
      navigate(from, { replace: true });
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check your credentials.');
    },
  });

  const onSubmit = (data) => {
    setErrorMsg('');
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="glass max-w-md w-full p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>

        <div className="text-center mb-8 relative">
          <h2 className="text-3xl font-extrabold text-glow text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-2">Log in to manage your posts and participate in the community</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-6 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
          {/* Email / Username field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Username or Email</label>
            <div className="relative">
              <input
                type="text"
                placeholder="you@example.com"
                {...register('usernameOrEmail')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <Mail className="w-4.5 h-4.5 text-slate-500 absolute left-3 top-3.5" />
            </div>
            {errors.usernameOrEmail && (
              <span className="text-[11px] text-red-400">{errors.usernameOrEmail.message}</span>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <Lock className="w-4.5 h-4.5 text-slate-500 absolute left-3 top-3.5" />
            </div>
            {errors.password && (
              <span className="text-[11px] text-red-400">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3.5 px-6 rounded-xl font-medium bg-primary-600 hover:bg-primary-500 active:scale-[0.98] transition shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 text-sm text-white mt-6"
          >
            {loginMutation.isPending ? <Spinner size="sm" /> : <LogIn className="w-4 h-4" />}
            <span>Sign In</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-8 relative">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
