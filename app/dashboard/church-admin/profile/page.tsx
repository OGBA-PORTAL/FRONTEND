'use client';
// Church Admin Profile — reuses the student profile logic but protected for CHURCH_ADMIN

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Shield, Lock, Loader2, Eye, EyeOff, Award } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const profileSchema = z.object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
});
const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(6, 'Minimum 6 characters'),
    confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});
type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ChurchAdminProfilePage() {
    const { user } = useAuth();
    const toast = useToast();
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { register: regP, handleSubmit: hsP, formState: { errors: errP, isSubmitting: isSubP } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' },
    });

    const { register: regPw, handleSubmit: hsPw, reset: resetPw, formState: { errors: errPw, isSubmitting: isSubPw } } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    const profileMutation = useMutation({
        mutationFn: (data: ProfileForm) => api.patch('/users/me', data),
        onSuccess: () => toast.success('Profile Updated', 'Your name has been updated.'),
        onError: (err: any) => toast.error('Update Failed', err?.response?.data?.message ?? 'Could not update profile.'),
    });

    const passwordMutation = useMutation({
        mutationFn: (data: PasswordForm) => api.patch('/users/me/password', data),
        onSuccess: () => { toast.success('Password Changed', 'Your password has been updated.'); resetPw(); },
        onError: (err: any) => toast.error('Password Change Failed', err?.response?.data?.message ?? 'Could not change password.'),
    });

    const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

    return (
        <ProtectedRoute allowedRoles={['CHURCH_ADMIN']}>
            <div className="space-y-5 max-w-2xl mx-auto">
                {/* Avatar Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        {initials}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">{user?.raNumber}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                                <Shield className="w-3 h-3" /> Church Admin
                            </span>
                            {user?.ranks && (
                                <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">
                                    <Award className="w-3 h-3" /> {user.ranks.name}
                                </span>
                            )}
                            {user?.churches && (
                                <span className="text-xs text-slate-400 dark:text-slate-500">⛪ {user.churches.name}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Update Name */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-2 mb-5">
                        <User className="w-5 h-5 text-blue-500" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Personal Information</h3>
                    </div>
                    <form onSubmit={hsP(d => profileMutation.mutate(d))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">First Name</label>
                                <input {...regP('firstName')} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 transition-colors" />
                                {errP.firstName && <p className="text-red-500 text-xs mt-1">{errP.firstName.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Last Name</label>
                                <input {...regP('lastName')} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 transition-colors" />
                                {errP.lastName && <p className="text-red-500 text-xs mt-1">{errP.lastName.message}</p>}
                            </div>
                        </div>
                        <button type="submit" disabled={isSubP || profileMutation.isPending}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                            {(isSubP || profileMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-2 mb-5">
                        <Lock className="w-5 h-5 text-blue-500" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Change Password</h3>
                    </div>
                    <form onSubmit={hsPw(d => passwordMutation.mutate(d))} className="space-y-4">
                        {([
                            { field: 'currentPassword' as const, label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(s => !s) },
                            { field: 'newPassword' as const, label: 'New Password', show: showNew, toggle: () => setShowNew(s => !s) },
                            { field: 'confirmPassword' as const, label: 'Confirm New Password', show: showConfirm, toggle: () => setShowConfirm(s => !s) },
                        ]).map(({ field, label, show, toggle }) => (
                            <div key={field}>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{label}</label>
                                <div className="relative">
                                    <input {...regPw(field)} type={show ? 'text' : 'password'}
                                        className="w-full px-3 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 transition-colors" />
                                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errPw[field] && <p className="text-red-500 text-xs mt-1">{errPw[field]?.message}</p>}
                            </div>
                        ))}
                        <button type="submit" disabled={isSubPw || passwordMutation.isPending}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                            {(isSubPw || passwordMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                            Change Password
                        </button>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
