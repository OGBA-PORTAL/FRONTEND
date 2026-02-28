'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, Church, Rank, UserRole } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Users, Plus, Search, Filter, MoreVertical,
    CheckCircle, XCircle, Loader2, X, UserPlus,
    Shield, BookOpen, Building2, ChevronRight, GraduationCap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Schema with conditional validation
const createUserSchema = z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    role: z.enum(['RA', 'CHURCH_ADMIN', 'ASSOCIATION_OFFICER', 'SYSTEM_ADMIN']),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    churchId: z.string().optional(),
    rankId: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.role === 'CHURCH_ADMIN' && !data.churchId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Church is required for Church Admin", path: ["churchId"] });
    }
    if (data.role === 'RA') {
        if (!data.rankId) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Rank is required for RA", path: ["rankId"] });
        }
    }
});

type CreateUserForm = z.infer<typeof createUserSchema>;

const roleColors: Record<string, string> = {
    RA: 'bg-blue-100 text-blue-700',
    CHURCH_ADMIN: 'bg-amber-100 text-amber-700',
    ASSOCIATION_OFFICER: 'bg-purple-100 text-purple-700',
    SYSTEM_ADMIN: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    PENDING_ACTIVATION: 'bg-yellow-100 text-yellow-700',
    SUSPENDED: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Queries
    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ['admin-users'],
        queryFn: async () => (await api.get('/users')).data.data.users,
    });

    const { data: churches = [] } = useQuery<Church[]>({
        queryKey: ['churches'],
        queryFn: async () => (await api.get('/churches')).data.data.churches,
        enabled: showCreate // Optimization
    });

    const { data: ranks = [] } = useQuery<Rank[]>({
        queryKey: ['ranks'],
        queryFn: async () => (await api.get('/ranks')).data.data.ranks,
        enabled: showCreate
    });

    // Determine allowed roles based on current user
    const allowedCreateRoles = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'SYSTEM_ADMIN') return ['ASSOCIATION_OFFICER', 'CHURCH_ADMIN', 'RA']; // Can create all, but UI emphasizes Admin
        if (currentUser.role === 'ASSOCIATION_OFFICER') return ['CHURCH_ADMIN', 'RA'];
        if (currentUser.role === 'CHURCH_ADMIN') return ['RA'];
        return [];
    }, [currentUser]);

    // Form
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateUserForm>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            role: 'RA', // Default, will change on open
        }
    });

    const selectedRole = watch('role');

    // Effect: Set default role when modal opens
    useEffect(() => {
        if (showCreate && allowedCreateRoles.length > 0) {
            // Default to the first allowed role, or specific logic
            // If SysAdmin/Assoc, maybe default to Church Admin? Or just the first one.
            // If ChurchAdmin, default to RA.
            // Let's default to the "most likely" action.
            if (currentUser?.role === 'CHURCH_ADMIN') setValue('role', 'RA');
            else if (currentUser?.role === 'SYSTEM_ADMIN') setValue('role', 'ASSOCIATION_OFFICER'); // or Church Admin
        }
    }, [showCreate, allowedCreateRoles, currentUser, setValue]);

    // Effect: Set default church if Church Admin
    useEffect(() => {
        if (currentUser?.role === 'CHURCH_ADMIN' && currentUser.churchId) {
            setValue('churchId', currentUser.churchId);
        }
    }, [currentUser, setValue, showCreate]);

    const createMutation = useMutation({
        mutationFn: (data: CreateUserForm) => api.post('/auth/register', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-users'] });
            setShowCreate(false);
            reset();
            setApiError(null);
        },
        onError: (err: any) => setApiError(err?.response?.data?.message ?? 'Failed to create user'),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            api.patch(`/users/${id}/status`, { status }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
    });

    const filtered = users.filter(u => {
        const matchSearch = search === '' ||
            `${u.firstName} ${u.lastName} ${u.raNumber}`.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === '' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const onSubmit = (data: CreateUserForm) => {
        // Validation logic for churchId
        if ((data.role === 'RA' || data.role === 'CHURCH_ADMIN') && !data.churchId && currentUser?.role !== 'CHURCH_ADMIN') {
            // System Admin creating RA/Church Admin must select church
            if (!data.churchId) {
                // Should be caught by Zod userRefine but double check
                return;
            }
        }
        createMutation.mutate(data);
    };

    return (
        <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ASSOCIATION_OFFICER', 'CHURCH_ADMIN']}>
            <div className="space-y-5 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Members</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">{users.length} registered members</p>
                    </div>
                    {(allowedCreateRoles.length > 0) && (
                        <button onClick={() => { setShowCreate(true); setApiError(null); reset(); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95 self-start sm:self-auto"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                            <UserPlus className="w-4 h-4" />
                            Register Member
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 shadow-sm transition-colors">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, RA number..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-slate-200 dark:placeholder-slate-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                            className="pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none cursor-pointer dark:text-slate-200 transition-all">
                            <option value="">All Roles</option>
                            <option value="RA">RA Member</option>
                            <option value="CHURCH_ADMIN">Church Admin</option>
                            <option value="ASSOCIATION_OFFICER">Assoc. Officer</option>
                            <option value="SYSTEM_ADMIN">System Admin</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">Loading members...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No members found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Member</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">RA Number</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Church</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3.5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {filtered.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.firstName} {user.lastName}</p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 sm:hidden">{user.raNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 hidden sm:table-cell">
                                                <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">{user.raNumber}</span>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">{user.churches?.name ?? '—'}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${roleColors[user.role] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                    {user.role === 'SYSTEM_ADMIN' ? 'Sys Admin' :
                                                        user.role === 'ASSOCIATION_OFFICER' ? 'Assoc. Officer' :
                                                            user.role === 'CHURCH_ADMIN' ? 'Church Admin' : 'RA Member'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[user.status] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                    {user.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {/* Only SysAdmin/Assoc can suspend/activate */}
                                                {(currentUser?.role === 'SYSTEM_ADMIN' || currentUser?.role === 'ASSOCIATION_OFFICER') && (
                                                    <div className="flex items-center gap-1 justify-end">
                                                        {user.status !== 'ACTIVE' ? (
                                                            <button onClick={() => statusMutation.mutate({ id: user.id, status: 'ACTIVE' })}
                                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                                                                Activate
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => statusMutation.mutate({ id: user.id, status: 'SUSPENDED' })}
                                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                                                Suspend
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 transition-colors">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                    <UserPlus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Register New User</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create a new account for the portal</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowCreate(false); reset(); }}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {apiError && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-sm mb-4 flex items-center gap-2">
                                        <XCircle className="w-4 h-4" />
                                        {apiError}
                                    </div>
                                )}

                                {/* Role Selection */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">1. Account Type</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {allowedCreateRoles.map(role => {
                                            const isActive = selectedRole === role;
                                            return (
                                                <label key={role} className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${isActive
                                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                    }`}>
                                                    <input type="radio" value={role} {...register('role')} className="sr-only" />
                                                    {role === 'RA' && <BookOpen className={`w-6 h-6 mb-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />}
                                                    {role === 'CHURCH_ADMIN' && <Building2 className={`w-6 h-6 mb-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />}
                                                    {role === 'ASSOCIATION_OFFICER' && <Shield className={`w-6 h-6 mb-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />}

                                                    <span className={`text-sm font-bold ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {role === 'RA' ? 'RA Member' : role === 'CHURCH_ADMIN' ? 'Church Admin' : 'Assoc. Officer'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1">
                                                        {role === 'RA' ? 'Student access' : role === 'CHURCH_ADMIN' ? 'Manages church members' : 'Manages entire zone'}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                {/* Personal & Contact Info */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">2. Personal Information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name <span className="text-red-500">*</span></label>
                                            <input {...register('firstName')} placeholder="e.g. Samuel"
                                                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-slate-200 transition-all" />
                                            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                                            <input {...register('lastName')} placeholder="e.g. Adebayo"
                                                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-slate-200 transition-all" />
                                            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Conditional Fields: Church & Rank */}
                                {(selectedRole === 'RA' || selectedRole === 'CHURCH_ADMIN') && (
                                    <>
                                        <div className="h-px bg-slate-100 dark:bg-slate-800" />
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-4">3. Assignment Details</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                {/* Church Field */}
                                                {(currentUser?.role !== 'CHURCH_ADMIN') && (
                                                    <div className={selectedRole === 'CHURCH_ADMIN' ? 'sm:col-span-2' : ''}>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                            Church Assignment <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                            <select {...register('churchId')}
                                                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-white transition-all cursor-pointer dark:text-slate-200">
                                                                <option value="">Select Church...</option>
                                                                {churches.map(c => (
                                                                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                                            </div>
                                                        </div>
                                                        {errors.churchId && <p className="text-xs text-red-500 mt-1">{errors.churchId.message}</p>}
                                                    </div>
                                                )}

                                                {/* Rank Field - Only for RA */}
                                                {selectedRole === 'RA' && (
                                                    <div className={currentUser?.role === 'CHURCH_ADMIN' ? 'sm:col-span-2' : ''}>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                            Previous Rank (Already Attained) <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                            <select {...register('rankId')}
                                                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none bg-white transition-all cursor-pointer dark:text-slate-200">
                                                                <option value="">Select your previous rank...</option>
                                                                {ranks.map(r => (
                                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                                            </div>
                                                        </div>
                                                        {errors.rankId && <p className="text-xs text-red-500 mt-1">{errors.rankId.message}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Initial Password <span className="text-red-500">*</span></label>
                                    <input {...register('password')} type="password" autoComplete="new-password" placeholder="Min. 6 characters"
                                        className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono dark:text-slate-200" />
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex gap-4">
                                    <button type="button" onClick={() => { setShowCreate(false); reset(); }}
                                        className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting || createMutation.isPending}
                                        className="flex-[2] py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60 shadow-lg shadow-blue-500/25"
                                        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                        {(isSubmitting || createMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                        Create Account
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
