'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Users, Plus, X, Loader2, UserCheck, UserX,
    Search, Award, CheckCircle, Clock
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Rank } from '@/lib/types';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name required'),
    lastName: z.string().min(2, 'Last name required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rankId: z.string().optional(),
});
type RegisterForm = z.infer<typeof registerSchema>;

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    SUSPENDED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    PENDING_ACTIVATION: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
};
const statusLabels: Record<string, string> = {
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    PENDING_ACTIVATION: 'Pending',
};

export default function ChurchMembersPage() {
    const qc = useQueryClient();
    const toast = useToast();
    const [showRegister, setShowRegister] = useState(false);
    const [search, setSearch] = useState('');

    const { data: members = [], isLoading } = useQuery<any[]>({
        queryKey: ['church-members'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data.data.users.filter((u: any) => u.role === 'RA');
        },
    });

    const { data: ranks = [] } = useQuery<Rank[]>({
        queryKey: ['ranks'],
        queryFn: async () => {
            const res = await api.get('/ranks');
            return res.data.data.ranks;
        },
    });

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const registerMutation = useMutation({
        mutationFn: (data: RegisterForm) => api.post('/auth/signup', { ...data, role: 'RA' }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['church-members'] });
            setShowRegister(false);
            reset();
            toast.success('Member Registered', `${vars.firstName} ${vars.lastName} has been added to your church.`);
        },
        onError: (err: any) => {
            toast.error('Registration Failed', err?.response?.data?.message ?? 'Could not register member.');
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            api.patch(`/users/${id}/status`, { status }),
        onSuccess: (_, { status }) => {
            qc.invalidateQueries({ queryKey: ['church-members'] });
            toast.success('Status Updated', `Member has been ${status === 'ACTIVE' ? 'activated' : 'suspended'}.`);
        },
        onError: (err: any) => toast.error('Update Failed', err?.response?.data?.message ?? 'Could not update status.'),
    });

    const filtered = members.filter(m =>
        search === '' ||
        `${m.firstName} ${m.lastName} ${m.raNumber}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['CHURCH_ADMIN']}>
            <div className="space-y-5 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Church Members</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">{members.length} members in your church</p>
                    </div>
                    <button onClick={() => setShowRegister(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95 self-start sm:self-auto"
                        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                        <Plus className="w-4 h-4" />
                        Register Member
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 transition-colors"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or RA number..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 placeholder-slate-400 transition-colors" />
                    </div>
                </div>

                {/* Members list */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-800 transition-colors"
                        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <Users className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {search ? 'No members match your search' : 'No members yet'}
                        </p>
                        {!search && (
                            <button onClick={() => setShowRegister(true)}
                                className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                                style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                Register First Member
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
                        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filtered.map(member => (
                                <div key={member.id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                        {member.firstName?.[0]}{member.lastName?.[0]}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                                            {member.firstName} {member.lastName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-xs text-slate-400 dark:text-slate-500">{member.raNumber}</span>
                                            {member.ranks && (
                                                <span className="flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                                    <Award className="w-3 h-3" />
                                                    {member.ranks.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${statusColors[member.status] ?? ''}`}>
                                        {member.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> :
                                            member.status === 'SUSPENDED' ? <UserX className="w-3 h-3" /> :
                                                <Clock className="w-3 h-3" />}
                                        {statusLabels[member.status]}
                                    </span>

                                    {/* Suspend / Activate */}
                                    {member.status === 'ACTIVE' ? (
                                        <button
                                            onClick={() => statusMutation.mutate({ id: member.id, status: 'SUSPENDED' })}
                                            disabled={statusMutation.isPending}
                                            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-60">
                                            Suspend
                                        </button>
                                    ) : member.status === 'SUSPENDED' ? (
                                        <button
                                            onClick={() => statusMutation.mutate({ id: member.id, status: 'ACTIVE' })}
                                            disabled={statusMutation.isPending}
                                            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-60">
                                            Activate
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => statusMutation.mutate({ id: member.id, status: 'ACTIVE' })}
                                            disabled={statusMutation.isPending}
                                            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors disabled:opacity-60">
                                            Approve
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Register Member Modal */}
            {showRegister && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800 transition-colors">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Register New Member</h2>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Will be added to your church</p>
                            </div>
                            <button onClick={() => { setShowRegister(false); reset(); }}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(d => registerMutation.mutate(d))} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">First Name *</label>
                                    <input {...register('firstName')}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 transition-colors" />
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Last Name *</label>
                                    <input {...register('lastName')}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 transition-colors" />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Rank</label>
                                <select {...register('rankId')}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 transition-colors">
                                    <option value="">— No rank yet —</option>
                                    {ranks.map((r: Rank) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Default Password *</label>
                                <input {...register('password')} type="password"
                                    placeholder="Member's initial password"
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:text-slate-200 transition-colors" />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowRegister(false); reset(); }}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting || registerMutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    {(isSubmitting || registerMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                    Register Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
