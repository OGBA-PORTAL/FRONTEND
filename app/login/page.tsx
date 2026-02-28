'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import logo from '../assets/ralogo.png';

const loginSchema = z.object({
  raNumber: z.string().min(1, 'RA Number is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      await login(data.raNumber, data.password);
    } catch (err: any) {
      setApiError(err?.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full gradient-blue flex items-center justify-center p-4 animate-fade-in relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-300/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="glass-effect rounded-3xl shadow-2xl p-8 md:p-10 border border-white/30">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 gradient-gold rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300" />
              <div className="relative bg-white rounded-full p-2 shadow-lg">
                <Image src={logo} alt="Royal Ambassadors logo" width={100} height={100} className="rounded-full" priority />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-700" />
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Welcome Back</h1>
            </div>
            <p className="text-slate-500 text-sm">Sign in to your Royal Ambassadors portal</p>
          </div>

          {/* Error Banner */}
          {apiError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center animate-slide-down">
              {apiError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* RA Number */}
            <div>
              <label htmlFor="raNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
                RA Number
              </label>
              <input
                id="raNumber"
                type="text"
                {...register('raNumber')}
                placeholder="e.g. RA/OGBA/GBC/2026/0001"
                className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 text-slate-800 placeholder-slate-400 ${errors.raNumber ? 'border-red-400 bg-red-50' : 'border-blue-200 focus:border-blue-500'
                  }`}
              />
              {errors.raNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.raNumber.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 text-slate-800 placeholder-slate-400 pr-12 ${errors.password ? 'border-red-400 bg-red-50' : 'border-blue-200 focus:border-blue-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-gold text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-yellow-300/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              New member?{' '}
              <Link href="/auth" className="text-blue-700 hover:text-yellow-600 font-semibold transition-colors hover:underline">
                Contact your Church Admin
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/70 text-xs mt-6">
          © 2026 OGBA Royal Ambassadors. All rights reserved.
        </p>
      </div>
    </div>
  );
}