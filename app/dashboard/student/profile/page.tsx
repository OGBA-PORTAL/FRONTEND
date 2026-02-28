'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Shield, Mail, Phone, Lock, Loader2, CheckCircle, Eye, EyeOff, Award } from 'lucide-react';

const profileSchema = z.object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(6, 'Min 6 characters'),
    confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function StudentProfilePage() {
    const { user } = useAuth();
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors, isSubmitting: profileSubmitting } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            email: user?.email ?? '',
            phone: user?.phone ?? '',
        },
    });

    const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword, formState: { errors: passwordErrors, isSubmitting: passwordSubmitting } } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    const profileMutation = useMutation({
        mutationFn: (data: ProfileForm) => api.patch('/users/me', data),
        onSuccess: () => { setProfileSuccess(true); setProfileError(null); setTimeout(() => setProfileSuccess(false), 3000); },
        onError: (err: any) => setProfileError(err?.response?.data?.message ?? 'Update failed'),
    });

    const passwordMutation = useMutation({
        mutationFn: (data: PasswordForm) => api.patch('/users/me/password', data),
        onSuccess: () => { setPasswordSuccess(true); setPasswordError(null); resetPassword(); setTimeout(() => setPasswordSuccess(false), 3000); },
        onError: (err: any) => setPasswordError(err?.response?.data?.message ?? 'Password change failed'),
    });

    const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

    return (
        <ProtectedRoute allowedRoles={['RA']}>
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">My Profile</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Manage your account information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #0f2d7a, #3b82f6)' }}>
                        <div className="absolute -bottom-8 left-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold border-4 border-white dark:border-slate-900 shadow-lg transition-colors"
                                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                {initials}
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 pb-6 px-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{user?.firstName} {user?.lastName}</h2>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                <Shield className="w-3 h-3" />
                                Royal Ranger
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 text-sm font-mono">{user?.raNumber}</span>
                            {user?.ranks && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                    <Award className="w-3 h-3" />
                                    {user.ranks.name}
                                </span>
                            )}
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {user?.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    {user.email}
                                </div>
                            )}
                            {user?.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    {user.phone}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Profile */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Edit Profile</h3>
                    </div>

                    {profileError && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">{profileError}</div>}
                    {profileSuccess && (
                        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Profile updated successfully!
                        </div>
                    )}

                    <form onSubmit={handleProfile(d => profileMutation.mutate(d))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                                <input {...regProfile('firstName')}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                                {profileErrors.firstName && <p className="text-xs text-red-500 mt-1">{profileErrors.firstName.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                                <input {...regProfile('lastName')}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                                {profileErrors.lastName && <p className="text-xs text-red-500 mt-1">{profileErrors.lastName.message}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                            <input {...regProfile('email')} type="email"
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                            <input {...regProfile('phone')}
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                        </div>
                        <button type="submit" disabled={profileSubmitting || profileMutation.isPending}
                            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                            {(profileSubmitting || profileMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Change Password</h3>
                    </div>

                    {passwordError && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">{passwordError}</div>}
                    {passwordSuccess && (
                        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Password changed successfully!
                        </div>
                    )}

                    <form onSubmit={handlePassword(d => passwordMutation.mutate(d))} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                            <div className="relative">
                                <input {...regPassword('currentPassword')} type={showCurrent ? 'text' : 'password'}
                                    className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                            <div className="relative">
                                <input {...regPassword('newPassword')} type={showNew ? 'text' : 'password'}
                                    className="w-full px-3 py-2.5 pr-10 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                                <button type="button" onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                            <input {...regPassword('confirmPassword')} type="password"
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-colors" />
                            {passwordErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>}
                        </div>
                        <button type="submit" disabled={passwordSubmitting || passwordMutation.isPending}
                            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                            {(passwordSubmitting || passwordMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Change Password
                        </button>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
