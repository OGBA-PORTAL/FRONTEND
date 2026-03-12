'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../assets/ralogo.png';
import background from '../assets/background.png';

const loginSchema = z.object({
  raNumber: z.string().min(1, 'RA Number is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login } = useAuth();
  const toast = useToast();

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
      const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setApiError(msg);
      toast.error('Login Failed', msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">

      {/* LEFT COLUMN: Hero Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-blue-950">

        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: `url("${background.src}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 to-transparent" />
        </div>

        {/* Decorative Blobs */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-yellow-400/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Content Top */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/20 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Website
          </Link>
        </div>

        {/* Content Bottom */}
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 mb-8 shadow-2xl">
              <ShieldCheck className="w-8 h-8 text-yellow-400" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-6">
              Access the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                Royal Ambassadors
              </span> <br />
              Member Portal
            </h1>
            <p className="text-blue-200/80 text-lg leading-relaxed font-light">
              Manage your examinations, track your leadership training progress, and stay connected with the nationwide community.
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 md:p-24 relative bg-slate-100">

        {/* Mobile Back Button */}
        <div className="absolute top-6 left-6 lg:hidden z-20">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-slate-700 text-sm font-semibold border border-slate-200 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile Logo (only visible on small screens) */}
          <div className="flex justify-center mb-10 lg:hidden">
            <div className="w-20 h-20 relative rounded-full overflow-hidden shadow-xl border-4 border-white">
              <Image src={logo} alt="RA Logo" fill className="object-cover" />
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please enter your credentials to continue.</p>
          </div>

          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-start gap-3">
                  <div className="mt-0.5">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p>{apiError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="space-y-2 relative group">
              <label htmlFor="raNumber" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                RA Number
              </label>
              <input
                id="raNumber"
                type="text"
                {...register('raNumber')}
                placeholder="RA/OGBA/GBC/2026/0001"
                className={`w-full h-14 px-5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border rounded-2xl outline-none transition-all duration-300 text-slate-900 font-medium placeholder:font-normal placeholder-slate-400 ${errors.raNumber ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
              />
              {errors.raNumber && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-5 left-1 text-xs text-red-500 font-medium">
                  {errors.raNumber.message}
                </motion.p>
              )}
            </div>

            <div className="space-y-2 relative group pt-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter your password"
                  className={`w-full h-14 pl-5 pr-14 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border rounded-2xl outline-none transition-all duration-300 text-slate-900 font-medium placeholder:font-normal placeholder-slate-400 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-5 left-1 text-xs text-red-500 font-medium">
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-blue-950 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgb(30,58,138,0.2)] hover:shadow-[0_8px_25px_rgb(30,58,138,0.3)] hover:bg-blue-900 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none overflow-hidden relative"
              >
                {/* Subtle shine effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span className="relative z-10 flex items-center gap-2">
                    Secure Sign In
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center lg:text-left">
            <p className="text-slate-500 text-sm font-medium">
              Not registered yet?{' '}
              <Link href="/#contact" className="text-blue-600 font-bold hover:text-blue-700 hover:underline underline-offset-4 transition-all">
                Contact Church Admin
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shine {
          100% {
            left: 200%;
          }
        }
        .animate-shine {
          animation: shine 1.5s;
        }
      `}} />
    </div>
  );
}